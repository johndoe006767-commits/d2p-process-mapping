import {REAL} from './real-data.js';
import {mountNeuralLab} from './neural-lab.js?v=galaxy-2';
import {titleCase,normalizeHeadings} from './title-case.js';
const root=document.querySelector('#process-workspace');let api=null,current=null,request=0,shellPromise,pending=null;const sources=new Map();
const shell=()=>shellPromise??=fetch('./neural/shell.html').then(r=>{if(!r.ok)throw Error('The Process Workspace Could Not Load.');return r.text();}).catch(e=>{shellPromise=null;throw e;});
const source=key=>{if(!sources.has(key))sources.set(key,fetch(`./neural/${key}.json`).then(r=>{if(!r.ok)throw Error('The Process Records Could Not Load.');return r.json();}).catch(e=>{sources.delete(key);throw e;}));return sources.get(key);};
function flatten(steps){return steps.flatMap(s=>s.split?s.branches.flatMap(b=>flatten(b.steps)):s.fork?s.branches.flatMap(b=>flatten([b.step])):s.gate?(s.fix?[s.fix]:[]):[s]);}
function preserveChallenges(data){for(const f of data.frames){f.stagePain=[...new Set([...(f.pp||[]),...(f.ch||[]).map(c=>c.full||c.t)])];for(const c of f.ch||[]){for(const ref of c.steps||[]){const match=f.procs.flatMap(p=>flatten(p.steps).map(s=>({p,s}))).find(({p,s})=>`${p.id}|${s.n}`===ref);if(match){match.s.pp=[...new Set([...(match.s.pp||[]),c.full||c.t])];}}}f.ch=[];}}
export function prepareNeural(id,onReturn){
 if(current===id&&api)return Promise.resolve(api);
 if(pending?.id===id)return pending.promise;
 const job={id,promise:null};pending=job;
 job.promise=loadNeural(id,onReturn).finally(()=>{if(pending===job)pending=null;});
 return job.promise;
}
async function loadNeural(id,onReturn){
 if(current===id&&api)return api;const ticket=++request,t=REAL[id];root.hidden=false;root.setAttribute('aria-label',`${t.name} Process Workspace`);root.removeAttribute('aria-labelledby');root.innerHTML='<div class="neural-loading" role="status">Loading the Process Workspace…</div>';
 api?.destroy();api=null;current=null;
 try{const [html,original]=await Promise.all([shell(),source(t.sourceKey),document.fonts.ready]);if(ticket!==request)return null;const payload=structuredClone(original);preserveChallenges(payload.data);root.innerHTML=html.replaceAll('{{NAME}}',titleCase(t.name));root.style.setProperty('--stage-count',payload.data.frames.length);root.dataset.mode='detail';
 root.querySelector('.map-intro h1').textContent=`${titleCase(t.name)} Process Anatomy`;
 root.querySelector('.map-intro p').textContent=`Explore ${t.counts.total} documented activities across ${t.stages.length} stages. Select an activity, decision or stage number for its complete source record.`;
 root.querySelector('#overview h1').textContent=`${titleCase(t.name)} High-Level Flow`;
 root.querySelector('.overview-intro').textContent=['FPAC','FPAO'].includes(t.sourceKey)?`${payload.data.frames.reduce((n,f)=>n+f.procs.length,0)} source processes across ${t.stages.length} stages. Select a process to inspect its inputs, outputs and activity mix.`:`${t.stages.length} connected stages covering ${payload.data.frames.reduce((n,f)=>n+f.procs.length,0)} source processes. Select a stage to inspect its inputs, outputs and activity mix.`;
 root.querySelector('.overview-heading>span').textContent='Inputs → Processes → Outputs';
 root.querySelector('#map-svg').setAttribute('aria-label',`${t.name} Detailed Process Map`);root.querySelector('#overview-svg').setAttribute('aria-label',`${t.name} High-Level Flow`);
 api=mountNeuralLab(root,payload,t,onReturn);if(!api)throw Error('The Process Map Could Not Be Rendered.');current=id;normalizeHeadings(root);return api;
 }catch(e){if(ticket!==request)return null;root.innerHTML='<div class="neural-loading" role="alert"><h2>Process Workspace Unavailable</h2><p>Retry to load this tower’s source records.</p><button id="neural-retry">Try Again</button></div>';root.querySelector('#neural-retry').onclick=()=>prepareNeural(id,onReturn);throw e;}
}
export function clearNeural(){request++;pending=null;api?.destroy();api=null;current=null;root.hidden=true;}
