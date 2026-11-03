// GFS support companion. It deliberately has no process-map or source-register bindings.
import {elementDisplayScale} from './anatomy-layout.js';
export function createHelpdesk(host, {onOpen, onClose}) {
  // Both cutouts are trimmed to their visible bounds.
  const fullAspect=490/952, portraitAspect=495/512;
  const root = document.createElement('div');
  root.id = 'helpdesk';
  root.dataset.available = 'false';
  root.innerHTML = `
    <button class="helpdesk-launcher" type="button" aria-label="Explore GFS Finance Operations Support" aria-controls="helpdesk-detail" disabled>
      <span class="helpdesk-art">
        <svg class="helpdesk-full" viewBox="0 0 490 952" aria-hidden="true">
          <g transform="translate(490 0) scale(-1 1)">
            <image id="nursa-standing-art" href="assets/helpdesk/nursa-full.webp" width="490" height="952"/>
            <!-- Reflect the badge lettering back into reading order. -->
            <svg x="224" y="371" width="44" height="21" viewBox="224 371 44 21" overflow="hidden">
              <use href="#nursa-standing-art" transform="translate(492 0) scale(-1 1)"/>
            </svg>
          </g>
        </svg>
        <img class="helpdesk-portrait" src="assets/helpdesk/nursa-portrait.webp" alt="" decoding="async" draggable="false">
      </span>
      <span class="helpdesk-dock-label"><span>GFS Finance</span><span>Operations Support</span></span>
    </button>
    <aside class="helpdesk-preview" aria-label="Finance Operations Support KPI Preview" hidden>
      <svg class="helpdesk-preview-tail" viewBox="0 0 24 28" preserveAspectRatio="none" aria-hidden="true"><path d="M24 1 Q17 10 1 15 Q15 16 24 27" vector-effect="non-scaling-stroke"/></svg>
      <h2>GFS Finance Operations Support</h2>
      <p>Placeholder Data</p>
      <dl><div><dt>KPI Name</dt><dd>—</dd></div><div><dt>KPI Name</dt><dd>—</dd></div><div><dt>KPI Name</dt><dd>—</dd></div></dl>
      <button type="button" class="helpdesk-preview-open">View Operations Support <svg class="ico" aria-hidden="true"><use href="#i-ne"/></svg></button>
    </aside>
    <section id="helpdesk-detail" aria-labelledby="helpdesk-title" hidden>
      <button type="button" class="helpdesk-back"><svg class="ico" aria-hidden="true"><use href="#i-left"/></svg>Back to Overview</button>
      <div class="helpdesk-hero" aria-hidden="true">
        <img class="helpdesk-hero-full" src="assets/helpdesk/nursa-full.webp" alt="" draggable="false">
        <img class="helpdesk-hero-portrait" src="assets/helpdesk/nursa-portrait.webp" alt="" draggable="false">
        <div class="helpdesk-caption"><strong>GFS Finance Operations Support</strong><span>Service Support</span></div>
      </div>
      <div class="helpdesk-dashboard">
        <div class="helpdesk-heading"><div><h1 id="helpdesk-title">GFS Finance Operations Support</h1><p>Placeholder Data · Reporting Period</p></div><label class="helpdesk-period">Period<select aria-label="Operations Support Reporting Period" disabled><option>Reporting Period</option></select></label></div>
        <dl class="helpdesk-metrics">
          <div><dt>Requests Received</dt><dd>—</dd></div><div><dt>Open Requests</dt><dd>—</dd></div><div><dt>Resolved Requests</dt><dd>—</dd></div><div><dt>SLA Compliance</dt><dd>—</dd></div>
        </dl>
        <div class="helpdesk-middle">
          <section class="helpdesk-trend" aria-labelledby="helpdesk-trend-title"><h2 id="helpdesk-trend-title">Service Trend</h2><div class="helpdesk-chart" role="img" aria-label="Chart placeholder. No service trend data has been provided."><span>Chart Placeholder</span></div></section>
          <section class="helpdesk-process" aria-labelledby="helpdesk-process-title"><h2 id="helpdesk-process-title">Process Information</h2><dl><div><dt>Process</dt><dd>Process Name</dd></div><div><dt>Owner</dt><dd>Owner Name</dd></div><div><dt>Scope</dt><dd>Process Description</dd></div></dl></section>
        </div>
        <section class="helpdesk-kpis" aria-labelledby="helpdesk-kpis-title"><h2 id="helpdesk-kpis-title">KPI Details</h2><table><thead><tr><th scope="col">KPI Name</th><th scope="col">Current</th><th scope="col">Target</th><th scope="col">Status</th></tr></thead><tbody><tr><th scope="row">KPI Name</th><td>—</td><td>—</td><td>Pending Data</td></tr><tr><th scope="row">KPI Name</th><td>—</td><td>—</td><td>Pending Data</td></tr></tbody></table></section>
      </div>
    </section>`;
  host.append(root);
  const launcher=root.querySelector('.helpdesk-launcher'), preview=root.querySelector('.helpdesk-preview'), detail=root.querySelector('#helpdesk-detail');
  const hero=root.querySelector('.helpdesk-hero'), back=root.querySelector('.helpdesk-back');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let opened=false, available=false, state={progress:0,width:0,height:0}, hideTimer, suppressed=false, entrance, keyboardPreview=false;
  function showPreview(){if(!available||opened||suppressed)return;clearTimeout(hideTimer);preview.hidden=false;root.dataset.preview='true';placePreview();}
  function hidePreview(){clearTimeout(hideTimer);preview.hidden=true;delete root.dataset.preview;}
  function delayHide(){clearTimeout(hideTimer);hideTimer=setTimeout(()=>{if(!launcher.matches(':hover')&&!preview.matches(':hover')&&!(keyboardPreview&&root.contains(document.activeElement)))hidePreview();},160);}
  for(const el of [launcher,preview]){
    el.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){keyboardPreview=false;suppressed=false;showPreview();}});
    el.addEventListener('pointerleave',()=>{suppressed=false;delayHide();});
  }
  root.addEventListener('focusin',e=>{keyboardPreview=e.target.matches(':focus-visible');showPreview();});
  root.addEventListener('focusout',delayHide);
  function visibleArtBounds(){
    const portrait=state.progress>.625,aspect=portrait?portraitAspect:fullAspect;
    const img=root.querySelector(portrait?'.helpdesk-portrait':'.helpdesk-full');
    const r=launcher.getBoundingClientRect(),padding=(parseFloat(getComputedStyle(img).paddingBottom)||0)*elementDisplayScale(host);
    const contentHeight=r.height-padding,height=Math.min(contentHeight,r.width/aspect),width=height*aspect;
    const left=r.left+(r.width-width)/2,top=r.top+(contentHeight-height)*(portrait?1:.5);
    return {left,right:left+width,top,bottom:top+height};
  }
  function placePreview(){
    if(preview.hidden)return;
    const bounds=host.getBoundingClientRect(),r=visibleArtBounds(),scale=elementDisplayScale(host);
    const card={width:preview.offsetWidth,height:preview.offsetHeight};
    const gap=Math.max(16,Math.min(32,state.width*.008)),pad=16;
    const rightX=(r.right-bounds.left)/scale+gap;
    const fitsRight=rightX+card.width<=state.width-pad;
    const x=fitsRight?rightX:(r.left-bounds.left)/scale-card.width-gap;
    const capY=(r.top-bounds.top)/scale;
    const eyeFraction=state.progress>.625 ? .45 : .17;
    const eyeY=capY+(r.bottom-r.top)/scale*eyeFraction;
    const y=Math.max(pad,Math.min(capY,state.height-card.height-24));
    preview.dataset.side=fitsRight?'right':'left';
    preview.style.setProperty('--preview-gap',gap+'px');
    preview.style.setProperty('--preview-eye-y',(eyeY-y)+'px');
    preview.style.left=`${Math.max(pad,Math.min(x,state.width-card.width-pad))}px`;
    preview.style.top=`${y}px`;
  }
  function open(){
    if(opened||!available)return;
    const from=launcher.getBoundingClientRect();
    if(onOpen?.()===false)return;
    opened=true;hidePreview();root.dataset.open='true';detail.hidden=false;
    launcher.setAttribute('aria-expanded','true');
    const to=hero.getBoundingClientRect();
    entrance?.cancel();
    if(!reduced.matches&&to.height>0){
      const scale=Math.max(.12,Math.min(1,from.height/to.height));
      const displayScale=elementDisplayScale(host);
      entrance=hero.animate([{transform:`translate(${(from.left+from.width/2-to.left-to.width/2)/displayScale}px,${(from.top-to.top)/displayScale}px) scale(${scale})`,opacity:.15},{transform:'translate(0,0) scale(1)',opacity:1}],{duration:520,easing:'cubic-bezier(.16,1,.3,1)'});
    }
    back.focus({preventScroll:true});
  }
  function close(){
    if(!opened)return;
    entrance?.cancel();opened=false;detail.hidden=true;delete root.dataset.open;
    launcher.setAttribute('aria-expanded','false');onClose?.();
    suppressed=true;launcher.focus({preventScroll:true});
  }
  launcher.setAttribute('aria-expanded','false');
  launcher.addEventListener('click',open);
  root.querySelector('.helpdesk-preview-open').addEventListener('click',open);
  back.addEventListener('click',close);
  root.addEventListener('keydown',e=>{if(e.key==='Tab')keyboardPreview=true;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(opened)close();else{suppressed=true;hidePreview();launcher.focus({preventScroll:true});}}});
  root.addEventListener('wheel',e=>{if(opened)e.stopPropagation();},{passive:true});
  function update({progress,width,height,available:nextAvailable,floorY,midThighY,shoulderY}){
    if(available!==nextAvailable){available=nextAvailable;root.dataset.available=String(available);launcher.disabled=!available;if(!available)hidePreview();}
    if(state.width===width&&state.height===height&&Math.abs(state.progress-progress)<.0002)return;
    state={progress,width,height};
    const mobile=width<768, t=Math.max(0,Math.min(1,progress));
    const head=shoulderY+height*.014;
    const bodyHeight=mobile?Math.min(midThighY-head,width*.65):midThighY-head;
    const bodyWidth=bodyHeight*fullAspect,bodyX=width*(mobile?.80:.69)-bodyWidth/2-15;
    const bodyY=floorY-bodyHeight;
    const dockWidth=mobile?48:Math.max(64,Math.min(240,width*.065));
    const dockGap=mobile?8:Math.max(8,Math.min(18,width*.005));
    const dockHeight=(mobile?62:dockWidth*1.15+Math.max(14,width*.006))+dockGap;
    const dockX=width-dockWidth-(mobile?22:Math.max(12,width*.015)),dockY=height-dockHeight-(mobile?4:Math.max(14,height*.025));
    const mix=(a,b)=>a+(b-a)*t;
    const blend=Math.max(0,Math.min(1,(t-.40)/.45));
    root.style.setProperty('--helpdesk-dock-gap',dockGap+'px');
    launcher.style.transform=`translate3d(${mix(bodyX,dockX)}px,${mix(bodyY,dockY)}px,0)`;
    launcher.style.width=`${mix(bodyWidth,dockWidth)}px`;launcher.style.height=`${mix(bodyHeight,dockHeight)}px`;
    root.style.setProperty('--helpdesk-full-opacity',String(1-blend));root.style.setProperty('--helpdesk-portrait-opacity',String(blend));
    root.dataset.docked=String(t>.8);placePreview();
  }
  const hideOnBlur=()=>{if(!opened)hidePreview();};window.addEventListener('blur',hideOnBlur);
  return {get isOpen(){return opened;},update,close,destroy(){clearTimeout(hideTimer);entrance?.cancel();window.removeEventListener('blur',hideOnBlur);root.remove();}};
}
