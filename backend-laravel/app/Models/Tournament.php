<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Tournament Model
 *
 * @property int $id
 * @property string $uuid
 * @property string $name
 * @property string $slug
 * @property string $description
 * @property string $game
 * @property string $format (single_elimination, double_elimination, round_robin, swiss)
 * @property int $team_size
 * @property int $max_teams
 * @property int $current_teams
 * @property float $entry_fee
 * @property float $prize_pool
 * @property \Carbon\Carbon $start_date
 * @property \Carbon\Carbon $end_date
 * @property \Carbon\Carbon $registration_start
 * @property \Carbon\Carbon $registration_end
 * @property string $status (draft, registration_open, registration_closed, ongoing, finished, cancelled)
 * @property int $organizer_id
 * @property string $rules
 * @property string $discord_url
 * @property string $stream_url
 * @property string $banner_url
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Carbon\Carbon $deleted_at
 */
class Tournament extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     */
    protected $table = 'tournaments';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'game',
        'format',
        'team_size',
        'max_teams',
        'entry_fee',
        'prize_pool',
        'start_date',
        'end_date',
        'registration_start',
        'registration_end',
        'status',
        'organizer_id',
        'rules',
        'discord_url',
        'stream_url',
        'banner_url',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'registration_start' => 'datetime',
        'registration_end' => 'datetime',
        'entry_fee' => 'decimal:2',
        'prize_pool' => 'decimal:2',
        'team_size' => 'integer',
        'max_teams' => 'integer',
        'current_teams' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'deleted_at',
    ];

    /**
     * Validation formats
     */
    const FORMATS = [
        'single_elimination',
        'double_elimination',
        'round_robin',
        'swiss',
    ];

    /**
     * Validation statuses
     */
    const STATUSES = [
        'draft',
        'registration_open',
        'registration_closed',
        'ongoing',
        'finished',
        'cancelled',
    ];

    // ==============================================
    // Relationships
    // ==============================================

    /**
     * Get the organizer (user) of the tournament
     */
    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    /**
     * Get all teams registered for this tournament
     */
    public function teams(): HasMany
    {
        return $this->hasMany(Team::class);
    }

    /**
     * Get all matches in this tournament
     */
    public function matches(): HasMany
    {
        return $this->hasMany(Match::class);
    }

    /**
     * Get all standings for this tournament
     */
    public function standings(): HasMany
    {
        return $this->hasMany(Standing::class);
    }

    // ==============================================
    // Scopes
    // ==============================================

    /**
     * Scope to get only active tournaments
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['registration_open', 'ongoing']);
    }

    /**
     * Scope to get tournaments by game
     */
    public function scopeGame($query, string $game)
    {
        return $query->where('game', $game);
    }

    /**
     * Scope to get upcoming tournaments
     */
    public function scopeUpcoming($query)
    {
        return $query->where('start_date', '>', now())
            ->orderBy('start_date', 'asc');
    }

    /**
     * Scope to get ongoing tournaments
     */
    public function scopeOngoing($query)
    {
        return $query->where('status', 'ongoing');
    }

    // ==============================================
    // Accessors & Mutators
    // ==============================================

    /**
     * Get the tournament's full URL
     */
    public function getUrlAttribute(): string
    {
        return url("/tournaments/{$this->slug}");
    }

    /**
     * Check if tournament is full
     */
    public function getIsFullAttribute(): bool
    {
        return $this->current_teams >= $this->max_teams;
    }

    /**
     * Check if registration is open
     */
    public function getIsRegistrationOpenAttribute(): bool
    {
        return $this->status === 'registration_open'
            && now()->between($this->registration_start, $this->registration_end)
            && !$this->isFull;
    }

    /**
     * Get remaining slots
     */
    public function getRemainingSlots(): int
    {
        return max(0, $this->max_teams - $this->current_teams);
    }

    // ==============================================
    // Business Logic Methods
    // ==============================================

    /**
     * Check if user can register a team
     */
    public function canRegisterTeam(User $user): bool
    {
        // Check if registration is open
        if (!$this->isRegistrationOpen) {
            return false;
        }

        // Check if user already has a team registered
        $existingTeam = $this->teams()
            ->whereHas('players', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->exists();

        return !$existingTeam;
    }

    /**
     * Start the tournament
     */
    public function start(): void
    {
        $this->status = 'ongoing';
        $this->save();

        // Publish event to Redis
        \Redis::publish('tournament.started', json_encode([
            'tournament_id' => $this->id,
            'name' => $this->name,
            'timestamp' => now()->toIso8601String(),
        ]));
    }

    /**
     * Finish the tournament
     */
    public function finish(): void
    {
        $this->status = 'finished';
        $this->end_date = now();
        $this->save();

        // Publish event to Redis
        \Redis::publish('tournament.finished', json_encode([
            'tournament_id' => $this->id,
            'name' => $this->name,
            'timestamp' => now()->toIso8601String(),
        ]));
    }

    /**
     * Cancel the tournament
     */
    public function cancel(string $reason = null): void
    {
        $this->status = 'cancelled';
        $this->save();

        // Notify all teams
        // TODO: Send notifications
    }

    // ==============================================
    // Boot Method (Events)
    // ==============================================

    protected static function boot()
    {
        parent::boot();

        // Auto-generate UUID on creation
        static::creating(function ($tournament) {
            if (!$tournament->uuid) {
                $tournament->uuid = \Str::uuid();
            }
        });

        // Auto-generate slug if not provided
        static::creating(function ($tournament) {
            if (!$tournament->slug) {
                $tournament->slug = \Str::slug($tournament->name . '-' . now()->year);
            }
        });
    }
}
