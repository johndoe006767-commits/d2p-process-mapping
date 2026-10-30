import {getScenario,setScenario,scenarioControl,bindScenarioControl,scenarioLabel} from './process-scenario.js';
import {REAL,getTower} from './real-data.js';
import {mountNeuralLab} from './neural-lab.js?v=typography-1';
import {titleCase,normalizeHeadings} from './title-case.js';
const root=document.querySelector('#process-workspace');let api=null,current=null,request=0,shellPromise,pending=null,returnHandler;let scenarioRefresh=0;const sources=new Map();
const shell=()=>shellPromise??=fetch('./neural/shell.html?v=labels-1').then(r=>{if(!r.ok)throw Error('The Process Workspace Could Not Load.');return r.text();}).catch(e=>{shellPromise=null;throw e;});
const source=key=>{if(!sources.has(key))sources.set(key,fetch(`./neural/${key}.json`).then(r=>{if(!r.ok)throw Error('The Process Records Could Not Load.');return r.json();}).catch(e=>{sources.delete(key);throw e;}));return sources.get(key);};
function flatten(steps){return steps.flatMap(s=>s.split?s.branches.flatMap(b=>flatten(b.steps)):s.fork?s.branches.flatMap(b=>flatten([b.step])):s.gate?(s.fix?[s.fix]:[]):[s]);}
function preserveChallenges(data){for(const f of data.frames){f.stagePain=[...new Set([...(f.pp||[]),...(f.ch||[]).map(c=>c.full||c.t)])];for(const c of f.ch||[]){for(const ref of c.steps||[]){const match=f.procs.flatMap(p=>flatten(p.steps).map(s=>({p,s}))).find(({p,s})=>`${p.id}|${s.n}`===ref);if(match){match.s.pp=[...new Set([...(match.s.pp||[]),c.full||c.t])];}}}f.ch=[];}}
export function prepareNeural(id,onReturn){
 const selection=id+':'+getScenario(id);
 if(current===selection&&api)return Promise.resolve(api);
 if(pending?.id===selection)return pending.promise;
 const job={id:selection,promise:null};pending=job;
 job.promise=loadNeural(id,onReturn).finally(()=>{if(pending===job)pending=null;});
 return job.promise;
}
async function loadNeural(id,onReturn){
 const scenario=getScenario(id),selection=id+':'+scenario;if(current===selection&&api)return api;const ticket=++request,t=REAL[id];root.setAttribute('aria-label',`${t.name} Process Workspace`);root.removeAttribute('aria-labelledby');root.innerHTML='<div class="neural-loading"><p role="status">Loading the Process Workspace…</p><button id="neural-return" type="button">Back to Organ</button></div>';root.querySelector('#neural-return').onclick=onReturn;
 api?.destroy();api=null;current=null;
 try{const [html,original,tower]=await Promise.all([shell(),source(t.sourceKey+(scenario==='tobe'?'-ai':'')),getTower(id,scenario),document.fonts.ready]);if(ticket!==request)return null;const payload=structuredClone(original);preserveChallenges(payload.data);root.innerHTML=html.replaceAll('{{NAME}}',titleCase(t.name));root.style.setProperty('--stage-count',payload.data.frames.length);root.dataset.mode='detail';root.dataset.scenario=scenario;
 root.querySelector('#scenario-slot').innerHTML=scenarioControl(scenario,'Process map scenario');
 root.querySelector('.identity small').textContent='Process anatomy';
 root.querySelector('.card-bottom>span').textContent='Source record · '+scenarioLabel(scenario);
 bindScenarioControl(root,value=>setScenario(id,value));
 root.querySelector('.map-intro h1').textContent=`${titleCase(t.name)} Process Anatomy`;
 root.querySelector('.map-intro p').textContent=`Explore ${tower.counts.total} ${scenario==='tobe'?'source activities with AI recommendations':'documented activities'} across ${tower.stages.length} stages. Select an activity, decision or stage number for its complete source record.`;
 root.querySelector('#overview h1').textContent=`${titleCase(t.name)} High-Level Flow`;
 root.querySelector('.overview-intro').textContent=['FPAC','FPAO'].includes(t.sourceKey)?`${payload.data.frames.reduce((n,f)=>n+f.procs.length,0)} source processes across ${t.stages.length} stages. Select a process to inspect its inputs, outputs and activity mix.`:`${t.stages.length} connected stages covering ${payload.data.frames.reduce((n,f)=>n+f.procs.length,0)} source processes. Select a stage to inspect its inputs, outputs and activity mix.`;
 root.querySelector('.overview-heading>span').textContent=scenario==='tobe'?'AI Suggested · Potential mix if adopted':'Inputs → Processes → Outputs';
 root.querySelector('#map-svg').setAttribute('aria-label',`${t.name} Detailed Process Map`);root.querySelector('#overview-svg').setAttribute('aria-label',`${t.name} High-Level Flow`);
 payload.scenario=scenario;api=mountNeuralLab(root,payload,tower,onReturn);if(!api)throw Error('The Process Map Could Not Be Rendered.');current=selection;returnHandler=onReturn;normalizeHeadings(root);return api;
 }catch(e){if(ticket!==request)return null;root.innerHTML='<div class="neural-loading" role="alert"><h2>Process Workspace Unavailable</h2><p>Retry to load this tower’s source records.</p><button id="neural-retry">Try Again</button><button id="neural-return" type="button">Back to Organ</button></div>';root.querySelector('#neural-retry').onclick=()=>prepareNeural(id,onReturn).then(next=>{if(next)root.querySelector('#lab-return')?.focus({preventScroll:true});}).catch(()=>root.querySelector('#neural-retry')?.focus({preventScroll:true}));root.querySelector('#neural-return').onclick=onReturn;throw e;}
}
export function clearNeural(){request++;pending=null;api?.destroy();api=null;current=null;root.hidden=true;root.replaceChildren();}

window.addEventListener('process-scenario-change',async event=>{
 const {id,value}=event.detail;if(!current?.startsWith(id+':')&&!pending?.id.startsWith(id+':'))return;
 const ticket=++scenarioRefresh,state=api?.getState(),callback=returnHandler;
 try{const next=await prepareNeural(id,callback);if(ticket!==scenarioRefresh||!next)return;next.setMode(state?.mode||'detail');if(state?.mode==='detail')await next.jump(state.activeStage);else await new Promise(requestAnimationFrame);
 root.querySelector(`[data-scenario-option="${value}"]`)?.focus({preventScroll:true});
 }catch{/* The loader provides a retry control for this scenario. */}
});
