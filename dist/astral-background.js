import * as THREE from 'three';

const TRAIL_SEGMENTS=52;

// Bake the cloud detail once. The animation only samples this small texture.
function galaxyTexture(){
 const canvas=document.createElement('canvas');canvas.width=896;canvas.height=512;
 const ctx=canvas.getContext('2d'),image=ctx.createImageData(canvas.width,canvas.height);
 const grid=new Float32Array(128*128);for(let i=0;i<grid.length;i++)grid[i]=Math.random();
 const noise=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy),at=(a,b)=>grid[(b&127)*128+(a&127)];return THREE.MathUtils.lerp(THREE.MathUtils.lerp(at(ix,iy),at(ix+1,iy),sx),THREE.MathUtils.lerp(at(ix,iy+1),at(ix+1,iy+1),sx),sy);};
 for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
  const u=x/canvas.width,v=y/canvas.height,n=noise(u*5,v*5)*.52+noise(u*13,v*13)*.28+noise(u*33,v*33)*.14+noise(u*81,v*81)*.06;
  const spine=.73-u*.46+Math.sin(u*7)*.045,band=Math.exp(-Math.pow((v-spine+(n-.5)*.12)/.18,2)),wisps=Math.pow(n,1.6),density=band*(.12+wisps*.9);
  const k=(y*canvas.width+x)*4,rose=noise(u*3+29,v*3+17);
  image.data[k]=98+rose*64;image.data[k+1]=65+rose*21;image.data[k+2]=174+rose*26;image.data[k+3]=Math.round(density*190);
 }
 ctx.putImageData(image,0,0);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}

