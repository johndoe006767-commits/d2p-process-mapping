// End-to-end local verification. Pass the bundled playwright/index.mjs path.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.argv[2]).href);
const url=process.argv[3]||'http://127.0.0.1:8767/';
const real=JSON.parse(await fs.readFile('dist/data/real-processes.json','utf8'));
const suggested=JSON.parse(await fs.readFile('dist/data/suggested-processes.json','utf8'));
const briefs=JSON.parse(await fs.readFile('dist/data/tower-briefs.json','utf8')).towers;
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:3840,height:2160},reducedMotion:'reduce'});
const errors=[],failures=[],results=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))failures.push({url:r.url(),status:r.status()})});
try{
 await page.goto(url,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.FinanceLab&&document.querySelector('#loading').hidden&&document.querySelectorAll('#labels .label').length===8,{timeout:60000});
 for(const [id,tower] of Object.entries(real)){
  // Use the app's keyboard tower button, including towers obscured in the 3D view.
  const label=await page.locator('.keyboard-organ').evaluateAll((ns,name)=>ns.findIndex(n=>n.textContent.includes(name)),
   {brain:'FP&A Commercial',pancreas:'FP&A Operations',liver:'CAPEX',stomach:'Purchase To Pay',intestines:'Order to Cash',spleen:'Tax',lungs:'Record to Report',kidneys:'Controlling'}[id]);
  assert.ok(label>=0,`${id} keyboard entry`);
  await page.locator('.keyboard-organ').nth(label).evaluate(n=>n.click());
  await page.waitForFunction(()=>!document.querySelector('#detail').hidden);
  assert.equal(await page.locator('#hud-pain-count').textContent(),String(tower.counts.pain));
  assert.equal(await page.locator('#hud-dependencies [data-dependency]').count(),briefs[id].dependencies.length);
  for(const year of ['2026','2027']){
   await page.locator(`#hud-year-${year}`).click();
   assert.equal(await page.locator(`#hud-year-${year} .hud-year-count`).textContent(),String(briefs[id].projects[year].length));
   assert.deepEqual(await page.locator('.hud-project-list li p').allTextContents(),briefs[id].projects[year].map(p=>p.description));
   if(!briefs[id].projects[year].length)assert.match(await page.locator('#hud-year-panel').textContent(),/No .*TPI Projects Supplied|No .*TPI projects supplied/i);
  }
  for(const scenario of ['asis','tobe']){
   await page.locator('#detailed-flow-button').click();
   if(scenario==='tobe')await page.locator('#scenario-slot [data-scenario-option=tobe]').click();
   await page.waitForFunction(s=>window.NeuralLab?.getState().scenario===s&&document.querySelectorAll('#map-svg [data-stage-heading]').length>0,scenario);
   const data=scenario==='asis'?tower:suggested[id];
   const state=await page.evaluate(()=>({nodes:Object.values(window.NeuralLab.getNodes()).filter(n=>n.s&&!n.kind).map(n=>({id:n.id,title:n.s.t})),stageCount:document.querySelectorAll('#map-svg [data-stage-heading]').length}));
   assert.equal(state.stageCount,data.stages.length,`${id}/${scenario} stages`);
   assert.equal(state.nodes.length,data.activities.length,`${id}/${scenario} rendered activities`);
   for(const a of data.activities)assert.ok(state.nodes.some(n=>n.id===`${a.stageId}|${a.processId}|${a.n}`&&n.title===a.t),`${id}/${scenario} activity ${a.processId}|${a.n}`);
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
   const expectedNodes=['FPAC','FPAO'].includes(tower.sourceKey)?data.stages.flatMap(s=>s.processes):data.stages;
   const overviewNodes=page.locator('#overview-svg .flow-node');
   assert.deepEqual((await overviewNodes.evaluateAll(ns=>ns.map(n=>n.dataset.process))).sort(),expectedNodes.map(n=>n.id).sort());
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
  await page.evaluate(id=>window.FinanceLab.openDashboard(id,'activities'),id);
  await page.waitForSelector('[data-activity-record]');
  assert.equal(await page.locator('[data-activity-record]').count(),suggested[id].activities.length);
  await page.locator('[data-nav="tpis"]').click();
  await page.waitForSelector('.tw-tpi-row');
  assert.equal(await page.locator('.tw-tpi-row').count(),tower.tpis.length);
  for(const pane of await page.locator('.tw-source details.sc-tpitab').all()){
   if(!await pane.evaluate(n=>n.open))await pane.locator('summary').click();
   assert.ok(await pane.locator('tbody tr').first().isVisible(),`${id} TPI subregister`);
  }
  await page.locator('[data-nav="ai"]').click();
  await page.waitForSelector('.sc-opp');
  assert.equal(await page.locator('.sc-opp').count(),tower.ai.length);
  const opportunity=page.locator('details.sc-opp').first();
  await opportunity.locator('summary').click();
  assert.equal(await opportunity.evaluate(n=>n.open),true);
  await page.locator('[data-nav="handoffs"]').click();
  await page.locator('[data-handoff-view="register"]').click();
  await page.waitForSelector('#tw-connection-panel');
  assert.equal(await page.locator('#tw-connection-panel tbody tr').count(),tower.handoffs.length);
  await page.locator('#tw-close').click();
  await page.locator('#back').click();
  results.push({tower:tower.sourceKey,scenarios:2,mapViews:4,activities:tower.activities.length,handoffs:tower.handoffs.length,reviewEntries:tower.handoffReview.length,status:'PASS'});
  console.log(JSON.stringify(results.at(-1)));
 }
 assert.deepEqual(errors,[],'browser runtime errors');assert.deepEqual(failures,[],'failed HTTP requests');
 await fs.writeFile('.runtime/source-sync/browser-check.json',JSON.stringify({status:'PASS',viewport:'3840×2160',results,errors,failures},null,2));
}finally{await browser.close()}
