import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('pushoutVsCoproduct');
  const [expandedSections, setExpandedSections] = useState({
    pushout: true,
    coproduct: true,
    product: true,
    pullback: true
  });

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  const expandAll = () => {
    setExpandedSections({
      pushout: true,
      coproduct: true,
      product: true,
      pullback: true
    });
  };

  const collapseAll = () => {
    setExpandedSections({
      pushout: false,
      coproduct: false,
      product: false,
      pullback: false
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-800">Category Theory: Interactive Comparison</h1>
        <div className="flex space-x-2">
          <button
            onClick={expandAll}
            className="flex items-center text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-1 px-2 rounded"
          >
            <Maximize2 size={16} className="mr-1" />
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="flex items-center text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-1 px-2 rounded"
          >
            <Minimize2 size={16} className="mr-1" />
            Collapse All
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'pushoutVsCoproduct' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('pushoutVsCoproduct')}
          >
            Pushouts vs Coproducts
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'productVsPullback' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('productVsPullback')}
          >
            Products vs Pullbacks
          </button>
        </div>
      </div>

      {activeTab === 'pushoutVsCoproduct' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Pushout Section */}
            <div className="bg-indigo-50 rounded-lg p-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('pushout')}
              >
                <h2 className="text-xl font-semibold text-indigo-700">Pushout</h2>
                {expandedSections.pushout ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {expandedSections.pushout && (
                <div className="mt-4 space-y-4">
                  <div className="bg-white p-4 rounded shadow-sm">
                    <svg viewBox="0 0 400 250" className="w-full">
                      {/* A */}
                      <circle cx="200" cy="50" r="20" fill="#f0f0ff" stroke="#5c6bc0" strokeWidth="2" />
                      <text x="200" y="55" textAnchor="middle" fill="#5c6bc0" fontSize="16">A</text>
                      {/* B */}
                      <circle cx="100" cy="150" r="20" fill="#f0f0ff" stroke="#5c6bc0" strokeWidth="2" />
                      <text x="100" y="155" textAnchor="middle" fill="#5c6bc0" fontSize="16">B</text>
                      {/* C */}
                      <circle cx="300" cy="150" r="20" fill="#f0f0ff" stroke="#5c6bc0" strokeWidth="2" />
                      <text x="300" y="155" textAnchor="middle" fill="#5c6bc0" fontSize="16">C</text>
                      {/* D (Pushout) */}
                      <circle cx="200" cy="220" r="25" fill="#e6e6fa" stroke="#9c27b0" strokeWidth="3" />
                      <text x="200" y="225" textAnchor="middle" fill="#9c27b0" fontSize="16">D</text>
                      {/* Arrows */}
                      <line x1="190" y1="65" x2="110" y2="135" stroke="#5c6bc0" strokeWidth="2" />
                      <polygon points="115,130 110,135 117,137" fill="#5c6bc0" />
                      <text x="130" y="100" textAnchor="middle" fill="#5c6bc0" fontSize="14">f</text>
                      <line x1="210" y1="65" x2="290" y2="135" stroke="#5c6bc0" strokeWidth="2" />
                      <polygon points="285,130 290,135 283,137" fill="#5c6bc0" />
                      <text x="270" y="100" textAnchor="middle" fill="#5c6bc0" fontSize="14">g</text>
                      <line x1="110" y1="165" x2="185" y2="205" stroke="#5c6bc0" strokeWidth="2" />
                      <polygon points="180,200 185,205 178,207" fill="#5c6bc0" />
                      <text x="140" y="195" textAnchor="middle" fill="#5c6bc0" fontSize="14">i</text>
                      <line x1="290" y1="165" x2="215" y2="205" stroke="#5c6bc0" strokeWidth="2" />
                      <polygon points="220,200 215,205 222,207" fill="#5c6bc0" />
                      <text x="260" y="195" textAnchor="middle" fill="#5c6bc0" fontSize="14">j</text>
                    </svg>
                  </div>

                  <div>
                    <h3 className="font-medium text-indigo-800 mb-2">Key Characteristics:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Glues objects along a common part</li>
                      <li>Represents the identification or quotient</li>
                      <li>Involves a "span" from object A to objects B and C</li>
                      <li>The result D is the "smallest" object receiving maps from B and C that make the diagram commute</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-indigo-800 mb-2">Intuition:</h3>
                    <p>Think of a pushout as taking two objects B and C that share a common part A, and gluing them together along that common part.</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-indigo-800 mb-2">Example:</h3>
                    <p>In topology, attaching a 2-cell to a circle along its boundary is a pushout.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Coproduct Section */}
            <div className="bg-pink-50 rounded-lg p-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('coproduct')}
              >
                <h2 className="text-xl font-semibold text-pink-700">Coproduct</h2>
                {expandedSections.coproduct ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {expandedSections.coproduct && (
                <div className="mt-4 space-y-4">
                  <div className="bg-white p-4 rounded shadow-sm">
                    <svg viewBox="0 0 400 250" className="w-full">
                      {/* A */}
                      <circle cx="100" cy="150" r="20" fill="#fff0f5" stroke="#e91e63" strokeWidth="2" />
                      <text x="100" y="155" textAnchor="middle" fill="#e91e63" fontSize="16">A</text>
                      {/* B */}
                      <circle cx="300" cy="150" r="20" fill="#fff0f5" stroke="#e91e63" strokeWidth="2" />
                      <text x="300" y="155" textAnchor="middle" fill="#e91e63" fontSize="16">B</text>
                      {/* A+B (Coproduct) */}
                      <circle cx="200" cy="60" r="25" fill="#ffebee" stroke="#e91e63" strokeWidth="3" />
                      <text x="200" y="65" textAnchor="middle" fill="#e91e63" fontSize="16">A+B</text>
                      {/* Arrows */}
                      <line x1="115" y1="135" x2="185" y2="75" stroke="#e91e63" strokeWidth="2" />
                      <polygon points="180,80 185,75 178,73" fill="#e91e63" />
                      <text x="140" y="115" textAnchor="middle" fill="#e91e63" fontSize="14">i₁</text>
                      <line x1="285" y1="135" x2="215" y2="75" stroke="#e91e63" strokeWidth="2" />
                      <polygon points="220,80 215,75 222,73" fill="#e91e63" />
                      <text x="260" y="115" textAnchor="middle" fill="#e91e63" fontSize="14">i₂</text>
                    </svg>
                  </div>

                  <div>
                    <h3 className="font-medium text-pink-800 mb-2">Key Characteristics:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Forms a disjoint union of objects</li>
                      <li>Represents an "either/or" construction</li>
                      <li>Has injection maps from each component</li>
                      <li>Universal property: any object mapping from A and B factors through A+B</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-pink-800 mb-2">Intuition:</h3>
                    <p>Think of a coproduct as putting two objects A and B "side by side" without any interaction between them.</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-pink-800 mb-2">Example:</h3>
                    <p>In Set, the coproduct is the disjoint union. In programming, it's like a tagged union or sum type.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comparison Section */}
          <div className="bg-gray-50 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Pushout vs Coproduct: Key Differences</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-indigo-100">
                    <th className="py-2 px-4 border-b text-left">Aspect</th>
                    <th className="py-2 px-4 border-b text-left text-indigo-700">Pushout</th>
                    <th className="py-2 px-4 border-b text-left text-pink-700">Coproduct</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-4 border-b font-medium">Starting Point</td>
                    <td className="py-2 px-4 border-b">Span A → B, A → C</td>
                    <td className="py-2 px-4 border-b">Two separate objects A, B</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-2 px-4 border-b font-medium">Relationship</td>
                    <td className="py-2 px-4 border-b">Objects have a common part</td>
                    <td className="py-2 px-4 border-b">Objects are completely separate</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b font-medium">Operation</td>
                    <td className="py-2 px-4 border-b">Gluing along an identification</td>
                    <td className="py-2 px-4 border-b">Disjoint union</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-2 px-4 border-b font-medium">Special Case</td>
                    <td className="py-2 px-4 border-b">When A is initial object, pushout becomes coproduct</td>
                    <td className="py-2 px-4 border-b">Is a pushout from the initial object</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b font-medium">Example in Set</td>
                    <td className="py-2 px-4 border-b">Quotient by an equivalence relation</td>
                    <td className="py-2 px-4 border-b">Disjoint union of sets</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'productVsPullback' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Product Section */}
            <div className="bg-green-50 rounded-lg p-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('product')}
              >
                <h2 className="text-xl font-semibold text-green-700">Product</h2>
                {expandedSections.product ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {expandedSections.product && (
                <div className="mt-4 space-y-4">
                  <div className="bg-white p-4 rounded shadow-sm">
                    <svg viewBox="0 0 400 250" className="w-full">
                      {/* A */}
                      <circle cx="100" cy="150" r="20" fill="#f0fff0" stroke="#4caf50" strokeWidth="2" />
                      <text x="100" y="155" textAnchor="middle" fill="#4caf50" fontSize="16">A</text>
                      {/* B */}
                      <circle cx="300" cy="150" r="20" fill="#f0fff0" stroke="#4caf50" strokeWidth="2" />
                      <text x="300" y="155" textAnchor="middle" fill="#4caf50" fontSize="16">B</text>
                      {/* A×B (Product) */}
                      <circle cx="200" cy="60" r="25" fill="#e8f5e9" stroke="#4caf50" strokeWidth="3" />
                      <text x="200" y="65" textAnchor="middle" fill="#4caf50" fontSize="16">A×B</text>
                      {/* Arrows */}
                      <line x1="185" y1="75" x2="115" y2="135" stroke="#4caf50" strokeWidth="2" />
                      <polygon points="120,130 115,135 122,137" fill="#4caf50" />
                      <text x="140" y="115" textAnchor="middle" fill="#4caf50" fontSize="14">π₁</text>
                      <line x1="215" y1="75" x2="285" y2="135" stroke="#4caf50" strokeWidth="2" />
                      <polygon points="280,130 285,135 278,137" fill="#4caf50" />
                      <text x="260" y="115" textAnchor="middle" fill="#4caf50" fontSize="14">π₂</text>
                    </svg>
                  </div>

                  <div>
                    <h3 className="font-medium text-green-800 mb-2">Key Characteristics:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Combines objects into a pair</li>
                      <li>Represents an "and" construction</li>
                      <li>Has projection maps to each component</li>
                      <li>Universal property: any object mapping to A and B factors through A×B</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-green-800 mb-2">Intuition:</h3>
                    <p>Think of a product as putting two objects A and B "together" to form pairs (a,b) where a is from A and b is from B.</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-green-800 mb-2">Example:</h3>
                    <p>In Set, the product is the cartesian product. In programming, it's like a tuple or record type.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Pullback Section */}
            <div className="bg-amber-50 rounded-lg p-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('pullback')}
              >
                <h2 className="text-xl font-semibold text-amber-700">Pullback</h2>
                {expandedSections.pullback ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {expandedSections.pullback && (
                <div className="mt-4 space-y-4">
                  <div className="bg-white p-4 rounded shadow-sm">
                    <svg viewBox="0 0 400 250" className="w-full">
                      {/* B */}
                      <circle cx="100" cy="150" r="20" fill="#fffaf0" stroke="#ff9800" strokeWidth="2" />
                      <text x="100" y="155" textAnchor="middle" fill="#ff9800" fontSize="16">B</text>
                      {/* C */}
                      <circle cx="300" cy="150" r="20" fill="#fffaf0" stroke="#ff9800" strokeWidth="2" />
                      <text x="300" y="155" textAnchor="middle" fill="#ff9800" fontSize="16">C</text>
                      {/* D */}
                      <circle cx="200" cy="220" r="20" fill="#fffaf0" stroke="#ff9800" strokeWidth="2" />
                      <text x="200" y="225" textAnchor="middle" fill="#ff9800" fontSize="16">D</text>
                      {/* A (Pullback) */}
                      <circle cx="200" cy="60" r="25" fill="#fff3e0" stroke="#ff9800" strokeWidth="3" />
                      <text x="200" y="65" textAnchor="middle" fill="#ff9800" fontSize="16">A</text>
                      {/* Arrows */}
                      <line x1="185" y1="75" x2="115" y2="135" stroke="#ff9800" strokeWidth="2" />
                      <polygon points="120,130 115,135 122,137" fill="#ff9800" />
                      <text x="140" y="115" textAnchor="middle" fill="#ff9800" fontSize="14">p</text>
                      <line x1="215" y1="75" x2="285" y2="135" stroke="#ff9800" strokeWidth="2" />
                      <polygon points="280,130 285,135 278,137" fill="#ff9800" />
                      <text x="260" y="115" textAnchor="middle" fill="#ff9800" fontSize="14">q</text>
                      <line x1="110" y1="165" x2="185" y2="205" stroke="#ff9800" strokeWidth="2" />
                      <polygon points="180,200 185,205 178,207" fill="#ff9800" />
                      <text x="140" y="195" textAnchor="middle" fill="#ff9800" fontSize="14">f</text>
                      <line x1="290" y1="165" x2="215" y2="205" stroke="#ff9800" strokeWidth="2" />
                      <polygon points="220,200 215,205 222,207" fill="#ff9800" />
                      <text x="260" y="195" textAnchor="middle" fill="#ff9800" fontSize="14">g</text>
                    </svg>
                  </div>

                  <div>
                    <h3 className="font-medium text-amber-800 mb-2">Key Characteristics:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Finds the "common part" of objects with respect to a commuting diagram</li>
                      <li>Represents a "fiber product" or "intersection" with respect to maps</li>
                      <li>Involves a "cospan" from objects B and C to object D</li>
                      <li>The result A is the "largest" object with maps to B and C that make the diagram commute</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-amber-800 mb-2">Intuition:</h3>
                    <p>Think of a pullback as finding all pairs (b,c) from B×C that are "compatible" in the sense that f(b) = g(c).</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-amber-800 mb-2">Example:</h3>
                    <p>In Set, the pullback is the set of pairs {"{(b,c) | f(b) = g(c)}"}. In databases, it's like a JOIN operation.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comparison Section */}
          <div className="bg-gray-50 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Product vs Pullback: Key Differences</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-green-100">
                    <th className="py-2 px-4 border-b text-left">Aspect</th>
                    <th className="py-2 px-4 border-b text-left text-green-700">Product</th>
                    <th className="py-2 px-4 border-b text-left text-amber-700">Pullback</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-4 border-b font-medium">Starting Point</td>
                    <td className="py-2 px-4 border-b">Two separate objects A, B</td>
                    <td className="py-2 px-4 border-b">Cospan B → D ← C</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-2 px-4 border-b font-medium">Additional Structure</td>
                    <td className="py-2 px-4 border-b">None</td>
                    <td className="py-2 px-4 border-b">Common target object D</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b font-medium">Operation</td>
                    <td className="py-2 px-4 border-b">Pairing</td>
                    <td className="py-2 px-4 border-b">Constrained pairing</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-2 px-4 border-b font-medium">Special Case</td>
                    <td className="py-2 px-4 border-b">Is a pullback when D is terminal object</td>
                    <td className="py-2 px-4 border-b">When D is terminal object, pullback becomes product</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b font-medium">Example in Set</td>
                    <td className="py-2 px-4 border-b">Cartesian product A × B</td>
                    <td className="py-2 px-4 border-b">{"{(b,c) | f(b) = g(c)}"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Universal Properties and Duality</h3>
        <p className="mb-4">
          These category theory constructions are related through duality. Pushouts are dual to pullbacks, and coproducts are dual to products. This means we can convert between them by reversing all the arrows in the diagrams.
        </p>
        <p>
          Each construction is defined by a universal property that characterizes it as either:
        </p>
        <ul className="list-disc pl-5 mt-2">
          <li><span className="font-medium">Initial object</span> in a category of cones/cocones (Pushout, Coproduct)</li>
          <li><span className="font-medium">Terminal object</span> in a category of cones/cocones (Pullback, Product)</li>
        </ul>
      </div>
    </div>
  );
}
