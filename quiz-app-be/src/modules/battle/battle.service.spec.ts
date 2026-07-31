import * as crypto from 'crypto';
import { BattleService } from './battle.service';

const SECRET = 'test-secret';
const config = { get: (k: string) => (k === 'JWT_SECRET' ? SECRET : undefined) } as any;
const future = Math.floor(Date.now() / 1000) + 3600;

function token(payload: object, secret = SECRET): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const head = b64({ alg: 'HS256', typ: 'JWT' });
  const body = b64(payload);
  const sig = crypto.createHmac('sha256', secret).update(`${head}.${body}`).digest('base64url');
  return `${head}.${body}.${sig}`;
}

const player = (socketId: string, userId: number) =>
  ({ socketId, userId, name: `U${userId}`, avatar: '🦊', difficulty: 'medium' });

describe('BattleService', () => {
  let svc: BattleService;
  beforeEach(() => { svc = new BattleService(config); });

  describe('verifyToken (WS handshake auth)', () => {
    it('accepts a valid token and returns the identity', () => {
      const t = token({ sub: 7, email: 'a@b.c', role_id: 1, exp: future });
      expect(svc.verifyToken(t)).toEqual({ id: 7, email: 'a@b.c', role_id: 1 });
    });
    it('rejects a token signed with the wrong secret', () => {
      expect(svc.verifyToken(token({ sub: 1, exp: future }, 'wrong-secret'))).toBeNull();
    });
    it('rejects an expired token', () => {
      expect(svc.verifyToken(token({ sub: 1, exp: Math.floor(Date.now() / 1000) - 10 }))).toBeNull();
    });
    it('rejects a malformed or missing token', () => {
      expect(svc.verifyToken('not.a.jwt')).toBeNull();
      expect(svc.verifyToken(undefined)).toBeNull();
    });
  });

  describe('matchmaking + server-authoritative scoring', () => {
    beforeEach(() => {
      jest.spyOn(svc, 'generateQuestions').mockResolvedValue([
        { question: 'Q1', options: ['a', 'b', 'c', 'd'], correct: 1 },
        { question: 'Q2', options: ['a', 'b', 'c', 'd'], correct: 0 },
      ]);
    });

    it('queues the first player, then pairs the second into a room', async () => {
      expect(await svc.tryMatch(player('s1', 1))).toBeNull();
      const room = await svc.tryMatch(player('s2', 2));
      expect(room).not.toBeNull();
      expect(room!.players).toHaveLength(2);
      expect(room!.questions).toHaveLength(2);
    });

    it('never pairs a player with their own second socket (same userId)', async () => {
      await svc.tryMatch(player('s1', 1));
      expect(await svc.tryMatch(player('s1b', 1))).toBeNull();
    });

    it('strips the correct index from client questions', async () => {
      await svc.tryMatch(player('s1', 1));
      const room = await svc.tryMatch(player('s2', 2));
      const cq = svc.clientQuestions(room!);
      expect(cq[0]).toEqual({ question: 'Q1', options: ['a', 'b', 'c', 'd'] });
      expect(cq[0]).not.toHaveProperty('correct');
    });

    it('scores a correct answer server-side and ignores a duplicate answer', async () => {
      await svc.tryMatch(player('s1', 1));
      await svc.tryMatch(player('s2', 2));

      const correct = svc.submitAnswer('s2', 0, 1, 10); // Q0 correct index = 1
      expect(correct!.correct).toBe(true);
      expect(correct!.gained).toBe(100 + 10 * 10 + 1 * 10); // base + time + streak = 210
      expect(correct!.me.score).toBe(210);

      expect(svc.submitAnswer('s2', 0, 1, 10)).toBeNull(); // same question again → ignored

      const wrong = svc.submitAnswer('s1', 0, 3, 10);
      expect(wrong!.correct).toBe(false);
      expect(wrong!.gained).toBe(0);
      expect(wrong!.me.score).toBe(0);
    });

    it('cancelQueue removes a waiting player so no room forms', async () => {
      await svc.tryMatch(player('s1', 1));
      svc.cancelQueue('s1');
      expect(await svc.tryMatch(player('s2', 2))).toBeNull();
    });
  });
});
