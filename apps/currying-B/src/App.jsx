import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [setA, setSetA] = useState(2);
  const [setB, setSetB] = useState(2);
  const [setC, setSetC] = useState(2);
  const [regularMappings, setRegularMappings] = useState([]);
  const [curriedMappings, setCurriedMappings] = useState([]);

  useEffect(() => {
    generateMappings();
  }, [setA, setB, setC]);

  const generateMappings = () => {
    const regular = [];
    for (let a = 1; a <= setA; a++) {
      for (let b = 1; b <= setB; b++) {
        for (let c = 1; c <= setC; c++) {
          regular.push(`(${a},${b}) → ${c}`);
        }
      }
    }
    setRegularMappings(regular);

    const curried = [];
    for (let a = 1; a <= setA; a++) {
      const inner = [];
      for (let b = 1; b <= setB; b++) {
        const cValues = Array.from({ length: setC }, (_, i) => i + 1).join(',');
        inner.push(`${b} → {${cValues}}`);
      }
      curried.push(`${a} → {${inner.join(', ')}}`);
    }
    setCurriedMappings(curried);
  };

  return (
    <div className="app-container">
      <div className="layout">
        <div className="content">
          <h1>Currying Demonstration</h1>

          <div className="selectors">
            <label>Set A
              <select value={setA} onChange={e => setSetA(parseInt(e.target.value))}>
                {[1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
        <label>Set B
          <select value={setB} onChange={e => setSetB(parseInt(e.target.value))}>
            {[1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label>Set C
          <select value={setC} onChange={e => setSetC(parseInt(e.target.value))}>
            {[1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
          </div>

          <div className="grid">
            <div className="card">
              <h3>Regular Function (A × B) → C</h3>
              <p className="count">Total functions: {regularMappings.length}</p>
              <div className="list">
                {regularMappings.map((m, i) => (
              <p key={i}>{m}</p>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Curried Function A → C^B</h3>
          <p className="count">Total functions: {curriedMappings.length * Math.pow(setC, setB)}</p>
          <div className="list">
            {curriedMappings.map((m, i) => (
              <p key={i}>{m}</p>
            ))}
          </div>
            </div>
          </div>

          <p className="explanation">
            This demonstration shows all possible mappings for both the regular and curried functions. Notice that while the representations are different, the total number of possible functions is the same, illustrating the isomorphism between Set(A × B, C) and Set(A, C^B).
          </p>
        </div>
        <img className="side-image" src="../../pics/1.webp" alt="Currying visualization" />
      </div>
    </div>
  );
}
