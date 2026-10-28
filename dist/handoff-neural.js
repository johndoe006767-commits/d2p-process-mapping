// Neural geometry and light-travel shader adapted from gfs-merged/dependency.html.
// Reuses the local Three.js module; the source demo and its data are unchanged.
import * as THREE from 'three';
import {titleCase} from './title-case.js';
export function createHandoffNeural(host, data) {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const activities=data.flows.map(f=>f.title.replace(/^\d+\.\s*(?=Stage)/i,''));
  const mapping=data.flows.map(f=>({in:f.up.map(id=>'in-'+id),out:f.down.map(id=>'out-'+id)}));
  const dependencies=[...data.upstream.map(d=>({...d,id:'in-'+d.id,side:'in'})),...data.downstream.map(d=>({...d,id:'out-'+d.id,side:'out'}))];
  host.innerHTML=`<div class="neural-header"><div class="neural-headings"><span class="neural-heading-cell"><span class="neural-heading-group"><span class="neural-heading-copy"><strong>${escape(titleCase(data.headings?.[0]||'Hands In'))}</strong><small>Upstream Dependencies</small></span></span></span><span class="neural-heading-cell"><span class="neural-heading-group"><span class="neural-heading-copy"><strong>${escape(titleCase(data.headings?.[1]||'Flows'))}</strong><small>As-Is Process Flows</small></span></span></span><span class="neural-heading-cell"><span class="neural-heading-group"><span class="neural-heading-copy"><strong>${escape(titleCase(data.headings?.[2]||'Receives'))}</strong><small>Downstream Dependencies</small></span></span></span></div></div><div class="neural-scroll" tabindex="0" role="region" aria-label="Handoff map. Use the zoom controls to inspect all three columns."><div class="neural-plane"><div class="neural-diagram" role="group" aria-label="Handoff dependency map"><svg class="neural-fallback" aria-hidden="true"></svg><div class="neural-dependencies neural-inputs"></div><div class="neural-flows"></div><div class="neural-dependencies neural-outputs"></div></div></div></div><p class="neural-announcement" role="status" aria-live="polite"></p>`;
  const root=host.querySelector('.neural-diagram'),svg=root.querySelector('svg');
  const plane=host.querySelector('.neural-plane');
  let zoom=1,fitMode=true,logicalWidth=0,logicalHeight=0;
  const status=host.querySelector('.neural-announcement');
  const scroll=host.querySelector('.neural-scroll'),headings=host.querySelector('.neural-headings');
  const syncHeader=()=>{const inset=Math.max(0,(scroll.clientWidth-logicalWidth*zoom)/2);headings.style.transform=`translateX(${inset-scroll.scrollLeft}px) scale(${zoom})`;};
  function applyZoom(value,preserveCenter=true){
    const centerX=(scroll.scrollLeft+scroll.clientWidth/2-Math.max(0,(scroll.clientWidth-logicalWidth*zoom)/2))/zoom;
    const centerY=(scroll.scrollTop+scroll.clientHeight/2)/zoom;
    const minZoom=Math.min(.25,scroll.clientWidth/logicalWidth,(scroll.clientHeight+host.querySelector('.neural-header').clientHeight)/(logicalHeight+headings.offsetHeight));
    zoom=Math.max(minZoom,Math.min(2.5,value));root.style.transform=`scale(${zoom})`;
    plane.style.width=logicalWidth*zoom+'px';plane.style.height=logicalHeight*zoom+'px';
    headings.style.width=logicalWidth+'px';host.querySelector('.neural-header').style.height=headings.offsetHeight*zoom+'px';
    if(preserveCenter)scroll.scrollTo({left:centerX*zoom-scroll.clientWidth/2,top:centerY*zoom-scroll.clientHeight/2,behavior:'instant'});
    syncHeader();data.onZoom?.(zoom);
  }
  function layout(){
    if(!active||!scroll.clientWidth||!scroll.clientHeight)return;
    const scale=parseFloat(getComputedStyle(host.closest('#tower-workbench')||host).getPropertyValue('--tw-scale'))||1;
    if(fitMode||!logicalWidth){
      const availableHeight=scroll.clientHeight+host.querySelector('.neural-header').clientHeight;
      logicalWidth=Math.max(880*scale,scroll.clientWidth);
      root.style.width=headings.style.width=logicalWidth+'px';
      root.style.height='auto';root.style.minHeight='0';
      const contentHeight=Math.max(activities.length*56*scale,data.upstream.length*28*scale,data.downstream.length*28*scale,root.scrollHeight);
      const fitZoom=Math.min(1,scroll.clientWidth/logicalWidth,availableHeight/(contentHeight+headings.offsetHeight));
      // Fit the rows vertically, then reflow the columns across the whole viewport.
      // Text and neurons retain uniform scale without leaving unused side margins.
      logicalWidth=Math.max(880*scale,scroll.clientWidth/fitZoom);
      root.style.width=headings.style.width=logicalWidth+'px';
      logicalHeight=Math.max(contentHeight,availableHeight/fitZoom-headings.offsetHeight);
      root.style.height=logicalHeight+'px';
      applyZoom(fitZoom,false);
    }else applyZoom(zoom);
    if(fitMode)scroll.scrollTo({left:0,top:0,behavior:'instant'});
    draw();refresh3();
  }
  scroll.addEventListener('scroll',syncHeader,{passive:true});
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let selected=null,keyboardSelection=false,active=false,frame=0,resizeFrame=0;
  let hoveredActivity=null;const hoverLevels=Array(activities.length).fill(0);
  let animationPaused=motion.matches,elapsed=0,lastFrame=0,signalStart=0;
  activities.forEach((name,i)=>{const b=document.createElement('button');b.className='activity';b.id='hf-a'+i;b.type='button';b.setAttribute('aria-pressed','false');b.innerHTML=`<span>${escape(name)}<small>${mapping[i].in.length} in · ${mapping[i].out.length} out</small></span>`;b.onclick=e=>select(selected===i?null:i,e.detail===0);root.querySelector('.neural-flows').append(b);});
  dependencies.forEach(d=>{const n=document.createElement('div');n.id='hf-'+d.id;n.className='dependency '+d.side;n.innerHTML=`<span class="tower">${escape(d.label)}</span>`;root.querySelector(d.side==='in'?'.neural-inputs':'.neural-outputs').append(n);});
  function select(i,byKeyboard=false){selected=i;keyboardSelection=byKeyboard;signalStart=elapsed;root.classList.toggle('selected',i!==null);root.querySelectorAll('.activity').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));dependencies.forEach(d=>root.querySelector('#hf-'+d.id).classList.toggle('connected',i!==null&&mapping[i][d.side].includes(d.id)));status.textContent=i===null?`All ${activities.length} flows · Select a flow to see its sending and receiving teams.`:activities[i]+'. Hands in: '+mapping[i].in.map(id=>dependencies.find(d=>d.id===id).label).join(', ')+'. Receives: '+mapping[i].out.map(id=>dependencies.find(d=>d.id===id).label).join(', ')+'.';draw();refresh3();data.onSelect?.(i);}
  function draw(){if(!active)return;svg.replaceChildren();svg.setAttribute('viewBox',`0 0 ${root.clientWidth} ${root.clientHeight}`);mapping.forEach((m,i)=>{const a=relative('a'+i);for(const side of ['in','out'])m[side].forEach(id=>{const b=relative(id),incoming=side==='in',x1=incoming?b.x+b.w:a.x+a.w,x2=incoming?a.x:b.x,y1=incoming?b.y+b.h/2:a.y+a.h/2,y2=incoming?a.y+a.h/2:b.y+b.h/2,dx=(x2-x1)*.5;const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',`M${x1} ${y1}C${x1+dx} ${y1},${x2-dx} ${y2},${x2} ${y2}`);path.dataset.flow=data.flows[i].id;path.dataset.direction=side;path.dataset.party=dependencies.find(d=>d.id===id).label;path.setAttribute('fill','none');path.setAttribute('stroke',incoming?'#a8eddb':'#efb1d4');path.setAttribute('opacity',selected===i?'.9':selected===null?'.25':'.05');svg.append(path);});});}
let engine,scene3,camera3,group3,channels=[],neurons=[],haloTexture=null;
try{engine=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});engine.setPixelRatio(Math.min(devicePixelRatio,1.5));engine.setClearColor(0x331c41,0);engine.domElement.className='three-layer';engine.domElement.setAttribute('aria-hidden','true');root.prepend(engine.domElement);scene3=new THREE.Scene();camera3=new THREE.OrthographicCamera(-1,1,1,-1,.1,1000);camera3.position.z=400;scene3.add(new THREE.AmbientLight(0xffffff,2));const l=new THREE.DirectionalLight(0xffddf3,2);l.position.set(100,200,200);scene3.add(l);root.classList.add('neural-ready');const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.12,'rgba(255,255,255,.8)');g.addColorStop(.4,'rgba(255,255,255,.15)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);haloTexture=new THREE.CanvasTexture(c);}catch(e){engine=null;}
const P=(x,y,z=0)=>new THREE.Vector3(x-root.clientWidth/2,root.clientHeight/2-y,z);
function relative(id){const b=root.querySelector('#hf-'+id).getBoundingClientRect(),r=root.getBoundingClientRect();return{x:(b.x-r.x)/zoom,y:(b.y-r.y)/zoom,w:b.width/zoom,h:b.height/zoom};}
function line(points,color,opacity=.4){const m=new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false});const n=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),m);group3.add(n);return n;}
function lightPath(curve,color,opacity,role,i){const base=line(curve.getPoints(56),color,opacity);const uniforms={head:{value:-1},power:{value:0},tint:{value:new THREE.Color(color)},strength:{value:1}};const glows=[];for(const [radius,strength]of[[7,.06],[3,.16],[.8,.9]]){const u={...uniforms,strength:{value:strength}};const mat=new THREE.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv; uniform float head; uniform float power; uniform float strength; uniform vec3 tint; void main(){float d=(vUv.x-head)/.085;float wave=exp(-d*d);gl_FragColor=vec4(tint, wave*power*strength);}' });const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,64,radius,6,false),mat);group3.add(mesh);glows.push(mesh);}const ch={curve,base,uniforms,role,i,branches:[],opacity};channels.push(ch);return ch;}
function nerve(start,end,seed){const pts=[start];for(let j=1;j<8;j++){const f=j/8;pts.push(start.clone().lerp(end,f).add(new THREE.Vector3(Math.sin(j*2.4+seed)*5,Math.sin(j*1.8+seed)*7,Math.sin(j)*3)));}pts.push(end);return new THREE.CatmullRomCurve3(pts);}
function refresh3(){if(!engine||!active)return;const w=root.clientWidth,h=root.clientHeight;engine.setSize(w,h,false);camera3.left=-w/2;camera3.right=w/2;camera3.top=h/2;camera3.bottom=-h/2;camera3.updateProjectionMatrix();if(group3){group3.traverse(n=>{n.geometry?.dispose();n.material?.dispose()});scene3.remove(group3)}group3=new THREE.Group();scene3.add(group3);channels=[];neurons=[];
mapping.forEach((m,i)=>{const a=relative('a'+i),active=selected===i;for(const side of ['in','out'])m[side].forEach((key,k)=>{const b=relative(key),incoming=side==='in',color=incoming?0xa8eddb:0xefb1d4;const nodeX=a.x+14;const x1=incoming?b.x+b.w:a.x+a.w-14,x2=incoming?nodeX:b.x,y1=incoming?b.y+b.h/2:a.y+a.h/2,y2=incoming?a.y+a.h/2:b.y+b.h/2;const curve=nerve(P(x1,y1),P(x2,y2),i+k*3),opacity=active?.62:selected===null?.25:.06,ch=lightPath(curve,color,opacity,side,i);for(let j=1;j<8;j++){const q=curve.getPoint(j/9),e=q.clone().add(new THREE.Vector3(j%2?10:-8,j%2?-17:16,2)),mid=q.clone().lerp(e,.55).add(new THREE.Vector3(3,-2,1));const branch=line([q,mid,e],color,opacity*.6);ch.branches.push({line:branch,t:j/9,base:opacity*.6});line([mid,mid.clone().lerp(e,.6).add(new THREE.Vector3(4,3,0))],color,opacity*.25);}})});
activities.forEach((_,i)=>{const a=relative('a'+i);for(const side of ['left','right']){const n=P(side==='left'?a.x+14:a.x+a.w-14,a.y+a.h/2,10),active=selected===i,scale=root.clientWidth<650?.63:1;
const geo=new THREE.IcosahedronGeometry(5.8*scale,2);const verts=geo.attributes.position;for(let v=0;v<verts.count;v++){const x=verts.getX(v),y=verts.getY(v),z=verts.getZ(v),stretch=1+.15*Math.sin(x*1.7+y*.8+i);verts.setXYZ(v,x*stretch,y*(1+.13*Math.sin(x+y)),z);}geo.computeVertexNormals();
const core=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0xe3d4ff,emissive:0xcfb5f4,emissiveIntensity:.4,transparent:true,opacity:.85,roughness:.5}));core.position.copy(n);group3.add(core);const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:haloTexture,color:side==='left'?0xc8dff2:0xedc4eb,transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false}));halo.position.copy(n);halo.scale.set(50*scale,50*scale,1);group3.add(halo);const dendrites=[];
for(let k=0;k<13;k++){const angle=k/13*Math.PI*2+.12*Math.sin(k*4+i),r=(14+(k*7%17))*scale;const end=n.clone().add(new THREE.Vector3(Math.cos(angle)*r,Math.sin(angle)*r,Math.sin(k)*2)),mid=n.clone().lerp(end,.52).add(new THREE.Vector3(Math.sin(k*2)*4*scale,Math.cos(k*3)*3*scale,1));const curve=new THREE.CatmullRomCurve3([n,mid,end]);dendrites.push(line(curve.getPoints(14),0xd4bcef,.35));for(let j=0;j<2;j++){const fork=curve.getPoint(.5+j*.22),tip=end.clone().add(new THREE.Vector3(Math.cos(angle+(j?-.7:.6))*8*scale,Math.sin(angle+(j?-.7:.6))*8*scale,0));dendrites.push(line(new THREE.CatmullRomCurve3([fork,fork.clone().lerp(tip,.55).add(new THREE.Vector3(2,-2,0)),tip]).getPoints(10),0xd4bcef,.23));}}
neurons.push({core,halo,dendrites,i,side,scale});}});
if(selected!==null){const a=relative('a'+selected),start=P(a.x+14,a.y+a.h/2,7),end=P(a.x+a.w-14,a.y+a.h/2,7),points=[start];for(let j=1;j<12;j++){const f=j/12;points.push(P(a.x+14+(a.w-28)*f,a.y+a.h/2+Math.sin(Math.PI*f)*(a.h*.24)+Math.sin(j*2.1+selected)*4,Math.sin(j)*3+5));}points.push(end);const bridge=new THREE.CatmullRomCurve3(points),ch=lightPath(bridge,0xd9b9ee,.5,'bridge',selected);for(let j=1;j<11;j++){const at=j/12,q=bridge.getPoint(at),sgn=j%2?1:-1,tip=q.clone().add(new THREE.Vector3(8+4*Math.sin(j),sgn*(6+j%3*3),1)),mid=q.clone().lerp(tip,.55).add(new THREE.Vector3(-3,2,0));const branch=line(new THREE.CatmullRomCurve3([q,mid,tip]).getPoints(12),0xd9b9ee,.3);ch.branches.push({line:branch,t:at,base:.3});line([mid,tip.clone().add(new THREE.Vector3(5,-sgn*4,0))],0xd9b9ee,.2);}}

