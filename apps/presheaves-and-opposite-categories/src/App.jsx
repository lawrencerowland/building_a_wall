/* eslint-disable react/no-array-index-key */
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * ---------------------------------------------------------------------------
 * 1. CONSTANTS ───────────────────────────────────────────────────────────────
 * ---------------------------------------------------------------------------
 */

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple'];

/** Return “next” colour in palette (simply cycles through list) */
function nextColour(current) {
  const idx = COLORS.indexOf(current);
  return COLORS[(idx + 1) % COLORS.length];
}

/**
 * Data for each example is kept separate so toggling advanced/simple
 * re‑initialises node colours and mapping cleanly.
 */
const EXAMPLES = {
  simple: {
    titleButton: 'Show Advanced Example',
    descriptionG: 'Proper colorings of path P3 (adjacent nodes different colors)',
    descriptionH: 'Proper colorings of edge K2 (endpoints have different colors)',
    /** vertices lie on a 256×256 canvas; edges reference vertex id pairs      */
    graphG: {
      nodes: [
        { id: 'v1', label: 'v1', x: 40,  y: 128, shape: 'circle' },
        { id: 'v2', label: 'v2', x: 128, y: 128, shape: 'circle' },
        { id: 'v3', label: 'v3', x: 216, y: 128, shape: 'circle' },
      ],
      edges: [
        ['v1', 'v2'],
        ['v2', 'v3'],
      ],
      initialColours: { v1: 'red', v2: 'blue', v3: 'red' },
    },
    graphH: {
      nodes: [
        { id: 'w1', label: 'w1', x: 72,  y: 128, shape: 'square' },
        { id: 'w2', label: 'w2', x: 184, y: 128, shape: 'square' },
      ],
      edges: [['w1', 'w2']],
      initialColours: { w1: 'red', w2: 'blue' },
    },
    /** mapping f : G → H                                          */
    mapping: { v1: 'w1', v2: 'w2', v3: 'w1' },
  },

  advanced: {
    titleButton: 'Show Simple Example',
    descriptionG:
      'Any colorings of independent set (no adjacency constraints)',
    descriptionH: 'Any single color',
    graphG: {
      nodes: [
        { id: 'v1', label: 'v1', x: 72,  y: 128, shape: 'circle' },
        { id: 'v2', label: 'v2', x: 184, y: 128, shape: 'circle' },
      ],
      edges: [], // independent set
      initialColours: { v1: 'green', v2: 'green' },
    },
    graphH: {
      nodes: [{ id: 'w1', label: 'w1', x: 128, y: 128, shape: 'square' }],
      edges: [],
      initialColours: { w1: 'blue' },
    },
    mapping: { v1: 'w1', v2: 'w1' },
  },
};

/**
 * ---------------------------------------------------------------------------
 * 2. REUSABLE SMALL COMPONENTS ───────────────────────────────────────────────
 * ---------------------------------------------------------------------------
 */

/** A coloured node rendered as circle or square, clickable to change colour */
function Node({ node, colour, onClick }) {
  const common =
    'absolute flex flex-col items-center justify-center cursor-pointer select-none';
  const size = 36;
  const shapeClass =
    node.shape === 'circle' ? 'rounded-full' : 'rounded-md border border-gray-900';
  return (
    <div
      style={{
        width: size,
        height: size,
        left: node.x - size / 2,
        top: node.y - size / 2,
        backgroundColor: colour,
      }}
      className={`${common} ${shapeClass}`}
      onClick={() => onClick(node.id)}
      title={`Click to change colour of ${node.id}`}
    >
      {/* empty: purely decorative */}
      <span className="sr-only">{node.id}</span>
      <div className="text-xs mt-10">{/* reserve space for label */}</div>
    </div>
  );
}

/** Simple SVG connecting two vertices */
function Edge({ from, to }) {
  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke="black"
      strokeWidth="2"
    />
  );
}

/** Graph container, 256×256 canvas, with nodes & edges rendered */
function Graph({ graph, colours, onNodeColourChange }) {
  const { nodes, edges } = graph;
  return (
    <div className="relative w-64 h-64">
      <svg
        className="absolute left-0 top-0"
        width="256"
        height="256"
        viewBox="0 0 256 256"
      >
        {edges.map(([a, b], i) => {
          const from = nodes.find((n) => n.id === a);
          const to = nodes.find((n) => n.id === b);
          return <Edge key={i} from={from} to={to} />;
        })}
      </svg>

      {nodes.map((node) => (
        <Node
          key={node.id}
          node={node}
          colour={colours[node.id]}
          onClick={onNodeColourChange}
        />
      ))}

      {/* Labels below nodes for clarity */}
      {nodes.map((node) => (
        <div
          key={`${node.id}-label`}
          style={{ left: node.x - 12, top: node.y + 24 }}
          className="absolute text-sm font-medium"
        >
          {node.label}
        </div>
      ))}
    </div>
  );
}

/**
 * ---------------------------------------------------------------------------
 * 3. MAIN COMPONENT ──────────────────────────────────────────────────────────
 * ---------------------------------------------------------------------------
 */

