// Run against the local server: node tests/desktop-sizing.mjs /path/to/playwright/index.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.argv[2]).href);
const url=process.argv[3]||'http://127.0.0.1:8767/';
const sizes=[[3840,2160],[3180,2160],[2560,1440],[2552,1250],[1920,1080],[1536,864],[1440,900],[1366,768],[1280,720],[1024,768],[1024,600],[3440,1440],[5120,1440],[1080,1920]];
const towers=['FP&A Commercial','CAPEX','Controlling','Tax','Record to Report Operations','Purchase To Pay','FP&A Operations','Order to Cash'];
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:3840,height:2160},reducedMotion:'reduce'});
const errors=[],failedRequests=[],results=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))failedRequests.push(r.url())});
const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const openTower=async name=>{await page.locator('.keyboard-organ').filter({hasText:name}).evaluate(el=>el.click());await settle()};
async function checkSurface(label,selector,{text=false,clearance=false}={}){
 const issues=await page.evaluate(({selector,text,clearance})=>{
  const visible=el=>el.getClientRects().length&&!el.closest('[hidden]')&&getComputedStyle(el).visibility!=='hidden';
  const elements=[...document.querySelectorAll(selector)].filter(visible),issues=[];
  const stage=document.querySelector('#section-1'),scale=parseFloat(stage.style.getPropertyValue('--anatomy-scale'));
  for(const el of elements){
   const r=el.getBoundingClientRect();
   if(r.left<-.5||r.top<-.5||r.right>innerWidth+.5||r.bottom>innerHeight+.5)issues.push('outside viewport: '+(el.id||el.className));
   // Number badges, preview pointer bridges and stage connector lines extend
   // beyond their boxes. The containing navigation still must not overflow.
   if(!el.matches('.process-plus,.helpdesk-preview,#stages button')&&el.scrollWidth>el.clientWidth+2)issues.push('horizontal overflow: '+(el.id||el.className));
  }
  if(text)for(const el of document.querySelectorAll('#labels .label.card *,#tower-telemetry-hud *,#process-neurons .process-name')){
   if(!visible(el)||![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;
   const fontSize=parseFloat(getComputedStyle(el).fontSize)*scale*(el.closest('#tower-telemetry-hud')?1.5:1);
   if(fontSize<8.98)issues.push('text below 9px: '+el.textContent.slice(0,50));
  }
  if(clearance){
   const names=[...document.querySelectorAll('.process-name')].filter(visible),buttons=[...document.querySelectorAll('.process-plus')].filter(visible);
   const overlap=(a,b)=>{a=a.getBoundingClientRect();b=b.getBoundingClientRect();return Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top))};
   names.forEach((a,i)=>{for(const b of names.slice(i+1).concat(buttons))if(overlap(a,b)>1)issues.push('overlapping label: '+a.textContent)});
  }
  return issues;
 },{selector,text,clearance});
 assert.deepEqual(issues,[],label);
}
async function checkCanvas(){
 const {actual,expected}=await page.locator('#scene').evaluate(el=>({actual:el.width,expected:Math.floor(el.getBoundingClientRect().width*Math.min(devicePixelRatio,1.75))}));
 assert.ok(Math.abs(actual-expected)<=1,`canvas resolution ${actual}, expected ${expected}`);
}
try{
 await fs.mkdir('.runtime/desktop-sizing',{recursive:true});
 await page.goto(url,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.FinanceLab&&document.querySelector('#loading').hidden,null,{timeout:60000});
 for(const [width,height] of sizes){
  await page.setViewportSize({width,height});await settle();
  await page.locator('#assembly').evaluate(el=>{el.value=1000;el.dispatchEvent(new Event('input',{bubbles:true}))});await settle();
  await checkSurface(`${width}×${height} overview`,'#labels .label.card',{text:true});await checkCanvas();
  const allTowers=width===3840||width===1366||(width===1024&&height===600);
  for(const name of allTowers?towers:[towers[0]]){
   await openTower(name);
   await checkSurface(`${width}×${height} ${name}`,'#tower-telemetry-hud,#detail #back,.process-name,.process-plus',{text:true,clearance:true});
   await page.locator('#back').click();
  }
  if(allTowers){
   await page.locator('.helpdesk-launcher').hover();await settle();
   await checkSurface('support preview','.helpdesk-preview');
   await page.locator('.helpdesk-launcher').click();
   await checkSurface('support detail','.helpdesk-dashboard,.helpdesk-back');
   await page.locator('.helpdesk-back').click();
  }
  await openTower(towers[0]);
  await page.locator('#high-level-button').click();await page.waitForFunction(()=>window.NeuralLab?.getState().mode==='overview');
  await checkSurface('map navigation','#navigation,#navigation button');
  if(allTowers){
   await page.locator('[data-mode=detail]').click();await page.waitForFunction(()=>window.NeuralLab?.getState().mode==='detail');
   await page.locator('#readable').click();assert.equal(await page.evaluate(()=>window.NeuralLab.getState().scale),1.5);
   await page.locator('#fit').click();
   await page.locator('#first-step').evaluate(el=>el.click());await page.waitForFunction(()=>document.querySelector('#information-card').matches(':popover-open'));
   await checkSurface('information card','#information-card');
   const alternate=width===3840?{width:1366,height:768}:{width:3840,height:2160};
   await page.setViewportSize(alternate);await settle();
   // Changing the fitted map scale intentionally dismisses its active card.
   await page.locator('#first-step').evaluate(el=>el.click());await page.waitForFunction(()=>document.querySelector('#information-card').matches(':popover-open'));
   await checkSurface('resized information card','#information-card');
   await page.locator('#close-card').click();
   await page.locator('#lab-return').click();await settle();await checkCanvas();
   await checkSurface('returned resized summary','#tower-telemetry-hud,.process-name,.process-plus',{text:true,clearance:true});
   await page.setViewportSize({width,height});await settle();
  }else await page.locator('#lab-return').click();
  if(width===1024&&height===600)await page.screenshot({path:'.runtime/desktop-sizing/final-compact-summary.png'});
  await page.locator('#back').click();
  results.push({width,height,towers:allTowers?8:1,status:'PASS'});console.log(JSON.stringify(results.at(-1)));
 }
 // Retina/laptop scaling affects canvas resolution, never the logical layout.
 const retina=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:2,reducedMotion:'reduce'});
 await retina.goto(url,{waitUntil:'networkidle'});await retina.waitForFunction(()=>window.FinanceLab&&document.querySelector('#loading').hidden,null,{timeout:60000});
 const density=await retina.locator('#scene').evaluate(el=>({width:el.clientWidth,actual:el.width,expected:Math.floor(el.getBoundingClientRect().width*1.75)}));
 assert.equal(density.width,2560);assert.equal(density.actual,density.expected);await retina.close();
 assert.deepEqual(errors,[],'browser errors');assert.deepEqual(failedRequests,[],'failed requests');
 await fs.writeFile('.runtime/desktop-sizing/verification.json',JSON.stringify({status:'PASS',results,retina:density,errors,failedRequests},null,2));
}finally{await browser.close()}
