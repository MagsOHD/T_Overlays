import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

/**
 * Tournament WebSocket Gateway
 *
 * Gère les connexions WebSocket pour les tournois.
 * Écoute les événements Redis de Laravel et broadcast aux clients.
 */
@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*', // En prod: utiliser les domaines autorisés
    credentials: true,
  },
  namespace: '/',
})
export class TournamentGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TournamentGateway.name);
  private connectedClients: Map<string, Socket> = new Map();

  constructor(private readonly redisService: RedisService) {
    // Écouter les événements Redis publiés par Laravel
    this.subscribeToRedisEvents();
  }

  // ==============================================
  // WebSocket Lifecycle
  // ==============================================

  /**
   * Handle client connection
   */
  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);

    // Send welcome message
    client.emit('connected', {
      message: 'Connected to Tournament WebSocket Server',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });

    // Log total connections
    this.logger.log(
      `Total connected clients: ${this.connectedClients.size}`,
    );
  }

  /**
   * Handle client disconnection
   */
  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);

    // Leave all rooms
    const rooms = Array.from(client.rooms);
    rooms.forEach((room) => {
      if (room !== client.id) {
        client.leave(room);
        this.logger.log(`Client ${client.id} left room: ${room}`);
      }
    });
  }

  // ==============================================
  // Client → Server Events
  // ==============================================

  /**
   * Client joins a tournament room
   */
  @SubscribeMessage('join_tournament')
  async handleJoinTournament(
    @MessageBody() data: { tournamentId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `tournament:${data.tournamentId}`;
    await client.join(room);

    this.logger.log(`Client ${client.id} joined ${room}`);

    // Notify room members
    this.server.to(room).emit('user_joined', {
      clientId: client.id,
      tournamentId: data.tournamentId,
      timestamp: new Date().toISOString(),
    });

    // Send current room info to client
    client.emit('joined_tournament', {
      tournamentId: data.tournamentId,
      room,
      memberCount: this.server.sockets.adapter.rooms.get(room)?.size || 0,
    });
  }

  /**
   * Client leaves a tournament room
   */
  @SubscribeMessage('leave_tournament')
  async handleLeaveTournament(
    @MessageBody() data: { tournamentId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `tournament:${data.tournamentId}`;
    await client.leave(room);

    this.logger.log(`Client ${client.id} left ${room}`);

    // Notify room members
    this.server.to(room).emit('user_left', {
      clientId: client.id,
      tournamentId: data.tournamentId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Client spectates a match
   */
  @SubscribeMessage('spectate_match')
  async handleSpectateMatch(
    @MessageBody() data: { matchId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `match:${data.matchId}`;
    await client.join(room);

    this.logger.log(`Client ${client.id} spectating ${room}`);

    client.emit('spectating_match', {
      matchId: data.matchId,
      room,
      spectatorCount: this.server.sockets.adapter.rooms.get(room)?.size || 0,
    });
  }

  /**
   * Client sends chat message
   */
  @SubscribeMessage('chat_message')
  async handleChatMessage(
    @MessageBody()
    data: {
      roomId: string;
      message: string;
      userId?: number;
      username?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    // TODO: Validate & sanitize message
    // TODO: Save to database
    // TODO: Check user permissions

    const chatMessage = {
      roomId: data.roomId,
      userId: data.userId,
      username: data.username || 'Anonymous',
      message: data.message,
      timestamp: new Date().toISOString(),
      clientId: client.id,
    };

    // Broadcast to room
    this.server.to(data.roomId).emit('chat_message', chatMessage);

    this.logger.log(
      `Chat message in ${data.roomId} from ${data.username}: ${data.message}`,
    );
  }

  // ==============================================
  // Redis Pub/Sub → WebSocket Broadcasting
  // ==============================================

  /**
   * Subscribe to Redis events from Laravel
   */
  private async subscribeToRedisEvents() {
    const subscriber = this.redisService.getSubscriber();

    // Tournament created
    await subscriber.subscribe('tournament.created', (message) => {
      const data = JSON.parse(message);
      this.logger.log(`[Redis] Tournament created: ${data.tournament_id}`);

      // Broadcast to all clients
      this.server.emit('tournament_created', data);
    });

    // Team registered
    await subscriber.subscribe('team.registered', (message) => {
      const data = JSON.parse(message);
      this.logger.log(
        `[Redis] Team registered: ${data.team_name} in tournament ${data.tournament_id}`,
      );

      // Broadcast to tournament room
      const room = `tournament:${data.tournament_id}`;
      this.server.to(room).emit('team_registered', data);

      // Send notification
      this.server.to(room).emit('notification', {
        type: 'team_registered',
        message: `${data.team_name} has registered!`,
        data,
      });
    });

    // Match score updated
    await subscriber.subscribe('match.score_updated', (message) => {
      const data = JSON.parse(message);
      this.logger.log(`[Redis] Match score updated: ${data.match_id}`);

      // Broadcast to match room
      const matchRoom = `match:${data.match_id}`;
      this.server.to(matchRoom).emit('score_update', {
        matchId: data.match_id,
        teamA: data.score_a,
        teamB: data.score_b,
        timestamp: data.timestamp,
      });

      // Broadcast to tournament room
      if (data.tournament_id) {
        const tournamentRoom = `tournament:${data.tournament_id}`;
        this.server.to(tournamentRoom).emit('score_update', {
          matchId: data.match_id,
          teamA: data.score_a,
          teamB: data.score_b,
          timestamp: data.timestamp,
        });
      }
    });

    // Bracket generated
    await subscriber.subscribe('bracket.generated', (message) => {
      const data = JSON.parse(message);
      this.logger.log(
        `[Redis] Bracket generated for tournament: ${data.tournament_id}`,
      );

      const room = `tournament:${data.tournament_id}`;
      this.server.to(room).emit('bracket_generated', data);

      this.server.to(room).emit('notification', {
        type: 'bracket_generated',
        message: 'Tournament bracket has been generated!',
        data,
      });
    });

    // Tournament started
    await subscriber.subscribe('tournament.started', (message) => {
      const data = JSON.parse(message);
      this.logger.log(
        `[Redis] Tournament started: ${data.tournament_id}`,
      );

      const room = `tournament:${data.tournament_id}`;
      this.server.to(room).emit('tournament_start', data);

      this.server.to(room).emit('notification', {
        type: 'tournament_start',
        message: `${data.name} has started!`,
        data,
      });
    });

    // Tournament finished
    await subscriber.subscribe('tournament.finished', (message) => {
      const data = JSON.parse(message);
      this.logger.log(
        `[Redis] Tournament finished: ${data.tournament_id}`,
      );

      const room = `tournament:${data.tournament_id}`;
      this.server.to(room).emit('tournament_finished', data);

      this.server.to(room).emit('notification', {
        type: 'tournament_finished',
        message: `${data.name} has finished!`,
        data,
      });
    });

    // Tournament status changed
    await subscriber.subscribe('tournament.status_changed', (message) => {
      const data = JSON.parse(message);
      this.logger.log(
        `[Redis] Tournament status changed: ${data.tournament_id} - ${data.old_status} → ${data.new_status}`,
      );

      const room = `tournament:${data.tournament_id}`;
      this.server.to(room).emit('tournament_status_changed', data);
    });

    this.logger.log('Subscribed to all Redis events from Laravel');
  }

  // ==============================================
  // Helper Methods
  // ==============================================

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get room members count
   */
  getRoomMembersCount(room: string): number {
    return this.server.sockets.adapter.rooms.get(room)?.size || 0;
  }

  /**
   * Broadcast notification to all clients
   */
  broadcastNotification(notification: {
    type: string;
    message: string;
    data?: any;
  }) {
    this.server.emit('notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast to specific room
   */
  broadcastToRoom(
    room: string,
    event: string,
    data: any,
  ) {
    this.server.to(room).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
}
