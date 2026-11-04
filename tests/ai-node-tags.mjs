// Compare every AI node annotation with the supplied map records and reviews.
// Usage: node tests/ai-node-tags.mjs /absolute/path/to/playwright/index.mjs [url]
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.argv[2]).href);
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:3840,height:2160},reducedMotion:'reduce'});
const errors=[],results=[];
page.on('pageerror',error=>errors.push(error.message));
const towers={FPAC:'FP&A Commercial',FPAO:'FP&A Operations',CAPEX:'CAPEX / Fixed Assets',P2P:'Purchase To Pay',O2C:'Order to Cash',TAX:'Tax',R2R:'Record to Report Operations',CTRL:'Controlling'};
function flatten(steps){
 return steps.flatMap(s=>s.split?s.branches.flatMap(b=>flatten(b.steps)):s.fork?s.branches.flatMap(b=>flatten([b.step])):s.gate?(s.fix?[s.fix]:[]):[s]);
}
function expectedNodes(data){
 const expected=[];
 function add(id,record,reviewKey){
  const review=data.review?.[reviewKey]||data.review?.[record.t]||{};
  const labels={feasibility:record.feas||record.holdfeas||review.feas,reference:record.feasn,scope:record.scope};
  expected.push({id,tags:Object.entries(labels).filter(([,v])=>String(v||'').trim()).map(([kind,v])=>({kind,label:String(v).trim()}))});
 }
 for(const f of data.frames){
  for(const p of f.procs){
   for(const s of flatten(p.steps))add(`${f.id}|${p.id}|${s.n}`,s,`${p.id}|${s.n}`);
   if(p.opp)add(`${f.id}|${p.id}|opp`,p.opp,`${p.id}|opp`);
  }
  if(f.opp)add(`${f.id}|opp`,f.opp,`${f.id}|opp`);
 }
 return expected;
}
async function inspect(expected){
 return page.evaluate(expected=>{
  const issues=[],counts={feasibility:0,reference:0,scope:0};
  const svg=document.querySelector('#map-svg'),bounds=svg.viewBox.baseVal;
  const rects=[...svg.querySelectorAll('[data-id] > .b')].map(el=>({id:el.parentElement.dataset.id,box:el.getBBox()}));
  const labels=[...svg.querySelectorAll('.step-output,.process-heading,.stage-handoffs,[data-stage-heading]')].map(el=>({name:el.classList.value||'stage heading',box:el.getBBox()}));
  const intersects=(a,b)=>a.x<b.x+b.width-.5&&a.x+a.width>b.x+.5&&a.y<b.y+b.height-.5&&a.y+a.height>b.y+.5;
  const luminance=value=>{
   const rgb=value.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});
   return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
  };
  for(const node of expected){
   const group=svg.querySelector(`[data-id="${CSS.escape(node.id)}"]`);
   if(!group){issues.push([node.id,'missing node']);continue}
   const tags=[...group.querySelectorAll('[data-node-annotation]')];
   const actual=tags.map(tag=>({kind:tag.dataset.nodeAnnotation,label:tag.dataset.label}));
   if(JSON.stringify(actual)!==JSON.stringify(node.tags))issues.push([node.id,'source labels',actual,node.tags]);
   let bottom=group.querySelector(':scope > .b').getBBox().y+group.querySelector(':scope > .b').getBBox().height;
   for(const tag of tags){
    counts[tag.dataset.nodeAnnotation]++;
    const box=tag.querySelector('rect').getBBox(),text=[...tag.querySelectorAll('text')];
    if(text.map(n=>n.textContent).join(' ')!==tag.dataset.label.replace(/\s+/g,' '))issues.push([node.id,'truncated text']);
    if(box.y<bottom+3)issues.push([node.id,'footer spacing']);
    bottom=box.y+box.height;
    if(box.x<bounds.x||box.x+box.width>bounds.x+bounds.width||box.y<bounds.y||box.y+box.height>bounds.y+bounds.height)issues.push([node.id,'outside map bounds']);
    for(const line of text){
     const b=line.getBBox();
     if(b.x<box.x+5||b.x+b.width>box.x+box.width-5||b.y<box.y||b.y+b.height>box.y+box.height)issues.push([node.id,'text outside tag']);
     const a=luminance(getComputedStyle(line).fill),bkg=luminance(getComputedStyle(tag.querySelector('rect')).fill);
     if((Math.max(a,bkg)+.05)/(Math.min(a,bkg)+.05)<4.5)issues.push([node.id,'text contrast']);
    }
    if(getComputedStyle(tag).display==='none'||getComputedStyle(tag).visibility!=='visible'||getComputedStyle(group).opacity!=='1')issues.push([node.id,'hidden tag']);
    if(!group.getAttribute('aria-label').includes(tag.dataset.label))issues.push([node.id,'accessible label']);
    for(const other of rects)if(intersects(box,other.box))issues.push([node.id,'overlaps node',other.id]);
    for(const other of labels)if(intersects(box,other.box))issues.push([node.id,'overlaps label',other.name]);
   }
  }
  return {issues,counts,nodes:expected.length};
 },expected);
}
try{
 await fs.mkdir('.runtime/tag-fix',{recursive:true});
 await page.goto(process.argv[3]||'http://127.0.0.1:8767/',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.FinanceLab&&document.querySelector('#loading').hidden);
 for(const [key,name] of Object.entries(towers)){
  await page.locator('.keyboard-organ').filter({hasText:name}).evaluate(n=>n.click());
  await page.locator('#detailed-flow-button').click();
  await page.waitForFunction(()=>window.NeuralLab?.getState().scenario==='asis');
  assert.equal(await page.locator('[data-node-annotation]').count(),0,`${key}: As Is unchanged`);
  await page.locator('#scenario-slot [data-scenario-option=tobe]').click();
  await page.waitForFunction(()=>window.NeuralLab?.getState().scenario==='tobe');
  const data=JSON.parse(await fs.readFile(`dist/neural/${key}-ai.json`,'utf8')).data;
  const expected=expectedNodes(data),inspection=await inspect(expected);
  if(inspection.issues.length)console.log(JSON.stringify({tower:key,issues:inspection.issues}));
  results.push({tower:key,...inspection});
  await page.locator('#readable').click();
  const readable=await inspect(expected);
  results.at(-1).issues.push(...readable.issues);
  if(['FPAC','FPAO','O2C','TAX'].includes(key))await page.screenshot({path:`.runtime/tag-fix/${key}-tags.png`});
  if(key==='FPAC'){
   for(const step of [1,5])await page.locator(`#map-svg [data-id="FPAC-01|FPAC-01.01|${step}"]`).screenshot({path:`.runtime/tag-fix/example-${step}.png`});
   const first=page.locator('#map-svg [data-id="FPAC-01|FPAC-01.01|1"]');
   await first.focus();await page.keyboard.press('Enter');
   await page.waitForFunction(()=>document.querySelector('#information-card').matches(':popover-open'));
   assert.ok((await page.locator('#card-content').textContent()).includes('Can be explored'));
   await page.locator('#close-card').click();
   await first.locator('[data-node-annotation="feasibility"]').click();
   await page.waitForFunction(()=>document.querySelector('#information-card').matches(':popover-open'));
   await page.locator('#close-card').click();
  }
  await page.locator('#scenario-slot [data-scenario-option=asis]').click();
  await page.waitForFunction(()=>window.NeuralLab?.getState().scenario==='asis');
  assert.equal(await page.locator('[data-node-annotation]').count(),0,`${key}: no stale AI tags after switching`);
  await page.locator('#scenario-slot [data-scenario-option=tobe]').click();
  await page.waitForFunction(()=>window.NeuralLab?.getState().scenario==='tobe');
  assert.equal(await page.locator('[data-node-annotation]').count(),expected.reduce((n,r)=>n+r.tags.length,0),`${key}: tags restored without duplicates`);
  await page.locator('#lab-return').click();await page.locator('#back').click();
  console.log(JSON.stringify({tower:key,counts:inspection.counts,nodes:inspection.nodes,issues:results.at(-1).issues.length}));
 }
 const report={status:errors.length||results.some(r=>r.issues.length)?'FAIL':'PASS',viewport:'3840×2160',results,errors};
 await fs.writeFile('.runtime/tag-fix/browser-check.json',JSON.stringify(report,null,2)+'\n');
 assert.equal(report.status,'PASS');
}finally{await browser.close()}
