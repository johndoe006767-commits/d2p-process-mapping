// GFS support companion. It deliberately has no process-map or source-register bindings.
export function createHelpdesk(host, {onOpen, onClose}) {
  // Visible alpha bounds, measured from the original transparent artwork.
  const fullArt={width:887,height:1774,left:214,top:1,right:695,bottom:1715};
  const portraitArt={width:1254,height:1254,left:117,top:16,right:1156,bottom:1236};
  const root = document.createElement('div');
  root.id = 'helpdesk';
  root.dataset.available = 'false';
  root.innerHTML = `
    <button class="helpdesk-launcher" type="button" aria-label="Explore GFS Finance Helpdesk" aria-controls="helpdesk-detail" disabled>
      <span class="helpdesk-art">
        <img class="helpdesk-full" src="assets/helpdesk/nurse-full.png" alt="" decoding="async" draggable="false">
        <img class="helpdesk-portrait" src="assets/helpdesk/nurse-portrait.png" alt="" decoding="async" draggable="false">
      </span>
      <span class="helpdesk-dock-label">GFS Helpdesk</span>
    </button>
    <aside class="helpdesk-preview" aria-label="Helpdesk KPI Preview" hidden>
      <h2>GFS Finance Helpdesk</h2>
      <p>Placeholder Data</p>
      <dl><div><dt>KPI Name</dt><dd>—</dd></div><div><dt>KPI Name</dt><dd>—</dd></div><div><dt>KPI Name</dt><dd>—</dd></div></dl>
      <button type="button" class="helpdesk-preview-open">View Helpdesk <svg class="ico" aria-hidden="true"><use href="#i-ne"/></svg></button>
    </aside>
    <section id="helpdesk-detail" aria-labelledby="helpdesk-title" hidden>
      <button type="button" class="helpdesk-back"><svg class="ico" aria-hidden="true"><use href="#i-left"/></svg>Back to Overview</button>
      <div class="helpdesk-hero" aria-hidden="true">
        <img class="helpdesk-hero-full" src="assets/helpdesk/nurse-full.png" alt="" draggable="false">
        <img class="helpdesk-hero-portrait" src="assets/helpdesk/nurse-portrait.png" alt="" draggable="false">
        <div class="helpdesk-caption"><strong>GFS Finance Helpdesk</strong><span>Service Support</span></div>
      </div>
      <div class="helpdesk-dashboard">
        <div class="helpdesk-heading"><div><h1 id="helpdesk-title">GFS Finance Helpdesk</h1><p>Placeholder Data · Reporting Period</p></div><label class="helpdesk-period">Period<select aria-label="Helpdesk Reporting Period" disabled><option>Reporting Period</option></select></label></div>
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
    const portrait=state.progress>.625,art=portrait?portraitArt:fullArt;
    const img=root.querySelector(portrait?'.helpdesk-portrait':'.helpdesk-full');
    const r=img.getBoundingClientRect(),padding=parseFloat(getComputedStyle(img).paddingBottom)||0;
    const contentHeight=r.height-padding,scale=Math.min(r.width/art.width,contentHeight/art.height);
    const x=r.left+(r.width-art.width*scale)/2,y=r.top+(contentHeight-art.height*scale)*(portrait?1:.5);
    return {left:x+art.left*scale,right:x+art.right*scale,top:y+art.top*scale,bottom:y+art.bottom*scale};
  }
  function placePreview(){
    if(preview.hidden)return;
    const bounds=host.getBoundingClientRect(),r=visibleArtBounds(),card=preview.getBoundingClientRect();
    const gap=Math.max(16,Math.min(32,state.width*.008)),pad=16;
    let x=r.right-bounds.left+gap;
    if(x+card.width>state.width-pad)x=r.left-bounds.left-card.width-gap;
    const y=Math.max(16,Math.min(r.top-bounds.top+(r.bottom-r.top)*.12,state.height-card.height-24));
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
      entrance=hero.animate([{transform:`translate(${from.left+from.width/2-to.left-to.width/2}px,${from.top-to.top}px) scale(${scale})`,opacity:.15},{transform:'translate(0,0) scale(1)',opacity:1}],{duration:520,easing:'cubic-bezier(.16,1,.3,1)'});
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
  function update({progress,width,height,available:nextAvailable,floorY,shoulderY}){
    if(available!==nextAvailable){available=nextAvailable;root.dataset.available=String(available);launcher.disabled=!available;if(!available)hidePreview();}
    if(state.width===width&&state.height===height&&Math.abs(state.progress-progress)<.0002)return;
    state={progress,width,height};
    const mobile=width<768, t=Math.max(0,Math.min(1,progress));
    const feet=floorY??height*.88744,head=(shoulderY??height*.239295)+height*.014;
    const bodyHeight=mobile?Math.min(height*.48,width*.65):(feet-head)*fullArt.height/(fullArt.bottom-fullArt.top);
    const bodyWidth=bodyHeight*fullArt.width/fullArt.height,bodyX=width*(mobile?.80:.69)-bodyWidth/2;
    const bodyY=feet-bodyHeight*fullArt.bottom/fullArt.height;
    const dockWidth=Math.max(64,Math.min(240,width*.065));
    const dockHeight=dockWidth*1.15+Math.max(14,width*.006);
    const dockX=width-dockWidth-Math.max(12,width*.015),dockY=height-dockHeight-Math.max(14,height*.025);
    const mix=(a,b)=>a+(b-a)*t;
    const blend=Math.max(0,Math.min(1,(t-.40)/.45));
    launcher.style.transform=`translate3d(${mix(bodyX,dockX)}px,${mix(bodyY,dockY)}px,0)`;
    launcher.style.width=`${mix(bodyWidth,dockWidth)}px`;launcher.style.height=`${mix(bodyHeight,dockHeight)}px`;
    root.style.setProperty('--helpdesk-full-opacity',String(1-blend));root.style.setProperty('--helpdesk-portrait-opacity',String(blend));
    root.dataset.docked=String(t>.8);placePreview();
  }
  const hideOnBlur=()=>{if(!opened)hidePreview();};window.addEventListener('blur',hideOnBlur);
  return {get isOpen(){return opened;},update,close,destroy(){clearTimeout(hideTimer);entrance?.cancel();window.removeEventListener('blur',hideOnBlur);root.remove();}};
}
