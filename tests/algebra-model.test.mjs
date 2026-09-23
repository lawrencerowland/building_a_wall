import test from 'node:test';
import assert from 'node:assert/strict';
import {relation,compose,tensor,identity,symmetry,equal,outputsFor,booleanRelations,finiteLawChecks,DEFAULT_CONTRACT,contractScenario,contractPredicate} from '../apps/wiring-algebra/model.mjs';
const bools=[[false],[true]], all=booleanRelations();
const has=(r,x,y)=>r.pairs.some(([a,b])=>JSON.stringify(a)===JSON.stringify(x)&&JSON.stringify(b)===JSON.stringify(y));
test('serial composition is existential, preserves branching and removes duplicate witnesses',()=>{
  const f=relation(['X'],['Y'],[[['start'],['a']],[['start'],['b']],[['dead'],['c']]]);
  const g=relation(['Y'],['Z'],[[['a'],['done']],[['b'],['done']],[['b'],['again']]]);
  const composed=compose(f,g);
  assert.deepEqual(outputsFor(composed,['start']),[['again'],['done']]);
  assert.deepEqual(outputsFor(composed,['dead']),[]);
  assert.equal(composed.pairs.length,2);
});
test('serial type mismatch and malformed tuples are rejected',()=>{
  assert.throws(()=>compose(relation(['X'],['Y'],[]),relation(['Z'],['T'],[])),/types/);
  assert.throws(()=>relation(['X'],['Y'],[[[0,1],[2]]]),/tuple/);
  assert.throws(()=>relation(['X'],['Y'],[[[Infinity],[0]]]),/tuple/);
});
test('all 16 Boolean relations compose according to independent predicate enumeration',()=>{
  for(const f of all)for(const g of all)for(const [x] of bools)for(const [z] of bools){
    const expected=[false,true].some(y=>has(f,[x],[y])&&has(g,[y],[z]));
    assert.equal(has(compose(f,g),[x],[z]),expected);
  }
});
test('unit and associativity hold for every Boolean relation, including empty and nondeterministic ones',()=>{
  const id=identity(['Bool'],bools);
  for(const f of all){assert.ok(equal(compose(f,id),f));assert.ok(equal(compose(id,f),f));
    for(const g of all)for(const h of all)assert.ok(equal(compose(compose(f,g),h),compose(f,compose(g,h))));
  }
});
test('tensor has independent pair membership and a singleton empty-tuple unit',()=>{
  const unit=identity([],[[]]);
  for(const f of all)for(const g of all){
    const product=tensor(f,g);assert.ok(equal(tensor(f,unit),f));assert.ok(equal(tensor(unit,f),f));
    for(const [x] of bools)for(const [u] of bools)for(const [y] of bools)for(const [v] of bools)
      assert.equal(has(product,[x,u],[y,v]),has(f,[x],[y])&&has(g,[u],[v]));
  }
});
test('symmetry swaps unequal typed domains and is its own reversed inverse',()=>{
  const xs=[['a'],['b']],ys=[[1],[2],[3]];
  const swap=symmetry(['Letter'],['Number'],xs,ys),back=symmetry(['Number'],['Letter'],ys,xs);
  assert.deepEqual(outputsFor(swap,['b',3]),[[3,'b']]);
  assert.ok(equal(compose(swap,back),identity(['Letter','Number'],xs.flatMap(x=>ys.map(y=>[...x,...y])))));
});
test('six genuinely different relation fixtures satisfy the displayed finite law comparisons',()=>{
  assert.deepEqual(finiteLawChecks(),{units:6,regroupings:216,symmetries:37,interchanges:1296});
});
test('wall/roof witness exists at equality, fails when either flag/capacity fails, and never permits false',()=>{
  const exact={...DEFAULT_CONTRACT,load:100,capR:150,capW:150};
  assert.deepEqual(contractScenario(exact).allowedOutputs,[true]);
  assert.deepEqual(contractScenario({...exact,load:100.01}).allowedOutputs,[]);
  for(const variant of [{flagR:false},{flagW:false},{capR:149},{capW:149}])assert.deepEqual(contractScenario({...exact,...variant}).allowedOutputs,[]);
  assert.equal(contractPredicate(exact,false),false);
});
test('existential predicates agree with the eliminated bound over 972 varied scenarios',()=>{
  let count=0;
  for(const load of [0,1,2])for(const capR of [0,1,3])for(const capW of [0,1,3])
  for(const gammaR of [.5,1,2])for(const gammaW of [.5,1,2])for(const flagR of [false,true])for(const flagW of [false,true]){
    const p={load,capR,capW,gammaR,gammaW,flagR,flagW};
    const expected=flagR&&flagW&&load<=Math.min(capR/gammaR,capW/gammaW);
    assert.equal(contractPredicate(p,true),expected);assert.equal(contractPredicate(p,false),false);
    assert.equal(contractScenario(p).diagnostic,expected);count++;
  }
  assert.equal(count,972);
});
test('invalid numerical domains and non-Boolean flags do not produce stale results',()=>{
  for(const bad of [{load:-1},{capR:NaN},{capW:Infinity},{gammaR:0},{gammaW:-1},{flagR:'true'}])assert.throws(()=>contractScenario({...DEFAULT_CONTRACT,...bad}));
  assert.deepEqual(contractScenario({...DEFAULT_CONTRACT,load:0,capR:0,capW:0}).allowedOutputs,[true]);
});
