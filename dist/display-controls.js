const button=document.querySelector('#display-fullscreen');
const status=document.querySelector('#display-status');

// Context-menu events stay inside their document, so cover embedded pages too.
const guardedDocuments=new WeakSet();
const watchedFrames=new WeakMap();
function guardFrame(frame){
  try{guardContextMenu(frame.contentDocument);}catch{}
}
function stopFrameWatch(frame){
  const state=watchedFrames.get(frame);
  if(state){cancelAnimationFrame(state.pending);state.pending=0;}
}
function watchFrame(frame,navigating=false){
  let state=watchedFrames.get(frame);
  if(!state){
    state={pending:0};watchedFrames.set(frame,state);
    frame.addEventListener('load',()=>{stopFrameWatch(frame);guardFrame(frame);});
  }
  stopFrameWatch(frame);
  guardFrame(frame);
  // A frame can become visible before load, which waits for nested resources.
  // Watch only until its new document exists, then install the guard immediately.
  let previous;
  try{previous=frame.contentDocument;}catch{return;}
  if(!navigating&&previous&&previous.URL!=='about:blank')return;
  if(!frame.hasAttribute('srcdoc')&&(!frame.src||new URL(frame.src,frame.ownerDocument.baseURI).origin!==location.origin))return;
  const check=()=>{
    state.pending=0;
    if(!frame.isConnected)return;
    let current;
    try{current=frame.contentDocument;}catch{return;}
    if(current&&current!==previous){guardContextMenu(current);return;}
    state.pending=requestAnimationFrame(check);
  };
  state.pending=requestAnimationFrame(check);
}
function eachFrame(node,callback){
  if(node.nodeType!==1)return;
  if(node.localName==='iframe')callback(node);
  node.querySelectorAll('iframe').forEach(frame=>callback(frame));
}
function guardContextMenu(doc){
  if(!doc||guardedDocuments.has(doc))return;
  guardedDocuments.add(doc);
  doc.addEventListener('contextmenu',event=>{
    if(document.fullscreenElement)event.preventDefault();
  },{capture:true});
  const observer=new MutationObserver(records=>{
    for(const record of records){
      if(record.type==='attributes'){
        if(record.target.localName==='iframe')watchFrame(record.target,true);
      }else{
        record.removedNodes.forEach(node=>eachFrame(node,stopFrameWatch));
        record.addedNodes.forEach(node=>eachFrame(node,watchFrame));
      }
    }
  });
  const observe=()=>observer.observe(doc,{childList:true,subtree:true,attributes:true,attributeFilter:['src','srcdoc']});
  observe();
  doc.querySelectorAll('iframe').forEach(frame=>watchFrame(frame));
  doc.defaultView.addEventListener('pagehide',()=>{observer.disconnect();doc.querySelectorAll('iframe').forEach(stopFrameWatch);});
  doc.defaultView.addEventListener('pageshow',observe);
}
guardContextMenu(document);

if(document.fullscreenEnabled&&document.documentElement.requestFullscreen){
  button.hidden=false;
  document.body.dataset.fullscreenControl='true';
  const sync=()=>{
    const active=!!document.fullscreenElement;
    button.setAttribute('aria-pressed',String(active));
    button.setAttribute('aria-label',active?'Exit fullscreen':'Enter fullscreen');
    button.title=active?'Exit fullscreen':'Enter fullscreen';
    status.hidden=true;
  };
  button.addEventListener('click',async()=>{
    button.disabled=true;
    status.hidden=true;
    try{
      if(document.fullscreenElement)await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      sync();
    }catch{
      status.textContent='Fullscreen could not open. Please try again from a browser tab.';
      status.hidden=false;
    }finally{button.disabled=false;}
  });
  document.addEventListener('fullscreenchange',sync);
  sync();
}
