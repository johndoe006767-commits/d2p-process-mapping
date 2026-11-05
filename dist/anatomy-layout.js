// One coordinate system for the desktop anatomy, its HTML cards and WebGL.
// Fit the approved 2560 × 1440 composition without stretching its proportions.
export const ANATOMY_REFERENCE = Object.freeze({width:2560,height:1440});

export function desktopAnatomyLayout(width,height){
  if(width<1024||height<=0)return null;
  // Fit the browser's usable viewport, including window resizes and browser
  // zoom. There are no monitor-specific exceptions or DPR-based layout sizes.
  const scale=Math.min(width/ANATOMY_REFERENCE.width,height/ANATOMY_REFERENCE.height);
  return {width:ANATOMY_REFERENCE.width,height:ANATOMY_REFERENCE.height,scale,zoom:1,
    x:(width-ANATOMY_REFERENCE.width*scale)/2,
    y:(height-ANATOMY_REFERENCE.height*scale)/2};
}

export function syncAnatomyLayout(){
  const stage=document.querySelector('#section-1');
  const layout=desktopAnatomyLayout(document.documentElement.clientWidth,innerHeight);
  stage.dataset.scaledDesktop=String(!!layout);
  stage.dataset.displayZoom=String(layout?.zoom??1);
  for(const [name,value] of Object.entries({scale:layout?.scale??1,x:layout?.x??0,y:layout?.y??0})){
    stage.style.setProperty(`--anatomy-${name}`,name==='scale'?String(value):`${value}px`);
  }
  // Font floors are in physical CSS pixels after the scene transform. The
  // summary has its own retained 1.5x zoom, so compensate for that only there.
  stage.style.setProperty('--anatomy-font-floor',`${9/(layout?.scale||1)}px`);
  stage.style.setProperty('--anatomy-hud-font-floor',`${9/((layout?.scale||1)*1.5)}px`);
  stage.style.setProperty('--anatomy-hit-floor',`${28/(layout?.scale||1)}px`);
  stage.style.setProperty('--anatomy-density',String(Math.min(1,Math.max(.65,(layout?.scale||1)/.75))));
  return layout;
}

// DOM rectangles are physical display pixels; scene and label coordinates are
// logical pixels inside the anatomy stage. Account for its enclosing transform.
export function elementDisplayScale(element){
  return element.clientWidth?element.getBoundingClientRect().width/element.clientWidth:1;
}
