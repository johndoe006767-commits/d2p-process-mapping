import {scrollPageTo,cancelPageNavigation} from './page-navigation.js';
import {REAL,KPI,escapeHTML as esc} from './real-data.js';
import {openDashboard,closeDashboard,configureDashboard,destroyDashboard} from './tower-dashboard.js';
import {prepareNeural,clearNeural} from './neural-loader.js?v=labels-1';
import {loadSourceRegisters,aiOpportunityCount} from './source-registers.js';
import {titleCase,normalizeHeadings} from './title-case.js';
export {openDashboard,closeDashboard};
const $=s=>document.querySelector(s),reduced=matchMedia('(prefers-reduced-motion: reduce)');let currentId=null,ticket=0;
function returnToOrgan(){document.querySelector('#process-status').textContent='';scrollPageTo(document.querySelector('#section-1').getBoundingClientRect().top+scrollY).then(done=>{if(done)document.querySelector('#high-level-button')?.focus({preventScroll:true});});history.replaceState(null,'',location.pathname);}
export function bindTower(id){currentId=id;renderKpiContext(id);loadSourceRegisters().then(all=>{if(currentId!==id)return;$('#hud-count-ai').textContent=aiOpportunityCount(all[REAL[id].sourceKey]);$('#hud-count-ai').parentElement.title='Proposals in this tower’s AI Opportunities register. Select to review the same records.';}).catch(()=>{if(currentId===id)$('#hud-count-ai').parentElement.title='The AI opportunity count is unavailable. Select to retry loading the register.';});$('#process-status').textContent='';const picker=$('#mobile-stage-select');picker.innerHTML='<option value="">Choose a Stage…</option>'+REAL[id].stages.map((f,i)=>`<option value="${esc(f.id)}">${i+1}. ${esc(titleCase(f.name))}</option>`).join('');picker.onchange=()=>{if(picker.value)openMap(id,picker.value,'detail',true)};document.querySelectorAll('.hud-modal-trigger').forEach(b=>b.onclick=e=>{e.stopPropagation();openDashboard(id,b.dataset.view)});$('#high-level-button').onclick=e=>openMap(id,null,'high',e.detail===0);prepareNeural(id,returnToOrgan).catch(e=>console.error(e));normalizeHeadings(document);}
export function hideMap(){ticket++;cancelPageNavigation();clearNeural();}
export async function openMap(id,stage=null,mode='detail',keyboard=false){
 currentId=id;const n=++ticket;cancelPageNavigation();
 try{
  const api=await prepareNeural(id,returnToOrgan);if(n!==ticket||!api)return;
  api.setMode(mode==='high'?'overview':'detail');api.fitWidth();
  // Set the final layout before measuring a destination; never jump once before scrolling.
  await new Promise(requestAnimationFrame);if(n!==ticket)return;
  const done=mode==='high'?await scrollPageTo($('#process-workspace').getBoundingClientRect().top+scrollY):await api.go(stage||REAL[id].stages[0].id);
  if(n!==ticket||!done)return;
  if(keyboard){const target=mode==='high'?$('#overview h1'):document.querySelector(`[data-stage-heading="${api.getState().activeStage}"] .stage-index-label`);target?.setAttribute('tabindex','-1');target?.focus({preventScroll:true});}
  $('#process-status').textContent=stage?`Opened ${REAL[id].stages.find(s=>s.id===stage)?.name||stage}.`:`Opened ${REAL[id].name} ${mode==='high'?'High-Level Flow':'Detailed Process Flow'}.`;
 }catch(e){console.error(e);scrollPageTo($('#process-workspace').getBoundingClientRect().top+scrollY);}
}
export function initExperience(){configureDashboard({openMap});document.addEventListener('keydown',()=>document.body.classList.add('keyboard-input'));document.addEventListener('pointerdown',()=>document.body.classList.remove('keyboard-input'));addEventListener('pagehide',()=>{destroyDashboard();clearNeural();});normalizeHeadings(document);const observer=new MutationObserver(records=>{for(const r of records){for(const n of r.addedNodes){if(n.nodeType===1){normalizeHeadings(n.parentElement||n);}}}});observer.observe(document.body,{childList:true,subtree:true});window.FinanceLab={openMap,openDashboard,closeDashboard,REAL};}

function renderKpiContext(id){
 const k=KPI[id],deps=k.dependencies.slice(0,3);
 $('#hud-dependencies').innerHTML=deps.length?`<ol class="hud-dependency-list">${deps.map(d=>`<li><button type="button" data-upstream="${esc(d.id)}"><span class="hud-rank">${d.rank}</span><span>${esc(d.name)}</span><span class="hud-dep-count">${d.count} <small>${d.count===1?'handoff':'handoffs'}</small></span><svg class="ico" aria-hidden="true"><use href="#i-ne"/></svg></button></li>`).join('')}</ol>`:'<p class="hud-source-note">No upstream links to the eight finance towers are explicitly mapped.</p>';
 $('#hud-project-total').textContent=`${k.projects.length} ${k.projects.length===1?'project':'projects'}`;
 $('#hud-projects').innerHTML=k.projects.map((p,i)=>`<button class="hud-project-row" type="button" data-project="${i}"><span><b>${esc(p.name)}</b><small>${p.sourceCount} source entries${p.aiCount?` · ${p.aiCount} AI proposals`:''}</small></span><svg class="ico" aria-hidden="true"><use href="#i-ne"/></svg></button>`).join('');
 $('#hud-projects').querySelectorAll('[data-project]').forEach(b=>b.onclick=()=>{const p=k.projects[+b.dataset.project];openDashboard(id,'tpis',{project:p.name,entries:p.entries});});
 $('#hud-dependencies').querySelectorAll('[data-upstream]').forEach(b=>b.onclick=()=>openDashboard(id,'handoffs',{upstream:b.dataset.upstream}));
}
