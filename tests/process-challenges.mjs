// Verify source challenge and tag coverage across every tower, scenario and map level.
// Usage: node tests/process-challenges.mjs /absolute/path/to/playwright/index.mjs [url]
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.argv[2]).href);
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:3840,height:2160},reducedMotion:'reduce'});
const errors=[],results=[];
page.on('pageerror',e=>errors.push(e.message));
const towers={FPAC:'FP&A Commercial',FPAO:'FP&A Operations',CAPEX:'CAPEX / Fixed Assets',P2P:'Purchase To Pay',O2C:'Order to Cash',TAX:'Tax',R2R:'Record to Report Operations',CTRL:'Controlling'};
const flatten=steps=>steps.flatMap(s=>s.split?s.branches.flatMap(b=>flatten(b.steps)):s.fork?s.branches.flatMap(b=>flatten([b.step])):s.gate?(s.fix?[s.fix]:[]):[s]);
function expected(data,scenario){
 const challenges=[],initiatives=[],tagged=[];
 for(const f of data.frames){
  (f.ch||[]).forEach((c,i)=>challenges.push({id:`${f.id}|ch${i}`,frame:f.id,kind:'ch',...c}));
  (f.tpi||[]).forEach((c,i)=>initiatives.push({id:`${f.id}|tpi${i}`,frame:f.id,kind:'tpi',...c}));
  const add=(s,p,id,key)=>{
   if(scenario!=='tobe')return;
   const review=data.review?.[key]||data.review?.[s.t]||{};
   const tags=[['feasibility',s.feas||s.holdfeas||review.feas],['reference',s.feasn],['scope',s.scope]].filter(([,v])=>String(v||'').trim()).map(([kind,label])=>({kind,label:String(label).trim()}));
   if(tags.length)tagged.push({id,frame:f.id,process:p,tags});
  };
  for(const p of f.procs){
   for(const s of flatten(p.steps))add(s,p.id,`${f.id}|${p.id}|${s.n}`,`${p.id}|${s.n}`);
   if(p.opp)add(p.opp,p.id,`${f.id}|${p.id}|opp`,`${p.id}|opp`);
  }
  if(f.opp)add(f.opp,null,`${f.id}|opp`,`${f.id}|opp`);
 }
 return {challenges,initiatives,tagged};
}
async function detailCheck(expected){return page.evaluate(expected=>{
 const issues=[],lab=window.NeuralLab,svg=document.querySelector('#map-svg'),bounds=svg.viewBox.baseVal;
 const groups=[...svg.querySelectorAll('[data-id]')],obstacles=[...svg.querySelectorAll('.stage-handoffs,.process-heading,[data-stage-heading],.node-annotation,.step-output,.register-heading')];
 const intersects=(a,b)=>a.x<b.x+b.width-.5&&a.x+a.width>b.x+.5&&a.y<b.y+b.height-.5&&a.y+a.height>b.y+.5;
 const luminance=v=>{const c=v.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>(x/=255)<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
 if(svg.querySelectorAll('.challenge-node').length!==expected.challenges.length)issues.push('challenge count');
 if(svg.querySelectorAll('[data-register-kind="tpi"]').length!==expected.initiatives.length)issues.push('initiative count');
 for(const c of [...expected.challenges,...expected.initiatives]){
  const g=svg.querySelector(`[data-id="${CSS.escape(c.id)}"]`),n=lab.getNodes()[c.id];
  if(!g||!n){issues.push([c.id,'missing']);continue}
  const body=g.querySelector('.b'),b=body.getBBox(),copy=[...g.querySelectorAll('.register-copy')].map(t=>t.textContent).join(' ');
  if(copy!==(c.full||c.t).replace(/\s+/g,' ').trim())issues.push([c.id,'source text',copy]);
  if(g.querySelector('.register-label')?.textContent!==(c.kind==='ch'?'CHALLENGE':`SOLUTION ${c.st||'TPI'}`)||(c.ref&&!g.textContent.includes(c.ref)))issues.push([c.id,'header/reference']);
  if(b.x<bounds.x||b.y<bounds.y||b.x+b.width>bounds.x+bounds.width||b.y+b.height>bounds.y+bounds.height)issues.push([c.id,'outside map']);
  for(const t of g.querySelectorAll(':scope > text')){
   const tb=t.getBBox();if(tb.x<b.x+5||tb.x+tb.width>b.x+b.width-5||tb.y<b.y||tb.y+tb.height>b.y+b.height)issues.push([c.id,'text outside card']);
   const a=luminance(getComputedStyle(t).fill),bg=luminance(getComputedStyle(body).fill);if((Math.max(a,bg)+.05)/(Math.min(a,bg)+.05)<4.5)issues.push([c.id,'contrast']);
  }
  for(const o of groups){if(o===g)continue;const r=o.querySelector(':scope > .b');if(r&&intersects(b,r.getBBox()))issues.push([c.id,'overlap node',o.dataset.id]);}
  for(const o of obstacles)if(intersects(b,o.getBBox()))issues.push([c.id,'overlap label',o.classList.value]);
  const downstream=svg.querySelector(`.stage-handoffs[data-frame="${c.frame}"][data-direction="down"]`);
  if(downstream&&b.y+b.height>downstream.getBBox().y)issues.push([c.id,'not above Downstream']);
  if(getComputedStyle(g).display==='none'||getComputedStyle(g).visibility!=='visible')issues.push([c.id,'hidden']);
  g.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  const text=document.querySelector('#card-content').textContent;
  if(!text.includes(c.full||c.t)||(c.src&&!text.includes(c.src)))issues.push([c.id,'card source']);
  for(const ref of c.kind==='ch'?c.steps||[]:[]){const activity=lab.getNodes()[`${c.frame}|${ref}`];if(activity){const el=svg.querySelector(`[data-id="${CSS.escape(activity.id)}"]`);if(!el.classList.contains('sel')||!text.includes(activity.s.t)||!activity.s.pp.includes(c.full||c.t))issues.push([c.id,'activity link',ref]);}}
 }
 for(const kind of ['ch','tpi']){
  const records=kind==='ch'?expected.challenges:expected.initiatives;
  for(const frame of new Set(records.map(c=>c.frame))){
   const cards=records.filter(c=>c.frame===frame).map(c=>lab.getNodes()[c.id]).filter(Boolean);
   const rows=[...new Set(cards.map(c=>c.y))];
   if(rows.length!==Math.ceil(cards.length/4)||rows.some((y,i)=>cards.filter(c=>c.y===y).length!==Math.min(4,cards.length-i*4)))issues.push([frame,kind,'four-card wrapping']);
  }
 }
 document.querySelector('#close-card').click();
 return issues;
},expected)}
async function overviewCheck(expected){return page.evaluate(expected=>{
 const issues=[],seenChallenges=new Set(),seenTags=new Set(),lab=window.NeuralLab;
 for(const g of document.querySelectorAll('#overview-svg .flow-node')){
  const r=lab.flow.records[g.dataset.process];g.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  const card=document.querySelector('#card-content');
  const challenges=expected.challenges.filter(c=>c.frame===r.f.id&&(!r.P||!c.steps?.length||c.steps.some(s=>s.startsWith(r.P.id+'|'))));
  const tagged=expected.tagged.filter(n=>n.frame===r.f.id&&(!r.P||!n.process||n.process===r.P.id));
  const actualCh=[...card.querySelectorAll('[data-source-challenge]')];
  if(JSON.stringify(actualCh.map(n=>n.dataset.sourceChallenge))!==JSON.stringify(challenges.map(c=>c.id)))issues.push([r.id,'challenge coverage']);
  challenges.forEach(c=>{seenChallenges.add(c.id);const node=actualCh.find(n=>n.dataset.sourceChallenge===c.id);if(!node?.textContent.includes(c.full||c.t))issues.push([c.id,'high-level challenge text']);});
  const actualTags=[...card.querySelectorAll('[data-source-node]')].map(n=>({id:n.dataset.sourceNode,tags:[...n.querySelectorAll('[data-source-tag]')].map(t=>({kind:t.dataset.sourceTag,label:t.textContent}))}));
  if(JSON.stringify(actualTags)!==JSON.stringify(tagged.map(n=>({id:n.id,tags:n.tags}))))issues.push([r.id,'tag coverage']);
  tagged.forEach(n=>seenTags.add(n.id));
  for(const pain of r.pain)if(!card.textContent.includes(pain))issues.push([r.id,'missing pain text',pain]);
  for(const el of card.querySelectorAll('[data-source-challenge],[data-source-node],.source-tag'))if(el.scrollWidth>el.clientWidth+1)issues.push([r.id,'card overflow']);
  if(!document.querySelector('#information-card').matches(':popover-open'))issues.push([r.id,'closed card']);
 }
 document.querySelector('#close-card').click();
 if(seenChallenges.size!==expected.challenges.length)issues.push(['high-level total challenges',seenChallenges.size,expected.challenges.length]);
 if(seenTags.size!==expected.tagged.length)issues.push(['high-level total tagged nodes',seenTags.size,expected.tagged.length]);
 return {issues,challenges:seenChallenges.size,taggedNodes:seenTags.size,sourceTags:expected.tagged.reduce((n,r)=>n+r.tags.length,0)};
},expected)}
try{
 await fs.mkdir('.runtime/challenge-fix',{recursive:true});
 await page.goto(process.argv[3]||'http://127.0.0.1:8767/',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.FinanceLab&&document.querySelector('#loading').hidden);
 for(const [key,name] of Object.entries(towers)){
  await page.locator('.keyboard-organ').filter({hasText:name}).evaluate(n=>n.click());
  await page.locator('#detailed-flow-button').click();
  for(const scenario of ['asis','tobe']){
   if(scenario==='tobe')await page.locator('#scenario-slot [data-scenario-option=tobe]').click();
   await page.waitForFunction(s=>window.NeuralLab?.getState().scenario===s,scenario);
   await page.locator('button[data-mode=detail]').click();
   const data=JSON.parse(await fs.readFile(`dist/neural/${key}${scenario==='tobe'?'-ai':''}.json`,'utf8')).data,exp=expected(data,scenario);
   const issues=await detailCheck(exp);
   await page.locator('#readable').click();issues.push(...await detailCheck(exp));
   if(key==='FPAC')await page.screenshot({path:`.runtime/challenge-fix/${key}-${scenario}-detail.png`});
   if(key==='CAPEX'&&scenario==='tobe'){
    const longest=exp.challenges.reduce((a,c)=>(c.full||c.t).length>(a.full||a.t).length?c:a);
    await page.locator(`[data-id="${longest.id}"]`).screenshot({path:'.runtime/challenge-fix/long-challenge.png'});
   }
   if(exp.challenges.length){
    await page.locator(`[data-id="${exp.challenges[0].id}"]`).focus();await page.keyboard.press('Enter');
    assert.ok(await page.locator('#information-card').evaluate(n=>n.matches(':popover-open')));
    await page.locator('#close-card').click();
   }
   await page.locator('button[data-mode=overview]').click();
   const high=await overviewCheck(exp);issues.push(...high.issues);
   if(key==='FPAC'){
    await page.locator('#overview-svg .flow-node').first().focus();await page.keyboard.press('Enter');
    await page.locator('#information-card').screenshot({path:`.runtime/challenge-fix/${scenario}-overview-card.png`});
    if(scenario==='tobe'){
     await page.locator('#card-content .source-tag-register').scrollIntoViewIfNeeded();
     await page.locator('#information-card').screenshot({path:'.runtime/challenge-fix/overview-tags.png'});
    }
    await page.locator('#close-card').click();
   }
   results.push({tower:key,scenario,challenges:exp.challenges.length,highLevelChallenges:high.challenges,taggedNodes:high.taggedNodes,sourceTags:high.sourceTags,issues});
   console.log(JSON.stringify(results.at(-1)));
  }
  // Reload the earlier scenario from a high-level view and check no stale AI tags.
  await page.locator('#scenario-slot [data-scenario-option=asis]').click();
  await page.waitForFunction(()=>window.NeuralLab?.getState().scenario==='asis');
  assert.equal(await page.locator('[data-node-annotation]').count(),0);
  assert.equal(await page.locator('.challenge-node').count(),results.at(-1).challenges);
  await page.locator('#lab-return').click();await page.locator('#back').click();
 }
 const report={status:errors.length||results.some(r=>r.issues.length)?'FAIL':'PASS',viewport:'3840×2160',results,errors};
 await fs.writeFile('.runtime/challenge-fix/browser-check.json',JSON.stringify(report,null,2)+'\n');
 assert.equal(report.status,'PASS');
}finally{await browser.close()}
