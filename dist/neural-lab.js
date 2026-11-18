import {scrollPageTo,cancelPageNavigation} from './page-navigation.js';
import {fitLines,measureText,fitSvgLabels} from './svg-text.js?v=astral-3';
import {mountAstralBackground} from './astral-background.js?v=galaxy-3';
import {titleCase} from './title-case.js';
import {makeSourceOverview} from './neural-overview.js?v=20261118-published';

const ltPrefix = /^\s*(?:⚠\uFE0F?\s*)?LT\s*#\s*\d+[a-z]*\b\s*(?:[·:–—-]\s*)?/i;
const aiPrefix = /^\s*AI(?:[ -]suggested)?\s*[:·–—-]/i;

function cleanDependency(partner, description) {
 const name = partner.replace(ltPrefix, '');
 const detail = description.replace(ltPrefix, '');
 if (aiPrefix.test(name) || aiPrefix.test(detail)) return [];
 return [[name, detail]];
}

function visibleHandoffs(items) {
 return items.filter(item => !item.c).flatMap(item =>
  cleanDependency(item.p, item.w).map(([p, w]) => ({...item, p, w}))
 );
}

/* Presentation layer over the source renderer's process layout and routing. */
export function mountNeuralLab(root,payload,t,onReturn){
'use strict';
const $=s=>root.querySelector(s), $$=s=>[...root.querySelectorAll(s)];
const abort=new AbortController();const listen=(event,fn,options={})=>window.addEventListener(event,fn,{...options,signal:abort.signal});
const scenario=payload.scenario||'asis',isAI=scenario==='tobe',viewLabel=isAI?'AI Suggested':'As Is';
const data=payload.data, frames=data.frames, svg=$('#map-svg'), card=$('#information-card');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const names=frames.map(f=>titleCase(f.name.replace(/^Stage \d+:\s*/,'')));
const typeNames={man:'Manual',hyb:'Semi',auto:'Automated'};
const typeColors={man:'var(--man)',hyb:'var(--hyb)',auto:'var(--auto)'};
const opportunityTones=new Map([['can be explored','explore'],['potential future opportunity','future'],['potential for future opportunity','future']]);
const nextType={man:'hyb',hyb:'auto',auto:'auto'};
for (const frame of frames) {
 frame.up = visibleHandoffs(frame.up);
 frame.down = visibleHandoffs(frame.down);
 // Some source maps select or supplement the register by scenario when they draw it.
 if (payload.stageInitiatives) frame.tpi = payload.stageInitiatives[frame.id];
 for (const process of frame.procs) {
  for (const step of sourceSteps(process.steps)) {
   for (const side of ['in', 'out']) {
    if (step[side]) step[side] = step[side].flatMap(([p,w]) => cleanDependency(p,w));
   }
   const pair = payload.activityTypes[[frame.id, process.id, step.n].join('|')];
   step.ty = pair.before;
   step.qualified = annotations(step,sourceReview(step,process.id,frame.id)).length > 0;
   step.overviewType = step.qualified ? nextType[step.ty] : step.ty;
  }
 }
}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cleanName=f=>f.name.replace(/^Stage \d+:\s*/,'');
let engine,nodes,scale=1,filter='all',activeStage=0,selected=null,opener=null,mode='detail',paused=reduced.matches,overviewScale=1,flow,selectedProcess=null;
const signalRecords=[];
let mapOriginY=0;
const fitted={detail:true,overview:true};
const viewportWidth=()=>document.documentElement.clientWidth;
const stageBar=$('.stage-navigation'),controlBar=$('#map-controls'),legendBar=$('#legend');
let pinnedHeight=0;
function fitWidth(){fitted[mode]=true;if(mode==='overview')setOverviewScale(viewportWidth()/flow.width);else updateScale(viewportWidth()/engine.getDimensions().width);}
function scrollToNode(target){const box=target.getBoundingClientRect(),header=pinnedHeight;return scrollPageTo(scrollY+box.top-header-Math.max(20,(innerHeight-header-box.height)/2),{left:scrollX+box.left-(viewportWidth()-box.width)/2});}
const activities=()=>Object.values(nodes).filter(n=>n.s&&!n.kind);
const ns='http://www.w3.org/2000/svg';
function el(tag,attrs={},text){const node=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,String(v)));if(text!==undefined)node.textContent=text;return node;}
function txt(x,y,content,size=10,color='var(--ink)',weight=400){return el('text',{x,y,'font-size':size,fill:color,'font-weight':weight,'font-family':'Inter, sans-serif'},content);}
// Size source layout columns before routing, using the same font and padding as the nodes.
function textWidth(value,size,lines,min,padding=24,weight=400){
 let low=Math.max(min,Math.ceil(Math.max(0,...String(value||'').split(/\s+/).map(w=>measureText(w,size,weight)))+padding+1)),high=Math.max(low,Math.ceil(measureText(value,size,weight)+padding+1));
 while(low<high){const mid=Math.floor((low+high)/2);if(fitLines(value,mid-padding,size,Infinity,weight).length<=lines)high=mid;else low=mid+1;}
 return low;
}
function sourceSteps(steps){return steps.flatMap(s=>s.split?s.branches.flatMap(b=>sourceSteps(b.steps)):s.fork?s.branches.flatMap(b=>sourceSteps([b.step])):s.gate?(s.fix?[s.fix]:[]):[s]);}
// The source stores statuses on records, held suggestions and review entries.
// Keep their wording intact when rebuilding the activity and opportunity cards.
function sourceReview(record,processId,frameId,opportunity=false){
 return data.review?.[opportunity?`${processId||frameId}|opp`:`${processId}|${record.n}`]||data.review?.[record.t]||{};
}
function annotations(record,review={}){
 if(!isAI||!record)return [];
 const label=(record.feas||record.holdfeas||review.feas||'').trim();
 const tone=opportunityTones.get(label.toLowerCase());
 return tone?[{kind:'feasibility',label,tone}]:[];
}
function nodeAnnotations(n){
 const record=n.s||n.opp;
 return record?annotations(record,sourceReview(record,n.P?.id,n.f.id,!!n.opp)):[];
}
function annotationLayout(items,width){
 return items.map(item=>{
  const size=8.8,weight=600;
  const lines=fitLines(item.label,width-16,size,Infinity,weight);
  return {...item,size,weight,lines,height:Math.max(18,lines.length*11.5+7)};
 });
}
const activityHeight=94;
const activityTop=n=>n.y+(n.h-activityHeight)/2;
const annotationHeight=(items,width)=>annotationLayout(items,width).reduce((sum,item)=>sum+item.height+4,0);
const processWidths=new Map(frames.flatMap(f=>f.procs.map(p=>[p,{
 activity:Math.max(158,...sourceSteps(p.steps).map(s=>Math.max(textWidth(titleCase(s.t),10.6,3,158),textWidth((s.sys||'').replace(/;\s*/g,' · '),8,1,158,24+(s.pp?.length?measureText('Pain Point',8)+10:0))))),
 input:Math.max(textWidth(p.inbox[0],10.5,1,118),textWidth(p.inbox[1],11.2,3,118)),
 output:textWidth(p.outdoc||'',10,3,150,28,500)
}])));
const processFooterGap=new Map(frames.flatMap(f=>f.procs.map(p=>[p,Math.max(0,
 ...sourceSteps(p.steps).map(s=>annotationHeight(annotations(s,sourceReview(s,p.id,f.id)),processWidths.get(p).activity)),
 annotationHeight(annotations(p.opp,sourceReview(p.opp||{},p.id,f.id,true)),280))])));
