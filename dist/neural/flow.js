/* The source high-level topology, rendered in the same visual language as the activity map. */
window.makeCommercialFlow=function(svg,source,onSelect){
 'use strict';
 const ns='http://www.w3.org/2000/svg',W=260,H=108,width=2100,height=980;
 const cfg=window.FPAC_FLOW,processes=[...cfg.planning,...cfg.monthly],positions={},records={};
 const e=(tag,a={},t)=>{const n=document.createElementNS(ns,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,v));if(t!==undefined)n.textContent=t;return n;};
 const text=(x,y,t,cls='flow-meta')=>e('text',{x,y,class:cls},t);
 const layers={edges:e('g'),labels:e('g'),nodes:e('g')};
 const defs=e('defs');['flow-arrow','feedback-arrow'].forEach(id=>{const marker=e('marker',{id,viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:6,markerHeight:6,orient:'auto'});marker.append(e('path',{d:'M0,0 L10,5 L0,10 Z',fill:id==='flow-arrow'?'#c6adce':'#d5b7ee'}));defs.append(marker);});
 svg.append(defs,layers.edges,layers.labels,layers.nodes);svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
 processes.forEach((p,i)=>{const f=source.frames[p.st-1],P=f.procs.find(x=>x.id===p.id),s=P.steps;
  records[p.id]={...p,f,P,index:i+1,count:s.length,man:s.filter(x=>x.ty==='man').length,hyb:s.filter(x=>x.ty==='hyb').length,auto:s.filter(x=>x.ty==='auto').length,pain:[...new Set(s.flatMap(x=>x.pp||[]))]};
  positions[p.id]=i<7?{x:48+p.c*310,y:[80,260,492][p.r]}:{x:48+(i-7)*360,y:748};
 });
 function label(x,y,value,kind='input',maxWidth){
  const lines=[];let line='';const limit=maxWidth?Math.floor((maxWidth-24)/6):999;
  value.split(/\s+/).forEach(word=>{if((line+' '+word).trim().length>limit&&line){lines.push(line);line=word;}else line=(line+' '+word).trim();});if(line)lines.push(line);
  const w=maxWidth||Math.max(100,value.length*6+24),h=lines.length*15+13,g=e('g',{class:`flow-handoff ${kind}`});
  g.append(e('title',{},value),e('rect',{x,y,width:w,height:h,rx:5}));lines.forEach((l,i)=>g.append(text(x+12,y+18+i*15,l,'flow-handoff-text')));layers.labels.append(g);return h;
 }
 function edge(d,kind='main',name){const p=e('path',{d,class:`overview-edge ${kind}`,'marker-end':`url(#${kind==='feedback'?'feedback-arrow':'flow-arrow'})`});if(name)p.append(e('title',{},name));layers.edges.append(p);if(kind==='main'){const signal=e('path',{d,class:'flow-signal'});signal.style.animationDelay=`-${layers.edges.children.length*.17}s`;layers.edges.append(signal);}}
 function annotation(x,y,content,cls='flow-annotation'){const t=text(x,y,content,cls);t.setAttribute('paint-order','stroke');t.setAttribute('stroke','var(--base)');t.setAttribute('stroke-width','7');t.setAttribute('stroke-linejoin','round');layers.labels.append(t);}
 const R=positions['FPAC-01.01'],M=positions['FPAC-02.01'],C=positions['FPAC-02.03'],N=positions['FPAC-02.02'],P=positions['FPAC-03.01'],D=positions['FPAC-05.01'],split=R.x+W+25,merge=M.x+W+25;
 // Draw shared junctions once so the three streams read as one connected branch.
 edge(`M${R.x+W},${R.y+H/2} H${split}`);
 layers.edges.append(e('path',{d:`M${split},${M.y+H/2} V${N.y+H/2}`,class:'overview-edge main'}));
 [M,C,N].forEach(q=>{edge(`M${split},${q.y+H/2} H${q.x}`);layers.edges.append(e('path',{d:`M${q.x+W},${q.y+H/2} H${merge}`,class:'overview-edge main'}));});
 layers.edges.append(e('path',{d:`M${merge},${M.y+H/2} V${N.y+H/2}`,class:'overview-edge main'}));edge(`M${merge},${P.y+H/2} H${P.x}`);
 [['FPAC-03.01','FPAC-04.01'],['FPAC-04.01','FPAC-05.01']].forEach(([a,b])=>edge(`M${positions[a].x+W},${positions[a].y+H/2} H${positions[b].x}`));
 annotation(48,32,'Planning Cycle','flow-cycle-title');annotation(48,54,'RBU2 · MTP · Phased Budget','flow-cycle-period');
 annotation(48,192,'Three parallel streams');annotation(698,505,'MPC + CAPEX + NMPC');annotation(698,525,'consolidate into P&L');
 annotation(48,710,'Monthly Cycle','flow-cycle-title');annotation(231,710,'WD−4 to WD+7','flow-cycle-period');
 layers.labels.append(e('line',{x1:48,y1:727,x2:2048,y2:727,class:'flow-cycle-rule'}));
 cfg.monthly.forEach((p,i)=>{if(i<4){const a=positions[p.id],b=positions[cfg.monthly[i+1].id];edge(`M${a.x+W},${a.y+H/2} H${b.x}`);}});
 // The approved plan bridges both cycles; monthly actuals return to the next templates.
 edge(`M${D.x+W/2},${D.y+H} V610 H178 V748`,'main','Approved plan in CMR becomes the monthly comparator');
 annotation(660,600,'Approved plan loaded in CMR becomes the monthly comparator (pre-close, reporting, MMF, FCF)');
 edge('M538,748 V641 H18 V330 H48','feedback','Revenue files feed the next revenue planning template');
 annotation(554,635,'Revenue files feed the next revenue planning template','flow-feedback-label');
 edge('M898,748 V668 H28 V566 H358','feedback','Cost files feed the next cost planning template');
 annotation(914,662,'Cost files feed the next cost planning template','flow-feedback-label');
 const ox=D.x+W+50;edge(`M${D.x+W},${D.y+H/2} H${ox-12}`);
 cfg.downstream.forEach((s,i)=>label(ox,D.y-2+i*34,s,'output',480));
 processes.forEach(p=>{
  const r=records[p.id],q=positions[p.id],g=e('g',{class:'flow-node',role:'button',tabindex:0,'data-process':p.id,'data-stage':p.st,'aria-haspopup':'dialog','aria-label':`${p.t}, stage ${p.st}, ${r.count} activities. Inspect process.`});
  g.append(e('title',{},`${p.t}: ${r.count} activities, ${r.pain.length} documented pain points`),e('rect',{class:'flow-node-body',x:q.x,y:q.y,width:W,height:H,rx:8}),text(q.x+16,q.y+24,String(r.index).padStart(2,'0'),'flow-index'));
  const stage=text(q.x+W-16,q.y+24,`Stage ${p.st}`,'flow-stage');stage.setAttribute('text-anchor','end');g.append(stage,text(q.x+16,q.y+52,p.t,'flow-title'),text(q.x+16,q.y+73,`${r.count} activities · ${r.pain.length} pain point${r.pain.length===1?'':'s'}`));
  let bx=q.x+16;['man','hyb','auto'].forEach(ty=>{const w=86*r[ty]/r.count;if(w)g.append(e('rect',{x:bx,y:q.y+89,width:w,height:4,fill:`var(--${ty})`}));bx+=w;});
  const counts=text(q.x+W-16,q.y+96,`${r.man} M · ${r.hyb} S · ${r.auto} A`,'flow-mix');counts.setAttribute('text-anchor','end');g.append(counts);
  const go=()=>onSelect(r,g);g.onclick=go;g.onkeydown=event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();go();}};layers.nodes.append(g);
  if(p.inp){const inputs=Array.isArray(p.inp)?p.inp:[p.inp];inputs.forEach((v,i)=>label(q.x,p.st>=6?q.y+H+9:q.y-(inputs.length-i)*48-3,v,'input',W));}
  if(p.out){const outputs=Array.isArray(p.out)?p.out:[p.out];outputs.forEach((v,i)=>label(q.x,q.y+H+(p.st>=6?61:9)+i*34,v,'output',W));}
 });
 return {width,height,records,positions,setScale(scale){svg.style.width=width*scale+'px';svg.style.height=height*scale+'px';},setFilter(filter){let count=0;svg.querySelectorAll('.flow-node').forEach(g=>{const r=records[g.dataset.process],match=filter==='all'||filter==='pp'&&r.pain.length||r[filter]>0;g.classList.toggle('unfocused',!match);if(match)count++;});return count;},markStage(stage){svg.querySelectorAll('.flow-node').forEach(g=>g.classList.toggle('stage-current',Number(g.dataset.stage)===stage+1));}};
};
