/** Finite relations for an illustrative algebra of typed, acyclic wiring.
 * Composition is existential matching; tensor is independent juxtaposition.
 * A record is not a construction specification or a theorem prover.
 */
const key = value => JSON.stringify(value);
const same = (a, b) => key(a) === key(b);
const scalar = x => typeof x === 'boolean' || typeof x === 'string' || (typeof x === 'number' && Number.isFinite(x));
export function relation(inputs, outputs, pairs) {
  if (![...inputs, ...outputs].every(t => typeof t === 'string' && t.length)) throw new TypeError('Types must be nonempty names.');
  const entries = new Map();
  for (const pair of pairs) {
    if (!Array.isArray(pair) || pair.length !== 2 || !Array.isArray(pair[0]) || !Array.isArray(pair[1]) ||
        pair[0].length !== inputs.length || pair[1].length !== outputs.length || !pair.flat().every(scalar))
      throw new TypeError('A relation pair must match its declared input/output tuple.');
    entries.set(key(pair), [pair[0].slice(), pair[1].slice()]);
  }
  return { inputs: inputs.slice(), outputs: outputs.slice(), pairs: [...entries.values()].sort((a,b) => key(a).localeCompare(key(b))) };
}
/** compose(f,g) means g after f, conventionally g ∘ f. */
export function compose(f, g) {
  if (!same(f.outputs, g.inputs)) throw new TypeError('Composition requires identical ordered port types.');
  const pairs = [];
  for (const [x,y] of f.pairs) for (const [y2,z] of g.pairs) if (same(y,y2)) pairs.push([x,z]);
  return relation(f.inputs, g.outputs, pairs);
}
export function tensor(f, g) {
  return relation([...f.inputs,...g.inputs], [...f.outputs,...g.outputs],
    f.pairs.flatMap(([x,y]) => g.pairs.map(([u,v]) => [[...x,...u],[...y,...v]])));
}
export const identity = (types, tuples) => relation(types, types, tuples.map(t => [t,t]));
export const symmetry = (aTypes,bTypes,aTuples,bTuples) => relation([...aTypes,...bTypes],[...bTypes,...aTypes],
  aTuples.flatMap(a => bTuples.map(b => [[...a,...b],[...b,...a]])));
export const equal = (f,g) => same(f.inputs,g.inputs) && same(f.outputs,g.outputs) && same(f.pairs,g.pairs);
export const outputsFor = (f,input) => f.pairs.filter(([x]) => same(x,input)).map(([,y]) => y);
export function booleanRelations() {
  const pairs = [[[false],[false]],[[false],[true]],[[true],[false]],[[true],[true]]];
  return Array.from({length:16},(_,mask) => relation(['Bool'],['Bool'],pairs.filter((_,i) => mask & (1<<i))));
}
export function finiteLawChecks() {
  const all = booleanRelations();
  const fixtures = [all[0], all[1], all[6], all[9], all[11], all[15]];
  const tuples = [[false],[true]], id = identity(['Bool'], tuples);
  let units=0, regroupings=0, interchanges=0, symmetries=0;
  for (const f of fixtures) {
    if (!equal(compose(id,f),f) || !equal(compose(f,id),f)) throw Error('Unit check failed.'); units++;
    for (const g of fixtures) for (const h of fixtures) {
      if (!equal(compose(compose(f,g),h),compose(f,compose(g,h)))) throw Error('Associativity check failed.'); regroupings++;
    }
  }
  for (const f of fixtures) for (const g of fixtures) for (const h of fixtures) for (const k of fixtures) {
    if (!equal(tensor(compose(f,g),compose(h,k)),compose(tensor(f,h),tensor(g,k)))) throw Error('Interchange check failed.'); interchanges++;
  }
  const swap = symmetry(['Bool'],['Bool'],tuples,tuples);
  const pairTuples=tuples.flatMap(a=>tuples.map(b=>[...a,...b]));
  if (!equal(compose(swap,swap),identity(['Bool','Bool'],pairTuples))) throw Error('Symmetry inverse check failed.'); symmetries++;
  for (const f of fixtures) for (const g of fixtures) {
    if (!equal(compose(tensor(f,g),swap),compose(swap,tensor(g,f)))) throw Error('Symmetry naturality check failed.'); symmetries++;
  }
  return {units,regroupings,symmetries,interchanges};
}
export const DEFAULT_CONTRACT = Object.freeze({load:80,capR:140,capW:220,gammaR:1.5,gammaW:1.5,flagR:true,flagW:true});
export function contractScenario(p) {
  for (const name of ['load','capR','capW']) if (!Number.isFinite(p[name]) || p[name]<0) throw new RangeError('Load and capacities must be finite, nonnegative numbers.');
  for (const name of ['gammaR','gammaW']) if (!Number.isFinite(p[name]) || p[name]<=0) throw new RangeError('Both factors must be finite and strictly positive.');
  for (const name of ['flagR','flagW']) if (typeof p[name]!=='boolean') throw new TypeError('The two supplied flags must be Boolean.');
  const reaction=p.load, needR=p.gammaR*p.load, needW=p.gammaW*reaction;
  if (![needR,needW].every(Number.isFinite)) throw new RangeError('Numbers are too large for this calculation.');
  const roof=p.flagR && p.capR>=needR, wall=p.flagW && p.capW>=needW;
  const maxR=p.capR/p.gammaR,maxW=p.capW/p.gammaW;
  if (![maxR,maxW].every(Number.isFinite)) throw new RangeError('Numbers are too large for this calculation.');
  return {reaction,needR,needW,maxR,maxW,bound:Math.min(maxR,maxW),roof,wall,
    diagnostic:roof && wall,allowedOutputs:roof && wall ? [true] : [],
    witness:roof && wall ? {r:reaction,okR:true,okW:true} : null};
}
/** Independent existential check: enumerate internal booleans after r=S. */
export function contractPredicate(p,output) {
  contractScenario(p); // validates the numerical domain
  for (const okR of [false,true]) for (const okW of [false,true]) {
    const r=p.load;
    if (p.flagR && r===p.load && p.capR>=p.gammaR*p.load && okR===true &&
        p.flagW && p.capW>=p.gammaW*r && okW===true && output===(okR && okW)) return true;
  }
  return false;
}
