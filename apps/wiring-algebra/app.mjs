import {DEFAULT_CONTRACT,contractScenario,finiteLawChecks,relation,outputsFor} from './model.mjs';
const $ = id => document.getElementById(id);
const numberNames=['load','capR','capW','gammaR','gammaW'];
const fmt=n=>Number.isInteger(n)?String(n):n.toLocaleString('en-GB',{maximumFractionDigits:3});
function readScenario(){
  return Object.fromEntries([...numberNames.map(id=>[id,$(id).value.trim()===''?NaN:Number($(id).value)]),['flagR',$('flagR').checked],['flagW',$('flagW').checked]]);
}
function updateScenario(){
  const p=readScenario(), panel=$('scenarioResult');
  try{
    const r=contractScenario(p);
    panel.classList.toggle('bad',!r.diagnostic);
    panel.replaceChildren();
    const heading=document.createElement('h3');
    heading.textContent=r.diagnostic?'A permitted result exists':'No permitted result for these inputs';
    const text=document.createElement('p');
    text.textContent=r.diagnostic?`Allowed output set: {true}. Internal witness: r = ${fmt(r.reaction)} U, ok_R = true, ok_W = true.`:`Allowed output set: ∅. ${!r.roof?'The roof predicate fails. ':''}${!r.wall?'The wall predicate fails. ':''}The separate diagnostic returns false.`;
    panel.append(heading,text);
    $('maxR').textContent=`${fmt(r.maxR)} U`; $('maxW').textContent=`${fmt(r.maxW)} U`; $('bound').textContent=`${fmt(r.bound)} U`;
    $('derivation').textContent=`Reaction: r = S = ${fmt(p.load)} U\nRoof: ${fmt(p.capR)} ≥ ${fmt(p.gammaR)} × ${fmt(p.load)} = ${fmt(r.needR)}; flag_R = ${p.flagR} → ${r.roof}\nWall: ${fmt(p.capW)} ≥ ${fmt(p.gammaW)} × ${fmt(r.reaction)} = ${fmt(r.needW)}; flag_W = ${p.flagW} → ${r.wall}\nBoundary: ${fmt(p.load)} ≤ min(${fmt(p.capR)}/${fmt(p.gammaR)}, ${fmt(p.capW)}/${fmt(p.gammaW)})\nJoint bound = ${fmt(r.bound)} U; both supplied flags = ${p.flagR && p.flagW}\nTotal diagnostic output = ${r.diagnostic}; acceptance relation outputs = ${r.diagnostic?'{true}':'∅'}`;
  }catch(error){
    panel.classList.add('bad'); panel.textContent=`No calculation: ${error.message}`;
    for(const id of ['maxR','maxW','bound'])$(id).textContent='—';
    $('derivation').textContent='Correct the inputs to obtain a new result. The previous calculation is not retained.';
  }
}
function setScenario(values){
  for(const name of numberNames)$(name).value=values[name];
  $('flagR').checked=values.flagR; $('flagW').checked=values.flagW; updateScenario();
}
$('scenario').addEventListener('input',updateScenario);
$('scenario').addEventListener('submit',event=>event.preventDefault());
$('reset').addEventListener('click',()=>setScenario(DEFAULT_CONTRACT));
$('edge').addEventListener('click',()=>setScenario({...DEFAULT_CONTRACT,load:100,capR:150,capW:150}));
$('fail').addEventListener('click',()=>setScenario({...DEFAULT_CONTRACT,capW:100}));
$('grouping').addEventListener('click',()=>{
  const stages=$('grouping').getAttribute('aria-pressed')!=='true';
  $('grouping').setAttribute('aria-pressed',String(stages));
  $('grouping').textContent=stages?'Show grouping by lanes':'Show grouping by stages';
  $('groupStages').style.display=stages?'':'none'; $('groupLanes').style.display=stages?'none':'';
  $('interchange-title').textContent=`X f Y g Z above A h B k C; grouped by ${stages?'stages':'lanes'}`;
});
$('groupStages').removeAttribute('hidden'); $('groupStages').style.display='none';
$('checkLaws').addEventListener('click',async()=>{
  $('checkLaws').disabled=true; $('lawStatus').textContent='Computing both sides on six finite Boolean relations…';
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  try{
    const result=finiteLawChecks();
    $('unitResult').textContent=`Agreed for ${result.units} relations, on both sides.`;
    $('assocResult').textContent=`Agreed for ${result.regroupings} triples of relations.`;
    $('symmetryResult').textContent=`Agreed in ${result.symmetries} inverse/naturality comparisons.`;
    $('interchangeResult').textContent=`Agreed for ${result.interchanges} quadruples of relations.`;
    $('lawStatus').textContent='All finite comparisons agree. These checks cover the stated fixture family; they do not prove the laws for all relations.';
  }catch(error){$('lawStatus').textContent=`A finite check failed: ${error.message}`;}
  finally{$('checkLaws').disabled=false;}
});
function inspectRelation(){
  const x=$('relationInput').value==='true';
  const fixtures=[['Identity',[[[false],[false]],[[true],[true]]]],['Partial',[[[true],[true]]]],['Choice',[[[false],[false]],[[false],[true]],[[true],[true]]]]];
  $('relationResult').textContent=fixtures.map(([name,pairs])=>{
    const out=outputsFor(relation(['Bool'],['Bool'],pairs),[x]).map(y=>y[0]);
    return `${name}(${x}): ${out.length?`{${out.join(', ')}}`:'∅'}`;
  }).join(' · ');
}
$('relationInput').addEventListener('change',inspectRelation);
updateScenario(); inspectRelation();
