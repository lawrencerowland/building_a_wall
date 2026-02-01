import React, { useState } from 'react';
import './App.css';

export default function App() {
  const [activeDialog, setActiveDialog] = useState(null);

  const explanations = {
    abstract: {
      title: 'Abstract Design Domain',
      description:
        'The source category containing core conceptual designs and their relationships. This represents the pure architectural patterns before any specific implementation decisions are materialised.'
    },
    functors: {
      title: 'Functors (Structure-Preserving Maps)',
      description:
        'Functors F₁ and F₂ translate abstract designs into concrete implementations whilst preserving structural relationships. They ensure that the essential properties of your design are maintained across different representations.'
    },
    natural: {
      title: 'Natural Transformation',
      description:
        'A family of mappings that connect different implementation models whilst respecting the underlying structure. This allows us to transform between different views of the system whilst maintaining consistency with the original design.'
    },
    modelA: {
      title: 'Implementation Model A',
      description:
        'A concrete realisation of the abstract design, such as a computational model focused on performance characteristics.'
    },
    modelB: {
      title: 'Implementation Model B',
      description:
        'An alternative implementation model, perhaps focusing on different aspects like data flow or resource utilisation.'
    }
  };

  const InfoDialog = ({ isOpen, onClose, title, description }) => {
    if (!isOpen) return null;
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="bg-white p-4 rounded shadow max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-semibold mb-2">{title}</h2>
          <p className="text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative w-full h-screen max-h-[600px] bg-white"
      onClick={() => setActiveDialog(null)}
    >
      <svg className="w-full h-full" viewBox="0 0 800 400">
        <defs>
          <circle id="concept-circle" r="40" fill="#f0f9ff" stroke="#3b82f6" strokeWidth="2" />
          <rect id="model-box" width="70" height="70" fill="#f0fdf4" stroke="#16a34a" strokeWidth="2" />
          <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
          </marker>
          <marker id="natural-arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b5cf6" />
          </marker>
        </defs>

        <text x="400" y="40" textAnchor="middle" fontSize="24" fill="#1e293b" className="font-sans">
          Design to Implementation Mapping
        </text>

        {/* Abstract Design Circle - Clickable */}
        <g
          transform="translate(200,200)"
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setActiveDialog('abstract');
          }}
        >
          <use href="#concept-circle" />
          <text x="0" y="0" textAnchor="middle" fontSize="14" fill="#1e293b">
            Abstract
          </text>
          <text x="0" y="20" textAnchor="middle" fontSize="14" fill="#1e293b">
            Design
          </text>
        </g>

        {/* Implementation Models - Clickable */}
        <g
          transform="translate(600,120)"
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setActiveDialog('modelA');
          }}
        >
          <use href="#model-box" />
          <text x="35" y="35" textAnchor="middle" fontSize="14" fill="#1e293b">
            Model A
          </text>
        </g>

        <g
          transform="translate(600,280)"
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setActiveDialog('modelB');
          }}
        >
          <use href="#model-box" />
          <text x="35" y="35" textAnchor="middle" fontSize="14" fill="#1e293b">
            Model B
          </text>
        </g>

        {/* Functors - Clickable */}
        <g
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setActiveDialog('functors');
          }}
        >
          <path d="M 245 185 L 590 120" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)" fill="none" />
          <path d="M 245 215 L 590 315" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)" fill="none" />
          <text x="380" y="140" textAnchor="middle" fill="#6b7280" fontSize="14">
            Functor F₁
          </text>
          <text x="380" y="280" textAnchor="middle" fill="#6b7280" fontSize="14">
            Functor F₂
          </text>
        </g>

        {/* Natural Transformation - Clickable */}
        <g
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setActiveDialog('natural');
          }}
        >
          <path
            d="M 635 195 L 635 275"
            stroke="#8b5cf6"
            strokeWidth="3"
            strokeDasharray="5,5"
            markerEnd="url(#natural-arrowhead)"
            fill="none"
          />
          <text x="670" y="235" textAnchor="start" fill="#8b5cf6" fontSize="14">
            Natural
          </text>
          <text x="670" y="255" textAnchor="start" fill="#8b5cf6" fontSize="14">
            Transformation
          </text>
        </g>

        {/* Legend */}
        <g transform="translate(50,350)">
          <text x="0" y="0" fontSize="12" fill="#475569">
            Legend:
          </text>
          <line x1="0" y1="20" x2="40" y2="20" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <text x="50" y="25" fontSize="12" fill="#475569">
            Functor (Structure-Preserving Map)
          </text>
          <line
            x1="0"
            y1="45"
            x2="40"
            y2="45"
            stroke="#8b5cf6"
            strokeWidth="3"
            strokeDasharray="5,5"
            markerEnd="url(#natural-arrowhead)"
          />
          <text x="50" y="50" fontSize="12" fill="#475569">
            Natural Transformation (Model Bridge)
          </text>
        </g>
      </svg>
      <p className="text-center text-sm text-gray-600 mt-2">
        Click nodes and edges to see remarks.
      </p>

      {/* Info Dialog */}
      <InfoDialog
        isOpen={!!activeDialog}
        onClose={() => setActiveDialog(null)}
        title={activeDialog ? explanations[activeDialog].title : ''}
        description={activeDialog ? explanations[activeDialog].description : ''}
      />
    </div>
  );
}
