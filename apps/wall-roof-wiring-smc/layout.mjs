/** Geometry only: every model wire keeps its own route and named end ports. */
export function layoutDiagram(diagram) {
  const expanded = diagram.boxes.some(box => box.id.includes('/'));
  const width = expanded ? 2500 : 2140, height = 1000;
  const positions = expanded ? {
    IN: [30, 220], access: [390, 80], 'walling/crew': [390, 360],
    'walling/mix': [750, 240], 'walling/set': [750, 600],
    'walling/wall': [1110, 370], ready: [1470, 280], roof: [1830, 350], OUT: [2190, 300]
  } : {
    IN: [30, 220], access: [390, 80], walling: [750, 260],
    ready: [1110, 280], roof: [1470, 350], OUT: [1830, 300]
  };
  const definitions = [
    { id: 'IN', label: 'Supplied to the whole composition', inputs: [], outputs: diagram.inputs },
    ...diagram.boxes,
    { id: 'OUT', label: 'Returned by the whole composition', inputs: diagram.outputs, outputs: [] }
  ];
  const nodes = definitions.map(box => {
    const position = positions[box.id];
    if (!position) throw new Error(`No teaching-diagram position for ${box.id}.`);
    const [x, y] = position, nodeWidth = 260;
    const ports = (items, output) => items.map((port, index) => ({ ...port,
      x: x + (output ? nodeWidth : 0), y: y + 70 + index * 32 }));
    return { id: box.id, label: box.label, x, y, width: nodeWidth,
      height: 92 + Math.max(box.inputs.length, box.outputs.length) * 32,
      inputs: ports(box.inputs, false), outputs: ports(box.outputs, true) };
  });
  const sources = new Map(), targets = new Map();
  const endpointKey = endpoint => JSON.stringify(endpoint);
  for (const node of nodes) {
    for (const port of node.outputs) sources.set(endpointKey([node.id, port.id]), port);
    for (const port of node.inputs) targets.set(endpointKey([node.id, port.id]), port);
  }
  const sourceUses = new Map(), targetUses = new Map();
  for (const wire of diagram.wires) {
    for (const [uses, endpoint] of [[sourceUses, wire.from], [targetUses, wire.to]]) {
      const key = endpointKey(endpoint); uses.set(key, (uses.get(key) ?? 0) + 1);
    }
  }
  const router = makeRouter(nodes, width, height);
  const wires = diagram.wires.map((wire, index) => {
    const sourceKey = endpointKey(wire.from), targetKey = endpointKey(wire.to);
    const source = sources.get(sourceKey), target = targets.get(targetKey);
    if (!source || !target) throw new Error(`Cannot draw dangling wire ${index + 1}.`);
    return { index, from: [...wire.from], to: [...wire.to], type: source.type,
      points: router.route(source, target),
      bad: source.type !== target.type || sourceUses.get(sourceKey) !== 1 || targetUses.get(targetKey) !== 1 };
  });
  return { width, height, nodes, wires };
}

