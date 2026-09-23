/**
 * A bounded teaching construction, not a construction specification or scheduler.
 * Syntax: typed, acyclic, bijective source-to-target port attachments.
 * Semantics: finite partial functions, embedded as relations; rejection is an empty
 * relation for this input. Internal values are existential witnesses, not promises.
 */
export const TYPE = Object.freeze({
  BL: 'Bricklayer resource instance; mixer and builder have this same type',
  S: 'Sand input', C: 'Cement input', H2O: 'Water input', M: 'Mortar batch',
  P: 'Peg and line kit, retained', D: 'Drawing with declared geometry and revision, retained',
  L: 'Set-out line', B: 'Bricks', Lin: 'Lintels',
  ScRaw: 'Supplied access equipment, availability and inspection not yet checked',
  Sc: 'Supplied access equipment accepted by the bounded access check, retained',
  BuiltWall: 'Whole prepared one-storey wall assembly; readiness is not implied',
  Evidence: 'Supplied release evidence identifying geometry and drawing revision',
  ReadyWall: 'Wall assembly paired with matching release evidence',
  RoofKit: 'Bundled trusses, coverings and fasteners, installed into the shell',
  Roofed: 'Roofed structural shell in this model; weatherproofing is not established'
});

export const DEFAULT_SCENARIO = Object.freeze({
  accessOK: true, mortarOK: true, geometryOK: true, released: true,
  roofFits: true, sameWorker: false, revision: 'A', evidenceRevision: 'A',
  geometry: 'one-storey-A', evidenceGeometry: 'one-storey-A'
});

const p = (id, type, label = id) => ({ id, type, label });
const w = (fromNode, fromPort, toNode, toPort) => ({ from: [fromNode, fromPort], to: [toNode, toPort] });
const clone = value => structuredClone(value);
const key = endpoint => JSON.stringify(endpoint);
const sameInterface = (left, right) => Array.isArray(left) && Array.isArray(right) &&
  left.length === right.length && left.every((port, index) =>
    port.id === right[index].id && port.type === right[index].type);
const wallInputs = () => [p('mixer', 'BL', 'Mixer'), p('builder', 'BL', 'Builder'),
  p('sand', 'S', 'Sand'), p('cement', 'C', 'Cement'), p('water', 'H2O', 'Water'),
  p('bricks', 'B', 'Bricks'), p('lintels', 'Lin', 'Lintels'), p('peg', 'P', 'Peg kit'),
  p('drawing', 'D', 'Drawing'), p('access', 'Sc', 'Checked access')];
const wallOutputs = () => [p('mixer', 'BL', 'Mixer returned'), p('builder', 'BL', 'Builder returned'),
  p('wall', 'BuiltWall', 'Built wall assembly'), p('peg', 'P', 'Peg kit returned'),
  p('drawing', 'D', 'Drawing returned'), p('access', 'Sc', 'Access returned')];

