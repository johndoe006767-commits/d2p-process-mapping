import * as T from 'three';
import {REAL,TOWER_HEALTH} from './real-data.js';
import {bindTower,initExperience,hideMap,openMap} from './real-experience.js?v=galaxy-2';
import {createProcessNeurons,updateProcessNeurons} from './process-neurons.js?v=galaxy-2';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {loadReplacement} from './models.js';
import {buildVesselNetwork} from './vessels.js';
import {healthMetrics,cardMarkup,pulseMarkup,metricsSentence,countUp,resetCounts,accentFor} from './health.js?v=20261019-organ-pulses';
import {createHelpdesk} from './helpdesk.js?v=2';
const $=s=>document.querySelector(s);
const configs=[['brain','FP&A Commercial','Brain',-1,0,.18],['liver','CAPEX','Liver',-1,1,.25],['kidneys','Controlling','Kidneys',-1,2,.23],['spleen','Tax','Spleen',-1,3,.12],['lungs','R2R','Lungs',1,0,.32],['stomach','P2P','Stomach',1,1,.17],['pancreas','FP&A Operations','Pancreas',1,2,.20],['intestines','O2C','Intestines',1,3,.29]];
document.addEventListener('visibilitychange',()=>document.body.classList.toggle('page-hidden',document.hidden));
const reduced=matchMedia('(prefers-reduced-motion: reduce)'), fine=matchMedia('(hover: hover) and (pointer: fine)');
const skeletonOpacity=.6; // 1 = solid bones; lower values make the skeleton more see-through
let renderer,scene,camera,heart,bones,skull,ready=false,expanded=false,separation=0,separationTarget=0,selected=null,hover=null,animation=0,last=0,time=0,w=1,h=1,mobile=false,drag=null,lastTrigger=null;
let sceneInView=true;
const sceneObserver=new IntersectionObserver(([entry])=>sceneInView=entry.isIntersecting);sceneObserver.observe($('#section-1'));
const autoTurnAxis=new T.Vector3(0,1,0),autoTurnStep=new T.Quaternion(),autoTurnSpeed=Math.PI/30;
const organs=[],ray=new T.Raycaster(),pointer=new T.Vector2(),p=new T.Vector3();
let anatomyLandmarks;
const helpdesk=createHelpdesk($('#experience'),{
 onOpen(){if(!ready||selected)return false;hideMap();document.body.dataset.helpdesk='true';$('#scene').inert=true;$('#labels').inert=true;hover=null;return true;},
 onClose(){delete document.body.dataset.helpdesk;$('#scene').inert=false;$('#labels').inert=false;}
});
function syncHelpdesk(){
 const projectY=y=>(camera.position.y+camera.top-y)/(camera.top-camera.bottom)*h;
 helpdesk.update({progress:separation,width:w,height:h,available:ready&&!selected,
  floorY:anatomyLandmarks?projectY(anatomyLandmarks.floor):null,
  shoulderY:anatomyLandmarks?projectY(anatomyLandmarks.shoulder):null});
}
// All continuous motion stays in Three.js, outside UI rendering.
function ease(x){ // Skill's cubic-bezier(.77,0,.175,1), inverted on its x axis.
 let lo=0,hi=1,t=x;for(let i=0;i<12;i++){t=(lo+hi)/2;const v=3*(1-t)*(1-t)*t*.77+3*(1-t)*t*t*.175+t*t*t;if(v<x)lo=t;else hi=t;}return 3*(1-t)*t*t+t*t*t;
}
let detail=null;
// The canvas always matches #experience (its CSS height, not the window), so DOM and 3D share one coordinate space.
function fitCanvas(){const nw=innerWidth,nh=$('#experience').clientHeight||Math.max(innerHeight,640);if(nw===w&&nh===h)return false;w=nw;h=nh;mobile=w<768;renderer.setSize(w,h);const half=1.10;camera.left=-half*w/h;camera.right=half*w/h;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();return true;}
function resize(){fitCanvas();if(ready){layoutOverviewLabels();buildConnections();retarget(true);syncHelpdesk();}}
// Zoomed-in layout: measure the HUD, title and controls, then give the organ the largest free square,
// keeping the organ centered in the space beside or below the KPI panel.
function detailLayout(){
  const box=$('#experience').getBoundingClientRect(),rel=el=>{const r=el.getBoundingClientRect();return {l:r.left-box.left,t:r.top-box.top,r:r.right-box.left,b:r.bottom-box.top};};
  const hud=rel($('#tower-telemetry-hud')),title=rel($('.detail-title')),tools=rel($('.rotate-tools'));
  const beside=hud.l>w/2,gap=20,pad=beside?24:16;
  const L=pad,R=beside?hud.l-24:w-pad,top=beside?72:hud.b+14,bottom=Math.min(title.t,tools.t)-12,W=R-L,H=bottom-top;
  const l={D:Math.max(120,Math.min(W*(w<768?.78:.55),H*.83,w>=2500?975:650)),cx:L+W/2,cy:top+H/2,T:top,B:bottom,L,R,mode:'columns'};
  const span=camera.top-camera.bottom;
  l.target=new T.Vector3(camera.left+l.cx/w*(camera.right-camera.left),camera.position.y+camera.top-l.cy/h*span,.8);
  l.scale=l.D*span/h;
  return l;
}
function separatedPosition(o){return o.overviewPosition.clone();}
function overviewTarget(o){return o.home.clone().lerp(separatedPosition(o),separation);}
function overviewScale(o){return T.MathUtils.lerp(o.size,o.overviewSize,separation);}
function retarget(instant=false){detail=selected?detailLayout():null;for(const o of organs){o.flight=true;o.from=o.root.position.clone();o.to=selected===o?detail.target.clone():overviewTarget(o);o.fromScale=o.root.scale.x;o.toScale=selected===o?detail.scale:overviewScale(o);o.start=performance.now();o.duration=instant||reduced.matches?0:700;o.fromQuat=o.root.quaternion.clone();o.toQuat=new T.Quaternion();} }
function setSeparation(value){if(!ready||selected||helpdesk.isOpen)return;separationTarget=T.MathUtils.clamp(value,0,1);expanded=separationTarget>.5;$('#assembly').value=String(Math.round(separationTarget*1000));}
function setView(value){setSeparation(value?1:0);}
function select(o,trigger){if(!ready||selected||helpdesk.isOpen)return;lastTrigger=trigger||o.label;selected=o;o.rotationTarget=new T.Quaternion();hover=null;document.body.dataset.detail='true';$('#detail').hidden=false;if(fitCanvas())buildConnections();$('#organ-name').textContent=o.organ;$('#tower-name').textContent=o.name;updateTelemetryHUD(o.id);bindTower(o.id);$('#back').focus({preventScroll:true});$('#scene').tabIndex=0;$('#scene').setAttribute('aria-label',`${o.name} ${o.organ}. Drag or use arrow keys to rotate. Scroll down to explore the process map.`);retarget();syncHelpdesk();}
function close(){if(!selected)return;hideMap();selected=null;$('#scene').setAttribute('aria-label','Skeleton, heart and eight finance organs');document.body.dataset.detail='false';$('#detail').hidden=true;if(fitCanvas())buildConnections();retarget();syncHelpdesk();lastTrigger?.focus({preventScroll:true});}
// Exact tapered Catmull-Rom tubes and traveling flow shader from tower-overview2.
function buildConnections(){organs.forEach((o,index)=>{
 if(o.vein){scene.remove(o.vein);o.vein.geometry.dispose();o.vein.material.dispose();}
 const origin=heart.position.clone().add(new T.Vector3(0,.02,.035));
 const geometry=buildVesselNetwork(origin,o.home,separatedPosition(o),1,o.side,index*31+7);
      const uniforms = {
        uSeparation: { value: 0 },
        uTime: { value: 0 },
        uHoverOffset: { value: new T.Vector3() },
      };
      const material = new T.MeshPhysicalMaterial({
        color: '#ad566c',
        transparent: true,
        opacity: 0.46,
        roughness: 0.26,
        metalness: 0,
        depthWrite: false,
        side: T.DoubleSide,
        envMapIntensity: 0.25,
      });
      material.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, uniforms);
        shader.vertexShader =
          'attribute vec3 expandedPosition; attribute vec3 expandedNormal; attribute float branchSeed; uniform float uSeparation; uniform vec3 uHoverOffset; varying float vPath; varying float vBranch;\n' +
          shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
          '#include <beginnormal_vertex>',
          '#include <beginnormal_vertex>\nobjectNormal = normalize(mix(normal,expandedNormal,uSeparation));',
        );
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\ntransformed = mix(position,expandedPosition,uSeparation) + uHoverOffset * smoothstep(0.45,1.0,uv.x); vPath=uv.x; vBranch=branchSeed;',
        );
        shader.fragmentShader =
          'uniform float uTime; varying float vPath; varying float vBranch;\n' +
          shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <color_fragment>',
          '#include <color_fragment>\nfloat flow = 0.5 + 0.5*sin(vPath*10.0-uTime*3.8+vBranch*2.3); diffuseColor.rgb *= 0.7+0.4*flow; diffuseColor.a *= 0.5+0.5*flow;',
        );
      };
      material.customProgramCacheKey = () => 'gfs-branching-vessels-v1';
      const mesh = new T.Mesh(geometry, material);
      mesh.frustumCulled = false;

 mesh.renderOrder=4;scene.add(mesh);o.vein=mesh;o.vesselUniforms=uniforms;
});}
function fail(error){console.error(error);$('#loading').hidden=false;$('#load-message').textContent='The anatomy could not load. Please retry in a WebGL-enabled browser.';$('#retry').hidden=false;}
async function init(){try{
renderer=new T.WebGLRenderer({canvas:$('#scene'),antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0x331c41,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
scene=new T.Scene();camera=new T.OrthographicCamera(-1,1,1,-1,.01,20);camera.position.set(0,.86,5);camera.lookAt(0,.86,0);
scene.add(new T.HemisphereLight(0xfff4ed,0x765580,2.2));const light=new T.DirectionalLight(0xfff5ee,3);light.position.set(-2,3,4);scene.add(light);const rim=new T.DirectionalLight(0xe9d3e8,1.6);rim.position.set(3,2,-2);scene.add(rim);
bones=new T.Group();scene.add(bones);
const [atlasResponse,bodyResponse]=await Promise.all([fetch('./data/anatomy/atlas.json'),fetch('./data/anatomy/body.bin.gz')]);if(!atlasResponse.ok||!bodyResponse.ok)throw Error('Atlas missing');const atlas=await atlasResponse.json();const zip=await bodyResponse.arrayBuffer();const buffer=await new Response(new Blob([zip]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();if(buffer.byteLength!==atlas.bytes)throw Error('Incomplete atlas');
const skeletalParts=atlas.parts.filter(part=>part.group==='skeleton');
anatomyLandmarks={floor:Math.min(...skeletalParts.map(part=>part.bounds[0][1])),shoulder:Math.max(...skeletalParts.filter(part=>/clavicle/i.test(part.name)).map(part=>part.bounds[1][1]))};
const grouped=new Map(),homes=new Map();for(const part of atlas.parts){const bounds=new T.Box3(new T.Vector3(...part.bounds[0]),new T.Vector3(...part.bounds[1]));if(!homes.has(part.group))homes.set(part.group,bounds);else homes.get(part.group).union(bounds);if(!['skeleton','heart'].includes(part.group))continue;const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(buffer,part.positions,part.vertexCount*3),3));g.setAttribute('normal',new T.BufferAttribute(new Int16Array(buffer,part.normals,part.vertexCount*3),3,true));g.setIndex(new T.BufferAttribute(new Uint32Array(buffer,part.indices,part.indexCount),1));const id=part.group==='skeleton'&&part.bounds[0][1]>1.45?'skull':part.group;if(!grouped.has(id))grouped.set(id,[]);grouped.get(id).push(g);}
for(const [id,pieces]of grouped){const geo=mergeGeometries(pieces,false);pieces.forEach(g=>g.dispose());const mat=new T.MeshPhysicalMaterial({color:id==='heart'?0xc72e66:0xe1ddd2,roughness:.45,metalness:.02,clearcoat:.16,depthTest:false,transparent:true,opacity:1});const mesh=new T.Mesh(geo,mat);mesh.renderOrder=id==='heart'?11:-1/* skeleton draws first, behind organs, vessels and heart */;if(id==='heart'){geo.computeBoundingBox();const c=geo.boundingBox.getCenter(new T.Vector3());geo.translate(-c.x,-c.y,-c.z);mesh.position.copy(c);heart=mesh;heart.position.z=.23;scene.add(mesh);}else{bones.add(mesh);if(id==='skull')skull=mesh;}}
for(const [id,name,organ,side,row,size] of configs){const {model,geometry,network}=await loadReplacement(id);geometry.computeBoundingBox();const visibleBounds=geometry.boundingBox.clone();const root=new T.Group();root.add(model);root.updateMatrixWorld(true);const box=visibleBounds;const center=box.getCenter(new T.Vector3());model.position.sub(center);const max=Math.max(...box.getSize(new T.Vector3()).toArray());model.scale.multiplyScalar(1/max);model.position.multiplyScalar(1/max);const home=homes.get(id).getCenter(new T.Vector3());home.z=Math.max(home.z,.13);if(id==='brain')home.z=.015;// Include the full visible silhouette (including the brainstem), while
// retaining the original normalization and scale for the assembled anatomy.
root.updateMatrixWorld(true);
const renderedBounds=new T.Box3(),vertex=new T.Vector3();
model.traverseVisible(mesh=>{if(!mesh.isMesh)return;const positions=mesh.geometry.getAttribute('position');if(!positions)return;for(let i=0;i<positions.count;i++){vertex.fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld);renderedBounds.expandByPoint(vertex);}});
root.position.copy(home);root.scale.setScalar(size);scene.add(root);
const label=document.createElement('button');const m=healthMetrics(TOWER_HEALTH[id]);label.className=`label ${side<0?'left':'right'}${m?' card':''}`;if(m)label.style.setProperty('--accent-c',accentFor(id));label.innerHTML=`<small>${organ}</small><strong>${name}</strong>${m?cardMarkup(m,120+row*70+(side>0?35:0),id):''}<span class="cta">Explore tower<svg class="ico ico-ne" aria-hidden="true"><use href="#i-ne"/></svg></span>`;label.setAttribute('aria-label',`Explore ${name}, ${organ}.${m?' '+metricsSentence(m):''}`);$('#labels').append(label);
const o={id,name,organ,side,row,size,root,home,label,m,normalizedSize:renderedBounds.getSize(new T.Vector3()),normalizedCenter:renderedBounds.getCenter(new T.Vector3()),hb:label.querySelector('.hb'),hbOn:false,from:home.clone(),to:home.clone(),fromScale:size,toScale:size,start:0,duration:0,fromQuat:new T.Quaternion(),toQuat:new T.Quaternion(),hoverAmount:0};root.traverse(m=>{if(m.isMesh)m.userData.organ=o;});label.onclick=()=>select(o,label);label.onpointerenter=()=>{if(fine.matches)hover=o;};label.onpointerleave=()=>{hover=null;};
o.processNeurons=createProcessNeurons(o,network,REAL[id].stages,$('#process-neurons'));network.visible=false;geometry.dispose();organs.push(o);$('#load-message').textContent=`Preparing ${organ.toLowerCase()}…`;}
ready=true;resize();document.fonts.ready.then(resize);$('#loading').hidden=true;addEventListener('resize',resize);new ResizeObserver(()=>{if($('#experience').clientHeight!==h)resize();}).observe($('#experience'));frame(performance.now());
}catch(error){fail(error);}}
// Cards and organs share one measured layout, independent of animation progress.
// Keep the original separated scale; use visible bounds only to align centers.
function layoutOverviewLabels(){
  const columns=[-1,1].map(side=>organs.filter(o=>o.side===side).sort((a,b)=>a.row-b.row));
  const gap=mobile?14:h<700?12:Math.max(16,Math.min(40,h*.018)),pad=mobile?12:Math.max(24,Math.round(w*.025));
  const rowHeights=columns[0].map((_,i)=>Math.max(...columns.map(c=>c[i].label.offsetHeight)));
  const total=rowHeights.reduce((a,b)=>a+b,0)+gap*3;
  const minTop=mobile?90:h<700?72:86,maxBottom=h-(mobile?58:50);
  const firstTop=Math.max(minTop,minTop+(maxBottom-minTop-total)/2);
  const span=camera.top-camera.bottom,unitsPerPixel=span/h;
  const organGap=mobile?8:24;
  for(const o of organs){
    o.overviewSize=(mobile?.17:.23)*(o.id==='intestines'?1.35:1);
    o.overviewPixelWidth=o.normalizedSize.x*o.overviewSize/unitsPerPixel;
  }
  const organWidth=Math.max(...organs.map(o=>o.overviewPixelWidth));
  for(const column of columns){
    let top=firstTop;
    for(const o of column){
      const cardHeight=o.label.offsetHeight,cardWidth=o.label.offsetWidth;
      const centerY=top+rowHeights[o.row]/2;
      const outerX=o.side<0?pad+cardWidth+organGap+organWidth/2:w-pad-cardWidth-organGap-organWidth/2;
      // Pull the suspended organs toward the anatomy while preserving card clearance.
      const centerX=mobile?outerX:T.MathUtils.lerp(outerX,w/2,.28);
      // Keep the card columns aligned, but bring them alongside the suspended organs.
      // Reserve room for the widest silhouette, its drift and the hover enlargement.
      const cardGap=mobile?organGap:T.MathUtils.clamp(h*.012,16,32);
      const cardEdge=centerX+o.side*(organWidth/2+cardGap);
      const left=mobile?(o.side<0?pad:w-pad-cardWidth):T.MathUtils.clamp(o.side<0?cardEdge-cardWidth:cardEdge,pad,w-pad-cardWidth);
      o.label.style.translate=`${left}px ${centerY-cardHeight/2}px`;
      o.overviewPosition=new T.Vector3(camera.left+centerX*unitsPerPixel,camera.position.y+camera.top-centerY*unitsPerPixel,.20).addScaledVector(o.normalizedCenter,-o.overviewSize);
      top+=rowHeights[o.row]+gap;
    }
  }
}
function frame(now){if(document.hidden||!sceneInView||helpdesk.isOpen||document.body.classList.contains('modal-open')){last=now;animation=requestAnimationFrame(frame);return;}const dt=Math.min((now-last)/1000,.05);last=now;time+=dt;separation=reduced.matches?separationTarget:T.MathUtils.lerp(separation,separationTarget,1-Math.exp(-dt*12));if(Math.abs(separation-separationTarget)<.0001)separation=separationTarget;const beat=reduced.matches?1:1.12+Math.pow(Math.max(0,Math.sin(time*6)),8)*.035;heart.scale.setScalar(beat);syncHelpdesk();
const bodyAlpha=selected?0:1;for(const mesh of bones.children){const target=(mesh===skull?T.MathUtils.lerp(.20,1,separation):1)*skeletonOpacity;mesh.material.opacity+=(target*bodyAlpha-mesh.material.opacity)*Math.min(1,dt*10);mesh.visible=mesh.material.opacity>.01;}heart.visible=!selected;
for(const o of organs){const t=o.duration?Math.min(1,(now-o.start)/o.duration):1;const e=ease(t);if(!selected&&(!o.flight||t===1)){o.flight=false;o.root.position.copy(overviewTarget(o));o.root.scale.setScalar(overviewScale(o));}else{o.root.position.lerpVectors(o.from,o.to,e);o.root.scale.setScalar(T.MathUtils.lerp(o.fromScale,o.toScale,e));}if(t<1||selected!==o)o.root.quaternion.slerpQuaternions(o.fromQuat,o.toQuat,e);else if(o.rotationTarget){
 // Advance from the current angle so releasing a drag never restarts the turn.
 if(!reduced.matches&&!drag){
  o.rotationTarget.premultiply(autoTurnStep.setFromAxisAngle(autoTurnAxis,dt*autoTurnSpeed));
 }
 o.root.quaternion.slerp(o.rotationTarget,reduced.matches?1:1-Math.exp(-dt*14));
}
// A slow, phase-shifted suspension keeps the anatomy alive without moving the KPI cards.
const hoverTarget=hover===o&&!selected?1:0;
o.hoverAmount=reduced.matches?hoverTarget:T.MathUtils.lerp(o.hoverAmount,hoverTarget,1-Math.exp(-dt*13));
if(!selected){
 const phase=(o.row+(o.side>0?4:0))*1.37;
 const suspension=reduced.matches?0:T.MathUtils.smoothstep(separation,.45,1)*(o.flight?e:1);
 o.root.position.x+=Math.sin(time*.62+phase)*.008*suspension;
 o.root.position.y+=(Math.sin(time*.78+phase)*.014+Math.sin(time*.37+phase*1.6)*.005)*suspension;
 o.root.position.z+=Math.sin(time*.48+phase)*.006*suspension;
 o.root.rotation.z+=Math.sin(time*.57+phase)*.028*suspension;
 o.root.rotation.y+=Math.sin(time*.43+phase)*.045*suspension;
 o.root.scale.multiplyScalar(1+.075*o.hoverAmount);
}

o.root.visible=!selected||selected===o;o.vein.visible=!selected;
o.vesselUniforms.uSeparation.value=separation;
o.vesselUniforms.uTime.value=time*(reduced.matches?.2:1);
o.vesselUniforms.uHoverOffset.value.copy(o.root.position).sub(overviewTarget(o));
const visible=separation>.55&&!selected;const labelAlpha=T.MathUtils.smoothstep(separation,.55,.9);
o.label.style.visibility=visible?'visible':'hidden';o.label.style.opacity=visible?String(labelAlpha):'0';o.label.tabIndex=visible?0:-1;if(o.hb){if(!o.hbOn&&visible&&labelAlpha>=.6){o.hbOn=true;o.hb.classList.add('on');countUp(o.hb,reduced.matches);}else if(o.hbOn&&separation<.5){o.hbOn=false;o.hb.classList.remove('on');resetCounts(o.hb);}}
}
for(const o of organs)updateProcessNeurons(o,selected===o&&(o.duration===0||now-o.start>o.duration*.85),camera,w,h,time,reduced.matches,detail);
renderer.render(scene,camera);animation=requestAnimationFrame(frame);}
function hit(event){const rect=$('#scene').getBoundingClientRect();pointer.set((event.clientX-rect.left)/w*2-1,-(event.clientY-rect.top)/h*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(organs.map(o=>o.root),true).find(x=>x.object.visible&&x.object.userData.organ)?.object.userData.organ;}
$('#assembly').addEventListener('input',e=>setSeparation(Number(e.target.value)/1000));$('#back').onclick=close;$('#retry').onclick=()=>location.reload();$('#reset').onclick=()=>{if(selected){selected.fromQuat=selected.root.quaternion.clone();selected.toQuat.identity();selected.rotationTarget.identity();selected.from.copy(selected.root.position);selected.fromScale=selected.root.scale.x;selected.start=performance.now();selected.duration=reduced.matches?0:250;}};
// Wheel/trackpad progress is continuous and reversible; no document scroll listener.
$('#experience').addEventListener('wheel',e=>{if(e.ctrlKey||!ready||selected||helpdesk.isOpen)return;e.preventDefault();const unit=e.deltaMode===1?16:e.deltaMode===2?h:1;const delta=T.MathUtils.clamp(e.deltaY*unit,-120,120);setSeparation(separationTarget+delta/1800);},{passive:false});
const canvas=$('#scene');canvas.addEventListener('pointerdown',e=>{if(!ready||e.button!==0)return;if(selected)selected.rotationTarget.copy(selected.root.quaternion);drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!ready)return;if(drag&&selected){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;selected.root.quaternion.premultiply(new T.Quaternion().setFromEuler(new T.Euler(dy*.009,dx*.009,0)));selected.rotationTarget.copy(selected.root.quaternion);selected.duration=0;drag.x=e.clientX;drag.y=e.clientY;}else if(drag&&!selected&&e.pointerType==='touch'){setSeparation(separationTarget+(drag.y-e.clientY)/650);drag.x=e.clientX;drag.y=e.clientY;}else if(!selected&&fine.matches){hover=hit(e);canvas.style.cursor=hover?'pointer':'default';}});canvas.addEventListener('pointerup',e=>{if(drag&&!selected&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<6){const o=hit(e);if(o)select(o);}drag=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);});canvas.addEventListener('pointercancel',()=>drag=null);canvas.addEventListener('lostpointercapture',()=>drag=null);canvas.addEventListener('pointerleave',()=>hover=null);
addEventListener('keydown',e=>{if(e.defaultPrevented||!$('#tower-workbench').hidden)return;if(e.key==='Escape'&&e.target.closest?.('#process-workspace'))return;if(e.key==='Escape')close();if(selected&&e.target===canvas&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();selected.duration=0;selected.root.quaternion.premultiply(new T.Quaternion().setFromEuler(new T.Euler(e.key==='ArrowUp'?-.15:e.key==='ArrowDown'?.15:0,e.key==='ArrowLeft'?-.15:e.key==='ArrowRight'?.15:0,0)));selected.rotationTarget.copy(selected.root.quaternion);}});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(animation);fail(new Error('WebGL context lost'));});
// Keyboard users can explore each organ in either view, without visual label overlap.
for(const config of configs){const b=document.createElement('button');b.textContent=`Explore ${config[1]}`;b.className='keyboard-organ';b.onclick=()=>{const o=organs.find(o=>o.id===config[0]);if(o)select(o,b);};$('#experience').append(b);}
init();