function makeRouter(nodes, width, height) {
  const stub = 28, clearance = 16;
  const obstacles = nodes.map(node => ({
    left: node.x - clearance, right: node.x + node.width + clearance,
    top: node.y - clearance, bottom: node.y + node.height + clearance
  }));
  const portStubs = nodes.flatMap(node => [
    ...node.inputs.map(port => ({ y: port.y, left: port.x - stub, right: port.x })),
    ...node.outputs.map(port => ({ y: port.y, left: port.x, right: port.x + stub }))
  ]);
  const xValues = new Set([12, width - 12]), yValues = new Set([12, height - 12]);
  // Quiet routing lanes cover every gap, including paths around intervening boxes.
  for (let x = 12; x < width - 12; x += 24) xValues.add(x);
  for (let y = 12; y < height - 12; y += 24) yValues.add(y);
  for (const node of nodes) {
    xValues.add(node.x - stub); xValues.add(node.x + node.width + stub);
    for (const port of [...node.inputs, ...node.outputs]) yValues.add(port.y);
  }
  for (const rect of obstacles) {
    xValues.add(rect.left); xValues.add(rect.right);
    yValues.add(rect.top); yValues.add(rect.bottom);
  }
  const xs = [...xValues].filter(x => x > 0 && x < width).sort((a, b) => a - b);
  const ys = [...yValues].filter(y => y > 0 && y < height).sort((a, b) => a - b);
  const nx = xs.length, ny = ys.length, size = nx * ny;
  const xIndex = new Map(xs.map((x, i) => [x, i])), yIndex = new Map(ys.map((y, i) => [y, i]));
  const point = index => [xs[index % nx], ys[Math.floor(index / nx)]];
  const indexOf = (x, y) => yIndex.get(y) * nx + xIndex.get(x);
  const inside = (x, y, rect) => x > rect.left && x < rect.right && y > rect.top && y < rect.bottom;
  const valid = new Uint8Array(size);
  for (let index = 0; index < size; index++) {
    const [x, y] = point(index); valid[index] = !obstacles.some(rect => inside(x, y, rect));
  }
  const edgeClear = (a, b) => {
    const [ax, ay] = point(a), [bx, by] = point(b);
    // Keep every short port attachment leg available to that port alone.
    if (ay === by && portStubs.some(leg => ay === leg.y &&
      Math.max(ax, bx) > leg.left && Math.min(ax, bx) < leg.right)) return false;
    return !obstacles.some(rect => ax === bx
      ? ax > rect.left && ax < rect.right && Math.max(ay, by) > rect.top && Math.min(ay, by) < rect.bottom
      : ay > rect.top && ay < rect.bottom && Math.max(ax, bx) > rect.left && Math.min(ax, bx) < rect.right);
  };
  const neighbors = Array.from({ length: size }, () => []);
  for (let a = 0; a < size; a++) if (valid[a]) {
    const ix = a % nx, iy = Math.floor(a / nx);
    for (const b of [ix + 1 < nx ? a + 1 : -1, iy + 1 < ny ? a + nx : -1]) {
      if (b < 0 || !valid[b] || !edgeClear(a, b)) continue;
      const direction = b === a + 1 ? 1 : 2;
      const length = direction === 1 ? xs[ix + 1] - xs[ix] : ys[iy + 1] - ys[iy];
      neighbors[a].push({ next: b, direction, length });
      neighbors[b].push({ next: a, direction, length });
    }
  }
  const usedEdges = new Map(), usedDirections = new Uint8Array(size);
  const edgeKey = (a, b) => a < b ? `${a}:${b}` : `${b}:${a}`;
  return { route(source, target) {
    const start = indexOf(source.x + stub, source.y), end = indexOf(target.x - stub, target.y);
    const costs = new Float64Array(size * 3).fill(Infinity);
    const previous = new Int32Array(size * 3).fill(-1);
    const startState = start * 3; costs[startState] = 0;
    const heap = new MinHeap(); heap.push(startState, 0);
    let found = -1;
    while (heap.length) {
      const [state, score] = heap.pop();
      const at = Math.floor(state / 3), priorDirection = state % 3;
      const [x, y] = point(at);
      const heuristic = Math.abs(x - (target.x - stub)) + Math.abs(y - target.y);
      if (score > costs[state] + heuristic + 0.001 && state !== startState) continue;
      if (at === end) { found = state; break; }
      for (const { next, direction, length } of neighbors[at]) {
        const turn = priorDirection && priorDirection !== direction ? 20 : 0;
        const reused = usedEdges.get(edgeKey(at, next)) ?? 0;
        const crossing = usedDirections[next] && !(usedDirections[next] & direction) ? 12 : 0;
        const cost = costs[state] + length + turn + reused * (length * 10 + 120) + crossing;
        const nextState = next * 3 + direction;
        if (cost >= costs[nextState]) continue;
        costs[nextState] = cost; previous[nextState] = state;
        const [px, py] = point(next);
        heap.push(nextState, cost + Math.abs(px - (target.x - stub)) + Math.abs(py - target.y));
      }
    }
    if (found < 0) throw new Error(`No clear route between (${source.x},${source.y}) and (${target.x},${target.y}).`);
    const route = [];
    for (let state = found; state >= 0; state = previous[state]) route.push(Math.floor(state / 3));
    route.reverse();
    for (let i = 1; i < route.length; i++) {
      const key = edgeKey(route[i - 1], route[i]);
      usedEdges.set(key, (usedEdges.get(key) ?? 0) + 1);
      const a = point(route[i - 1]), b = point(route[i]);
      const direction = a[0] === b[0] ? 2 : 1;
      usedDirections[route[i - 1]] |= direction; usedDirections[route[i]] |= direction;
    }
    const points = [[source.x, source.y], ...route.map(point), [target.x, target.y]];
    return points.filter((p, i) => i === 0 || i === points.length - 1 ||
      !((points[i - 1][0] === p[0] && p[0] === points[i + 1][0]) ||
        (points[i - 1][1] === p[1] && p[1] === points[i + 1][1])));
  } };
}

class MinHeap {
  constructor() { this.items = []; }
  get length() { return this.items.length; }
  push(state, score) {
    const entry = [state, score]; this.items.push(entry);
    let index = this.items.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.items[parent][1] <= score) break;
      this.items[index] = this.items[parent]; index = parent;
    }
    this.items[index] = entry;
  }
  pop() {
    const first = this.items[0], last = this.items.pop();
    if (!this.items.length) return first;
    let index = 0;
    while (index * 2 + 1 < this.items.length) {
      let child = index * 2 + 1;
      if (child + 1 < this.items.length && this.items[child + 1][1] < this.items[child][1]) child++;
      if (this.items[child][1] >= last[1]) break;
      this.items[index] = this.items[child]; index = child;
    }
    this.items[index] = last; return first;
  }
}