const frameFooterGap=new Map(frames.map(f=>[f,annotationHeight(annotations(f.opp,sourceReview(f.opp||{},null,f.id,true)),460)]));
function drawAnnotations(group,n){
 let y=n.s?activityTop(n)+100+(n.s.out?.length?16:0):n.y+n.h+6;
 for(const item of annotationLayout(nodeAnnotations(n),n.w)){
  const tag=el('g',{class:'node-annotation','data-node-annotation':item.kind,'data-tone':item.tone,'data-label':item.label,role:'img','aria-label':`${titleCase(item.kind)}: ${item.label}`});
  tag.append(el('title',{},item.label),el('rect',{x:n.x,y,width:n.w,height:item.height,rx:4}));
  item.lines.forEach((line,i)=>{
   const label=txt(n.x+n.w/2,y+12+i*11.5,line,item.size,'#fff',item.weight);
   label.setAttribute('text-anchor','middle');tag.append(label);
  });
  group.append(tag);y+=item.height+4;
 }
}
// A shared reading grid keeps challenge and initiative rows aligned.
const registerGap=18;
const registerColumns=items=>Math.min(items.length,4);
function registerWidth(items,min,kind){
 const columns=registerColumns(items,kind);
 return columns<=2?560:368;
}
function registerContent(c,width){
 const copy=fitLines(c.full||c.t,width-40,12,Infinity,450);
 const reference=fitLines(c.ref||'',width-72,9.5,Infinity,400);
 const bodyLines=Math.max(2,copy.length),referenceLines=Math.max(1,reference.length);
 return {copy,reference,height:132+(bodyLines-2)*17+(referenceLines-1)*13};
}
function drawRegisterCard(group,n){
 const challenge=n.kind==='ch',layout=registerContent(n.c,n.w);
 const label=challenge?'CHALLENGE':`SOLUTION ${n.c.st||'TPI'}`;
 const badgeWidth=measureText(label,9,600)+18;
 group.classList.add('register-card');group.classList.toggle('challenge-node',challenge);
 group.dataset.registerKind=n.kind;
 group.replaceChildren(el('title',{},`${label}: ${n.c.full||n.c.t}${n.c.ref?' · '+n.c.ref:''}`),
  el('rect',{class:'b',x:n.x,y:n.y,width:n.w,height:n.h,rx:12}),
  el('rect',{class:'register-badge',x:n.x+18,y:n.y+15,width:badgeWidth,height:19,rx:5}));
 const badge=txt(n.x+27,n.y+28,label,9,'var(--register-accent)',600);badge.classList.add('register-label');group.append(badge);
 layout.copy.forEach((line,i)=>{
  const text=txt(n.x+20,n.y+55+i*17,line,12,'var(--ink)',450);text.classList.add('register-copy');group.append(text);
 });
 const footerY=n.y+n.h-19-(Math.max(1,layout.reference.length)-1)*13;
 group.append(el('line',{class:'register-divider',x1:n.x+20,x2:n.x+n.w-20,y1:footerY-18,y2:footerY-18}));
 layout.reference.forEach((line,i)=>{
  const text=txt(n.x+20,footerY+i*13,line,9.5,'var(--register-muted)');text.classList.add('register-reference');group.append(text);
 });
 // The complete card remains the existing pointer and keyboard target.
 const arrowX=n.x+n.w-29,arrowY=n.y+n.h-25;
 group.append(el('path',{class:'register-open',d:`M${arrowX-4},${arrowY+8} l8,-8 m-7,0 h7 v7`,fill:'none','aria-hidden':'true'}));
}
function drawRegisterHeadings(){
 svg.querySelectorAll('.source-register-heading').forEach(g=>g.remove());
 for(const f of frames)for(const kind of ['ch','tpi']){
  const entries=Object.values(nodes).filter(n=>n.f===f&&n.kind===kind);if(!entries.length)continue;
  const first=entries[0],columns=registerColumns(entries,kind),width=first.w*columns+registerGap*(columns-1);
  const group=el('g',{class:'register-heading','data-register-heading':kind,'data-frame':f.id});
  group.append(txt(first.x,first.y-16,kind==='ch'?'Challenges':'TPI / CI initiatives',14,'var(--ink)',600));
  const count=txt(first.x+width,first.y-16,`${entries.length} ${kind==='ch'?'documented':entries.length===1?'initiative':'initiatives'}`,10,'var(--muted)',400);count.setAttribute('text-anchor','end');group.append(count);
  svg.append(group);
 }
}
function stageHeadingName(f){return titleCase(cleanName(f));}
const localProcessIds=new Set(frames.flatMap(f=>f.procs.map(p=>p.id)));
function dependencyType(partner){
 // Numbered tower references follow the source HTML's activity/owner rule.
 // The two FP&A maps also reference their stages and processes by local IDs.
 let owner=/^([A-Z0-9&]+)-\d+/.exec(partner)?.[1];
 if(!owner && (localProcessIds.has(partner)||/^Stage \d+$/.test(partner)))owner=t.sourceKey;
 if(!owner && /^FP&A Ops \d+$/.test(partner))owner='FPAO';
 return owner?{kind:'activity',label:`Activity (${owner} team)`}:{kind:'team',label:'Team'};
}
function dependencyList(items){
 return items.length?`<ul class="dependency-list">${items.map(item=>{
  const type=dependencyType(item.p);
  return `<li data-dependency="${type.kind}"><span class="dependency-type">${esc(type.label)}</span> ${esc(item.p)}: ${esc(item.w)}</li>`;
 }).join('')}</ul>`:'';
}
const handoffVisibility=new IntersectionObserver(entries=>{
 for(const {target,isIntersecting} of entries)target.classList.toggle('in-view',isIntersecting);
});
abort.signal.addEventListener('abort',()=>handoffVisibility.disconnect(),{once:true});
const syncHandoffVisibility=()=>svg.classList.toggle('handoff-motion-hidden',document.hidden);
document.addEventListener('visibilitychange',syncHandoffVisibility,{signal:abort.signal});
syncHandoffVisibility();