addEventListener('pagehide',()=>{cancelAnimationFrame(animation);helpdesk.destroy();sceneObserver.disconnect();renderer?.dispose();scene?.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(m=>m.dispose());}});});


function updateTelemetryHUD(id) {
  document.querySelector('.hud-ecg-container').innerHTML=pulseMarkup(id,'hud-ecg-svg');
  const d = TOWER_HEALTH[id];
  const total = d.auto + d.semi + d.manual;
  const score = Math.round(((d.auto + 0.5 * d.semi) / total) * 100);

  const title = document.getElementById('hud-tower-title');
  const scoreVal = document.getElementById('hud-score-pct');
  const barAuto = document.getElementById('hud-bar-auto');
  const barSemi = document.getElementById('hud-bar-semi');
  const barManual = document.getElementById('hud-bar-manual');
  const countAuto = document.getElementById('hud-count-auto');
  const countSemi = document.getElementById('hud-count-semi');
  const countManual = document.getElementById('hud-count-manual');
  const countTpi = document.getElementById('hud-count-tpi');
  const countPain = document.getElementById('hud-count-pain');

  if (title) title.textContent = d.name;
  const descriptions = {brain:'Financial planning & analysis · Commercial',pancreas:'Financial planning & analysis · Operations',liver:'Capital expenditure',kidneys:'Financial controlling',spleen:'Tax',lungs:'Record to report',stomach:'Procure to pay',intestines:'Order to cash'};
  document.getElementById('hud-tower-subtitle').textContent = descriptions[id] || 'Finance tower';
  document.getElementById('hud-total').textContent = total;
  document.getElementById('hud-count-ai').textContent = '—';
  document.querySelector('.hud-score').title = 'Automation index = (automated + 0.5 × semi-automated) / all As-Is activities × 100';
  if (scoreVal) scoreVal.textContent = score;
  if (countAuto) countAuto.textContent = d.auto;
  if (countSemi) countSemi.textContent = d.semi;
  if (countManual) countManual.textContent = d.manual;
  if (countTpi) countTpi.textContent = d.tpis;
  if (countPain) {countPain.textContent = d.pain;countPain.parentElement.title = 'Unique pain points documented in the As-Is source. Zero means none supplied in this map, not proof that no pain points exist.';}

  if (barAuto && barSemi && barManual) {
    barAuto.style.width = ((d.auto / total) * 100) + '%';
    barSemi.style.width = ((d.semi / total) * 100) + '%';
    barManual.style.width = ((d.manual / total) * 100) + '%';
  }
}



initExperience();
document.fonts?.ready.then(()=>{if(selected)retarget(true);});
