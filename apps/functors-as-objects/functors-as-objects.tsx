import React, { useState } from 'react';
import { ArrowRight, ArrowDown, MoveHorizontal } from 'lucide-react';

const CategoryTheoryVisualization = () => {
  const [activeView, setActiveView] = useState('categories');
  const [showNaturalTransformation, setShowNaturalTransformation] = useState(false);

  // Styles
  const boxStyle = "border-2 rounded-md p-3 flex items-center justify-center text-center font-semibold";
  const categoryBoxStyle = `${boxStyle} border-blue-500 bg-blue-100`;
  const functorBoxStyle = `${boxStyle} border-purple-500 bg-purple-100`;
  const objectBoxStyle = `${boxStyle} border-green-500 bg-green-100`;
  const morphismStyle = "flex items-center justify-center text-gray-700 font-medium";
  const buttonStyle = "px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 font-medium";
  const activeButtonStyle = "px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium";

  return (
    <div className="flex flex-col space-y-8 p-4 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Understanding Functors as Objects</h1>
        <p className="mb-6">This visualization demonstrates how functors can be viewed as both morphisms and objects in different contexts.</p>
        
        <div className="flex space-x-4 justify-center mb-6">
          <button 
            className={activeView === 'categories' ? activeButtonStyle : buttonStyle}
            onClick={() => setActiveView('categories')}
          >
            Functors as Morphisms
          </button>
          <button 
            className={activeView === 'functorCategory' ? activeButtonStyle : buttonStyle}
            onClick={() => setActiveView('functorCategory')}
          >
            Functors as Objects
          </button>
          <button 
            className={activeView === 'arrowCategory' ? activeButtonStyle : buttonStyle}
            onClick={() => setActiveView('arrowCategory')}
          >
            Arrow Category
          </button>
        </div>
      </div>

      {activeView === 'categories' && (
        <div className="flex flex-col space-y-8">
          <h2 className="text-xl font-semibold text-center">Functors as Morphisms in Cat</h2>
          <p className="text-center">In the category Cat, small categories are objects and functors are morphisms between them.</p>
          
          <div className="flex justify-between items-center">
            <div className="w-1/3">
              <div className={categoryBoxStyle}>
                <div>
                  <div className="text-lg mb-2">Category C</div>
                  <div className="flex flex-col space-y-2">
                    <div className={objectBoxStyle}>Object C₁</div>
                    <div className={objectBoxStyle}>Object C₂</div>
                    <div className={morphismStyle}>
                      <ArrowRight size={16} className="mx-1" />
                      Morphisms
                      <ArrowRight size={16} className="mx-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={morphismStyle}>
              <div className="flex flex-col items-center">
                <div>Functor F</div>
                <ArrowRight size={24} />
              </div>
            </div>
            
            <div className="w-1/3">
              <div className={categoryBoxStyle}>
                <div>
                  <div className="text-lg mb-2">Category D</div>
                  <div className="flex flex-col space-y-2">
                    <div className={objectBoxStyle}>Object D₁</div>
                    <div className={objectBoxStyle}>Object D₂</div>
                    <div className={morphismStyle}>
                      <ArrowRight size={16} className="mx-1" />
                      Morphisms
                      <ArrowRight size={16} className="mx-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p>Here, functors map objects to objects and morphisms to morphisms, preserving the structure.</p>
            <p>The functor F takes objects C₁, C₂ from category C and maps them to objects D₁, D₂ in category D.</p>
          </div>
        </div>
      )}

      {activeView === 'functorCategory' && (
        <div className="flex flex-col space-y-8">
          <h2 className="text-xl font-semibold text-center">Functors as Objects in a Functor Category</h2>
          <p className="text-center">In the functor category [C, D], functors from C to D are objects, and natural transformations are morphisms.</p>
          
          <div className="grid grid-cols-3 gap-6">
            <div className={functorBoxStyle}>
              <div>
                <div className="text-lg mb-2">Functor F: C → D</div>
                <div className="text-sm">Maps objects and morphisms</div>
              </div>
            </div>
            
            <div className={functorBoxStyle}>
              <div>
                <div className="text-lg mb-2">Functor G: C → D</div>
                <div className="text-sm">Maps objects and morphisms</div>
              </div>
            </div>
            
            <div className={functorBoxStyle}>
              <div>
                <div className="text-lg mb-2">Functor H: C → D</div>
                <div className="text-sm">Maps objects and morphisms</div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p>These functors are now objects themselves in the functor category [C, D]</p>
            <button 
              className={buttonStyle}
              onClick={() => setShowNaturalTransformation(!showNaturalTransformation)}
            >
              {showNaturalTransformation ? "Hide" : "Show"} Natural Transformation
            </button>
          </div>
          
          {showNaturalTransformation && (
            <div className="flex justify-center items-center space-x-6">
              <div className={functorBoxStyle}>
                <div>Functor F</div>
              </div>
              
              <div className="flex flex-col items-center">
                <div>Natural Transformation α: F ⇒ G</div>
                <MoveHorizontal size={24} />
              </div>
              
              <div className={functorBoxStyle}>
                <div>Functor G</div>
              </div>
            </div>
          )}
          
          {showNaturalTransformation && (
            <div className="text-center">
              <p>A natural transformation α provides a systematic way to transform functor F into functor G.</p>
              <p>It can be thought of as a morphism between functors in the functor category.</p>
            </div>
          )}
        </div>
      )}

      {activeView === 'arrowCategory' && (
        <div className="flex flex-col space-y-8">
          <h2 className="text-xl font-semibold text-center">Arrow Category Example</h2>
          <p className="text-center">The arrow category shows how morphisms in one category become objects in another category.</p>
          
          <div className="flex justify-center space-x-10">
            <div className="flex flex-col items-center">
              <div className="text-lg font-semibold mb-4">Original Category C</div>
              <div className="flex items-center space-x-4">
                <div className={objectBoxStyle}>A</div>
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <ArrowRight size={24} />
                    <span className="mx-2">f</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <ArrowRight size={24} />
                    <span className="mx-2">g</span>
                  </div>
                </div>
                <div className={objectBoxStyle}>B</div>
              </div>
              <div className="mt-2">Morphisms f, g: A → B</div>
            </div>
            
            <ArrowDown size={32} className="mt-20" />
            
            <div className="flex flex-col items-center">
              <div className="text-lg font-semibold mb-4">Arrow Category C↓</div>
              <div className="flex space-x-6">
                <div className={boxStyle + " border-orange-500 bg-orange-100"}>
                  <div>
                    <div className="text-lg mb-2">Morphism f</div>
                    <div className="text-sm">as an object</div>
                  </div>
                </div>
                
                <div className={boxStyle + " border-orange-500 bg-orange-100"}>
                  <div>
                    <div className="text-lg mb-2">Morphism g</div>
                    <div className="text-sm">as an object</div>
                  </div>
                </div>
              </div>
              <div className="mt-4">Now morphisms f and g are objects in the arrow category!</div>
            </div>
          </div>
          
          <div className="text-center bg-gray-100 p-4 rounded-md">
            <p className="font-semibold">Key Insight:</p>
            <p>The arrow category demonstrates that what functions as a morphism in one context can be treated as an object in another.</p>
            <p>Similarly, functors (which are morphisms in Cat) can be treated as objects in functor categories.</p>
          </div>
        </div>
      )}
      
      <div className="mt-8 text-center text-gray-700 border-t pt-4">
        <p>This demonstration illustrates why "it is sensible to take things like functors as objects" - the distinction between objects and morphisms depends on which category we're working in.</p>
      </div>
    </div>
  );
};

export default CategoryTheoryVisualization;