renderFrame();}
function renderFrame(){if(!engine)return;const t=(elapsed-signalStart)%7.8,reduce=motion.matches||keyboardSelection;channels.forEach(c=>{const active=selected===c.i;let head,power;if(active){if(c.role==='in')head=(t-.15)/1.9;else if(c.role==='bridge')head=(t-2.5)/1.5;else head=(t-4.35)/2.25;power=head>=-.2&&head<=1.2?1.5:0;}else if(selected===null){head=((elapsed*.22+c.i*.083+(c.role==='out'?.43:0))%1.4)-.2;power=.42;}else{head=-1;power=0;}if(reduce){power=0;head=-1;}c.uniforms.head.value=head;c.uniforms.power.value=power;c.branches.forEach(b=>b.line.material.opacity=b.base+Math.exp(-Math.pow((b.t-head)/.13,2))*power*.55);});
neurons.forEach(neuron=>{const active=selected===neuron.i,arrival=neuron.side==='left'?2.18:4.13;let flare;if(reduce)flare=active?.35:0;else if(active)flare=Math.exp(-Math.pow((t-arrival)/.4,2));else if(selected===null){const phase=((elapsed*.22+neuron.i*.083+(neuron.side==='right'?.43:0))%1.4)-.2;flare=.2*Math.exp(-Math.pow((phase-(neuron.side==='left'?1:0))/.13,2));}else flare=0;const hoverGlow=hoverLevels[neuron.i]*(reduce||animationPaused?.22:.24+.09*Math.sin(elapsed*3.5));flare=Math.max(flare,hoverGlow);neuron.core.material.emissiveIntensity=.4+flare*4;neuron.core.scale.setScalar(1+flare*.3);neuron.halo.material.opacity=.1+flare*.8;neuron.halo.scale.setScalar((52+flare*45)*neuron.scale);neuron.dendrites.forEach((d,k)=>d.material.opacity=(selected===null||active?.3:.2)+flare*(k%2?.6:.85));});engine.render(scene3,camera3);}

  function clearHover(){hoveredActivity=null;root.querySelectorAll('.activity').forEach(b=>b.classList.remove('is-hovered'));}
  root.querySelectorAll('.activity').forEach((b,i)=>{b.addEventListener('pointerenter',e=>{if(e.pointerType!=='mouse'||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;clearHover();hoveredActivity=i;b.classList.add('is-hovered');});b.addEventListener('pointerleave',clearHover);b.addEventListener('keydown',clearHover);});
  function tick(t){frame=0;if(!active||document.hidden)return;const dt=Math.min((t-lastFrame)/1000,.05);lastFrame=t;hoverLevels.forEach((v,i)=>{const target=hoveredActivity===i?1:0;hoverLevels[i]=motion.matches||keyboardSelection?target:v+(target-v)*(1-Math.exp(-dt*15));});if(!animationPaused)elapsed+=dt;renderFrame();frame=requestAnimationFrame(tick);}
  function redraw(){if(!active)return;cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{layout();});}
  const observer=new ResizeObserver(redraw);observer.observe(scroll);
  function visibility(){cancelAnimationFrame(frame);frame=0;if(active&&!document.hidden){lastFrame=performance.now();frame=requestAnimationFrame(tick);}}
  function reduceChanged(){animationPaused=motion.matches;renderFrame();}
  document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',reduceChanged);
  return {
    selectFlow(index,byKeyboard=false){select(index,byKeyboard);},
    setPaused(value){animationPaused=value||motion.matches;},
    setActive(value){active=value;clearHover();visibility();if(value)layout();},
    setZoom(value){fitMode=false;applyZoom(value);},
    getZoom(){return zoom;},
    fitToView(){fitMode=true;layout();},
    clearSelection(){if(selected===null)return false;select(null,true);return true;},
    destroy(){active=false;cancelAnimationFrame(frame);cancelAnimationFrame(resizeFrame);observer.disconnect();scroll.removeEventListener('scroll',syncHeader);document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',reduceChanged);group3?.traverse(n=>{n.geometry?.dispose();n.material?.dispose();});haloTexture?.dispose();engine?.dispose();host.replaceChildren();}
  };
}
