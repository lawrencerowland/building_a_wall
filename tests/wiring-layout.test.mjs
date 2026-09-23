import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDiagram } from '../apps/wall-roof-wiring-smc/model.mjs';
import { layoutDiagram } from '../apps/wall-roof-wiring-smc/layout.mjs';

const key = endpoint => JSON.stringify(endpoint);
function segmentEntersBox(a, b, box) {
  return a[0] === b[0]
    ? a[0] > box.x && a[0] < box.x + box.width && Math.max(a[1], b[1]) > box.y && Math.min(a[1], b[1]) < box.y + box.height
    : a[1] > box.y && a[1] < box.y + box.height && Math.max(a[0], b[0]) > box.x && Math.min(a[0], b[0]) < box.x + box.width;
}
function coincidentLength(a, b, c, d) {
  const horizontal = a[1] === b[1];
  if (horizontal !== (c[1] === d[1])) return 0;
  const fixed = horizontal ? 1 : 0, varying = horizontal ? 0 : 1;
  if (a[fixed] !== c[fixed]) return 0;
  return Math.max(0, Math.min(Math.max(a[varying], b[varying]), Math.max(c[varying], d[varying])) -
    Math.max(Math.min(a[varying], b[varying]), Math.min(c[varying], d[varying])));
}
for (const expanded of [true, false]) {
  for (const fault of ['none', 'duplicate-worker', 'missing-wire', 'wrong-type', 'bypass-readiness']) {
    test(`${expanded ? 'expanded' : 'collapsed'} ${fault}: complete, individual, unobscured wiring`, () => {
      const diagram = buildDiagram({ expanded, fault });
      const layout = layoutDiagram(diagram);
      assert.equal(layout.nodes.length, diagram.boxes.length + 2);
      assert.equal(layout.wires.length, diagram.wires.length);
      const sourcePorts = new Map(), targetPorts = new Map();
      for (const node of layout.nodes) {
        for (const port of node.outputs) sourcePorts.set(key([node.id, port.id]), port);
        for (const port of node.inputs) targetPorts.set(key([node.id, port.id]), port);
        assert(node.x >= 0 && node.y >= 0 && node.x + node.width <= layout.width && node.y + node.height <= layout.height);
      }
      assert.equal(sourcePorts.size + targetPorts.size, expanded ? 62 : 48);
      assert.deepEqual([...sourcePorts].filter(([k]) => JSON.parse(k)[0] === 'IN').map(([, p]) => p.id), diagram.inputs.map(p => p.id));
      assert.deepEqual([...targetPorts].filter(([k]) => JSON.parse(k)[0] === 'OUT').map(([, p]) => p.id), diagram.outputs.map(p => p.id));
      const paths = new Set();
      for (const wire of layout.wires) {
        assert.deepEqual(wire.from, diagram.wires[wire.index].from);
        assert.deepEqual(wire.to, diagram.wires[wire.index].to);
        const source = sourcePorts.get(key(wire.from)), target = targetPorts.get(key(wire.to));
        assert.deepEqual(wire.points[0], [source.x, source.y]);
        assert.deepEqual(wire.points.at(-1), [target.x, target.y]);
        const serialized = JSON.stringify(wire.points);
        assert(!paths.has(serialized), 'Every actual wire has its own route'); paths.add(serialized);
        for (const [x, y] of wire.points) assert(Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= layout.width && y >= 0 && y <= layout.height);
        for (let i = 1; i < wire.points.length; i++) {
          const a = wire.points[i - 1], b = wire.points[i];
          assert(a[0] === b[0] || a[1] === b[1], 'Wire segments are orthogonal');
          for (const box of layout.nodes) assert(!segmentEntersBox(a, b, box), `${key(wire.from)} -> ${key(wire.to)} enters ${box.id}`);
        }
      }
      if (fault === 'none' || fault === 'missing-wire') assert.equal(layout.wires.filter(wire => wire.bad).length, 0);
      if (fault === 'wrong-type' || fault === 'duplicate-worker') assert.equal(layout.wires.filter(wire => wire.bad).length, 2);
      if (fault === 'bypass-readiness') assert(layout.wires.some(wire => wire.bad));
      if (fault === 'none') for (let i = 0; i < layout.wires.length; i++) {
        for (let j = i + 1; j < layout.wires.length; j++) {
          const a = layout.wires[i].points, b = layout.wires[j].points;
          for (let ai = 1; ai < a.length; ai++) for (let bi = 1; bi < b.length; bi++) {
            assert.equal(coincidentLength(a[ai - 1], a[ai], b[bi - 1], b[bi]), 0,
              `Independent wires ${i} and ${j} share a visible segment`);
          }
        }
      }
    });
  }
}
test('strict replacement preserves the same complete geometry and port interface', () => {
  for (const expanded of [true, false]) {
    const standard = layoutDiagram(buildDiagram({ expanded }));
    const strict = layoutDiagram(buildDiagram({ expanded, replacement: 'strict' }));
    assert.deepEqual(strict.wires, standard.wires);
    assert.deepEqual(strict.nodes.map(({ label, ...node }) => node), standard.nodes.map(({ label, ...node }) => node));
  }
});