export function wallingDiagram(replacement = 'standard') {
  if (!['standard', 'strict'].includes(replacement)) throw new Error(`Unknown replacement: ${replacement}`);
  return {
    id: 'Walling_One_Storey', inputs: wallInputs(), outputs: wallOutputs(),
    boxes: [
      { id: 'crew', label: 'Check two worker instances', rule: 'crew',
        description: 'An explicit physical premise: mixer and builder are distinct resource instances of the same BL type. Retain both workers.',
        inputs: [p('mixer', 'BL'), p('builder', 'BL')], outputs: [p('mixer', 'BL'), p('builder', 'BL')] },
      { id: 'mix', label: 'Mix mortar', rule: 'mix',
        description: 'Accept a workable mortar batch in the finite model; return the mixer resource.',
        inputs: [p('mixer', 'BL'), p('sand', 'S'), p('cement', 'C'), p('water', 'H2O')],
        outputs: [p('mixer', 'BL'), p('mortar', 'M')] },
      { id: 'set', label: replacement === 'strict' ? 'Set out · revision B only' : 'Set out line',
        rule: replacement === 'strict' ? 'set-strict' : 'set',
        description: replacement === 'strict'
          ? 'Same port interface; this replacement additionally accepts only drawing revision B.'
          : 'Thread the builder, peg kit and drawing through; produce a line for the declared geometry.',
        inputs: [p('builder', 'BL'), p('peg', 'P'), p('drawing', 'D')],
        outputs: [p('builder', 'BL'), p('line', 'L'), p('peg', 'P'), p('drawing', 'D')] },
      { id: 'wall', label: 'Build wall assembly', rule: 'wall',
        description: 'Build the whole prepared one-storey wall assembly. Foundations, competence and detailed site conditions are assumptions. Return builder, peg kit, drawing and access.',
        inputs: [p('builder', 'BL'), p('bricks', 'B'), p('lintels', 'Lin'), p('mortar', 'M'),
          p('line', 'L'), p('peg', 'P'), p('drawing', 'D'), p('access', 'Sc')],
        outputs: [p('builder', 'BL'), p('wall', 'BuiltWall'), p('peg', 'P'), p('drawing', 'D'), p('access', 'Sc')] }
    ],
    wires: [
      w('IN', 'mixer', 'crew', 'mixer'), w('IN', 'builder', 'crew', 'builder'),
      w('crew', 'mixer', 'mix', 'mixer'), w('IN', 'sand', 'mix', 'sand'),
      w('IN', 'cement', 'mix', 'cement'), w('IN', 'water', 'mix', 'water'),
      w('crew', 'builder', 'set', 'builder'), w('IN', 'peg', 'set', 'peg'), w('IN', 'drawing', 'set', 'drawing'),
      w('mix', 'mixer', 'OUT', 'mixer'), w('mix', 'mortar', 'wall', 'mortar'),
      w('set', 'builder', 'wall', 'builder'), w('set', 'line', 'wall', 'line'),
      w('set', 'peg', 'wall', 'peg'), w('set', 'drawing', 'wall', 'drawing'),
      w('IN', 'bricks', 'wall', 'bricks'), w('IN', 'lintels', 'wall', 'lintels'), w('IN', 'access', 'wall', 'access'),
      ...['builder', 'wall', 'peg', 'drawing', 'access'].map(id => w('wall', id, 'OUT', id))
    ]
  };
}

/** Generic substitution; only matching ordered interfaces are accepted.
 * Each inserted outer-boundary segment is spliced into the actual surrounding
 * wire. The same routine handles direct IN -> OUT identity wires.
 */
export function substitute(diagram, boxId, inner) {
  for (const [name, candidate] of [['outer', diagram], ['inner', inner]]) {
    const result = validate(candidate);
    if (!result.ok) throw new Error(`Cannot substitute invalid ${name} diagram: ${result.issues.join('; ')}`);
  }
  const box = diagram.boxes.find(b => b.id === boxId);
  if (!box) throw new Error(`Substitution box does not exist: ${boxId}`);
  if (!sameInterface(box.inputs, inner.inputs) || !sameInterface(box.outputs, inner.outputs))
    throw new Error('Substitution requires the same ordered input and output port IDs and types.');
  const namespace = id => `${boxId}/${id}`;
  const remaining = diagram.boxes.filter(b => b.id !== boxId);
  if (inner.boxes.some(b => remaining.some(other => other.id === namespace(b.id))))
    throw new Error('Substitution would duplicate a box ID.');
  const incoming = new Map(diagram.wires.filter(wire => wire.to[0] === boxId)
    .map(wire => [wire.to[1], wire.from]));
  const outgoing = new Map(inner.wires.filter(wire => wire.to[0] === 'OUT')
    .map(wire => [wire.to[1], wire.from]));
  const innerSource = source => source[0] === 'IN' ? outerSource(incoming.get(source[1]))
    : [namespace(source[0]), source[1]];
  const outerSource = source => source[0] === boxId ? innerSource(outgoing.get(source[1])) : clone(source);
  const result = {
    ...clone(diagram),
    boxes: diagram.boxes.flatMap(b => b.id === boxId
      ? inner.boxes.map(child => ({ ...clone(child), id: namespace(child.id) })) : [clone(b)]),
    wires: [
      ...diagram.wires.filter(wire => wire.to[0] !== boxId)
        .map(wire => ({ from: outerSource(wire.from), to: clone(wire.to) })),
      ...inner.wires.filter(wire => wire.to[0] !== 'OUT')
        .map(wire => ({ from: innerSource(wire.from), to: [namespace(wire.to[0]), wire.to[1]] }))
    ]
  };
  const checked = validate(result);
  if (!checked.ok) throw new Error(`Substitution produced an invalid diagram: ${checked.issues.join('; ')}`);
  return result;
}

