import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { COST, initialState, placeCourse, setConditions, emitCourse, emitTwo, balances } from '../apps/course-by-course/model.mjs';

test('each accepted course accounts for material and preserves resource identities', () => {
  let state = initialState(40, 10);
  const originalQ = structuredClone(state.q);
  for (let n = 1; n <= 5; n++) {
    if (n > 1) state = setConditions(state, { supportReady: true, positionLine: true });
    const before = structuredClone(state);
    const result = placeCourse(state);
    assert.equal(result.ok, true);
    assert.deepEqual(state, before, 'input is immutable');
    state = result.state;
    const account = balances(state);
    for (const material of ['bricks', 'mortar']) {
      assert.equal(account[material].initial, account[material].left + account[material].used);
      assert.equal(account[material].used, n * COST[material]);
    }
    assert.deepEqual(state.q.worker, originalQ.worker);
    assert.deepEqual(state.q.drawing, originalQ.drawing);
    assert.equal(state.q.line.id, originalQ.line.id);
    assert.equal(state.wall.supportReady, false);
    assert.equal(state.wall.courses.at(-1).supportedBy, n === 1 ? 'foundation' : `C-${n - 1}`);
  }
  assert.equal(placeCourse(state).ok, false, 'explicit five-course bound');
  assert.deepEqual({ b: state.q.bricks, m: state.q.mortar }, { b: 0, m: 0 });
});

test('first course checks foundation; next course checks fresh support and line position', () => {
  const initial = initialState();
  const noBase = setConditions(initial, { foundationReady: false });
  assert.match(placeCourse(noBase).reason, /foundation/);
  const first = placeCourse(initial).state;
  const noSupport = placeCourse(first);
  assert.equal(noSupport.ok, false);
  assert.match(noSupport.reason, /top course/);
  assert.deepEqual(noSupport.state, first);
  const supported = setConditions(first, { supportReady: true });
  assert.match(placeCourse(supported).reason, /line/);
  const prepared = setConditions(supported, { positionLine: true });
  assert.equal(placeCourse(prepared).ok, true);
  assert.equal(placeCourse(setConditions(prepared, { foundationReady: false })).ok, true,
    'foundation declaration is the first-course guard; the modeled later guard is top-course readiness');
});

test('material shortages reject without partial consumption', () => {
  for (const [b, m, reason] of [[7, 2, /bricks/], [8, 1, /mortar/], [0, 0, /bricks and mortar/]]) {
    const initial = initialState(b, m);
    const result = placeCourse(initial);
    assert.equal(result.ok, false);
    assert.match(result.reason, reason);
    assert.deepEqual(result.state, initial);
  }
});

test('S after preparation after S equals two explicit guarded steps', () => {
  const compose = (g, f) => input => g(f(input));
  const acceptedStep = input => { const result = placeCourse(input); assert.equal(result.ok, true); return result.state; };
  const prepare = state => setConditions(state, { supportReady: true, positionLine: true });
  for (let b = 16; b <= 40; b++) for (let m = 4; m <= 10; m++) {
    const input = initialState(b, m);
    const sequential = acceptedStep(prepare(acceptedStep(input)));
    const leftAssociated = compose(compose(acceptedStep, prepare), acceptedStep)(input);
    const rightAssociated = compose(acceptedStep, compose(prepare, acceptedStep))(input);
    assert.deepEqual(leftAssociated, sequential);
    assert.deepEqual(rightAssociated, sequential);
    assert.equal(sequential.wall.courses.length, 2);
    assert.equal(sequential.q.bricks, b - 16);
    assert.equal(sequential.q.mortar, m - 4);
  }
});

test('emitted-course two-step composition carries the first course on an identity wire', () => {
  for (let b = 0; b <= 40; b++) for (let m = 0; m <= 10; m++) {
    const q = initialState(b, m).q;
    const output = emitTwo(q);
    assert.equal(output.ok, b >= 16 && m >= 4);
    if (output.ok) {
      const first = emitCourse(q); const second = emitCourse(first.q);
      assert.deepEqual(output, { ok: true, q: second.q, courses: [second.course, first.course] });
      assert.notDeepEqual(output.courses[0].fromStock, output.courses[1].fromStock, 'different output occurrences have different input witnesses');
      assert.deepEqual(output.courses[1].fromStock, { bricks: q.bricks, mortar: q.mortar }, 'the first output passes unchanged around the second step');
      assert.equal(q.bricks, output.q.bricks + output.courses.reduce((sum, c) => sum + c.bricks, 0));
      assert.equal(q.mortar, output.q.mortar + output.courses.reduce((sum, c) => sum + c.mortar, 0));
      assert.deepEqual(output.q.worker, q.worker);
      assert.deepEqual(output.q.line, q.line);
      assert.deepEqual(output.q.drawing, q.drawing);
      assert.equal('supportedBy' in output.courses[0], false, 'emitted outputs do not invent a support edge');
    } else {
      assert.deepEqual(output.q, q);
      assert.deepEqual(output.courses, []);
    }
  }
});

test('invalid material values cannot enter the finite starting domain', () => {
  for (const [b, m] of [[-1, 2], [8.5, 2], [41, 2], [8, -1], [8, 11], [NaN, 2]])
    assert.throws(() => initialState(b, m), RangeError);
  assert.throws(() => setConditions(initialState(), { supportReady: 'true' }), TypeError);
});

test('direct-open HTML bundles the tested model and current UI source exactly', () => {
  const root = new URL('../apps/course-by-course/', import.meta.url);
  const model = readFileSync(new URL('model.mjs', root), 'utf8').replace(/^export /gm, '');
  const app = readFileSync(new URL('app.mjs', root), 'utf8').replace(/^import .*?;\n/, '');
  const html = readFileSync(new URL('index.html', root), 'utf8');
  assert.ok(html.includes(`(()=>{\n${model}\n${app}\n})();`));
});