/* One viewport-sized scene, shared by both map modes. No page-sized GPU surface. */
export function mountAstralBackground(root){
 const layer=document.createElement('div');layer.className='astral-background';layer.setAttribute('aria-hidden','true');root.prepend(layer);
 const state={available:false,paused:false,running:false,stars:0,shootingStars:0,frames:0};
 let renderer,scene,camera,starGeometry,starMaterial,cloudGeometry,cloudMaterial,cloudTexture,headGeometry,observer,raf=0,last=0,time=0,nextMeteor=.65,disposed=false;
 const abort=new AbortController(),trails=[];
 const listen=(target,type,fn)=>target.addEventListener(type,fn,{passive:true,signal:abort.signal});
 const stop=()=>{cancelAnimationFrame(raf);raf=0;last=0;state.running=false;};
 function visible(){const r=root.getBoundingClientRect();const top=Math.max(0,r.top),bottom=Math.min(innerHeight,r.bottom);layer.style.clipPath=`inset(${top}px 0 ${Math.max(0,innerHeight-bottom)}px 0)`;return !root.hidden&&!document.hidden&&bottom>top;}
 function draw(){renderer.render(scene,camera);state.frames++;}
 function schedule(){if(disposed||!state.available)return;const show=visible();layer.style.visibility=show?'visible':'hidden';if(!show||state.paused){stop();if(show)draw();return;}if(!raf){state.running=true;raf=requestAnimationFrame(frame);}}
 function startMeteor(){
  const trail=trails.find(t=>!t.active);if(!trail)return;
  const reverse=Math.random()<.35;
  trail.active=true;trail.start=time;trail.duration=2.7+Math.random()*1.1;
  trail.x=reverse?1.08:-.08;trail.y=.46+Math.random()*.49;
  trail.dx=(reverse?-1:1)*(1.05+Math.random()*.38);trail.dy=-.24-Math.random()*.3;
  trail.curve=(Math.random()-.5)*.12;trail.tail=.25+Math.random()*.12;
  trail.width=innerWidth<760?8+Math.random()*4:12+Math.random()*9;
  trail.mesh.visible=true;
 }
 function updateTrails(){
  const heads=headGeometry.attributes.position;
  for(let index=0;index<trails.length;index++){
   const t=trails[index];if(!t.active)continue;
   const progress=(time-t.start)/t.duration;
   if(progress>1.15){t.active=false;t.mesh.visible=false;heads.setXYZ(index,3,3,0);continue;}
   const a=t.geometry.attributes.position,fade=Math.min(1,progress*7,Math.max(0,(1.15-progress)*5));t.material.uniforms.fade.value=fade;
   const point=v=>[t.x+t.dx*v,t.y+t.dy*v+Math.sin(v*Math.PI)*t.curve];
   const [hx,hy]=point(progress);heads.setXYZ(index,hx*2-1,hy*2-1,0);
   let k=0;
   for(let i=0;i<TRAIL_SEGMENTS;i++){
    const p=Math.max(0,progress-(1-i/TRAIL_SEGMENTS)*t.tail),q=Math.max(0,progress-(1-(i+1)/TRAIL_SEGMENTS)*t.tail);
    const [x,y]=point(p),[nx,ny]=point(q),dx=(nx-x)*innerWidth,dy=(ny-y)*innerHeight,length=Math.hypot(dx,dy)||1;
    const width=t.width*(.2+.8*i/TRAIL_SEGMENTS),wx=-dy/length*width/innerWidth,wy=dx/length*width/innerHeight;
    const vertices=[[x-wx,y-wy],[nx-wx,ny-wy],[nx+wx,ny+wy],[x-wx,y-wy],[nx+wx,ny+wy],[x+wx,y+wy]];
    for(const [vx,vy] of vertices)a.setXYZ(k++,vx*2-1,vy*2-1,0);
   }
   a.needsUpdate=true;
  }
  heads.needsUpdate=true;state.shootingStars=trails.filter(t=>t.active).length;
 }
 function frame(now){
  raf=0;if(disposed||state.paused||!visible()){stop();return;}raf=requestAnimationFrame(frame);if(last&&now-last<1000/30)return;
  const dt=last?Math.min((now-last)/1000,.1):0;last=now;time+=dt;starMaterial.uniforms.time.value=time;cloudMaterial.uniforms.time.value=time;
  if(time>=nextMeteor){startMeteor();nextMeteor=time+(innerWidth<760?2:1.1)+Math.random()*1.25;}
  updateTrails();draw();
 }
 function resize(){if(!renderer)return;renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));renderer.setSize(innerWidth,innerHeight);starMaterial.uniforms.pixelRatio.value=renderer.getPixelRatio();starMaterial.uniforms.sizeScale.value=innerWidth<760?.8:innerWidth>=2500?1.35:1;state.stars=Math.min(2700,Math.max(480,Math.round(innerWidth*innerHeight/3100)));starGeometry.setDrawRange(0,state.stars);schedule();}
 function disposeScene(){starGeometry?.dispose();starMaterial?.dispose();cloudGeometry?.dispose();cloudMaterial?.dispose();cloudTexture?.dispose();headGeometry?.dispose();for(const t of trails){t.geometry.dispose();t.material.dispose();}renderer?.dispose();}
 try{
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'});renderer.setClearColor(0x000000,0);renderer.domElement.setAttribute('aria-hidden','true');layer.append(renderer.domElement);scene=new THREE.Scene();camera=new THREE.Camera();
  cloudTexture=galaxyTexture();cloudGeometry=new THREE.PlaneGeometry(2,2);
  cloudMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,uniforms:{clouds:{value:cloudTexture},time:{value:0}},vertexShader:`varying vec2 tex;void main(){tex=uv;gl_Position=vec4(position.xy,0.0,1.0);}`,fragmentShader:`uniform sampler2D clouds;uniform float time;varying vec2 tex;void main(){vec2 drift=vec2(sin(time*.025),cos(time*.019))*.012;vec4 cloud=texture2D(clouds,clamp(tex*.97+.015+drift,0.,1.));gl_FragColor=vec4(cloud.rgb,cloud.a*.8);}`});
  const clouds=new THREE.Mesh(cloudGeometry,cloudMaterial);clouds.frustumCulled=false;clouds.renderOrder=-2;scene.add(clouds);
  const count=2700;
  const positions=new Float32Array(count*3),details=new Float32Array(count*4);
  for(let i=0;i<count;i++){
   const x=Math.random(),band=.27+x*.46-Math.sin(x*7)*.045,y=Math.random()<.55?THREE.MathUtils.clamp(band+(Math.random()+Math.random()+Math.random()-1.5)*.22,0,1):Math.random(),kind=Math.random();
   positions[i*3]=x*2-1;positions[i*3+1]=y*2-1;
   details[i*4]=kind>.955?32+Math.random()*30:kind>.77?12+Math.random()*12:3.5+Math.random()*6;
   details[i*4+1]=Math.random()*Math.PI*2;details[i*4+2]=.65+Math.random()*.5;details[i*4+3]=Math.random();
  }
  starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));starGeometry.setAttribute('details',new THREE.BufferAttribute(details,4));
  starMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,uniforms:{time:{value:0},pixelRatio:{value:1},sizeScale:{value:1}},vertexShader:`attribute vec4 details;uniform float time;uniform float pixelRatio;uniform float sizeScale;varying float light;varying float tint;varying float hero;void main(){gl_Position=vec4(position,1.0);float wave=.5+.5*sin(time*(.65+details.w*.6)+details.y);light=(.3+.9*pow(wave,2.0))*details.z;hero=step(30.,details.x);gl_PointSize=details.x*pixelRatio*sizeScale*(.88+wave*.18);tint=details.w;}`,fragmentShader:`varying float light;varying float tint;varying float hero;void main(){vec2 p=(gl_PointCoord-.5)*2.;float d=length(p);float core=exp(-d*d*65.);float halo=exp(-d*d*5.)*.22;float rays=(exp(-abs(p.x)*65.-abs(p.y)*4.)+exp(-abs(p.y)*65.-abs(p.x)*4.))*.3*hero;float glow=(core+halo+rays)*(1.-smoothstep(.75,1.,d));vec3 color=mix(vec3(.65,.64,1.),vec3(1.,.73,.9),tint);color=mix(color,vec3(1.,.96,1.),core);gl_FragColor=vec4(color,glow*light);}`});
  const stars=new THREE.Points(starGeometry,starMaterial);stars.frustumCulled=false;stars.renderOrder=-1;scene.add(stars);
  const headPositions=new Float32Array(5*3).fill(3),headDetails=new Float32Array(5*4);
  for(let i=0;i<5;i++){
   headDetails.set([48,Math.PI/2,1.25,.65],i*4);
   const geometry=new THREE.BufferGeometry(),uv=new Float32Array(TRAIL_SEGMENTS*6*2);
   for(let j=0;j<TRAIL_SEGMENTS;j++)uv.set([j/TRAIL_SEGMENTS,0,(j+1)/TRAIL_SEGMENTS,0,(j+1)/TRAIL_SEGMENTS,1,j/TRAIL_SEGMENTS,0,(j+1)/TRAIL_SEGMENTS,1,j/TRAIL_SEGMENTS,1],j*12);
   geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(TRAIL_SEGMENTS*6*3),3));geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
   const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{fade:{value:0}},vertexShader:`varying vec2 tex;void main(){tex=uv;gl_Position=vec4(position,1.0);}`,fragmentShader:`uniform float fade;varying vec2 tex;void main(){float side=(tex.y-.5)*2.;float core=exp(-side*side*150.);float halo=exp(-side*side*5.)*.28;float tail=pow(tex.x,1.6);vec3 color=mix(vec3(.66,.48,1.),vec3(1.,.88,.97),core);gl_FragColor=vec4(color,(core+halo)*tail*fade);}`});
   const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;mesh.visible=false;scene.add(mesh);trails.push({geometry,material,mesh,active:false});
  }
  headGeometry=new THREE.BufferGeometry();headGeometry.setAttribute('position',new THREE.BufferAttribute(headPositions,3));headGeometry.setAttribute('details',new THREE.BufferAttribute(headDetails,4));const heads=new THREE.Points(headGeometry,starMaterial);heads.frustumCulled=false;heads.renderOrder=1;scene.add(heads);
  state.available=true;listen(renderer.domElement,'webglcontextlost',()=>{state.available=false;stop();layer.style.visibility='hidden';});
  listen(window,'resize',resize);listen(window,'scroll',schedule);listen(document,'visibilitychange',schedule);observer=new IntersectionObserver(schedule);observer.observe(root);resize();
 }catch{layer.remove();disposeScene();}
 return{setPaused(paused){state.paused=paused;schedule();},getState:()=>({...state}),destroy(){disposed=true;stop();abort.abort();observer?.disconnect();disposeScene();renderer?.forceContextLoss();layer.remove();}};
}