export function buildDiagram({ expanded = true, fault = 'none', replacement = 'standard' } = {}) {
  const inner = wallingDiagram(replacement);
  let diagram = {
    id: 'Wall_then_roof', expanded, replacement, fault,
    inputs: [...wallInputs().filter(port => port.id !== 'access'), p('access', 'ScRaw', 'Supplied access'),
      p('evidence', 'Evidence', 'Release evidence'), p('roofkit', 'RoofKit', 'Roof materials')],
    outputs: [p('shell', 'Roofed', 'Roofed structural shell'), p('mixer', 'BL', 'Mixer returned'),
      p('builder', 'BL', 'Builder returned'), p('peg', 'P', 'Peg kit returned'),
      p('drawing', 'D', 'Drawing returned'), p('access', 'Sc', 'Access returned')],
    boxes: [
      { id: 'access', label: 'Check supplied access', rule: 'access',
        description: 'Check availability and inspection of supplied access; no access equipment is constructed.',
        inputs: [p('access', 'ScRaw')], outputs: [p('access', 'Sc')] },
      { id: 'walling', label: 'Walling_One_Storey', rule: 'compound',
        description: 'The composite of the worker-instance check, Mix, Set and Build wall, interpreted recursively with exactly this interface.',
        inputs: wallInputs(), outputs: wallOutputs(), diagram: inner },
      { id: 'ready', label: 'Check wall readiness', rule: 'ready',
        description: 'Accept supplied release evidence only when released and matching wall geometry and revision. No curing duration is invented.',
        inputs: [p('wall', 'BuiltWall'), p('evidence', 'Evidence')], outputs: [p('wall', 'ReadyWall')] },
      { id: 'roof', label: 'Fit roof', rule: 'roof',
        description: 'Use ReadyWall, builder, bundled trusses/coverings/fasteners, checked access and drawing. Return the worker, access and drawing. Weatherproofing is outside this model.',
        inputs: [p('wall', 'ReadyWall'), p('builder', 'BL'), p('roofkit', 'RoofKit'), p('access', 'Sc'), p('drawing', 'D')],
        outputs: [p('shell', 'Roofed'), p('builder', 'BL'), p('access', 'Sc'), p('drawing', 'D')] }
    ],
    wires: [
      ...wallInputs().filter(port => port.id !== 'access').map(port => w('IN', port.id, 'walling', port.id)),
      w('IN', 'access', 'access', 'access'), w('access', 'access', 'walling', 'access'),
      w('walling', 'mixer', 'OUT', 'mixer'), w('walling', 'peg', 'OUT', 'peg'),
      w('walling', 'wall', 'ready', 'wall'), w('IN', 'evidence', 'ready', 'evidence'),
      w('ready', 'wall', 'roof', 'wall'), w('walling', 'builder', 'roof', 'builder'),
      w('walling', 'drawing', 'roof', 'drawing'), w('walling', 'access', 'roof', 'access'),
      w('IN', 'roofkit', 'roof', 'roofkit'),
      ...['shell', 'builder', 'drawing', 'access'].map(id => w('roof', id, 'OUT', id))
    ]
  };
  if (expanded) diagram = substitute(diagram, 'walling', inner);
  if (fault === 'duplicate-worker') {
    diagram.wires.find(wire => wire.from[0] === 'IN' && wire.from[1] === 'builder').from = ['IN', 'mixer'];
  } else if (fault === 'missing-wire') {
    diagram.wires = diagram.wires.filter(wire => !(wire.from[0] === 'IN' && wire.from[1] === 'sand'));
  } else if (fault === 'wrong-type') {
    const sand = diagram.wires.find(wire => wire.from[0] === 'IN' && wire.from[1] === 'sand');
    const cement = diagram.wires.find(wire => wire.from[0] === 'IN' && wire.from[1] === 'cement');
    [sand.from, cement.from] = [cement.from, sand.from];
  } else if (fault === 'bypass-readiness') {
    const builtWall = diagram.wires.find(wire => wire.to[0] === 'ready' && wire.to[1] === 'wall').from;
    diagram.wires.find(wire => wire.to[0] === 'roof' && wire.to[1] === 'wall').from = clone(builtWall);
  } else if (fault !== 'none') throw new Error(`Unknown fault: ${fault}`);
  return diagram;
}