function handoffIcon(direction,y){
 const icon=el('svg',{class:'handoff-illustration',x:24,y:y-11,width:78,height:49,viewBox:'0 0 84 52','aria-hidden':'true',focusable:'false','pointer-events':'none'});
 if(direction==='up'){
  icon.innerHTML=`<g transform="translate(44 25) rotate(-29)">
   <g class="rocket-exhaust">
    <path fill="#9774da" d="M3-4C-6-8-16-5-26-7L-21-3Q-32-4-44 1Q-31 1-26 3L-33 5Q-18 5-11 7Q-5 8 3 4Z"/>
    <path fill="#75beff" d="M2-4Q-5-6-18-3L-14-2Q-27-2-38 1Q-23 1-17 4L-21 5Q-10 5 2 3Z"/>
    <path fill="#d2fbff" d="M3-2.8Q-5-3.4-11-1.8L-9-.9-25 1Q-10 1-6 2.7L3 2.4Z"/>
   </g>
   <path class="handoff-particles" fill="#a6dbff" d="M-29-8l7 1-4 1z M-35 6l5-1-2 2z M-18 9l4-1-2 2z"/>
   <path fill="#ac80b9" stroke="#e0b6db" stroke-width=".7" d="M2-4L1-12Q7-12 15-5L12-1Z"/>
   <path fill="#9681ac" d="M-1-4L6-5 6 5-1 4-3 1Z"/>
   <path fill="#f5ecf6" d="M3-5.8Q16-12 34 0Q20 10.4 4 6.3Q1 2.4 3-5.8Z"/>
   <path fill="#cbbadb" d="M2.4 1.2Q14 7.3 31.9.9Q18.6 9.9 4 6.3Z"/>
   <path fill="#e3a7cf" d="M24-5.5Q30-3.4 34 0Q30.3 2.6 24.3 4.5Q27 .6 24-5.5Z"/>
   <circle cx="17.1" cy="-1.1" r="4.2" fill="#5e476b"/><circle cx="17.1" cy="-1.1" r="2.9" fill="#77cfe3"/>
   <path fill="#e4fcfe" d="M15-1.9Q15.8-4 18.2-3L16.8-1.6Z"/>
   <path fill="#d0a4d1" stroke="#9e75aa" stroke-width=".7" d="M13 3.5Q9.5 9.7-2 12L1.5 5.4Z"/>
   <path fill="#cab4d5" d="M1-5L3-5.8 3.3 5.7 1.2 5Z"/>
  </g>`;
 }else{
  icon.innerHTML=`<g transform="translate(48 27) rotate(29)">
   <g class="asteroid-tail">
    <path fill="#fa8841" d="M13-8C1-14-6-6-17-14Q-15-9-10-7C-23-10-30-3-48-7C-41-1-32 1-24 2Q-28 4-36 4C-24 12-12 5-5 12Q-8 8-12 7C-2 8 3 15 14 11Z"/>
    <path fill="#ffc267" d="M12-7C1-11-5-6-11-9Q-9-6-6-4C-18-7-23-2-34-3Q-27 2-17 2L-22 5C-10 4-4 9 14 10Z"/>
    <path fill="#ffe8a5" d="M15-5C6-9 1-5-4-7L-.8-3.3C-7-4-13-1-20-1C-12 3-6 1-1 5Q4 10 14 7Z"/>
   </g>
   <path class="handoff-particles" fill="#ffb566" d="M-27-10q3-.2 5 2.6-4 .3-5-2.6z M-29 6q4 .1 6 1.6-5 1.4-6-1.6z M-15 11l4 1-1.5 1.3z"/>
   <path fill="#dc7047" stroke="#ffcb84" stroke-width="1.2" d="M1-5Q2-8.5 7-9.2L14-10Q18-10.3 20-7L24-1Q26 2 23 5.5L19 10Q17 12 12.5 11L5 9Q2 8.1 1 5L-.4 1Z"/>
   <path fill="#f29359" d="M1.8-4.8Q2.8-8 7-8.5L14-9.1Q17-9.6 19-7L21-4.2Q14-6.3 8-2.7L1.2 1.5Z"/>
   <path fill="#b0513e" d="M16.2-3.4Q18.4-4.6 20-2.1Q21.2.2 18.5 1.4Q16.6 2.4 15.5.6Q14.1-1.6 16.2-3.4Z"/>
   <ellipse cx="7.4" cy=".5" rx="2.1" ry="1.6" fill="#b25540"/><circle cx="12.8" cy="6.7" r="1.3" fill="#ac513e"/>
  </g>`;
 }
 return icon;
}
function drawHandoffs(f,direction,y){
 const items=f[direction]||[];if(!items.length)return;
 const row=el('g',{class:'stage-handoffs','data-direction':direction,'data-frame':f.id});
 const label=direction==='up'?'Upstream':'Downstream',labelX=108;
 const icon=handoffIcon(direction,y);
 const heading=txt(labelX,y+20,label,14,'var(--ink)',600);
 const lineStart=labelX+measureText(label,14,600)+9;
 const rail=el('path',{class:'handoff-rail','aria-hidden':'true'});
 row.append(icon,heading,rail);

 let x=Math.ceil(lineStart+23),lastPort=x;
 for(const item of items){
  const name=item.w.startsWith('NEW · ')?`NEW · ${item.p}`:item.p;
  const type=dependencyType(item.p);
  const width=Math.ceil(Math.max(measureText(name,12,500),measureText(type.label,10,600)))+35;
  const directionLabel=label+' · '+type.label;
  const group=el('g',{class:'handoff-label','data-dependency':type.kind,role:'button',tabindex:0,'aria-label':`${directionLabel} · ${item.p}: ${item.w}`,'aria-haspopup':'dialog'});
  const caption=txt(x+16,y+7,type.label,10,'var(--handoff-port)',600);
  caption.setAttribute('class','dependency-type');
  lastPort=x+6;
  const port=type.kind==='team'
   ?el('circle',{class:'handoff-port',cx:lastPort,cy:y+18,r:3.3})
   :el('path',{class:'handoff-port',d:`M${lastPort} ${y+13.7}l4.3 4.3-4.3 4.3-4.3-4.3Z`});
  group.append(
   el('title',{},`${directionLabel} · ${item.p}: ${item.w}`),
   el('rect',{class:'handoff-hit',x,y:y-6,width,height:40,rx:5}),
   el('path',{class:'handoff-branch',d:`M${lastPort} ${y+31}V${y+18}`}),
   port,caption,txt(x+16,y+22.5,name,12,'var(--ink)',500),
   el('path',{class:'handoff-chevron',d:`M${x+width-11} ${y+15}l3 3-3 3`})
  );
  const show=()=>showHandoffCard({f,kind:'handoff',item,direction},group);
  group.onclick=show;
  group.onkeydown=event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();show();}};
  row.append(group);
  x+=width+9;
 }
 // Each partner branches from the same handoff. The shared line ends at the last branch.
 rail.setAttribute('d',`M${lineStart} ${y+15}h5q3 0 5 3l6 10q2 3 5 3H${lastPort}`);
 svg.append(row);
 handoffVisibility.observe(icon);
}
function showHandoffCard(n,target){opener=target;$('#card-context').textContent=`Stage ${frames.indexOf(n.f)+1} · ${n.direction==='up'?'Upstream':'Downstream'} · ${dependencyType(n.item.p).label}`;$('#card-content').innerHTML=`<h2 id="card-title">${esc(n.item.p)}</h2><p class="card-description">${esc(n.item.w)}</p><p class="source-note">${esc(n.item.src)}</p>`;$('#card-next').hidden=true;$('#card-detail').hidden=true;if(!card.matches(':popover-open'))card.showPopover();positionCard(target);card.scrollTop=0;$('#close-card').focus({preventScroll:true});}
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
 svg.querySelectorAll('defs marker[viewBox="0 0 10 10"]').forEach(m=>m.setAttribute('refX','10'));
 svg.querySelectorAll('defs marker path').forEach(p=>p.setAttribute('fill','var(--navy)'));
 frames.forEach((f,i)=>{const y=f._box.top,acts=activities().filter(n=>n.f===f),count=ty=>acts.filter(n=>n.s.ty===ty).length;const group=el('g',{'data-stage-heading':i});group.append(el('rect',{x:0,y:y-8,width:data._fr,height:130,fill:'var(--base)'}));group.append(el('line',{x1:24,x2:data._fr-24,y1:y-7,y2:y-7,class:'stage-rule'}));const num=txt(38,y+42,String(i+1).padStart(2,'0'));num.setAttribute('class','stage-index-label');const title=txt(90,y+32,stageHeadingName(f));title.setAttribute('class','stage-label');const owner=txt(90,y+60,f.owner);owner.setAttribute('class','stage-owner');group.append(num,title,owner);num.setAttribute('role','button');num.setAttribute('tabindex','0');num.setAttribute('aria-label',`Stage ${i+1} Information`);const stageCard=()=>showProcessCard({id:f.id,f,P:null,st:i+1,index:i+1,t:stageHeadingName(f),count:acts.length,man:count('man'),hyb:count('hyb'),auto:count('auto'),pain:[...new Set([...(f.stagePain||[]),...acts.flatMap(n=>n.s.pp||[])])],inp:f.up.map(u=>u.p+': '+u.w),out:f.down.map(u=>u.p+': '+u.w)},num);num.onclick=stageCard;num.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();stageCard();}};
 const stats=el('g',{class:'stage-stats'}),stat1=txt(0,y+25,`Viewing Stage ${i+1} of ${frames.length}`,11.5,'var(--muted)'),stat2=txt(0,y+46,`${acts.length} activities · `+[['man','manual'],['hyb','semi'],['auto','auto']].filter(([t])=>count(t)).map(([t,l])=>`${count(t)} ${l}`).join(' · '),11.5,'var(--muted)');[stat1,stat2].forEach(t=>t.setAttribute('text-anchor','end'));stats.append(stat1,stat2);let barX=-160;['man','hyb','auto'].forEach(ty=>{const width=160*count(ty)/acts.length;if(width)stats.append(el('rect',{x:barX,y:y+62,width,height:3,fill:typeColors[ty],class:'stage-mix'}));barX+=width;});group.append(stats);svg.append(group);drawHandoffs(f,'up',y+86);drawHandoffs(f,'down',f._box.bot-46);});
 for(const n of Object.values(nodes)){
  let group=svg.querySelector(`[data-id="${CSS.escape(n.id)}"]`);
  if(n.s&&!n.kind&&group){const s=n.s,top=activityTop(n);group.replaceChildren(el('title',{},s.t));group.append(el('rect',{class:'b',x:n.x,y:top,width:n.w,height:activityHeight,rx:8}));
   // Both detailed views use the documented activity type.
   group.classList.remove('ty-man','ty-hyb','ty-auto');
   group.classList.add('ty-'+s.ty);
   group.append(txt(n.x+12,top+26,String(s.n).padStart(2,'0'),8.2,'var(--accent)',400));
   if(s.qualified && (payload.activityBadges ? payload.activityBadges[n.id]?.length : s.ch && s.ch!=='same')){
    const badge=txt(n.x+29+measureText(String(s.n).padStart(2,'0'),8.2),top+26,'AI',8.2,'var(--prop)',600);
    badge.setAttribute('class','activity-badges');
    group.append(badge);
   }
   const label=txt(n.x+n.w-12,top+26,typeNames[s.ty],8.2,'var(--muted)',400);label.setAttribute('text-anchor','end');group.append(label);group.append(el('circle',{cx:n.x+n.w-18-measureText(typeNames[s.ty],8.2),cy:top+23,r:2.1,fill:typeColors[s.ty]}));
   const lines=fitLines(titleCase(s.t),n.w-24,10.6,3),start=lines.length===1?57:lines.length===2?49:40;lines.forEach((line,j)=>group.append(txt(n.x+12,top+start+j*14.8,line,10.6,'var(--ink)',400)));
   const system=fitLines((s.sys||'').replace(/;\s*/g,' · '),n.w-24-(s.pp?.length?measureText('Pain Point',8)+10:0),8,1)[0]||'';group.append(txt(n.x+12,top+84,system,8,'var(--muted)'));
   if(s.pp?.length){const pain=txt(n.x+n.w-12,top+84,'Pain Point',8,'var(--pain)');pain.setAttribute('text-anchor','end');group.append(pain);}
   // Step handoffs use the mockup's fine vertical marker and plain text.
   if(s.in?.length&&!s.inhide){const who=s.in.map(x=>x[0]).join(' + '),what=s.in.length===1?s.in[0][1]:'Inputs';const text=fitLines(`${who} · ${what}`,n.w+20,8.6,1)[0];const input=el('g',{class:'step-handoff'});input.append(el('line',{x1:n.x,x2:n.x,y1:top-24,y2:top-7}),txt(n.x+10,top-13,text,8.6,'var(--muted)'));svg.append(input);}
   if(s.out?.length){const output=txt(n.x+8,top+108,fitLines(s.out.map(x=>x[0]).join(' · '),n.w-16,8.5,1)[0],8.5,'var(--muted)');output.setAttribute('class','step-output');svg.append(output);}
  }
  if(!group&&['in','out'].includes(n.kind)){
   group=[...svg.children].find(g=>g.tagName==='g'&&!g.hasAttribute('data-id')&&[...g.children].some(c=>c.tagName==='rect'?Number(c.getAttribute('x'))===n.x&&Number(c.getAttribute('y'))===n.y:c.tagName==='path'&&(c.getAttribute('d')||'').startsWith(`M${n.x},${n.y} `)));
   if(group){group.dataset.id=n.id;group.classList.add('source-io');group.setAttribute('tabindex','0');group.setAttribute('role','button');if(n.kind==='in'){const top=activityTop(n);group.replaceChildren(el('title',{},`${n.lab}: ${n.txt}`),el('rect',{x:n.x,y:top,width:n.w,height:activityHeight,rx:8,fill:'#47304b',stroke:'#725c7b','stroke-width':.7}),txt(n.x+12,top+24,fitLines(n.lab,n.w-24,10.5,1)[0],10.5,'var(--accent)'));const copy=n.txt;fitLines(copy,n.w-24,11.2,3).forEach((line,i)=>group.append(txt(n.x+12,top+47+i*15.4,line,11.2,'var(--ink)',400)));}}
  }
  if(group&&n.kind==='dec'){
   const question=group.querySelector(':scope > text');
   if(question){
    question.remove();
    group.querySelectorAll(':scope > rect').forEach(rect=>rect.remove());
    const maxLines=payload.stageInitiatives ? n.dec.ql || 3 : 2;
    const width=payload.stageInitiatives ? textWidth(n.dec.q,9.5,maxLines,130,0,500) : 130;
    const lines=fitLines(n.dec.q,width,9.5,maxLines,500),cx=n.x+n.w/2,start=n.y-8-(lines.length-1)*13;
    const label=el('g',{class:'decision-label','text-anchor':'middle','pointer-events':'bounding-box'});
    lines.forEach((line,i)=>label.append(txt(cx,start+i*13,line,9.5,'var(--accent)',500)));
    group.append(label);
   }
  }
  if(group&&['ch','tpi'].includes(n.kind))drawRegisterCard(group,n);
  if(group&&n.opp){const o=n.opp;group.replaceChildren(el('title',{},o.t),el('rect',{class:'b',x:n.x,y:n.y,width:n.w,height:n.h,rx:8,fill:'#3a304b',stroke:'#bda6df'}));group.append(txt(n.x+12,n.y+20,'AI Opportunity',9,'var(--prop)',600));fitLines(titleCase(o.t),n.w-24,10.6,3).forEach((line,i)=>group.append(txt(n.x+12,n.y+39+i*14.8,line,10.6,'var(--ink)')));}
  if(group&&n.kind==='out'){group.querySelectorAll('text').forEach(t=>t.remove());fitLines(n.doc,n.w-28,10,3,500).forEach((line,i)=>group.append(txt(n.x+12,n.y+21+i*13.5,line,10,'var(--ink)',500)));}
  if(group){if(n.s||n.opp)drawAnnotations(group,n);group.onclick=()=>showCard(n.id,group);group.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();showCard(n.id,group);}};group.setAttribute('aria-haspopup','dialog');const label=n.s?`${n.s.n}. ${n.s.t}. ${typeNames[n.s.ty]}. Open details.`:n.kind==='dec'?`Decision: ${n.dec.q}. Open details.`:n.kind==='in'?`${n.lab}. ${n.txt}`:n.kind==='out'?`Output: ${n.doc}`:n.opp?.t||n.c?.full||n.c?.t||'Open details';group.setAttribute('aria-label',[label,...nodeAnnotations(n).map(a=>`${titleCase(a.kind)}: ${a.label}`)].join(' '));}
 }
 drawRegisterHeadings();
 // A reserved header band keeps labels independent of node and dependency geometry.
 svg.querySelectorAll('.source-process-heading').forEach(g=>g.remove());
 frames.forEach((f,fi)=>f.procs.forEach((p,pi)=>{const first=nodes[`${f.id}|${p.id}|in`];if(!first)return;const x=first.x,y=p._headingY-4,g=el('g',{class:'process-heading','data-process-heading':p.id});const badge=`Process ${fi+1}.${pi+1}`,bw=measureText(badge,9.5,500)+18,titleX=x+bw+14;
 g.append(el('rect',{x,y:y-13,width:bw,height:20,rx:10,fill:'#403047'}),txt(x+9,y,badge,9.5,'var(--muted)',500),txt(titleX,y,titleCase(p.name),12,'var(--ink)',600),txt(titleX,y+19,`${p.id} · ${p.owner}`,10.5,'var(--muted)'));
 svg.append(g);
 }));
 fitSvgLabels(svg);
 svg.querySelectorAll(':scope > text').forEach(t=>{if(/^(Flow |Phase |Process |TPI \/ CI)/.test(t.textContent)){t.childNodes.forEach(n=>{if(n.nodeType===3)n.nodeValue=titleCase(n.nodeValue);});t.setAttribute('font-weight','600');}});
 // Retain the source route and its direction, attaching each vertical port to the
 // visible card. The source uses a different card height for AI Suggested.
 const cards=Object.values(nodes).filter(n=>(n.s&&!n.kind)||n.kind==='in');
 for(const path of svg.querySelectorAll(':scope > path')){
  if(path.dataset.returnFrom){
   const from=nodes[path.dataset.returnFrom],to=nodes[path.dataset.returnTo];
   const bottom=n=>activityTop(n)+activityHeight;
   const lane=Math.max(...cards.filter(n=>n.P===from.P).map(n=>bottom(n)+
    (n.s?.out?.length?28:0)+annotationHeight(nodeAnnotations(n),n.w)))+18;
   const ax=from.x+from.w/2,bx=to.x+to.w/2+(from.P.back.dx||0);
   path.setAttribute('d',`M${ax},${bottom(from)} L${ax},${lane} L${bx},${lane} L${bx},${bottom(to)}`);
   continue;
  }
  const d=path.getAttribute('d')||'';
  const points=[...d.matchAll(/([ML])(-?[\d.]+)[, ](-?[\d.]+)/g)];
  if(points.length<2)continue;
  let route=d;
  for(const [tip,adjacent] of [[points.at(-1),points.at(-2)],[points[0],points[1]]]){
   const x=Number(tip[2]),y=Number(tip[3]);
   if(x!==Number(adjacent[2])||y===Number(adjacent[3]))continue;
   const card=cards.find(n=>x>n.x&&x<n.x+n.w&&(y===n.y||y===n.y+n.h));
   if(!card)continue;
   const edge=activityTop(card)+(y===card.y?0:activityHeight);
   route=route.slice(0,tip.index)+tip[1]+x+','+edge+route.slice(tip.index+tip[0].length);
  }
  if(route!==d)path.setAttribute('d',route);
 }
 // Keep arrowheads and their moving highlights behind every process node and status tag.
 const connections=el('g',{class:'map-connections','pointer-events':'none'});
 svg.insertBefore(connections,svg.querySelector(':scope > :not(defs):not(style)'));
 for(const path of svg.querySelectorAll(':scope > path:is(.fl,.rw,[marker-end])')){
  connections.append(path);
  if(path.classList.contains('fl')){
   const signal=el('path',{d:path.getAttribute('d'),class:'signal'});
   signal.style.animationDelay=`-${(signalRecords.length%17)*.27}s`;
   connections.append(signal);
   signalRecords.push({path,signal});
  }
 }
}
const block=(label,body,extra='')=>body?`<section class="record-section ${extra}"><h3>${label}</h3>${body}</section>`:'';
const paragraph=v=>v?`<p>${esc(v)}</p>`:'';
const list=values=>values?.length?`<ul>${[...new Set(values)].map(v=>`<li>${esc(v)}</li>`).join('')}</ul>`:'';
const handoffs=values=>{
 if(!values?.length)return '';
 if(payload.stageInitiatives)return dependencyList(values.map(([p,w])=>({p,w})));
 return values.map(([who,what])=>`<p><strong>${esc(who)}</strong> · ${esc(what)}</p>`).join('');
};

