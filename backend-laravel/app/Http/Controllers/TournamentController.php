<?php

namespace App\Http\Controllers;

use App\Models\Tournament;
use App\Services\TournamentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Redis;

/**
 * Tournament API Controller
 *
 * Gère les opérations CRUD pour les tournois.
 * Publie des événements Redis pour communication avec NestJS.
 */
class TournamentController extends Controller
{
    public function __construct(
        private TournamentService $tournamentService
    ) {}

    /**
     * Liste tous les tournois
     *
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tournament::query()
            ->with(['organizer', 'teams'])
            ->where('deleted_at', null);

        // Filtres
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('game')) {
            $query->where('game', $request->game);
        }

        // Tri par date de début (les plus proches en premier)
        $tournaments = $query
            ->orderBy('start_date', 'asc')
            ->paginate(20);

        return response()->json($tournaments);
    }

    /**
     * Crée un nouveau tournoi
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'game' => 'required|string|max:100',
            'format' => 'required|in:single_elimination,double_elimination,round_robin,swiss',
            'team_size' => 'required|integer|min:1|max:10',
            'max_teams' => 'required|integer|min:2|max:128',
            'start_date' => 'required|date|after:now',
            'registration_end' => 'required|date|before:start_date',
            'entry_fee' => 'nullable|numeric|min:0',
            'prize_pool' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'rules' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        // Créer le tournoi
        $tournament = Tournament::create([
            ...$request->all(),
            'organizer_id' => auth()->id(),
            'slug' => \Str::slug($request->name . '-' . now()->format('Y')),
            'status' => 'draft',
        ]);

        // Publier événement Redis pour NestJS
        Redis::publish('tournament.created', json_encode([
            'tournament_id' => $tournament->id,
            'name' => $tournament->name,
            'game' => $tournament->game,
            'organizer_id' => $tournament->organizer_id,
            'timestamp' => now()->toIso8601String(),
        ]));

        return response()->json([
            'message' => 'Tournament created successfully',
            'tournament' => $tournament->load('organizer'),
        ], 201);
    }

    /**
     * Affiche les détails d'un tournoi
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $tournament = Tournament::with([
            'organizer',
            'teams.players.user',
            'teams.captain',
        ])->findOrFail($id);

        return response()->json($tournament);
    }

    /**
     * Inscription d'une équipe à un tournoi
     *
     * @param Request $request
     * @param int $tournamentId
     * @return JsonResponse
     */
    public function registerTeam(Request $request, int $tournamentId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'team_name' => 'required|string|max:255',
            'team_tag' => 'nullable|string|max:10',
            'players' => 'required|array|min:1',
            'players.*.ign' => 'required|string|max:100',
            'players.*.role' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        try {
            // Utiliser le service pour logique métier complexe
            $team = $this->tournamentService->registerTeam(
                $tournamentId,
                auth()->id(),
                $request->team_name,
                $request->team_tag,
                $request->players
            );

            // Publier événement Redis
            Redis::publish('team.registered', json_encode([
                'tournament_id' => $tournamentId,
                'team_id' => $team->id,
                'team_name' => $team->name,
                'captain_id' => auth()->id(),
                'timestamp' => now()->toIso8601String(),
            ]));

            return response()->json([
                'message' => 'Team registered successfully',
                'team' => $team->load('players.user'),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Génère le bracket du tournoi
     *
     * @param int $tournamentId
     * @return JsonResponse
     */
    public function generateBracket(int $tournamentId): JsonResponse
    {
        $tournament = Tournament::with('teams')->findOrFail($tournamentId);

        if ($tournament->status !== 'registration_closed') {
            return response()->json([
                'error' => 'Tournament must be in registration_closed status'
            ], 400);
        }

        try {
            // Dispatcher un job Laravel Queue (peut être long)
            \App\Jobs\GenerateTournamentBracket::dispatch($tournament);

            return response()->json([
                'message' => 'Bracket generation started',
                'tournament_id' => $tournamentId,
            ], 202);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Récupère le bracket généré
     *
     * @param int $tournamentId
     * @return JsonResponse
     */
    public function getBracket(int $tournamentId): JsonResponse
    {
        $tournament = Tournament::with([
            'matches.teamA',
            'matches.teamB',
            'matches.winner',
        ])->findOrFail($tournamentId);

        $matches = $tournament->matches()
            ->orderBy('round')
            ->orderBy('bracket_position')
            ->get();

        return response()->json([
            'tournament' => $tournament,
            'matches' => $matches,
        ]);
    }

    /**
     * Récupère le classement du tournoi
     *
     * @param int $tournamentId
     * @return JsonResponse
     */
    public function getLeaderboard(int $tournamentId): JsonResponse
    {
        // Utiliser la materialized view pour performance
        $leaderboard = \DB::table('mv_tournament_leaderboard')
            ->where('tournament_id', $tournamentId)
            ->orderBy('position')
            ->get();

        return response()->json([
            'tournament_id' => $tournamentId,
            'leaderboard' => $leaderboard,
            'updated_at' => now(),
        ]);
    }

    /**
     * Met à jour le statut du tournoi
     *
     * @param Request $request
     * @param int $tournamentId
     * @return JsonResponse
     */
    public function updateStatus(Request $request, int $tournamentId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:draft,registration_open,registration_closed,ongoing,finished,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid status',
                'messages' => $validator->errors()
            ], 422);
        }

        $tournament = Tournament::findOrFail($tournamentId);

        // Vérifier permissions (organizer ou admin)
        if ($tournament->organizer_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json([
                'error' => 'Unauthorized'
            ], 403);
        }

        $oldStatus = $tournament->status;
        $tournament->status = $request->status;
        $tournament->save();

        // Publier événement Redis
        Redis::publish('tournament.status_changed', json_encode([
            'tournament_id' => $tournament->id,
            'old_status' => $oldStatus,
            'new_status' => $tournament->status,
            'timestamp' => now()->toIso8601String(),
        ]));

        return response()->json([
            'message' => 'Tournament status updated',
            'tournament' => $tournament,
        ]);
    }
}
