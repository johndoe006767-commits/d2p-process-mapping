// Capture the supplied HTML's active map bindings and fully rendered registers.
// Usage: node scripts/capture-source.mjs /absolute/path/to/playwright/index.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {chromium}=await import(pathToFileURL(process.argv[2]).href);
const input=(await fs.readdir(path.join(root,'Source'))).filter(n=>n.endsWith('.html'));
if(input.length!==1)throw Error('Expected one authoritative source HTML');
const source=await fs.readFile(path.join(root,'Source',input[0]),'utf8');
const embedded=Object.fromEntries([...source.matchAll(/<script type="application\/json" id="src-([^"]+)">([\s\S]*?)<\/script>/g)].map(m=>[m[1],JSON.parse(m[2])]));
const browser=await chromium.launch({channel:'chrome',headless:true});
const capture={source:input[0],towers:{}};
try {
 for(const key of ['FPAC','FPAO','CAPEX','P2P','O2C','TAX','R2R','CTRL']){
  const page=await browser.newPage({viewport:{width:3840,height:2160}}),errors=[];
  await page.route('https://**',r=>r.abort());
  page.on('pageerror',e=>errors.push(e.message));
  await page.setContent(embedded[key],{waitUntil:'load'});
  const keys=await page.evaluate(()=>Object.keys(TOWERS).filter(k=>document.getElementById('pg-'+k)));
  const scenarios={};
  for(const k of keys){
   await page.evaluate(k=>showTower(k),k);
   // Source overlays queue their changes in animation frames.
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   scenarios[k]=await page.evaluate(k=>{
    const T=TOWERS[k],pg=document.getElementById('pg-'+k);
    const clean=v=>JSON.parse(JSON.stringify(v,(key,val)=>key.startsWith('_')?undefined:val));
    const tryCall=fn=>{try{return clean(fn())}catch{return null}};
    return {tower:clean(T),high:(pg.querySelector('[id^="hl-"],.hl')?.outerHTML||''),
     sections:[...pg.children].filter(n=>!n.id.startsWith('map-')&&!n.id.startsWith('ho-')&&!n.id.startsWith('hl-')&&!n.classList.contains('hl')).map(n=>({id:n.id,tag:n.tagName,className:n.className,title:n.querySelector('h1,h2')?.textContent||'',html:n.innerHTML})),
     handoffSVG:pg.querySelector('[id^="sk-"]')?.outerHTML||'',
     pain:tryCall(()=>T.ai?aiPainRows(T):typeof asRows==='function'?asRows(T.data.asis):painRows(T)),
     opportunities:tryCall(()=>T.ai?aiOpps(T):opps(T)),
     solutions:tryCall(()=>solRows(T)),
     styles:[...document.querySelectorAll('style')].map(n=>n.textContent).join('\n')};
   },k);
  }
  capture.towers[key]={scenarios,errors};
  console.log(key,keys.join('/'),errors.length?'source errors: '+errors.join('; '):'captured');
  await page.close();
 }
 await fs.mkdir(path.join(root,'.runtime/source-sync'),{recursive:true});
 await fs.writeFile(path.join(root,'.runtime/source-sync/capture.json'),JSON.stringify(capture,null,2)+'\n');
}finally{await browser.close()}
