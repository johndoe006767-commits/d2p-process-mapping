const button=document.querySelector('#display-fullscreen');
const status=document.querySelector('#display-status');

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
