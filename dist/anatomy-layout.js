// One coordinate system for the desktop anatomy, its HTML cards and WebGL.
// Fit the approved 2560 × 1440 composition without stretching its proportions.
export const ANATOMY_REFERENCE = Object.freeze({width:2560,height:1440});

export function desktopAnatomyLayout(width,height){
  if(width<2500||height<1200)return null;
  const scale=Math.min(width/ANATOMY_REFERENCE.width,height/ANATOMY_REFERENCE.height);
  return {width:ANATOMY_REFERENCE.width,height:ANATOMY_REFERENCE.height,scale,
    x:(width-ANATOMY_REFERENCE.width*scale)/2,
    y:(height-ANATOMY_REFERENCE.height*scale)/2};
}

export function syncAnatomyLayout(){
  const stage=document.querySelector('#section-1');
  const layout=desktopAnatomyLayout(innerWidth,innerHeight);
  stage.dataset.scaledDesktop=String(!!layout);
  for(const [name,value] of Object.entries({scale:layout?.scale??1,x:layout?.x??0,y:layout?.y??0})){
    stage.style.setProperty(`--anatomy-${name}`,name==='scale'?String(value):`${value}px`);
  }
  return layout;
}

// DOM rectangles are physical display pixels; scene and label coordinates are
// logical pixels inside the anatomy stage. Account for its enclosing transform.
export function elementDisplayScale(element){
  return element.clientWidth?element.getBoundingClientRect().width/element.clientWidth:1;
}
