/* Presentation adapter. The source page's data, renderers, SVGs and event handlers are unchanged. */
(()=>{
 document.addEventListener('keydown',()=>document.body.classList.add('keyboard-input'));document.addEventListener('pointerdown',()=>document.body.classList.remove('keyboard-input'));
 const key=TOWERS.SOC?'SOC':Object.keys(TOWERS).find(k=>k!=='AIS'), t=TOWERS[key];
 showTower(key); ENG[key].render('asis','all');
 const map=document.getElementById('map-'+key), page=document.getElementById('pg-'+key), high=page.querySelector('#hl-'+key)||page.querySelector('.hl');
 const app=document.createElement('main');app.id='source-workspace';
 const nav=document.createElement('nav');nav.className='source-stages';nav.setAttribute('aria-label','Process stages');
 const frames=t.data.asis.frames;
 frames.forEach((f,i)=>{const b=document.createElement('button');b.type='button';b.textContent=`${i+1}. ${f.name.replace(/^Stage \d+:\s*/, '')}`;b.title=f.name;b.dataset.stage=f.id;b.onclick=e=>go(f.id,e.detail===0);nav.append(b)});
 const label=document.createElement('div');label.className='source-current';label.setAttribute('aria-live','polite');
 const strip=document.createElement('div');strip.className='source-navigation';strip.append(label,nav);app.append(strip);
 const highWrap=document.createElement('div');highWrap.className='source-high';if(high)highWrap.append(high);app.append(highWrap,map);
 [...document.body.children].forEach(e=>{if(!['SCRIPT','STYLE'].includes(e.tagName))e.style.display='none'});document.body.append(app);
 const scroller=document.getElementById('scroll-'+key),svg=document.getElementById('svg-'+key),drawer=document.getElementById('dr-'+key);
 const link=document.createElement('link');link.rel='stylesheet';link.href='../map-bridge.css';document.head.append(link);
 // Expand the whole workspace so the stage navigation stays visible with the map.
 const nativeToggleFull=window.toggleFull;
 window.toggleFull=k=>{nativeToggleFull(k);parent.postMessage({type:'tower-map-expand',expanded:map.classList.contains('full')},parent.location.origin)};
 let mode='detail',lastFocus=null;
 const scale=()=>ENG[key].getScale();
 const frameY=f=>f._box?.top??(()=>{const el=[...svg.querySelectorAll('[data-id]')].find(n=>n.dataset.id.startsWith(f.id+'|'));return el?Math.max(0,el.getBBox().y-110):0})();
 function mark(id){const i=frames.findIndex(f=>f.id===id);label.textContent=`Stage ${i+1} of ${frames.length} · ${frames[i]?.name||''}`;nav.querySelectorAll('button').forEach(b=>{b.setAttribute('aria-current',b.dataset.stage===id?'step':'false')});parent.postMessage({type:'tower-map-stage',id},parent.location.origin)}
 function setMode(value){mode=value;highWrap.hidden=mode!=='high';map.hidden=mode==='high';strip.hidden=mode==='high';if(mode!=='high'){ENG[key].setScale(1);mark(frames[0].id)}else if(!high){highWrap.innerHTML='<p>No high-level flow is supplied for this tower.</p>'}}
 function go(id,instant=false){if(mode!=='detail')setMode('detail');const f=frames.find(f=>f.id===id)||frames[0];scroller.scrollTo({top:frameY(f)*scale()-8,left:0,behavior:instant||matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});mark(f.id)}
 let pending=false;scroller.addEventListener('scroll',()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;let f=frames[0];for(const x of frames){if(frameY(x)*scale()<=scroller.scrollTop+80)f=x}if(scroller.scrollTop>0&&scroller.scrollHeight-scroller.clientHeight-scroller.scrollTop<5)f=frames.at(-1);mark(f.id)})},{passive:true});
 svg.addEventListener('click',e=>{const node=e.target.closest('.nd,.opn');if(node){lastFocus=node;drawer.classList.add('on');drawer.setAttribute('role','dialog');drawer.setAttribute('aria-label','Process step details');drawer.querySelector('button').focus({preventScroll:true})}});
 svg.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&e.target.closest('.nd,.opn')){e.preventDefault();e.target.closest('.nd,.opn').dispatchEvent(new MouseEvent('click',{bubbles:true}))}});
 drawer.querySelector('button').addEventListener('click',()=>lastFocus?.focus({preventScroll:true}));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer.classList.contains('on')){closeDrawer(key);lastFocus?.focus({preventScroll:true})}});
 // Native high-level links retain their handlers, and also open the detailed map.
 high?.addEventListener('click',e=>{const node=e.target.closest('.hln,.hlb');if(!node)return;const pid=node.dataset.p;const f=frames.find(f=>f.procs.some(p=>p.id===pid));if(f)go(f.id);else setMode('detail')});
 window.TowerMap={go,setMode,key,frames:frames.map(f=>({id:f.id,name:f.name})),getScale:scale};
 link.onload=()=>{ENG[key].setScale(1);setMode('detail');parent.postMessage({type:'tower-map-ready',sourceId:window.__sourceTower},parent.location.origin)};
})();