export default function App() {
  /** which example? false = simple, true = advanced */
  const [advanced, setAdvanced] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const exampleKey = advanced ? 'advanced' : 'simple';
  const EX = EXAMPLES[exampleKey];

  // node colours as state – separate dictionaries for G and H
  const [colG, setColG] = useState(EX.graphG.initialColours);
  const [colH, setColH] = useState(EX.graphH.initialColours);

  /** Resets colours when toggling examples */
  function toggleExample() {
    const nextAdvanced = !advanced;
    const nextKey = nextAdvanced ? 'advanced' : 'simple';
    const NEXT = EXAMPLES[nextKey];
    setAdvanced(nextAdvanced);
    setColG(NEXT.graphG.initialColours);
    setColH(NEXT.graphH.initialColours);
  }

  /** Click node => cycle to next colour */
  function changeColourG(id) {
    setColG((prev) => ({ ...prev, [id]: nextColour(prev[id]) }));
  }
  function changeColourH(id) {
    setColH((prev) => ({ ...prev, [id]: nextColour(prev[id]) }));
  }

  /**
   * Attempt push‑forward: derive H‑colouring from current G colouring.
   * 1. Each H vertex receives colours of its G preimage.
   * 2. If multiple G vertices map to same H vertex, they must share colour.
   * 3. Adjacent H vertices must have distinct colours to be proper.
   */
  function tryPushForward() {
    const newColoursH = {};
    // 1+2: gather & consistency check
    for (const [g, h] of Object.entries(EX.mapping)) {
      if (newColoursH[h] && newColoursH[h] !== colG[g]) {
        alert(
          `Push‑forward failed: vertices mapping to ${h} have different colours.`,
        );
        return;
      }
      newColoursH[h] = colG[g];
    }

    // 3: check H adjacency if any
    const { edges } = EX.graphH;
    for (const [a, b] of edges) {
      if (newColoursH[a] === newColoursH[b]) {
        alert(
          `Push‑forward failed: adjacent vertices ${a} and ${b} share colour ${newColoursH[a]}.`,
        );
        return;
      }
    }

    // success
    setColH((prev) => ({ ...prev, ...newColoursH }));
  }

  /** Pull‑back always works – copy colour of image f(g) to g */
  function pullBackColouring() {
    const newColoursG = {};
    for (const [g, h] of Object.entries(EX.mapping)) {
      newColoursG[g] = colH[h];
    }
    setColG((prev) => ({ ...prev, ...newColoursG }));
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-4">
        Presheaf Visualization
      </h1>

      {/* Collapsible explanation panel */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <button
          className="w-full text-left flex justify-between items-center bg-indigo-50 px-3 py-2 rounded-md font-semibold"
          onClick={() => setShowExplanation((s) => !s)}
        >
          <span>Why are presheaves a functor from the Opposite category?</span>
          <span className="flex items-center">
            <span className="mr-2 text-sm text-indigo-700">
              {showExplanation ? 'Hide explanation' : 'Show explanation'}
            </span>
            {showExplanation ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </span>
        </button>
        {showExplanation && (
          <div className="mt-2 text-sm text-gray-700">
            <p className="mb-2">
              This interactive visualization demonstrates how presheaves work
              using node colorings of graphs. We use valid graph homomorphisms
              that preserve adjacency relationships.
            </p>
            <p className="mb-2">
              A presheaf <em>F</em> assigns to each graph <em>G</em> a set{' '}
              <em>F(G)</em> of proper node colorings (adjacent nodes have
              different colors). For a morphism <em>f : G → H</em>, the
              presheaf gives a function{' '}
              <em>
                F(f): F(H) → F(G)
              </em>{' '}
              that pulls back colorings from <em>H</em> to <em>G</em>.
            </p>
            <p>
              <strong>Try it:</strong> Click on nodes to change their colors,
              then use the buttons to see how the morphism and presheaf
              operations work.
            </p>
          </div>
        )}
      </div>

      {/* Toggle simple / advanced */}
      <div className="flex justify-center mb-6">
        <button
          onClick={toggleExample}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white shadow hover:bg-indigo-700"
        >
          {advanced ? 'Show Simple Example' : 'Show Advanced Example'}
        </button>
      </div>

      {/* Main three‑column layout */}
      <div className="flex flex-wrap justify-center gap-8">
        {/* GRAPH G */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
          <Graph
            graph={EX.graphG}
            colours={colG}
            onNodeColourChange={changeColourG}
          />
          <h3 className="text-lg font-semibold mt-4 mb-1">Graph G</h3>
          <p className="text-sm text-center">
            <strong>F(G):</strong> Set of Colorings
            <br />
            {EX.descriptionG}
          </p>
        </div>

        {/* CATEGORY PANELS (middle column) */}
        <div className="flex flex-col items-center gap-6">
          {/* Original category */}
          <div className="bg-white p-4 w-56 rounded-lg shadow-lg text-center">
            <h4 className="font-semibold">Original Category</h4>
            <p className="text-sm my-1">
              <em>f: G → H</em>
            </p>
            <button
              onClick={tryPushForward}
              className="px-3 py-1 bg-teal-600 text-white text-sm rounded shadow hover:bg-teal-700 my-2"
            >
              Try Push Forward
            </button>
            <p className="text-sm">
              {Object.entries(EX.mapping)
                .map(([g, h]) => `${g}→${h}`)
                .join(', ')}
            </p>
          </div>

          {/* Opposite category */}
          <div className="bg-white p-4 w-56 rounded-lg shadow-lg text-center">
            <h4 className="font-semibold">Opposite Category</h4>
            <p className="text-sm my-1">
              <em>F(f): F(H) → F(G)</em>
            </p>
            <button
              onClick={pullBackColouring}
              className="px-3 py-1 bg-sky-600 text-white text-sm rounded shadow hover:bg-sky-700 my-2"
            >
              Pull Back Coloring
            </button>
            <p className="text-sm">Always works! F(f): F(H) → F(G)</p>
          </div>
        </div>

        {/* GRAPH H */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
          <Graph
            graph={EX.graphH}
            colours={colH}
            onNodeColourChange={changeColourH}
          />
          <h3 className="text-lg font-semibold mt-4 mb-1">Graph H</h3>
          <p className="text-sm text-center">
            <strong>F(H):</strong> Set of Colorings
            <br />
            {EX.descriptionH}
          </p>
        </div>
      </div>
    </div>
  );
}