const valueText=value=>value==null?'':typeof value==='object'?Array.isArray(value)?value.map(valueText).join(' · '):Object.entries(value).map(([k,v])=>`${k}: ${valueText(v)}`).join(' · '):String(value);
const detailFields=value=>value&&typeof value!=='object'?paragraph(value):value&&Object.keys(value).length?`<dl class="record-meta">${Object.entries(value).filter(([,v])=>v!=null&&v!=='').map(([k,v])=>`<div><dt>${esc(titleCase(k))}</dt><dd>${esc(valueText(v))}</dd></div>`).join('')}</dl>`:'';
function aiDetails(s,n){
 const review=data.review?.[`${n.P.id}|${s.n}`]||data.review?.[s.t]||{};
 return block('AI suggestion',paragraph(s.rec||s.sug||review.sug||(!s.ch||s.ch==='same'?'No change proposed for this step.':'')))+
 block('Tools',paragraph(s.tools||review.tools))+block('Proposal basis',paragraph(s.opp))+block('Feasibility',paragraph(s.feas||s.holdfeas||review.feas))+
 block(s.feasl||'Review comments',paragraph(s.feasc||review.comment))+block('Validation note',paragraph(s.feasx))+block('Scope',paragraph(s.scope||review.scope))+block('AI option',detailFields(s.cop))+
 block('Proposed pain-point resolutions',list((s.pp||[]).map(p=>valueText(data.fixes?.[p])).filter(Boolean)))+block('Source review',detailFields(review));
}

