import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { QuestionDto } from './live-quiz.service';

export interface LqPlayer {
  socketId: string;
  userId: number;
  name: string;
  score: number;
  answered: Set<number>;
}

export interface LqRoom {
  pin: string;
  sessionId: number;
  teacherId: number;
  title: string;
  questions: QuestionDto[]; // includes the correct index (server-side only)
  hostSocketId: string | null;
  players: Map<string, LqPlayer>;
  status: 'waiting' | 'active' | 'finished';
  currentIndex: number;
  distribution: number[]; // answers-per-option for the current question
}

export interface ClientQuestion {
  index: number;
  total: number;
  question: string;
  options: string[];
  time_limit: number;
}

/**
 * Holds the in-memory state for every live quiz room (keyed by PIN) and the
 * server-authoritative scoring. Nothing here trusts the client: the correct
 * answer index never leaves the server, and scores are computed here.
 */
@Injectable()
export class LiveQuizRoomService {
  private rooms = new Map<string, LqRoom>();
  private socketPin = new Map<string, string>();

  constructor(private config: ConfigService) {}

  /** Verify the app's hand-rolled HMAC JWT presented on the WS handshake. */
  verifyToken(token?: string): { id: number; email: string; role_id: number } | null {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [h, p, sig] = parts;
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) return null;
    const expected = crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest('base64url');
    if (expected !== sig) return null;
    try {
      const payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
      if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) return null;
      return { id: payload.sub, email: payload.email, role_id: payload.role_id };
    } catch {
      return null;
    }
  }

  getRoom(pin: string): LqRoom | undefined {
    return this.rooms.get(pin);
  }

  getRoomBySocket(socketId: string): LqRoom | undefined {
    const pin = this.socketPin.get(socketId);
    return pin ? this.rooms.get(pin) : undefined;
  }

  /** Create the in-memory room from a DB session if it doesn't exist yet. */
  ensureRoom(pin: string, sessionId: number, teacherId: number, title: string, questions: QuestionDto[]): LqRoom {
    let room = this.rooms.get(pin);
    if (!room) {
      room = {
        pin, sessionId, teacherId, title, questions,
        hostSocketId: null,
        players: new Map(),
        status: 'waiting',
        currentIndex: 0,
        distribution: new Array(4).fill(0),
      };
      this.rooms.set(pin, room);
    }
    return room;
  }

  setHost(pin: string, socketId: string): void {
    const room = this.rooms.get(pin);
    if (room) {
      room.hostSocketId = socketId;
      this.socketPin.set(socketId, pin);
    }
  }

  addPlayer(pin: string, socketId: string, userId: number, name: string): LqRoom | null {
    const room = this.rooms.get(pin);
    if (!room) return null;
    if (!room.players.has(socketId)) {
      room.players.set(socketId, { socketId, userId, name, score: 0, answered: new Set() });
    }
    this.socketPin.set(socketId, pin);
    return room;
  }

  /** Roster/leaderboard, highest score first. */
  playersList(room: LqRoom): { name: string; score: number }[] {
    return [...room.players.values()]
      .sort((a, b) => b.score - a.score)
      .map((p) => ({ name: p.name, score: p.score }));
  }

  clientQuestion(room: LqRoom, index: number): ClientQuestion | null {
    const q = room.questions[index];
    if (!q) return null;
    return {
      index,
      total: room.questions.length,
      question: q.question,
      options: q.options,
      time_limit: q.time_limit || 20,
    };
  }

  start(pin: string): ClientQuestion | null {
    const room = this.rooms.get(pin);
    if (!room) return null;
    room.status = 'active';
    room.currentIndex = 0;
    room.distribution = new Array(4).fill(0);
    room.players.forEach((p) => p.answered.clear());
    return this.clientQuestion(room, 0);
  }

  /** Advance to the next question, or finish. Returns finished=true when done. */
  next(pin: string): { finished: boolean; question: ClientQuestion | null } | null {
    const room = this.rooms.get(pin);
    if (!room) return null;
    if (room.currentIndex < room.questions.length - 1) {
      room.currentIndex++;
      room.distribution = new Array(4).fill(0);
      return { finished: false, question: this.clientQuestion(room, room.currentIndex) };
    }
    room.status = 'finished';
    return { finished: true, question: null };
  }

  /** Server-authoritative scoring for the current question. */
  submitAnswer(socketId: string, answerIndex: number, timeLeft: number) {
    const room = this.getRoomBySocket(socketId);
    if (!room || room.status !== 'active') return null;
    const player = room.players.get(socketId);
    if (!player) return null;
    const idx = room.currentIndex;
    if (player.answered.has(idx)) return null;
    const q = room.questions[idx];
    if (!q) return null;

    player.answered.add(idx);
    if (answerIndex >= 0 && answerIndex < room.distribution.length) {
      room.distribution[answerIndex]++;
    }
    const correct = answerIndex === q.correct;
    let gained = 0;
    if (correct) {
      gained = 100 + Math.max(0, timeLeft) * 5;
      player.score += gained;
    }
    const answeredCount = [...room.players.values()].filter((p) => p.answered.has(idx)).length;
    return { room, player, correct, correctIndex: q.correct, gained, answeredCount };
  }

  /** Remove a socket (leave/disconnect). Reports whether it was the host. */
  removeSocket(socketId: string): { room: LqRoom; wasHost: boolean } | null {
    const pin = this.socketPin.get(socketId);
    this.socketPin.delete(socketId);
    if (!pin) return null;
    const room = this.rooms.get(pin);
    if (!room) return null;
    const wasHost = room.hostSocketId === socketId;
    if (wasHost) room.hostSocketId = null;
    room.players.delete(socketId);
    if (!room.hostSocketId && room.players.size === 0) {
      this.rooms.delete(pin); // nobody left — drop the room
    }
    return { room, wasHost };
  }
}
