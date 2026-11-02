// One coordinate system for the desktop anatomy, its HTML cards and WebGL.
// Fit the approved 2560 × 1440 composition without stretching its proportions.
export const ANATOMY_REFERENCE = Object.freeze({width:2560,height:1440});

export function desktopAnatomyLayout(width,height,display={width,height}){
  if(width<2500||height<1200)return null;
  // This is application zoom, leaving the user's browser zoom preference intact.
  const compactDisplay=(display.width===3180&&display.height===2160)||(width===3180&&height===2160);
  const zoom=compactDisplay?.75:1;
  const scale=Math.min(width/ANATOMY_REFERENCE.width,height/ANATOMY_REFERENCE.height)*zoom;
  return {width:ANATOMY_REFERENCE.width,height:ANATOMY_REFERENCE.height,scale,zoom,
    x:(width-ANATOMY_REFERENCE.width*scale)/2,
    y:(height-ANATOMY_REFERENCE.height*scale)/2};
}

export function syncAnatomyLayout(){
  const stage=document.querySelector('#section-1');
  const layout=desktopAnatomyLayout(innerWidth,innerHeight,screen);
  stage.dataset.scaledDesktop=String(!!layout);
  stage.dataset.displayZoom=String(layout?.zoom??1);
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
