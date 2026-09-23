/** Finite teaching semantics. Counts are toy units, never construction quantities. */
export const COST = Object.freeze({ bricks: 8, mortar: 2 });
export const LIMITS = Object.freeze({ bricks: 40, mortar: 10, courses: 5 });
const copy = value => JSON.parse(JSON.stringify(value));
const count = (value, maximum) => Number.isInteger(value) && value >= 0 && value <= maximum;

export function initialState(bricks = 24, mortar = 6) {
  if (!count(bricks, LIMITS.bricks) || !count(mortar, LIMITS.mortar))
    throw new RangeError('Choose whole counts: 0–40 bricks and 0–10 mortar units.');
  return {
    initial: { bricks, mortar },
    q: { bricks, mortar, worker: { id: 'BL-07' }, drawing: { revision: 'A' },
      line: { id: 'L-1', positionedFor: 1 } },
    wall: { id: 'W-1', courses: [], foundationReady: true, supportReady: false }
  };
}

export function validateQ(q) {
  if (!q || !count(q.bricks, LIMITS.bricks) || !count(q.mortar, LIMITS.mortar))
    return 'Material counts are outside the finite model.';
  if (typeof q.worker?.id !== 'string' || !q.worker.id ||
      typeof q.drawing?.revision !== 'string' || !q.drawing.revision ||
      typeof q.line?.id !== 'string' || !q.line.id || !Number.isInteger(q.line.positionedFor))
    return 'A worker, drawing revision and positioned line must be supplied.';
  return null;
}

function materialIssue(q) {
  if (q.bricks < COST.bricks && q.mortar < COST.mortar) return 'Insufficient bricks and mortar.';
  if (q.bricks < COST.bricks) return 'Insufficient bricks.';
  if (q.mortar < COST.mortar) return 'Insufficient mortar.';
  return null;
}

function consume(q) {
  return { ...copy(q), bricks: q.bricks - COST.bricks, mortar: q.mortar - COST.mortar };
}

export function placeCourse(state) {
  const rejected = reason => ({ ok: false, reason, state: copy(state) });
  const malformed = validateQ(state?.q);
  if (malformed) return rejected(malformed);
  if (!Array.isArray(state?.wall?.courses)) return rejected('A wall state must be supplied.');
  const n = state.wall.courses.length;
  if (n >= LIMITS.courses) return rejected('The five-course teaching boundary has been reached.');
  if (n === 0 && !state.wall.foundationReady) return rejected('First course: foundation readiness has not been declared.');
  if (n > 0 && !state.wall.supportReady) return rejected('Next course: readiness of the existing top course has not been declared.');
  if (state.q.line.positionedFor !== n + 1) return rejected(`The line is at course ${state.q.line.positionedFor}; position it for course ${n + 1}.`);
  const shortage = materialIssue(state.q);
  if (shortage) return rejected(shortage);
  const next = copy(state);
  next.q = consume(state.q);
  const course = { id: `C-${n + 1}`, number: n + 1, bricks: COST.bricks, mortar: COST.mortar,
    workerId: state.q.worker.id, drawingRevision: state.q.drawing.revision,
    supportedBy: n === 0 ? 'foundation' : state.wall.courses[n - 1].id };
  next.wall.courses.push(course);
  // A newly added course does not certify its own readiness for further loading.
  next.wall.supportReady = false;
  return { ok: true, reason: `Course ${n + 1} accepted by the model.`, state: next, course: copy(course) };
}

export function setConditions(state, changes) {
  const next = copy(state);
  for (const key of ['foundationReady', 'supportReady']) {
    if (key in changes) {
      if (typeof changes[key] !== 'boolean') throw new TypeError('Readiness declarations must be booleans.');
      next.wall[key] = changes[key];
    }
  }
  if (changes.positionLine) next.q.line.positionedFor = next.wall.courses.length + 1;
  return next;
}

/** The separate-output tile: Q -> Q × Course. No existing wall is an input. */
export function emitCourse(q) {
  const malformed = validateQ(q);
  const shortage = malformed || materialIssue(q);
  if (shortage) return { ok: false, reason: shortage, q: copy(q) };
  return { ok: true, q: consume(q), course: { bricks: COST.bricks, mortar: COST.mortar,
    fromStock: { bricks: q.bricks, mortar: q.mortar }, workerId: q.worker.id, drawingRevision: q.drawing.revision } };
}

/** (emit × id_Course) ∘ emit; output order is (remaining Q, new C2, bypassed C1). */
export function emitTwo(q) {
  const first = emitCourse(q);
  if (!first.ok) return { ok: false, reason: first.reason, failedAt: 1, q: copy(q), courses: [] };
  const second = emitCourse(first.q);
  if (!second.ok) return { ok: false, reason: second.reason, failedAt: 2, q: copy(q), courses: [] };
  return { ok: true, q: second.q, courses: [second.course, first.course] };
}

export function balances(state) {
  const usedBricks = state.wall.courses.reduce((sum, c) => sum + c.bricks, 0);
  const usedMortar = state.wall.courses.reduce((sum, c) => sum + c.mortar, 0);
  return { bricks: { initial: state.initial.bricks, left: state.q.bricks, used: usedBricks },
    mortar: { initial: state.initial.mortar, left: state.q.mortar, used: usedMortar } };
}
