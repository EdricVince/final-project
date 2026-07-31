import * as crypto from 'crypto';
import { LiveQuizRoomService } from './live-quiz.room.service';

const SECRET = 'lq-secret';
const config = { get: (k: string) => (k === 'JWT_SECRET' ? SECRET : undefined) } as any;
const questions = [
  { question: 'Q1', options: ['a', 'b', 'c', 'd'], correct: 2, time_limit: 20 },
  { question: 'Q2', options: ['a', 'b', 'c', 'd'], correct: 0, time_limit: 20 },
];

describe('LiveQuizRoomService', () => {
  let svc: LiveQuizRoomService;
  beforeEach(() => { svc = new LiveQuizRoomService(config); });

  it('verifyToken accepts a valid token and rejects a tampered signature', () => {
    const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const head = b64({ alg: 'HS256', typ: 'JWT' });
    const body = b64({ sub: 3, email: 'x@y.z', role_id: 2, exp: Math.floor(Date.now() / 1000) + 3600 });
    const sig = crypto.createHmac('sha256', SECRET).update(`${head}.${body}`).digest('base64url');
    expect(svc.verifyToken(`${head}.${body}.${sig}`)).toEqual({ id: 3, email: 'x@y.z', role_id: 2 });
    expect(svc.verifyToken(`${head}.${body}.tampered`)).toBeNull();
  });

  it('ensureRoom is idempotent for the same PIN', () => {
    const r1 = svc.ensureRoom('123456', 1, 10, 'Quiz', questions);
    const r2 = svc.ensureRoom('123456', 1, 10, 'Quiz', questions);
    expect(r1).toBe(r2);
  });

  it('start emits a client-safe question 0, next advances, then finishes', () => {
    svc.ensureRoom('123456', 1, 10, 'Quiz', questions);
    const q0 = svc.start('123456');
    expect(q0?.index).toBe(0);
    expect(q0).not.toHaveProperty('correct'); // correct answer never leaves the server

    const nx = svc.next('123456');
    expect(nx?.finished).toBe(false);
    expect(nx?.question?.index).toBe(1);

    const fin = svc.next('123456');
    expect(fin?.finished).toBe(true);
    expect(fin?.question).toBeNull();
  });

  it('scores answers server-side (100 + time bonus) and ranks the leaderboard', () => {
    const room = svc.ensureRoom('123456', 1, 10, 'Quiz', questions);
    svc.setHost('123456', 'host');
    svc.addPlayer('123456', 'p1', 5, 'Alice');
    svc.addPlayer('123456', 'p2', 6, 'Bob');
    svc.start('123456');

    const r1 = svc.submitAnswer('p1', 2, 15); // Q0 correct = 2
    expect(r1?.correct).toBe(true);
    expect(r1?.player.score).toBe(100 + 15 * 5); // 175

    const r2 = svc.submitAnswer('p2', 0, 10); // wrong
    expect(r2?.correct).toBe(false);
    expect(r2?.player.score).toBe(0);

    expect(svc.submitAnswer('p1', 2, 15)).toBeNull(); // duplicate ignored

    const board = svc.playersList(room);
    expect(board[0]).toEqual({ name: 'Alice', score: 175 });
    expect(board[1]).toEqual({ name: 'Bob', score: 0 });
  });

  it('removeSocket drops the room once host and players are gone', () => {
    svc.ensureRoom('123456', 1, 10, 'Quiz', questions);
    svc.setHost('123456', 'host');
    svc.addPlayer('123456', 'p1', 5, 'Alice');

    const left = svc.removeSocket('host');
    expect(left?.wasHost).toBe(true);
    expect(svc.getRoom('123456')).toBeDefined(); // player still there

    svc.removeSocket('p1');
    expect(svc.getRoom('123456')).toBeUndefined();
  });
});
