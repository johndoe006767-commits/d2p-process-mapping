import {setScenario} from './process-scenario.js';
import {cancelPageNavigation} from './page-navigation.js';
import {REAL,KPI,escapeHTML as esc} from './real-data.js';
import {CARD_BRIEFS,CARD_SOURCE} from './tower-briefs.js';
import {comparisonMarkup} from './health.js?v=20261030-typography-1';
import {openDashboard,closeDashboard,configureDashboard,destroyDashboard} from './tower-dashboard.js';
import {prepareNeural,clearNeural} from './neural-loader.js?v=typography-1';
import {titleCase,normalizeHeadings} from './title-case.js';
export {openDashboard,closeDashboard};
const $=s=>document.querySelector(s);
let currentId=null,ticket=0,mapOpener=null,organPosition={top:0,left:0};
function returnToOrgan(){
 const opener=mapOpener;hideMap();
 $('#process-status').textContent='';
 window.scrollTo({...organPosition,behavior:'instant'});
 (opener?.isConnected&&!opener.closest('[hidden]')?opener:$('#high-level-button'))?.focus({preventScroll:true});
 history.replaceState(null,'',location.pathname+location.search);
}
export function bindTower(id){
 currentId=id;renderKpiContext(id);
 $('#process-status').textContent='';
 const picker=$('#mobile-stage-select');
 picker.innerHTML='<option value="">Choose a Stage…</option>'+REAL[id].stages.map((f,i)=>`<option value="${esc(f.id)}">${i+1}. ${esc(titleCase(f.name))}</option>`).join('');
 picker.onchange=()=>{if(picker.value)openMap(id,picker.value,'detail',true)};
 $('#high-level-button').onclick=e=>openMap(id,null,'high',e.detail===0);
 $('#detailed-flow-button').onclick=e=>openMap(id,null,'detail',e.detail===0);
 normalizeHeadings(document);
}
export function hideMap(){
 ticket++;cancelPageNavigation();clearNeural();
 $('#section-1').hidden=false;
}
export async function openMap(id,stage=null,mode='detail',keyboard=false){
 currentId=id;const n=++ticket;cancelPageNavigation();
 const workspace=$('#process-workspace');
 if(workspace.hidden){mapOpener=document.activeElement;organPosition={top:scrollY,left:scrollX};}
 // Only one surface participates in document scrolling at a time.
 $('#section-1').hidden=true;workspace.hidden=false;
 window.scrollTo({top:0,left:0,behavior:'instant'});
 try{
  const loading=prepareNeural(id,returnToOrgan);workspace.focus({preventScroll:true});
  const api=await loading;if(n!==ticket||!api)return;
  api.setMode(mode==='high'?'overview':'detail');api.fitWidth();
  await new Promise(requestAnimationFrame);if(n!==ticket)return;
  const done=mode==='high'?true:await api.go(stage||REAL[id].stages[0].id);
  if(n!==ticket)return;
  const target=keyboard&&done?(mode==='high'?$('#overview h1'):workspace.querySelector(`[data-stage-heading="${api.getState().activeStage}"] .stage-index-label`)):$('#lab-return');
  target?.setAttribute('tabindex','-1');target?.focus({preventScroll:true});
  // The return button remains part of the normal keyboard sequence.
  $('#lab-return').removeAttribute('tabindex');
  $('#process-status').textContent=stage?`Opened ${REAL[id].stages.find(s=>s.id===stage)?.name||stage}.`:`Opened ${REAL[id].name} ${mode==='high'?'High-Level Flow':'Detailed Process Flow'}.`;
 }catch(e){if(n!==ticket)return;console.error(e);$('#neural-retry')?.focus({preventScroll:true});}
}
export function initExperience(){configureDashboard({openMap});document.addEventListener('keydown',()=>document.body.classList.add('keyboard-input'));document.addEventListener('pointerdown',()=>document.body.classList.remove('keyboard-input'));addEventListener('pagehide',()=>{destroyDashboard();clearNeural();});normalizeHeadings(document);const observer=new MutationObserver(records=>{for(const r of records){for(const n of r.addedNodes){if(n.nodeType===1){normalizeHeadings(n.parentElement||n);}}}});observer.observe(document.body,{childList:true,subtree:true});window.FinanceLab={openMap,openDashboard,closeDashboard,REAL};}

const projectYears=new Map();
function renderKpiContext(id){
 $('.hud-scroll').scrollTop=0;
 const brief=CARD_BRIEFS[id],populated=brief.status==='populated';
 $('#tower-telemetry-hud').dataset.content=brief.status;
 const metrics=KPI[id];
 $('#hud-score-pct').textContent=Math.round(metrics.asIs.manual/metrics.asIs.total*100);
 $('#hud-score-unit').hidden=false;
 $('.hud-score').title=`${metrics.asIs.manual} manual / ${metrics.asIs.total} As Is activities × 100`;
 $('#hud-comparison').innerHTML=comparisonMarkup(metrics.asIs,metrics.toBe,false);
 $('#hud-dependencies').innerHTML=populated?`<ul class="hud-dependency-list">${brief.dependencies.map((d,i)=>`<li><button type="button" data-dependency="${i}" aria-label="View ${esc(d.tower)} dependency"><span class="hud-dependency-copy"><strong>${esc(d.tower)}</strong><span>${esc(d.description)}</span></span><svg class="ico" aria-hidden="true"><use href="#i-ne"/></svg></button></li>`).join('')}</ul>`:'<p class="hud-empty">Awaiting tower data</p>';
 $('#hud-dependencies').querySelectorAll('[data-dependency]').forEach(button=>button.onclick=()=>{
  setScenario(id,'asis');
  openDashboard(id,'handoffs',{dependency:brief.dependencies[Number(button.dataset.dependency)],source:CARD_SOURCE});
 });
 const tabs=[...document.querySelectorAll('[data-project-year]')];
 const selectYear=(year,focus=false)=>{
  projectYears.set(id,year);
  tabs.forEach(tab=>{
   const active=tab.dataset.projectYear===year;
   tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;
   tab.querySelector('.hud-year-count').textContent=populated?brief.projects[tab.dataset.projectYear].length:'';
   if(active&&focus)tab.focus({preventScroll:true});
  });
  const panel=$('#hud-year-panel');panel.setAttribute('aria-labelledby','hud-year-'+year);
  panel.innerHTML=populated?`<ul class="hud-project-list">${brief.projects[year].map(project=>`<li><strong>${esc(project.name)}</strong><p>${esc(project.description)}</p></li>`).join('')}</ul>${brief.notes[year]?`<p class="hud-project-note">${esc(brief.notes[year])}</p>`:''}`:'<div class="hud-project-empty"><strong>Awaiting tower data</strong><p>Project names and descriptions will appear here.</p></div>';
  window.dispatchEvent(new Event('tower-card-layout'));
 };
 tabs.forEach(tab=>tab.onclick=()=>selectYear(tab.dataset.projectYear));
 $('.hud-year-tabs').onkeydown=event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const index=event.key==='Home'?0:event.key==='End'?1:1-tabs.indexOf(document.activeElement);
  selectYear(tabs[Math.max(0,index)].dataset.projectYear,true);
 };
 selectYear(projectYears.get(id)||'2026');
}
