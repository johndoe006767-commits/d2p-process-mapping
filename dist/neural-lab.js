import {scrollPageTo,cancelPageNavigation} from './page-navigation.js';
import {fitLines,measureText,fitSvgLabels} from './svg-text.js?v=astral-3';
import {mountAstralBackground} from './astral-background.js?v=galaxy-2';
import {titleCase} from './title-case.js';
import {makeSourceOverview} from './neural-overview.js?v=astral-3';
/* Presentation layer over the source renderer's process layout and routing. */
export function mountNeuralLab(root,payload,t,onReturn){
'use strict';
const $=s=>root.querySelector(s), $$=s=>[...root.querySelectorAll(s)];
const abort=new AbortController();const listen=(event,fn,options={})=>window.addEventListener(event,fn,{...options,signal:abort.signal});
const data=payload.data, frames=data.frames, svg=$('#map-svg'), card=$('#information-card');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const names=frames.map(f=>titleCase(f.name.replace(/^Stage \d+:\s*/,'')));
const typeNames={man:'Manual',hyb:'Semi-automated',auto:'Automated'};
const typeColors={man:'var(--man)',hyb:'var(--hyb)',auto:'var(--auto)'};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cleanName=f=>f.name.replace(/^Stage \d+:\s*/,'');
let engine,nodes,scale=1,filter='all',activeStage=0,selected=null,opener=null,mode='detail',paused=reduced.matches,overviewScale=1,flow,selectedProcess=null;
const signalRecords=[];
let mapOriginY=0;
const fitted={detail:true,overview:true};
const viewportWidth=()=>document.documentElement.clientWidth;
function fitWidth(){fitted[mode]=true;if(mode==='overview')setOverviewScale(viewportWidth()/flow.width);else updateScale(viewportWidth()/engine.getDimensions().width);}
function scrollToNode(target){const box=target.getBoundingClientRect(),header=$('#navigation').offsetHeight;return scrollPageTo(scrollY+box.top-header-Math.max(20,(innerHeight-header-box.height)/2),{left:scrollX+box.left-(viewportWidth()-box.width)/2});}
const activities=()=>Object.values(nodes).filter(n=>n.s&&!n.kind);
const ns='http://www.w3.org/2000/svg';
function el(tag,attrs={},text){const node=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,String(v)));if(text!==undefined)node.textContent=text;return node;}
function txt(x,y,content,size=10,color='var(--ink)',weight=400){return el('text',{x,y,'font-size':size,fill:color,'font-weight':weight,'font-family':'Inter, sans-serif'},content);}
function shortTitle(s){const explicit={'FPAC-01.01.01':'Validate SKU master data','FPAC-01.01.02':'Build template columns & formulas','FPAC-01.01.03':'Phase historical actuals by SKU','FPAC-01.01.04':'Split by Therapeutic Area','FPAC-01.01.05':'Share planning templates','FPAC-01.01.06':'Enter volume & net price','FPAC-01.01.07':'Prepare the review package','FPAC-01.01.08':'Revise before PMR submission','FPAC-01.01.09':'Submit the final revenue plan'};return explicit[s.rid]||s.t;}
function stageHeadingName(f){return titleCase(cleanName(f));}
function drawHandoffs(f,direction,y){
 const items=f[direction]||[];if(!items.length)return;
 const row=el('g',{class:'stage-handoffs','data-direction':direction,'data-frame':f.id});
 row.append(el('rect',{x:26,y:y-5,width:direction==='up'?88:107,height:42,fill:'var(--base)'}));
 row.append(txt(38,y+21,direction==='up'?'Upstream':'Downstream',11.5,'var(--muted)'));
 let x=direction==='up'?120:138;
 items.forEach(item=>{const width=Math.max(65,measureText(item.p,11.2)+24),group=el('g',{class:'handoff-label',role:'button',tabindex:0,'aria-label':`${item.p}: ${item.w}`,'aria-haspopup':'dialog'});group.append(el('title',{},`${item.p}: ${item.w}`),el('rect',{x,y,width,height:32,rx:5}),txt(x+12,y+21,item.p,11.2,'var(--muted)'));const show=()=>{const entry={f,kind:'handoff',item,direction};showHandoffCard(entry,group);};group.onclick=show;group.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();show();}};row.append(group);x+=width+9;});
 svg.append(row);
}
function showHandoffCard(n,target){opener=target;$('#card-context').textContent=`Stage ${frames.indexOf(n.f)+1} · ${n.direction==='up'?'Upstream':'Downstream'} handoff`;$('#card-content').innerHTML=`<h2 id="card-title">${esc(n.item.p)}</h2><p class="card-description">${esc(n.item.w)}</p><p class="source-note">${esc(n.item.src)}</p>`;$('#card-next').hidden=true;$('#card-detail').hidden=true;if(!card.matches(':popover-open'))card.showPopover();positionCard(target);card.scrollTop=0;$('#close-card').focus({preventScroll:true});}
function skin(){
 const firstTop=frames[0]._box.top;
 svg.querySelectorAll('.source-pill,.source-step-leader').forEach(g=>g.remove());
 // Remove source frame containers and repeated phase ribbon, keeping the process layout.
 [...svg.children].forEach(child=>{if(['defs','style'].includes(child.tagName.toLowerCase()))return;let b;try{b=child.getBBox();}catch{return;}if(b.y+b.height<firstTop){child.remove();return;}
  const stage=frames.find(f=>Math.abs(b.y-f._box.top)<1||Math.abs(Number(child.getAttribute('y'))-(f._box.top+20))<1);
  if(child.tagName==='rect'&&Number(child.getAttribute('x'))===24&&Number(child.getAttribute('width'))>1000&&stage){child.remove();return;}
  if(child.tagName==='text'&&frames.some(f=>Number(child.getAttribute('y'))===f._box.top+26)){child.remove();return;}
  if(child.tagName==='g'&&!child.hasAttribute('data-id')&&frames.some(f=>b.y>=f._box.top&&b.y+b.height<=f._box.top+40)&&b.x>data._fr-100)child.remove();
  // Replace the source upstream/downstream pills with the approved rectangular labels.
  if(frames.some(f=>[f._box.top+104,f._box.bot-68].some(y=>Math.abs(b.y-y)<1))&&child.tagName==='g'&&!child.hasAttribute('data-id'))child.remove();
  if(child.tagName==='text'&&['Upstream','Downstream'].includes(child.textContent))child.remove();
 });
 // Tinted materials replace the source's light surfaces and red/blue outlines.
 svg.querySelectorAll('text').forEach(t=>{const fill=(t.getAttribute('fill')||'').toLowerCase();if(!fill.startsWith('var('))t.setAttribute('fill',/a00015|c8102e|d0021b/.test(fill)?'var(--pain)':/13643a|1f8a4c/.test(fill)?'var(--auto)':'var(--muted)');t.setAttribute('font-weight',Number(t.getAttribute('font-weight'))>500?'500':(t.getAttribute('font-weight')||'400'));});
 svg.querySelectorAll('rect,path,circle,line').forEach(s=>{if(s.closest('defs'))return;const fill=s.getAttribute('fill'),stroke=s.getAttribute('stroke');if(fill&&fill!=='none'&&!fill.startsWith('var('))s.setAttribute('fill',s.tagName==='circle'?'var(--accent)':'#403047');if(stroke&&!stroke.startsWith('var('))s.setAttribute('stroke','#a183ac');});
 svg.querySelectorAll('defs marker path').forEach(p=>p.setAttribute('fill','var(--navy)'));
 frames.forEach((f,i)=>{const y=f._box.top,acts=activities().filter(n=>n.f===f),count=ty=>acts.filter(n=>n.s.ty===ty).length;const group=el('g',{'data-stage-heading':i});group.append(el('rect',{x:0,y:y-8,width:data._fr,height:130,fill:'var(--base)'}));group.append(el('line',{x1:24,x2:data._fr-24,y1:y-7,y2:y-7,class:'stage-rule'}));const num=txt(38,y+42,String(i+1).padStart(2,'0'));num.setAttribute('class','stage-index-label');const title=txt(90,y+32,stageHeadingName(f));title.setAttribute('class','stage-label');const owner=txt(90,y+60,f.owner);owner.setAttribute('class','stage-owner');group.append(num,title,owner);num.setAttribute('role','button');num.setAttribute('tabindex','0');num.setAttribute('aria-label',`Stage ${i+1} Information`);const stageCard=()=>showProcessCard({id:f.id,f,P:null,st:i+1,index:i+1,t:stageHeadingName(f),count:acts.length,man:count('man'),hyb:count('hyb'),auto:count('auto'),pain:[...new Set([...(f.stagePain||[]),...acts.flatMap(n=>n.s.pp||[])])],inp:f.up.map(u=>u.p+': '+u.w),out:f.down.map(u=>u.p+': '+u.w)},num);num.onclick=stageCard;num.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();stageCard();}};
 const stats=el('g',{class:'stage-stats'}),stat1=txt(0,y+25,`Viewing Stage ${i+1} of ${frames.length}`,11.5,'var(--muted)'),stat2=txt(0,y+46,`${acts.length} activities · `+[['man','manual'],['hyb','semi'],['auto','auto']].filter(([t])=>count(t)).map(([t,l])=>`${count(t)} ${l}`).join(' · '),11.5,'var(--muted)');[stat1,stat2].forEach(t=>t.setAttribute('text-anchor','end'));stats.append(stat1,stat2);let barX=-160;['man','hyb','auto'].forEach(ty=>{const width=160*count(ty)/acts.length;if(width)stats.append(el('rect',{x:barX,y:y+62,width,height:3,fill:typeColors[ty],class:'stage-mix'}));barX+=width;});group.append(stats);svg.append(group);drawHandoffs(f,'up',y+86);drawHandoffs(f,'down',f._box.bot-46);});
 for(const n of Object.values(nodes)){
  let group=svg.querySelector(`[data-id="${CSS.escape(n.id)}"]`);
  if(n.s&&!n.kind&&group){const s=n.s,top=n.y-10;group.replaceChildren(el('title',{},s.t));group.append(el('rect',{class:'b',x:n.x,y:top,width:n.w,height:94,rx:8}));
   group.append(txt(n.x+12,top+26,String(s.n).padStart(2,'0'),8.2,'var(--accent)',400));
   const label=txt(n.x+n.w-12,top+26,typeNames[s.ty],8.2,'var(--muted)',400);label.setAttribute('text-anchor','end');group.append(label);group.append(el('circle',{cx:n.x+n.w-18-typeNames[s.ty].length*4.25,cy:top+23,r:2.1,fill:typeColors[s.ty]}));
   const lines=fitLines(titleCase(shortTitle(s)),n.w-24,10.6,3),start=lines.length===1?57:lines.length===2?49:42;lines.forEach((line,j)=>group.append(txt(n.x+12,top+start+j*13.4,line,10.6,'var(--ink)',400)));
   const system=fitLines((s.sys||'').replace(/;\s*/g,' · '),n.w-24-(s.pp?.length?measureText('Pain Point',8)+10:0),8,1)[0]||'';group.append(txt(n.x+12,top+84,system,8,'var(--muted)'));
   if(s.pp?.length){const pain=txt(n.x+n.w-12,top+84,'Pain Point',8,'var(--pain)');pain.setAttribute('text-anchor','end');group.append(pain);}
   // Step handoffs use the mockup's fine vertical marker and plain text.
   if(s.in?.length&&!s.inhide){const who=s.in.map(x=>x[0]).join(' + '),what=s.in.length===1?s.in[0][1]:'Inputs';const text=fitLines(`${who} · ${what}`,n.w+20,8.6,1)[0];const input=el('g',{class:'step-handoff'});input.append(el('line',{x1:n.x,x2:n.x,y1:top-24,y2:top-7}),txt(n.x+10,top-13,text,8.6,'var(--muted)'));svg.append(input);}
   if(s.out?.length){const output=txt(n.x+8,top+108,fitLines(s.out.map(x=>x[0]).join(' · '),n.w-16,8.5,1)[0],8.5,'var(--muted)');output.setAttribute('class','step-output');svg.append(output);}
  }
  if(!group&&['in','out'].includes(n.kind)){
   group=[...svg.children].find(g=>g.tagName==='g'&&!g.hasAttribute('data-id')&&[...g.children].some(c=>c.tagName==='rect'?Number(c.getAttribute('x'))===n.x&&Number(c.getAttribute('y'))===n.y:c.tagName==='path'&&(c.getAttribute('d')||'').startsWith(`M${n.x},${n.y} `)));
   if(group){group.dataset.id=n.id;group.classList.add('source-io');group.setAttribute('tabindex','0');group.setAttribute('role','button');if(n.kind==='in'){const top=n.y-10;group.replaceChildren(el('title',{},`${n.lab}: ${n.txt}`),el('rect',{x:n.x,y:top,width:n.w,height:94,rx:8,fill:'#47304b',stroke:'#725c7b','stroke-width':.7}),txt(n.x+12,top+24,fitLines(n.lab,n.w-24,10.5,1)[0],10.5,'var(--accent)'));const copy=n.P.id==='FPAC-01.01'?'Planning cycle begins':n.txt;fitLines(copy,n.w-24,11.2,3).forEach((line,i)=>group.append(txt(n.x+12,top+47+i*13.5,line,11.2,'var(--ink)',400)));}}
  }
  if(group&&n.kind==='dec'){const question=group.querySelector(':scope > text');if(question){const lines=fitLines(n.dec.q,130,9.5,2,500),cx=n.x+n.w/2,start=n.y-8-(lines.length-1)*13;question.remove();group.querySelectorAll(':scope > rect').forEach(r=>r.remove());const label=el('g',{class:'decision-label'}),width=Math.max(...lines.map(l=>measureText(l,9.5,500)))+12;label.append(el('rect',{x:cx-width/2,y:start-11,width,height:lines.length*13+3,rx:3,fill:'var(--base)'}));lines.forEach((line,i)=>{const text=txt(cx,start+i*13,line,9.5,'var(--accent)',500);text.setAttribute('text-anchor','middle');label.append(text);});group.append(label);}}
  if(group&&n.kind==='out'){group.querySelectorAll('text').forEach(t=>t.remove());fitLines(n.doc,n.w-28,10,3,500).forEach((line,i)=>group.append(txt(n.x+12,n.y+21+i*13.5,line,10,'var(--ink)',500)));}
  if(group){group.onclick=()=>showCard(n.id,group);group.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();showCard(n.id,group);}};group.setAttribute('aria-haspopup','dialog');group.setAttribute('aria-label',n.s?`${n.s.n}. ${n.s.t}. ${typeNames[n.s.ty]}. Open details.`:n.kind==='dec'?`Decision: ${n.dec.q}. Open details.`:n.kind==='in'?`${n.lab}. ${n.txt}`:n.kind==='out'?`Output: ${n.doc}`:n.c?.full||n.c?.t||'Open details');}
 }
 // A reserved header band keeps labels independent of node and dependency geometry.
 svg.querySelectorAll('.source-process-heading').forEach(g=>g.remove());
 frames.forEach((f,fi)=>f.procs.forEach((p,pi)=>{const first=nodes[`${f.id}|${p.id}|in`];if(!first)return;const x=first.x,y=p._headingY-4,g=el('g',{class:'process-heading','data-process-heading':p.id});const badge=`Process ${fi+1}.${pi+1}`,bw=measureText(badge,9.5,500)+18,titleX=x+bw+14;
 g.append(el('rect',{x,y:y-13,width:bw,height:20,rx:10,fill:'#403047'}),txt(x+9,y,badge,9.5,'var(--muted)',500),txt(titleX,y,titleCase(p.name),12,'var(--ink)',600),txt(titleX,y+19,`${p.id} · ${p.owner}`,10.5,'var(--muted)'));
 svg.append(g);
 }));
 fitSvgLabels(svg);
 svg.querySelectorAll(':scope > text').forEach(t=>{if(/^(Flow |Phase |Process |TPI \/ CI)/.test(t.textContent)){t.childNodes.forEach(n=>{if(n.nodeType===3)n.nodeValue=titleCase(n.nodeValue);});t.setAttribute('font-weight','600');}});
 // Keep endpoint arrowheads on the resized card boundary; route interiors are unchanged.
 const resized=Object.values(nodes).filter(n=>n.s&&!n.kind||n.kind==='in');
 [...svg.children].filter(p=>p.tagName==='path').forEach(p=>{
  const d=p.getAttribute('d')||'',points=[...d.matchAll(/([ML])(-?[\d.]+)[, ](-?[\d.]+)/g)];if(points.length<2)return;
  let next=d;
  for(const point of [points.at(-1),points[0]]){const x=Number(point[2]),y=Number(point[3]);const n=resized.find(n=>x>n.x+.1&&x<n.x+n.w-.1&&(Math.abs(y-n.y)<.01||Math.abs(y-(n.y+n.h))<.01));if(!n)continue;const adjusted=y+(Math.abs(y-n.y)<.01?-10:10);next=next.slice(0,point.index)+point[1]+x+','+adjusted+next.slice(point.index+point[0].length);}
  p.setAttribute('d',next);
 });
 // Light travels on copies of the rendered flow paths.

 [...svg.querySelectorAll('path.fl')].forEach((p,i)=>{const signal=el('path',{d:p.getAttribute('d'),class:'signal'});signal.style.animationDelay=`-${(i%17)*.27}s`;p.after(signal);signalRecords.push({path:p,signal});});
}
const block=(label,body,extra='')=>body?`<section class="record-section ${extra}"><h3>${label}</h3>${body}</section>`:'';
const paragraph=v=>v?`<p>${esc(v)}</p>`:'';
const list=values=>values?.length?`<ul>${[...new Set(values)].map(v=>`<li>${esc(v)}</li>`).join('')}</ul>`:'';
const handoffs=values=>values?.length?values.map(([who,what])=>`<p><strong>${esc(who)}</strong> · ${esc(what)}</p>`).join(''):'';
function record(n){
 if(n.s&&!n.kind){const s=n.s;return `<h2 id="card-title">${esc(s.t)}</h2><p class="card-description">${esc(s.d)}</p><dl class="record-meta"><div><dt>Owner</dt><dd>${esc(s.o||n.P.owner)}</dd></div><div><dt>Activity type</dt><dd style="color:${typeColors[s.ty]}">${typeNames[s.ty]}</dd></div><div><dt>Systems</dt><dd>${esc(s.sys)}</dd></div><div><dt>Process</dt><dd>${esc(n.P.name)}</dd></div></dl>${block('Inputs',handoffs(s.in))}${block('Outputs',handoffs(s.out))}${s.dec?block('Decision',paragraph(s.dec.q)+`<p><strong>Yes</strong> · ${esc(s.dec.yes)}<br><strong>No</strong> · ${esc(s.dec.no)}</p>`):''}${block('Documented pain points',list(s.pp),'pain')}${block('Control',paragraph(s.ctl))}${block('Existing CI / TPI',paragraph(s.ci))}${block('Review notes',paragraph(s.note))}${block('Source feedback',paragraph(s.fb))}<p class="source-note">${esc(s.src||`${t.name} · Documented As-Is Source`)}</p>`;}
 if(n.kind==='dec'){const d=n.dec;return `<h2 id="card-title">${esc(d.q)}</h2>${paragraph(d.d)}${block('If yes',paragraph(d.yes))}${block('If no',paragraph(d.no))}${block('Checked by',paragraph(d.o||n.P.owner))}${block('Example',paragraph(d.ex))}${block('Systems',paragraph(d.sys))}${block('Documented pain points',list(d.pp),'pain')}<p class="source-note">${esc(d.src||n.step?.src||`Decision Recorded in the ${t.name} As-Is Process Map.`)}</p>`;}
 if(n.kind==='in'||n.kind==='out'){return `<h2 id="card-title">${esc(n.kind==='in'?n.lab:'Process output')}</h2><p class="card-description">${esc(n.kind==='in'?n.txt:n.doc)}</p>${block('Process',paragraph(n.P.name))}${block('Owner',paragraph(n.P.owner))}${block(n.kind==='in'?'Upstream dependencies':'Downstream handoffs',list((n.kind==='in'?n.f.up:n.f.down).map(x=>x.p+': '+x.w)))}${block('Notes',paragraph(n.P.outnote))}`;}
 if(n.c){const c=n.c;const refs=(c.steps||[]).map(ref=>nodes[`${n.f.id}|${ref}`]).filter(Boolean);return `<h2 id="card-title">${n.kind==='ch'?'Documented pain point':'Process improvement'}</h2><p class="card-description">${esc(c.full||c.t)}</p>${block('Affected activities',list(refs.map(x=>`${x.s?.n||''}. ${x.s?.t||x.P?.name||''}`)))}${block('Reference',paragraph(c.ref))}${block('Status',paragraph(c.st))}<p class="source-note">${esc(c.src||`${t.name} · Documented As-Is Source`)}</p>`;}
 return '<h2 id="card-title">Source record</h2>';
}
function showCard(id,target){
 const n=nodes[id];if(!n)return;selected=id;opener=target;
 svg.querySelectorAll('.sel').forEach(x=>x.classList.remove('sel'));target.classList.add('sel');
 if(n.c?.steps){const refs=n.c.steps.map(s=>`${n.f.id}|${s}`);svg.querySelectorAll('[data-id]').forEach(g=>{if(refs.includes(g.dataset.id))g.classList.add('sel');});}
 $('#card-context').textContent=n.s?`Step ${n.s.n} · ${n.s.rid||n.P.id} · Stage ${frames.indexOf(n.f)+1}`:`Stage ${frames.indexOf(n.f)+1} · ${n.P?.name||cleanName(n.f)}`;
 $('#card-content').innerHTML=record(n);$('#card-detail').hidden=true;
 $('#card-next').hidden=!(n.s&&!n.kind&&n.P.steps.some(s=>s.n===n.s.n+1));
 if(!card.matches(':popover-open'))card.showPopover();
 positionCard(target);card.scrollTop=0;$('#close-card').focus({preventScroll:true});
}
function positionCard(target){const b=target.getBoundingClientRect(),w=card.offsetWidth,h=card.offsetHeight,margin=16;let x=b.right+18;if(x+w>innerWidth-margin)x=b.left-w-18;if(x<margin)x=Math.max(margin,Math.min(innerWidth-w-margin,b.left));const idealTop=innerWidth>760?Math.max($('#navigation').offsetHeight+12,b.top-12):b.top-12;const y=Math.max(margin,Math.min(idealTop,innerHeight-h-margin));card.style.left=x+'px';card.style.top=y+'px';}
function closeCard(restore=true){if(card.matches(':popover-open'))card.hidePopover();if(restore&&opener)opener.focus({preventScroll:true});}
function updateHeader(){root.style.setProperty('--map-viewport-width',viewportWidth()+'px');root.style.setProperty('--header-height',$('#navigation').offsetHeight+'px');}
function updateStageStats(){const x=Math.min(data._fr-38,(innerWidth-60)/scale);svg.querySelectorAll('.stage-stats text').forEach(t=>t.setAttribute('x',x));svg.querySelectorAll('.stage-stats').forEach(g=>{g.style.display='';const heading=g.parentElement,labels=[heading.querySelector('.stage-label'),heading.querySelector('.stage-owner')],end=Math.max(...labels.map(t=>{const b=t.getBBox();return b.x+b.width;})),width=Math.max(...[...g.querySelectorAll('text')].map(t=>t.getComputedTextLength()));g.style.display=innerWidth<1400||end+28>x-width?'none':'';g.querySelectorAll('.stage-mix').forEach(r=>r.setAttribute('transform',`translate(${x},0)`));});}
function updateScale(value){const old=scale,minScale=Math.min(.35,viewportWidth()/engine.getDimensions().width);scale=Math.max(minScale,Math.min(2.5,value));engine.setScale(Math.min(2,scale));const dim=engine.getDimensions();svg.style.width=dim.width*scale+'px';svg.style.height=(dim.height-mapOriginY)*scale+'px';$('#process-map').style.paddingBottom=Math.max(0,innerHeight-$('#navigation').offsetHeight-(dim.height-frames.at(-1)._box.top)*scale)+'px';svg.setAttribute('viewBox',`0 ${mapOriginY} ${dim.width} ${dim.height-mapOriginY}`);$('#zoom-value').textContent=Math.round(scale*100)+'%';$('#zoom-out').disabled=scale<=minScale;$('#zoom-in').disabled=scale>=2.5;if(old!==scale)closeCard(false);updateStageStats();updateScroll();}
function jump(index,instant=false){activeStage=index;if(mode!=='detail')setMode('detail');closeCard(false);updateHeader();const y=($('#process-map').getBoundingClientRect().top+window.scrollY)+(frames[index]._box.top-mapOriginY)*scale-$('#navigation').offsetHeight-14;markStage(index);history.replaceState(null,'',`#tower=${t.sourceKey}&stage=${encodeURIComponent(frames[index].id)}`);return scrollPageTo(y,{instant});}
function markStage(i){activeStage=i;$$('#stages button').forEach((b,j)=>b.setAttribute('aria-current',i===j?'step':'false'));$('#stage-select').value=String(i);$('#current-stage').textContent=`Viewing stage ${i+1} of ${frames.length} · ${names[i]}`;updateFilterStatus();}
function updateFilterStatus(){
 const group=mode==='overview'?activities():activities().filter(n=>n.f===frames[activeStage]);
 const count=group.filter(n=>filter==='all'||filter==='pp'&&n.s.pp?.length||n.s.ty===filter).length;
 $('#filter-status').textContent=filter==='all'?`${group.length} activities${mode==='overview'?` across ${Object.keys(flow.records).length} ${['FPAC','FPAO'].includes(t.sourceKey)?'processes':'stages'}`:' in this stage'}`:`${count} of ${group.length} activities in focus${count===0?' · flow retained':''}`;
 if(mode==='overview')$('#current-stage').textContent=`High-Level Flow · ${t.name}`;
}
function setOverviewScale(value){const minScale=Math.min(.35,viewportWidth()/flow.width);overviewScale=Math.max(minScale,Math.min(2.5,value));flow.setScale(overviewScale);$('#zoom-value').textContent=Math.round(overviewScale*100)+'%';$('#zoom-out').disabled=overviewScale<=minScale;$('#zoom-in').disabled=overviewScale>=2.5;closeCard(false);}
function setMode(next){mode=next;root.dataset.mode=next;$('#process-map').hidden=next!=='detail';$('.map-intro').hidden=next!=='detail';$('#overview').hidden=next!=='overview';$$('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===next)));closeCard(false);$('.skip').href=next==='overview'?'#overview':'#process-map';$('.interaction-hint').textContent=next==='overview'?'Select a process to inspect':'Select a step or decision to inspect';if(fitted[next])fitWidth();else if(next==='overview')setOverviewScale(overviewScale);else updateScale(scale);updateFilterStatus();updateHeader();}
function showProcessCard(r,target){selectedProcess=r;opener=target;markStage(r.st-1);flow.markStage(r.st-1);$('#card-context').textContent=`Process ${String(r.index).padStart(2,'0')} · Stage ${r.st} · ${r.id}`;$('#card-content').innerHTML=`<h2 id="card-title">${esc(r.t)}</h2><p class="card-description">${r.count} activities · ${r.pain.length} documented pain point${r.pain.length===1?'':'s'}</p><dl class="record-meta"><div><dt>Owner</dt><dd>${esc(r.P?.owner||r.f.owner)}</dd></div><div><dt>Activity mix</dt><dd>${r.man} manual · ${r.hyb} semi · ${r.auto} automated</dd></div></dl>${block('Inputs',list(Array.isArray(r.inp)?r.inp:[r.inp]))}${block('Outputs',list(r.id==='FPAC-05.01'?FPAC_FLOW.downstream:r.out?(Array.isArray(r.out)?r.out:[r.out]):[r.P?.outdoc].filter(Boolean)))}${block('Documented pain points',list(r.pain),'pain')}<p class="source-note">${esc(t.name)} · Documented As-Is Process</p>`;$('#card-next').hidden=true;$('#card-detail').hidden=false;if(!card.matches(':popover-open'))card.showPopover();positionCard(target);card.scrollTop=0;$('#close-card').focus({preventScroll:true});}
async function openDetailedProcess(){if(!selectedProcess)return;const r=selectedProcess;setMode('detail');fitWidth();const first=activities().find(n=>r.P?n.P.id===r.id:n.f===r.f);if(first){const target=svg.querySelector(`[data-id="${CSS.escape(first.id)}"]`);if(await scrollToNode(target))showCard(first.id,target);}else jump(r.st-1);}
function updateScroll(){if(mode!=='detail')return;const y=(window.scrollY+$('#navigation').offsetHeight+35-($('#process-map').getBoundingClientRect().top+window.scrollY))/scale+mapOriginY;let idx=0;frames.forEach((f,i)=>{if(f._box.top<=y)idx=i;});markStage(idx);signalRecords.forEach(({path,signal})=>{const r=path.getBoundingClientRect();signal.style.animationPlayState=r.bottom>$('#navigation').offsetHeight&&r.top<innerHeight&&!paused?'running':'paused';});}
let ticking=false;listen('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(()=>{updateScroll();ticking=false;});}}, {passive:true});
try{
 engine=window.TowerRenderers[t.sourceKey](payload.key,{asis:data},{svg:'#map-svg',det:'#native-detail',leg:'#native-legend',scroll:'#process-map',frameHeaderHeight:100,handoffStripHeight:52,processInputGap:64,feedHeight:134,feedTopGap:34,hideChallenges:true});engine.render('asis','all');nodes=engine.getNodes();
 const geometry=Object.values(nodes).map(n=>({id:n.id,x:n.x,y:n.y,w:n.w,h:n.h,kind:n.kind||'activity'}));
 const edgePaths=[...svg.querySelectorAll('path.fl,path.rw')].map(p=>p.getAttribute('d'));
 skin();mapOriginY=Math.max(0,frames[0]._box.top-20);
 $('#stages').innerHTML=names.map((name,i)=>`<button data-stage="${i}" aria-current="${i===0?'step':'false'}" aria-label="Stage ${i+1}: ${esc(cleanName(frames[i]))}"><span class="stage-number">${i+1}</span><span>${esc(name)}</span></button>`).join('');
 $('#stage-select').innerHTML=frames.map((f,i)=>`<option value="${i}">${i+1}. ${esc(cleanName(f))}</option>`).join('');
 flow=t.sourceKey==='FPAC'?makeCommercialFlow($('#overview-svg'),data,showProcessCard):makeSourceOverview($('#overview-svg'),payload,t,showProcessCard);fitSvgLabels($('#overview-svg'));overviewScale=viewportWidth()/flow.width;
 $('#total-count').textContent=activities().length;
 $$('#stages [data-stage]').forEach(b=>b.onclick=()=>jump(Number(b.dataset.stage)));$('#stage-select').onchange=e=>jump(Number(e.target.value));
 $$('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;engine.setFilter(filter);flow.setFilter(filter);$$('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));updateFilterStatus();});
 $$('[data-mode]').forEach(b=>b.onclick=()=>{setMode(b.dataset.mode);if(mode==='detail')jump(activeStage);else scrollPageTo(root.getBoundingClientRect().top+scrollY);});
 const manualZoom=delta=>{fitted[mode]=false;if(mode==='overview')setOverviewScale(overviewScale+delta);else updateScale(scale+delta);};
 $('#zoom-in').onclick=()=>manualZoom(.15);$('#zoom-out').onclick=()=>manualZoom(-.15);
 $('#readable').onclick=()=>{fitted[mode]=false;if(mode==='overview')setOverviewScale(Math.max(1,Math.min(2.5,viewportWidth()/flow.width)));else updateScale(1.5);};
 $('#fit').onclick=()=>{fitWidth();scrollPageTo(scrollY);};
 const astral=mountAstralBackground(root);
 // The galaxy runs continuously while visible. Only the OS reduced-motion preference stills it.
 const motion=()=>{paused=reduced.matches;root.classList.toggle('paused',paused);astral.setPaused(paused);updateScroll();};reduced.addEventListener('change',motion,{signal:abort.signal});
 $('#map-controls-toggle').onclick=()=>{const expanded=$('#map-controls-toggle').getAttribute('aria-expanded')!=='true';$('#map-controls-toggle').setAttribute('aria-expanded',String(expanded));$('#navigation').classList.toggle('controls-expanded',expanded);updateHeader();};
 $('#legend-toggle').onclick=()=>{const legend=$('#legend');legend.hidden=!legend.hidden;$('#legend-toggle').setAttribute('aria-expanded',String(!legend.hidden));updateHeader();};
 $('#lab-return').onclick=()=>{closeCard(false);onReturn();};$('#first-step').onclick=async()=>{const first=activities()[0],target=svg.querySelector(`[data-id="${CSS.escape(first.id)}"]`);if(await scrollToNode(target))showCard(first.id,target);};
 $('#card-detail').onclick=openDetailedProcess;$('#close-card').onclick=()=>closeCard();$('.identity').onclick=e=>{e.preventDefault();jump(0);};
 $('#card-next').onclick=async()=>{const n=nodes[selected],next=nodes[`${n.f.id}|${n.P.id}|${n.s.n+1}`];if(next){const target=svg.querySelector(`[data-id="${CSS.escape(next.id)}"]`),b=target.getBoundingClientRect();closeCard(false);if((b.right>viewportWidth()||b.left<0)&&!await scrollToNode(target))return;showCard(next.id,target);}};
 card.addEventListener('toggle',e=>{if(e.newState==='closed'){svg.querySelectorAll('.sel').forEach(x=>x.classList.remove('sel'));}});
 card.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeCard();}if(e.key==='Tab'){const items=[...card.querySelectorAll('button:not([hidden])')].filter(x=>!x.disabled);if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0].focus();}}});
 const observer=new ResizeObserver(updateHeader);observer.observe($('#navigation'));
 listen('resize',()=>{cancelPageNavigation();updateHeader();if(fitted[mode])fitWidth();else if(mode==='detail')updateScale(scale);else setOverviewScale(overviewScale);updateStageStats();if(card.matches(':popover-open')&&opener)positionCard(opener);updateScroll();});
 updateHeader();fitWidth();motion();
 
 // Read-only QA evidence: layout anchors and paths before the visual skin is applied.
 const api={geometry,edgePaths,getNodes:()=>nodes,getState:()=>({scale,filter,activeStage,mode,paused,selected,overviewScale,background:astral.getState()}),flow,jump,setMode,fitWidth,destroy(){cancelPageNavigation();astral.destroy();abort.abort();observer.disconnect();closeCard(false);},go(id){const idx=frames.findIndex(f=>f.id===id||f.procs.some(p=>p.id===id));const n=activities().find(n=>n.P.id===id);if(n){markStage(Math.max(0,idx));history.replaceState(null,'',`#tower=${t.sourceKey}&stage=${encodeURIComponent(frames[Math.max(0,idx)].id)}`);return scrollToNode(svg.querySelector(`[data-id="${CSS.escape(n.id)}"]`));}return jump(Math.max(0,idx));}};window.NeuralLab=api;return api;
}catch(error){console.error(error);$('#load-error').hidden=false;}
}