/** Syntactic checks do not establish any physical premise or behavioural claim. */
export function validate(diagram, ancestors = new Set()) {
  const issues = [];
  if (!diagram || typeof diagram !== 'object') return { ok: false, issues: ['Diagram must be an object.'], order: [] };
  if (ancestors.has(diagram)) return { ok: false, issues: ['Recursive compound diagram is not finite.'], order: [] };
  const lineage = new Set(ancestors).add(diagram);
  for (const field of ['inputs', 'outputs', 'boxes', 'wires'])
    if (!Array.isArray(diagram[field])) issues.push(`Diagram ${field} must be an array.`);
  if (issues.length) return { ok: false, issues, order: [] };
  const sources = new Map(), targets = new Map(), allEndpoints = new Set(), ids = new Set();
  const ports = (items, node, direction, destination) => {
    if (!Array.isArray(items)) { issues.push(`${node} ${direction} ports must be an array.`); return; }
    const seen = new Set();
    items.forEach(port => {
      if (!port || typeof port.id !== 'string' || !port.id.trim()) {
        issues.push(`${node} has a missing or invalid ${direction} port ID.`); return;
      }
      if (seen.has(port.id)) issues.push(`${node} has duplicate ${direction} port ID ${port.id}.`);
      seen.add(port.id);
      if (!Object.hasOwn(TYPE, port.type)) issues.push(`${node}.${port.id} has unknown type ${String(port.type)}.`);
      const endpoint = key([node, port.id]);
      destination.set(endpoint, { ...port, count: 0 }); allEndpoints.add(endpoint);
    });
  };
  ports(diagram.inputs, 'IN', 'input', sources);
  ports(diagram.outputs, 'OUT', 'output', targets);
  diagram.boxes.forEach(box => {
    if (!box || typeof box.id !== 'string' || !box.id.trim()) { issues.push('Box has a missing or invalid ID.'); return; }
    if (ids.has(box.id)) issues.push(`Duplicate box ID ${box.id}.`);
    if (['IN', 'OUT'].includes(box.id)) issues.push(`Box ID ${box.id} is reserved for the outer boundary.`);
    ids.add(box.id);
    ports(box.inputs, box.id, 'input', targets); ports(box.outputs, box.id, 'output', sources);
    if (box.diagram) {
      if (!sameInterface(box.inputs, box.diagram.inputs) || !sameInterface(box.outputs, box.diagram.outputs))
        issues.push(`${box.id}: compound boundary does not match its declared interface.`);
      const result = validate(box.diagram, lineage);
      issues.push(...result.issues.map(issue => `${box.id}: ${issue}`));
    }
  });
  const adjacency = new Map([...ids].map(id => [id, new Set()]));
  const indegree = new Map([...ids].map(id => [id, 0]));
  diagram.wires.forEach((wire, index) => {
    if (!wire || !Array.isArray(wire.from) || !Array.isArray(wire.to) ||
      wire.from.length !== 2 || wire.to.length !== 2 ||
      [...wire.from, ...wire.to].some(part => typeof part !== 'string')) {
      issues.push(`Wire ${index + 1} has malformed endpoints.`); return;
    }
    const from = key(wire.from), to = key(wire.to);
    const source = sources.get(from), target = targets.get(to);
    if (!source) issues.push(`Wire ${index + 1}: ${wire.from.join('.')} is ${allEndpoints.has(from) ? 'not a source (wrong direction)' : 'a dangling source endpoint'}.`);
    if (!target) issues.push(`Wire ${index + 1}: ${wire.to.join('.')} is ${allEndpoints.has(to) ? 'not a target (wrong direction)' : 'a dangling target endpoint'}.`);
    if (source) source.count++;
    if (target) target.count++;
    if (source && target && source.type !== target.type)
      issues.push(`Type mismatch: ${wire.from.join('.')} (${source.type}) → ${wire.to.join('.')} (${target.type}).`);
    if (source && target && ids.has(wire.from[0]) && ids.has(wire.to[0])) {
      const next = adjacency.get(wire.from[0]);
      if (!next.has(wire.to[0])) { next.add(wire.to[0]); indegree.set(wire.to[0], indegree.get(wire.to[0]) + 1); }
    }
  });
  for (const [kind, endpoints] of [['Source', sources], ['Target', targets]])
    for (const [endpoint, port] of endpoints) if (port.count !== 1)
      issues.push(`${kind} ${JSON.parse(endpoint).join('.')} has ${port.count} attachments; exactly 1 is required.`);
  const queue = [...ids].filter(id => indegree.get(id) === 0), order = [];
  while (queue.length) {
    const id = queue.shift(); order.push(id);
    for (const next of adjacency.get(id)) {
      indegree.set(next, indegree.get(next) - 1);
      if (indegree.get(next) === 0) queue.push(next);
    }
  }
  if (order.length !== ids.size) issues.push('Directed cycle: boxes do not admit an acyclic dependency order.');
  return { ok: issues.length === 0, issues, order };
}

