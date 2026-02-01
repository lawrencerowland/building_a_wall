export default function Sandbox() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-serif text-2xl">Galois Adjoints</h1>
        <p className="font-sans">A practical way to use Galois adjoints (poset adjunctions) in project management is to treat them as a bidirectional translation layer between what you promise and what you must resource.</p>
      </header>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Translation layer</h2>
        <ul className="list-disc pl-6 space-y-1 font-sans">
          <li><strong>Requirements space</strong>: what you want to be true and what you promise.</li>
          <li><strong>Commitments space</strong>: what you must resource, approve, procure, schedule, and mitigate.</li>
        </ul>
        <p className="font-sans">You get two monotone maps that “fit” each other exactly via the adjunction law.</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Core move: define one map, derive the other</h2>
        <div className="space-y-2 font-sans">
          <p><span className="font-semibold">Let</span> P be requirements ordered from easier → harder, and Q be commitments ordered from weaker → stronger (more budget, more time, higher technical scope, higher regulatory readiness, and so on).</p>
          <p><span className="font-semibold">Left adjoint</span> <span className="font-mono">f : Requirements → Commitments</span> maps a requirement to the weakest commitment package that still guarantees it.</p>
          <p><span className="font-semibold">Right adjoint</span> <span className="font-mono">g : Commitments → Requirements</span> maps a commitment package to the strongest requirement level you can safely claim.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Governance test (adjunction law)</h2>
        <p className="font-sans">Your plan/commitment <span className="font-mono">c</span> is sufficient for requirement <span className="font-mono">r</span> iff:</p>
        <ul className="list-disc pl-6 space-y-1 font-sans">
          <li>It dominates the weakest commitment <span className="font-mono">f(r)</span>, so <span className="font-mono">f(r) ⪯ c</span>.</li>
          <li>The requirement sits below what you can safely guarantee, so <span className="font-mono">r ⪯ g(c)</span>.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Where this plugs into monotone co-design thinking</h2>
        <p className="font-sans">Project management lives on trade-offs (performance/scope vs schedule vs cost vs risk). A Galois adjoint gives you a disciplined way to ask:</p>
        <ul className="list-disc pl-6 space-y-1 font-sans">
          <li>“If stakeholders push capacity up one notch, what is the minimum non-decreasing uplift I must impose on signalling, approvals, budget, schedule, or risk controls?”</li>
          <li>“If Treasury caps budget, what’s the strongest deliverable we can still honestly commit to?”</li>
        </ul>
        <p className="font-sans">Feasibility is encoded as inequalities like <span className="font-mono">r ⪯ g(c)</span> or <span className="font-mono">f(r) ⪯ c</span>.</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Critical realism: adjoints exist only if “weakest” exists</h2>
        <p className="font-sans">In real project trade-offs, a minimum commitment is often not unique (classic Pareto trade-off: buy time with money or money with time). That’s why solutions are often antichains (Pareto fronts), not a single least element.</p>
        <ul className="list-disc pl-6 space-y-1 font-sans">
          <li>Use a Galois adjoint when governance forces a single policy-defined notion of “weakest” (like a stage-gate package or a unified budget/schedule index).</li>
          <li>Use MCDP-style set-valued answers when you want to preserve genuine trade-offs (solutions as upper sets or antichains).</li>
        </ul>
      </section>
    </div>
  );
}