function record(n){
 if(n.opp){const o=n.opp,review=data.review?.[`${n.P?.id||n.f.id}|opp`]||data.review?.[o.t];return `<h2 id="card-title">${esc(o.t)}</h2><p class="card-description">${esc(o.d)}</p>${block('Opportunity type',paragraph(o.ty))}${block('Reference',paragraph(o.rid))}${block('Feasibility',paragraph(o.feas||review?.feas))}${block('Validation note',paragraph(o.feasx))}${block('Scope',paragraph(o.scope||review?.scope))}${block('Review comments',paragraph(o.feasc||review?.comment))}${block('Source review',detailFields(review))}`;}
 if(n.s&&!n.kind){const s=n.s;return `<h2 id="card-title">${esc(s.t)}</h2><p class="card-description">${esc(s.d)}</p><dl class="record-meta"><div><dt>Owner</dt><dd>${esc(s.o||n.P.owner)}</dd></div><div><dt>Activity type</dt><dd style="color:${typeColors[s.ty]}">${typeNames[s.ty]}</dd></div><div><dt>Systems</dt><dd>${esc(s.sys)}</dd></div><div><dt>Process</dt><dd>${esc(n.P.name)}</dd></div></dl>${isAI?aiDetails(s,n):''}${block('Inputs',handoffs(s.in))}${block('Outputs',handoffs(s.out))}${s.dec?block('Decision',paragraph(s.dec.q)+`<p><strong>Yes</strong> · ${esc(s.dec.yes)}<br><strong>No</strong> · ${esc(s.dec.no)}</p>`):''}${block('Documented pain points',list(s.pp),'pain')}${block('Control',paragraph(s.ctl))}${block('Existing CI / TPI',paragraph(s.ci))}${block('Review notes',paragraph(s.note))}${block('Source feedback',paragraph(s.fb))}<p class="source-note">${esc(s.src||`${t.name} · ${viewLabel} Source`)}</p>`;}
 if(n.kind==='dec'){const d=n.dec;return `<h2 id="card-title">${esc(d.q)}</h2>${paragraph(d.d)}${block('Validation note',paragraph(d.feasx||n.step?.feasx))}${block('If yes',paragraph(d.yes))}${block('If no',paragraph(d.no))}${block('Checked by',paragraph(d.o||n.P.owner))}${block('Example',paragraph(d.ex))}${block('Systems',paragraph(d.sys))}${block('Documented pain points',list(d.pp),'pain')}<p class="source-note">${esc(d.src||n.step?.src||`Decision Recorded in the ${t.name} ${viewLabel} Process Map.`)}</p>`;}
 if(n.kind==='in'||n.kind==='out'){return `<h2 id="card-title">${esc(n.kind==='in'?n.lab:'Process output')}</h2><p class="card-description">${esc(n.kind==='in'?n.txt:n.doc)}</p>${block('Process',paragraph(n.P.name))}${block('Owner',paragraph(n.P.owner))}${block(n.kind==='in'?'Upstream dependencies':'Downstream handoffs',dependencyList(n.kind==='in'?n.f.up:n.f.down))}${block('Notes',paragraph(n.P.outnote))}`;}
 if(n.c){const c=n.c;const refs=(c.steps||[]).map(ref=>nodes[`${n.f.id}|${ref}`]).filter(Boolean);return `<h2 id="card-title">${n.kind==='ch'?'Documented pain point':'Process improvement'}</h2><p class="card-description">${esc(c.full||c.t)}</p>${block('Affected activities',list(refs.map(x=>`${x.s?.n||''}. ${x.s?.t||x.P?.name||''}`)))}${block('Reference',paragraph(c.ref))}${block('Status',paragraph(c.st))}<p class="source-note">${esc(c.src||`${t.name} · ${viewLabel} Source`)}</p>`;}
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
function positionCard(target){const b=target.getBoundingClientRect(),w=card.offsetWidth,h=card.offsetHeight,margin=16;let x=b.right+18;if(x+w>innerWidth-margin)x=b.left-w-18;if(x<margin)x=Math.max(margin,Math.min(innerWidth-w-margin,b.left));const idealTop=innerWidth>760?Math.max(pinnedHeight+12,b.top-12):b.top-12;const y=Math.max(margin,Math.min(idealTop,innerHeight-h-margin));card.style.left=x+'px';card.style.top=y+'px';}
function closeCard(restore=true){if(card.matches(':popover-open'))card.hidePopover();if(restore&&opener)opener.focus({preventScroll:true});}
function updateMapEndPadding(){
 const remaining=(engine.getDimensions().height-frames.at(-1)._box.top)*scale;
 $('#process-map').style.paddingBottom=Math.max(0,innerHeight-pinnedHeight-remaining)+'px';
}
function updateHeader(){
 const previousHeight=pinnedHeight;
 root.style.setProperty('--map-viewport-width',viewportWidth()+'px');
 const stageHeight=stageBar.getBoundingClientRect().height;
 const controlsBottom=stageHeight+controlBar.getBoundingClientRect().height;
 pinnedHeight=controlsBottom+legendBar.getBoundingClientRect().height;
 root.style.setProperty('--stage-height',stageHeight+'px');
 root.style.setProperty('--controls-bottom',controlsBottom+'px');
 root.style.setProperty('--header-height',pinnedHeight+'px');
 if(engine && previousHeight!==pinnedHeight)updateMapEndPadding();
}
function updateStageStats(){const x=Math.min(data._fr-38,(innerWidth-60)/scale);svg.querySelectorAll('.stage-stats text').forEach(t=>t.setAttribute('x',x));svg.querySelectorAll('.stage-stats').forEach(g=>{g.style.display='';const heading=g.parentElement,labels=[heading.querySelector('.stage-label'),heading.querySelector('.stage-owner')],end=Math.max(...labels.map(t=>{const b=t.getBBox();return b.x+b.width;})),width=Math.max(...[...g.querySelectorAll('text')].map(t=>t.getComputedTextLength()));g.style.display=innerWidth<1400||end+28>x-width?'none':'';g.querySelectorAll('.stage-mix').forEach(r=>r.setAttribute('transform',`translate(${x},0)`));});}
function updateScale(value){const old=scale,minScale=Math.min(.35,viewportWidth()/engine.getDimensions().width);scale=Math.max(minScale,Math.min(2.5,value));engine.setScale(Math.min(2,scale));const dim=engine.getDimensions();svg.style.width=dim.width*scale+'px';svg.style.height=(dim.height-mapOriginY)*scale+'px';updateMapEndPadding();svg.setAttribute('viewBox',`0 ${mapOriginY} ${dim.width} ${dim.height-mapOriginY}`);$('#zoom-value').textContent=Math.round(scale*100)+'%';$('#zoom-out').disabled=scale<=minScale;$('#zoom-in').disabled=scale>=2.5;if(old!==scale)closeCard(false);updateStageStats();updateScroll();}
function jump(index,instant=false){activeStage=index;if(mode!=='detail')setMode('detail');closeCard(false);updateHeader();const y=($('#process-map').getBoundingClientRect().top+window.scrollY)+(frames[index]._box.top-mapOriginY)*scale-pinnedHeight-14;markStage(index);history.replaceState(null,'',`#tower=${t.sourceKey}&stage=${encodeURIComponent(frames[index].id)}`);return scrollPageTo(y,{instant});}
function markStage(i){activeStage=i;$$('#stages button').forEach((b,j)=>b.setAttribute('aria-current',i===j?'step':'false'));$('#stage-select').value=String(i);if($('#current-stage'))$('#current-stage').textContent=`Viewing stage ${i+1} of ${frames.length} · ${names[i]}`;updateFilterStatus();}
function updateFilterStatus(){
 const group=mode==='overview'?activities():activities().filter(n=>n.f===frames[activeStage]);
 const count=group.filter(n=>filter==='all'||filter==='pp'&&n.s.pp?.length||(mode==='overview'?n.s.overviewType:n.s.ty)===filter).length;
 if($('#filter-status'))$('#filter-status').textContent=filter==='all'?`${group.length} activities${mode==='overview'?` across ${Object.keys(flow.records).length} ${['FPAC','FPAO'].includes(t.sourceKey)?'processes':'stages'}`:' in this stage'}`:`${count} of ${group.length} activities in focus${count===0?' · flow retained':''}`;
 if(mode==='overview')if($('#current-stage'))$('#current-stage').textContent=`High-Level Flow · ${t.name}`;
}
const traceVisibility=new IntersectionObserver(entries=>{
 for(const {target,isIntersecting} of entries)target.classList.toggle('in-view',isIntersecting);
});
abort.signal.addEventListener('abort',()=>traceVisibility.disconnect(),{once:true});
function highlightFilterMatches(pointerClick){
 traceVisibility.disconnect();
 $$('.filter-highlight,.filter-trace').forEach(layer=>layer.remove());
 if(filter==='all')return;
 const category=filter==='pp'?'.has-pp':'.ty-'+filter;
 root.style.setProperty('--filter-ink',filter==='pp'?'var(--pain)':typeColors[filter]);
 const activeMap=mode==='detail'?svg:$('#overview-svg');
 for(const body of $$(`.nd${category} > .b, .flow-node:not(.unfocused) > .flow-node-body`)){
  const highlight=body.cloneNode(false);
  highlight.setAttribute('class','filter-highlight');
  highlight.setAttribute('aria-hidden','true');
  const trace=highlight.cloneNode(false);
  trace.setAttribute('class','filter-trace');
  trace.setAttribute('pathLength','100');
  body.after(highlight,trace);
  traceVisibility.observe(trace);
  if(pointerClick&&!reduced.matches&&body.ownerSVGElement===activeMap){
   highlight.animate([{opacity:.2},{opacity:1}],{duration:180,easing:'cubic-bezier(0.22, 1, 0.36, 1)'});
  }
 }
}
function setOverviewScale(value){const minScale=Math.min(.35,viewportWidth()/flow.width);overviewScale=Math.max(minScale,Math.min(2.5,value));flow.setScale(overviewScale);$('#zoom-value').textContent=Math.round(overviewScale*100)+'%';$('#zoom-out').disabled=overviewScale<=minScale;$('#zoom-in').disabled=overviewScale>=2.5;closeCard(false);}
function setMode(next){
 mode=next;
 root.dataset.mode=next;
 $('#dashboard').hidden=next!=='dashboard';
 $('#process-map').hidden=next!=='detail';
 $('#overview').hidden=next!=='overview';
 updateHeader();
 const selected=$('button[data-mode="'+next+'"]');
 $$('button[data-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===next)));
 closeCard(false);
 $('.skip').href='#'+selected.getAttribute('aria-controls');
 $('.skip').textContent=next==='dashboard'?'Skip to summary':'Skip to process map';
 if(next!=='dashboard'){
  if(fitted[next])fitWidth();
  else if(next==='overview')setOverviewScale(overviewScale);
  else updateScale(scale);
  updateFilterStatus();
 }
}
function processContext(r){
 const related=Object.values(nodes).filter(n=>n.f===r.f&&(!r.P||!n.P||n.P===r.P));
 const challenges=related.filter(n=>n.kind==='ch'&&(!r.P||!n.c.steps?.length||n.c.steps.some(ref=>ref.startsWith(r.P.id+'|'))));
 const tagged=related.filter(n=>nodeAnnotations(n).length);
 return {challenges,tagged};
}
function processSourceDetails(r){
 const {challenges,tagged}=processContext(r);
 const challengeRows=challenges.map(n=>`<li data-source-challenge="${esc(n.id)}"><div class="challenge-label"><strong>CHALLENGE</strong><span>${esc(n.c.ref)}</span></div><p>${esc(n.c.full||n.c.t)}</p></li>`).join('');
 const tagRows=tagged.map(n=>`<li data-source-node="${esc(n.id)}"><p>${esc(n.s?`Activity ${n.s.n} · ${n.s.t}`:`${n.P?'Process':'Stage'} opportunity · ${n.opp.t}`)}</p><div class="source-tags">${nodeAnnotations(n).map(a=>`<span class="source-tag" data-source-tag="${a.kind}" data-tone="${a.tone}">${esc(a.label)}</span>`).join('')}</div></li>`).join('');
 const challengeText=new Set(challenges.map(n=>n.c.full||n.c.t));
 return block('Challenges',challengeRows?`<ul class="source-challenges">${challengeRows}</ul>`:'','pain')+
  block('Documented pain points',list(r.pain.filter(p=>!challengeText.has(p))),'pain')+
  block('Source tags',tagRows?`<ul class="source-tag-register">${tagRows}</ul>`:'');
}
function showProcessCard(r,target){
 selectedProcess=r;opener=target;markStage(r.st-1);flow.markStage(r.st-1);
 $('#card-context').textContent=`Process ${String(r.index).padStart(2,'0')} · Stage ${r.st} · ${r.id}`;
 const summary=payload.overviewNodes[r.id];
 const mixText=mix=>`${mix.man} manual · ${mix.hyb} semi · ${mix.auto} automated`;
 const meta=(label,value)=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`;
 let mixes=meta('As Is activity mix',mixText(r));
 if(isAI && mode==='overview'){
  mixes=meta('As Is activity mix',mixText(r.before))+meta('AI Suggested activity mix',mixText(r));
 }
 $('#card-content').innerHTML=`<h2 id="card-title">${esc(r.t)}</h2>
  ${summary?.description?`<p class="card-description">${esc(summary.description)}</p>`:''}
  <p>${r.count} activities · ${r.pain.length} documented pain point${r.pain.length===1?'':'s'}</p>
  <dl class="record-meta">${meta('Owner',r.P?.owner||r.f.owner)}${mixes}</dl>
  ${processSourceDetails(r)}${block('Inputs',dependencyList(r.f.up))}${block('Outputs',dependencyList(r.f.down))}
  <p class="source-note">${esc(t.name)} · ${viewLabel} Process</p>`;
 $('#card-next').hidden=true;$('#card-detail').hidden=false;
 if(!card.matches(':popover-open'))card.showPopover();positionCard(target);card.scrollTop=0;$('#close-card').focus({preventScroll:true});
}
async function openDetailedProcess(){if(!selectedProcess)return;const r=selectedProcess;setMode('detail');fitWidth();const first=activities().find(n=>r.P?n.P.id===r.id:n.f===r.f);if(first){const target=svg.querySelector(`[data-id="${CSS.escape(first.id)}"]`);if(await scrollToNode(target))showCard(first.id,target);}else jump(r.st-1);}
function updateScroll(){if(mode!=='detail')return;const y=(window.scrollY+pinnedHeight+35-($('#process-map').getBoundingClientRect().top+window.scrollY))/scale+mapOriginY;let idx=0;frames.forEach((f,i)=>{if(f._box.top<=y)idx=i;});markStage(idx);signalRecords.forEach(({path,signal})=>{const r=path.getBoundingClientRect();signal.style.animationPlayState=r.bottom>pinnedHeight&&r.top<innerHeight&&!paused?'running':'paused';});}
let ticking=false;listen('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(()=>{updateScroll();ticking=false;});}}, {passive:true});
try{
 engine=window.TowerRenderers[t.sourceKey](payload.key,{[scenario]:data},{svg:'#map-svg',det:'#native-detail',leg:'#native-legend',scroll:'#process-map',frameHeaderHeight:100,handoffStripHeight:52,processInputGap:64,feedHeight:134,feedTopGap:34,processWidths,processFooterGap,frameFooterGap,opportunityWidth:Math.max(280,...frames.flatMap(f=>f.procs.filter(p=>p.opp).map(p=>textWidth(p.opp.t,10.6,3,280,24)))),frameOpportunityWidth:Math.max(460,...frames.filter(f=>f.opp).map(f=>textWidth(f.opp.t,10.6,3,460,24))),stripWidth:registerWidth,stripColumns:registerColumns,stripGap:registerGap,stripRowGap:16,stripHeaderHeight:36,stripFooterGap:32,
 stripHeight:(items,width)=>Math.max(...items.map(c=>registerContent(c,width).height))});engine.render(scenario,'all');nodes=engine.getNodes();
 const geometry=Object.values(nodes).map(n=>({id:n.id,x:n.x,y:n.y,w:n.w,h:n.h,kind:n.kind||'activity'}));
 const edgePaths=[...svg.querySelectorAll('path.fl,path.rw')].map(p=>p.getAttribute('d'));
 skin();mapOriginY=Math.max(0,frames[0]._box.top-20);
 $('#stages').innerHTML=names.map((name,i)=>`<button data-stage="${i}" aria-current="${i===0?'step':'false'}" aria-label="Stage ${i+1}: ${esc(cleanName(frames[i]))}"><span class="stage-number">${i+1}</span><span>${esc(name)}</span></button>`).join('');
 $('#stage-select').innerHTML=frames.map((f,i)=>`<option value="${i}">${i+1}. ${esc(cleanName(f))}</option>`).join('');
 flow=makeSourceOverview($('#overview-svg'),payload,activities(),showProcessCard,t.sourceKey);
 $$('#overview-svg .flow-node').forEach(g=>{
  const {challenges,tagged}=processContext(flow.records[g.dataset.process]),count=tagged.reduce((sum,n)=>sum+nodeAnnotations(n).length,0);
  g.setAttribute('aria-label',g.getAttribute('aria-label')+` ${challenges.length} challenges. ${count} source tags.`);
 });fitSvgLabels($('#overview-svg'));overviewScale=viewportWidth()/flow.width;
 $('#total-count').textContent=activities().length;
 $$('#stages [data-stage]').forEach(b=>b.onclick=()=>jump(Number(b.dataset.stage)));$('#stage-select').onchange=e=>jump(Number(e.target.value));
 $$('[data-filter]').forEach(b=>b.onclick=event=>{
  filter=b.dataset.filter;engine.setFilter(filter);flow.setFilter(filter);
  highlightFilterMatches(event.detail>0);
  $$('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));updateFilterStatus();
 });
 $$('button[data-mode]').forEach(b=>b.onclick=()=>{setMode(b.dataset.mode);scrollPageTo(root.getBoundingClientRect().top+scrollY);});
 const manualZoom=delta=>{fitted[mode]=false;if(mode==='overview')setOverviewScale(overviewScale+delta);else updateScale(scale+delta);};
 $('#zoom-in').onclick=()=>manualZoom(.15);$('#zoom-out').onclick=()=>manualZoom(-.15);
 $('#fit').onclick=()=>{fitWidth();scrollPageTo(scrollY);};
 const astral=mountAstralBackground(root);
 // The galaxy runs continuously while visible. Only the OS reduced-motion preference stills it.
 const motion=()=>{paused=reduced.matches;root.classList.toggle('paused',paused);astral.setPaused(paused);updateScroll();};reduced.addEventListener('change',motion,{signal:abort.signal});
 $('#map-controls-toggle').onclick=()=>{const expanded=$('#map-controls-toggle').getAttribute('aria-expanded')!=='true';$('#map-controls-toggle').setAttribute('aria-expanded',String(expanded));$('#navigation').classList.toggle('controls-expanded',expanded);updateHeader();};
 if(isAI){const note=document.createElement('span');note.textContent='Activity colors and filters show the proposed activity type. Open an activity to compare its As Is and AI Suggested types.';$('#legend').append(note);}
 $('#legend-toggle').onclick=()=>{const legend=$('#legend');legend.hidden=!legend.hidden;$('#legend-toggle').setAttribute('aria-expanded',String(!legend.hidden));updateHeader();};
 $('#lab-return').onclick=()=>{closeCard(false);onReturn();};
 $('#card-detail').onclick=openDetailedProcess;$('#close-card').onclick=()=>closeCard();
 $('#card-next').onclick=async()=>{const n=nodes[selected],next=nodes[`${n.f.id}|${n.P.id}|${n.s.n+1}`];if(next){const target=svg.querySelector(`[data-id="${CSS.escape(next.id)}"]`),b=target.getBoundingClientRect();closeCard(false);if((b.right>viewportWidth()||b.left<0)&&!await scrollToNode(target))return;showCard(next.id,target);}};
 card.addEventListener('toggle',e=>{if(e.newState==='closed'){svg.querySelectorAll('.sel').forEach(x=>x.classList.remove('sel'));}});
 card.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeCard();}if(e.key==='Tab'){const items=[...card.querySelectorAll('button:not([hidden])')].filter(x=>!x.disabled);if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0].focus();}}});
 const observer=new ResizeObserver(updateHeader);[stageBar,controlBar,legendBar].forEach(bar=>observer.observe(bar));
 listen('resize',()=>{cancelPageNavigation();updateHeader();if(mode==='dashboard')return;if(fitted[mode])fitWidth();else if(mode==='detail')updateScale(scale);else setOverviewScale(overviewScale);updateStageStats();if(card.matches(':popover-open')&&opener)positionCard(opener);updateScroll();});
 updateHeader();fitWidth();motion();

 // Read-only QA evidence: layout anchors and paths before the visual skin is applied.
 const api={geometry,edgePaths,getNodes:()=>nodes,getState:()=>({scenario,scale,filter,activeStage,mode,paused,selected,overviewScale,background:astral.getState()}),flow,jump,setMode,fitWidth,destroy(){cancelPageNavigation();astral.destroy();abort.abort();observer.disconnect();closeCard(false);},go(id){const idx=frames.findIndex(f=>f.id===id||f.procs.some(p=>p.id===id));const n=activities().find(n=>n.P.id===id);if(n){markStage(Math.max(0,idx));history.replaceState(null,'',`#tower=${t.sourceKey}&stage=${encodeURIComponent(frames[Math.max(0,idx)].id)}`);return scrollToNode(svg.querySelector(`[data-id="${CSS.escape(n.id)}"]`));}return jump(Math.max(0,idx));}};window.NeuralLab=api;return api;
}catch(error){console.error(error);$('#load-error').hidden=false;}
}
