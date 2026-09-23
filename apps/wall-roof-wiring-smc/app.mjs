import {TYPE,DEFAULT_SCENARIO,buildDiagram,validate,run,checkEquivalence} from './model.mjs';
import {layoutDiagram} from './layout.mjs';
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selected=null, current, currentLayout, currentResult, zoom='fit', family='all';
const fields=['accessOK','mortarOK','geometryOK','released','roofFits','sameWorker'];
const colours={labour:'#7c55b3',materials:'#b67a25',information:'#367bbe',equipment:'#298879',structure:'#bb553f'};
const familyOf=t=>t==='BL'?'labour':['D','Evidence'].includes(t)?'information':['P','Sc','ScRaw'].includes(t)?'equipment':['BuiltWall','ReadyWall','Roofed'].includes(t)?'structure':'materials';
function endpointLabel([id,port]) {return `${id==='IN'?'Supplied':id==='OUT'?'Returned':current.boxes.find(b=>b.id===id)?.label??id} · ${port}`;}
function typeAt([id,port]) {return (id==='IN'?current.inputs:current.boxes.find(b=>b.id===id)?.outputs??[]).find(p=>p.id===port)?.type??'?';}
function highlight(indices=null) {
  document.querySelectorAll('#diagram .wire-group').forEach(g=>{
    const active=indices?indices.has(Number(g.dataset.wireIndex)):family==='all'||g.dataset.family===family;
    g.classList.toggle('faded',!active);g.classList.toggle('followed',active&&(indices!==null||family!=='all'));
  });
  document.querySelectorAll('.wire-legend button[data-family]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.family===family)));
}
function inspect(id) {
  selected=id;const b=current.boxes.find(b=>b.id===id);if(!b)return;
  $('inspector').innerHTML=`<p class="eyebrow">SELECTED PROCESS</p><h3>${esc(b.label)}</h3><p>${esc(b.description)}</p><p class="small">Input types → output types</p><div class="signature">${b.inputs.map(p=>esc(p.type)).join(' ⊗ ')}\n→ ${b.outputs.map(p=>esc(p.type)).join(' ⊗ ')}</div><details><summary>Named ports and meanings</summary><h4>Inputs</h4><ul>${b.inputs.map(p=>`<li><code>${esc(p.id)} : ${esc(p.type)}</code> — ${esc(TYPE[p.type])}</li>`).join('')}</ul><h4>Outputs</h4><ul>${b.outputs.map(p=>`<li><code>${esc(p.id)} : ${esc(p.type)}</code> — ${esc(TYPE[p.type])}</li>`).join('')}</ul></details>`;
  document.querySelectorAll('[data-box]').forEach(el=>{const active=el.dataset.box===id;el.setAttribute('aria-pressed',String(active));el.classList.toggle('selected',active);});
  const indices=new Set(current.wires.flatMap((w,i)=>w.from[0]===id||w.to[0]===id?[i]:[]));
  highlight(indices);$('wireReadout').textContent=`${b.label} — ${b.inputs.length} input ports, ${b.outputs.length} output ports. Connected wires highlighted; process details are below the conditions.`;
}
function followWire(index) {
  const wire=current.wires[index];if(!wire)return;selected=null;family='all';highlight(new Set([index]));
  document.querySelectorAll('[data-box]').forEach(el=>{el.classList.remove('selected');el.setAttribute('aria-pressed','false');});
  $('wireReadout').textContent=`${endpointLabel(wire.from)} → ${endpointLabel(wire.to)}. ${typeAt(wire.from)}: ${TYPE[typeAt(wire.from)]??'Unknown type'}.`;
}
function showAll() {family='all';selected=null;highlight();document.querySelectorAll('[data-box]').forEach(el=>{el.classList.remove('selected');el.setAttribute('aria-pressed','false');});$('wireReadout').textContent='Every actual wire is visible. Select a wire or port to follow its connection; select a process to highlight its boundary.';}
function applyZoom() {
  if(!currentLayout)return;const v=$('diagramViewport');
  const fit=Math.min(1,(v.clientWidth-20)/currentLayout.width,(v.clientHeight-20)/currentLayout.height);
  const scale=zoom==='fit'?Math.max(.08,fit):zoom;
  $('diagram').style.width=`${currentLayout.width*scale}px`;$('diagram').style.height=`${currentLayout.height*scale}px`;
  $('zoomValue').textContent=`${Math.round(scale*100)}%`;
  $('zoomValue').dataset.scale=String(scale);
  if(zoom==='fit'){v.scrollLeft=0;v.scrollTop=0;}
}
function draw() {
  currentLayout=layoutDiagram(current);const svg=$('diagram');svg.replaceChildren();
  svg.setAttribute('viewBox',`0 0 ${currentLayout.width} ${currentLayout.height}`);
  svg.dataset.wireCount=String(current.wires.length);
  const ns='http://www.w3.org/2000/svg';
  const el=(tag,attrs={},parent=svg,text)=>{const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text!==undefined)e.textContent=text;parent.append(e);return e;};
  el('title',{id:'svgTitle'},svg,'Complete house-shell wiring diagram');
  el('desc',{id:'svgDescription'},svg,`${current.inputs.length} supplied inputs, ${current.boxes.length} processes, ${current.wires.length} individual wires and ${current.outputs.length} returned outputs. Every boundary and internal connection in the selected model is drawn. Crossing lines are not junctions.`);
  const defs=el('defs');
  for(const [name,colour] of Object.entries({...colours,error:'#ba302d'})){
    const marker=el('marker',{id:`arrow-${name}`,viewBox:'0 0 10 10',refX:10,refY:5,markerWidth:5,markerHeight:5,orient:'auto'},defs);el('path',{d:'M0 0L10 5L0 10Z',fill:colour},marker);
  }
  // The outer process boundary is a visual enclosure, not an extra process.
  el('rect',{x:300,y:40,width:currentLayout.width-610,height:currentLayout.height-80,rx:24,class:'outer-enclosure'});
  el('text',{x:326,y:74,class:'enclosure-label'},svg,'BUILD THE ROOFED SHELL · COMPOSITE PROCESS');
  const inners=currentLayout.nodes.filter(n=>n.id.startsWith('walling/'));
  if(inners.length){
    const x=Math.min(...inners.map(n=>n.x))-24,y=Math.min(...inners.map(n=>n.y))-24;
    const right=Math.max(...inners.map(n=>n.x+n.width))+24,bottom=Math.max(...inners.map(n=>n.y+n.height))+28;
    el('rect',{x,y,width:right-x,height:bottom-y,rx:16,class:'module-enclosure'});
    el('text',{x:x+18,y:y+25,class:'module-label'},svg,'WALLING_ONE_STOREY · OPENED OUT');
  }
  for(const wire of currentLayout.wires){
    const wf=familyOf(wire.type),colour=wire.bad?'#ba302d':colours[wf];
    const points=wire.points;const d=points.map(([x,y],i)=>`${i?'L':'M'}${x},${y}`).join(' ');
    const g=el('g',{class:`wire-group${wire.bad?' invalid-wire':''}`,'data-wire-index':wire.index,'data-from':JSON.stringify(wire.from),'data-to':JSON.stringify(wire.to),'data-family':wf,tabindex:0,role:'button','aria-label':`Follow wire: ${endpointLabel(wire.from)} to ${endpointLabel(wire.to)}, type ${wire.type}`});
    el('title',{},g,`${endpointLabel(wire.from)} → ${endpointLabel(wire.to)} · ${wire.type}`);
    el('path',{d,class:'wire-halo'},g);el('path',{d,class:'wire-line',stroke:colour,'marker-end':`url(#arrow-${wire.bad?'error':wf})`},g);
    el('path',{d,class:'wire-hit'},g);
    g.addEventListener('click',e=>{e.stopPropagation();followWire(wire.index);});
    g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();followWire(wire.index);}});
    g.addEventListener('mouseenter',()=>{g.classList.add('hovered');});g.addEventListener('mouseleave',()=>g.classList.remove('hovered'));
  }
  for(const node of currentLayout.nodes){
    const boundary=['IN','OUT'].includes(node.id);const state=currentResult.trace.find(r=>r.id===node.id)?.status;
    const g=el('g',{class:`process-node${boundary?' boundary-node':''}${state==='fail'?' failed-node':''}`,...(boundary?{}:{'data-box':node.id})});
    el('rect',{x:node.x,y:node.y,width:node.width,height:node.height,rx:12,class:'node-body'},g);
    const header=el('g',boundary?{}:{role:'button',tabindex:0,'data-box':node.id,'aria-pressed':'false','aria-label':`Inspect ${node.label}`},g);
    el('rect',{x:node.x,y:node.y,width:node.width,height:61,rx:12,class:'node-header'},header);
    const name=boundary?(node.id==='IN'?'SUPPLIED INPUTS':'RETURNED OUTPUTS'):node.label.replace('Walling_One_Storey','Walling · One Storey');
    const words=name.length>28?name.split(' '):[name];
    const lines=words.length>1?[words.slice(0,Math.ceil(words.length/2)).join(' '),words.slice(Math.ceil(words.length/2)).join(' ')]:words;
    lines.forEach((line,i)=>el('text',{x:node.x+node.width/2,y:node.y+25+i*20,'text-anchor':'middle',class:'process-title'},header,line));
    if(lines.length===1)el('text',{x:node.x+node.width/2,y:node.y+47,'text-anchor':'middle',class:'process-subtitle'},header,boundary?'Outer boundary':state==='fail'?'Condition not met':state==='blocked'?'Waiting for an input':`${node.inputs.length} inputs · ${node.outputs.length} outputs`);
    for(const side of ['inputs','outputs'])for(const port of node[side]){
      const matches=current.wires.flatMap((w,i)=>{const endpoint=side==='outputs'?w.from:w.to;return endpoint[0]===node.id&&endpoint[1]===port.id?[i]:[];});
      const colour=matches.length===1?colours[familyOf(port.type)]:'#ba302d';
      const pg=el('g',{class:`diagram-port${matches.length!==1?' invalid-port':''}`,'data-node':node.id,'data-direction':side,'data-port':port.id,'data-type':port.type,role:'button',tabindex:0,'aria-label':`Follow ${node.label} ${side==='inputs'?'input':'output'} ${port.id}, type ${port.type}`},g);
      el('title',{},pg,`${port.label??port.id}: ${port.type} · ${matches.length} connection${matches.length===1?'':'s'}`);
      el('circle',{cx:port.x,cy:port.y,r:6,fill:'#fffdf8',stroke:colour,'stroke-width':3},pg);
      const short=({builder:'builder',mixer:'mixer',roofkit:'roof kit',evidence:'release',drawing:'drawing',access:'access',cement:'cement',sand:'sand',water:'water',bricks:'bricks',lintels:'lintels',peg:'peg kit',shell:'shell',wall:'wall',mortar:'mortar',line:'line'})[port.id]??port.id;
      const input=side==='inputs';
      el('text',{x:port.x+(input?12:-12),y:port.y+5,'text-anchor':input?'start':'end',class:'port-label',fill:colour},pg,`${short} · ${port.type}`);
      const selectPort=()=>{showAll();highlight(new Set(matches));$('wireReadout').textContent=`${node.label} · ${port.id}: ${TYPE[port.type]}. ${matches.length} attached wire${matches.length===1?'':'s'}${matches.length===1?'':'; this violates the one-wire-per-port rule'}.`;};
      pg.addEventListener('click',e=>{e.stopPropagation();selectPort();});pg.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();selectPort();}});
    }
    if(!boundary){header.addEventListener('click',()=>inspect(node.id));header.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect(node.id);}});}
  }
  $('diagramTitle').textContent=$('expanded').checked?'Wall module expanded':'Wall module composed';
  $('diagramCount').textContent=`${current.inputs.length} supplied inputs · ${current.boxes.length} processes · ${current.wires.length} wires · ${current.outputs.length} returns`;
  applyZoom();
}
function render() {
  const scenario={...DEFAULT_SCENARIO,...Object.fromEntries(fields.map(k=>[k,$(k).checked])),revision:$('revision').value,evidenceRevision:$('revision').value};
  current=buildDiagram({expanded:$('expanded').checked,fault:$('fault').value,replacement:$('replacement').value});const syntax=validate(current);const result=currentResult=run(current,scenario);
  $('result').classList.toggle('bad',!result.ok);$('result').innerHTML=`<strong>${!syntax.ok?'Wiring rejected':result.ok?'Model accepts a roofed structural shell':'Wiring fits; the model rejects this handoff'}</strong><p>${syntax.ok?'Every port is connected once, types match, and the diagram is acyclic.':'The altered diagram fails a structural check.'}</p>${result.errors.length?`<ul>${result.errors.map(e=>`<li>${esc(e)}</li>`).join('')}</ul>`:'<p>The supplied conditions admit this boundary result. Both worker identities, the peg kit, drawing and access are returned.</p>'}`;
  $('houseRoof').setAttribute('fill',result.ok?'#638d82':'#cdd5d9');$('houseBadge').textContent=result.ok?'✓':'?';$('houseCaption').textContent=result.ok?'Accepted by the teaching model — not engineering approval.':'The selected model has no accepted roofed-shell output.';
  $('trace').innerHTML=result.trace.length?result.trace.map(row=>`<li class="${row.status==='fail'?'fail':''}"><b>${row.status==='pass'?'✓':row.status==='fail'?'×':'—'} ${esc(row.label)}</b>${esc(row.detail)}</li>`).join(''):'<li>Fix the wiring before interpreting its behaviour.</li>';
  $('boxButtons').innerHTML=current.boxes.map(b=>`<button data-box="${esc(b.id)}" aria-pressed="false">${esc(b.label)}</button>`).join('');$('boxButtons').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>inspect(b.dataset.box)));
  $('inputs').innerHTML=current.inputs.map(p=>`<li>${esc(p.label)} <code>${esc(p.type)}</code></li>`).join('');$('outputs').innerHTML=current.outputs.map(p=>`<li>${esc(p.label)} <code>${esc(p.type)}</code></li>`).join('');
  $('wires').innerHTML=current.wires.map(w=>`<tr><td>${esc(endpointLabel(w.from))}</td><td><code>${esc(typeAt(w.from))}</code></td><td>${esc(endpointLabel(w.to))}</td></tr>`).join('');$('outputRecord').textContent=result.ok?JSON.stringify(result.outputs,null,2):'No accepted outer output for this input assignment.';
  draw();const initial=$('expanded').checked?'walling/wall':'walling';inspect(current.boxes.some(b=>b.id===selected)?selected:initial);showAll();$('verification').textContent='Compare the expanded and collapsed boundary results over the model’s finite fixture family.';
}
[...fields,'expanded','replacement','revision','fault'].forEach(id=>$(id).addEventListener('change',render));
$('reset').addEventListener('click',()=>{fields.forEach(k=>$(k).checked=DEFAULT_SCENARIO[k]);$('expanded').checked=true;$('replacement').value='standard';$('revision').value='A';$('fault').value='none';selected=null;zoom='fit';render();});
$('verify').addEventListener('click',()=>{const r=checkEquivalence($('replacement').value);$('verification').textContent=`${r.ok?'PASS':'FAIL'}: ${r.checked} fixture assignments compared; ${r.accepted} accepted and ${r.rejected} rejected. Expanded and collapsed ${r.ok?'agree':'disagree'} on acceptance and the complete outer output. This check uses correct wiring and both drawing/evidence revisions, independently of the currently selected faults. It does not prove arbitrary replacements or physical adequacy.`;});
$('zoomIn').addEventListener('click',()=>{zoom=Math.min(1.8,Number($('zoomValue').dataset.scale)*1.3);applyZoom();});
$('zoomOut').addEventListener('click',()=>{zoom=Math.max(.08,Number($('zoomValue').dataset.scale)/1.3);applyZoom();});
$('fitDiagram').addEventListener('click',()=>{zoom='fit';applyZoom();});
$('readableDiagram').addEventListener('click',()=>{zoom=1;applyZoom();});
const dialog=$('canvasDialog'),stage=$('canvasStage');
$('enlargeDiagram').addEventListener('click',()=>{if(dialog.open)dialog.close();else{dialog.append(stage);dialog.showModal();$('enlargeDiagram').textContent='Close large view ×';applyZoom();}});
dialog.addEventListener('close',()=>{$('canvasHome').append(stage);$('enlargeDiagram').textContent='Larger view ↗';applyZoom();$('enlargeDiagram').focus();});
new ResizeObserver(()=>applyZoom()).observe($('diagramViewport'));
document.querySelectorAll('.wire-legend button[data-family]').forEach(b=>b.addEventListener('click',()=>{showAll();family=b.dataset.family;highlight();$('wireReadout').textContent=family==='all'?'Every actual wire is visible. Select a connection to follow it.':`${b.textContent.trim()} highlighted. Other wires remain visible in the background.`;}));
const viewport=$('diagramViewport');let drag=null;
viewport.addEventListener('pointerdown',e=>{if(e.target.closest('.wire-group,.process-node'))return;if(e.pointerType==='touch')return;drag={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging');});
viewport.addEventListener('pointermove',e=>{if(!drag)return;viewport.scrollLeft=drag.left+drag.x-e.clientX;viewport.scrollTop=drag.top+drag.y-e.clientY;});
const endDrag=()=>{drag=null;viewport.classList.remove('dragging');};viewport.addEventListener('pointerup',endDrag);viewport.addEventListener('pointercancel',endDrag);
render();
