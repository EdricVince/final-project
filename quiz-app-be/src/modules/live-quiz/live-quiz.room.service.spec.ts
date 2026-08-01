import * as crypto from 'crypto';
import { LiveQuizRoomService } from './live-quiz.room.service';

const SECRET = 'lq-secret';
const config = { get: (k: string) => (k === 'JWT_SECRET' ? SECRET : undefined) } as any;
const steps = [
  { title: 'Intro', body: 'Welcome to the lesson' },
  { title: 'Grammar', body: 'Present perfect explained' },
];

describe('LiveQuizRoomService (live lesson)', () => {
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
    const r1 = svc.ensureRoom('123456', 1, 10, 'Lesson', steps);
    const r2 = svc.ensureRoom('123456', 1, 10, 'Lesson', steps);
    expect(r1).toBe(r2);
  });

  it('start shows step 0, next advances, then ends past the last step', () => {
    svc.ensureRoom('123456', 1, 10, 'Lesson', steps);
    const s0 = svc.start('123456');
    expect(s0?.index).toBe(0);
    expect(s0?.title).toBe('Intro');
    expect(s0?.total).toBe(2);

    const nx = svc.next('123456');
    expect(nx?.ended).toBe(false);
    expect(nx?.step?.index).toBe(1);

    const end = svc.next('123456');
    expect(end?.ended).toBe(true);
    expect(end?.step).toBeNull();
  });

  it('prev steps back but never before the first step', () => {
    svc.ensureRoom('123456', 1, 10, 'Lesson', steps);
    svc.start('123456');
    svc.next('123456'); // now at index 1
    const back = svc.prev('123456');
    expect(back?.index).toBe(0);
    const stay = svc.prev('123456');
    expect(stay?.index).toBe(0); // clamped at the first step
  });

  it('lists participants by name only (no scores in a meeting)', () => {
    const room = svc.ensureRoom('123456', 1, 10, 'Lesson', steps);
    svc.setHost('123456', 'host');
    svc.addParticipant('123456', 'p1', 5, 'Alice');
    svc.addParticipant('123456', 'p2', 6, 'Bob');
    expect(svc.participantsList(room)).toEqual([{ name: 'Alice' }, { name: 'Bob' }]);
  });

  it('removeSocket drops the room once host and participants are gone', () => {
    svc.ensureRoom('123456', 1, 10, 'Lesson', steps);
    svc.setHost('123456', 'host');
    svc.addParticipant('123456', 'p1', 5, 'Alice');

    const left = svc.removeSocket('host');
    expect(left?.wasHost).toBe(true);
    expect(svc.getRoom('123456')).toBeDefined(); // participant still there

    svc.removeSocket('p1');
    expect(svc.getRoom('123456')).toBeUndefined();
  });
});