/** Values are finite fixtures. The flags stand for supplied evidence/conditions;
 * they are not measurements, durations, probabilities, or engineering guarantees.
 */
export function scenarioInputs(scenario = {}) {
  const s = { ...DEFAULT_SCENARIO, ...scenario };
  return {
    mixer: { type: 'BL', id: 'mixer-01' },
    builder: { type: 'BL', id: s.sameWorker ? 'mixer-01' : 'builder-02' },
    sand: { type: 'S', id: 'sand-batch' }, cement: { type: 'C', id: 'cement-batch' },
    water: { type: 'H2O', id: 'water-batch', workableMix: s.mortarOK === true },
    bricks: { type: 'B', id: 'bricks-batch' }, lintels: { type: 'Lin', id: 'lintels-batch' },
    peg: { type: 'P', id: 'peg-kit-01' },
    drawing: { type: 'D', id: 'drawing-01', revision: s.revision, geometry: s.geometry, geometryOK: s.geometryOK === true },
    access: { type: 'ScRaw', id: 'access-01', available: s.accessOK === true, inspected: s.accessOK === true },
    evidence: { type: 'Evidence', released: s.released === true, revision: s.evidenceRevision, geometry: s.evidenceGeometry },
    roofkit: { type: 'RoofKit', id: 'roof-kit-01', contents: ['trusses', 'coverings', 'fasteners'], fits: s.roofFits === true }
  };
}

