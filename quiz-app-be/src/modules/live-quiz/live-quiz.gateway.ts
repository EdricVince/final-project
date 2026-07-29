import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LiveQuizRoomService, LqRoom } from './live-quiz.room.service';
import { LiveQuizService } from './live-quiz.service';
import { ROLE_TEACHER } from '../roles/entities/role.entity';

/**
 * Real-time Live Quiz over Socket.IO (namespace `/live-quiz`).
 * The teacher hosts a session by PIN and drives it (start / next); students
 * join the same PIN and receive questions, submit answers and see a live
 * leaderboard — all pushed instantly, replacing the old HTTP polling.
 */
@WebSocketGateway({
  namespace: '/live-quiz',
  cors: { origin: true, credentials: true },
})
export class LiveQuizGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private rooms: LiveQuizRoomService,
    private liveQuiz: LiveQuizService,
  ) {}

  private auth(socket: Socket) {
    return this.rooms.verifyToken(socket.handshake.auth?.token as string | undefined);
  }

  /** Teacher hosts their own session (by PIN). */
  @SubscribeMessage('lq:host')
  async onHost(@ConnectedSocket() socket: Socket, @MessageBody() body: { pin: string }) {
    const user = this.auth(socket);
    if (!user || user.role_id !== ROLE_TEACHER) {
      socket.emit('lq:error', { message: 'Only a teacher can host a live quiz.' });
      return;
    }
    let session;
    try {
      session = await this.liveQuiz.findByPin(String(body?.pin ?? ''));
    } catch {
      socket.emit('lq:error', { message: 'Session not found.' });
      return;
    }
    if (session.teacher_id !== user.id) {
      socket.emit('lq:error', { message: 'This is not your session.' });
      return;
    }
    const questions = this.liveQuiz.parseQuestions(session);
    const room = this.rooms.ensureRoom(session.pin, session.id, session.teacher_id, session.title, questions);
    this.rooms.setHost(session.pin, socket.id);
    socket.join(session.pin);
    socket.emit('lq:host_ready', {
      pin: session.pin,
      title: room.title,
      total: questions.length,
      status: room.status,
      players: this.rooms.playersList(room),
    });
  }

  /** Student joins a live quiz by PIN. */
  @SubscribeMessage('lq:join')
  async onJoin(@ConnectedSocket() socket: Socket, @MessageBody() body: { pin: string }) {
    const user = this.auth(socket);
    if (!user) {
      socket.emit('lq:error', { message: 'Please sign in again.' });
      return;
    }
    let session;
    try {
      session = await this.liveQuiz.findByPin(String(body?.pin ?? ''));
    } catch {
      socket.emit('lq:error', { message: 'No live quiz found for that PIN.' });
      return;
    }
    const questions = this.liveQuiz.parseQuestions(session);
    this.rooms.ensureRoom(session.pin, session.id, session.teacher_id, session.title, questions);
    const name = (user.email?.split('@')[0] || 'Player').slice(0, 20);
    const room = this.rooms.addPlayer(session.pin, socket.id, user.id, name);
    if (!room) {
      socket.emit('lq:error', { message: 'Could not join the session.' });
      return;
    }
    socket.join(session.pin);
    socket.emit('lq:joined', { title: room.title, total: room.questions.length, status: room.status });
    // Late joiner during an active quiz gets the current question immediately.
    if (room.status === 'active') {
      const q = this.rooms.clientQuestion(room, room.currentIndex);
      if (q) socket.emit('lq:question', q);
    }
    this.notifyHostRoster(room);
    this.broadcastLeaderboard(room);
  }

  @SubscribeMessage('lq:start')
  async onStart(@ConnectedSocket() socket: Socket) {
    const room = this.requireHost(socket);
    if (!room) return;
    const question = this.rooms.start(room.pin);
    await this.persistStatus(room, 'active');
    if (question) this.server.to(room.pin).emit('lq:question', question);
    this.broadcastLeaderboard(room);
  }

  @SubscribeMessage('lq:next')
  async onNext(@ConnectedSocket() socket: Socket) {
    const room = this.requireHost(socket);
    if (!room) return;
    const res = this.rooms.next(room.pin);
    if (!res) return;
    if (res.finished) {
      await this.persistStatus(room, 'finished');
      this.server.to(room.pin).emit('lq:finished', { leaderboard: this.rooms.playersList(room) });
    } else if (res.question) {
      this.server.to(room.pin).emit('lq:question', res.question);
      this.broadcastLeaderboard(room);
    }
  }

  @SubscribeMessage('lq:answer')
  onAnswer(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { answerIndex: number; timeLeft?: number },
  ) {
    const r = this.rooms.submitAnswer(socket.id, Number(body?.answerIndex), Number(body?.timeLeft) || 0);
    if (!r) return;
    socket.emit('lq:answer_result', {
      correct: r.correct,
      correctIndex: r.correctIndex,
      gained: r.gained,
      score: r.player.score,
    });
    if (r.room.hostSocketId) {
      this.server.to(r.room.hostSocketId).emit('lq:progress', {
        answered: r.answeredCount,
        count: r.room.players.size,
        distribution: r.room.distribution,
      });
    }
    this.broadcastLeaderboard(r.room);
  }

  handleDisconnect(socket: Socket) {
    const res = this.rooms.removeSocket(socket.id);
    if (!res) return;
    if (res.wasHost) {
      this.server.to(res.room.pin).emit('lq:host_left', {});
    } else {
      this.notifyHostRoster(res.room);
      this.broadcastLeaderboard(res.room);
    }
  }

  // ── helpers ────────────────────────────────────────────────────────────────
  private requireHost(socket: Socket): LqRoom | null {
    const room = this.rooms.getRoomBySocket(socket.id);
    if (!room || room.hostSocketId !== socket.id) {
      socket.emit('lq:error', { message: 'Only the host can control this quiz.' });
      return null;
    }
    return room;
  }

  private notifyHostRoster(room: LqRoom) {
    if (room.hostSocketId) {
      this.server.to(room.hostSocketId).emit('lq:players', {
        players: this.rooms.playersList(room),
        count: room.players.size,
      });
    }
  }

  private broadcastLeaderboard(room: LqRoom) {
    this.server.to(room.pin).emit('lq:leaderboard', {
      top: this.rooms.playersList(room).slice(0, 5),
    });
  }

  private async persistStatus(room: LqRoom, status: string) {
    try {
      await this.liveQuiz.updateStatus(room.sessionId, room.teacherId, status);
    } catch {
      /* non-critical — the live room is authoritative */
    }
  }
}
