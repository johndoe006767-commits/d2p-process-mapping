// End-to-end local verification. Pass the bundled playwright/index.mjs path.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.argv[2]).href);
const url=process.argv[3]||'http://127.0.0.1:8767/';
const real=JSON.parse(await fs.readFile('dist/data/real-processes.json','utf8'));
const suggested=JSON.parse(await fs.readFile('dist/data/suggested-processes.json','utf8'));
const kpis=JSON.parse(await fs.readFile('dist/data/kpi-summary.json','utf8'));
const briefs=JSON.parse(await fs.readFile('dist/data/tower-briefs.json','utf8')).towers;
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:3840,height:2160},reducedMotion:'reduce'});
const errors=[],failures=[],results=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))failures.push({url:r.url(),status:r.status()})});
async function verifyFilters(view){
 const issues=await page.evaluate(view=>{
  const detail=view==='detail',lab=window.NeuralLab,issues=[];
  const groups=document.querySelectorAll(detail?'#map-svg .nd':'#overview-svg .flow-node');
  for(const filter of ['auto','hyb','man','pp','all']){
   const button=document.querySelector(`.filters [data-filter="${filter}"]`);
   button.click();
   const color=getComputedStyle(button.querySelector('i')||button);
   for(const group of groups){
    const record=detail?lab.getNodes()[group.dataset.id].s:lab.flow.records[group.dataset.process];
    const count=filter==='pp'?(detail?record.pp:record.pain)?.length:(detail?record.ty===filter:record[filter]);
    const match=Boolean(count),ring=group.querySelector('.filter-highlight');
    const trace=group.querySelector('.filter-trace');
    const highlight=ring&&getComputedStyle(ring);
    if(Boolean(ring)!==(filter!=='all'&&match)||
       Boolean(trace)!==Boolean(ring)||(trace&&getComputedStyle(trace).stroke!=='none')||
       getComputedStyle(group).opacity!==(filter==='all'||match?'1':'0.24')||
       (highlight&&(highlight.stroke!==(filter==='pp'?color.color:color.backgroundColor)||
        highlight.fill!==highlight.stroke||Number(highlight.fillOpacity)!==.07||!highlight.filter.includes('drop-shadow')))){
     issues.push([filter,group.dataset.id||group.dataset.process]);
    }
   }
  }
  return issues;
 },view);
 assert.deepEqual(issues,[],view+' filter highlights, legend colors and dimming');
}
try{
 await page.goto(url,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.FinanceLab&&document.querySelector('#loading').hidden&&document.querySelectorAll('#labels .label').length===8,{timeout:60000});
 for(const [id,tower] of Object.entries(real)){
  // Use the app's keyboard tower button, including towers obscured in the 3D view.
  const label=await page.locator('.keyboard-organ').evaluateAll((ns,name)=>ns.findIndex(n=>n.textContent.includes(name)),
   {brain:'FP&A Commercial',pancreas:'FP&A Operations',liver:'CAPEX',stomach:'Purchase To Pay',intestines:'Order to Cash',spleen:'Tax',lungs:'Record to Report Operations',kidneys:'Controlling'}[id]);
  assert.ok(label>=0,`${id} keyboard entry`);
  await page.locator('.keyboard-organ').nth(label).evaluate(n=>n.click());
  await page.waitForFunction(()=>!document.querySelector('#detail').hidden);
  if(id==='liver'||id==='lungs'){
   for(const selector of ['#tower-name','#hud-tower-title'])assert.equal(await page.locator(selector).textContent(),tower.name);
  }
  assert.equal(await page.locator('#hud-pain-count').textContent(),String(tower.counts.pain));
  assert.equal(await page.locator('#hud-score-pct').textContent(),String(Math.round(tower.counts.manual/tower.counts.total*100)),`${id} manual percentage`);
  const comparison=await page.locator('#hud-comparison .kpi-stack').evaluateAll(ns=>ns.map(n=>n.getAttribute('aria-label')));
  assert.deepEqual(comparison,[['As Is',kpis[id].asIs],['To Be',kpis[id].toBe]].map(([label,mix])=>`${label}: ${mix.auto} Automated, ${mix.semi} Semi, ${mix.manual} Manual`),`${id} comparison activity mix`);
  if(['spleen','kidneys'].includes(id))await page.screenshot({path:`.runtime/source-sync/${tower.sourceKey}-kpis.png`});
  assert.equal(await page.locator('#hud-dependencies .hud-dependency-row').count(),briefs[id].dependencies.length);
  for(const year of ['2026','2027']){
   await page.locator(`#hud-year-${year}`).click();
   assert.equal(await page.locator(`#hud-year-${year} .hud-year-count`).textContent(),String(briefs[id].projects[year].length));
   assert.deepEqual(await page.locator('.hud-project-list li p').allTextContents(),briefs[id].projects[year].map(p=>p.description));
   if(briefs[id].notes[year])assert.equal(await page.locator('.hud-project-note').textContent(),briefs[id].notes[year]);
   if(!briefs[id].projects[year].length)assert.match(await page.locator('#hud-year-panel').textContent(),/No .*TPI Projects Supplied|No .*TPI projects supplied/i);
  }
  for(const scenario of ['asis','tobe']){
   await page.locator('#detailed-flow-button').click();
   if(scenario==='tobe')await page.locator('#scenario-slot [data-scenario-option=tobe]').click();
   await page.waitForFunction(s=>window.NeuralLab?.getState().scenario===s&&document.querySelectorAll('#map-svg [data-stage-heading]').length>0,scenario);
   const data=scenario==='asis'?tower:suggested[id];
   await verifyFilters('detail');
   const state=await page.evaluate(()=>({nodes:Object.values(window.NeuralLab.getNodes()).filter(n=>n.s&&!n.kind).map(n=>({id:n.id,title:n.s.t})),stageCount:document.querySelectorAll('#map-svg [data-stage-heading]').length}));
   assert.equal(state.stageCount,data.stages.length,`${id}/${scenario} stages`);
   assert.equal(state.nodes.length,data.activities.length,`${id}/${scenario} rendered activities`);
   for(const a of data.activities)assert.ok(state.nodes.some(n=>n.id===`${a.stageId}|${a.processId}|${a.n}`&&n.title===a.t),`${id}/${scenario} activity ${a.processId}|${a.n}`);
   const payload=JSON.parse(await fs.readFile(`dist/neural/${tower.sourceKey}${scenario==='tobe'?'-ai':''}.json`,'utf8'));
   const expectedTpis=payload.data.frames.flatMap(f=>(f.tpi||[]).map(c=>({stage:f.id,...c})));
   const renderedTpis=await page.evaluate(()=>Object.values(window.NeuralLab.getNodes()).filter(n=>n.kind==='tpi').map(n=>({stage:n.f.id,...n.c})));
   assert.deepEqual(renderedTpis,expectedTpis,`${id}/${scenario} mapped TPI shortlist`);
   const tpiCardIssues=await page.evaluate(()=>{
    const issues=[];
    for(const n of Object.values(window.NeuralLab.getNodes()).filter(n=>n.kind==='tpi')){
     document.querySelector(`#map-svg [data-id="${CSS.escape(n.id)}"]`).dispatchEvent(new MouseEvent('click',{bubbles:true}));
     const text=document.querySelector('#card-content').textContent;
     if(![n.c.t,n.c.st,n.c.ref,n.c.src].filter(Boolean).every(v=>text.includes(v)))issues.push(n.id);
    }
    document.querySelector('#close-card').click();
    return issues;
   });
   assert.deepEqual(tpiCardIssues,[],`${id}/${scenario} TPI card details`);
   await page.locator('#first-step').evaluate(n=>n.click());
   await page.waitForFunction(()=>document.querySelector('#information-card').matches(':popover-open'));
   assert.ok((await page.locator('#information-card').textContent()).includes(data.activities[0].d),`${id}/${scenario} full activity detail`);
   await page.locator('#close-card').click();
   const badCards=await page.evaluate(({activities,scenario})=>{
    const types={man:'Manual',hyb:'Semi',auto:'Automated'},bad=[];
    for(const a of activities){
     const key=[a.stageId,a.processId,a.n].join('|');
     document.querySelector(`#map-svg [data-id="${CSS.escape(key)}"]`).dispatchEvent(new MouseEvent('click',{bubbles:true}));
     const card=document.querySelector('#card-content'),text=card.textContent;
     const fields=Object.fromEntries([...card.querySelectorAll('.record-section')].map(s=>[s.querySelector('h3').textContent.toLowerCase(),s.querySelector('p')?.textContent]));
     if(!text.includes(a.d)||![...(a.in||[]),...(a.out||[])].every(([party,detail])=>text.includes(party)&&text.includes(detail)))bad.push(key);
     if(scenario==='tobe'&&(fields['activity type if adopted']!==types[a.effectiveType]||fields['as is activity type']!==types[a.asIsType]))bad.push(key+' types');
    }
    document.querySelector('#close-card').click();
    return bad;
   },{activities:data.activities,scenario});
   assert.deepEqual(badCards,[],`${id}/${scenario} activity cards`);
   await page.locator('button[data-mode=overview]').click();
   await verifyFilters('overview');
   const expectedNodes=['FPAC','FPAO'].includes(tower.sourceKey)?data.stages.flatMap(s=>s.processes):data.stages;
   const overviewNodes=page.locator('#overview-svg .flow-node');
   assert.deepEqual((await overviewNodes.evaluateAll(ns=>ns.map(n=>n.dataset.process))).sort(),expectedNodes.map(n=>n.id).sort());
   const overviewMix=await page.evaluate(()=>Object.values(window.NeuralLab.flow.records).reduce((sum,r)=>({auto:sum.auto+r.auto,semi:sum.semi+r.hyb,manual:sum.manual+r.man}),{auto:0,semi:0,manual:0}));
   assert.deepEqual(overviewMix,{auto:data.counts.auto,semi:data.counts.semi,manual:data.counts.manual},`${id}/${scenario} overview activity mix`);
   if(['spleen','kidneys'].includes(id))await page.screenshot({path:`.runtime/source-sync/${tower.sourceKey}-${scenario}-overview.png`});
   const cardIssues=await overviewNodes.evaluateAll(ns=>ns.flatMap(n=>{
    const r=window.NeuralLab.flow.records[n.dataset.process];
    n.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    const text=document.querySelector('#card-content').textContent;
    document.querySelector('#close-card').click();
    return [...r.inp,...r.out].every(value=>text.includes(value))?[]:[r.id];
   }));
   assert.deepEqual(cardIssues,[],`${id}/${scenario} high-level card handoffs`);
   const context=page.locator('#process-workspace .handoff-context');
   await context.locator('summary').click();
   assert.deepEqual(await context.locator('.d2p-stages strong').allTextContents(),data.d2pStages.map(s=>s.name));
   const notes=await context.locator('.lt-review li').allTextContents();
   assert.equal(notes.length,data.handoffReview.length);
   data.handoffReview.forEach((r,i)=>{for(const text of [r.id,r.location,r.description,r.action])assert.ok(notes[i].includes(text))});
   for(const copy of Object.values(data.highSummary))assert.ok((await context.innerText()).includes(copy));
   const summaryTips=await page.locator('#overview-svg g > title').allTextContents();
   if(!['FPAC','FPAO'].includes(tower.sourceKey)){
    for(const copy of Object.values(data.highSummary))assert.ok(summaryTips.some(t=>t.includes(copy)),`${id} high-level summary tooltip`);
   }
   await context.locator('summary').click();
   await overviewNodes.first().focus();
   await page.keyboard.press('Enter');
   await page.waitForFunction(()=>document.querySelector('#information-card').matches(':popover-open'));
   await page.locator('#card-detail').click();
   await page.waitForFunction(()=>window.NeuralLab.getState().mode==='detail'&&document.querySelector('#information-card').matches(':popover-open'));
   await page.locator('#close-card').click();
   await page.locator('#lab-return').click();
  }
  assert.equal(await page.locator('#tower-workbench').count(),0,'dashboard is archived');
  assert.equal(await page.evaluate(()=>typeof window.FinanceLab.openDashboard),'undefined');
  await page.locator('#back').click();
  results.push({tower:tower.sourceKey,scenarios:2,mapViews:4,activities:tower.activities.length,handoffs:tower.handoffs.length,reviewEntries:tower.handoffReview.length,status:'PASS'});
  console.log(JSON.stringify(results.at(-1)));
 }
 assert.deepEqual(errors,[],'browser runtime errors');assert.deepEqual(failures,[],'failed HTTP requests');
 await fs.writeFile('.runtime/source-sync/browser-check.json',JSON.stringify({status:'PASS',viewport:'3840×2160',results,errors,failures},null,2));
}finally{await browser.close()}