function evaluate(rule, input) {
  const reject = detail => ({ ok: false, detail });
  const accept = (outputs, detail) => ({ ok: true, outputs, detail });
  switch (rule) {
    case 'crew':
      if (!input.mixer.id || !input.builder.id) return reject('Worker resource identities must be supplied.');
      if (input.mixer.id === input.builder.id)
        return reject('Physical premise rejected: mixer and builder must be distinct resource instances. The two BL values alias one worker; equal types do not provide two people.');
      return accept({ mixer: input.mixer, builder: input.builder }, 'Two distinct worker identities admitted and retained; this check is a declared physical premise.');
    case 'access':
      if (!input.access.available || !input.access.inspected)
        return reject('Supplied access is unavailable or lacks accepted inspection evidence.');
      return accept({ access: { ...input.access, type: 'Sc', checked: true } }, 'Supplied access accepted; the same equipment is threaded onward.');
    case 'mix':
      if (!input.water.workableMix) return reject('The supplied mix condition does not admit a workable mortar batch.');
      return accept({ mixer: input.mixer, mortar: { type: 'M', id: 'mortar-batch', workable: true,
        ingredients: [input.sand.id, input.cement.id, input.water.id] } }, 'A workable mortar batch is admitted; mixer retained.');
    case 'set': case 'set-strict':
      if (!['A', 'B'].includes(input.drawing.revision)) return reject('Drawing revision is outside the finite A/B fixture.');
      if (rule === 'set-strict' && input.drawing.revision !== 'B') return reject('This replacement additionally requires drawing revision B.');
      return accept({ builder: input.builder, peg: input.peg, drawing: input.drawing,
        line: { type: 'L', geometry: input.drawing.geometry, revision: input.drawing.revision } },
      'Line identified by the declared drawing geometry and revision; builder, peg kit and drawing retained.');
    case 'wall':
      if (!input.drawing.geometryOK || input.line.geometry !== input.drawing.geometry || input.line.revision !== input.drawing.revision)
        return reject('The model does not accept the wall geometry against this drawing and set-out line.');
      if (!input.mortar.workable || !input.access.checked) return reject('Workable mortar and checked access are required.');
      return accept({ builder: input.builder, peg: input.peg, drawing: input.drawing, access: input.access,
        wall: { type: 'BuiltWall', id: 'wall-assembly-01', geometry: input.drawing.geometry, revision: input.drawing.revision,
          scope: 'whole prepared one-storey wall assembly', materials: [input.bricks.id, input.lintels.id, input.mortar.id] } },
      'Wall assembly admitted; readiness remains to be checked. Builder, peg kit, drawing and access retained.');
    case 'ready':
      if (!input.evidence.released) return reject('No accepted wall-release evidence is supplied.');
      if (input.evidence.geometry !== input.wall.geometry) return reject('Release evidence identifies a different wall geometry.');
      if (input.evidence.revision !== input.wall.revision) return reject('Release evidence identifies a different drawing revision.');
      return accept({ wall: { type: 'ReadyWall', built: input.wall, evidence: input.evidence } },
        'Supplied release evidence matches the wall geometry and revision; no curing time is inferred.');
    case 'roof':
      if (!input.roofkit.fits) return reject('The supplied roof kit does not fit the wall geometry in this fixture.');
      if (!input.access.checked) return reject('Roof fitting requires checked supplied access.');
      if (input.wall.built.geometry !== input.drawing.geometry || input.wall.built.revision !== input.drawing.revision)
        return reject('Roof drawing and ready wall do not agree.');
      return accept({ builder: input.builder, access: input.access, drawing: input.drawing,
        shell: { type: 'Roofed', id: 'shell-01', wall: input.wall.built, roofkit: input.roofkit,
          releaseEvidence: input.wall.evidence, geometry: input.drawing.geometry, revision: input.drawing.revision,
          scope: 'roofed structural shell; weatherproofing outside the model' } },
      'Roofed structural shell admitted; builder, access and drawing retained. Roof materials are installed in the shell.');
    default: return reject(`No relational interpretation is installed for rule ${String(rule)}.`);
  }
}

/** Evaluate the relation for one input assignment. This is dependency evaluation,
 * not a duration, crew allocation, or executable construction schedule.
 */
