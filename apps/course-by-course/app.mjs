import { COST, LIMITS, initialState, placeCourse, setConditions, emitTwo, balances } from './model.mjs';
const $ = id => document.getElementById(id);
let state = initialState();
let events = [];
function addEvent(title, detail, rejected = false) {
  events.push({ title, detail, rejected });
}
function describe(s) {
  return `${s.wall.courses.length} courses; ${s.q.bricks} bricks and ${s.q.mortar} mortar units returned; ${s.q.worker.id}, drawing ${s.q.drawing.revision}, line ${s.q.line.id}.`;
}
function result(message, bad = false) {
  $('result').textContent = message;
  $('result').classList.toggle('bad', bad);
}
function reset() {
  state = initialState(Number($('bricks').value), Number($('mortar').value));
  events = [];
  addEvent('Starting boundary', describe(state));
  result('New run. Foundation declared ready and line positioned for course 1. Try a step, or challenge a condition.');
  $('emitted-result').textContent = 'Uses the selected starting supplies above, in a separate calculation.';
  $('emitted-result').classList.remove('bad');
  $('emitted-courses').replaceChildren();
  render();
}
function renderWall() {
  const n = state.wall.courses.length;
  const lineY = 277 - (state.q.line.positionedFor - 1) * 44;
  const rows = state.wall.courses.map((course, row) => {
    const y = 274 - row * 44;
    return `<g><rect x="77" y="${y - 2}" width="486" height="40" rx="2" fill="#e3dacf"/><g fill="${row === n - 1 ? '#c58c69' : '#d8a588'}" stroke="#93654c" stroke-width="1.5">${Array.from({ length: COST.bricks }, (_, i) => `<rect x="${80 + i * 60}" y="${y}" width="57" height="35" rx="2"/>`).join('')}</g><text x="53" y="${y + 24}" text-anchor="middle" fill="#5c6657" font-size="15">${course.number}</text></g>`;
  }).join('');
  const pendingY = 274 - n * 44;
  $('wall-visual').innerHTML = `<title id="wall-title">Wall W-1 with ${n} accepted courses</title><desc id="wall-description">${n} rows of eight model bricks. ${n ? 'Each row is supported by the row below or the foundation.' : 'The foundation awaits its first course.'} Line L-1 is positioned for course ${state.q.line.positionedFor}.</desc><rect x="59" y="313" width="526" height="23" rx="3" fill="#b0b6a5"/><text x="319" y="330" text-anchor="middle" font-family="system-ui" font-size="12" fill="#20362d">FOUNDATION · ${state.wall.foundationReady ? 'declared ready' : 'readiness not declared'}</text>${n < LIMITS.courses ? `<rect x="79" y="${pendingY}" width="480" height="36" fill="none" stroke="#9fac96" stroke-dasharray="6 5"/><text x="320" y="${pendingY + 23}" text-anchor="middle" font-size="14" fill="#68795e">next course ${n + 1}</text>` : ''}${rows}<path d="M65 44V310M576 44V310" stroke="#7e795d" stroke-width="4"/><path d="M65 ${lineY}H576" stroke="#2f7390" stroke-width="3" stroke-dasharray="8 4"/><text x="90" y="27" fill="#285a70" font-size="14" font-family="system-ui">LINE L-1 · positioned for course ${state.q.line.positionedFor}</text>`;
}
function render() {
  const n = state.wall.courses.length;
  $('wall-heading').textContent = `Wall W-1 · ${n ? `${n} ${n === 1 ? 'course' : 'courses'}` : 'no courses yet'}`;
  $('brick-count').textContent = state.q.bricks;
  $('mortar-count').textContent = state.q.mortar;
  $('course-count').textContent = n;
  const b = balances(state);
  $('balance').textContent = `Bricks: ${b.bricks.initial} = ${b.bricks.left} left + ${b.bricks.used} in courses. Mortar: ${b.mortar.initial} = ${b.mortar.left} left + ${b.mortar.used} in courses.`;
  $('foundation').checked = state.wall.foundationReady;
  $('support').checked = state.wall.supportReady;
  $('line').textContent = `Position line for course ${n + 1}`;
  $('line').disabled = n >= LIMITS.courses;
  $('line-status').textContent = n >= LIMITS.courses ? `Five-course boundary reached. Line L-1 returns at course ${state.q.line.positionedFor}.` : `Line L-1 is at course ${state.q.line.positionedFor}. ${state.q.line.positionedFor === n + 1 ? 'It matches the next step.' : 'It must move before the next step.'}`;
  $('place').textContent = n >= LIMITS.courses ? 'Check the model boundary →' : `Try to lay course ${n + 1} →`;
  $('returned-resources').textContent = `Worker ${state.q.worker.id} · drawing revision ${state.q.drawing.revision} · line ${state.q.line.id} · ${state.q.bricks} bricks · ${state.q.mortar} mortar units`;
  $('trace').replaceChildren(...events.map(event => {
    const li = document.createElement('li');
    if (event.rejected) li.className = 'rejected';
    const title = document.createElement('strong'); title.textContent = event.title;
    li.append(title, document.createTextNode(event.detail)); return li;
  }));
  renderWall();
}
$('reset').addEventListener('click', reset);
for (const id of ['bricks', 'mortar']) $(id).addEventListener('change', reset);
$('foundation').addEventListener('change', () => {
  state = setConditions(state, { foundationReady: $('foundation').checked });
  addEvent('Foundation declaration changed', `Foundation readiness = ${state.wall.foundationReady}. This affects the first course only.`);
  result('Declaration updated. Try a course to evaluate the model.'); render();
});
$('support').addEventListener('change', () => {
  state = setConditions(state, { supportReady: $('support').checked });
  addEvent('Support declaration changed', `Top-course readiness = ${state.wall.supportReady}. No physical evidence was checked by this program.`);
  result('Declaration updated. The next step will also check the line and remaining materials.'); render();
});
$('line').addEventListener('click', () => {
  state = setConditions(state, { positionLine: true });
  addEvent('Line position declared', `Line ${state.q.line.id} is now recorded at course ${state.q.line.positionedFor}.`);
  result('Line record updated. Try a course to evaluate the remaining conditions.'); render();
});
$('place').addEventListener('click', () => {
  const evaluation = placeCourse(state);
  if (evaluation.ok) {
    state = evaluation.state;
    addEvent(evaluation.reason, `${describe(state)} Support: ${evaluation.course.supportedBy}. Line remains at course ${state.q.line.positionedFor}; new top-course readiness is undeclared.`);
    result(`${evaluation.reason} Eight bricks and two mortar units moved from stock into W-1. ${state.wall.courses.length >= LIMITS.courses ? 'The five-course teaching boundary is now complete; all returned resources remain visible.' : 'The next step needs fresh support and line declarations.'}`);
  } else {
    addEvent('Rejected · no state change', evaluation.reason);
    events[events.length - 1].rejected = true;
    result(`${evaluation.reason} Wall, stock and resource identities are unchanged.`, true);
  }
  render();
});
$('emit').addEventListener('click', () => {
  const input = initialState(Number($('bricks').value), Number($('mortar').value)).q;
  const evaluation = emitTwo(input);
  $('emitted-result').classList.toggle('bad', !evaluation.ok);
  $('emitted-courses').replaceChildren();
  if (!evaluation.ok) {
    $('emitted-result').textContent = `Two-step composite rejected at E${evaluation.failedAt}: ${evaluation.reason} It has no accepted outer output for this input; the wall run above is unchanged.`;
    return;
  }
  $('emitted-result').textContent = `Two separate outputs accepted. ${evaluation.q.bricks} bricks and ${evaluation.q.mortar} mortar units remain; ${evaluation.q.worker.id}, drawing ${evaluation.q.drawing.revision} and line ${evaluation.q.line.id} return. No support edge joins Co₁ to Co₂. The wall run above is unchanged.`;
  for (const label of ['Co₂ · new output', 'Co₁ · bypassed output']) {
    const chip = document.createElement('span'); chip.className = 'course-chip'; chip.textContent = label; $('emitted-courses').append(chip);
  }
});
reset();
