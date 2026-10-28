import {openMap} from './real-experience.js?v=galaxy-2';
import * as T from 'three';

// Labels use the actual soma objects from the supplied organ-specific network.
// Geometry, bifurcating dendrites and surface connections live in neurons.js.
export function createProcessNeurons(organ, group, processes, host) {
  group.visible = false;
  const neurons=group.children.filter(child=>/^Neuron \d+$/.test(child.name));
  if(neurons.length!==processes.length)throw new Error('Process and neuron counts must match');
  const nodes = processes.map((process, i) => {
    const neuron=neurons[i];
    neuron.userData.processId=process.id;
    const side=i%2===0?-1:1;
    const label=document.createElement('div'); label.className='process-node'; label.dataset.processId=process.id;
    const title=document.createElement('span');title.className='process-name';title.textContent=process.name;
    const button=document.createElement('button');button.type='button';button.className='process-plus';button.textContent='+';button.dataset.number=String(i+1);button.title=process.name;
    button.setAttribute('aria-label',`Open ${process.name} process`);button.setAttribute('aria-pressed','false');
    button.setAttribute('aria-describedby','process-status');
    label.append(title,button);const leader=document.createElement('span');leader.className='process-leader';leader.setAttribute('aria-hidden','true');host.append(leader,label);
    button.addEventListener('click',event=>{
      host.querySelectorAll('.process-plus').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      host.querySelectorAll('.process-node').forEach(el=>el.classList.toggle('is-selected',el===label));
      document.querySelector('#process-status').textContent=`Opening ${process.name}.`;openMap(organ.id,process.id,'detail',event.detail===0);
      // Open the selected process in the section below.
      host.dispatchEvent(new CustomEvent('process-select',{detail:{towerId:organ.id,processId:process.id},bubbles:true}));
    });
    return {neuron,label,title,button,leader,side,process,world:new T.Vector3()};
  });
  return {group,nodes};
}

export function updateProcessNeurons(organ, active, camera, width, height, time, reduced, layout) {
  const network=organ.processNeurons;
  network.group.visible=active;
  if(active)organ.root.updateMatrixWorld(true);
  for(const node of network.nodes){
    node.label.hidden=!active;node.leader.hidden=!active;node.button.tabIndex=active?0:-1;
    if(!active)continue;
    node.neuron.getWorldPosition(node.world).project(camera);
    node.x=(node.world.x+1)*width/2;node.y=(1-node.world.y)*height/2;
  }
  if(!active||!layout)return;
  // The + is locked to the projected soma. Name panels can move independently
  // to remain readable without moving the anatomical attachment point.
  const nodes=network.nodes;
  for(const node of nodes){
    node.side=node.x<layout.cx?-1:1;
    node.label.dataset.side=String(node.side);
    node.left=node.x-node.button.offsetLeft-node.button.offsetWidth/2;
    node.top=node.y-node.button.offsetTop-node.button.offsetHeight/2;
    node.label.style.transform=`translate3d(${node.left}px,${node.top}px,0)`;
    node.nameX=Math.max(12,Math.min(width-node.title.offsetWidth-12,node.left+node.title.offsetLeft));
    node.nameY=Math.max(layout.T,Math.min(layout.B-node.title.offsetHeight,node.top+node.title.offsetTop));
  }
  // Mount cards beside their soma, moving only as far as needed to keep
  // every card and every circular shortcut readable on the organ.
  const placed=[];
  const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
  const anchors=nodes.map(n=>({x:n.x-n.button.offsetWidth/2-6,y:n.y-n.button.offsetHeight/2-6,w:n.button.offsetWidth+12,h:n.button.offsetHeight+12}));
  for(const node of [...nodes].sort((a,b)=>a.y-b.y)){
    const cw=node.title.offsetWidth,ch=node.title.offsetHeight;
    if(!cw||!ch)continue;
    const preferredX=node.nameX,preferredY=node.nameY;
    const obstacles=anchors.concat(placed);
    let best=null,bestCost=Infinity;
    for(let away=0;away<=72;away+=24){
      for(let dy=-192;dy<=192;dy+=12){
        const x=Math.max(layout.L,Math.min(layout.R-cw,preferredX+node.side*away));
        const y=Math.max(layout.T,Math.min(layout.B-ch,preferredY+dy));
        const rect={x:x-5,y:y-5,w:cw+10,h:ch+10};
        const collisions=obstacles.reduce((sum,r)=>sum+overlap(rect,r),0);
        const cost=collisions*10000+(x-preferredX)**2*1.4+(y-preferredY)**2;
        if(cost<bestCost){bestCost=cost;best={x,y,rect}}
      }
    }
    node.nameX=best.x;node.nameY=best.y;placed.push(best.rect);
  }
  for(const node of nodes){
    node.title.style.transform=`translate(${node.nameX-node.left-node.title.offsetLeft}px,${node.nameY-node.top-node.title.offsetTop}px)`;
    const x=Math.max(node.nameX,Math.min(node.nameX+node.title.offsetWidth,node.x));
    const y=Math.max(node.nameY,Math.min(node.nameY+node.title.offsetHeight,node.y));
    const dx=x-node.x,dy=y-node.y;
    node.leader.style.transform=`translate3d(${node.x}px,${node.y}px,0) rotate(${Math.atan2(dy,dx)}rad) scaleX(${Math.hypot(dx,dy)})`;
  }
}