export function interpret(diagram, inputs) {
  const syntax = validate(diagram);
  if (!syntax.ok) return { ok: false, errors: syntax.issues, trace: [], outputs: {} };
  const values = new Map(), errors = [], trace = [];
  for (const port of diagram.inputs) {
    if (!Object.hasOwn(inputs, port.id)) errors.push(`Missing boundary value ${port.id}.`);
    else if (!inputs[port.id] || inputs[port.id].type !== port.type) errors.push(`Boundary value ${port.id} does not have type ${port.type}.`);
    else values.set(key(['IN', port.id]), inputs[port.id]);
  }
  if (errors.length) return { ok: false, errors, trace, outputs: {} };
  const incoming = new Map(diagram.wires.map(wire => [key(wire.to), wire.from]));
  for (const id of syntax.order) {
    const box = diagram.boxes.find(candidate => candidate.id === id), input = {};
    const missing = [];
    for (const port of box.inputs) {
      const source = key(incoming.get(key([id, port.id])));
      if (!values.has(source)) missing.push(port.label ?? port.id);
      else input[port.id] = values.get(source);
    }
    if (missing.length) {
      trace.push({ id, label: box.label, status: 'blocked', detail: `No witness reached: ${missing.join(', ')}.` });
      continue;
    }
    let result;
    if (box.rule === 'compound') {
      if (!box.diagram) result = { ok: false, detail: 'Compound rule has no internal diagram.' };
      else {
        const inner = interpret(box.diagram, input);
        trace.push(...inner.trace.map(row => ({ ...row, id: `${id}/${row.id}`, nested: true })));
        result = { ok: inner.ok, outputs: inner.outputs,
          detail: inner.ok ? 'Recursive internal composition admits this boundary pair.' : inner.errors.join(' ') || 'Internal relation has no output witness.' };
      }
    } else result = evaluate(box.rule, input);
    if (result.ok) {
      for (const port of box.outputs) {
        if (!Object.hasOwn(result.outputs, port.id) || result.outputs[port.id]?.type !== port.type) {
          result = { ok: false, detail: `Rule did not produce its declared ${port.type} output ${port.id}.` }; break;
        }
      }
    }
    trace.push({ id, label: box.label, status: result.ok ? 'pass' : 'fail', detail: result.detail });
    if (result.ok) for (const port of box.outputs) values.set(key([id, port.id]), result.outputs[port.id]);
    else errors.push(`${box.label}: ${result.detail}`);
  }
  const outputs = {};
  for (const port of diagram.outputs) {
    const source = key(incoming.get(key(['OUT', port.id])));
    if (values.has(source)) outputs[port.id] = values.get(source);
    else if (!errors.length) errors.push(`No witness reaches boundary output ${port.id}.`);
  }
  // A rejected partial relation yields no whole-boundary tuple, even if some
  // independent components produced internal values.
  return { ok: errors.length === 0, errors, trace, outputs: errors.length ? {} : outputs };
}

export function run(diagram, scenario = DEFAULT_SCENARIO) {
  return interpret(diagram, scenarioInputs(scenario));
}

export function finiteScenarios() {
  const result = [];
  const keys = ['accessOK', 'mortarOK', 'geometryOK', 'released', 'roofFits', 'sameWorker'];
  for (let bits = 0; bits < 2 ** keys.length; bits++)
    for (const revision of ['A', 'B']) for (const evidenceRevision of ['A', 'B'])
      result.push({ ...DEFAULT_SCENARIO, ...Object.fromEntries(keys.map((name, index) => [name, Boolean(bits & (1 << index))])), revision, evidenceRevision });
  return result;
}

export function checkEquivalence(replacement = 'standard') {
  const expanded = buildDiagram({ expanded: true, replacement }), collapsed = buildDiagram({ expanded: false, replacement });
  const failures = []; let accepted = 0;
  const scenarios = finiteScenarios();
  for (const scenario of scenarios) {
    const left = run(expanded, scenario), right = run(collapsed, scenario);
    if (left.ok) accepted++;
    if (left.ok !== right.ok || JSON.stringify(left.outputs) !== JSON.stringify(right.outputs)) failures.push(scenario);
  }
  return { ok: failures.length === 0, checked: scenarios.length, accepted, rejected: scenarios.length - accepted, failures };
}
