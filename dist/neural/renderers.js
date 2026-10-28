window.TowerRenderers={};
window.TowerRenderers["FPAC"]=function makeTowerMap(KEY,DATA,E){
const TPIS=new Set();Object.values(DATA).forEach(dd=>dd&&dd.frames&&dd.frames.forEach(f=>(f.tpi||[]).forEach(t=>(t.steps||[]).forEach(r=>TPIS.add(f.id+"|"+r)))));
const W=158,H=74,G=46,DW=34,PAD=24,FH=E.frameHeaderHeight||46,ROWL=E.processHeaderGap||22,PIN=E.processInputGap||24,POUT=24,RGAP=44,STRIP=E.handoffStripHeight||30,INW=118,CH=14;
const TYC={man:"#d0021b",auto:"#2f6fce",hyb:"#e8891c"},TYNM={man:"Manual",hyb:"Semi-automated",auto:"Automated"};
const esc2=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function wrap(t,n,max){const w=String(t).split(" ");const L=[];let c="";w.forEach(x=>{if((c+" "+x).trim().length>n){if(c)L.push(c);c=x}else c=(c+" "+x).trim()});if(c)L.push(c);max=max||2;if(L.length>max){L[max-1]=L.slice(max-1).join(" ");if(L[max-1].length>n+2)L[max-1]=L[max-1].slice(0,n)+"…";L.length=max}return L}
function text(x,y,lines,o={}){return `<text x="${x}" y="${y}" font-size="${o.fs||11.5}" font-weight="${o.fw||500}" fill="${o.fill||"var(--ink)"}" text-anchor="${o.a||"middle"}" font-family="Inter,Segoe UI,Arial,sans-serif">${lines.map((l,i)=>`<tspan x="${x}" dy="${i?1.2:0}em">${esc2(l)}</tspan>`).join("")}</text>`}
let page="asis",filter="all",nodes={},svgW=0,svgH=0,scale=1,sel=null;
const pc=p=>{const k=String(p).split(/[ -]/)[0];return ({O2C:"var(--O2C)",R2R:"var(--R2R)",TAX:"var(--Tax)",Tax:"var(--Tax)",P2P:"var(--P2P)",CAPEX:"var(--CAPEX)",Controlling:"var(--Controlling)",Local:"var(--LocalFinance)",IT:"#667085",Capital:"#1d4ed8",Licensed:"#4b2a86",Report:"#4b2a86",FPAC:"var(--FPA)",FPAO:"var(--FPA)",DMT:"#0e7490",Customer:"#8a6d3b",Distributors:"#8a6d3b",Distribution:"#0f766e",Bank:"#475467",Payroll:"#b7791f",Local:"#b7791f",FP:"var(--FPA)",HR:"#9d174d",International:"#152847",Area:"#152847",Group:"#152847",Region:"#152847",Royalty:"#667085",MC:"#b7791f",BUD:"#b7791f",BUDs:"#b7791f",Brand:"#b7791f",Cost:"#b7791f",Business:"#b7791f",CFO:"#7b3597",CP:"#7b3597",CBP:"#c77a0a",Embedded:"#c77a0a",SAP:"#667085",CMR:"#667085",PMR:"#667085",AZ:"#667085",AZForce:"#667085",Enpire:"#667085",OneGRC:"#475467",Approver:"#7b3597",Market:"#b7791f",Posting:"var(--R2R)",FBPs:"#c77a0a",Planning:"#667085","P&MR":"#667085"})[k]||(String(p).startsWith("FP&A")?"var(--FPA)":"#667085")};
function pill(x,y,label,c,dash,title,anchorLeft){const w=label.length*6.2+16;return {w,h:`<g class="source-pill"><title>${esc2(title||label)}</title><rect x="${x}" y="${y}" width="${w}" height="17" rx="8.5" fill="var(--card)" stroke="${c}" stroke-width="1.3" ${dash?'stroke-dasharray="3 2"':""}/>${text(x+w/2,y+12,[label],{fs:10,fw:600,fill:c})}</g>`}}
function feedBlock(P,f,top){const F=P.feed,T=nodes[`${f.id}|${P.id}|${F.to}`],S1=nodes[`${f.id}|${P.id}|1`],S2=nodes[`${f.id}|${P.id}|2`];if(!T||!S1||!S2)return "";
  const nw=W,nh=34,ya=top+16,yb=top+56,ym=top+36;
  const box=(x,y,a,sub,dash)=>{const c=pc(a);return `<g><title>${esc2(a)}: ${esc2(sub)}</title><rect x="${x}" y="${y}" width="${nw}" height="${nh}" rx="8" fill="var(--card)" stroke="${c}" stroke-width="1.7" ${dash?'stroke-dasharray="4 3"':""}/>${text(x+10,y+14,[a],{fs:9.8,fw:700,fill:c,a:"start"})}${text(x+10,y+27,[sub],{fs:9.3,fill:"var(--navy)",a:"start"})}</g>`};
  const el=(x1,y1,x2,y2)=>{const mx=(x1+x2)/2;return `<path d="M${x1},${y1} L${mx},${y1} L${mx},${y2} L${x2},${y2}" class="fl" marker-end="url(#o1)"/>`};
  let o=`<rect x="${S1.x-10}" y="${top-6}" width="${T.x+nw-S1.x+20}" height="${nh*2+36}" rx="10" fill="#fff" fill-opacity=".6" stroke="#9aa3b2" stroke-dasharray="4 3"/>`+text(S1.x-2,top+6,[F.lab],{fs:9.6,fw:700,fill:"var(--muted)",a:"start"});
  o+=box(S1.x,ya,F.src[0][0],F.src[0][1])+box(S1.x,yb,F.src[1][0],F.src[1][1])+box(S2.x,ym,F.fet[0],F.fet[1])+box(T.x,ym,F.sys[0],F.sys[1],1);
  o+=el(S1.x+nw,ya+nh/2,S2.x,ym+nh/2-5)+el(S1.x+nw,yb+nh/2,S2.x,ym+nh/2+5)+`<path d="M${S2.x+nw},${ym+nh/2} L${T.x},${ym+nh/2}" class="fl" marker-end="url(#o1)"/>`;
  const ax=T.x+nw/2;o+=`<path d="M${ax},${ym+nh} L${ax},${T.y}" class="fl" stroke-width="2" marker-end="url(#o1)"/>`+text(ax+6,(ym+nh+T.y)/2+3,[F.elab[3]],{fs:9,fw:600,fill:"var(--navy)",a:"start"});
  return o}
function layout(d){
  nodes={};let h="",y=PAD+10,maxX=0;const x0=PAD+(d.chan||60);
  // phase chevrons (processes grouped by key process)
  {const raw=d.frames.flatMap(f=>f.procs.map(p=>({p,f})));const procs=[];raw.forEach(it=>{const k=it.p.phase||it.p.name;const L=procs[procs.length-1];if(L&&L.k===k&&L.f===it.f){L.ids.push(it.p.id)}else procs.push({k,f:it.f,p:it.p,ids:[it.p.id]})});const cw=procs.length<=3?230:150,ch=40;let cx=x0;
   h+=text(x0,y+12,["Process phases"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});y+=18;
   procs.forEach(({p,f},i)=>{const fi=d.frames.indexOf(f);const col=d.accent;const op=.55+.15*(fi%3);
     h+=`<g><title>${esc2(f.name)} / ${esc2(p.phase||p.name)} (${esc2(procs[i].ids.join(", "))})</title><path d="M${cx},${y} L${cx+cw-14},${y} L${cx+cw},${y+ch/2} L${cx+cw-14},${y+ch} L${cx},${y+ch} L${cx+14},${y+ch/2}z" fill="${col}" fill-opacity="${op}"/>${text(cx+cw/2+4,y+ch/2+4,wrap(`${i+1}. ${p.phase||p.name}`,cw>200?32:20,1),{fs:10.5,fw:700,fill:"#fff"})}</g>`;cx+=cw+4});
   maxX=Math.max(maxX,cx);y+=ch+22;}
  d.frames.forEach((f,fi)=>{
    const top=y;const c=d.accent;
    y+=FH;
    // upstream strip
    let px=x0+8;const upY=y+4;if(f.up.length){h+=text(x0,upY+12,["Upstream"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});px+=66;}
    f.up.forEach(u=>{const p=pill(px,upY,(u.c?"AI: ":"")+u.p,u.c?"var(--prop)":pc(u.p),!!u.c,`${u.c?"AI SUGGESTED - ":""}${u.p}: ${u.w} (${u.src})`);h+=p.h;px+=p.w+6});
    maxX=Math.max(maxX,px);y+=STRIP;
    f.procs.forEach((P,pi)=>{
      y+=ROWL;const FEEDH=P.feed?(E.feedHeight||110):0;const feedTop=y+(E.feedTopGap||10);const rowY=y+PIN+FEEDH;let x=x0;const items=[];
      nodes[`${f.id}|${P.id}|in`]={id:`${f.id}|${P.id}|in`,x,y:rowY,w:INW,h:H,kind:"in",lab:P.inbox[0],txt:P.inbox[1],f,P};x+=INW+G-12;
      P._headingY=y;h+=`<g class="source-process-heading">`;const multi=f.procs.length>1,lx=multi?x0+76:x0;if(multi)h+=`<g><rect x="${x0}" y="${y-17}" width="68" height="18" rx="9" fill="${d.accent}"/>`+text(x0+34,y-4.5,[`Process ${fi+1}.${pi+1}`],{fs:9.5,fw:700,fill:"#fff"})+`</g>`;h+=text(lx,y-4,[`${P.name}`],{fs:12,fw:700,fill:"var(--navy)",a:"start"});h+=text(lx+P.name.length*7.2+10,y-4,[`${P.id} · ${P.owner}`],{fs:10.5,fill:"var(--muted)",a:"start"});h+=`</g>`;
      const seq=[`${f.id}|${P.id}|in`];let fext=0;P._rb=rowY+H;P._gates=false;
      P.steps.forEach((s,j)=>{
        if(s.gate){P._gates=true;x+=60;const gid=`${f.id}|${P.id}|${s.n}`;nodes[gid]={id:gid,x,y:rowY+H/2-DW/2,w:DW,h:DW,kind:"dec",gate:true,dec:s,f,P,j,ln:P.steps.slice(j+1).filter(q=>q.gate&&q.nx&&!q.nx.end).length};seq.push(gid);
          if(s.fix){const fs=s.fix,fid=`${f.id}|${P.id}|${fs.n}`;nodes[fid]={id:fid,x:x+DW/2-W/2,y:rowY+H+56,w:W,h:H,s:fs,f,P,j,fixOf:gid};fext=56+H+4;P._rb=rowY+H+fext-4}
          x+=DW+G+76;return}
        if(s.fork){P._gates=true;const BG=56,nb=s.branches.length;x+=30;const dx=x,sx=dx+DW+G+40,bx=sx+W+30;
          s.branches.forEach((b,bi)=>{const by=rowY+bi*(H+BG);const nq=s.branches[bi+1];const did=`${f.id}|${P.id}|${b.step.n}|d`;
            nodes[did]={id:did,x:dx,y:by+H/2-DW/2,w:DW,h:DW,kind:"dec",fork:true,f,P,dec:{q:b.q,ex:b.ex,o:b.o,d:b.d,src:b.src,yes:`Step ${b.step.n} - ${b.step.t}`,no:nq?`Check: ${nq.q}`:(s.elseLab||"No")+" - release"}};
            const sid=`${f.id}|${P.id}|${b.step.n}`;nodes[sid]={id:sid,x:sx,y:by,w:W,h:H,s:b.step,f,P,j,br:true}});
          const fid=`${f.id}|${P.id}|fork${j}`;nodes[fid]={id:fid,kind:"fork",fk:s,f,P,x:dx,w:bx-dx,dx,sx,bx,rowY};seq.push(fid);
          fext=Math.max(fext,(nb-1)*(H+BG)+34);P._rb=Math.max(P._rb,rowY+H+(nb-1)*(H+BG)+30);x=bx+40;return}
        const id=`${f.id}|${P.id}|${s.n}`;nodes[id]={id,x,y:rowY,w:W,h:H,s,f,P,j};items.push(id);seq.push(id);x+=W+G;
        if(s.dec){x+=30;nodes[id+"|d"]={id:id+"|d",x:x,y:rowY+H/2-DW/2,w:DW,h:DW,dec:s.dec,kind:"dec",step:s,f,P,ln:P.steps.slice(j+1).filter(q=>q.dec&&q.dec.nx&&!q.dec.nx.end).length};x+=DW+G+40}});
      P._seq=seq;if(P.feed)h+=feedBlock(P,f,feedTop);
      if(P.outdoc){x+=14;nodes[`${f.id}|${P.id}|out`]={id:`${f.id}|${P.id}|out`,x,y:rowY+8,w:150,h:H-16,kind:"out",doc:P.outdoc,f,P,from:P._gates?seq[seq.length-1]:items[items.length-1]};seq.push(`${f.id}|${P.id}|out`);x+=150+G}
      if(d.key==="tobe"&&P.opp){x+=6;nodes[`${f.id}|${P.id}|opp`]={id:`${f.id}|${P.id}|opp`,x,y:rowY-6,w:190,h:H+12,kind:"opp",opp:P.opp,f,P,from:items[items.length-1]};x+=210}
      maxX=Math.max(maxX,x);
      y=rowY+H+POUT+RGAP+fext+(P.steps.some(s=>s.dec&&s.dec.nx)?30:0);
    });
    if(d.key==="tobe"&&f.opp){nodes[`${f.id}|opp`]={id:`${f.id}|opp`,x:x0,y:y-18,w:460,h:44,kind:"fopp",opp:f.opp,f};y+=56}
    // challenge / TPI strips
    if((f.ch&&f.ch.length)||(f.tpi&&f.tpi.length)){y+=4;
      const strip=(items,kind,lab,fill,stroke,col,bw)=>{h+=text(x0,y+12,[lab],{fs:10.5,fw:700,fill:col,a:"start"});y+=20;let bx=x0;
        items.forEach((c,i)=>{if(i&&i%4===0){bx=x0;y+=58}const id=`${f.id}|${kind}${i}`;const head=kind==="ch"?"[CHALLENGE]":`[SOLUTION] ${c.st||"TPI"}`;const tl=wrap(c.t,Math.floor(bw/5.6),2);nodes[id]={id,kind,c,f,x:bx,y,w:bw,h:50};
          h+=`<g class="opn ${sel===id?"sel":""}" tabindex="0" role="button" data-id="${id}"><title>${esc2(head)}: ${esc2(c.t)}${c.ref?" - "+esc2(c.ref):""}</title><rect class="b" x="${bx}" y="${y}" width="${bw}" height="50" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>${text(bx+10,y+14,[head],{fs:9.5,fw:700,fill:col,a:"start"})}${c.ref?text(bx+bw-8,y+14,[c.ref],{fs:8.8,fill:col,a:"end"}):""}${text(bx+10,y+29,tl,{fs:9.8,fill:"var(--navy)",a:"start"})}</g>`;bx+=bw+12});
        maxX=Math.max(maxX,bx);y+=50+14};
      if(f.ch&&f.ch.length)strip(f.ch,"ch","Pain points (register)","#fdecec","var(--pain)","#a00015",330);
      if(f.tpi&&f.tpi.length)strip(f.tpi,"tpi","TPI / CI initiatives (register)","#e6f4ec","var(--ok)","#13643a",430);
    }
    // downstream strip
    px=x0+8;const dnY=y-10;if(f.down.length){h+=text(x0,dnY+12,["Downstream"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});px+=78;}
    f.down.forEach(u=>{const p=pill(px,dnY,(u.c?"AI: ":"")+u.p,u.c?"var(--prop)":pc(u.p),!!u.c,`${u.c?"AI SUGGESTED - ":""}${u.p}: ${u.w} (${u.src})`);h+=p.h;px+=p.w+6});
    maxX=Math.max(maxX,px);y+=STRIP+6;
    f._box={top,bot:y,c};y+=26;
  });
  const FR=Math.max(maxX+40,1180);d._fr=FR;svgW=FR;svgH=y+PAD;
  return h;
}
function noBranch(n){const q=n.dec,nx=q.nx,cx=n.x+DW/2,by=n.y+DW,rowY=n.y-(H/2-DW/2),rb=n.P&&n.P._rb?n.P._rb:rowY+H;let o="";if(nx.none)return nx.nl?text(cx+5,by+13,[nx.nl],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"}):"";
  if(nx.end){const hold=nx.kind==="hold",w=Math.max(96,nx.end.length*6.4+22),ty=(n.gate&&rb>rowY+H)?rowY+H+56+H/2-13:rb+34;o+=`<path d="M${cx},${by} L${cx},${ty}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+13,[q.swap?"Yes":"No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})+`<g><title>${esc2(q.q)} No: ${esc2(q.no)}</title><rect x="${cx-w/2}" y="${ty}" width="${w}" height="26" rx="13" fill="${hold?"#fff4e0":"#fdecec"}" stroke="${hold?"#e8891c":"#d0021b"}" stroke-width="1.5"/>${text(cx,ty+17,[nx.end],{fs:9.8,fw:700,fill:hold?"#8a4b00":"#a00015"})}</g>`;return o}
  const T=nx.out?nodes[`${n.f.id}|${n.P.id}|out`]:nodes[`${n.f.id}|${n.P.id}|${nx.step}`];if(!T)return text(cx,n.y+DW+11,wrap("No: "+q.no,26,1),{fs:8.5,fill:"#7b3597"});
  const yb=rb+40+(n.ln||0)*12+(n.P&&page==='tobe'?30:0),ex=nx.out?T.x+T.w/2:T.x+T.w-16,ty=T.y+T.h+((T.s&&T.s.feas)?((T.s.out||[]).length?44:20):0);
  o+=`<path d="M${cx},${by} L${cx},${yb} L${ex},${yb} L${ex},${ty}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+13,[q.swap?"Yes":"No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
  const nl=q.nl||nx.nl;if(nl){const lw=nl.length*5.4+8;o+=`<rect x="${cx+10}" y="${yb-7}" width="${lw}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(cx+14,yb+3,[nl],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}
  return o}
function fixBranch(n){const q=n.dec,F=nodes[`${n.f.id}|${n.P.id}|${q.fix.n}`];if(!F)return "";const cx=n.x+DW/2,by=n.y+DW,rowY=n.y-(H/2-DW/2),ym=rowY+H+18,ex=F.x+W+16,rx=F.x-16,cy=rowY+H/2;let o="";
  o+=`<path d="M${cx},${by} L${cx},${ym} L${ex},${ym} L${ex},${F.y+H/2} L${F.x+W},${F.y+H/2}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+12,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
  const S1=nodes[`${n.f.id}|${n.P.id}|1`];
  if(n.P.id==="SOC-01.1"){const S2=nodes[`${n.f.id}|${n.P.id}|1`];if(S2){const k=["1a","1b","1c"].indexOf(q.fix.n),yy=F.y+H+22+k*9,tx=S2.x+30+k*14,fx=F.x+W/2;o+=`<path d="M${fx},${F.y+H} L${fx},${yy} L${tx},${yy} L${tx},${S2.y+H}" class="fl" marker-end="url(#o1)"/>`}}else if(S1&&false){const k=["1a","1b","1c"].indexOf(q.fix.n),by=F.y+H+18+k*10,sx=S1.x+30+k*12,fx=F.x+W/2;o+=`<path d="M${fx},${F.y+H} L${fx},${by} L${sx},${by} L${sx},${S1.y+H}" class="fl" stroke-dasharray="5 3" marker-end="url(#o1)"/>`;
  if(k===0)o+=`<rect x="${sx+8}" y="${by-7}" width="${"Retry from step 1".length*5+6}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(sx+11,by+3,["Retry from step 1"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}
  else if(!q.noRetry){o+=`<path d="M${F.x},${F.y+H/2} L${rx},${F.y+H/2} L${rx},${cy} L${n.x},${cy}" class="fl" stroke-dasharray="5 3" marker-end="url(#o1)"/>`;
  const ly=(F.y+H/2+cy)/2;o+=`<rect x="${rx-34}" y="${ly-7}" width="31" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(rx-4,ly+3,["Retry"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"end"});
  }
  if(n.P.id==="SOC-05.1"){const O=nodes[`${n.f.id}|${n.P.id}|out`],S3=nodes[`${n.f.id}|${n.P.id}|3`],fx=F.x+W/2;if(O){const tx=O.x+O.w/2,jy=F.y+H+30;o+=`<path d="M${fx+12},${F.y+H} L${fx+12},${jy} L${tx},${jy} L${tx},${O.y+O.h}" class="fl" marker-end="url(#o1)"/>`}if(S3){const tx=S3.x+W-10,jy=F.y+H+16;o+=`<path d="M${fx-12},${F.y+H} L${fx-12},${jy} L${tx},${jy} L${tx},${S3.y+H}" class="fl" marker-end="url(#o1)"/>`}}else if(q.fix.join){const sq=n.P._seq||[],J=q.fix.join==="out"?nodes[`${n.f.id}|${n.P.id}|out`]:nodes[sq[sq.indexOf(n.id)+2]];if(J){const jx=F.x+W/2,jy=F.y+H+34,tx=J.x+J.w/2;if(J.kind==="dec"){const cyy=J.y+J.h/2,mx=J.x-14;o+=`<path d="M${jx},${F.y+H} L${jx},${jy} L${mx},${jy} L${mx},${cyy} L${J.x},${cyy}" class="fl" marker-end="url(#o1)"/>`}else o+=`<path d="M${jx},${F.y+H} L${jx},${jy} L${tx},${jy} L${tx},${J.y+J.h}" class="fl" marker-end="url(#o1)"/>`}}
  return o}
function draw(){
  const d=DATA[page];const strips=layout(d);let h=`<defs><marker id="o1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--navy)"/></marker><marker id="o2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#7b3597"/></marker><marker id="o3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#0070c0"/></marker><marker id="o4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="${d.accent}"/></marker><marker id="o5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0L10,5L0,10z" fill="${d.accent}"/></marker></defs>
  <style>.fl{fill:none;stroke:var(--navy);stroke-width:1.6}.rw{fill:none;stroke:#7b3597;stroke-width:1.4;stroke-dasharray:5 4}svg[data-f="man"] .nd:not(.ty-man),svg[data-f="hyb"] .nd:not(.ty-hyb),svg[data-f="auto"] .nd:not(.ty-auto),svg[data-f="pp"] .nd:not(.has-pp),svg[data-f="tpi"] .nd:not(.has-tpi){opacity:.14}svg[data-f="tpi"] .nd.has-tpi rect.b{stroke:#13643a;stroke-width:4;filter:drop-shadow(0 0 5px rgba(19,100,58,.55))}.opn{cursor:pointer}.opn:hover rect.b,.opn.sel rect.b{stroke-width:2.4}</style>`;
  // frames
  d.frames.forEach((f,fi)=>{const b=f._box;const wdt=d._fr-PAD*2;
    h+=`<rect x="${PAD}" y="${b.top}" width="${wdt}" height="${b.bot-b.top}" rx="14" fill="${b.c}" fill-opacity=".05" stroke="${b.c}" stroke-opacity=".35"/><rect x="${PAD}" y="${b.top}" width="${wdt}" height="${FH-6}" rx="14" fill="${b.c}"/><rect x="${PAD}" y="${b.top+20}" width="${wdt}" height="${FH-26}" fill="${b.c}"/>`;
    {const ts=d.tshift||0;h+=text(PAD+16+ts,b.top+26,[`${fi+1}. ${f.name}`],{fs:15,fw:700,fill:"#fff",a:"start"})+text(PAD+16+ts+f.name.length*9.2+30,b.top+26,[`${f.owner} · ${f.win}`],{fs:11,fill:"#fff",a:"start"});}
    if(f.pp&&f.pp.length)h+=`<g><title>Pain points: ${esc2(f.pp.join(" | "))}</title><circle cx="${PAD+wdt-22}" cy="${b.top+20}" r="9" fill="#fff"/><text x="${PAD+wdt-22}" y="${b.top+24.5}" font-size="12" font-weight="700" fill="var(--pain)" text-anchor="middle">!</text></g>`;
    if(f.ctl&&f.ctl.length)h+=`<g><title>Controls: ${esc2(f.ctl.join(" | "))}</title><circle cx="${PAD+wdt-48}" cy="${b.top+20}" r="9" fill="#fff"/><text x="${PAD+wdt-48}" y="${b.top+24.5}" font-size="11" font-weight="700" fill="${b.c}" text-anchor="middle">C</text></g>`;
  });
  h+=strips;let BT="";(d.frames||[]).forEach(f=>f.procs.forEach(P=>{if(P.back){const A=nodes[`${f.id}|${P.id}|${P.back.from}`],B=nodes[`${f.id}|${P.id}|${P.back.to}`];if(A&&B){const yy=A.y+A.h+16,ax=A.x+A.w/2,bx=B.x+B.w/2+(P.back.dx||0);h+=`<path d="M${ax},${A.y+A.h} L${ax},${yy} L${bx},${yy} L${bx},${B.y+B.h}" class="fl"/>`;BT+=`<path d="M${bx},${B.y+B.h+19} L${bx},${B.y+B.h}" class="fl" marker-end="url(#o1)"/>`}}}));
  // chain between processes and key processes (internal O2C flow)
  (d.chain||[]).forEach((e,i)=>{const A=nodes[e.a],B=nodes[e.b];if(!A||!B)return;const lane=PAD+CH+(i%(d.lanes||4))*(d.lanes?8:11);const col=d.accent;
    const ax=A.x+A.w/2,ay=A.y+A.h,yg=e.below&&A.f&&A.f._box?A.f._box.bot+7+(i%3)*6:A.y+A.h+(e.dy!=null?e.dy:(A.kind==="out"?30:34));
    const by=B.kind==="in"?B.y+B.h/2:B.y;let p;
    if(B.kind==="in"){p=`M${ax},${ay} L${ax},${yg} L${lane},${yg} L${lane},${by} L${B.x},${by}`}
    else{p=`M${ax},${ay} L${ax},${yg} L${lane},${yg} L${lane},${B.y-16} L${B.x+B.w/2-24},${B.y-16} L${B.x+B.w/2-24},${B.y}`}
    h+=`<path d="${p}" fill="none" stroke="${col}" stroke-width="${e.loop?1.5:2.2}" ${e.loop?'stroke-dasharray="6 4"':""} stroke-opacity=".9" marker-end="url(#${e.loop?"o4":"o5"})"/>`;
    if(e.lab){const lw=e.lab.length*5.6+10,lx=e.below?ax-lw-8:ax+8;const ly=yg+(e.ldy||0);h+=`<rect x="${lx}" y="${ly-13}" width="${lw}" height="15" rx="4" fill="var(--card)" fill-opacity=".9"/>`+text(lx+5,ly-2,[e.lab],{fs:9.2,fw:600,fill:col,a:"start"})}
  });
  // same-output link between two processes' outputs
  d.frames.forEach(f=>{const so=f.sameOut;if(!so)return;const A=nodes[`${f.id}|${so.a}|out`],B=nodes[`${f.id}|${so.b}|out`];if(!A||!B)return;const ax=A.x+A.w/2,bx=B.x+B.w/2,ym=B.y-72;
    h+=`<path d="M${ax},${A.y+A.h} L${ax},${ym} L${bx},${ym} L${bx},${B.y}" fill="none" stroke="${d.accent}" stroke-width="1.8" stroke-dasharray="3 4" stroke-linecap="round"/><circle cx="${ax}" cy="${A.y+A.h}" r="3.5" fill="${d.accent}"/><circle cx="${bx}" cy="${B.y}" r="3.5" fill="${d.accent}"/>`;
    if(so.lab){const lw=so.lab.length*5.6+14,lx=Math.min(ax,bx)+Math.abs(bx-ax)/2-lw/2;h+=`<rect x="${lx}" y="${ym-9}" width="${lw}" height="17" rx="8" fill="var(--card)" stroke="${d.accent}" stroke-width="1"/>`+text(lx+lw/2,ym+3,[so.lab],{fs:9.2,fw:600,fill:d.accent})}});
  // edges
  d.frames.forEach(f=>f.procs.forEach(P=>{if(!P._gates)return;const sq=P._seq;for(let i=0;i<sq.length-1;i++){const A=nodes[sq[i]],B=nodes[sq[i+1]];if(!A||!B)continue;if(A.kind==="fork"){A.next=B;continue}const ay=A.kind==="in"?A.y+A.h/2:(A.kind==="dec"?A.y+A.h/2:A.y+H/2);h+=`<path d="M${A.x+A.w},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`}}));
  Object.values(nodes).forEach(n=>{if(n.kind==='in'){if(n.P._gates)return;const B=nodes[`${n.f.id}|${n.P.id}|1`];if(B)h+=`<path d="M${n.x+n.w},${n.y+H/2} L${B.x},${B.y+H/2}" class="fl" marker-end="url(#o1)"/>`;return}if(n.kind||n.fixOf||(n.P&&n.P._gates))return;const P=n.P,j=n.j;const nxt=P.steps[j+1];if(!nxt)return;const B=nodes[`${n.f.id}|${P.id}|${nxt.n}`];const D=nodes[n.id+"|d"];const ay=n.y+H/2;
    if(D){h+=`<path d="M${n.x+W},${ay} L${D.x},${ay}" class="fl" marker-end="url(#o1)"/><path d="M${D.x+DW},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`;}
    else h+=`<path d="M${n.x+W},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`});
  // handoff pills on steps + decisions + nodes
  Object.values(nodes).filter(n=>n.kind==="fork").forEach(n=>{const s=n.fk,f=n.f,P=n.P,cy0=n.rowY+H/2,cxd=n.dx+DW/2;let o="",yEnd=cy0;
    s.branches.forEach((b,bi)=>{const D=nodes[`${f.id}|${P.id}|${b.step.n}|d`],S=nodes[`${f.id}|${P.id}|${b.step.n}`];const cy=S.y+H/2;
      o+=`<path d="M${D.x+DW},${cy} L${S.x},${cy}" class="fl" marker-end="url(#o1)"/><path d="M${S.x+W},${cy} L${n.bx},${cy}" class="fl"/>`;yEnd=Math.max(yEnd,cy);
      const nxD=s.branches[bi+1]?nodes[`${f.id}|${P.id}|${s.branches[bi+1].step.n}|d`]:null;
      if(nxD)o+=`<path d="M${cxd},${D.y+DW} L${cxd},${nxD.y}" class="fl" marker-end="url(#o1)"/>`+text(cxd+5,D.y+DW+13,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
      else{const ye=S.y+H+30;const OT=s.elseOut?nodes[`${f.id}|${P.id}|out`]:null;o+=(OT?`<path d="M${cxd},${D.y+DW} L${cxd},${ye} L${OT.x+OT.w/2},${ye} L${OT.x+OT.w/2},${OT.y+OT.h}" class="fl" marker-end="url(#o1)"/>`:`<path d="M${cxd},${D.y+DW} L${cxd},${ye} L${n.bx},${ye}" class="fl"/>`)+text(cxd+5,D.y+DW+13,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
        if(s.elseLab){const lw=s.elseLab.length*5.4+8;o+=`<rect x="${cxd+10}" y="${ye-7}" width="${lw}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(cxd+14,ye+3,[s.elseLab],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}if(!OT)yEnd=Math.max(yEnd,ye)}});
    o+=`<path d="M${n.bx},${yEnd} L${n.bx},${cy0}" class="fl"/>`;if(n.next)o+=`<path d="M${n.bx},${cy0} L${n.next.x},${cy0}" class="fl" marker-end="url(#o1)"/>`;
    if(s.lab)o+=text(n.dx+DW/2,n.rowY-6,[s.lab],{fs:10,fw:700,fill:"var(--muted)"});
    h+=o});
  Object.values(nodes).forEach(n=>{
    if(n.kind==="ch"||n.kind==="tpi"||n.kind==="fork")return;
    if(n.kind==="opp"||n.kind==="fopp"){const o=n.opp,fr=n.kind==="opp"?nodes[`${n.f.id}|${n.P.id}|out`]:null;const tl=wrap(o.t,n.kind==="opp"?26:70,n.kind==="opp"?2:1);
      if(fr)h+=`<path d="M${fr.x+fr.w},${fr.y+fr.h/2} L${n.x},${n.y+n.h/2}" fill="none" stroke="#0070c0" stroke-width="1.4" stroke-dasharray="4 3" marker-end="url(#o3)"/>`;
      h+=`<g class="opn ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}"><title>AI Opportunity (${esc2(o.ty)}): ${esc2(o.t)} - ${esc2(o.d)}</title><rect class="b" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="9" fill="#e8f1fb" stroke="#0070c0" stroke-width="1.5"/>
      ${text(n.x+10,n.y+15,[n.kind==="fopp"?`AI Opportunity - ${n.f.name.length>30?n.f.name.slice(0,29)+"…":n.f.name}`:"AI Opportunity"],{fs:10.5,fw:700,fill:"#0070c0",a:"start"})}<rect x="${n.x+n.w-o.ty.length*4.3-18}" y="${n.y+5}" width="${o.ty.length*4.3+10}" height="14" rx="4" fill="#0070c0"/><text x="${n.x+n.w-o.ty.length*2.15-13}" y="${n.y+15}" font-size="7.8" font-weight="700" fill="#fff" text-anchor="middle">${esc2(o.ty)}</text>
      ${text(n.x+10,n.y+31,tl,{fs:10.3,fill:"var(--navy)",a:"start"})}${o.feas?`<rect x="${n.kind==="fopp"?n.x+n.w+8:n.x}" y="${n.kind==="fopp"?n.y+n.h/2-7.5:n.y+n.h+4}" width="${o.feas.length*5.6+16}" height="15" rx="4" fill="${/review/i.test(o.feas)?"#b45309":/applicable/i.test(o.feas)?"#667085":/not/i.test(o.feas)?"var(--pain)":/progress/i.test(o.feas)?"var(--hyb)":"var(--ok)"}"/><text x="${(n.kind==="fopp"?n.x+n.w+8:n.x)+8}" y="${n.kind==="fopp"?n.y+n.h/2+3:n.y+n.h+14.5}" font-size="9" font-weight="700" fill="#fff" text-anchor="start">${esc2(o.feas)}</text>`:""}</g>`;return}
    if(n.kind==="in"){const col=d.accent;h+=`<g><title>${esc2(n.lab)}: ${esc2(n.txt)}</title><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="9" fill="${col}"/>${text(n.x+n.w/2,n.y+15,[n.lab],{fs:9.5,fw:700,fill:"#fff"})}${text(n.x+n.w/2,n.y+31,wrap(n.txt,21,3),{fs:9.4,fill:"#fff"})}</g>`;return}
    if(n.kind==="out"){const fr=nodes[n.from];if(!n.P._gates)h+=`<path d="M${fr.x+fr.w},${fr.y+H/2} L${n.x},${n.y+n.h/2}" class="fl" marker-end="url(#o1)"/>`;h+=`<g><title>Output: ${esc2(n.doc)}${n.P.outnote?" - "+esc2(n.P.outnote):""}</title><path d="M${n.x},${n.y} L${n.x+n.w-12},${n.y} L${n.x+n.w},${n.y+12} L${n.x+n.w},${n.y+n.h} L${n.x},${n.y+n.h}z" fill="#fff7e0" stroke="#d9a400" stroke-width="1.4"/><path d="M${n.x+n.w-12},${n.y} L${n.x+n.w-12},${n.y+12} L${n.x+n.w},${n.y+12}" fill="none" stroke="#d9a400"/>${text(n.x+8,n.y+15,["Output"],{fs:9.5,fw:700,fill:"#8a6d00",a:"start"})}${text(n.x+n.w/2,n.y+30,wrap(n.doc,24,n.doc.length>48?3:2),{fs:9.8,fill:"var(--navy)"})}</g>`;return}
    if(n.kind==="dec"){const cx=n.x+DW/2,cy=n.y+DW/2,q=n.dec;const ql=wrap(q.q,22,2);h+=`<g class="opn ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}"><title>${esc2(q.q)} Yes: ${esc2(q.yes)}. No: ${esc2(q.no)}</title>${n.fork?`<rect x="${cx-(ql[0].length*5.5+8)/2}" y="${n.y-17}" width="${ql[0].length*5.5+8}" height="14" rx="3" fill="var(--card)" fill-opacity=".95"/>`:""}<path class="b" d="M${cx},${n.y} L${n.x+DW},${cy} L${cx},${n.y+DW} L${n.x},${cy}z" fill="#f3ecfa" stroke="#7b3597" stroke-width="1.4"/>${text(cx,n.y-7-(ql.length-1)*11.4,ql,{fs:9.5,fw:600,fill:"#5b2a7a"})}${text(n.x+DW+4,cy-5,[q.swap?"No":"Yes"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}</g>${n.fork?"":n.gate&&q.fix?fixBranch(n):q.nx?noBranch(n):text(cx,n.y+DW+11,wrap("No: "+q.no,26,1),{fs:8.5,fill:"#7b3597"})}`;return}
    const s=n.s,c=TYC[s.ty],ch=s.ch||"same",lines=wrap(s.t,ch!=="same"?16:(s.t.length>42?23:21),(ch!=="same"||s.t.length>42)?3:2);
    let px=n.x+2;const inl=s.inhide?[]:(s.in||[]);inl.slice(0,2).forEach(x=>{const p=pill(px,n.y-PIN+3,x[0],pc(x[0]),false,`From ${x[0]}: ${x[1]}`);h+=p.h+`<line class="source-step-leader" x1="${px+p.w/2}" y1="${n.y-PIN+20}" x2="${px+p.w/2}" y2="${n.y}" stroke="${pc(x[0])}" stroke-width="1.2"/>`;px+=p.w+4});
    if(inl.length>2){const p=pill(px,n.y-PIN+3,`+${inl.length-2}`,"#667085",false,inl.slice(2).map(x=>`From ${x[0]}: ${x[1]}`).join(" | "));h+=p.h}
    px=n.x+2;const outl=s.out||[];outl.slice(0,2).forEach(x=>{const p=pill(px,n.y+H+7,x[0],pc(x[0]),false,`To ${x[0]}: ${x[1]}`);h+=p.h+`<line class="source-step-leader" x1="${px+p.w/2}" y1="${n.y+H}" x2="${px+p.w/2}" y2="${n.y+H+7}" stroke="${pc(x[0])}" stroke-width="1.2"/>`;px+=p.w+4});if(outl.length>2){const p=pill(px,n.y+H+7,`+${outl.length-2}`,"#667085",false,outl.slice(2).map(x=>`To ${x[0]}: ${x[1]}`).join(" | "));h+=p.h}
    h+=`<g class="nd ty-${s.ty} ${s.pp&&s.pp.length?"has-pp":""} ${(s.ci||TPIS.has(n.id))?"has-tpi":""} ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}" aria-label="${esc2(s.t)}"><title>${esc2(s.t)} - ${TYNM[s.ty]} - ${esc2(s.sys)}</title>
      <rect class="b" x="${n.x}" y="${n.y}" width="${W}" height="${H}" rx="9" fill="${ch==="new"?"#eef5fc":"var(--card)"}" stroke="${c}" stroke-width="2.2" ${ch==="new"?'stroke-dasharray="6 3"':""}/>
      <circle cx="${n.x+14}" cy="${n.y+14}" r="9" fill="${c}"/><text x="${n.x+14}" y="${n.y+17.5}" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">${s.n}</text>
      ${text(n.x+W/2+(ch!=="same"?-6:8),n.y+(lines.length>1?15:21),lines,{fs:10.8,fw:600,fill:"var(--navy)"})}
      ${text(n.x+9,n.y+H-9,[wrap(s.sys,23,1)[0]],{fs:9.2,fill:"var(--muted)",a:"start"})}
      ${s.pp&&s.pp.length?(d.fixes&&ch!=="same"?`<g><title>Pain point addressed by this change: ${esc2(s.pp.join(" | "))}</title><circle cx="${n.x+W-11}" cy="${n.y+H-11}" r="7" fill="#1f8a4c"/><text x="${n.x+W-11}" y="${n.y+H-7.5}" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">✔</text></g>`:`<circle cx="${n.x+W-11}" cy="${n.y+H-11}" r="7" fill="var(--pain)"/><text x="${n.x+W-11}" y="${n.y+H-7.5}" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">!</text>`):""}
      ${s.cop?`<rect x="${n.x+W-44}" y="${n.y-7}" width="38" height="13" rx="4" fill="#fff" stroke="#0070c0" stroke-dasharray="3 2"/><text x="${n.x+W-25}" y="${n.y+2.5}" font-size="8" font-weight="700" fill="#0070c0" text-anchor="middle">${esc2(s.cop.tag||"Copilot")}</text>`:""}${ch!=="same"?`<rect x="${n.x+W-34}" y="${n.y+4}" width="30" height="13" rx="4" fill="var(--prop)"/><text x="${n.x+W-19}" y="${n.y+13.5}" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">${ch==="new"?"NEW":"AI"}</text>`:""}
      ${s.feas?`<rect x="${n.x+(s.feasdx||0)+W/2-Math.max(W,s.feas.length*4.7+14)/2}" y="${n.y+H+(outl.length?27:3)}" width="${Math.max(W,s.feas.length*4.7+14)}" height="14" rx="4" fill="${/review/i.test(s.feas)?"#b45309":/applicable/i.test(s.feas)?"#667085":/not/i.test(s.feas)?"var(--pain)":/progress/i.test(s.feas)?"var(--hyb)":"var(--ok)"}"/><text x="${n.x+(s.feasdx||0)+W/2}" y="${n.y+H+(outl.length?37:13)}" font-size="8.3" font-weight="700" fill="#fff" text-anchor="middle">${esc2(s.feas)}</text>${s.feasn?`<text x="${n.x+(s.feasdx||0)+W/2+Math.max(W,s.feas.length*4.7+14)/2+5}" y="${n.y+H+(outl.length?37:13)}" font-size="9.5" font-weight="600" fill="var(--navy)" text-anchor="start">${esc2(s.feasn)}</text>`:""}`:""}
    </g>`;
  });
  const svg=document.querySelector(E.svg);svg.setAttribute("viewBox",`0 0 ${svgW} ${svgH}`);svg.setAttribute("data-f",filter);svg.innerHTML=h+BT;
  svg.querySelectorAll(".nd,.opn").forEach(g=>{const f=()=>detail(g.dataset.id);g.onclick=f;g.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();f()}}});
}
function detail(id){const n=nodes[id];if(!n)return;sel=id;
  document.querySelector(E.svg).querySelectorAll(".opn").forEach(g=>g.classList.toggle("sel",g.dataset.id===id));
  if(n.kind==="opp"||n.kind==="fopp"){const o=n.opp;document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)}${n.P?" / "+esc2(n.P.name):""}</span><h3 style="color:#0070c0">AI Opportunity: ${esc2(o.t)}</h3><dl><div><dt>Type</dt><dd><b>${esc2(o.ty)}</b></dd></div><div><dt>How it would work and tools</dt><dd class="opl">${esc2(o.d)}</dd></div>${(n.P?n.P.steps.flatMap(s=>s.pp||[]):(n.f.pp||[])).length?`<div><dt style="color:var(--pain)">Pain points it addresses</dt><dd class="ppl">${[...new Set(n.P?n.P.steps.flatMap(s=>s.pp||[]):(n.f.pp||[]))].map(esc2).join("<br>")}</dd></div>`:""}${o.feasc?`<div><dt style="color:var(--ok)">AI feasibility comment</dt><dd>${esc2(o.feasc)}</dd></div>`:""}<div><dt>Source</dt><dd>${esc2(o.rid)} (hypothesis - needs validation with FP&A Commercial)</dd></div>${o.feas?`<div><dt>Feasibility</dt><dd><b>${esc2(o.feas)}</b></dd></div>`:""}</dl>`;return}
  if(n.kind==="ch"||n.kind==="tpi"){const c=n.c,ids=(c.steps||[]).map(s=>`${n.f.id}|${s}`);document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.toggle("sel",ids.includes(g.dataset.id)));
    const names=ids.map(i=>nodes[i]).filter(Boolean).map(x=>`<b>${esc2(x.P.name)}</b> · ${esc2(x.s.n)}. ${esc2(x.s.t)}`).join("<br>");
    document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)}</span><h3 style="color:${n.kind==="ch"?"#a00015":"#13643a"}">${n.kind==="ch"?"[CHALLENGE] Pain point":`[SOLUTION] ${esc2(c.st||"TPI")}`}</h3><p style="margin:4px 0 0">${esc2(c.t)}</p><dl>${names?`<div><dt>${n.kind==="ch"?"Where it hits (highlighted on the map)":"Steps it addresses (highlighted on the map)"}</dt><dd>${names}</dd></div>`:""}${c.ref?`<div><dt>Reference</dt><dd>${esc2(c.ref)}</dd></div>`:""}<div><dt>Source</dt><dd>${n.kind==="ch"?"Commercial FP&A E2E v3 / updated As-Is feedback":(c.src||"FP&A Commercial TPI register (FP_A_Commercial_TPI.xlsx)")}</dd></div></dl>`;return}
  if(n.kind==="dec"){const q=n.dec;document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.remove("sel"));
    const r=(t,v,cls)=>v?`<div><dt>${t}</dt><dd class="${cls||""}">${v}</dd></div>`:"";
    document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f?n.f.name:"")}${n.P?" / "+esc2(n.P.name):""}</span><h3 style="color:#5b2a7a">Decision: ${esc2(q.q)}</h3>${q.d?`<p style="margin:4px 0 0">${esc2(q.d)}</p>`:""}<dl>${r("Example",q.ex?`<i>${esc2(q.ex)}</i>`:"")}${r("Checked by",q.o?esc2(q.o):"")}${r("System",q.sys?esc2(q.sys):"")}<div><dt>If yes</dt><dd>${esc2(q.yes)}</dd></div><div><dt>If no</dt><dd>${esc2(q.no)}</dd></div>${q.pp&&q.pp.length?r('<span style="color:var(--pain)">Pain point when the answer is no</span>',q.pp.map(esc2).join("<br>"),"ppl"):""}${r("Source",q.src?esc2(q.src):"")}</dl>`;return}
  const s=n.s;document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.toggle("sel",g.dataset.id===id));
  const row=(t,v,cls)=>v?`<div><dt>${t}</dt><dd class="${cls||""}">${v}</dd></div>`:"";
  const ownc=o=>o.split(/\s\/\s|,\s*/).map(x=>`<span class="own"><i style="background:${pc(x)}"></i>${esc2(x)}</span>`).join("");
  let html=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)} / ${esc2(n.P.name)} (${esc2(n.P.id)})</span><h3>${s.n}. ${esc2(s.t)}</h3><p style="margin:4px 0 0">${esc2(s.d)}</p><dl>`;
  html+=row("Who",ownc(s.o))+row("System",esc2(s.sys))+row("Activity type",`<b style="color:${TYC[s.ty]}">${TYNM[s.ty]}</b>${page==="tobe"&&s.toty&&s.ch!=="same"?` <small>(As-Is, colour kept on the map)</small><br>If adopted: <b>${TYNM[s.toty]}</b>${s.toty===s.ty?" <small>(same level)</small>":""}`:""}`);
  if(page==="tobe"&&s.ast&&s.ast!==s.t)html+=row("As-Is step",esc2(s.ast));
  if(s.in&&s.in.length)html+=row("Input from",s.in.map(x=>`<b>${esc2(x[0])}</b>: ${esc2(x[1])}`).join("<br>"));
  if(s.out&&s.out.length)html+=row("Output to",s.out.map(x=>`<b>${esc2(x[0])}</b>: ${esc2(x[1])}`).join("<br>"));
  if(s.dec)html+=row("Decision",`<b>${esc2(s.dec.q)}</b><br>Yes &rarr; ${esc2(s.dec.yes)}<br>No &rarr; ${esc2(s.dec.no)}`);
  if(s.ctl)html+=row("Control",esc2(s.ctl));if(s.note)html+=row("LT review",esc2(s.note));if(s.fb)html+=row("Feedback",esc2(s.fb));
  if(s.pp&&s.pp.length)html+=row('<span style="color:var(--pain)">Pain points</span>',s.pp.map(esc2).join("<br>"),"ppl");
  if(s.ci)html+=row("Existing CI / TPI",esc2(s.ci));
  if(page==="tobe"&&s.ch&&s.ch!=="same")html+=row('<span style="color:var(--prop)">AI suggestion (hypothesis, to validate)</span>',`<b>${esc2(s.rec||"")}</b>${s.kind?` <small>· ${esc2(s.kind)}</small>`:""}<br>Tools: ${esc2(s.tools||"")}<br><small>Basis: ${esc2(s.opp||"")}</small>`,"opl");
  if(page==="tobe"&&s.cop)html+=row('<span style="color:#0070c0">Copilot / Microsoft AI option (added hypothesis, to validate)</span>',`<b>${esc2(s.cop.tool)}</b><br>${esc2(s.cop.d)}<br><small>Feasibility: Under review - licensing and governance to be confirmed</small>`,'opl');
if(s.feasc)html+=row(`<span style="color:var(--ok)">${esc2(s.feasl||"AI enhancement comment")}</span>`,esc2(s.feasc));
  html+=row("Source",esc2(s.src))+`</dl>`;
  if(page==="tobe"&&s.ch==="same")html+=`<p style="font-size:12px;color:var(--muted)">No change proposed for this step.</p>`;
  document.querySelector(E.det).innerHTML=html;
}
function legend(){const d=DATA[page];const sw=(c,dash)=>`<svg width="22" height="12"><line x1="0" y1="6" x2="22" y2="6" stroke="${c}" stroke-width="1.6" ${dash?'stroke-dasharray="4 3"':""}/></svg>`;
  const box=c=>`<svg width="20" height="12"><rect x="1" y="1" width="18" height="10" rx="3" fill="none" stroke="${c}" stroke-width="2"/></svg>`;
  document.querySelector(E.leg).innerHTML=`<span>${box("#d0021b")}Manual</span><span>${box("#e8891c")}Semi-automated</span><span>${box("#2f6fce")}Automated</span><span><svg width="14" height="14"><circle cx="7" cy="7" r="6.5" fill="#c8102e"/><text x="7" y="10.5" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">!</text></svg>Pain point</span><span><svg width="14" height="14"><path d="M7,1L13,7L7,13L1,7z" fill="#f3ecfa" stroke="#7b3597"/></svg>Decision</span><span>${sw("var(--navy)")}Flow</span><span>${sw(d.accent)}Chain between processes</span><span>${sw(d.accent,1)}Loop back</span>${d.frames.some(f=>f.ch&&f.ch.length)?`<span><svg width="22" height="12"><rect x="1" y="1" width="20" height="10" rx="3" fill="#fdecec" stroke="var(--pain)"/></svg>[CHALLENGE] pain point</span><span><svg width="22" height="12"><rect x="1" y="1" width="20" height="10" rx="3" fill="#e6f4ec" stroke="var(--ok)"/></svg>[SOLUTION] TPI / CI</span><span>${sw(d.accent,1)}Same output</span>`:""}${d.frames.some(f=>f.procs.some(p=>p.steps.some(s=>s.gate&&s.fix&&!s.noRetry)))?`<span>${sw("var(--navy)",1)}Retry after the fix</span>`:""}${d.frames.some(f=>f.procs.some(p=>p.steps.some(s=>s.dec&&s.dec.nx&&s.dec.nx.end)))?`<span><svg width="26" height="14"><rect x="1" y="1" width="24" height="12" rx="6" fill="#fdecec" stroke="#d0021b" stroke-width="1.3"/></svg>End of the flow (reject / hold)</span>`:""}<span><svg width="34" height="14"><rect width="34" height="14" rx="4" fill="${d.accent}"/><text x="17" y="10.5" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">Input</text></svg>Trigger / input</span><span><svg width="18" height="14"><path d="M1,1 L12,1 L17,6 L17,13 L1,13z" fill="#fff7e0" stroke="#d9a400"/></svg>Output</span>${page==="tobe"?`<span><svg width="70" height="16"><rect x="1" y="1" width="68" height="14" rx="7" fill="none" stroke="#0070c0" stroke-width="1.3" stroke-dasharray="3 2"/><text x="35" y="11.5" font-size="9" font-weight="700" fill="#0070c0" text-anchor="middle">AI: Tower</text></svg>AI-suggested dependency</span><span><svg width="60" height="16"><rect x="1" y="1" width="58" height="14" rx="4" fill="#e8f1fb" stroke="#0070c0"/><text x="30" y="11.5" font-size="8.5" font-weight="700" fill="#0070c0" text-anchor="middle">AI Opportunity</text></svg>AI opportunity (register)</span><span><svg width="30" height="13"><rect width="30" height="13" rx="4" fill="#0070c0"/><text x="15" y="10" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">AI</text></svg>Step changed (AI suggested)</span><span><svg width="30" height="13"><rect width="30" height="13" rx="4" fill="#0070c0"/><text x="15" y="10" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">NEW</text></svg>New step</span>`:""}<span><svg width="30" height="14"><rect x="1" y="1" width="28" height="12" rx="4" fill="none" stroke="#9aa3b2" stroke-dasharray="3 2"/></svg>Upstream dependency handoffs into a step</span><span>Pills = input from / output to; strips = upstream / downstream</span>`;}
function setScale(s){scale=Math.max(.3,Math.min(2,s));const svg=document.querySelector(E.svg);svg.style.width=svgW*scale+"px";svg.style.height=svgH*scale+"px"}
function fit(){const w=document.querySelector(E.scroll).clientWidth-10;setScale(Math.min(1,w/svgW))}
function render(pg,fl){if(pg)page=pg;if(fl)filter=fl;sel=null;draw();legend();document.querySelector(E.det).innerHTML='<p class="none">Select a step in the map to see what happens, who does it, the system, inputs, outputs, decisions, pain points and the source.</p>';fit()}
function setFilter(f){filter=f;document.querySelector(E.svg).setAttribute("data-f",f)}
return {getNodes:()=>nodes,getDimensions:()=>({width:svgW,height:svgH}),render,setFilter,zi:()=>setScale(scale+.15),zo:()=>setScale(scale-.15),fit,page:()=>page,setScale,getScale:()=>scale};
};
window.TowerRenderers["FPAO"]=function makeTowerMap(KEY,DATA,E){
const TPIS=new Set();Object.values(DATA).forEach(dd=>dd&&dd.frames&&dd.frames.forEach(f=>(f.tpi||[]).forEach(t=>(t.steps||[]).forEach(r=>TPIS.add(f.id+"|"+r)))));
const W=158,H=74,G=46,DW=34,PAD=24,FH=E.frameHeaderHeight||46,ROWL=E.processHeaderGap||22,PIN=E.processInputGap||24,POUT=24,RGAP=44,STRIP=E.handoffStripHeight||30,INW=118,CH=14;
const TYC={man:"#d0021b",auto:"#2f6fce",hyb:"#e8891c"},TYNM={man:"Manual",hyb:"Semi-automated",auto:"Automated"};
const esc2=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function wrap(t,n,max){const w=String(t).split(" ");const L=[];let c="";w.forEach(x=>{if((c+" "+x).trim().length>n){if(c)L.push(c);c=x}else c=(c+" "+x).trim()});if(c)L.push(c);max=max||2;if(L.length>max){L[max-1]=L.slice(max-1).join(" ");if(L[max-1].length>n+2)L[max-1]=L[max-1].slice(0,n)+"…";L.length=max}return L}
function text(x,y,lines,o={}){return `<text x="${x}" y="${y}" font-size="${o.fs||11.5}" font-weight="${o.fw||500}" fill="${o.fill||"var(--ink)"}" text-anchor="${o.a||"middle"}" font-family="Inter,Segoe UI,Arial,sans-serif">${lines.map((l,i)=>`<tspan x="${x}" dy="${i?1.2:0}em">${esc2(l)}</tspan>`).join("")}</text>`}
let page="asis",filter="all",nodes={},svgW=0,svgH=0,scale=1,sel=null;
const pc=p=>{const k=String(p).split(/[ -]/)[0];return ({O2C:"var(--O2C)",R2R:"var(--R2R)",TAX:"var(--Tax)",Tax:"var(--Tax)",P2P:"var(--P2P)",CAPEX:"var(--CAPEX)",Controlling:"var(--Controlling)",Local:"var(--LocalFinance)",IT:"#667085",Capital:"#1d4ed8",Licensed:"#4b2a86",Report:"#4b2a86",FPAC:"var(--FPA)",FPAO:"var(--FPA)",DMT:"#0e7490",Customer:"#8a6d3b",Distributors:"#8a6d3b",Distribution:"#0f766e",Bank:"#475467",Payroll:"#b7791f",Local:"#b7791f",FP:"var(--FPA)",HR:"#9d174d",International:"#152847",Area:"#152847",Group:"#152847",Region:"#152847",Royalty:"#667085",MC:"#b7791f",BUD:"#b7791f",BUDs:"#b7791f",Brand:"#b7791f",Cost:"#b7791f",Business:"#b7791f",CFO:"#7b3597",CP:"#7b3597",CBP:"#c77a0a",Embedded:"#c77a0a",SAP:"#667085",CMR:"#667085",PMR:"#667085",AZ:"#667085",AZForce:"#667085",Enpire:"#667085",OneGRC:"#475467",Approver:"#7b3597",Market:"#b7791f",Posting:"var(--R2R)",FBPs:"#c77a0a",Planning:"#667085","P&MR":"#667085"})[k]||(String(p).startsWith("FP&A")||/^G\d\d$/.test(String(p))?"var(--FPA)":"#667085")};
function pill(x,y,label,c,dash,title,anchorLeft){const w=label.length*6.2+16;return {w,h:`<g class="source-pill"><title>${esc2(title||label)}</title><rect x="${x}" y="${y}" width="${w}" height="17" rx="8.5" fill="var(--card)" stroke="${c}" stroke-width="1.3" ${dash?'stroke-dasharray="3 2"':""}/>${text(x+w/2,y+12,[label],{fs:10,fw:600,fill:c})}</g>`}}
function feedBlock(P,f,top){const F=P.feed,T=nodes[`${f.id}|${P.id}|${F.to}`],S1=nodes[`${f.id}|${P.id}|1`],S2=nodes[`${f.id}|${P.id}|2`];if(!T||!S1||!S2)return "";
  const nw=W,nh=34,ya=top+16,yb=top+56,ym=top+36;
  const box=(x,y,a,sub,dash)=>{const c=pc(a);return `<g><title>${esc2(a)}: ${esc2(sub)}</title><rect x="${x}" y="${y}" width="${nw}" height="${nh}" rx="8" fill="var(--card)" stroke="${c}" stroke-width="1.7" ${dash?'stroke-dasharray="4 3"':""}/>${text(x+10,y+14,[a],{fs:9.8,fw:700,fill:c,a:"start"})}${text(x+10,y+27,[sub],{fs:9.3,fill:"var(--navy)",a:"start"})}</g>`};
  const el=(x1,y1,x2,y2)=>{const mx=(x1+x2)/2;return `<path d="M${x1},${y1} L${mx},${y1} L${mx},${y2} L${x2},${y2}" class="fl" marker-end="url(#o1)"/>`};
  let o=`<rect x="${S1.x-10}" y="${top-6}" width="${T.x+nw-S1.x+20}" height="${nh*2+36}" rx="10" fill="#fff" fill-opacity=".6" stroke="#9aa3b2" stroke-dasharray="4 3"/>`+text(S1.x-2,top+6,[F.lab],{fs:9.6,fw:700,fill:"var(--muted)",a:"start"});
  o+=box(S1.x,ya,F.src[0][0],F.src[0][1])+box(S1.x,yb,F.src[1][0],F.src[1][1])+box(S2.x,ym,F.fet[0],F.fet[1])+box(T.x,ym,F.sys[0],F.sys[1],1);
  o+=el(S1.x+nw,ya+nh/2,S2.x,ym+nh/2-5)+el(S1.x+nw,yb+nh/2,S2.x,ym+nh/2+5)+`<path d="M${S2.x+nw},${ym+nh/2} L${T.x},${ym+nh/2}" class="fl" marker-end="url(#o1)"/>`;
  const ax=T.x+nw/2;o+=`<path d="M${ax},${ym+nh} L${ax},${T.y}" class="fl" stroke-width="2" marker-end="url(#o1)"/>`+text(ax+6,(ym+nh+T.y)/2+3,[F.elab[3]],{fs:9,fw:600,fill:"var(--navy)",a:"start"});
  return o}
function layout(d){
  nodes={};let h="",y=PAD+10,maxX=0;const x0=PAD+(d.chan||60);
  // phase chevrons (processes grouped by key process)
  {const raw=d.frames.flatMap(f=>f.procs.map(p=>({p,f})));const procs=[];raw.forEach(it=>{const k=it.p.phase||it.p.name;const L=procs[procs.length-1];if(L&&L.k===k&&L.f===it.f){L.ids.push(it.p.id)}else procs.push({k,f:it.f,p:it.p,ids:[it.p.id]})});const cw=procs.length<=3?230:150,ch=40;let cx=x0;
   h+=text(x0,y+12,["Process phases"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});y+=18;
   procs.forEach(({p,f},i)=>{const fi=d.frames.indexOf(f);const col=d.accent;const op=.55+.15*(fi%3);
     h+=`<g><title>${esc2(f.name)} / ${esc2(p.phase||p.name)} (${esc2(procs[i].ids.join(", "))})</title><path d="M${cx},${y} L${cx+cw-14},${y} L${cx+cw},${y+ch/2} L${cx+cw-14},${y+ch} L${cx},${y+ch} L${cx+14},${y+ch/2}z" fill="${col}" fill-opacity="${op}"/>${text(cx+cw/2+4,y+ch/2+4,wrap(`${i+1}. ${p.phase||p.name}`,cw>200?32:20,1),{fs:10.5,fw:700,fill:"#fff"})}</g>`;cx+=cw+4});
   maxX=Math.max(maxX,cx);y+=ch+22;}
  d.frames.forEach((f,fi)=>{
    const top=y;const c=d.accent;
    y+=FH;
    // upstream strip
    let px=x0+8;const upY=y+4;if(f.up.length){h+=text(x0,upY+12,["Upstream"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});px+=66;}
    f.up.forEach(u=>{const p=pill(px,upY,(u.c?"AI: ":"")+u.p,u.c?"var(--prop)":pc(u.p),!!u.c,`${u.c?"AI SUGGESTED - ":""}${u.p}: ${u.w} (${u.src})`);h+=p.h;px+=p.w+6});
    maxX=Math.max(maxX,px);y+=STRIP;
    f.procs.forEach((P,pi)=>{
      y+=ROWL;const FEEDH=P.feed?(E.feedHeight||110):0;const feedTop=y+(E.feedTopGap||10);const rowY=y+PIN+FEEDH;let x=x0;const items=[];
      nodes[`${f.id}|${P.id}|in`]={id:`${f.id}|${P.id}|in`,x,y:rowY,w:INW,h:H,kind:"in",lab:P.inbox[0],txt:P.inbox[1],f,P};x+=INW+G-12;
      P._headingY=y;h+=`<g class="source-process-heading">`;const multi=f.procs.length>1,lx=multi?x0+76:x0;if(multi)h+=`<g><rect x="${x0}" y="${y-17}" width="68" height="18" rx="9" fill="${d.accent}"/>`+text(x0+34,y-4.5,[`Process ${fi+1}.${pi+1}`],{fs:9.5,fw:700,fill:"#fff"})+`</g>`;h+=text(lx,y-4,[`${P.name}`],{fs:12,fw:700,fill:"var(--navy)",a:"start"});h+=text(lx+P.name.length*7.2+10,y-4,[`${P.id} · ${P.owner}`],{fs:10.5,fill:"var(--muted)",a:"start"});h+=`</g>`;
      const seq=[`${f.id}|${P.id}|in`];let fext=0;P._rb=rowY+H;P._gates=false;
      P.steps.forEach((s,j)=>{
        if(s.split){P._gates=true;const BG=58;x+=24;const sx=x;let maxEnd=sx+40;const rows=[];
          s.branches.forEach((b,bi)=>{const by=rowY+bi*(H+BG);let xx=sx+128;b.steps.forEach((st,k)=>{const sid=`${f.id}|${P.id}|${st.n}`;nodes[sid]={id:sid,x:xx,y:by,w:W,h:H,s:st,f,P,j,br:true,bi,k};xx+=W+G});maxEnd=Math.max(maxEnd,xx-G);rows.push({by,first:b.steps[0],last:b.steps[b.steps.length-1],lab:b.lab})});
          const bx=maxEnd+26;const fid=`${f.id}|${P.id}|split${j}`;nodes[fid]={id:fid,kind:"split",sp:s,f,P,x:sx,w:bx-sx,sx,bx,rowY,rows};seq.push(fid);
          const nb=s.branches.length;fext=Math.max(fext,(nb-1)*(H+BG)+34);P._rb=Math.max(P._rb,rowY+H+(nb-1)*(H+BG)+30);x=bx+44;return}
        if(s.gate){P._gates=true;x+=60;const gid=`${f.id}|${P.id}|${s.n}`;nodes[gid]={id:gid,x,y:rowY+H/2-DW/2,w:DW,h:DW,kind:"dec",gate:true,dec:s,f,P,j,ln:P.steps.slice(j+1).filter(q=>q.gate&&q.nx&&!q.nx.end).length};seq.push(gid);
          if(s.fix){const fs=s.fix,fid=`${f.id}|${P.id}|${fs.n}`;nodes[fid]={id:fid,x:x+DW/2-W/2,y:rowY+H+56,w:W,h:H,s:fs,f,P,j,fixOf:gid};fext=56+H+4;P._rb=rowY+H+fext-4}
          x+=DW+G+76;return}
        if(s.fork){P._gates=true;const BG=56,nb=s.branches.length;x+=30;const dx=x,sx=dx+DW+G+40,bx=sx+W+30;
          s.branches.forEach((b,bi)=>{const by=rowY+bi*(H+BG);const nq=s.branches[bi+1];const did=`${f.id}|${P.id}|${b.step.n}|d`;
            nodes[did]={id:did,x:dx,y:by+H/2-DW/2,w:DW,h:DW,kind:"dec",fork:true,f,P,dec:{q:b.q,ex:b.ex,o:b.o,d:b.d,src:b.src,yes:`Step ${b.step.n} - ${b.step.t}`,no:nq?`Check: ${nq.q}`:(s.elseLab||"No")+" - release"}};
            const sid=`${f.id}|${P.id}|${b.step.n}`;nodes[sid]={id:sid,x:sx,y:by,w:W,h:H,s:b.step,f,P,j,br:true}});
          const fid=`${f.id}|${P.id}|fork${j}`;nodes[fid]={id:fid,kind:"fork",fk:s,f,P,x:dx,w:bx-dx,dx,sx,bx,rowY};seq.push(fid);
          fext=Math.max(fext,(nb-1)*(H+BG)+34);P._rb=Math.max(P._rb,rowY+H+(nb-1)*(H+BG)+30);x=bx+40;return}
        const id=`${f.id}|${P.id}|${s.n}`;nodes[id]={id,x,y:rowY,w:W,h:H,s,f,P,j};items.push(id);seq.push(id);x+=W+G;
        if(s.dec){x+=30;nodes[id+"|d"]={id:id+"|d",x:x,y:rowY+H/2-DW/2,w:DW,h:DW,dec:s.dec,kind:"dec",step:s,f,P,ln:P.steps.slice(j+1).filter(q=>q.dec&&q.dec.nx&&!q.dec.nx.end).length};x+=DW+G+40}});
      P._seq=seq;if(P.feed)h+=feedBlock(P,f,feedTop);
      if(P.outdoc){x+=14;nodes[`${f.id}|${P.id}|out`]={id:`${f.id}|${P.id}|out`,x,y:rowY+8,w:150,h:H-16,kind:"out",doc:P.outdoc,f,P,from:P._gates?seq[seq.length-1]:items[items.length-1]};seq.push(`${f.id}|${P.id}|out`);x+=150+G}
      if(d.key==="tobe"&&P.opp){x+=6;nodes[`${f.id}|${P.id}|opp`]={id:`${f.id}|${P.id}|opp`,x,y:rowY-6,w:190,h:H+12,kind:"opp",opp:P.opp,f,P,from:items[items.length-1]};x+=210}
      maxX=Math.max(maxX,x);
      y=rowY+H+POUT+RGAP+fext+(P.steps.some(s=>s.dec&&s.dec.nx)?30:0);
    });
    if(d.key==="tobe"&&f.opp){nodes[`${f.id}|opp`]={id:`${f.id}|opp`,x:x0,y:y-18,w:460,h:44,kind:"fopp",opp:f.opp,f};y+=56}
    // challenge / TPI strips
    if((f.ch&&f.ch.length)||(f.tpi&&f.tpi.length)){y+=4;
      const strip=(items,kind,lab,fill,stroke,col,bw)=>{h+=text(x0,y+12,[lab],{fs:10.5,fw:700,fill:col,a:"start"});y+=20;let bx=x0;
        items.forEach((c,i)=>{if(i&&i%4===0){bx=x0;y+=58}const id=`${f.id}|${kind}${i}`;const head=kind==="ch"?"[CHALLENGE]":`[SOLUTION] ${c.st||"TPI"}`;const tl=wrap(c.t,Math.floor(bw/5.6),2);nodes[id]={id,kind,c,f,x:bx,y,w:bw,h:50};
          h+=`<g class="opn ${sel===id?"sel":""}" tabindex="0" role="button" data-id="${id}"><title>${esc2(head)}: ${esc2(c.t)}${c.ref?" - "+esc2(c.ref):""}</title><rect class="b" x="${bx}" y="${y}" width="${bw}" height="50" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>${text(bx+10,y+14,[head],{fs:9.5,fw:700,fill:col,a:"start"})}${c.ref?text(bx+bw-8,y+14,[c.ref],{fs:8.8,fill:col,a:"end"}):""}${text(bx+10,y+29,tl,{fs:9.8,fill:"var(--navy)",a:"start"})}</g>`;bx+=bw+12});
        maxX=Math.max(maxX,bx);y+=50+14};
      if(f.ch&&f.ch.length)strip(f.ch,"ch","Pain points (register)","#fdecec","var(--pain)","#a00015",330);
      if(f.tpi&&f.tpi.length)strip(f.tpi,"tpi","TPI / CI initiatives (register)","#e6f4ec","var(--ok)","#13643a",430);
    }
    // downstream strip
    px=x0+8;const dnY=y-10;if(f.down.length){h+=text(x0,dnY+12,["Downstream"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});px+=78;}
    f.down.forEach(u=>{const p=pill(px,dnY,(u.c?"AI: ":"")+u.p,u.c?"var(--prop)":pc(u.p),!!u.c,`${u.c?"AI SUGGESTED - ":""}${u.p}: ${u.w} (${u.src})`);h+=p.h;px+=p.w+6});
    maxX=Math.max(maxX,px);y+=STRIP+6;
    f._box={top,bot:y,c};y+=26;
  });
  const FR=Math.max(maxX+40,1180);d._fr=FR;svgW=FR;svgH=y+PAD;
  return h;
}
function noBranch(n){const q=n.dec,nx=q.nx,cx=n.x+DW/2,by=n.y+DW,rowY=n.y-(H/2-DW/2),rb=n.P&&n.P._rb?n.P._rb:rowY+H;let o="";if(nx.none)return nx.nl?text(cx+5,by+13,[nx.nl],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"}):"";
  if(nx.end){const hold=nx.kind==="hold",w=Math.max(96,nx.end.length*6.4+22),ty=(n.gate&&rb>rowY+H)?rowY+H+56+H/2-13:rb+34;o+=`<path d="M${cx},${by} L${cx},${ty}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+13,[q.swap?"Yes":"No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})+`<g><title>${esc2(q.q)} No: ${esc2(q.no)}</title><rect x="${cx-w/2}" y="${ty}" width="${w}" height="26" rx="13" fill="${hold?"#fff4e0":"#fdecec"}" stroke="${hold?"#e8891c":"#d0021b"}" stroke-width="1.5"/>${text(cx,ty+17,[nx.end],{fs:9.8,fw:700,fill:hold?"#8a4b00":"#a00015"})}</g>`;return o}
  const T=nx.out?nodes[`${n.f.id}|${n.P.id}|out`]:nodes[`${n.f.id}|${n.P.id}|${nx.step}`];if(!T)return text(cx,n.y+DW+11,wrap("No: "+q.no,26,1),{fs:8.5,fill:"#7b3597"});
  const yb=rb+40+(n.ln||0)*12+(n.P&&page==='tobe'?30:0),ex=nx.out?T.x+T.w/2:T.x+T.w-16,ty=T.y+T.h+((T.s&&T.s.feas)?((T.s.out||[]).length?44:20):0);
  o+=`<path d="M${cx},${by} L${cx},${yb} L${ex},${yb} L${ex},${ty}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+13,[q.swap?"Yes":"No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
  const nl=q.nl||nx.nl;if(nl){const lw=nl.length*5.4+8;o+=`<rect x="${cx+10}" y="${yb-7}" width="${lw}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(cx+14,yb+3,[nl],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}
  return o}
function fixBranch(n){const q=n.dec,F=nodes[`${n.f.id}|${n.P.id}|${q.fix.n}`];if(!F)return "";const cx=n.x+DW/2,by=n.y+DW,rowY=n.y-(H/2-DW/2),ym=rowY+H+18,ex=F.x+W+16,rx=F.x-16,cy=rowY+H/2;let o="";
  o+=`<path d="M${cx},${by} L${cx},${ym} L${ex},${ym} L${ex},${F.y+H/2} L${F.x+W},${F.y+H/2}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+12,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
  const S1=nodes[`${n.f.id}|${n.P.id}|1`];
  if(n.P.id==="SOC-01.1"){const S2=nodes[`${n.f.id}|${n.P.id}|1`];if(S2){const k=["1a","1b","1c"].indexOf(q.fix.n),yy=F.y+H+22+k*9,tx=S2.x+30+k*14,fx=F.x+W/2;o+=`<path d="M${fx},${F.y+H} L${fx},${yy} L${tx},${yy} L${tx},${S2.y+H}" class="fl" marker-end="url(#o1)"/>`}}else if(S1&&false){const k=["1a","1b","1c"].indexOf(q.fix.n),by=F.y+H+18+k*10,sx=S1.x+30+k*12,fx=F.x+W/2;o+=`<path d="M${fx},${F.y+H} L${fx},${by} L${sx},${by} L${sx},${S1.y+H}" class="fl" stroke-dasharray="5 3" marker-end="url(#o1)"/>`;
  if(k===0)o+=`<rect x="${sx+8}" y="${by-7}" width="${"Retry from step 1".length*5+6}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(sx+11,by+3,["Retry from step 1"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}
  else if(!q.noRetry){o+=`<path d="M${F.x},${F.y+H/2} L${rx},${F.y+H/2} L${rx},${cy} L${n.x},${cy}" class="fl" stroke-dasharray="5 3" marker-end="url(#o1)"/>`;
  const ly=(F.y+H/2+cy)/2;o+=`<rect x="${rx-34}" y="${ly-7}" width="31" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(rx-4,ly+3,["Retry"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"end"});
  }
  if(n.P.id==="SOC-05.1"){const O=nodes[`${n.f.id}|${n.P.id}|out`],S3=nodes[`${n.f.id}|${n.P.id}|3`],fx=F.x+W/2;if(O){const tx=O.x+O.w/2,jy=F.y+H+30;o+=`<path d="M${fx+12},${F.y+H} L${fx+12},${jy} L${tx},${jy} L${tx},${O.y+O.h}" class="fl" marker-end="url(#o1)"/>`}if(S3){const tx=S3.x+W-10,jy=F.y+H+16;o+=`<path d="M${fx-12},${F.y+H} L${fx-12},${jy} L${tx},${jy} L${tx},${S3.y+H}" class="fl" marker-end="url(#o1)"/>`}}else if(q.fix.join){const sq=n.P._seq||[],J=q.fix.join==="out"?nodes[`${n.f.id}|${n.P.id}|out`]:nodes[sq[sq.indexOf(n.id)+2]];if(J){const jx=F.x+W/2,jy=F.y+H+34,tx=J.x+J.w/2;if(J.kind==="dec"){const cyy=J.y+J.h/2,mx=J.x-14;o+=`<path d="M${jx},${F.y+H} L${jx},${jy} L${mx},${jy} L${mx},${cyy} L${J.x},${cyy}" class="fl" marker-end="url(#o1)"/>`}else o+=`<path d="M${jx},${F.y+H} L${jx},${jy} L${tx},${jy} L${tx},${J.y+J.h}" class="fl" marker-end="url(#o1)"/>`}}
  return o}
function draw(){
  const d=DATA[page];const strips=layout(d);let h=`<defs><marker id="o1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--navy)"/></marker><marker id="o2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#7b3597"/></marker><marker id="o3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#0070c0"/></marker><marker id="o4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="${d.accent}"/></marker><marker id="o5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0L10,5L0,10z" fill="${d.accent}"/></marker></defs>
  <style>.fl{fill:none;stroke:var(--navy);stroke-width:1.6}.rw{fill:none;stroke:#7b3597;stroke-width:1.4;stroke-dasharray:5 4}svg[data-f="man"] .nd:not(.ty-man),svg[data-f="hyb"] .nd:not(.ty-hyb),svg[data-f="auto"] .nd:not(.ty-auto),svg[data-f="pp"] .nd:not(.has-pp),svg[data-f="tpi"] .nd:not(.has-tpi){opacity:.14}svg[data-f="tpi"] .nd.has-tpi rect.b{stroke:#13643a;stroke-width:4;filter:drop-shadow(0 0 5px rgba(19,100,58,.55))}.opn{cursor:pointer}.opn:hover rect.b,.opn.sel rect.b{stroke-width:2.4}</style>`;
  // frames
  d.frames.forEach((f,fi)=>{const b=f._box;const wdt=d._fr-PAD*2;
    h+=`<rect x="${PAD}" y="${b.top}" width="${wdt}" height="${b.bot-b.top}" rx="14" fill="${b.c}" fill-opacity=".05" stroke="${b.c}" stroke-opacity=".35"/><rect x="${PAD}" y="${b.top}" width="${wdt}" height="${FH-6}" rx="14" fill="${b.c}"/><rect x="${PAD}" y="${b.top+20}" width="${wdt}" height="${FH-26}" fill="${b.c}"/>`;
    {const ts=d.tshift||0;h+=text(PAD+16+ts,b.top+26,[`${fi+1}. ${f.name}`],{fs:15,fw:700,fill:"#fff",a:"start"})+text(PAD+16+ts+f.name.length*9.2+30,b.top+26,[`${f.owner} · ${f.win}`],{fs:11,fill:"#fff",a:"start"});}
    if(f.pp&&f.pp.length)h+=`<g><title>Pain points: ${esc2(f.pp.join(" | "))}</title><circle cx="${PAD+wdt-22}" cy="${b.top+20}" r="9" fill="#fff"/><text x="${PAD+wdt-22}" y="${b.top+24.5}" font-size="12" font-weight="700" fill="var(--pain)" text-anchor="middle">!</text></g>`;
    if(f.ctl&&f.ctl.length)h+=`<g><title>Controls: ${esc2(f.ctl.join(" | "))}</title><circle cx="${PAD+wdt-48}" cy="${b.top+20}" r="9" fill="#fff"/><text x="${PAD+wdt-48}" y="${b.top+24.5}" font-size="11" font-weight="700" fill="${b.c}" text-anchor="middle">C</text></g>`;
  });
  h+=strips;let BT="";(d.frames||[]).forEach(f=>f.procs.forEach(P=>{if(P.back){const A=nodes[`${f.id}|${P.id}|${P.back.from}`],B=nodes[`${f.id}|${P.id}|${P.back.to}`];if(A&&B){const yy=A.y+A.h+16,ax=A.x+A.w/2,bx=B.x+B.w/2+(P.back.dx||0);h+=`<path d="M${ax},${A.y+A.h} L${ax},${yy} L${bx},${yy} L${bx},${B.y+B.h}" class="fl"/>`;BT+=`<path d="M${bx},${B.y+B.h+19} L${bx},${B.y+B.h}" class="fl" marker-end="url(#o1)"/>`}}}));
  // chain between processes and key processes (internal O2C flow)
  (d.chain||[]).forEach((e,i)=>{const A=nodes[e.a],B=nodes[e.b];if(!A||!B)return;const lane=PAD+CH+(i%(d.lanes||4))*(d.lanes?8:11);const col=d.accent;
    const ax=A.x+A.w/2,ay=A.y+A.h,yg=e.below&&A.f&&A.f._box?A.f._box.bot+7+(i%3)*6:A.y+A.h+(e.dy!=null?e.dy:(A.kind==="out"?30:34));
    const by=B.kind==="in"?B.y+B.h/2:B.y;let p;
    if(B.kind==="in"){p=`M${ax},${ay} L${ax},${yg} L${lane},${yg} L${lane},${by} L${B.x},${by}`}
    else{p=`M${ax},${ay} L${ax},${yg} L${lane},${yg} L${lane},${B.y-16} L${B.x+B.w/2-24},${B.y-16} L${B.x+B.w/2-24},${B.y}`}
    h+=`<path d="${p}" fill="none" stroke="${col}" stroke-width="${e.loop?1.5:2.2}" ${e.loop?'stroke-dasharray="6 4"':""} stroke-opacity=".9" marker-end="url(#${e.loop?"o4":"o5"})"/>`;
    if(e.lab){const lw=e.lab.length*5.6+10,lx=e.below?ax-lw-8:ax+8;const ly=yg+(e.ldy||0);h+=`<rect x="${lx}" y="${ly-13}" width="${lw}" height="15" rx="4" fill="var(--card)" fill-opacity=".9"/>`+text(lx+5,ly-2,[e.lab],{fs:9.2,fw:600,fill:col,a:"start"})}
  });
  // same-output link between two processes' outputs
  d.frames.forEach(f=>{const so=f.sameOut;if(!so)return;const A=nodes[`${f.id}|${so.a}|out`],B=nodes[`${f.id}|${so.b}|out`];if(!A||!B)return;const ax=A.x+A.w/2,bx=B.x+B.w/2,ym=B.y-72;
    h+=`<path d="M${ax},${A.y+A.h} L${ax},${ym} L${bx},${ym} L${bx},${B.y}" fill="none" stroke="${d.accent}" stroke-width="1.8" stroke-dasharray="3 4" stroke-linecap="round"/><circle cx="${ax}" cy="${A.y+A.h}" r="3.5" fill="${d.accent}"/><circle cx="${bx}" cy="${B.y}" r="3.5" fill="${d.accent}"/>`;
    if(so.lab){const lw=so.lab.length*5.6+14,lx=Math.min(ax,bx)+Math.abs(bx-ax)/2-lw/2;h+=`<rect x="${lx}" y="${ym-9}" width="${lw}" height="17" rx="8" fill="var(--card)" stroke="${d.accent}" stroke-width="1"/>`+text(lx+lw/2,ym+3,[so.lab],{fs:9.2,fw:600,fill:d.accent})}});
  // edges
  d.frames.forEach(f=>f.procs.forEach(P=>{if(!P._gates)return;const sq=P._seq;for(let i=0;i<sq.length-1;i++){const A=nodes[sq[i]],B=nodes[sq[i+1]];if(!A||!B)continue;if(A.kind==="fork"||A.kind==="split"){A.next=B;continue}const ay=A.kind==="in"?A.y+A.h/2:(A.kind==="dec"?A.y+A.h/2:A.y+H/2);h+=`<path d="M${A.x+A.w},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`}}));
  Object.values(nodes).forEach(n=>{if(n.kind==='in'){if(n.P._gates)return;const B=nodes[`${n.f.id}|${n.P.id}|1`];if(B)h+=`<path d="M${n.x+n.w},${n.y+H/2} L${B.x},${B.y+H/2}" class="fl" marker-end="url(#o1)"/>`;return}if(n.kind||n.fixOf||(n.P&&n.P._gates))return;const P=n.P,j=n.j;const nxt=P.steps[j+1];if(!nxt)return;const B=nodes[`${n.f.id}|${P.id}|${nxt.n}`];const D=nodes[n.id+"|d"];const ay=n.y+H/2;
    if(D){h+=`<path d="M${n.x+W},${ay} L${D.x},${ay}" class="fl" marker-end="url(#o1)"/><path d="M${D.x+DW},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`;}
    else h+=`<path d="M${n.x+W},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`});
  // handoff pills on steps + decisions + nodes
  Object.values(nodes).filter(n=>n.kind==="split").forEach(n=>{const s=n.sp,f=n.f,P=n.P,cy0=n.rowY+H/2;let o="",yEnd=cy0;
    n.rows.forEach((r,bi)=>{const cy=r.by+H/2;const F=nodes[`${f.id}|${P.id}|${r.first.n}`],L=nodes[`${f.id}|${P.id}|${r.last.n}`];
      o+=`<path d="M${n.sx},${cy} L${F.x},${cy}" class="fl" marker-end="url(#o1)"/><path d="M${L.x+W},${cy} L${n.bx},${cy}" class="fl"/>`;yEnd=Math.max(yEnd,cy);
      s.branches[bi].steps.forEach((st,k)=>{const nx=s.branches[bi].steps[k+1];if(!nx)return;const A=nodes[`${f.id}|${P.id}|${st.n}`],B=nodes[`${f.id}|${P.id}|${nx.n}`];o+=`<path d="M${A.x+W},${cy} L${B.x},${cy}" class="fl" marker-end="url(#o1)"/>`});
      if(r.lab){const tl=wrap(r.lab,17,2);o+=`<rect x="${n.sx+8}" y="${cy-14}" width="${112}" height="28" rx="6" fill="var(--card)" fill-opacity=".92"/>`+text(n.sx+64,cy-2+(tl.length>1?-5:3),tl,{fs:9.3,fw:600,fill:"var(--muted)"})}});
    o+=`<path d="M${n.sx},${cy0} L${n.sx},${yEnd}" class="fl" stroke-width="2"/><path d="M${n.bx},${yEnd} L${n.bx},${cy0}" class="fl" stroke-width="2"/>`;
    if(n.next)o+=`<path d="M${n.bx},${cy0} L${n.next.x},${cy0}" class="fl" marker-end="url(#o1)"/>`;
    h+=o});
  Object.values(nodes).filter(n=>n.kind==="fork").forEach(n=>{const s=n.fk,f=n.f,P=n.P,cy0=n.rowY+H/2,cxd=n.dx+DW/2;let o="",yEnd=cy0;
    s.branches.forEach((b,bi)=>{const D=nodes[`${f.id}|${P.id}|${b.step.n}|d`],S=nodes[`${f.id}|${P.id}|${b.step.n}`];const cy=S.y+H/2;
      o+=`<path d="M${D.x+DW},${cy} L${S.x},${cy}" class="fl" marker-end="url(#o1)"/><path d="M${S.x+W},${cy} L${n.bx},${cy}" class="fl"/>`;yEnd=Math.max(yEnd,cy);
      const nxD=s.branches[bi+1]?nodes[`${f.id}|${P.id}|${s.branches[bi+1].step.n}|d`]:null;
      if(nxD)o+=`<path d="M${cxd},${D.y+DW} L${cxd},${nxD.y}" class="fl" marker-end="url(#o1)"/>`+text(cxd+5,D.y+DW+13,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
      else{const ye=S.y+H+30;const OT=s.elseOut?nodes[`${f.id}|${P.id}|out`]:null;o+=(OT?`<path d="M${cxd},${D.y+DW} L${cxd},${ye} L${OT.x+OT.w/2},${ye} L${OT.x+OT.w/2},${OT.y+OT.h}" class="fl" marker-end="url(#o1)"/>`:`<path d="M${cxd},${D.y+DW} L${cxd},${ye} L${n.bx},${ye}" class="fl"/>`)+text(cxd+5,D.y+DW+13,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
        if(s.elseLab){const lw=s.elseLab.length*5.4+8;o+=`<rect x="${cxd+10}" y="${ye-7}" width="${lw}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(cxd+14,ye+3,[s.elseLab],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}if(!OT)yEnd=Math.max(yEnd,ye)}});
    o+=`<path d="M${n.bx},${yEnd} L${n.bx},${cy0}" class="fl"/>`;if(n.next)o+=`<path d="M${n.bx},${cy0} L${n.next.x},${cy0}" class="fl" marker-end="url(#o1)"/>`;
    if(s.lab)o+=text(n.dx+DW/2,n.rowY-6,[s.lab],{fs:10,fw:700,fill:"var(--muted)"});
    h+=o});
  Object.values(nodes).forEach(n=>{
    if(n.kind==="ch"||n.kind==="tpi"||n.kind==="fork"||n.kind==="split")return;
    if(n.kind==="opp"||n.kind==="fopp"){const o=n.opp,fr=n.kind==="opp"?nodes[`${n.f.id}|${n.P.id}|out`]:null;const tl=wrap(o.t,n.kind==="opp"?26:70,n.kind==="opp"?2:1);
      if(fr)h+=`<path d="M${fr.x+fr.w},${fr.y+fr.h/2} L${n.x},${n.y+n.h/2}" fill="none" stroke="#0070c0" stroke-width="1.4" stroke-dasharray="4 3" marker-end="url(#o3)"/>`;
      h+=`<g class="opn ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}"><title>AI Opportunity (${esc2(o.ty)}): ${esc2(o.t)} - ${esc2(o.d)}</title><rect class="b" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="9" fill="#e8f1fb" stroke="#0070c0" stroke-width="1.5"/>
      ${text(n.x+10,n.y+15,[n.kind==="fopp"?`AI Opportunity - ${n.f.name.length>30?n.f.name.slice(0,29)+"…":n.f.name}`:"AI Opportunity"],{fs:10.5,fw:700,fill:"#0070c0",a:"start"})}<rect x="${n.x+n.w-o.ty.length*4.3-18}" y="${n.y+5}" width="${o.ty.length*4.3+10}" height="14" rx="4" fill="#0070c0"/><text x="${n.x+n.w-o.ty.length*2.15-13}" y="${n.y+15}" font-size="7.8" font-weight="700" fill="#fff" text-anchor="middle">${esc2(o.ty)}</text>
      ${text(n.x+10,n.y+31,tl,{fs:10.3,fill:"var(--navy)",a:"start"})}${o.feas?`<rect x="${n.kind==="fopp"?n.x+n.w+8:n.x}" y="${n.kind==="fopp"?n.y+n.h/2-7.5:n.y+n.h+4}" width="${o.feas.length*5.6+16}" height="15" rx="4" fill="${/review/i.test(o.feas)?"#b45309":/applicable/i.test(o.feas)?"#667085":/not/i.test(o.feas)?"var(--pain)":/progress/i.test(o.feas)?"var(--hyb)":"var(--ok)"}"/><text x="${(n.kind==="fopp"?n.x+n.w+8:n.x)+8}" y="${n.kind==="fopp"?n.y+n.h/2+3:n.y+n.h+14.5}" font-size="9" font-weight="700" fill="#fff" text-anchor="start">${esc2(o.feas)}</text>`:""}</g>`;return}
    if(n.kind==="in"){const col=d.accent;h+=`<g><title>${esc2(n.lab)}: ${esc2(n.txt)}</title><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="9" fill="${col}"/>${text(n.x+n.w/2,n.y+15,[n.lab],{fs:9.5,fw:700,fill:"#fff"})}${text(n.x+n.w/2,n.y+31,wrap(n.txt,21,3),{fs:9.4,fill:"#fff"})}</g>`;return}
    if(n.kind==="out"){const fr=nodes[n.from];if(!n.P._gates)h+=`<path d="M${fr.x+fr.w},${fr.y+H/2} L${n.x},${n.y+n.h/2}" class="fl" marker-end="url(#o1)"/>`;h+=`<g><title>Output: ${esc2(n.doc)}${n.P.outnote?" - "+esc2(n.P.outnote):""}</title><path d="M${n.x},${n.y} L${n.x+n.w-12},${n.y} L${n.x+n.w},${n.y+12} L${n.x+n.w},${n.y+n.h} L${n.x},${n.y+n.h}z" fill="#fff7e0" stroke="#d9a400" stroke-width="1.4"/><path d="M${n.x+n.w-12},${n.y} L${n.x+n.w-12},${n.y+12} L${n.x+n.w},${n.y+12}" fill="none" stroke="#d9a400"/>${text(n.x+8,n.y+15,["Output"],{fs:9.5,fw:700,fill:"#8a6d00",a:"start"})}${text(n.x+n.w/2,n.y+30,wrap(n.doc,24,n.doc.length>48?3:2),{fs:9.8,fill:"var(--navy)"})}</g>`;return}
    if(n.kind==="dec"){const cx=n.x+DW/2,cy=n.y+DW/2,q=n.dec;const ql=wrap(q.q,22,2);h+=`<g class="opn ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}"><title>${esc2(q.q)} Yes: ${esc2(q.yes)}. No: ${esc2(q.no)}</title>${n.fork?`<rect x="${cx-(ql[0].length*5.5+8)/2}" y="${n.y-17}" width="${ql[0].length*5.5+8}" height="14" rx="3" fill="var(--card)" fill-opacity=".95"/>`:""}<path class="b" d="M${cx},${n.y} L${n.x+DW},${cy} L${cx},${n.y+DW} L${n.x},${cy}z" fill="#f3ecfa" stroke="#7b3597" stroke-width="1.4"/>${text(cx,n.y-7-(ql.length-1)*11.4,ql,{fs:9.5,fw:600,fill:"#5b2a7a"})}${text(n.x+DW+4,cy-5,[q.swap?"No":"Yes"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}</g>${n.fork?"":n.gate&&q.fix?fixBranch(n):q.nx?noBranch(n):text(cx,n.y+DW+11,wrap("No: "+q.no,26,1),{fs:8.5,fill:"#7b3597"})}`;return}
    const s=n.s,c=TYC[s.ty],ch=s.ch||"same",lines=s.sub&&ch==="same"?wrap(s.t,22,2):wrap(s.t,ch!=="same"?16:(s.t.length>42?23:21),(ch!=="same"||s.t.length>42)?3:2);
    let px=n.x+2;const inl=s.inhide?[]:(s.in||[]);inl.slice(0,2).forEach(x=>{const p=pill(px,n.y-PIN+3,x[0],pc(x[0]),false,`From ${x[0]}: ${x[1]}`);h+=p.h+`<line class="source-step-leader" x1="${px+p.w/2}" y1="${n.y-PIN+20}" x2="${px+p.w/2}" y2="${n.y}" stroke="${pc(x[0])}" stroke-width="1.2"/>`;px+=p.w+4});
    if(inl.length>2){const p=pill(px,n.y-PIN+3,`+${inl.length-2}`,"#667085",false,inl.slice(2).map(x=>`From ${x[0]}: ${x[1]}`).join(" | "));h+=p.h}
    px=n.x+2;const outl=s.out||[];outl.slice(0,2).forEach(x=>{const p=pill(px,n.y+H+7,x[0],pc(x[0]),false,`To ${x[0]}: ${x[1]}`);h+=p.h+`<line class="source-step-leader" x1="${px+p.w/2}" y1="${n.y+H}" x2="${px+p.w/2}" y2="${n.y+H+7}" stroke="${pc(x[0])}" stroke-width="1.2"/>`;px+=p.w+4});if(outl.length>2){const p=pill(px,n.y+H+7,`+${outl.length-2}`,"#667085",false,outl.slice(2).map(x=>`To ${x[0]}: ${x[1]}`).join(" | "));h+=p.h}
    h+=`<g class="nd ty-${s.ty} ${s.pp&&s.pp.length?"has-pp":""} ${(s.ci||TPIS.has(n.id))?"has-tpi":""} ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}" aria-label="${esc2(s.t)}"><title>${esc2(s.t)} - ${TYNM[s.ty]} - ${esc2(s.sys)}</title>
      <rect class="b" x="${n.x}" y="${n.y}" width="${W}" height="${H}" rx="9" fill="${ch==="new"?"#eef5fc":"var(--card)"}" stroke="${c}" stroke-width="2.2" ${ch==="new"?'stroke-dasharray="6 3"':""}/>
      <circle cx="${n.x+14}" cy="${n.y+14}" r="9" fill="${c}"/><text x="${n.x+14}" y="${n.y+17.5}" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">${s.n}</text>
      ${s.sub&&ch==="same"?text(n.x+W/2+8,n.y+15,lines,{fs:10.8,fw:600,fill:"var(--navy)"})+text(n.x+W/2+4,n.y+(lines.length>1?39:30),wrap(s.sub,32,2),{fs:8.4,fw:500,fill:"var(--muted)"}):text(n.x+W/2+(ch!=="same"?-6:8),n.y+(lines.length>1?15:21),lines,{fs:10.8,fw:600,fill:"var(--navy)"})}
      ${text(n.x+9,n.y+H-9,[wrap(s.sys,23,1)[0]],{fs:9.2,fill:"var(--muted)",a:"start"})}
      ${s.pp&&s.pp.length?(d.fixes&&ch!=="same"?`<g><title>Pain point addressed by this change: ${esc2(s.pp.join(" | "))}</title><circle cx="${n.x+W-11}" cy="${n.y+H-11}" r="7" fill="#1f8a4c"/><text x="${n.x+W-11}" y="${n.y+H-7.5}" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">✔</text></g>`:`<circle cx="${n.x+W-11}" cy="${n.y+H-11}" r="7" fill="var(--pain)"/><text x="${n.x+W-11}" y="${n.y+H-7.5}" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">!</text>`):""}
      ${s.cop?`<rect x="${n.x+W-44}" y="${n.y-7}" width="38" height="13" rx="4" fill="#fff" stroke="#0070c0" stroke-dasharray="3 2"/><text x="${n.x+W-25}" y="${n.y+2.5}" font-size="8" font-weight="700" fill="#0070c0" text-anchor="middle">Copilot</text>`:""}${ch!=="same"?`<rect x="${n.x+W-34}" y="${n.y+4}" width="30" height="13" rx="4" fill="var(--prop)"/><text x="${n.x+W-19}" y="${n.y+13.5}" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">${ch==="new"?"NEW":"AI"}</text>`:""}
      ${s.feas?`<rect x="${n.x+(s.feasdx||0)+W/2-Math.max(W,s.feas.length*4.7+14)/2}" y="${n.y+H+(outl.length?27:3)}" width="${Math.max(W,s.feas.length*4.7+14)}" height="14" rx="4" fill="${/review/i.test(s.feas)?"#b45309":/applicable/i.test(s.feas)?"#667085":/not/i.test(s.feas)?"var(--pain)":/progress/i.test(s.feas)?"var(--hyb)":/future/i.test(s.feas)?"#0e7490":"var(--ok)"}"/><text x="${n.x+(s.feasdx||0)+W/2}" y="${n.y+H+(outl.length?37:13)}" font-size="8.3" font-weight="700" fill="#fff" text-anchor="middle">${esc2(s.feas)}</text>${s.feasn?`<text x="${n.x+(s.feasdx||0)+W/2+Math.max(W,s.feas.length*4.7+14)/2+5}" y="${n.y+H+(outl.length?37:13)}" font-size="9.5" font-weight="600" fill="var(--navy)" text-anchor="start">${esc2(s.feasn)}</text>`:""}${s.scope?(()=>{const sl=s.scope.split(" · "),sw=Math.max(W,Math.max(...sl.map(t=>t.length))*4.7+16),sx=n.x+(s.feasdx||0)+W/2,sy=n.y+H+(outl.length?43:19);return `<g><title>${esc2(s.scope)}</title><rect x="${sx-sw/2}" y="${sy}" width="${sw}" height="${sl.length>1?25:14}" rx="4" fill="#fff" stroke="#152847" stroke-width="1.1" stroke-dasharray="3 2"/>${sl.map((t,i)=>`<text x="${sx}" y="${sy+10+i*11}" font-size="${i?8.1:7.6}" font-weight="${i?700:600}" fill="#152847" text-anchor="middle">${esc2(t)}</text>`).join("")}</g>`})():""}`:""}
    </g>`;
  });
  const svg=document.querySelector(E.svg);svg.setAttribute("viewBox",`0 0 ${svgW} ${svgH}`);svg.setAttribute("data-f",filter);svg.innerHTML=h+BT;
  svg.querySelectorAll(".nd,.opn").forEach(g=>{const f=()=>detail(g.dataset.id);g.onclick=f;g.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();f()}}});
}
function detail(id){const n=nodes[id];if(!n)return;sel=id;
  document.querySelector(E.svg).querySelectorAll(".opn").forEach(g=>g.classList.toggle("sel",g.dataset.id===id));
  if(n.kind==="opp"||n.kind==="fopp"){const o=n.opp;document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)}${n.P?" / "+esc2(n.P.name):""}</span><h3 style="color:#0070c0">AI Opportunity: ${esc2(o.t)}</h3><dl><div><dt>Type</dt><dd><b>${esc2(o.ty)}</b></dd></div><div><dt>How it would work and tools</dt><dd class="opl">${esc2(o.d)}</dd></div>${(n.P?n.P.steps.flatMap(s=>s.pp||[]):(n.f.pp||[])).length?`<div><dt style="color:var(--pain)">Pain points it addresses</dt><dd class="ppl">${[...new Set(n.P?n.P.steps.flatMap(s=>s.pp||[]):(n.f.pp||[]))].map(esc2).join("<br>")}</dd></div>`:""}${o.feasc?`<div><dt style="color:var(--ok)">AI feasibility comment</dt><dd>${esc2(o.feasc)}</dd></div>`:""}<div><dt>Source</dt><dd>${esc2(o.rid)} (hypothesis - needs validation with FP&A Ops)</dd></div>${o.feas?`<div><dt>Feasibility</dt><dd><b>${esc2(o.feas)}</b></dd></div>`:""}</dl>`;return}
  if(n.kind==="ch"||n.kind==="tpi"){const c=n.c,ids=(c.steps||[]).map(s=>`${n.f.id}|${s}`);document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.toggle("sel",ids.includes(g.dataset.id)));
    const names=ids.map(i=>nodes[i]).filter(Boolean).map(x=>`<b>${esc2(x.P.name)}</b> · ${esc2(x.s.n)}. ${esc2(x.s.t)}`).join("<br>");
    document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)}</span><h3 style="color:${n.kind==="ch"?"#a00015":"#13643a"}">${n.kind==="ch"?"[CHALLENGE] Pain point":`[SOLUTION] ${esc2(c.st||"TPI")}`}</h3><p style="margin:4px 0 0">${esc2(c.t)}</p><dl>${names?`<div><dt>${n.kind==="ch"?"Where it hits (highlighted on the map)":"Steps it addresses (highlighted on the map)"}</dt><dd>${names}</dd></div>`:""}${c.ref?`<div><dt>Reference</dt><dd>${esc2(c.ref)}</dd></div>`:""}<div><dt>Source</dt><dd>${n.kind==="ch"?"FP&A Ops As-Is map / LT feedback decks (Oct 2026)":(c.src||"FP&A Ops TPI register (TPI_Opportunity_Register_Jun-Sep_2026.xlsx)")}</dd></div></dl>`;return}
  if(n.kind==="dec"){const q=n.dec;document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.remove("sel"));
    const r=(t,v,cls)=>v?`<div><dt>${t}</dt><dd class="${cls||""}">${v}</dd></div>`:"";
    document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f?n.f.name:"")}${n.P?" / "+esc2(n.P.name):""}</span><h3 style="color:#5b2a7a">Decision: ${esc2(q.q)}</h3>${q.d?`<p style="margin:4px 0 0">${esc2(q.d)}</p>`:""}<dl>${r("Example",q.ex?`<i>${esc2(q.ex)}</i>`:"")}${r("Checked by",q.o?esc2(q.o):"")}${r("System",q.sys?esc2(q.sys):"")}<div><dt>If yes</dt><dd>${esc2(q.yes)}</dd></div><div><dt>If no</dt><dd>${esc2(q.no)}</dd></div>${q.pp&&q.pp.length?r('<span style="color:var(--pain)">Pain point when the answer is no</span>',q.pp.map(esc2).join("<br>"),"ppl"):""}${r("Source",q.src?esc2(q.src):"")}</dl>`;return}
  const s=n.s;document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.toggle("sel",g.dataset.id===id));
  const row=(t,v,cls)=>v?`<div><dt>${t}</dt><dd class="${cls||""}">${v}</dd></div>`:"";
  const ownc=o=>o.split(/\s\/\s|,\s*/).map(x=>`<span class="own"><i style="background:${pc(x)}"></i>${esc2(x)}</span>`).join("");
  let html=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)} / ${esc2(n.P.name)} (${esc2(n.P.id)})</span><h3>${s.n}. ${esc2(s.t)}</h3><p style="margin:4px 0 0">${esc2(s.d)}</p><dl>`;
  html+=row("Who",ownc(s.o))+row("System",esc2(s.sys))+row("Activity type",`<b style="color:${TYC[s.ty]}">${TYNM[s.ty]}</b>${page==="tobe"&&s.toty&&s.ch!=="same"?` <small>(As-Is, colour kept on the map)</small><br>If adopted: <b>${TYNM[s.toty]}</b>${s.toty===s.ty?" <small>(same level)</small>":""}`:""}`);
  if(page==="tobe"&&s.ast&&s.ast!==s.t)html+=row("As-Is step",esc2(s.ast));
  if(s.in&&s.in.length)html+=row("Input from",s.in.map(x=>`<b>${esc2(x[0])}</b>: ${esc2(x[1])}`).join("<br>"));
  if(s.out&&s.out.length)html+=row("Output to",s.out.map(x=>`<b>${esc2(x[0])}</b>: ${esc2(x[1])}`).join("<br>"));
  if(s.dec)html+=row("Decision",`<b>${esc2(s.dec.q)}</b><br>Yes &rarr; ${esc2(s.dec.yes)}<br>No &rarr; ${esc2(s.dec.no)}`);
  if(s.ctl)html+=row("Control",esc2(s.ctl));if(s.note)html+=row("LT review",esc2(s.note));if(s.fb)html+=row("Feedback",esc2(s.fb));
  if(s.pp&&s.pp.length)html+=row('<span style="color:var(--pain)">Pain points</span>',s.pp.map(esc2).join("<br>"),"ppl");
  if(s.ci)html+=row("Existing CI / TPI",esc2(s.ci));
  if(page==="tobe"&&s.ch&&s.ch!=="same")html+=row('<span style="color:var(--prop)">AI suggestion (hypothesis, to validate)</span>',`<b>${esc2(s.rec||"")}</b>${s.kind?` <small>· ${esc2(s.kind)}</small>`:""}<br>Tools: ${esc2(s.tools||"")}<br><small>Basis: ${esc2(s.opp||"")}</small>`,"opl");
  if(page==="tobe"&&s.cop)html+=row('<span style="color:#0070c0">Copilot agent option (added hypothesis, to validate)</span>',`<b>${esc2(s.cop.tool)}</b><br>${esc2(s.cop.d)}<br><small>Feasibility: Under review - licensing and governance to be confirmed</small>`,'opl');
if(page==="tobe"&&s.feas&&s.ch!=="same")html+=row("Opportunity scoring",`<b>${esc2(s.feas)}</b>${s.scope?`<br><span style="display:inline-block;margin-top:4px;padding:1px 8px;border:1px dashed #152847;border-radius:4px;font-size:11.5px;font-weight:700;color:#152847">${esc2(s.scope)}</span>`:""}`);
if(s.feasc)html+=row(`<span style="color:var(--ok)">${esc2(s.feasl||"AI enhancement comment")}</span>`,esc2(s.feasc));
  html+=row("Source",esc2(s.src))+`</dl>`;
  if(page==="tobe"&&s.ch==="same")html+=`<p style="font-size:12px;color:var(--muted)">No change proposed for this step.</p>`;
  document.querySelector(E.det).innerHTML=html;
}
function legend(){const d=DATA[page];const sw=(c,dash)=>`<svg width="22" height="12"><line x1="0" y1="6" x2="22" y2="6" stroke="${c}" stroke-width="1.6" ${dash?'stroke-dasharray="4 3"':""}/></svg>`;
  const box=c=>`<svg width="20" height="12"><rect x="1" y="1" width="18" height="10" rx="3" fill="none" stroke="${c}" stroke-width="2"/></svg>`;
  document.querySelector(E.leg).innerHTML=`<span>${box("#d0021b")}Manual</span><span>${box("#e8891c")}Semi-automated</span><span>${box("#2f6fce")}Automated</span><span><svg width="14" height="14"><circle cx="7" cy="7" r="6.5" fill="#c8102e"/><text x="7" y="10.5" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">!</text></svg>Pain point</span><span><svg width="14" height="14"><path d="M7,1L13,7L7,13L1,7z" fill="#f3ecfa" stroke="#7b3597"/></svg>Decision</span><span>${sw("var(--navy)")}Flow</span><span>${sw(d.accent)}Chain between processes</span><span>${sw(d.accent,1)}Loop back</span>${d.frames.some(f=>f.ch&&f.ch.length)?`<span><svg width="22" height="12"><rect x="1" y="1" width="20" height="10" rx="3" fill="#fdecec" stroke="var(--pain)"/></svg>[CHALLENGE] pain point</span><span><svg width="22" height="12"><rect x="1" y="1" width="20" height="10" rx="3" fill="#e6f4ec" stroke="var(--ok)"/></svg>[SOLUTION] TPI / CI</span><span>${sw(d.accent,1)}Same output</span>`:""}${d.frames.some(f=>f.procs.some(p=>p.steps.some(s=>s.gate&&s.fix&&!s.noRetry)))?`<span>${sw("var(--navy)",1)}Retry after the fix</span>`:""}${d.frames.some(f=>f.procs.some(p=>p.steps.some(s=>s.dec&&s.dec.nx&&s.dec.nx.end)))?`<span><svg width="26" height="14"><rect x="1" y="1" width="24" height="12" rx="6" fill="#fdecec" stroke="#d0021b" stroke-width="1.3"/></svg>End of the flow (reject / hold)</span>`:""}<span><svg width="34" height="14"><rect width="34" height="14" rx="4" fill="${d.accent}"/><text x="17" y="10.5" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">Input</text></svg>Trigger / input</span><span><svg width="18" height="14"><path d="M1,1 L12,1 L17,6 L17,13 L1,13z" fill="#fff7e0" stroke="#d9a400"/></svg>Output</span>${page==="tobe"?`<span><svg width="70" height="16"><rect x="1" y="1" width="68" height="14" rx="7" fill="none" stroke="#0070c0" stroke-width="1.3" stroke-dasharray="3 2"/><text x="35" y="11.5" font-size="9" font-weight="700" fill="#0070c0" text-anchor="middle">AI: Tower</text></svg>AI-suggested dependency</span><span><svg width="60" height="16"><rect x="1" y="1" width="58" height="14" rx="4" fill="#e8f1fb" stroke="#0070c0"/><text x="30" y="11.5" font-size="8.5" font-weight="700" fill="#0070c0" text-anchor="middle">AI Opportunity</text></svg>AI opportunity (register)</span><span><svg width="30" height="13"><rect width="30" height="13" rx="4" fill="#0070c0"/><text x="15" y="10" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">AI</text></svg>Step changed (AI suggested)</span><span><svg width="30" height="13"><rect width="30" height="13" rx="4" fill="#0070c0"/><text x="15" y="10" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">NEW</text></svg>New step</span>`:""}<span><svg width="30" height="14"><rect x="1" y="1" width="28" height="12" rx="4" fill="none" stroke="#9aa3b2" stroke-dasharray="3 2"/></svg>Upstream dependency handoffs into a step</span><span>Pills = input from / output to; strips = upstream / downstream</span>`;}
function setScale(s){scale=Math.max(.3,Math.min(2,s));const svg=document.querySelector(E.svg);svg.style.width=svgW*scale+"px";svg.style.height=svgH*scale+"px"}
function fit(){const w=document.querySelector(E.scroll).clientWidth-10;setScale(Math.min(1,w/svgW))}
function render(pg,fl){if(pg)page=pg;if(fl)filter=fl;sel=null;draw();legend();document.querySelector(E.det).innerHTML='<p class="none">Select a step in the map to see what happens, who does it, the system, inputs, outputs, decisions, pain points and the source.</p>';fit()}
function setFilter(f){filter=f;document.querySelector(E.svg).setAttribute("data-f",f)}
return {getNodes:()=>nodes,getDimensions:()=>({width:svgW,height:svgH}),render,setFilter,zi:()=>setScale(scale+.15),zo:()=>setScale(scale-.15),fit,page:()=>page,setScale,getScale:()=>scale};
};
window.TowerRenderers["CAPEX"]=function makeTowerMap(KEY,DATA,E){
const TPIS=new Set();Object.values(DATA).forEach(dd=>dd&&dd.frames&&dd.frames.forEach(f=>(f.tpi||[]).forEach(t=>(t.steps||[]).forEach(r=>TPIS.add(f.id+"|"+r)))));
const W=158,H=74,G=46,DW=34,PAD=24,FH=E.frameHeaderHeight||46,ROWL=E.processHeaderGap||22,PIN=E.processInputGap||24,POUT=24,RGAP=44,STRIP=E.handoffStripHeight||30,INW=118,CH=14;
const TYC={man:"#d0021b",auto:"#2f6fce",hyb:"#e8891c"},TYNM={man:"Manual",hyb:"Semi-automated",auto:"Automated"};
const esc2=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function wrap(t,n,max){const w=String(t).split(" ");const L=[];let c="";w.forEach(x=>{if((c+" "+x).trim().length>n){if(c)L.push(c);c=x}else c=(c+" "+x).trim()});if(c)L.push(c);max=max||2;if(L.length>max){L[max-1]=L.slice(max-1).join(" ");if(L[max-1].length>n+2)L[max-1]=L[max-1].slice(0,n)+"…";L.length=max}return L}
function text(x,y,lines,o={}){return `<text x="${x}" y="${y}" font-size="${o.fs||11.5}" font-weight="${o.fw||500}" fill="${o.fill||"var(--ink)"}" text-anchor="${o.a||"middle"}" font-family="Inter,Segoe UI,Arial,sans-serif">${lines.map((l,i)=>`<tspan x="${x}" dy="${i?1.2:0}em">${esc2(l)}</tspan>`).join("")}</text>`}
let page="asis",filter="all",nodes={},svgW=0,svgH=0,scale=1,sel=null;
const pc=p=>{const k=String(p).split(/[ -]/)[0];return ({O2C:"var(--O2C)",R2R:"var(--R2R)",TAX:"var(--Tax)",Tax:"var(--Tax)",P2P:"var(--P2P)",CAPEX:"var(--CAPEX)",Controlling:"var(--Controlling)",Local:"var(--LocalFinance)",IT:"#667085",Capital:"#1d4ed8",Licensed:"#4b2a86",Report:"#4b2a86",FPAC:"var(--FPA)",FPAO:"var(--FPA)",DMT:"#0e7490",Customer:"#8a6d3b",Distributors:"#8a6d3b",Distribution:"#0f766e",Bank:"#475467",Payroll:"#b7791f",Local:"#b7791f",FP:"var(--FPA)",HR:"#9d174d",International:"#152847",Area:"#152847",Group:"#152847",MC:"#b7791f",BUD:"#b7791f",BUDs:"#b7791f",Brand:"#b7791f",Cost:"#b7791f",Business:"#b7791f",CFO:"#7b3597",CP:"#7b3597",CBP:"#c77a0a",Embedded:"#c77a0a",SAP:"#667085",CMR:"#667085",PMR:"#667085",AZ:"#667085",AZForce:"#667085",Enpire:"#667085",OneGRC:"#475467",Approver:"#7b3597",Market:"#b7791f",Posting:"var(--R2R)",FBPs:"#c77a0a",Planning:"#667085","P&MR":"#667085"})[k]||(String(p).startsWith("FP&A")?"var(--FPA)":"#667085")};
function pill(x,y,label,c,dash,title,anchorLeft){const w=label.length*6.2+16;return {w,h:`<g class="source-pill"><title>${esc2(title||label)}</title><rect x="${x}" y="${y}" width="${w}" height="17" rx="8.5" fill="var(--card)" stroke="${c}" stroke-width="1.3" ${dash?'stroke-dasharray="3 2"':""}/>${text(x+w/2,y+12,[label],{fs:10,fw:600,fill:c})}</g>`}}
function layout(d){
  nodes={};let h="",y=PAD+10,maxX=0;const x0=PAD+(d.chan||60);
  // phase chevrons (processes grouped by key process)
  {const raw=d.frames.flatMap(f=>f.procs.map(p=>({p,f})));const procs=[];raw.forEach(it=>{const k=it.p.phase||it.p.name;const L=procs[procs.length-1];if(L&&L.k===k&&L.f===it.f){L.ids.push(it.p.id)}else procs.push({k,f:it.f,p:it.p,ids:[it.p.id]})});const cw=procs.length<=3?230:150,ch=40;let cx=x0;
   h+=text(x0,y+12,["Process phases"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});y+=18;
   procs.forEach(({p,f},i)=>{const fi=d.frames.indexOf(f);const col=d.accent;const op=.55+.15*(fi%3);
     h+=`<g><title>${esc2(f.name)} / ${esc2(p.phase||p.name)} (${esc2(procs[i].ids.join(", "))})</title><path d="M${cx},${y} L${cx+cw-14},${y} L${cx+cw},${y+ch/2} L${cx+cw-14},${y+ch} L${cx},${y+ch} L${cx+14},${y+ch/2}z" fill="${col}" fill-opacity="${op}"/>${text(cx+cw/2+4,y+ch/2+4,wrap(`${i+1}. ${p.phase||p.name}`,cw>200?32:20,1),{fs:10.5,fw:700,fill:"#fff"})}</g>`;cx+=cw+4});
   maxX=Math.max(maxX,cx);y+=ch+22;}
  d.frames.forEach((f,fi)=>{
    const top=y;const c=d.accent;
    y+=FH;
    // upstream strip
    let px=x0+8;const upY=y+4;if(f.up.length){h+=text(x0,upY+12,["Upstream"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});px+=66;}
    f.up.forEach(u=>{const p=pill(px,upY,(u.c?"AI: ":"")+u.p,u.c?"var(--prop)":pc(u.p),!!u.c,`${u.c?"AI SUGGESTED - ":""}${u.p}: ${u.w} (${u.src})`);h+=p.h;px+=p.w+6});
    maxX=Math.max(maxX,px);y+=STRIP;
    f.procs.forEach((P,pi)=>{
      y+=ROWL;const rowY=y+PIN;let x=x0;const items=[];
      nodes[`${f.id}|${P.id}|in`]={id:`${f.id}|${P.id}|in`,x,y:rowY,w:INW,h:H,kind:"in",lab:P.inbox[0],txt:P.inbox[1],f,P};x+=INW+G-12;
      P._headingY=y;h+=`<g class="source-process-heading">`;h+=text(x0,y-4,[`${P.name}`],{fs:12,fw:700,fill:"var(--navy)",a:"start"});h+=text(x0+P.name.length*7.2+10,y-4,[`${P.id} · ${P.owner}`],{fs:10.5,fill:"var(--muted)",a:"start"});h+=`</g>`;
      const seq=[`${f.id}|${P.id}|in`];let fext=0;P._rb=rowY+H;P._gates=false;
      P.steps.forEach((s,j)=>{
        if(s.gate){P._gates=true;x+=60;const gid=`${f.id}|${P.id}|${s.n}`;nodes[gid]={id:gid,x,y:rowY+H/2-DW/2,w:DW,h:DW,kind:"dec",gate:true,dec:s,f,P,j,ln:P.steps.slice(j+1).filter(q=>q.gate&&q.nx&&!q.nx.end).length};seq.push(gid);
          if(s.fix){const fs=s.fix,fid=`${f.id}|${P.id}|${fs.n}`;nodes[fid]={id:fid,x:x+DW/2-W/2,y:rowY+H+56,w:W,h:H,s:fs,f,P,j,fixOf:gid};fext=56+H+4;P._rb=rowY+H+fext-4}
          x+=DW+G+76;return}
        if(s.fork){P._gates=true;const BG=56,nb=s.branches.length;x+=30;const dx=x,sx=dx+DW+G+40,bx=sx+W+30;
          s.branches.forEach((b,bi)=>{const by=rowY+bi*(H+BG);const nq=s.branches[bi+1];const did=`${f.id}|${P.id}|${b.step.n}|d`;
            nodes[did]={id:did,x:dx,y:by+H/2-DW/2,w:DW,h:DW,kind:"dec",fork:true,f,P,dec:{q:b.q,ex:b.ex,o:b.o,d:b.d,src:b.src,yes:`Step ${b.step.n} - ${b.step.t}`,no:nq?`Check: ${nq.q}`:(s.elseLab||"No")+" - release"}};
            const sid=`${f.id}|${P.id}|${b.step.n}`;nodes[sid]={id:sid,x:sx,y:by,w:W,h:H,s:b.step,f,P,j,br:true}});
          const fid=`${f.id}|${P.id}|fork${j}`;nodes[fid]={id:fid,kind:"fork",fk:s,f,P,x:dx,w:bx-dx,dx,sx,bx,rowY};seq.push(fid);
          fext=Math.max(fext,(nb-1)*(H+BG)+34);P._rb=Math.max(P._rb,rowY+H+(nb-1)*(H+BG)+30);x=bx+40;return}
        const id=`${f.id}|${P.id}|${s.n}`;nodes[id]={id,x,y:rowY,w:W,h:H,s,f,P,j};items.push(id);seq.push(id);x+=W+G;
        if(s.dec){x+=30;nodes[id+"|d"]={id:id+"|d",x:x,y:rowY+H/2-DW/2,w:DW,h:DW,dec:s.dec,kind:"dec",step:s,f,P,ln:P.steps.slice(j+1).filter(q=>q.dec&&q.dec.nx&&!q.dec.nx.end).length};x+=DW+G+40}});
      P._seq=seq;
      if(P.outdoc){x+=14;nodes[`${f.id}|${P.id}|out`]={id:`${f.id}|${P.id}|out`,x,y:rowY+8,w:150,h:H-16,kind:"out",doc:P.outdoc,f,P,from:P._gates?seq[seq.length-1]:items[items.length-1]};seq.push(`${f.id}|${P.id}|out`);x+=150+G}
      if(d.key==="tobe"&&P.opp){x+=6;nodes[`${f.id}|${P.id}|opp`]={id:`${f.id}|${P.id}|opp`,x,y:rowY-6,w:190,h:H+12,kind:"opp",opp:P.opp,f,P,from:items[items.length-1]};x+=210}
      maxX=Math.max(maxX,x);
      y=rowY+H+POUT+RGAP+fext+(P.steps.some(s=>s.dec&&s.dec.nx)?30:0);
    });
    if(d.key==="tobe"&&f.opp){nodes[`${f.id}|opp`]={id:`${f.id}|opp`,x:x0,y:y-18,w:460,h:44,kind:"fopp",opp:f.opp,f};y+=56}
    // challenge / TPI strips
    if((f.ch&&f.ch.length)||(f.tpi&&f.tpi.length)){y+=4;
      const strip=(items,kind,lab,fill,stroke,col,bw)=>{h+=text(x0,y+12,[lab],{fs:10.5,fw:700,fill:col,a:"start"});y+=20;let bx=x0;
        items.forEach((c,i)=>{if(i&&i%4===0){bx=x0;y+=58}const id=`${f.id}|${kind}${i}`;const head=kind==="ch"?"[CHALLENGE]":`[SOLUTION] ${c.st||"TPI"}`;const tl=wrap(c.t,Math.floor(bw/5.6),2);nodes[id]={id,kind,c,f,x:bx,y,w:bw,h:50};
          h+=`<g class="opn ${sel===id?"sel":""}" tabindex="0" role="button" data-id="${id}"><title>${esc2(head)}: ${esc2(c.t)}${c.ref?" - "+esc2(c.ref):""}</title><rect class="b" x="${bx}" y="${y}" width="${bw}" height="50" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>${text(bx+10,y+14,[head],{fs:9.5,fw:700,fill:col,a:"start"})}${c.ref?text(bx+bw-8,y+14,[c.ref],{fs:8.8,fill:col,a:"end"}):""}${text(bx+10,y+29,tl,{fs:9.8,fill:"var(--navy)",a:"start"})}</g>`;bx+=bw+12});
        maxX=Math.max(maxX,bx);y+=50+14};
      if(f.ch&&f.ch.length)strip(f.ch,"ch","Pain points (register)","#fdecec","var(--pain)","#a00015",330);
      if(f.tpi&&f.tpi.length)strip(f.tpi,"tpi","TPI / CI initiatives (register)","#e6f4ec","var(--ok)","#13643a",430);
    }
    // downstream strip
    px=x0+8;const dnY=y-10;if(f.down.length){h+=text(x0,dnY+12,["Downstream"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});px+=78;}
    f.down.forEach(u=>{const p=pill(px,dnY,(u.c?"AI: ":"")+u.p,u.c?"var(--prop)":pc(u.p),!!u.c,`${u.c?"AI SUGGESTED - ":""}${u.p}: ${u.w} (${u.src})`);h+=p.h;px+=p.w+6});
    maxX=Math.max(maxX,px);y+=STRIP+6;
    f._box={top,bot:y,c};y+=26;
  });
  const FR=Math.max(maxX+40,1180);d._fr=FR;svgW=FR;svgH=y+PAD;
  return h;
}
function noBranch(n){const q=n.dec,nx=q.nx,cx=n.x+DW/2,by=n.y+DW,rowY=n.y-(H/2-DW/2),rb=n.P&&n.P._rb?n.P._rb:rowY+H;let o="";if(nx.none)return nx.nl?text(cx+5,by+13,[nx.nl],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"}):"";
  if(nx.end){const hold=nx.kind==="hold",w=Math.max(96,nx.end.length*6.4+22),ty=(n.gate&&rb>rowY+H)?rowY+H+56+H/2-13:rb+34;o+=`<path d="M${cx},${by} L${cx},${ty}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+13,[q.swap?"Yes":"No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})+`<g><title>${esc2(q.q)} No: ${esc2(q.no)}</title><rect x="${cx-w/2}" y="${ty}" width="${w}" height="26" rx="13" fill="${hold?"#fff4e0":"#fdecec"}" stroke="${hold?"#e8891c":"#d0021b"}" stroke-width="1.5"/>${text(cx,ty+17,[nx.end],{fs:9.8,fw:700,fill:hold?"#8a4b00":"#a00015"})}</g>`;return o}
  const T=nx.out?nodes[`${n.f.id}|${n.P.id}|out`]:nodes[`${n.f.id}|${n.P.id}|${nx.step}`];if(!T)return text(cx,n.y+DW+11,wrap("No: "+q.no,26,1),{fs:8.5,fill:"#7b3597"});
  const yb=rb+40+(n.ln||0)*12,ex=nx.out?T.x+T.w/2:T.x+T.w-16,ty=T.y+T.h;
  o+=`<path d="M${cx},${by} L${cx},${yb} L${ex},${yb} L${ex},${ty}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+13,[q.swap?"Yes":"No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
  const nl=q.nl||nx.nl;if(nl){const lw=nl.length*5.4+8;o+=`<rect x="${cx+10}" y="${yb-7}" width="${lw}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(cx+14,yb+3,[nl],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}
  return o}
function fixBranch(n){const q=n.dec,F=nodes[`${n.f.id}|${n.P.id}|${q.fix.n}`];if(!F)return "";const cx=n.x+DW/2,by=n.y+DW,rowY=n.y-(H/2-DW/2),ym=rowY+H+18,ex=F.x+W+16,rx=F.x-16,cy=rowY+H/2;let o="";
  o+=`<path d="M${cx},${by} L${cx},${ym} L${ex},${ym} L${ex},${F.y+H/2} L${F.x+W},${F.y+H/2}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+12,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
  const S1=nodes[`${n.f.id}|${n.P.id}|1`];
  if(n.P.id==="SOC-01.1"){const S2=nodes[`${n.f.id}|${n.P.id}|1`];if(S2){const k=["1a","1b","1c"].indexOf(q.fix.n),yy=F.y+H+22+k*9,tx=S2.x+30+k*14,fx=F.x+W/2;o+=`<path d="M${fx},${F.y+H} L${fx},${yy} L${tx},${yy} L${tx},${S2.y+H}" class="fl" marker-end="url(#o1)"/>`}}else if(S1&&false){const k=["1a","1b","1c"].indexOf(q.fix.n),by=F.y+H+18+k*10,sx=S1.x+30+k*12,fx=F.x+W/2;o+=`<path d="M${fx},${F.y+H} L${fx},${by} L${sx},${by} L${sx},${S1.y+H}" class="fl" stroke-dasharray="5 3" marker-end="url(#o1)"/>`;
  if(k===0)o+=`<rect x="${sx+8}" y="${by-7}" width="${"Retry from step 1".length*5+6}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(sx+11,by+3,["Retry from step 1"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}
  else if(!q.noRetry){o+=`<path d="M${F.x},${F.y+H/2} L${rx},${F.y+H/2} L${rx},${cy} L${n.x},${cy}" class="fl" stroke-dasharray="5 3" marker-end="url(#o1)"/>`;
  const ly=(F.y+H/2+cy)/2;o+=`<rect x="${rx-34}" y="${ly-7}" width="31" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(rx-4,ly+3,["Retry"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"end"});
  }
  if(n.P.id==="SOC-05.1"){const O=nodes[`${n.f.id}|${n.P.id}|out`],S3=nodes[`${n.f.id}|${n.P.id}|3`],fx=F.x+W/2;if(O){const tx=O.x+O.w/2,jy=F.y+H+30;o+=`<path d="M${fx+12},${F.y+H} L${fx+12},${jy} L${tx},${jy} L${tx},${O.y+O.h}" class="fl" marker-end="url(#o1)"/>`}if(S3){const tx=S3.x+W-10,jy=F.y+H+16;o+=`<path d="M${fx-12},${F.y+H} L${fx-12},${jy} L${tx},${jy} L${tx},${S3.y+H}" class="fl" marker-end="url(#o1)"/>`}}else if(q.fix.join){const sq=n.P._seq||[],J=q.fix.join==="out"?nodes[`${n.f.id}|${n.P.id}|out`]:nodes[sq[sq.indexOf(n.id)+2]];if(J){const jx=F.x+W/2,jy=F.y+H+34,tx=J.x+J.w/2;if(J.kind==="dec"){const cyy=J.y+J.h/2,mx=J.x-14;o+=`<path d="M${jx},${F.y+H} L${jx},${jy} L${mx},${jy} L${mx},${cyy} L${J.x},${cyy}" class="fl" marker-end="url(#o1)"/>`}else o+=`<path d="M${jx},${F.y+H} L${jx},${jy} L${tx},${jy} L${tx},${J.y+J.h}" class="fl" marker-end="url(#o1)"/>`}}
  return o}
function draw(){
  const d=DATA[page];const strips=layout(d);let h=`<defs><marker id="o1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--navy)"/></marker><marker id="o2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#7b3597"/></marker><marker id="o3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#0070c0"/></marker><marker id="o4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="${d.accent}"/></marker><marker id="o5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0L10,5L0,10z" fill="${d.accent}"/></marker></defs>
  <style>.fl{fill:none;stroke:var(--navy);stroke-width:1.6}.rw{fill:none;stroke:#7b3597;stroke-width:1.4;stroke-dasharray:5 4}svg[data-f="man"] .nd:not(.ty-man),svg[data-f="hyb"] .nd:not(.ty-hyb),svg[data-f="auto"] .nd:not(.ty-auto),svg[data-f="pp"] .nd:not(.has-pp),svg[data-f="tpi"] .nd:not(.has-tpi){opacity:.14}svg[data-f="tpi"] .nd.has-tpi rect.b{stroke:#13643a;stroke-width:4;filter:drop-shadow(0 0 5px rgba(19,100,58,.55))}.opn{cursor:pointer}.opn:hover rect.b,.opn.sel rect.b{stroke-width:2.4}</style>`;
  // frames
  d.frames.forEach((f,fi)=>{const b=f._box;const wdt=d._fr-PAD*2;
    h+=`<rect x="${PAD}" y="${b.top}" width="${wdt}" height="${b.bot-b.top}" rx="14" fill="${b.c}" fill-opacity=".05" stroke="${b.c}" stroke-opacity=".35"/><rect x="${PAD}" y="${b.top}" width="${wdt}" height="${FH-6}" rx="14" fill="${b.c}"/><rect x="${PAD}" y="${b.top+20}" width="${wdt}" height="${FH-26}" fill="${b.c}"/>`;
    {const ts=d.tshift||0;h+=text(PAD+16+ts,b.top+26,[`${fi+1}. ${f.name}`],{fs:15,fw:700,fill:"#fff",a:"start"})+text(PAD+16+ts+f.name.length*9.2+30,b.top+26,[`${f.owner} · ${f.win}`],{fs:11,fill:"#fff",a:"start"});}
    if(f.pp&&f.pp.length)h+=`<g><title>Pain points: ${esc2(f.pp.join(" | "))}</title><circle cx="${PAD+wdt-22}" cy="${b.top+20}" r="9" fill="#fff"/><text x="${PAD+wdt-22}" y="${b.top+24.5}" font-size="12" font-weight="700" fill="var(--pain)" text-anchor="middle">!</text></g>`;
    if(f.ctl&&f.ctl.length)h+=`<g><title>Controls: ${esc2(f.ctl.join(" | "))}</title><circle cx="${PAD+wdt-48}" cy="${b.top+20}" r="9" fill="#fff"/><text x="${PAD+wdt-48}" y="${b.top+24.5}" font-size="11" font-weight="700" fill="${b.c}" text-anchor="middle">C</text></g>`;
  });
  h+=strips;let BT="";(d.frames||[]).forEach(f=>f.procs.forEach(P=>{if(P.back){const A=nodes[`${f.id}|${P.id}|${P.back.from}`],B=nodes[`${f.id}|${P.id}|${P.back.to}`];if(A&&B){const yy=A.y+A.h+16,ax=A.x+A.w/2,bx=B.x+B.w/2+(P.back.dx||0);h+=`<path d="M${ax},${A.y+A.h} L${ax},${yy} L${bx},${yy} L${bx},${B.y+B.h}" class="fl"/>`;BT+=`<path d="M${bx},${B.y+B.h+19} L${bx},${B.y+B.h}" class="fl" marker-end="url(#o1)"/>`}}}));
  // chain between processes and key processes (internal O2C flow)
  (d.chain||[]).forEach((e,i)=>{const A=nodes[e.a],B=nodes[e.b];if(!A||!B)return;const lane=PAD+CH+(i%(d.lanes||4))*(d.lanes?8:11);const col=d.accent;
    const ax=A.x+A.w/2,ay=A.y+A.h,yg=e.below&&A.f&&A.f._box?A.f._box.bot+7+(i%3)*6:A.y+A.h+(e.dy!=null?e.dy:(A.kind==="out"?30:34));
    const by=B.kind==="in"?B.y+B.h/2:B.y;let p;
    if(B.kind==="in"){p=`M${ax},${ay} L${ax},${yg} L${lane},${yg} L${lane},${by} L${B.x},${by}`}
    else{p=`M${ax},${ay} L${ax},${yg} L${lane},${yg} L${lane},${B.y-16} L${B.x+B.w/2-24},${B.y-16} L${B.x+B.w/2-24},${B.y}`}
    h+=`<path d="${p}" fill="none" stroke="${col}" stroke-width="${e.loop?1.5:2.2}" ${e.loop?'stroke-dasharray="6 4"':""} stroke-opacity=".9" marker-end="url(#${e.loop?"o4":"o5"})"/>`;
    if(e.lab){const lw=e.lab.length*5.6+10,lx=e.below?ax-lw-8:ax+8;const ly=yg+(e.ldy||0);h+=`<rect x="${lx}" y="${ly-13}" width="${lw}" height="15" rx="4" fill="var(--card)" fill-opacity=".9"/>`+text(lx+5,ly-2,[e.lab],{fs:9.2,fw:600,fill:col,a:"start"})}
  });
  // same-output link between two processes' outputs
  d.frames.forEach(f=>{const so=f.sameOut;if(!so)return;const A=nodes[`${f.id}|${so.a}|out`],B=nodes[`${f.id}|${so.b}|out`];if(!A||!B)return;const ax=A.x+A.w/2,bx=B.x+B.w/2,ym=B.y-72;
    h+=`<path d="M${ax},${A.y+A.h} L${ax},${ym} L${bx},${ym} L${bx},${B.y}" fill="none" stroke="${d.accent}" stroke-width="1.8" stroke-dasharray="3 4" stroke-linecap="round"/><circle cx="${ax}" cy="${A.y+A.h}" r="3.5" fill="${d.accent}"/><circle cx="${bx}" cy="${B.y}" r="3.5" fill="${d.accent}"/>`;
    if(so.lab){const lw=so.lab.length*5.6+14,lx=Math.min(ax,bx)+Math.abs(bx-ax)/2-lw/2;h+=`<rect x="${lx}" y="${ym-9}" width="${lw}" height="17" rx="8" fill="var(--card)" stroke="${d.accent}" stroke-width="1"/>`+text(lx+lw/2,ym+3,[so.lab],{fs:9.2,fw:600,fill:d.accent})}});
  // edges
  d.frames.forEach(f=>f.procs.forEach(P=>{if(!P._gates)return;const sq=P._seq;for(let i=0;i<sq.length-1;i++){const A=nodes[sq[i]],B=nodes[sq[i+1]];if(!A||!B)continue;if(A.kind==="fork"){A.next=B;continue}const ay=A.kind==="in"?A.y+A.h/2:(A.kind==="dec"?A.y+A.h/2:A.y+H/2);h+=`<path d="M${A.x+A.w},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`}}));
  Object.values(nodes).forEach(n=>{if(n.kind==='in'){if(n.P._gates)return;const B=nodes[`${n.f.id}|${n.P.id}|1`];if(B)h+=`<path d="M${n.x+n.w},${n.y+H/2} L${B.x},${B.y+H/2}" class="fl" marker-end="url(#o1)"/>`;return}if(n.kind||n.fixOf||(n.P&&n.P._gates))return;const P=n.P,j=n.j;const nxt=P.steps[j+1];if(!nxt)return;const B=nodes[`${n.f.id}|${P.id}|${nxt.n}`];const D=nodes[n.id+"|d"];const ay=n.y+H/2;
    if(D){h+=`<path d="M${n.x+W},${ay} L${D.x},${ay}" class="fl" marker-end="url(#o1)"/><path d="M${D.x+DW},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`;}
    else h+=`<path d="M${n.x+W},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`});
  // handoff pills on steps + decisions + nodes
  Object.values(nodes).filter(n=>n.kind==="fork").forEach(n=>{const s=n.fk,f=n.f,P=n.P,cy0=n.rowY+H/2,cxd=n.dx+DW/2;let o="",yEnd=cy0;
    s.branches.forEach((b,bi)=>{const D=nodes[`${f.id}|${P.id}|${b.step.n}|d`],S=nodes[`${f.id}|${P.id}|${b.step.n}`];const cy=S.y+H/2;
      o+=`<path d="M${D.x+DW},${cy} L${S.x},${cy}" class="fl" marker-end="url(#o1)"/><path d="M${S.x+W},${cy} L${n.bx},${cy}" class="fl"/>`;yEnd=Math.max(yEnd,cy);
      const nxD=s.branches[bi+1]?nodes[`${f.id}|${P.id}|${s.branches[bi+1].step.n}|d`]:null;
      if(nxD)o+=`<path d="M${cxd},${D.y+DW} L${cxd},${nxD.y}" class="fl" marker-end="url(#o1)"/>`+text(cxd+5,D.y+DW+13,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
      else{const ye=S.y+H+30;const OT=s.elseOut?nodes[`${f.id}|${P.id}|out`]:null;o+=(OT?`<path d="M${cxd},${D.y+DW} L${cxd},${ye} L${OT.x+OT.w/2},${ye} L${OT.x+OT.w/2},${OT.y+OT.h}" class="fl" marker-end="url(#o1)"/>`:`<path d="M${cxd},${D.y+DW} L${cxd},${ye} L${n.bx},${ye}" class="fl"/>`)+text(cxd+5,D.y+DW+13,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
        if(s.elseLab){const lw=s.elseLab.length*5.4+8;o+=`<rect x="${cxd+10}" y="${ye-7}" width="${lw}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(cxd+14,ye+3,[s.elseLab],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}if(!OT)yEnd=Math.max(yEnd,ye)}});
    o+=`<path d="M${n.bx},${yEnd} L${n.bx},${cy0}" class="fl"/>`;if(n.next)o+=`<path d="M${n.bx},${cy0} L${n.next.x},${cy0}" class="fl" marker-end="url(#o1)"/>`;
    if(s.lab)o+=text(n.dx+DW/2,n.rowY-6,[s.lab],{fs:10,fw:700,fill:"var(--muted)"});
    h+=o});
  Object.values(nodes).forEach(n=>{
    if(n.kind==="ch"||n.kind==="tpi"||n.kind==="fork")return;
    if(n.kind==="opp"||n.kind==="fopp"){const o=n.opp,fr=n.kind==="opp"?nodes[`${n.f.id}|${n.P.id}|out`]:null;const tl=wrap(o.t,n.kind==="opp"?26:70,n.kind==="opp"?2:1);
      if(fr)h+=`<path d="M${fr.x+fr.w},${fr.y+fr.h/2} L${n.x},${n.y+n.h/2}" fill="none" stroke="#0070c0" stroke-width="1.4" stroke-dasharray="4 3" marker-end="url(#o3)"/>`;
      h+=`<g class="opn ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}"><title>AI Opportunity (${esc2(o.ty)}): ${esc2(o.t)} - ${esc2(o.d)}</title><rect class="b" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="9" fill="#e8f1fb" stroke="#0070c0" stroke-width="1.5"/>
      ${text(n.x+10,n.y+15,[n.kind==="fopp"?`AI Opportunity - ${n.f.name.length>30?n.f.name.slice(0,29)+"…":n.f.name}`:"AI Opportunity"],{fs:10.5,fw:700,fill:"#0070c0",a:"start"})}<rect x="${n.x+n.w-96}" y="${n.y+5}" width="90" height="14" rx="4" fill="#0070c0"/><text x="${n.x+n.w-51}" y="${n.y+15}" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">${esc2(o.ty)}</text>
      ${text(n.x+10,n.y+31,tl,{fs:10.3,fill:"var(--navy)",a:"start"})}${o.feas?`<rect x="${n.kind==="fopp"?n.x+n.w+8:n.x}" y="${n.kind==="fopp"?n.y+n.h/2-7.5:n.y+n.h+4}" width="${o.feas.length*5.6+16}" height="15" rx="4" fill="${/review/i.test(o.feas)?"#b45309":/applicable/i.test(o.feas)?"#667085":/not/i.test(o.feas)?"var(--pain)":/progress/i.test(o.feas)?"var(--hyb)":"var(--ok)"}"/><text x="${(n.kind==="fopp"?n.x+n.w+8:n.x)+8}" y="${n.kind==="fopp"?n.y+n.h/2+3:n.y+n.h+14.5}" font-size="9" font-weight="700" fill="#fff" text-anchor="start">${esc2(o.feas)}</text>`:""}</g>`;return}
    if(n.kind==="in"){const col=d.accent;h+=`<g><title>${esc2(n.lab)}: ${esc2(n.txt)}</title><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="9" fill="${col}"/>${text(n.x+n.w/2,n.y+15,[n.lab],{fs:9.5,fw:700,fill:"#fff"})}${text(n.x+n.w/2,n.y+31,wrap(n.txt,21,3),{fs:9.4,fill:"#fff"})}</g>`;return}
    if(n.kind==="out"){const fr=nodes[n.from];if(!n.P._gates)h+=`<path d="M${fr.x+fr.w},${fr.y+H/2} L${n.x},${n.y+n.h/2}" class="fl" marker-end="url(#o1)"/>`;h+=`<g><title>Output: ${esc2(n.doc)}${n.P.outnote?" - "+esc2(n.P.outnote):""}</title><path d="M${n.x},${n.y} L${n.x+n.w-12},${n.y} L${n.x+n.w},${n.y+12} L${n.x+n.w},${n.y+n.h} L${n.x},${n.y+n.h}z" fill="#fff7e0" stroke="#d9a400" stroke-width="1.4"/><path d="M${n.x+n.w-12},${n.y} L${n.x+n.w-12},${n.y+12} L${n.x+n.w},${n.y+12}" fill="none" stroke="#d9a400"/>${text(n.x+8,n.y+15,["Output"],{fs:9.5,fw:700,fill:"#8a6d00",a:"start"})}${text(n.x+n.w/2,n.y+30,wrap(n.doc,24,n.doc.length>48?3:2),{fs:9.8,fill:"var(--navy)"})}</g>`;return}
    if(n.kind==="dec"){const cx=n.x+DW/2,cy=n.y+DW/2,q=n.dec;const ql=wrap(q.q,22,2);h+=`<g class="opn ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}"><title>${esc2(q.q)} Yes: ${esc2(q.yes)}. No: ${esc2(q.no)}</title>${n.fork?`<rect x="${cx-(ql[0].length*5.5+8)/2}" y="${n.y-17}" width="${ql[0].length*5.5+8}" height="14" rx="3" fill="var(--card)" fill-opacity=".95"/>`:""}<path class="b" d="M${cx},${n.y} L${n.x+DW},${cy} L${cx},${n.y+DW} L${n.x},${cy}z" fill="#f3ecfa" stroke="#7b3597" stroke-width="1.4"/>${text(cx,n.y-7-(ql.length-1)*11.4,ql,{fs:9.5,fw:600,fill:"#5b2a7a"})}${text(n.x+DW+4,cy-5,[q.swap?"No":"Yes"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}</g>${n.fork?"":n.gate&&q.fix?fixBranch(n):q.nx?noBranch(n):text(cx,n.y+DW+11,wrap("No: "+q.no,26,1),{fs:8.5,fill:"#7b3597"})}`;return}
    const s=n.s,c=TYC[s.was||s.ty],ch=s.ch||"same",lines=wrap(s.t,ch!=="same"?16:(s.t.length>42?23:21),s.t.length>42?3:2);
    let px=n.x+2;const inl=s.in||[];inl.slice(0,2).forEach(x=>{const p=pill(px,n.y-PIN+3,x[0],pc(x[0]),false,`From ${x[0]}: ${x[1]}`);h+=p.h+`<line class="source-step-leader" x1="${px+p.w/2}" y1="${n.y-PIN+20}" x2="${px+p.w/2}" y2="${n.y}" stroke="${pc(x[0])}" stroke-width="1.2"/>`;px+=p.w+4});
    if(inl.length>2){const p=pill(px,n.y-PIN+3,`+${inl.length-2}`,"#667085",false,inl.slice(2).map(x=>`From ${x[0]}: ${x[1]}`).join(" | "));h+=p.h}
    px=n.x+2;const outl=s.out||[];outl.slice(0,2).forEach(x=>{const p=pill(px,n.y+H+7,x[0],pc(x[0]),false,`To ${x[0]}: ${x[1]}`);h+=p.h+`<line class="source-step-leader" x1="${px+p.w/2}" y1="${n.y+H}" x2="${px+p.w/2}" y2="${n.y+H+7}" stroke="${pc(x[0])}" stroke-width="1.2"/>`;px+=p.w+4});if(outl.length>2){const p=pill(px,n.y+H+7,`+${outl.length-2}`,"#667085",false,outl.slice(2).map(x=>`To ${x[0]}: ${x[1]}`).join(" | "));h+=p.h}
    h+=`<g class="nd ty-${s.was||s.ty} ${s.pp&&s.pp.length?"has-pp":""} ${(s.ci||TPIS.has(n.id))?"has-tpi":""} ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}" aria-label="${esc2(s.t)}"><title>${esc2(s.t)} - ${TYNM[s.was||s.ty]} - ${esc2(s.sys)}</title>
      <rect class="b" x="${n.x}" y="${n.y}" width="${W}" height="${H}" rx="9" fill="${ch==="new"?"#eef5fc":"var(--card)"}" stroke="${c}" stroke-width="2.2" ${ch==="new"?'stroke-dasharray="6 3"':""}/>
      <circle cx="${n.x+14}" cy="${n.y+14}" r="9" fill="${c}"/><text x="${n.x+14}" y="${n.y+17.5}" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">${s.n}</text>
      ${text(n.x+W/2+(ch!=="same"?-6:8),n.y+(lines.length>1?15:21),lines,{fs:10.8,fw:600,fill:"var(--navy)"})}
      ${text(n.x+9,n.y+H-9,[wrap(s.sys,23,1)[0]],{fs:9.2,fill:"var(--muted)",a:"start"})}
      ${s.pp&&s.pp.length?(d.fixes&&ch!=="same"?`<g><title>Pain point addressed by this change: ${esc2(s.pp.join(" | "))}</title><circle cx="${n.x+W-11}" cy="${n.y+H-11}" r="7" fill="#1f8a4c"/><text x="${n.x+W-11}" y="${n.y+H-7.5}" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">✔</text></g>`:`<circle cx="${n.x+W-11}" cy="${n.y+H-11}" r="7" fill="var(--pain)"/><text x="${n.x+W-11}" y="${n.y+H-7.5}" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">!</text>`):""}
      ${ch!=="same"?`<rect x="${n.x+W-34}" y="${n.y+4}" width="30" height="13" rx="4" fill="var(--prop)"/><text x="${n.x+W-19}" y="${n.y+13.5}" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">${ch==="new"?"NEW":"AI"}</text>`:""}
      ${s.cop?`<rect x="${n.x+W-44}" y="${n.y-7}" width="38" height="13" rx="4" fill="#fff" stroke="#0070c0" stroke-dasharray="3 2"/><text x="${n.x+W-25}" y="${n.y+2.5}" font-size="8" font-weight="700" fill="#0070c0" text-anchor="middle">${esc2(s.cop.tag||"Copilot")}</text>`:""}
      ${s.feas?`<rect x="${n.x+(s.feasdx||0)+W/2-Math.max(W,s.feas.length*4.7+14)/2}" y="${n.y+H+(outl.length?27:3)}" width="${Math.max(W,s.feas.length*4.7+14)}" height="14" rx="4" fill="${/review/i.test(s.feas)?"#b45309":/applicable/i.test(s.feas)?"#667085":/not/i.test(s.feas)?"var(--pain)":/progress/i.test(s.feas)?"var(--hyb)":"var(--ok)"}"/><text x="${n.x+(s.feasdx||0)+W/2}" y="${n.y+H+(outl.length?37:13)}" font-size="8.3" font-weight="700" fill="#fff" text-anchor="middle">${esc2(s.feas)}</text>${s.feasn?`<text x="${n.x+(s.feasdx||0)+W/2+Math.max(W,s.feas.length*4.7+14)/2+5}" y="${n.y+H+(outl.length?37:13)}" font-size="9.5" font-weight="600" fill="var(--navy)" text-anchor="start">${esc2(s.feasn)}</text>`:""}`:""}
    </g>`;
  });
  const svg=document.querySelector(E.svg);svg.setAttribute("viewBox",`0 0 ${svgW} ${svgH}`);svg.setAttribute("data-f",filter);svg.innerHTML=h+BT;
  svg.querySelectorAll(".nd,.opn").forEach(g=>{const f=()=>detail(g.dataset.id);g.onclick=f;g.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();f()}}});
}
function detail(id){const n=nodes[id];if(!n)return;sel=id;
  document.querySelector(E.svg).querySelectorAll(".opn").forEach(g=>g.classList.toggle("sel",g.dataset.id===id));
  if(n.kind==="opp"||n.kind==="fopp"){const o=n.opp;document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)}${n.P?" / "+esc2(n.P.name):""}</span><h3 style="color:#0070c0">AI Opportunity: ${esc2(o.t)}</h3><dl><div><dt>Type</dt><dd><b>${esc2(o.ty)}</b></dd></div><div><dt>How it would work and tools</dt><dd class="opl">${esc2(o.d)}</dd></div>${(n.P?n.P.steps.flatMap(s=>s.pp||[]):(n.f.pp||[])).length?`<div><dt style="color:var(--pain)">Pain points it addresses</dt><dd class="ppl">${[...new Set(n.P?n.P.steps.flatMap(s=>s.pp||[]):(n.f.pp||[]))].map(esc2).join("<br>")}</dd></div>`:""}${o.feasc?`<div><dt style="color:var(--ok)">AI feasibility comment</dt><dd>${esc2(o.feasc)}</dd></div>`:""}<div><dt>Source</dt><dd>${esc2(o.rid)} (hypothesis - needs validation with the CAPEX team)</dd></div>${o.feas?`<div><dt>Feasibility</dt><dd><b>${esc2(o.feas)}</b></dd></div>`:""}</dl>`;return}
  if(n.kind==="ch"||n.kind==="tpi"){const c=n.c,ids=(c.steps||[]).map(s=>`${n.f.id}|${s}`);document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.toggle("sel",ids.includes(g.dataset.id)));
    const names=ids.map(i=>nodes[i]).filter(Boolean).map(x=>`<b>${esc2(x.P.name)}</b> · ${esc2(x.s.n)}. ${esc2(x.s.t)}`).join("<br>");
    document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)}</span><h3 style="color:${n.kind==="ch"?"#a00015":"#13643a"}">${n.kind==="ch"?"[CHALLENGE] Pain point":`[SOLUTION] ${esc2(c.st||"TPI")}`}</h3><p style="margin:4px 0 0">${esc2(c.t)}</p><dl>${names?`<div><dt>${n.kind==="ch"?"Where it hits (highlighted on the map)":"Steps it addresses (highlighted on the map)"}</dt><dd>${names}</dd></div>`:""}${c.ref?`<div><dt>Reference</dt><dd>${esc2(c.ref)}</dd></div>`:""}<div><dt>Source</dt><dd>${n.kind==="ch"?"CAPEX challenges file":"TPI register - Global Fixed Assets dashboard (CAPEX_Feasibility_Register.xlsx)"}</dd></div></dl>`;return}
  if(n.kind==="dec"){const q=n.dec;document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.remove("sel"));
    const r=(t,v,cls)=>v?`<div><dt>${t}</dt><dd class="${cls||""}">${v}</dd></div>`:"";
    document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f?n.f.name:"")}${n.P?" / "+esc2(n.P.name):""}</span><h3 style="color:#5b2a7a">Decision: ${esc2(q.q)}</h3>${q.d?`<p style="margin:4px 0 0">${esc2(q.d)}</p>`:""}<dl>${r("Example",q.ex?`<i>${esc2(q.ex)}</i>`:"")}${r("Checked by",q.o?esc2(q.o):"")}${r("System",q.sys?esc2(q.sys):"")}<div><dt>If yes</dt><dd>${esc2(q.yes)}</dd></div><div><dt>If no</dt><dd>${esc2(q.no)}</dd></div>${q.pp&&q.pp.length?r('<span style="color:var(--pain)">Pain point when the answer is no</span>',q.pp.map(esc2).join("<br>"),"ppl"):""}${r("Source",q.src?esc2(q.src):"")}</dl>`;return}
  const s=n.s;document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.toggle("sel",g.dataset.id===id));
  const row=(t,v,cls)=>v?`<div><dt>${t}</dt><dd class="${cls||""}">${v}</dd></div>`:"";
  const ownc=o=>o.split(/\s\/\s|,\s*/).map(x=>`<span class="own"><i style="background:${pc(x)}"></i>${esc2(x)}</span>`).join("");
  let html=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)} / ${esc2(n.P.name)} (${esc2(n.P.id)})</span><h3>${s.n}. ${esc2(s.t)}</h3><p style="margin:4px 0 0">${esc2(s.d)}</p><dl>`;
  html+=row("Who",ownc(s.o))+row("System",esc2(s.sys))+row("Activity type",`<b style="color:${TYC[s.ty]}">${TYNM[s.ty]}</b>${s.was?` <small>(as-is: ${TYNM[s.was]})</small>`:""}`);
  if(s.in&&s.in.length)html+=row("Input from",s.in.map(x=>`<b>${esc2(x[0])}</b>: ${esc2(x[1])}`).join("<br>"));
  if(s.out&&s.out.length)html+=row("Output to",s.out.map(x=>`<b>${esc2(x[0])}</b>: ${esc2(x[1])}`).join("<br>"));
  if(s.dec)html+=row("Decision",`<b>${esc2(s.dec.q)}</b><br>Yes &rarr; ${esc2(s.dec.yes)}<br>No &rarr; ${esc2(s.dec.no)}`);
  if(s.ctl)html+=row("Control",esc2(s.ctl));if(s.note)html+=row(`<span style="color:var(--ok)">${/Marked/.test(s.note)?"LT review":"As-Is update (CAPEX feedback, Oct 2026)"}</span>`,esc2(s.note));
  if(s.pp&&s.pp.length)html+=row('<span style="color:var(--pain)">Pain points</span>',s.pp.map(esc2).join("<br>"),"ppl");
  if(s.ci)html+=row("Existing CI / TPI",esc2(s.ci));
  if(page==="tobe"&&s.ch&&s.ch!=="same")html+=row('<span style="color:var(--prop)">AI suggestion (hypothesis, to validate)</span>',`<b>${esc2(s.rec||"")}</b><br>Tools: ${esc2(s.tools||"")}<br><small>Basis: ${esc2(s.opp||"")}</small>`,"opl");
  if(page==="tobe"&&s.cop)html+=row('<span style="color:#0070c0">Copilot / Agent Builder option (added hypothesis, to validate)</span>',`<b>${esc2(s.cop.tool)}</b><br>${esc2(s.cop.d)}`,"opl");
  if(s.feasc)html+=row(`<span style="color:var(--ok)">${esc2(s.feasl||"AI enhancement comment")}</span>`,esc2(s.feasc));
  html+=row("Source",esc2(s.src))+`</dl>`;
  if(page==="tobe"&&s.ch==="same")html+=`<p style="font-size:12px;color:var(--muted)">No change proposed for this step.</p>`;
  document.querySelector(E.det).innerHTML=html;
}
function legend(){const d=DATA[page];const sw=(c,dash)=>`<svg width="22" height="12"><line x1="0" y1="6" x2="22" y2="6" stroke="${c}" stroke-width="1.6" ${dash?'stroke-dasharray="4 3"':""}/></svg>`;
  const box=c=>`<svg width="20" height="12"><rect x="1" y="1" width="18" height="10" rx="3" fill="none" stroke="${c}" stroke-width="2"/></svg>`;
  document.querySelector(E.leg).innerHTML=`<span>${box("#d0021b")}Manual</span><span>${box("#e8891c")}Semi-automated</span><span>${box("#2f6fce")}Automated</span><span><svg width="14" height="14"><circle cx="7" cy="7" r="6.5" fill="#c8102e"/><text x="7" y="10.5" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">!</text></svg>Pain point</span><span><svg width="14" height="14"><path d="M7,1L13,7L7,13L1,7z" fill="#f3ecfa" stroke="#7b3597"/></svg>Decision</span><span>${sw("var(--navy)")}Flow</span><span>${sw(d.accent)}Chain between processes</span><span>${sw(d.accent,1)}Loop back</span>${d.frames.some(f=>f.ch&&f.ch.length)?`<span><svg width="22" height="12"><rect x="1" y="1" width="20" height="10" rx="3" fill="#fdecec" stroke="var(--pain)"/></svg>[CHALLENGE] pain point</span><span><svg width="22" height="12"><rect x="1" y="1" width="20" height="10" rx="3" fill="#e6f4ec" stroke="var(--ok)"/></svg>[SOLUTION] TPI / CI</span><span>${sw(d.accent,1)}Same output</span>`:""}${d.frames.some(f=>f.procs.some(p=>p.steps.some(s=>s.gate&&s.fix&&!s.noRetry)))?`<span>${sw("var(--navy)",1)}Retry after the fix</span>`:""}${d.frames.some(f=>f.procs.some(p=>p.steps.some(s=>s.dec&&s.dec.nx&&s.dec.nx.end)))?`<span><svg width="26" height="14"><rect x="1" y="1" width="24" height="12" rx="6" fill="#fdecec" stroke="#d0021b" stroke-width="1.3"/></svg>End of the flow (reject / hold)</span>`:""}<span><svg width="34" height="14"><rect width="34" height="14" rx="4" fill="${d.accent}"/><text x="17" y="10.5" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">Input</text></svg>Trigger / input</span><span><svg width="18" height="14"><path d="M1,1 L12,1 L17,6 L17,13 L1,13z" fill="#fff7e0" stroke="#d9a400"/></svg>Output</span>${page==="tobe"?`<span><svg width="70" height="16"><rect x="1" y="1" width="68" height="14" rx="7" fill="none" stroke="#0070c0" stroke-width="1.3" stroke-dasharray="3 2"/><text x="35" y="11.5" font-size="9" font-weight="700" fill="#0070c0" text-anchor="middle">AI: R2R</text></svg>AI-suggested dependency</span><span><svg width="60" height="16"><rect x="1" y="1" width="58" height="14" rx="4" fill="#e8f1fb" stroke="#0070c0"/><text x="30" y="11.5" font-size="8.5" font-weight="700" fill="#0070c0" text-anchor="middle">AI Opportunity</text></svg>AI opportunity (register)</span><span><svg width="30" height="13"><rect width="30" height="13" rx="4" fill="#0070c0"/><text x="15" y="10" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">AI</text></svg>Step changed (AI suggested)</span><span><svg width="30" height="13"><rect width="30" height="13" rx="4" fill="#0070c0"/><text x="15" y="10" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">NEW</text></svg>New step</span>`:""}<span>Pills = input from / output to; strips = upstream / downstream</span>`;}
function setScale(s){scale=Math.max(.3,Math.min(2,s));const svg=document.querySelector(E.svg);svg.style.width=svgW*scale+"px";svg.style.height=svgH*scale+"px"}
function fit(){const w=document.querySelector(E.scroll).clientWidth-10;setScale(Math.min(1,w/svgW))}
function render(pg,fl){if(pg)page=pg;if(fl)filter=fl;sel=null;draw();legend();document.querySelector(E.det).innerHTML='<p class="none">Select a step in the map to see what happens, who does it, the system, inputs, outputs, decisions, pain points and the source.</p>';fit()}
function setFilter(f){filter=f;document.querySelector(E.svg).setAttribute("data-f",f)}
return {getNodes:()=>nodes,getDimensions:()=>({width:svgW,height:svgH}),render,setFilter,zi:()=>setScale(scale+.15),zo:()=>setScale(scale-.15),fit,page:()=>page,setScale,getScale:()=>scale};
};
window.TowerRenderers["P2P"]=function makeTowerMap(KEY,DATA,E){
const TPIS=new Set();Object.values(DATA).forEach(dd=>dd&&dd.frames&&dd.frames.forEach(f=>(f.tpi||[]).forEach(t=>(t.steps||[]).forEach(r=>TPIS.add(f.id+"|"+r)))));
const W=158,H=74,G=46,DW=34,PAD=24,FH=E.frameHeaderHeight||46,ROWL=E.processHeaderGap||22,PIN=E.processInputGap||24,POUT=24,RGAP=44,STRIP=E.handoffStripHeight||30,INW=118,CH=14;
const TYC={man:"#d0021b",auto:"#2f6fce",hyb:"#e8891c"},TYNM={man:"Manual",hyb:"Semi-automated",auto:"Automated"};
const esc2=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function wrap(t,n,max){const w=String(t).split(" ");const L=[];let c="";w.forEach(x=>{if((c+" "+x).trim().length>n){if(c)L.push(c);c=x}else c=(c+" "+x).trim()});if(c)L.push(c);max=max||2;if(L.length>max){L[max-1]=L.slice(max-1).join(" ");if(L[max-1].length>n+2)L[max-1]=L[max-1].slice(0,n)+"…";L.length=max}return L}
function text(x,y,lines,o={}){return `<text x="${x}" y="${y}" font-size="${o.fs||11.5}" font-weight="${o.fw||500}" fill="${o.fill||"var(--ink)"}" text-anchor="${o.a||"middle"}" font-family="Inter,Segoe UI,Arial,sans-serif">${lines.map((l,i)=>`<tspan x="${x}" dy="${i?1.2:0}em">${esc2(l)}</tspan>`).join("")}</text>`}
let page="asis",filter="all",nodes={},svgW=0,svgH=0,scale=1,sel=null;
const pc=p=>{const k=String(p).split(/[ -]/)[0];return ({O2C:"var(--O2C)",R2R:"var(--R2R)",TAX:"var(--Tax)",Tax:"var(--Tax)",P2P:"var(--P2P)",CAPEX:"var(--CAPEX)",Controlling:"var(--Controlling)",Local:"var(--LocalFinance)",Supplier:"#8a6d3b",Procurement:"#c2410c",Compliance:"#475467",System:"#667085",Requisitioner:"#b7791f",Kofax:"#667085",Coupa:"#667085",Lockbox:"#475467",Bank:"#475467",Approvers:"#7b3597",IT:"#667085",Capital:"#1d4ed8",Licensed:"#4b2a86",Report:"#4b2a86",FPAC:"var(--FPA)",FPAO:"var(--FPA)",DMT:"#0e7490",Customer:"#8a6d3b",Distributors:"#8a6d3b",Distribution:"#0f766e",Bank:"#475467",Payroll:"#b7791f",Local:"#b7791f",FP:"var(--FPA)",HR:"#9d174d",International:"#152847",Area:"#152847",Group:"#152847",MC:"#b7791f",BUD:"#b7791f",BUDs:"#b7791f",Brand:"#b7791f",Cost:"#b7791f",Business:"#b7791f",CFO:"#7b3597",CP:"#7b3597",CBP:"#c77a0a",Embedded:"#c77a0a",SAP:"#667085",CMR:"#667085",PMR:"#667085",AZ:"#667085",AZForce:"#667085",Enpire:"#667085",OneGRC:"#475467",Approver:"#7b3597",Market:"#b7791f",Posting:"var(--R2R)",FBPs:"#c77a0a",Planning:"#667085","P&MR":"#667085"})[k]||(String(p).startsWith("FP&A")?"var(--FPA)":"#667085")};
function pill(x,y,label,c,dash,title,anchorLeft){const w=label.length*6.2+16;return {w,h:`<g class="source-pill"><title>${esc2(title||label)}</title><rect x="${x}" y="${y}" width="${w}" height="17" rx="8.5" fill="var(--card)" stroke="${c}" stroke-width="1.3" ${dash?'stroke-dasharray="3 2"':""}/>${text(x+w/2,y+12,[label],{fs:10,fw:600,fill:c})}</g>`}}
function layout(d){
  nodes={};let h="",y=PAD+10,maxX=0;const x0=PAD+(d.chan||60);
  // phase chevrons (processes grouped by key process)
  {const raw=d.frames.flatMap(f=>f.procs.map(p=>({p,f})));const procs=[];raw.forEach(it=>{const k=it.p.phase||it.p.name;const L=procs[procs.length-1];if(L&&L.k===k&&L.f===it.f){L.ids.push(it.p.id)}else procs.push({k,f:it.f,p:it.p,ids:[it.p.id]})});const cw=procs.length<=3?230:150,ch=40;let cx=x0;
   h+=text(x0,y+12,["Process phases"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});y+=18;
   procs.forEach(({p,f},i)=>{const fi=d.frames.indexOf(f);const col=d.accent;const op=.55+.15*(fi%3);
     h+=`<g><title>${esc2(f.name)} / ${esc2(p.phase||p.name)} (${esc2(procs[i].ids.join(", "))})</title><path d="M${cx},${y} L${cx+cw-14},${y} L${cx+cw},${y+ch/2} L${cx+cw-14},${y+ch} L${cx},${y+ch} L${cx+14},${y+ch/2}z" fill="${col}" fill-opacity="${op}"/>${text(cx+cw/2+4,y+ch/2+4,wrap(`${i+1}. ${p.phase||p.name}`,cw>200?32:20,1),{fs:10.5,fw:700,fill:"#fff"})}</g>`;cx+=cw+4});
   maxX=Math.max(maxX,cx);y+=ch+22;}
  d.frames.forEach((f,fi)=>{
    const top=y;const c=d.accent;
    y+=FH;
    // upstream strip
    let px=x0+8;const upY=y+4;if(f.up.length){h+=text(x0,upY+12,["Upstream"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});px+=66;}
    f.up.forEach(u=>{const p=pill(px,upY,(u.c?"AI: ":"")+u.p,u.c?"var(--prop)":pc(u.p),!!u.c,`${u.c?"AI SUGGESTED - ":""}${u.p}: ${u.w} (${u.src})`);h+=p.h;px+=p.w+6});
    maxX=Math.max(maxX,px);y+=STRIP;
    f.procs.forEach((P,pi)=>{
      y+=ROWL;if(P.validation){const vl=wrap(P.validation,145,3);h+=text(x0,y-4,vl,{fs:10.5,fw:600,fill:"#5b2a7a",a:"start"});y+=vl.length*13+12}const rowY=y+PIN;let x=x0;const items=[];
      nodes[`${f.id}|${P.id}|in`]={id:`${f.id}|${P.id}|in`,x,y:rowY,w:INW,h:H,kind:"in",lab:P.inbox[0],txt:P.inbox[1],f,P};x+=INW+G-12;
      P._headingY=y;h+=`<g class="source-process-heading">`;h+=text(x0,y-4,[`${P.name}`],{fs:12,fw:700,fill:"var(--navy)",a:"start"});h+=text(x0+P.name.length*7.2+10,y-4,[`${P.id} · ${P.owner}`],{fs:10.5,fill:"var(--muted)",a:"start"});h+=`</g>`;
      const seq=[`${f.id}|${P.id}|in`];let fext=0;P._rb=rowY+H;P._gates=false;
      P.steps.forEach((s,j)=>{
        if(s.gate){P._gates=true;x+=60;const gid=`${f.id}|${P.id}|${s.n}`;nodes[gid]={id:gid,x,y:rowY+H/2-DW/2,w:DW,h:DW,kind:"dec",gate:true,dec:s,f,P,j,ln:P.steps.slice(j+1).filter(q=>q.gate&&q.nx&&!q.nx.end).length};seq.push(gid);
          if(s.fix){const fs=s.fix,fid=`${f.id}|${P.id}|${fs.n}`;nodes[fid]={id:fid,x:x+DW/2-W/2,y:rowY+H+56,w:W,h:H,s:fs,f,P,j,fixOf:gid};fext=56+H+4;P._rb=rowY+H+fext-4}
          x+=DW+G+76;return}
        if(s.fork){P._gates=true;const BG=56,nb=s.branches.length;x+=30;const dx=x,sx=dx+DW+G+40,bx=sx+W+30;
          s.branches.forEach((b,bi)=>{const by=rowY+bi*(H+BG);const nq=s.branches[bi+1];const did=`${f.id}|${P.id}|${b.step.n}|d`;
            nodes[did]={id:did,x:dx,y:by+H/2-DW/2,w:DW,h:DW,kind:"dec",fork:true,f,P,dec:{q:b.q,ex:b.ex,o:b.o,d:b.d,src:b.src,yes:`Step ${b.step.n} - ${b.step.t}`,no:nq?`Check: ${nq.q}`:(s.elseLab||"No")+" - release"}};
            const sid=`${f.id}|${P.id}|${b.step.n}`;nodes[sid]={id:sid,x:sx,y:by,w:W,h:H,s:b.step,f,P,j,br:true}});
          const fid=`${f.id}|${P.id}|fork${j}`;nodes[fid]={id:fid,kind:"fork",fk:s,f,P,x:dx,w:bx-dx,dx,sx,bx,rowY};seq.push(fid);
          fext=Math.max(fext,(nb-1)*(H+BG)+34);P._rb=Math.max(P._rb,rowY+H+(nb-1)*(H+BG)+30);x=bx+40;return}
        const id=`${f.id}|${P.id}|${s.n}`;nodes[id]={id,x,y:rowY,w:W,h:H,s,f,P,j};items.push(id);seq.push(id);x+=W+G;
        if(s.dec){x+=30;nodes[id+"|d"]={id:id+"|d",x:x,y:rowY+H/2-DW/2,w:DW,h:DW,dec:s.dec,kind:"dec",step:s,f,P,ln:P.steps.slice(j+1).filter(q=>q.dec&&q.dec.nx&&!q.dec.nx.end).length};x+=DW+G+40}});
      P._seq=seq;
      if(P.outdoc){x+=14;nodes[`${f.id}|${P.id}|out`]={id:`${f.id}|${P.id}|out`,x,y:rowY+8,w:150,h:H-16,kind:"out",doc:P.outdoc,f,P,from:P._gates?seq[seq.length-1]:items[items.length-1]};seq.push(`${f.id}|${P.id}|out`);x+=150+G}
      if(d.key==="tobe"&&P.opp){x+=6;nodes[`${f.id}|${P.id}|opp`]={id:`${f.id}|${P.id}|opp`,x,y:rowY-6,w:190,h:H+12,kind:"opp",opp:P.opp,f,P,from:items[items.length-1]};x+=210}
      maxX=Math.max(maxX,x);
      y=rowY+H+POUT+RGAP+fext+(P.steps.some(s=>s.dec&&s.dec.nx)?30:0);
    });
    if(d.key==="tobe"&&f.opp){nodes[`${f.id}|opp`]={id:`${f.id}|opp`,x:x0,y:y-18,w:460,h:44,kind:"fopp",opp:f.opp,f};y+=56}
    // challenge / TPI strips
    if((f.ch&&f.ch.length)||(f.tpi&&f.tpi.length)){y+=4;
      const strip=(items,kind,lab,fill,stroke,col,bw)=>{h+=text(x0,y+12,[lab],{fs:10.5,fw:700,fill:col,a:"start"});y+=20;let bx=x0;
        items.forEach((c,i)=>{if(i&&i%4===0){bx=x0;y+=58}const id=`${f.id}|${kind}${i}`;const head=kind==="ch"?"[CHALLENGE]":`[SOLUTION] ${c.st||"TPI"}`;const tl=wrap(c.t,Math.floor(bw/5.6),2);nodes[id]={id,kind,c,f,x:bx,y,w:bw,h:50};
          h+=`<g class="opn ${sel===id?"sel":""}" tabindex="0" role="button" data-id="${id}"><title>${esc2(head)}: ${esc2(c.t)}${c.ref?" - "+esc2(c.ref):""}</title><rect class="b" x="${bx}" y="${y}" width="${bw}" height="50" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>${text(bx+10,y+14,[head],{fs:9.5,fw:700,fill:col,a:"start"})}${c.ref?text(bx+bw-8,y+14,[c.ref],{fs:8.8,fill:col,a:"end"}):""}${text(bx+10,y+29,tl,{fs:9.8,fill:"var(--navy)",a:"start"})}</g>`;bx+=bw+12});
        maxX=Math.max(maxX,bx);y+=50+14};
      if(f.ch&&f.ch.length)strip(f.ch,"ch","Pain points (register)","#fdecec","var(--pain)","#a00015",330);
      if(f.tpi&&f.tpi.length)strip(f.tpi,"tpi","TPI / CI initiatives (register)","#e6f4ec","var(--ok)","#13643a",430);
    }
    // downstream strip
    px=x0+8;const dnY=y-10;if(f.down.length){h+=text(x0,dnY+12,["Downstream"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});px+=78;}
    f.down.forEach(u=>{const p=pill(px,dnY,(u.c?"AI: ":"")+u.p,u.c?"var(--prop)":pc(u.p),!!u.c,`${u.c?"AI SUGGESTED - ":""}${u.p}: ${u.w} (${u.src})`);h+=p.h;px+=p.w+6});
    maxX=Math.max(maxX,px);y+=STRIP+6;
    f._box={top,bot:y,c};y+=26;
  });
  const FR=Math.max(maxX+40,1180);d._fr=FR;svgW=FR;svgH=y+PAD;
  return h;
}
function noBranch(n){const q=n.dec,nx=q.nx,cx=n.x+DW/2,by=n.y+DW,rowY=n.y-(H/2-DW/2),rb=n.P&&n.P._rb?n.P._rb:rowY+H;let o="";if(nx.none)return nx.nl?text(cx+5,by+13,[nx.nl],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"}):"";
  if(nx.endGate){const target=nodes[`${n.f.id}|${n.P.id}|${nx.endGate}`];if(!target||!target.dec.nx||!target.dec.nx.end)return "";const tq=target.dec.nx,w=Math.max(96,tq.end.length*6.4+22),tx=target.x+DW/2,ty=rb+34;return `<path data-return-to="${nx.endGate}" d="M${cx},${by} L${cx},${ty+13} L${tx+w/2},${ty+13}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+13,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}
  if(nx.end){const hold=nx.kind==="hold",w=Math.max(96,nx.end.length*6.4+22),ty=(n.gate&&rb>rowY+H)?rowY+H+56+H/2-13:rb+34;o+=`<path d="M${cx},${by} L${cx},${ty}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+13,[q.swap?"Yes":"No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})+`<g><title>${esc2(q.q)} No: ${esc2(q.no)}</title><rect x="${cx-w/2}" y="${ty}" width="${w}" height="26" rx="13" fill="${hold?"#fff4e0":"#fdecec"}" stroke="${hold?"#e8891c":"#d0021b"}" stroke-width="1.5"/>${text(cx,ty+17,[nx.end],{fs:9.8,fw:700,fill:hold?"#8a4b00":"#a00015"})}</g>`;return o}
  const T=nx.out?nodes[`${n.f.id}|${n.P.id}|out`]:nodes[`${n.f.id}|${n.P.id}|${nx.step}`];if(!T)return text(cx,n.y+DW+11,wrap("No: "+q.no,26,1),{fs:8.5,fill:"#7b3597"});
  const yb=rb+40+(n.ln||0)*12,ex=nx.out?T.x+T.w/2:T.x+T.w-16,ty=T.y+T.h;
  o+=`<path d="M${cx},${by} L${cx},${yb} L${ex},${yb} L${ex},${ty}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+13,[q.swap?"Yes":"No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
  const nl=q.nl||nx.nl;if(nl){const lw=nl.length*5.4+8;o+=`<rect x="${cx+10}" y="${yb-7}" width="${lw}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(cx+14,yb+3,[nl],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}
  return o}
function fixBranch(n){const q=n.dec,F=nodes[`${n.f.id}|${n.P.id}|${q.fix.n}`];if(!F)return "";const cx=n.x+DW/2,by=n.y+DW,rowY=n.y-(H/2-DW/2),ym=rowY+H+18,ex=F.x+W+16,rx=F.x-16,cy=rowY+H/2;let o="";
  o+=`<path d="M${cx},${by} L${cx},${ym} L${ex},${ym} L${ex},${F.y+H/2} L${F.x+W},${F.y+H/2}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+12,[q.fl||"No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
  const S1=nodes[`${n.f.id}|${n.P.id}|1`];
  if(n.P.id==="SOC-01.1"){const S2=nodes[`${n.f.id}|${n.P.id}|1`];if(S2){const k=["1a","1b","1c"].indexOf(q.fix.n),yy=F.y+H+22+k*9,tx=S2.x+30+k*14,fx=F.x+W/2;o+=`<path d="M${fx},${F.y+H} L${fx},${yy} L${tx},${yy} L${tx},${S2.y+H}" class="fl" marker-end="url(#o1)"/>`}}else if(S1&&false){const k=["1a","1b","1c"].indexOf(q.fix.n),by=F.y+H+18+k*10,sx=S1.x+30+k*12,fx=F.x+W/2;o+=`<path d="M${fx},${F.y+H} L${fx},${by} L${sx},${by} L${sx},${S1.y+H}" class="fl" stroke-dasharray="5 3" marker-end="url(#o1)"/>`;
  if(k===0)o+=`<rect x="${sx+8}" y="${by-7}" width="${"Retry from step 1".length*5+6}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(sx+11,by+3,["Retry from step 1"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}
  else if(!q.noRetry){o+=`<path d="M${F.x},${F.y+H/2} L${rx},${F.y+H/2} L${rx},${cy} L${n.x},${cy}" class="fl" stroke-dasharray="5 3" marker-end="url(#o1)"/>`;
  const ly=(F.y+H/2+cy)/2;o+=`<rect x="${rx-34}" y="${ly-7}" width="31" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(rx-4,ly+3,["Retry"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"end"});
  }
  if(n.P.id==="SOC-05.1"){const O=nodes[`${n.f.id}|${n.P.id}|out`],S3=nodes[`${n.f.id}|${n.P.id}|3`],fx=F.x+W/2;if(O){const tx=O.x+O.w/2,jy=F.y+H+30;o+=`<path d="M${fx+12},${F.y+H} L${fx+12},${jy} L${tx},${jy} L${tx},${O.y+O.h}" class="fl" marker-end="url(#o1)"/>`}if(S3){const tx=S3.x+W-10,jy=F.y+H+16;o+=`<path d="M${fx-12},${F.y+H} L${fx-12},${jy} L${tx},${jy} L${tx},${S3.y+H}" class="fl" marker-end="url(#o1)"/>`}}else if(q.fix.join){const sq=n.P._seq||[],J=q.fix.join==="out"?nodes[`${n.f.id}|${n.P.id}|out`]:nodes[sq[sq.indexOf(n.id)+2]];if(J){const jx=F.x+W/2,jy=F.y+H+34,tx=J.x+J.w/2;if(J.kind==="dec"){const cyy=J.y+J.h/2,mx=J.x-14;o+=`<path d="M${jx},${F.y+H} L${jx},${jy} L${mx},${jy} L${mx},${cyy} L${J.x},${cyy}" class="fl" marker-end="url(#o1)"/>`}else o+=`<path d="M${jx},${F.y+H} L${jx},${jy} L${tx},${jy} L${tx},${J.y+J.h}" class="fl" marker-end="url(#o1)"/>`}}
  return o}
function draw(){
  const d=DATA[page];const strips=layout(d);let h=`<defs><marker id="o1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--navy)"/></marker><marker id="o2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#7b3597"/></marker><marker id="o3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#0070c0"/></marker><marker id="o4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="${d.accent}"/></marker><marker id="o5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0L10,5L0,10z" fill="${d.accent}"/></marker></defs>
  <style>.fl{fill:none;stroke:var(--navy);stroke-width:1.6}.rw{fill:none;stroke:#7b3597;stroke-width:1.4;stroke-dasharray:5 4}svg[data-f="man"] .nd:not(.ty-man),svg[data-f="hyb"] .nd:not(.ty-hyb),svg[data-f="auto"] .nd:not(.ty-auto),svg[data-f="pp"] .nd:not(.has-pp),svg[data-f="tpi"] .nd:not(.has-tpi){opacity:.14}svg[data-f="tpi"] .nd.has-tpi rect.b{stroke:#13643a;stroke-width:4;filter:drop-shadow(0 0 5px rgba(19,100,58,.55))}.opn{cursor:pointer}.opn:hover rect.b,.opn.sel rect.b{stroke-width:2.4}</style>`;
  // frames
  d.frames.forEach((f,fi)=>{const b=f._box;const wdt=d._fr-PAD*2;
    h+=`<rect x="${PAD}" y="${b.top}" width="${wdt}" height="${b.bot-b.top}" rx="14" fill="${b.c}" fill-opacity=".05" stroke="${b.c}" stroke-opacity=".35"/><rect x="${PAD}" y="${b.top}" width="${wdt}" height="${FH-6}" rx="14" fill="${b.c}"/><rect x="${PAD}" y="${b.top+20}" width="${wdt}" height="${FH-26}" fill="${b.c}"/>`;
    {const ts=d.tshift||0;h+=text(PAD+16+ts,b.top+26,[`${fi+1}. ${f.name}`],{fs:15,fw:700,fill:"#fff",a:"start"})+text(PAD+16+ts+f.name.length*9.2+30,b.top+26,[`${f.owner} · ${f.win}`],{fs:11,fill:"#fff",a:"start"});}
    if(f.pp&&f.pp.length)h+=`<g><title>Pain points: ${esc2(f.pp.join(" | "))}</title><circle cx="${PAD+wdt-22}" cy="${b.top+20}" r="9" fill="#fff"/><text x="${PAD+wdt-22}" y="${b.top+24.5}" font-size="12" font-weight="700" fill="var(--pain)" text-anchor="middle">!</text></g>`;
    if(f.ctl&&f.ctl.length)h+=`<g><title>Controls: ${esc2(f.ctl.join(" | "))}</title><circle cx="${PAD+wdt-48}" cy="${b.top+20}" r="9" fill="#fff"/><text x="${PAD+wdt-48}" y="${b.top+24.5}" font-size="11" font-weight="700" fill="${b.c}" text-anchor="middle">C</text></g>`;
  });
  h+=strips;let BT="";(d.frames||[]).forEach(f=>f.procs.forEach(P=>{if(P.back){const A=nodes[`${f.id}|${P.id}|${P.back.from}`],B=nodes[`${f.id}|${P.id}|${P.back.to}`];if(A&&B){const yy=A.y+A.h+16,ax=A.x+A.w/2,bx=B.x+B.w/2+(P.back.dx||0);h+=`<path d="M${ax},${A.y+A.h} L${ax},${yy} L${bx},${yy} L${bx},${B.y+B.h}" class="fl"/>`;BT+=`<path d="M${bx},${B.y+B.h+19} L${bx},${B.y+B.h}" class="fl" marker-end="url(#o1)"/>`}}}));
  // chain between processes and key processes (internal O2C flow)
  (d.chain||[]).forEach((e,i)=>{const A=nodes[e.a],B=nodes[e.b];if(!A||!B)return;const lane=PAD+CH+(i%(d.lanes||4))*(d.lanes?8:11);const col=d.accent;
    const ax=A.x+A.w/2,ay=A.y+A.h,yg=e.below&&A.f&&A.f._box?A.f._box.bot+7+(i%3)*6:A.y+A.h+(e.dy!=null?e.dy:(A.kind==="out"?30:34));
    const by=B.kind==="in"?B.y+B.h/2:B.y;let p;
    if(B.kind==="in"){p=`M${ax},${ay} L${ax},${yg} L${lane},${yg} L${lane},${by} L${B.x},${by}`}
    else{p=`M${ax},${ay} L${ax},${yg} L${lane},${yg} L${lane},${B.y-16} L${B.x+B.w/2-24},${B.y-16} L${B.x+B.w/2-24},${B.y}`}
    h+=`<path d="${p}" fill="none" stroke="${col}" stroke-width="${e.loop?1.5:2.2}" ${e.loop?'stroke-dasharray="6 4"':""} stroke-opacity=".9" marker-end="url(#${e.loop?"o4":"o5"})"/>`;
    if(e.lab){const lw=e.lab.length*5.6+10,lx=e.below?ax-lw-8:ax+8;const ly=yg+(e.ldy||0);h+=`<rect x="${lx}" y="${ly-13}" width="${lw}" height="15" rx="4" fill="var(--card)" fill-opacity=".9"/>`+text(lx+5,ly-2,[e.lab],{fs:9.2,fw:600,fill:col,a:"start"})}
  });
  // same-output link between two processes' outputs
  d.frames.forEach(f=>{const so=f.sameOut;if(!so)return;const A=nodes[`${f.id}|${so.a}|out`],B=nodes[`${f.id}|${so.b}|out`];if(!A||!B)return;const ax=A.x+A.w/2,bx=B.x+B.w/2,ym=B.y-72;
    h+=`<path d="M${ax},${A.y+A.h} L${ax},${ym} L${bx},${ym} L${bx},${B.y}" fill="none" stroke="${d.accent}" stroke-width="1.8" stroke-dasharray="3 4" stroke-linecap="round"/><circle cx="${ax}" cy="${A.y+A.h}" r="3.5" fill="${d.accent}"/><circle cx="${bx}" cy="${B.y}" r="3.5" fill="${d.accent}"/>`;
    if(so.lab){const lw=so.lab.length*5.6+14,lx=Math.min(ax,bx)+Math.abs(bx-ax)/2-lw/2;h+=`<rect x="${lx}" y="${ym-9}" width="${lw}" height="17" rx="8" fill="var(--card)" stroke="${d.accent}" stroke-width="1"/>`+text(lx+lw/2,ym+3,[so.lab],{fs:9.2,fw:600,fill:d.accent})}});
  // edges
  d.frames.forEach(f=>f.procs.forEach(P=>{if(!P._gates)return;const sq=P._seq;for(let i=0;i<sq.length-1;i++){const A=nodes[sq[i]],B=nodes[sq[i+1]];if(!A||!B)continue;if(A.kind==="fork"){A.next=B;continue}const ay=A.kind==="in"?A.y+A.h/2:(A.kind==="dec"?A.y+A.h/2:A.y+H/2);h+=`<path d="M${A.x+A.w},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`}}));
  Object.values(nodes).forEach(n=>{if(n.kind==='in'){if(n.P._gates)return;const B=nodes[`${n.f.id}|${n.P.id}|1`];if(B)h+=`<path d="M${n.x+n.w},${n.y+H/2} L${B.x},${B.y+H/2}" class="fl" marker-end="url(#o1)"/>`;return}if(n.kind||n.fixOf||(n.P&&n.P._gates))return;const P=n.P,j=n.j;const nxt=P.steps[j+1];if(!nxt)return;const B=nodes[`${n.f.id}|${P.id}|${nxt.n}`];const D=nodes[n.id+"|d"];const ay=n.y+H/2;
    if(D){h+=`<path d="M${n.x+W},${ay} L${D.x},${ay}" class="fl" marker-end="url(#o1)"/><path d="M${D.x+DW},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`;}
    else h+=`<path d="M${n.x+W},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`});
  // handoff pills on steps + decisions + nodes
  Object.values(nodes).filter(n=>n.kind==="fork").forEach(n=>{const s=n.fk,f=n.f,P=n.P,cy0=n.rowY+H/2,cxd=n.dx+DW/2;let o="",yEnd=cy0;
    s.branches.forEach((b,bi)=>{const D=nodes[`${f.id}|${P.id}|${b.step.n}|d`],S=nodes[`${f.id}|${P.id}|${b.step.n}`];const cy=S.y+H/2;
      o+=`<path d="M${D.x+DW},${cy} L${S.x},${cy}" class="fl" marker-end="url(#o1)"/><path d="M${S.x+W},${cy} L${n.bx},${cy}" class="fl"/>`;yEnd=Math.max(yEnd,cy);
      const nxD=s.branches[bi+1]?nodes[`${f.id}|${P.id}|${s.branches[bi+1].step.n}|d`]:null;
      if(nxD)o+=`<path d="M${cxd},${D.y+DW} L${cxd},${nxD.y}" class="fl" marker-end="url(#o1)"/>`+text(cxd+5,D.y+DW+13,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
      else{const ye=S.y+H+30;const OT=s.elseOut?nodes[`${f.id}|${P.id}|out`]:null;o+=(OT?`<path d="M${cxd},${D.y+DW} L${cxd},${ye} L${OT.x+OT.w/2},${ye} L${OT.x+OT.w/2},${OT.y+OT.h}" class="fl" marker-end="url(#o1)"/>`:`<path d="M${cxd},${D.y+DW} L${cxd},${ye} L${n.bx},${ye}" class="fl"/>`)+text(cxd+5,D.y+DW+13,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
        if(s.elseLab){const lw=s.elseLab.length*5.4+8;o+=`<rect x="${cxd+10}" y="${ye-7}" width="${lw}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(cxd+14,ye+3,[s.elseLab],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}if(!OT)yEnd=Math.max(yEnd,ye)}});
    o+=`<path d="M${n.bx},${yEnd} L${n.bx},${cy0}" class="fl"/>`;if(n.next)o+=`<path d="M${n.bx},${cy0} L${n.next.x},${cy0}" class="fl" marker-end="url(#o1)"/>`;
    if(s.lab)o+=text(n.dx+DW/2,n.rowY-6,[s.lab],{fs:10,fw:700,fill:"var(--muted)"});
    h+=o});
  Object.values(nodes).forEach(n=>{
    if(n.kind==="ch"||n.kind==="tpi"||n.kind==="fork")return;
    if(n.kind==="opp"||n.kind==="fopp"){const o=n.opp,fr=n.kind==="opp"?nodes[`${n.f.id}|${n.P.id}|out`]:null;const tl=wrap(o.t,n.kind==="opp"?26:70,n.kind==="opp"?2:1);
      if(fr)h+=`<path d="M${fr.x+fr.w},${fr.y+fr.h/2} L${n.x},${n.y+n.h/2}" fill="none" stroke="#0070c0" stroke-width="1.4" stroke-dasharray="4 3" marker-end="url(#o3)"/>`;
      h+=`<g class="opn ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}"><title>AI Opportunity (${esc2(o.ty)}): ${esc2(o.t)} - ${esc2(o.d)}</title><rect class="b" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="9" fill="#e8f1fb" stroke="#0070c0" stroke-width="1.5"/>
      ${text(n.x+10,n.y+15,[n.kind==="fopp"?`AI Opportunity - ${n.f.name.length>30?n.f.name.slice(0,29)+"…":n.f.name}`:"AI Opportunity"],{fs:10.5,fw:700,fill:"#0070c0",a:"start"})}<rect x="${n.x+n.w-96}" y="${n.y+5}" width="90" height="14" rx="4" fill="#0070c0"/><text x="${n.x+n.w-51}" y="${n.y+15}" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">${esc2(o.ty)}</text>
      ${text(n.x+10,n.y+31,tl,{fs:10.3,fill:"var(--navy)",a:"start"})}${o.feas?`<rect x="${n.kind==="fopp"?n.x+n.w+8:n.x}" y="${n.kind==="fopp"?n.y+n.h/2-7.5:n.y+n.h+4}" width="${o.feas.length*5.6+16}" height="15" rx="4" fill="${/review|assessment|progress/i.test(o.feas)?"#b45309":/applicable|not relevant/i.test(o.feas)?"#667085":/not/i.test(o.feas)?"var(--pain)":/implemented/i.test(o.feas)?"#1d4ed8":"var(--ok)"}"/><text x="${(n.kind==="fopp"?n.x+n.w+8:n.x)+8}" y="${n.kind==="fopp"?n.y+n.h/2+3:n.y+n.h+14.5}" font-size="9" font-weight="700" fill="#fff" text-anchor="start">${esc2(o.feas)}</text>`:""}</g>`;return}
    if(n.kind==="in"){const col=d.accent;h+=`<g><title>${esc2(n.lab)}: ${esc2(n.txt)}</title><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="9" fill="${col}"/>${text(n.x+n.w/2,n.y+15,[n.lab],{fs:9.5,fw:700,fill:"#fff"})}${text(n.x+n.w/2,n.y+31,wrap(n.txt,21,3),{fs:9.4,fill:"#fff"})}</g>`;return}
    if(n.kind==="out"){const fr=nodes[n.from];if(!n.P._gates)h+=`<path d="M${fr.x+fr.w},${fr.y+H/2} L${n.x},${n.y+n.h/2}" class="fl" marker-end="url(#o1)"/>`;h+=`<g><title>Output: ${esc2(n.doc)}${n.P.outnote?" - "+esc2(n.P.outnote):""}</title><path d="M${n.x},${n.y} L${n.x+n.w-12},${n.y} L${n.x+n.w},${n.y+12} L${n.x+n.w},${n.y+n.h} L${n.x},${n.y+n.h}z" fill="#fff7e0" stroke="#d9a400" stroke-width="1.4"/><path d="M${n.x+n.w-12},${n.y} L${n.x+n.w-12},${n.y+12} L${n.x+n.w},${n.y+12}" fill="none" stroke="#d9a400"/>${text(n.x+8,n.y+15,["Output"],{fs:9.5,fw:700,fill:"#8a6d00",a:"start"})}${text(n.x+n.w/2,n.y+30,wrap(n.doc,24,n.doc.length>48?3:2),{fs:9.8,fill:"var(--navy)"})}</g>`;return}
    if(n.kind==="dec"){const cx=n.x+DW/2,cy=n.y+DW/2,q=n.dec;const ql=wrap(q.q,22,2);h+=`<g class="opn ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}"><title>${esc2(q.q)} Yes: ${esc2(q.yes)}. No: ${esc2(q.no)}</title>${n.fork?`<rect x="${cx-(ql[0].length*5.5+8)/2}" y="${n.y-17}" width="${ql[0].length*5.5+8}" height="14" rx="3" fill="var(--card)" fill-opacity=".95"/>`:""}<path class="b" d="M${cx},${n.y} L${n.x+DW},${cy} L${cx},${n.y+DW} L${n.x},${cy}z" fill="#f3ecfa" stroke="#7b3597" stroke-width="1.4"/>${text(cx,n.y-7-(ql.length-1)*11.4,ql,{fs:9.5,fw:600,fill:"#5b2a7a"})}${text(n.x+DW+4,cy-5,[q.swap?"No":"Yes"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}</g>${n.fork?"":n.gate&&q.fix?fixBranch(n):q.nx?noBranch(n):text(cx,n.y+DW+11,wrap("No: "+q.no,26,1),{fs:8.5,fill:"#7b3597"})}`;return}
    const s=n.s,c=TYC[s.was||s.ty],ch=s.ch||"same",lines=wrap(s.t,ch!=="same"?16:(s.t.length>42?23:21),s.t.length>42?3:2);
    let px=n.x+2;const inl=s.in||[];inl.slice(0,2).forEach(x=>{const p=pill(px,n.y-PIN+3,x[0],pc(x[0]),false,`From ${x[0]}: ${x[1]}`);h+=p.h+`<line class="source-step-leader" x1="${px+p.w/2}" y1="${n.y-PIN+20}" x2="${px+p.w/2}" y2="${n.y}" stroke="${pc(x[0])}" stroke-width="1.2"/>`;px+=p.w+4});
    if(inl.length>2){const p=pill(px,n.y-PIN+3,`+${inl.length-2}`,"#667085",false,inl.slice(2).map(x=>`From ${x[0]}: ${x[1]}`).join(" | "));h+=p.h}
    px=n.x+2;const outl=s.out||[];outl.slice(0,2).forEach(x=>{const p=pill(px,n.y+H+7,x[0],pc(x[0]),false,`To ${x[0]}: ${x[1]}`);h+=p.h+`<line class="source-step-leader" x1="${px+p.w/2}" y1="${n.y+H}" x2="${px+p.w/2}" y2="${n.y+H+7}" stroke="${pc(x[0])}" stroke-width="1.2"/>`;px+=p.w+4});if(outl.length>2){const p=pill(px,n.y+H+7,`+${outl.length-2}`,"#667085",false,outl.slice(2).map(x=>`To ${x[0]}: ${x[1]}`).join(" | "));h+=p.h}
    h+=`<g class="nd ty-${s.was||s.ty} ${s.pp&&s.pp.length?"has-pp":""} ${(s.ci||TPIS.has(n.id))?"has-tpi":""} ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}" aria-label="${esc2(s.t)}"><title>${esc2(s.t)} - ${TYNM[s.was||s.ty]} - ${esc2(s.sys)}</title>
      <rect class="b" x="${n.x}" y="${n.y}" width="${W}" height="${H}" rx="9" fill="${ch==="new"?"#eef5fc":"var(--card)"}" stroke="${c}" stroke-width="2.2" ${ch==="new"?'stroke-dasharray="6 3"':""}/>
      <circle cx="${n.x+14}" cy="${n.y+14}" r="9" fill="${c}"/><text x="${n.x+14}" y="${n.y+17.5}" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">${s.n}</text>
      ${text(n.x+W/2+(ch!=="same"?-6:8),n.y+(lines.length>1?15:21),lines,{fs:10.8,fw:600,fill:"var(--navy)"})}
      ${text(n.x+9,n.y+H-9,[wrap(s.sys,23,1)[0]],{fs:9.2,fill:"var(--muted)",a:"start"})}
      ${s.pp&&s.pp.length?(d.fixes&&ch!=="same"?`<g><title>Pain point addressed by this change: ${esc2(s.pp.join(" | "))}</title><circle cx="${n.x+W-11}" cy="${n.y+H-11}" r="7" fill="#1f8a4c"/><text x="${n.x+W-11}" y="${n.y+H-7.5}" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">✔</text></g>`:`<circle cx="${n.x+W-11}" cy="${n.y+H-11}" r="7" fill="var(--pain)"/><text x="${n.x+W-11}" y="${n.y+H-7.5}" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">!</text>`):""}
      ${ch!=="same"?`<rect x="${n.x+W-34}" y="${n.y+4}" width="30" height="13" rx="4" fill="var(--prop)"/><text x="${n.x+W-19}" y="${n.y+13.5}" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">${ch==="new"?"NEW":"AI"}</text>`:""}
      ${s.cop?`<rect x="${n.x+W-44}" y="${n.y-7}" width="38" height="13" rx="4" fill="#fff" stroke="#0070c0" stroke-dasharray="3 2"/><text x="${n.x+W-25}" y="${n.y+2.5}" font-size="8" font-weight="700" fill="#0070c0" text-anchor="middle">${esc2(s.cop.tag||"Copilot")}</text>`:""}
      ${s.feas?`<rect x="${n.x+(s.feasdx||0)+W/2-Math.max(W,s.feas.length*4.7+14)/2}" y="${n.y+H+(outl.length?27:3)}" width="${Math.max(W,s.feas.length*4.7+14)}" height="14" rx="4" fill="${/review|assessment|progress/i.test(s.feas)?"#b45309":/applicable|not relevant/i.test(s.feas)?"#667085":/not/i.test(s.feas)?"var(--pain)":/implemented/i.test(s.feas)?"#1d4ed8":"var(--ok)"}"/><text x="${n.x+(s.feasdx||0)+W/2}" y="${n.y+H+(outl.length?37:13)}" font-size="8.3" font-weight="700" fill="#fff" text-anchor="middle">${esc2(s.feas)}</text>${s.feasn?`<text x="${n.x+(s.feasdx||0)+W/2+Math.max(W,s.feas.length*4.7+14)/2+5}" y="${n.y+H+(outl.length?37:13)}" font-size="9.5" font-weight="600" fill="var(--navy)" text-anchor="start">${esc2(s.feasn)}</text>`:""}`:""}
    </g>`;
  });
  const svg=document.querySelector(E.svg);svg.setAttribute("viewBox",`0 0 ${svgW} ${svgH}`);svg.setAttribute("data-f",filter);svg.innerHTML=h+BT;
  svg.querySelectorAll(".nd,.opn").forEach(g=>{const f=()=>detail(g.dataset.id);g.onclick=f;g.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();f()}}});
}
function detail(id){const n=nodes[id];if(!n)return;sel=id;
  document.querySelector(E.svg).querySelectorAll(".opn").forEach(g=>g.classList.toggle("sel",g.dataset.id===id));
  if(n.kind==="opp"||n.kind==="fopp"){const o=n.opp;document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)}${n.P?" / "+esc2(n.P.name):""}</span><h3 style="color:#0070c0">AI Opportunity: ${esc2(o.t)}</h3><dl><div><dt>Type</dt><dd><b>${esc2(o.ty)}</b></dd></div><div><dt>How it would work and tools</dt><dd class="opl">${esc2(o.d)}</dd></div>${(n.P?n.P.steps.flatMap(s=>s.pp||[]):(n.f.pp||[])).length?`<div><dt style="color:var(--pain)">Pain points it addresses</dt><dd class="ppl">${[...new Set(n.P?n.P.steps.flatMap(s=>s.pp||[]):(n.f.pp||[]))].map(esc2).join("<br>")}</dd></div>`:""}${o.feasc?`<div><dt style="color:var(--ok)">AI feasibility comment</dt><dd>${esc2(o.feasc)}</dd></div>`:""}<div><dt>Source</dt><dd>${esc2(o.rid)} (hypothesis - needs validation with the CAPEX team)</dd></div>${o.feas?`<div><dt>Feasibility</dt><dd><b>${esc2(o.feas)}</b></dd></div>`:""}</dl>`;return}
  if(n.kind==="ch"||n.kind==="tpi"){const c=n.c,ids=(c.steps||[]).map(s=>`${n.f.id}|${s}`);document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.toggle("sel",ids.includes(g.dataset.id)));
    const names=ids.map(i=>nodes[i]).filter(Boolean).map(x=>`<b>${esc2(x.P.name)}</b> · ${esc2(x.s.n)}. ${esc2(x.s.t)}`).join("<br>");
    document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)}</span><h3 style="color:${n.kind==="ch"?"#a00015":"#13643a"}">${n.kind==="ch"?"[CHALLENGE] Pain point":`[SOLUTION] ${esc2(c.st||"TPI")}`}</h3><p style="margin:4px 0 0">${esc2(c.t)}</p><dl>${names?`<div><dt>${n.kind==="ch"?"Where it hits (highlighted on the map)":"Steps it addresses (highlighted on the map)"}</dt><dd>${names}</dd></div>`:""}${c.ref?`<div><dt>Reference</dt><dd>${esc2(c.ref)}</dd></div>`:""}<div><dt>Source</dt><dd>${n.kind==="ch"?"CAPEX challenges file":"TPI register - Global Fixed Assets dashboard (CAPEX_Feasibility_Register.xlsx)"}</dd></div></dl>`;return}
  if(n.kind==="dec"){const q=n.dec;document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.remove("sel"));
    const r=(t,v,cls)=>v?`<div><dt>${t}</dt><dd class="${cls||""}">${v}</dd></div>`:"";
    document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f?n.f.name:"")}${n.P?" / "+esc2(n.P.name):""}</span><h3 style="color:#5b2a7a">Decision: ${esc2(q.q)}</h3>${q.d?`<p style="margin:4px 0 0">${esc2(q.d)}</p>`:""}<dl>${r("Example",q.ex?`<i>${esc2(q.ex)}</i>`:"")}${r("Checked by",q.o?esc2(q.o):"")}${r("System",q.sys?esc2(q.sys):"")}<div><dt>If yes</dt><dd>${esc2(q.yes)}</dd></div><div><dt>If no</dt><dd>${esc2(q.no)}</dd></div>${q.pp&&q.pp.length?r('<span style="color:var(--pain)">Pain point when the answer is no</span>',q.pp.map(esc2).join("<br>"),"ppl"):""}${r("Source",q.src?esc2(q.src):"")}</dl>`;return}
  const s=n.s;document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.toggle("sel",g.dataset.id===id));
  const row=(t,v,cls)=>v?`<div><dt>${t}</dt><dd class="${cls||""}">${v}</dd></div>`:"";
  const ownc=o=>o.split(/\s\/\s|,\s*/).map(x=>`<span class="own"><i style="background:${pc(x)}"></i>${esc2(x)}</span>`).join("");
  let html=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)} / ${esc2(n.P.name)} (${esc2(n.P.id)})</span><h3>${s.n}. ${esc2(s.t)}</h3><p style="margin:4px 0 0">${esc2(s.d)}</p><dl>`;
  html+=row("Who",ownc(s.o))+row("System",esc2(s.sys))+row("Activity type",`<b style="color:${TYC[s.ty]}">${TYNM[s.ty]}</b>${s.was?` <small>(as-is: ${TYNM[s.was]})</small>`:""}`);
  if(s.in&&s.in.length)html+=row("Input from",s.in.map(x=>`<b>${esc2(x[0])}</b>: ${esc2(x[1])}`).join("<br>"));
  if(s.out&&s.out.length)html+=row("Output to",s.out.map(x=>`<b>${esc2(x[0])}</b>: ${esc2(x[1])}`).join("<br>"));
  if(s.dec)html+=row("Decision",`<b>${esc2(s.dec.q)}</b><br>Yes &rarr; ${esc2(s.dec.yes)}<br>No &rarr; ${esc2(s.dec.no)}`);
  if(s.ctl)html+=row("Control",esc2(s.ctl));if(s.note)html+=row(`<span style="color:var(--ok)">${/Marked/.test(s.note)?"LT review":"As-Is update (CAPEX feedback, Oct 2026)"}</span>`,esc2(s.note));
  if(s.pp&&s.pp.length)html+=row('<span style="color:var(--pain)">Pain points</span>',s.pp.map(esc2).join("<br>"),"ppl");
  if(s.ci)html+=row("Existing CI / TPI",esc2(s.ci));
  if(page==="tobe"&&s.ch&&s.ch!=="same")html+=row('<span style="color:var(--prop)">AI suggestion (hypothesis, to validate)</span>',`<b>${esc2(s.rec||"")}</b><br>Tools: ${esc2(s.tools||"")}<br><small>Basis: ${esc2(s.opp||"")}</small>`,"opl");
  if(page==="tobe"&&s.cop)html+=row('<span style="color:#0070c0">Copilot / Agent Builder option (added hypothesis, to validate)</span>',`<b>${esc2(s.cop.tool)}</b><br>${esc2(s.cop.d)}`,"opl");
  if(s.feasc)html+=row(`<span style="color:var(--ok)">${esc2(s.feasl||"Feasibility")}</span>`,esc2(s.feasc));
  html+=row("Source",esc2(s.src))+`</dl>`;
  if(page==="tobe"&&s.ch==="same")html+=`<p style="font-size:12px;color:var(--muted)">No change proposed for this step.</p>`;
  document.querySelector(E.det).innerHTML=html;
}
function legend(){const d=DATA[page];const sw=(c,dash)=>`<svg width="22" height="12"><line x1="0" y1="6" x2="22" y2="6" stroke="${c}" stroke-width="1.6" ${dash?'stroke-dasharray="4 3"':""}/></svg>`;
  const box=c=>`<svg width="20" height="12"><rect x="1" y="1" width="18" height="10" rx="3" fill="none" stroke="${c}" stroke-width="2"/></svg>`;
  document.querySelector(E.leg).innerHTML=`<span>${box("#d0021b")}Manual</span><span>${box("#e8891c")}Semi-automated</span><span>${box("#2f6fce")}Automated</span><span><svg width="14" height="14"><circle cx="7" cy="7" r="6.5" fill="#c8102e"/><text x="7" y="10.5" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">!</text></svg>Pain point</span><span><svg width="14" height="14"><path d="M7,1L13,7L7,13L1,7z" fill="#f3ecfa" stroke="#7b3597"/></svg>Decision</span><span>${sw("var(--navy)")}Flow</span><span>${sw(d.accent)}Chain between processes</span><span>${sw(d.accent,1)}Loop back</span>${d.frames.some(f=>f.ch&&f.ch.length)?`<span><svg width="22" height="12"><rect x="1" y="1" width="20" height="10" rx="3" fill="#fdecec" stroke="var(--pain)"/></svg>[CHALLENGE] pain point</span><span><svg width="22" height="12"><rect x="1" y="1" width="20" height="10" rx="3" fill="#e6f4ec" stroke="var(--ok)"/></svg>[SOLUTION] TPI / CI</span><span>${sw(d.accent,1)}Same output</span>`:""}${d.frames.some(f=>f.procs.some(p=>p.steps.some(s=>s.gate&&s.fix&&!s.noRetry)))?`<span>${sw("var(--navy)",1)}Retry after the fix</span>`:""}${d.frames.some(f=>f.procs.some(p=>p.steps.some(s=>s.dec&&s.dec.nx&&s.dec.nx.end)))?`<span><svg width="26" height="14"><rect x="1" y="1" width="24" height="12" rx="6" fill="#fdecec" stroke="#d0021b" stroke-width="1.3"/></svg>End of the flow (reject / hold)</span>`:""}<span><svg width="34" height="14"><rect width="34" height="14" rx="4" fill="${d.accent}"/><text x="17" y="10.5" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">Input</text></svg>Trigger / input</span><span><svg width="18" height="14"><path d="M1,1 L12,1 L17,6 L17,13 L1,13z" fill="#fff7e0" stroke="#d9a400"/></svg>Output</span>${page==="tobe"?`<span><svg width="70" height="16"><rect x="1" y="1" width="68" height="14" rx="7" fill="none" stroke="#0070c0" stroke-width="1.3" stroke-dasharray="3 2"/><text x="35" y="11.5" font-size="9" font-weight="700" fill="#0070c0" text-anchor="middle">AI: R2R</text></svg>AI-suggested dependency</span><span><svg width="60" height="16"><rect x="1" y="1" width="58" height="14" rx="4" fill="#e8f1fb" stroke="#0070c0"/><text x="30" y="11.5" font-size="8.5" font-weight="700" fill="#0070c0" text-anchor="middle">AI Opportunity</text></svg>AI opportunity (register)</span><span><svg width="30" height="13"><rect width="30" height="13" rx="4" fill="#0070c0"/><text x="15" y="10" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">AI</text></svg>Step changed (AI suggested)</span><span><svg width="30" height="13"><rect width="30" height="13" rx="4" fill="#0070c0"/><text x="15" y="10" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">NEW</text></svg>New step</span>`:""}<span>Pills = input from / output to; strips = upstream / downstream</span>`;}
function setScale(s){scale=Math.max(.3,Math.min(2,s));const svg=document.querySelector(E.svg);svg.style.width=svgW*scale+"px";svg.style.height=svgH*scale+"px"}
function fit(){const w=document.querySelector(E.scroll).clientWidth-10;setScale(Math.min(1,w/svgW))}
function render(pg,fl){if(pg)page=pg;if(fl)filter=fl;sel=null;draw();legend();document.querySelector(E.det).innerHTML='<p class="none">Select a step in the map to see what happens, who does it, the system, inputs, outputs, decisions, pain points and the source.</p>';fit()}
function setFilter(f){filter=f;document.querySelector(E.svg).setAttribute("data-f",f)}
return {getNodes:()=>nodes,getDimensions:()=>({width:svgW,height:svgH}),render,setFilter,zi:()=>setScale(scale+.15),zo:()=>setScale(scale-.15),fit,page:()=>page,setScale,getScale:()=>scale};
};
window.TowerRenderers["O2C"]=function makeTowerMap(KEY,DATA,E){
const TPIS=new Set();Object.values(DATA).forEach(dd=>dd&&dd.frames&&dd.frames.forEach(f=>(f.tpi||[]).forEach(t=>(t.steps||[]).forEach(r=>TPIS.add(f.id+"|"+r)))));
const W=158,H=(KEY==="AIS"?88:74),G=46,DW=34,PAD=24,FH=E.frameHeaderHeight||46,ROWL=E.processHeaderGap||22,PIN=E.processInputGap||24,POUT=24,RGAP=44,STRIP=E.handoffStripHeight||30,INW=118,CH=14;
const TYC={man:"#d0021b",auto:"#2f6fce",hyb:"#e8891c"},TYNM={man:"Manual",hyb:"Semi automated",auto:"Automated"};
const esc2=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function wrap(t,n,max){const w=String(t).split(" ");const L=[];let c="";w.forEach(x=>{if((c+" "+x).trim().length>n){if(c)L.push(c);c=x}else c=(c+" "+x).trim()});if(c)L.push(c);max=max||2;if(L.length>max){L[max-1]=L.slice(max-1).join(" ");if(L[max-1].length>n+2)L[max-1]=L[max-1].slice(0,n)+"…";L.length=max}return L}
function text(x,y,lines,o={}){return `<text x="${x}" y="${y}" font-size="${o.fs||11.5}" font-weight="${o.fw||500}" fill="${o.fill||"var(--ink)"}" text-anchor="${o.a||"middle"}" font-family="Inter,Segoe UI,Arial,sans-serif">${lines.map((l,i)=>`<tspan x="${x}" dy="${i?1.2:0}em">${esc2(l)}</tspan>`).join("")}</text>`}
let page="asis",filter="all",nodes={},svgW=0,svgH=0,scale=1,sel=null;
const pc=p=>{const k=String(p).split(/[ -]/)[0];return ({O2C:"var(--O2C)",R2R:"var(--R2R)",TAX:"var(--Tax)",Tax:"var(--Tax)",P2P:"var(--P2P)",CAPEX:"var(--CAPEX)",Controlling:"var(--Controlling)",DMT:"#0e7490",Customer:"#8a6d3b",Distributors:"#8a6d3b",Distribution:"#0f766e",Bank:"#475467",Payroll:"#b7791f",Local:"#b7791f",FP:"var(--FPA)",HR:"#9d174d",International:"#152847",Area:"#152847",Group:"#152847",MC:"#b7791f",BUD:"#b7791f",BUDs:"#b7791f",Brand:"#b7791f",Cost:"#b7791f",Business:"#b7791f",CFO:"#7b3597",CP:"#7b3597",CBP:"#c77a0a",Embedded:"#c77a0a",SAP:"#667085",CMR:"#667085",PMR:"#667085",AZ:"#667085",AZForce:"#667085",Enpire:"#667085",OneGRC:"#475467",Approver:"#7b3597",Market:"#b7791f",Posting:"var(--R2R)",FBPs:"#c77a0a",Planning:"#667085","P&MR":"#667085"})[k]||(String(p).startsWith("FP&A")?"var(--FPA)":"#667085")};
const SHT={man:"Manual",hyb:"Semi-auto",auto:"Auto"};
function mkr(n,s){const a=SHT[s.was],b=SHT[s.ty],w=(a.length+b.length)*5.3+30,x=n.x+(W-w)/2,y=n.y+H-36;return `<g><title>Automation level: ${TYNM[s.was]} (As-Is) to ${TYNM[s.ty]} (after AI / automation)</title><rect x="${x}" y="${y}" width="${w}" height="14" rx="7" fill="var(--card)" stroke="#9aa4b2" stroke-width="1"/><text x="${x+w/2}" y="${y+10.2}" font-size="9.2" font-weight="700" text-anchor="middle"><tspan fill="${TYC[s.was]}">${a}</tspan><tspan fill="#667085"> → </tspan><tspan fill="${TYC[s.ty]}">${b}</tspan></text></g>`}
function pill(x,y,label,c,dash,title,anchorLeft){const w=label.length*6.2+16;return {w,h:`<g class="source-pill"><title>${esc2(title||label)}</title><rect x="${x}" y="${y}" width="${w}" height="17" rx="8.5" fill="var(--card)" stroke="${c}" stroke-width="1.3" ${dash?'stroke-dasharray="3 2"':""}/>${text(x+w/2,y+12,[label],{fs:10,fw:600,fill:c})}</g>`}}
function layout(d){
  nodes={};let h="",y=PAD+10,maxX=0;const x0=PAD+(d.chan||60);
  // phase chevrons (processes grouped by key process)
  {const raw=d.frames.flatMap(f=>f.procs.map(p=>({p,f})));const procs=[];raw.forEach(it=>{const k=it.p.phase||it.p.name;const L=procs[procs.length-1];if(L&&L.k===k&&L.f===it.f){L.ids.push(it.p.id)}else procs.push({k,f:it.f,p:it.p,ids:[it.p.id]})});const cw=procs.length<=3?230:150,ch=40;let cx=x0;
   h+=text(x0,y+12,["Process phases"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});y+=18;
   procs.forEach(({p,f},i)=>{const fi=d.frames.indexOf(f);const col=d.accent;const op=.55+.15*(fi%3);
     h+=`<g><title>${esc2(f.name)} / ${esc2(p.phase||p.name)} (${esc2(procs[i].ids.join(", "))})</title><path d="M${cx},${y} L${cx+cw-14},${y} L${cx+cw},${y+ch/2} L${cx+cw-14},${y+ch} L${cx},${y+ch} L${cx+14},${y+ch/2}z" fill="${col}" fill-opacity="${op}"/>${text(cx+cw/2+4,y+ch/2+4,wrap(`${i+1}. ${p.phase||p.name}`,cw>200?32:20,1),{fs:10.5,fw:700,fill:"#fff"})}</g>`;cx+=cw+4});
   maxX=Math.max(maxX,cx);y+=ch+22;}
  d.frames.forEach((f,fi)=>{
    const top=y;const c=d.accent;
    y+=FH;
    // upstream strip
    let px=x0+8;const upY=y+4;h+=text(x0,upY+12,["Upstream"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});px+=66;
    f.up.forEach(u=>{const p=pill(px,upY,(u.c?"AI: ":"")+u.p,u.c?"var(--prop)":pc(u.p),!!u.c,`${u.c?"AI SUGGESTED - ":""}${u.p}: ${u.w} (${u.src})`);h+=p.h;px+=p.w+6});
    maxX=Math.max(maxX,px);y+=STRIP;
    f.procs.forEach((P,pi)=>{
      y+=ROWL;const rowY=y+PIN;let x=x0;const items=[];
      nodes[`${f.id}|${P.id}|in`]={id:`${f.id}|${P.id}|in`,x,y:rowY,w:INW,h:H,kind:"in",lab:P.inbox[0],txt:P.inbox[1],f,P};x+=INW+G-12;
      P._headingY=y;h+=`<g class="source-process-heading">`;h+=text(x0,y-4,[`${P.name}`],{fs:12,fw:700,fill:"var(--navy)",a:"start"});h+=text(x0+P.name.length*7.2+10,y-4,[`${P.id} · ${P.owner}`],{fs:10.5,fill:"var(--muted)",a:"start"});h+=`</g>`;
      const seq=[`${f.id}|${P.id}|in`];let fext=0;P._rb=rowY+H;P._gates=false;
      P.steps.forEach((s,j)=>{
        if(s.gate){P._gates=true;x+=60;const gid=`${f.id}|${P.id}|${s.n}`;nodes[gid]={id:gid,x,y:rowY+H/2-DW/2,w:DW,h:DW,kind:"dec",gate:true,dec:s,f,P,j,ln:P.steps.slice(j+1).filter(q=>q.gate&&q.nx&&!q.nx.end).length};seq.push(gid);
          if(s.fix){const fs=s.fix,fid=`${f.id}|${P.id}|${fs.n}`;nodes[fid]={id:fid,x:x+DW/2-W/2,y:rowY+H+56,w:W,h:H,s:fs,f,P,j,fixOf:gid};fext=56+H+4;P._rb=rowY+H+fext-4}
          x+=DW+G+76;return}
        if(s.fork){P._gates=true;const BG=56,nb=s.branches.length;x+=30;const dx=x,sx=dx+DW+G+40,bx=sx+W+30;
          s.branches.forEach((b,bi)=>{const by=rowY+bi*(H+BG);const nq=s.branches[bi+1];const did=`${f.id}|${P.id}|${b.step.n}|d`;
            nodes[did]={id:did,x:dx,y:by+H/2-DW/2,w:DW,h:DW,kind:"dec",fork:true,f,P,dec:{q:b.q,ex:b.ex,o:b.o,d:b.d,src:b.src,yes:`Step ${b.step.n} - ${b.step.t}`,no:nq?`Check: ${nq.q}`:(s.elseLab||"No")+" - release"}};
            const sid=`${f.id}|${P.id}|${b.step.n}`;nodes[sid]={id:sid,x:sx,y:by,w:W,h:H,s:b.step,f,P,j,br:true}});
          const fid=`${f.id}|${P.id}|fork${j}`;nodes[fid]={id:fid,kind:"fork",fk:s,f,P,x:dx,w:bx-dx,dx,sx,bx,rowY};seq.push(fid);
          fext=Math.max(fext,(nb-1)*(H+BG)+34);P._rb=Math.max(P._rb,rowY+H+(nb-1)*(H+BG)+30);x=bx+40;return}
        const id=`${f.id}|${P.id}|${s.n}`;nodes[id]={id,x,y:rowY,w:W,h:H,s,f,P,j};items.push(id);seq.push(id);x+=W+G;
        if(s.dec){x+=30;nodes[id+"|d"]={id:id+"|d",x:x,y:rowY+H/2-DW/2,w:DW,h:DW,dec:s.dec,kind:"dec",step:s,f,P,ln:P.steps.slice(j+1).filter(q=>q.dec&&q.dec.nx&&!q.dec.nx.end).length};x+=DW+G+40}});
      P._seq=seq;
      if(P.outdoc){x+=14;nodes[`${f.id}|${P.id}|out`]={id:`${f.id}|${P.id}|out`,x,y:rowY+8,w:150,h:H-16,kind:"out",doc:P.outdoc,f,P,from:P._gates?seq[seq.length-1]:items[items.length-1]};seq.push(`${f.id}|${P.id}|out`);x+=150+G}
      if(d.key==="tobe"&&P.opp){x+=6;nodes[`${f.id}|${P.id}|opp`]={id:`${f.id}|${P.id}|opp`,x,y:rowY-6,w:190,h:H+12,kind:"opp",opp:P.opp,f,P,from:items[items.length-1]};x+=210}
      maxX=Math.max(maxX,x);
      y=rowY+H+POUT+RGAP+fext+(P.steps.some(s=>s.dec&&s.dec.nx)?30:0);
    });
    if(d.key==="tobe"&&f.opp){nodes[`${f.id}|opp`]={id:`${f.id}|opp`,x:x0,y:y-18,w:460,h:44,kind:"fopp",opp:f.opp,f};y+=56}
    // challenge / TPI strips
    if((f.ch&&f.ch.length)||(f.tpi&&f.tpi.length)){y+=4;
      const strip=(items,kind,lab,fill,stroke,col,bw)=>{h+=text(x0,y+12,[lab],{fs:10.5,fw:700,fill:col,a:"start"});y+=20;let bx=x0;
        items.forEach((c,i)=>{const id=`${f.id}|${kind}${i}`;const head=kind==="ch"?"[CHALLENGE]":`[SOLUTION] ${c.st||"TPI"}`;const tl=wrap(c.t,Math.floor(bw/5.6),2);nodes[id]={id,kind,c,f,x:bx,y,w:bw,h:50};
          h+=`<g class="opn ${sel===id?"sel":""}" tabindex="0" role="button" data-id="${id}"><title>${esc2(head)}: ${esc2(c.t)}${c.ref?" - "+esc2(c.ref):""}</title><rect class="b" x="${bx}" y="${y}" width="${bw}" height="50" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>${text(bx+10,y+14,[head],{fs:9.5,fw:700,fill:col,a:"start"})}${c.ref?text(bx+bw-8,y+14,[c.ref],{fs:8.8,fill:col,a:"end"}):""}${text(bx+10,y+29,tl,{fs:9.8,fill:"var(--navy)",a:"start"})}</g>`;bx+=bw+12});
        maxX=Math.max(maxX,bx);y+=50+14};
      if(f.ch&&f.ch.length)strip(f.ch,"ch","Pain points (register)","#fdecec","var(--pain)","#a00015",330);
      if(f.tpi&&f.tpi.length)strip(f.tpi,"tpi","TPI / CI initiatives (register)","#e6f4ec","var(--ok)","#13643a",430);
    }
    // downstream strip
    px=x0+8;const dnY=y-10;h+=text(x0,dnY+12,["Downstream"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});px+=78;
    f.down.forEach(u=>{const p=pill(px,dnY,(u.c?"AI: ":"")+u.p,u.c?"var(--prop)":pc(u.p),!!u.c,`${u.c?"AI SUGGESTED - ":""}${u.p}: ${u.w} (${u.src})`);h+=p.h;px+=p.w+6});
    maxX=Math.max(maxX,px);y+=STRIP+6;
    f._box={top,bot:y,c};y+=26;
  });
  const FR=Math.max(maxX+40,1180);d._fr=FR;svgW=FR;svgH=y+PAD;
  return h;
}
function noBranch(n){const q=n.dec,nx=q.nx,cx=n.x+DW/2,by=n.y+DW,rowY=n.y-(H/2-DW/2),rb=n.P&&n.P._rb?n.P._rb:rowY+H;let o="";if(nx.none)return nx.nl?text(cx+5,by+13,[nx.nl],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"}):"";
  if(nx.end){const hold=nx.kind==="hold",w=Math.max(96,nx.end.length*6.4+22),ty=(n.gate&&rb>rowY+H)?rowY+H+56+H/2-13:rb+34;o+=`<path d="M${cx},${by} L${cx},${ty}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+13,[q.swap?"Yes":"No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})+`<g><title>${esc2(q.q)} No: ${esc2(q.no)}</title><rect x="${cx-w/2}" y="${ty}" width="${w}" height="26" rx="13" fill="${hold?"#fff4e0":"#fdecec"}" stroke="${hold?"#e8891c":"#d0021b"}" stroke-width="1.5"/>${text(cx,ty+17,[nx.end],{fs:9.8,fw:700,fill:hold?"#8a4b00":"#a00015"})}</g>`;return o}
  const T=nx.out?nodes[`${n.f.id}|${n.P.id}|out`]:nodes[`${n.f.id}|${n.P.id}|${nx.step}`];if(!T)return text(cx,n.y+DW+11,wrap("No: "+q.no,26,1),{fs:8.5,fill:"#7b3597"});
  const yb=rb+40+(n.ln||0)*12,ex=nx.out?T.x+T.w/2:T.x+T.w-16,ty=T.y+T.h;
  o+=`<path d="M${cx},${by} L${cx},${yb} L${ex},${yb} L${ex},${ty}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+13,[q.swap?"Yes":"No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
  const nl=q.nl||nx.nl;if(nl){const lw=nl.length*5.4+8;o+=`<rect x="${cx+10}" y="${yb-7}" width="${lw}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(cx+14,yb+3,[nl],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}
  return o}
function fixBranch(n){const q=n.dec,F=nodes[`${n.f.id}|${n.P.id}|${q.fix.n}`];if(!F)return "";const cx=n.x+DW/2,by=n.y+DW,rowY=n.y-(H/2-DW/2),ym=rowY+H+18,ex=F.x+W+16,rx=F.x-16,cy=rowY+H/2;let o="";
  o+=`<path d="M${cx},${by} L${cx},${ym} L${ex},${ym} L${ex},${F.y+H/2} L${F.x+W},${F.y+H/2}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+12,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
  const S1=nodes[`${n.f.id}|${n.P.id}|1`];
  if(n.P.id==="SOC-01.1"){const S2=nodes[`${n.f.id}|${n.P.id}|1`];if(S2){const k=["1a","1b","1c"].indexOf(q.fix.n),yy=F.y+H+22+k*9,tx=S2.x+30+k*14,fx=F.x+W/2;o+=`<path d="M${fx},${F.y+H} L${fx},${yy} L${tx},${yy} L${tx},${S2.y+H}" class="fl" marker-end="url(#o1)"/>`}}else if(S1&&false){const k=["1a","1b","1c"].indexOf(q.fix.n),by=F.y+H+18+k*10,sx=S1.x+30+k*12,fx=F.x+W/2;o+=`<path d="M${fx},${F.y+H} L${fx},${by} L${sx},${by} L${sx},${S1.y+H}" class="fl" stroke-dasharray="5 3" marker-end="url(#o1)"/>`;
  if(k===0)o+=`<rect x="${sx+8}" y="${by-7}" width="${"Retry from step 1".length*5+6}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(sx+11,by+3,["Retry from step 1"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}
  else if(!q.noRetry){o+=`<path d="M${F.x},${F.y+H/2} L${rx},${F.y+H/2} L${rx},${cy} L${n.x},${cy}" class="fl" stroke-dasharray="5 3" marker-end="url(#o1)"/>`;
  const ly=(F.y+H/2+cy)/2;o+=`<rect x="${rx-34}" y="${ly-7}" width="31" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(rx-4,ly+3,["Retry"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"end"});
  }
  if(n.P.id==="SOC-05.1"){const O=nodes[`${n.f.id}|${n.P.id}|out`],S3=nodes[`${n.f.id}|${n.P.id}|3`],fx=F.x+W/2;if(O){const tx=O.x+O.w/2,jy=F.y+H+30;o+=`<path d="M${fx+12},${F.y+H} L${fx+12},${jy} L${tx},${jy} L${tx},${O.y+O.h}" class="fl" marker-end="url(#o1)"/>`}if(S3){const tx=S3.x+W-10,jy=F.y+H+16;o+=`<path d="M${fx-12},${F.y+H} L${fx-12},${jy} L${tx},${jy} L${tx},${S3.y+H}" class="fl" marker-end="url(#o1)"/>`}}else if(q.fix.join){const sq=n.P._seq||[],J=q.fix.join==="out"?nodes[`${n.f.id}|${n.P.id}|out`]:nodes[sq[sq.indexOf(n.id)+2]];if(J){const jx=F.x+W/2,jy=F.y+H+34,tx=J.x+J.w/2;if(J.kind==="dec"){const cyy=J.y+J.h/2,mx=J.x-14;o+=`<path d="M${jx},${F.y+H} L${jx},${jy} L${mx},${jy} L${mx},${cyy} L${J.x},${cyy}" class="fl" marker-end="url(#o1)"/>`}else o+=`<path d="M${jx},${F.y+H} L${jx},${jy} L${tx},${jy} L${tx},${J.y+J.h}" class="fl" marker-end="url(#o1)"/>`}}
  return o}
function draw(){
  const d=DATA[page];const strips=layout(d);let h=`<defs><marker id="o1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--navy)"/></marker><marker id="o2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#7b3597"/></marker><marker id="o3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#0070c0"/></marker><marker id="o4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="${d.accent}"/></marker><marker id="o5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0L10,5L0,10z" fill="${d.accent}"/></marker></defs>
  <style>.fl{fill:none;stroke:var(--navy);stroke-width:1.6}.rw{fill:none;stroke:#7b3597;stroke-width:1.4;stroke-dasharray:5 4}svg[data-f="man"] .nd:not(.ty-man),svg[data-f="hyb"] .nd:not(.ty-hyb),svg[data-f="auto"] .nd:not(.ty-auto),svg[data-f="pp"] .nd:not(.has-pp),svg[data-f="tpi"] .nd:not(.has-tpi){opacity:.14}svg[data-f="tpi"] .nd.has-tpi rect.b{stroke:#13643a;stroke-width:4;filter:drop-shadow(0 0 5px rgba(19,100,58,.55))}.opn{cursor:pointer}.opn:hover rect.b,.opn.sel rect.b{stroke-width:2.4}</style>`;
  // frames
  d.frames.forEach((f,fi)=>{const b=f._box;const wdt=d._fr-PAD*2;
    h+=`<rect x="${PAD}" y="${b.top}" width="${wdt}" height="${b.bot-b.top}" rx="14" fill="${b.c}" fill-opacity=".05" stroke="${b.c}" stroke-opacity=".35"/><rect x="${PAD}" y="${b.top}" width="${wdt}" height="${FH-6}" rx="14" fill="${b.c}"/><rect x="${PAD}" y="${b.top+20}" width="${wdt}" height="${FH-26}" fill="${b.c}"/>`;
    {const ts=d.tshift||0;h+=text(PAD+16+ts,b.top+26,[`${fi+1}. ${f.name}`],{fs:15,fw:700,fill:"#fff",a:"start"})+text(PAD+16+ts+f.name.length*9.2+30,b.top+26,[`${f.owner} · ${f.win}`],{fs:11,fill:"#fff",a:"start"});}
    if(f.pp&&f.pp.length)h+=`<g><title>Pain points: ${esc2(f.pp.join(" | "))}</title><circle cx="${PAD+wdt-22}" cy="${b.top+20}" r="9" fill="#fff"/><text x="${PAD+wdt-22}" y="${b.top+24.5}" font-size="12" font-weight="700" fill="var(--pain)" text-anchor="middle">!</text></g>`;
    if(f.ctl&&f.ctl.length)h+=`<g><title>Controls: ${esc2(f.ctl.join(" | "))}</title><circle cx="${PAD+wdt-48}" cy="${b.top+20}" r="9" fill="#fff"/><text x="${PAD+wdt-48}" y="${b.top+24.5}" font-size="11" font-weight="700" fill="${b.c}" text-anchor="middle">C</text></g>`;
  });
  h+=strips;let BT="";(d.frames||[]).forEach(f=>f.procs.forEach(P=>{if(P.back){const A=nodes[`${f.id}|${P.id}|${P.back.from}`],B=nodes[`${f.id}|${P.id}|${P.back.to}`];if(A&&B){const yy=A.y+A.h+16,ax=A.x+A.w/2,bx=B.x+B.w/2+(P.back.dx||0);h+=`<path d="M${ax},${A.y+A.h} L${ax},${yy} L${bx},${yy} L${bx},${B.y+B.h}" class="fl"/>`;BT+=`<path d="M${bx},${B.y+B.h+19} L${bx},${B.y+B.h}" class="fl" marker-end="url(#o1)"/>`}}}));
  // chain between processes and key processes (internal O2C flow)
  (d.chain||[]).forEach((e,i)=>{const A=nodes[e.a],B=nodes[e.b];if(!A||!B)return;const lane=PAD+CH+(i%(d.lanes||4))*(d.lanes?8:11);const col=d.accent;
    const ax=A.x+A.w/2,ay=A.y+A.h,yg=e.below&&A.f&&A.f._box?A.f._box.bot+7+(i%3)*6:A.y+A.h+(e.dy!=null?e.dy:(A.kind==="out"?30:34));
    const by=B.kind==="in"?B.y+B.h/2:B.y;let p;
    if(B.kind==="in"){p=`M${ax},${ay} L${ax},${yg} L${lane},${yg} L${lane},${by} L${B.x},${by}`}
    else{p=`M${ax},${ay} L${ax},${yg} L${lane},${yg} L${lane},${B.y-16} L${B.x+B.w/2-24},${B.y-16} L${B.x+B.w/2-24},${B.y}`}
    h+=`<path d="${p}" fill="none" stroke="${col}" stroke-width="${e.loop?1.5:2.2}" ${e.loop?'stroke-dasharray="6 4"':""} stroke-opacity=".9" marker-end="url(#${e.loop?"o4":"o5"})"/>`;
    if(e.lab){const lw=e.lab.length*5.6+10,lx=e.below?ax-lw-8:ax+8;const ly=yg+(e.ldy||0);h+=`<rect x="${lx}" y="${ly-13}" width="${lw}" height="15" rx="4" fill="var(--card)" fill-opacity=".9"/>`+text(lx+5,ly-2,[e.lab],{fs:9.2,fw:600,fill:col,a:"start"})}
  });
  // same-output link between two processes' outputs
  d.frames.forEach(f=>{const so=f.sameOut;if(!so)return;const A=nodes[`${f.id}|${so.a}|out`],B=nodes[`${f.id}|${so.b}|out`];if(!A||!B)return;const ax=A.x+A.w/2,bx=B.x+B.w/2,ym=B.y-72;
    h+=`<path d="M${ax},${A.y+A.h} L${ax},${ym} L${bx},${ym} L${bx},${B.y}" fill="none" stroke="${d.accent}" stroke-width="1.8" stroke-dasharray="3 4" stroke-linecap="round"/><circle cx="${ax}" cy="${A.y+A.h}" r="3.5" fill="${d.accent}"/><circle cx="${bx}" cy="${B.y}" r="3.5" fill="${d.accent}"/>`;
    if(so.lab){const lw=so.lab.length*5.6+14,lx=Math.min(ax,bx)+Math.abs(bx-ax)/2-lw/2;h+=`<rect x="${lx}" y="${ym-9}" width="${lw}" height="17" rx="8" fill="var(--card)" stroke="${d.accent}" stroke-width="1"/>`+text(lx+lw/2,ym+3,[so.lab],{fs:9.2,fw:600,fill:d.accent})}});
  // edges
  d.frames.forEach(f=>f.procs.forEach(P=>{if(!P._gates)return;const sq=P._seq;for(let i=0;i<sq.length-1;i++){const A=nodes[sq[i]],B=nodes[sq[i+1]];if(!A||!B)continue;if(A.kind==="fork"){A.next=B;continue}const ay=A.kind==="in"?A.y+A.h/2:(A.kind==="dec"?A.y+A.h/2:A.y+H/2);h+=`<path d="M${A.x+A.w},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`}}));
  Object.values(nodes).forEach(n=>{if(n.kind==='in'){if(n.P._gates)return;const B=nodes[`${n.f.id}|${n.P.id}|1`];if(B)h+=`<path d="M${n.x+n.w},${n.y+H/2} L${B.x},${B.y+H/2}" class="fl" marker-end="url(#o1)"/>`;return}if(n.kind||n.fixOf||(n.P&&n.P._gates))return;const P=n.P,j=n.j;const nxt=P.steps[j+1];if(!nxt)return;const B=nodes[`${n.f.id}|${P.id}|${nxt.n}`];const D=nodes[n.id+"|d"];const ay=n.y+H/2;
    if(D){h+=`<path d="M${n.x+W},${ay} L${D.x},${ay}" class="fl" marker-end="url(#o1)"/><path d="M${D.x+DW},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`;}
    else h+=`<path d="M${n.x+W},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`});
  // handoff pills on steps + decisions + nodes
  Object.values(nodes).filter(n=>n.kind==="fork").forEach(n=>{const s=n.fk,f=n.f,P=n.P,cy0=n.rowY+H/2,cxd=n.dx+DW/2;let o="",yEnd=cy0;
    s.branches.forEach((b,bi)=>{const D=nodes[`${f.id}|${P.id}|${b.step.n}|d`],S=nodes[`${f.id}|${P.id}|${b.step.n}`];const cy=S.y+H/2;
      o+=`<path d="M${D.x+DW},${cy} L${S.x},${cy}" class="fl" marker-end="url(#o1)"/><path d="M${S.x+W},${cy} L${n.bx},${cy}" class="fl"/>`;yEnd=Math.max(yEnd,cy);
      const nxD=s.branches[bi+1]?nodes[`${f.id}|${P.id}|${s.branches[bi+1].step.n}|d`]:null;
      if(nxD)o+=`<path d="M${cxd},${D.y+DW} L${cxd},${nxD.y}" class="fl" marker-end="url(#o1)"/>`+text(cxd+5,D.y+DW+13,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
      else{const ye=S.y+H+30;const OT=s.elseOut?nodes[`${f.id}|${P.id}|out`]:null;o+=(OT?`<path d="M${cxd},${D.y+DW} L${cxd},${ye} L${OT.x+OT.w/2},${ye} L${OT.x+OT.w/2},${OT.y+OT.h}" class="fl" marker-end="url(#o1)"/>`:`<path d="M${cxd},${D.y+DW} L${cxd},${ye} L${n.bx},${ye}" class="fl"/>`)+text(cxd+5,D.y+DW+13,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
        if(s.elseLab){const lw=s.elseLab.length*5.4+8;o+=`<rect x="${cxd+10}" y="${ye-7}" width="${lw}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(cxd+14,ye+3,[s.elseLab],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}if(!OT)yEnd=Math.max(yEnd,ye)}});
    o+=`<path d="M${n.bx},${yEnd} L${n.bx},${cy0}" class="fl"/>`;if(n.next)o+=`<path d="M${n.bx},${cy0} L${n.next.x},${cy0}" class="fl" marker-end="url(#o1)"/>`;
    if(s.lab)o+=text(n.dx+DW/2,n.rowY-6,[s.lab],{fs:10,fw:700,fill:"var(--muted)"});
    h+=o});
  Object.values(nodes).forEach(n=>{
    if(n.kind==="ch"||n.kind==="tpi"||n.kind==="fork")return;
    if(n.kind==="opp"||n.kind==="fopp"){const o=n.opp,fr=n.kind==="opp"?nodes[`${n.f.id}|${n.P.id}|out`]:null;const tl=wrap(o.t,n.kind==="opp"?26:70,n.kind==="opp"?2:1);
      if(fr)h+=`<path d="M${fr.x+fr.w},${fr.y+fr.h/2} L${n.x},${n.y+n.h/2}" fill="none" stroke="#0070c0" stroke-width="1.4" stroke-dasharray="4 3" marker-end="url(#o3)"/>`;
      h+=`<g class="opn ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}"><title>AI Opportunity (${esc2(o.ty)}): ${esc2(o.t)} - ${esc2(o.d)}</title><rect class="b" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="9" fill="#e8f1fb" stroke="#0070c0" stroke-width="1.5"/>
      ${text(n.x+10,n.y+15,[n.kind==="fopp"?`AI Opportunity - ${n.f.name.length>30?n.f.name.slice(0,29)+"…":n.f.name}`:"AI Opportunity"],{fs:10.5,fw:700,fill:"#0070c0",a:"start"})}<rect x="${n.x+n.w-96}" y="${n.y+5}" width="90" height="14" rx="4" fill="#0070c0"/><text x="${n.x+n.w-51}" y="${n.y+15}" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">${esc2(o.ty)}</text>
      ${text(n.x+10,n.y+31,tl,{fs:10.3,fill:"var(--navy)",a:"start"})}${o.feas?`<rect x="${n.kind==="fopp"?n.x+n.w+8:n.x}" y="${n.kind==="fopp"?n.y+n.h/2-7.5:n.y+n.h+4}" width="${o.feas.length*5.6+16}" height="15" rx="4" fill="${/applicable|necessary|required/i.test(o.feas)?"#667085":/not/i.test(o.feas)?"var(--pain)":/progress/i.test(o.feas)?"var(--hyb)":"var(--ok)"}"/><text x="${(n.kind==="fopp"?n.x+n.w+8:n.x)+8}" y="${n.kind==="fopp"?n.y+n.h/2+3:n.y+n.h+14.5}" font-size="9" font-weight="700" fill="#fff" text-anchor="start">${esc2(o.feas)}</text>`:""}</g>`;return}
    if(n.kind==="in"){const col=d.accent;h+=`<g><title>${esc2(n.lab)}: ${esc2(n.txt)}</title><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="9" fill="${col}"/>${text(n.x+n.w/2,n.y+15,[n.lab],{fs:9.5,fw:700,fill:"#fff"})}${text(n.x+n.w/2,n.y+31,wrap(n.txt,21,3),{fs:9.4,fill:"#fff"})}</g>`;return}
    if(n.kind==="out"){const fr=nodes[n.from];if(!n.P._gates)h+=`<path d="M${fr.x+fr.w},${fr.y+H/2} L${n.x},${n.y+n.h/2}" class="fl" marker-end="url(#o1)"/>`;h+=`<g><title>Output: ${esc2(n.doc)}${n.P.outnote?" - "+esc2(n.P.outnote):""}</title><path d="M${n.x},${n.y} L${n.x+n.w-12},${n.y} L${n.x+n.w},${n.y+12} L${n.x+n.w},${n.y+n.h} L${n.x},${n.y+n.h}z" fill="#fff7e0" stroke="#d9a400" stroke-width="1.4"/><path d="M${n.x+n.w-12},${n.y} L${n.x+n.w-12},${n.y+12} L${n.x+n.w},${n.y+12}" fill="none" stroke="#d9a400"/>${text(n.x+8,n.y+15,["Output"],{fs:9.5,fw:700,fill:"#8a6d00",a:"start"})}${text(n.x+n.w/2,n.y+30,wrap(n.doc,24,n.doc.length>48?3:2),{fs:9.8,fill:"var(--navy)"})}</g>`;(n.P.outto||[]).slice(0,2).forEach((x,i)=>{const ox=n.x+n.w/2+12+i*4,p=pill(ox,n.y+n.h+7,x[0],pc(x[0]),false,`To ${x[0]}: ${x[1]}`);h+=p.h+`<line class="source-step-leader" x1="${ox+p.w/2}" y1="${n.y+n.h}" x2="${ox+p.w/2}" y2="${n.y+n.h+7}" stroke="${pc(x[0])}" stroke-width="1.2"/>`});return}
    if(n.kind==="dec"){const cx=n.x+DW/2,cy=n.y+DW/2,q=n.dec;const ql=wrap(q.q,22,2);h+=`<g class="opn ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}"><title>${esc2(q.q)} Yes: ${esc2(q.yes)}. No: ${esc2(q.no)}</title>${n.fork?`<rect x="${cx-(ql[0].length*5.5+8)/2}" y="${n.y-17}" width="${ql[0].length*5.5+8}" height="14" rx="3" fill="var(--card)" fill-opacity=".95"/>`:""}<path class="b" d="M${cx},${n.y} L${n.x+DW},${cy} L${cx},${n.y+DW} L${n.x},${cy}z" fill="#f3ecfa" stroke="#7b3597" stroke-width="1.4"/>${text(cx,n.y-7-(ql.length-1)*11.4,ql,{fs:9.5,fw:600,fill:"#5b2a7a"})}${text(n.x+DW+4,cy-5,[q.swap?"No":"Yes"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}${q.note?text(cx+10,n.y+DW+28,wrap(q.note,18,3),{fs:8.3,fw:600,fill:"#7b3597",a:"start"}):""}</g>${n.fork?"":n.gate&&q.fix?fixBranch(n):q.nx?noBranch(n):text(cx,n.y+DW+11,wrap("No: "+q.no,26,1),{fs:8.5,fill:"#7b3597"})}`;return}
    const s=n.s,c=TYC[s.was||s.ty],ch=s.ch||"same",lines=wrap(s.t,ch!=="same"?16:(s.t.length>42?23:21),s.t.length>42?3:2);
    let px=n.x+2;const inl=s.in||[];inl.slice(0,2).forEach(x=>{const p=pill(px,n.y-PIN+3,x[0],pc(x[0]),false,`From ${x[0]}: ${x[1]}`);h+=p.h+`<line class="source-step-leader" x1="${px+p.w/2}" y1="${n.y-PIN+20}" x2="${px+p.w/2}" y2="${n.y}" stroke="${pc(x[0])}" stroke-width="1.2"/>`;px+=p.w+4});
    if(inl.length>2){const p=pill(px,n.y-PIN+3,`+${inl.length-2}`,"#667085",false,inl.slice(2).map(x=>`From ${x[0]}: ${x[1]}`).join(" | "));h+=p.h}
    px=n.x+2;const outl=s.out||[];outl.slice(0,2).forEach(x=>{const p=pill(px,n.y+H+7,x[0],pc(x[0]),false,`To ${x[0]}: ${x[1]}`);h+=p.h+`<line class="source-step-leader" x1="${px+p.w/2}" y1="${n.y+H}" x2="${px+p.w/2}" y2="${n.y+H+7}" stroke="${pc(x[0])}" stroke-width="1.2"/>`;px+=p.w+4});if(outl.length>2){const p=pill(px,n.y+H+7,`+${outl.length-2}`,"#667085",false,outl.slice(2).map(x=>`To ${x[0]}: ${x[1]}`).join(" | "));h+=p.h}
    h+=`<g class="nd ty-${s.was||s.ty} ${s.pp&&s.pp.length?"has-pp":""} ${(s.ci||TPIS.has(n.id))?"has-tpi":""} ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}" aria-label="${esc2(s.t)}"><title>${esc2(s.t)} - ${TYNM[s.was||s.ty]} - ${esc2(s.sys)}</title>
      <rect class="b" x="${n.x}" y="${n.y}" width="${W}" height="${H}" rx="9" fill="${ch==="new"?"#eef5fc":"var(--card)"}" stroke="${c}" stroke-width="2.2" ${ch==="new"?'stroke-dasharray="6 3"':""}/>
      <circle cx="${n.x+14}" cy="${n.y+14}" r="9" fill="${c}"/><text x="${n.x+14}" y="${n.y+17.5}" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">${s.n}</text>
      ${text(n.x+W/2+(ch!=="same"?-6:8),n.y+(lines.length>1?15:21),lines,{fs:10.8,fw:600,fill:"var(--navy)"})}
      ${text(n.x+9,n.y+H-9,[wrap(s.sys,23,1)[0]],{fs:9.2,fill:"var(--muted)",a:"start"})}
      ${s.pp&&s.pp.length?(d.fixes&&ch!=="same"?`<g><title>Pain point addressed by this change: ${esc2(s.pp.join(" | "))}</title><circle cx="${n.x+W-11}" cy="${n.y+H-11}" r="7" fill="#1f8a4c"/><text x="${n.x+W-11}" y="${n.y+H-7.5}" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">✔</text></g>`:`<circle cx="${n.x+W-11}" cy="${n.y+H-11}" r="7" fill="var(--pain)"/><text x="${n.x+W-11}" y="${n.y+H-7.5}" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">!</text>`):""}
      ${s.cop?`<rect x="${n.x+W-44}" y="${n.y-7}" width="38" height="13" rx="4" fill="#fff" stroke="#0070c0" stroke-dasharray="3 2"/><text x="${n.x+W-25}" y="${n.y+2.5}" font-size="8" font-weight="700" fill="#0070c0" text-anchor="middle">${esc2(s.cop.tag||"Copilot")}</text>`:""}${ch!=="same"?`<rect x="${n.x+W-34}" y="${n.y+4}" width="30" height="13" rx="4" fill="var(--prop)"/><text x="${n.x+W-19}" y="${n.y+13.5}" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">${ch==="new"?"NEW":"AI"}</text>`:""}${(ch!=="same"&&s.was&&s.was!==s.ty)?mkr(n,s):""}
      ${s.feas?`<rect x="${n.x+(s.feasdx||0)+W/2-Math.max(W,s.feas.length*4.7+14)/2}" y="${n.y+H+(outl.length?27:3)}" width="${Math.max(W,s.feas.length*4.7+14)}" height="14" rx="4" fill="${/applicable|necessary|required/i.test(s.feas)?"#667085":/not/i.test(s.feas)?"var(--pain)":/progress/i.test(s.feas)?"var(--hyb)":"var(--ok)"}"/><text x="${n.x+(s.feasdx||0)+W/2}" y="${n.y+H+(outl.length?37:13)}" font-size="8.3" font-weight="700" fill="#fff" text-anchor="middle">${esc2(s.feas)}</text>${s.feasn?`<text x="${n.x+(s.feasdx||0)+W/2+Math.max(W,s.feas.length*4.7+14)/2+5}" y="${n.y+H+(outl.length?37:13)}" font-size="9.5" font-weight="600" fill="var(--navy)" text-anchor="start">${esc2(s.feasn)}</text>`:""}`:""}
    </g>`;
  });
  const svg=document.querySelector(E.svg);svg.setAttribute("viewBox",`0 0 ${svgW} ${svgH}`);svg.setAttribute("data-f",filter);svg.innerHTML=h+BT;
  svg.querySelectorAll(".nd,.opn").forEach(g=>{const f=()=>detail(g.dataset.id);g.onclick=f;g.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();f()}}});
}
function detail(id){const n=nodes[id];if(!n)return;sel=id;
  document.querySelector(E.svg).querySelectorAll(".opn").forEach(g=>g.classList.toggle("sel",g.dataset.id===id));
  if(n.kind==="opp"||n.kind==="fopp"){const o=n.opp;document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)}${n.P?" / "+esc2(n.P.name):""}</span><h3 style="color:#0070c0">AI Opportunity: ${esc2(o.t)}</h3><dl><div><dt>Type</dt><dd><b>${esc2(o.ty)}</b></dd></div><div><dt>How it would work and tools</dt><dd class="opl">${esc2(o.d)}</dd></div>${(n.P?n.P.steps.flatMap(s=>s.pp||[]):(n.f.pp||[])).length?`<div><dt style="color:var(--pain)">Pain points it addresses</dt><dd class="ppl">${[...new Set(n.P?n.P.steps.flatMap(s=>s.pp||[]):(n.f.pp||[]))].map(esc2).join("<br>")}</dd></div>`:""}${o.feasc?`<div><dt style="color:var(--ok)">AI feasibility comment</dt><dd>${esc2(o.feasc)}</dd></div>`:""}<div><dt>Source</dt><dd>Process Register v3, row ${esc2(o.rid)}, columns X-Z (hypothesis - needs SME validation)</dd></div></dl>`;return}
  if(n.kind==="ch"||n.kind==="tpi"){const c=n.c,ids=(c.steps||[]).map(s=>`${n.f.id}|${s}`);document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.toggle("sel",ids.includes(g.dataset.id)));
    const names=ids.map(i=>nodes[i]).filter(Boolean).map(x=>`<b>${esc2(x.P.name)}</b> · ${esc2(x.s.n)}. ${esc2(x.s.t)}`).join("<br>");
    document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)}</span><h3 style="color:${n.kind==="ch"?"#a00015":"#13643a"}">${n.kind==="ch"?"[CHALLENGE] Pain point":`[SOLUTION] ${esc2(c.st||"TPI")}`}</h3><p style="margin:4px 0 0">${esc2(c.t)}</p><dl>${names?`<div><dt>${n.kind==="ch"?"Where it hits (highlighted on the map)":"Steps it addresses (highlighted on the map)"}</dt><dd>${names}</dd></div>`:""}${c.ref?`<div><dt>Reference</dt><dd>${esc2(c.ref)}</dd></div>`:""}<div><dt>Source</dt><dd>O2C process register v3, row O2C-01.02 (${n.kind==="ch"?"pain points":"CI / TPI"} column)</dd></div></dl>`;return}
  if(n.kind==="dec"){const q=n.dec;document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.remove("sel"));
    const r=(t,v,cls)=>v?`<div><dt>${t}</dt><dd class="${cls||""}">${v}</dd></div>`:"";
    document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f?n.f.name:"")}${n.P?" / "+esc2(n.P.name):""}</span><h3 style="color:#5b2a7a">Decision: ${esc2(q.q)}</h3>${q.d?`<p style="margin:4px 0 0">${esc2(q.d)}</p>`:""}<dl>${r("Example",q.ex?`<i>${esc2(q.ex)}</i>`:"")}${r("Checked by",q.o?esc2(q.o):"")}${r("System",q.sys?esc2(q.sys):"")}<div><dt>If yes</dt><dd>${esc2(q.yes)}</dd></div><div><dt>If no</dt><dd>${esc2(q.no)}</dd></div>${q.pp&&q.pp.length?r('<span style="color:var(--pain)">Pain point when the answer is no</span>',q.pp.map(esc2).join("<br>"),"ppl"):""}${r("Source",q.src?esc2(q.src):"")}</dl>`;return}
  const s=n.s;document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.toggle("sel",g.dataset.id===id));
  const row=(t,v,cls)=>v?`<div><dt>${t}</dt><dd class="${cls||""}">${v}</dd></div>`:"";
  const ownc=o=>o.split(/\s\/\s|,\s*/).map(x=>`<span class="own"><i style="background:${pc(x)}"></i>${esc2(x)}</span>`).join("");
  let html=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)} / ${esc2(n.P.name)} (${esc2(n.P.id)})</span><h3>${s.n}. ${esc2(s.t)}</h3><p style="margin:4px 0 0">${esc2(s.d)}</p><dl>`;
  html+=row("Who",ownc(s.o))+row("System",esc2(s.sys))+row("Activity type",`<b style="color:${TYC[s.ty]}">${TYNM[s.ty]}</b>${s.was?` <small>(as-is: ${TYNM[s.was]})</small>`:""}`);
  if(s.in&&s.in.length)html+=row("Input from",s.in.map(x=>`<b>${esc2(x[0])}</b>: ${esc2(x[1])}`).join("<br>"));
  if(s.out&&s.out.length)html+=row("Output to",s.out.map(x=>`<b>${esc2(x[0])}</b>: ${esc2(x[1])}`).join("<br>"));
  if(s.dec)html+=row("Decision",`<b>${esc2(s.dec.q)}</b><br>Yes &rarr; ${esc2(s.dec.yes)}<br>No &rarr; ${esc2(s.dec.no)}`);
  if(s.ctl)html+=row("Control",esc2(s.ctl));
  if(s.pp&&s.pp.length)html+=row('<span style="color:var(--pain)">Pain points</span>',s.pp.map(esc2).join("<br>"),"ppl");
  if(s.ci)html+=row("Existing CI / TPI",esc2(s.ci));
  if(page==="tobe"&&s.ch&&s.ch!=="same")html+=row('<span style="color:var(--prop)">AI suggestion (hypothesis, to validate)</span>',`<b>${esc2(s.rec||"")}</b><br>Tools: ${esc2(s.tools||"")}<br><small>Basis: ${esc2(s.opp||"")}</small>`,"opl");
  if(page==="tobe"&&s.cop)html+=row('<span style="color:#0070c0">Copilot / Agent Builder option (added hypothesis, to validate)</span>',`<b>${esc2(s.cop.tool)}</b><br>${esc2(s.cop.d)}`,"opl");
  if(s.feasc)html+=row(`<span style="color:var(--ok)">${esc2(s.feasl||"AI enhancement comment")}</span>`,esc2(s.feasc));
  html+=row("Source",esc2(s.src))+`</dl>`;
  if(page==="tobe"&&s.ch==="same")html+=`<p style="font-size:12px;color:var(--muted)">No change proposed for this step.</p>`;
  document.querySelector(E.det).innerHTML=html;
}
function legend(){const d=DATA[page];const sw=(c,dash)=>`<svg width="22" height="12"><line x1="0" y1="6" x2="22" y2="6" stroke="${c}" stroke-width="1.6" ${dash?'stroke-dasharray="4 3"':""}/></svg>`;
  const box=c=>`<svg width="20" height="12"><rect x="1" y="1" width="18" height="10" rx="3" fill="none" stroke="${c}" stroke-width="2"/></svg>`;
  document.querySelector(E.leg).innerHTML=`<span>${box("#d0021b")}Manual</span><span>${box("#e8891c")}Semi-automated</span><span>${box("#2f6fce")}Automated</span><span><svg width="14" height="14"><circle cx="7" cy="7" r="6.5" fill="#c8102e"/><text x="7" y="10.5" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">!</text></svg>Pain point</span><span><svg width="14" height="14"><path d="M7,1L13,7L7,13L1,7z" fill="#f3ecfa" stroke="#7b3597"/></svg>Decision</span><span>${sw("var(--navy)")}Flow</span><span>${sw(d.accent)}Chain between processes</span><span>${sw(d.accent,1)}Loop back</span>${d.frames.some(f=>f.ch&&f.ch.length)?`<span><svg width="22" height="12"><rect x="1" y="1" width="20" height="10" rx="3" fill="#fdecec" stroke="var(--pain)"/></svg>[CHALLENGE] pain point</span><span><svg width="22" height="12"><rect x="1" y="1" width="20" height="10" rx="3" fill="#e6f4ec" stroke="var(--ok)"/></svg>[SOLUTION] TPI / CI</span><span>${sw(d.accent,1)}Same output</span>`:""}${d.frames.some(f=>f.procs.some(p=>p.steps.some(s=>s.gate&&s.fix&&!s.noRetry)))?`<span>${sw("var(--navy)",1)}Retry after the fix</span>`:""}${d.frames.some(f=>f.procs.some(p=>p.steps.some(s=>s.dec&&s.dec.nx&&s.dec.nx.end)))?`<span><svg width="26" height="14"><rect x="1" y="1" width="24" height="12" rx="6" fill="#fdecec" stroke="#d0021b" stroke-width="1.3"/></svg>End of the flow (reject / hold)</span>`:""}<span><svg width="34" height="14"><rect width="34" height="14" rx="4" fill="${d.accent}"/><text x="17" y="10.5" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">Input</text></svg>Trigger / input</span><span><svg width="18" height="14"><path d="M1,1 L12,1 L17,6 L17,13 L1,13z" fill="#fff7e0" stroke="#d9a400"/></svg>Output</span>${page==="tobe"?`<span><svg width="70" height="16"><rect x="1" y="1" width="68" height="14" rx="7" fill="none" stroke="#0070c0" stroke-width="1.3" stroke-dasharray="3 2"/><text x="35" y="11.5" font-size="9" font-weight="700" fill="#0070c0" text-anchor="middle">AI: R2R</text></svg>AI-suggested dependency</span><span><svg width="60" height="16"><rect x="1" y="1" width="58" height="14" rx="4" fill="#e8f1fb" stroke="#0070c0"/><text x="30" y="11.5" font-size="8.5" font-weight="700" fill="#0070c0" text-anchor="middle">AI Opportunity</text></svg>AI opportunity (register)</span><span><svg width="30" height="13"><rect width="30" height="13" rx="4" fill="#0070c0"/><text x="15" y="10" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">AI</text></svg>Step changed (AI suggested)</span><span><svg width="76" height="14"><rect x="1" y="1" width="74" height="12" rx="6" fill="var(--card)" stroke="#9aa4b2"/><text x="38" y="10" font-size="8" font-weight="700" text-anchor="middle"><tspan fill="#d0021b">Manual</tspan><tspan fill="#667085"> → </tspan><tspan fill="#e8891c">Semi</tspan></text></svg>Automation level before → after (changes that can be explored only)</span><span><svg width="30" height="13"><rect width="30" height="13" rx="4" fill="#0070c0"/><text x="15" y="10" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">NEW</text></svg>New step</span>`:""}<span>Pills = input from / output to; strips = upstream / downstream</span>`;}
function setScale(s){scale=Math.max(.3,Math.min(2,s));const svg=document.querySelector(E.svg);svg.style.width=svgW*scale+"px";svg.style.height=svgH*scale+"px"}
function fit(){const w=document.querySelector(E.scroll).clientWidth-10;setScale(Math.min(1,w/svgW))}
function render(pg,fl){if(pg)page=pg;if(fl)filter=fl;sel=null;draw();legend();document.querySelector(E.det).innerHTML='<p class="none">Select a step in the map to see what happens, who does it, the system, inputs, outputs, decisions, pain points and the source.</p>';fit()}
function setFilter(f){filter=f;document.querySelector(E.svg).setAttribute("data-f",f)}
return {getNodes:()=>nodes,getDimensions:()=>({width:svgW,height:svgH}),render,setFilter,zi:()=>setScale(scale+.15),zo:()=>setScale(scale-.15),fit,page:()=>page,setScale,getScale:()=>scale};
};
window.TowerRenderers["TAX"]=function makeTowerMap(KEY,DATA,E){
const TPIS=new Set();Object.values(DATA).forEach(dd=>dd&&dd.frames&&dd.frames.forEach(f=>(f.tpi||[]).forEach(t=>(t.steps||[]).forEach(r=>TPIS.add(f.id+"|"+r)))));
const W=158,H=74,G=46,DW=34,PAD=24,FH=E.frameHeaderHeight||46,ROWL=E.processHeaderGap||22,PIN=E.processInputGap||24,POUT=24,RGAP=44,STRIP=E.handoffStripHeight||30,INW=118,CH=14;
const TYC={man:"#d0021b",auto:"#2f6fce",hyb:"#e8891c"},TYNM={man:"Manual",hyb:"Semi-automated",auto:"Automated"};
const esc2=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function wrap(t,n,max){const w=String(t).split(" ");const L=[];let c="";w.forEach(x=>{if((c+" "+x).trim().length>n){if(c)L.push(c);c=x}else c=(c+" "+x).trim()});if(c)L.push(c);max=max||2;if(L.length>max){L[max-1]=L.slice(max-1).join(" ");if(L[max-1].length>n+2)L[max-1]=L[max-1].slice(0,n)+"…";L.length=max}return L}
function text(x,y,lines,o={}){return `<text x="${x}" y="${y}" font-size="${o.fs||11.5}" font-weight="${o.fw||500}" fill="${o.fill||"var(--ink)"}" text-anchor="${o.a||"middle"}" font-family="Inter,Segoe UI,Arial,sans-serif">${lines.map((l,i)=>`<tspan x="${x}" dy="${i?1.2:0}em">${esc2(l)}</tspan>`).join("")}</text>`}
let page="asis",filter="all",nodes={},svgW=0,svgH=0,scale=1,sel=null;
const pc=p=>{if(/authority/i.test(p))return "#475467";const k=String(p).split(/[ -]/)[0];return ({O2C:"var(--O2C)",R2R:"var(--R2R)",TAX:"var(--Tax)",Tax:"var(--Tax)",P2P:"var(--P2P)",CAPEX:"var(--CAPEX)",Controlling:"var(--Controlling)",C2C:"var(--O2C)",GFR:"#152847",IT:"#0e7490",System:"#667085",Deloitte:"#65758b",Supplier:"#8a6d3b",Business:"#b7791f",Procurement:"#c2410c",Sales:"#0f766e",Financial:"#7b3597",CFC:"#7b3597",ATO:"#475467",Vietnam:"#475467",Group:"#152847",DMT:"#0e7490",Customer:"#8a6d3b",Distributors:"#8a6d3b",Distribution:"#0f766e",Bank:"#475467",Payroll:"#b7791f",Local:"#b7791f",FP:"var(--FPA)",HR:"#9d174d",International:"#152847",Area:"#152847",Group:"#152847",MC:"#b7791f",BUD:"#b7791f",BUDs:"#b7791f",Brand:"#b7791f",Cost:"#b7791f",Business:"#b7791f",CFO:"#7b3597",CP:"#7b3597",CBP:"#c77a0a",Embedded:"#c77a0a",SAP:"#667085",CMR:"#667085",PMR:"#667085",AZ:"#667085",AZForce:"#667085",Enpire:"#667085",OneGRC:"#475467",Approver:"#7b3597",Market:"#b7791f",Posting:"var(--R2R)",FBPs:"#c77a0a",Planning:"#667085","P&MR":"#667085"})[k]||(String(p).startsWith("FP&A")?"var(--FPA)":"#667085")};
function pill(x,y,label,c,dash,title,anchorLeft){const w=label.length*6.2+16;return {w,h:`<g class="source-pill"><title>${esc2(title||label)}</title><rect x="${x}" y="${y}" width="${w}" height="17" rx="8.5" fill="var(--card)" stroke="${c}" stroke-width="1.3" ${dash?'stroke-dasharray="3 2"':""}/>${text(x+w/2,y+12,[label],{fs:10,fw:600,fill:c})}</g>`}}
function layout(d){
  nodes={};let h="",y=PAD+10,maxX=0;const x0=PAD+(d.chan||60);
  // phase chevrons (processes grouped by key process)
  {const raw=d.frames.flatMap(f=>f.procs.map(p=>({p,f})));const procs=[];raw.forEach(it=>{const k=it.p.phase||it.p.name;const L=procs[procs.length-1];if(L&&L.k===k&&L.f===it.f){L.ids.push(it.p.id)}else procs.push({k,f:it.f,p:it.p,ids:[it.p.id]})});const cw=procs.length<=3?230:150,ch=40;let cx=x0;
   h+=text(x0,y+12,["Process phases"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});y+=18;
   procs.forEach(({p,f},i)=>{const fi=d.frames.indexOf(f);const col=d.accent;const op=.55+.15*(fi%3);
     h+=`<g><title>${esc2(f.name)} / ${esc2(p.phase||p.name)} (${esc2(procs[i].ids.join(", "))})</title><path d="M${cx},${y} L${cx+cw-14},${y} L${cx+cw},${y+ch/2} L${cx+cw-14},${y+ch} L${cx},${y+ch} L${cx+14},${y+ch/2}z" fill="${col}" fill-opacity="${op}"/>${text(cx+cw/2+4,y+ch/2+4,wrap(`${i+1}. ${p.phase||p.name}`,cw>200?32:20,1),{fs:10.5,fw:700,fill:"#fff"})}</g>`;cx+=cw+4});
   maxX=Math.max(maxX,cx);y+=ch+22;}
  d.frames.forEach((f,fi)=>{
    const top=y;const c=d.accent;
    y+=FH;
    // upstream strip
    let px=x0+8;const upY=y+4;h+=text(x0,upY+12,["Upstream"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});px+=66;
    f.up.forEach(u=>{const p=pill(px,upY,(u.c?"AI: ":"")+u.p,u.c?"var(--prop)":pc(u.p),!!u.c,`${u.c?"AI SUGGESTED - ":""}${u.p}: ${u.w} (${u.src})`);h+=p.h;px+=p.w+6});
    maxX=Math.max(maxX,px);y+=STRIP;
    f.procs.forEach((P,pi)=>{
      y+=ROWL;const rowY=y+PIN;let x=x0;const items=[];
      nodes[`${f.id}|${P.id}|in`]={id:`${f.id}|${P.id}|in`,x,y:rowY,w:INW,h:H,kind:"in",lab:P.inbox[0],txt:P.inbox[1],f,P};x+=INW+G-12;
      P._headingY=y;h+=`<g class="source-process-heading">`;h+=text(x0,y-4,[`${P.name}`],{fs:12,fw:700,fill:"var(--navy)",a:"start"});h+=text(x0+P.name.length*7.2+10,y-4,[`${P.id} · ${P.owner}`],{fs:10.5,fill:"var(--muted)",a:"start"});h+=`</g>`;
      const seq=[`${f.id}|${P.id}|in`];let fext=0;P._rb=rowY+H;P._gates=false;
      P.steps.forEach((s,j)=>{
        if(s.gate){P._gates=true;x+=60;const gid=`${f.id}|${P.id}|${s.n}`;nodes[gid]={id:gid,x,y:rowY+H/2-DW/2,w:DW,h:DW,kind:"dec",gate:true,dec:s,f,P,j,ln:P.steps.slice(j+1).filter(q=>q.gate&&q.nx&&!q.nx.end).length};seq.push(gid);
          if(s.fix){const fs=s.fix,fid=`${f.id}|${P.id}|${fs.n}`;nodes[fid]={id:fid,x:x+DW/2-W/2,y:rowY+H+56,w:W,h:H,s:fs,f,P,j,fixOf:gid};fext=56+H+4;P._rb=rowY+H+fext-4}
          x+=DW+G+76;return}
        if(s.fork){P._gates=true;const BG=56,nb=s.branches.length;x+=30;const dx=x,sx=dx+DW+G+40,bx=sx+W+30;
          s.branches.forEach((b,bi)=>{const by=rowY+bi*(H+BG);const nq=s.branches[bi+1];const did=`${f.id}|${P.id}|${b.step.n}|d`;
            nodes[did]={id:did,x:dx,y:by+H/2-DW/2,w:DW,h:DW,kind:"dec",fork:true,f,P,dec:{q:b.q,ex:b.ex,o:b.o,d:b.d,src:b.src,yes:`Step ${b.step.n} - ${b.step.t}`,no:nq?`Check: ${nq.q}`:(s.elseLab||"No")+" - release"}};
            const sid=`${f.id}|${P.id}|${b.step.n}`;nodes[sid]={id:sid,x:sx,y:by,w:W,h:H,s:b.step,f,P,j,br:true}});
          const fid=`${f.id}|${P.id}|fork${j}`;nodes[fid]={id:fid,kind:"fork",fk:s,f,P,x:dx,w:bx-dx,dx,sx,bx,rowY};seq.push(fid);
          fext=Math.max(fext,(nb-1)*(H+BG)+34);P._rb=Math.max(P._rb,rowY+H+(nb-1)*(H+BG)+30);x=bx+40;return}
        const id=`${f.id}|${P.id}|${s.n}`;nodes[id]={id,x,y:rowY,w:W,h:H,s,f,P,j};items.push(id);seq.push(id);x+=W+G;
        if(s.dec){x+=30;nodes[id+"|d"]={id:id+"|d",x:x,y:rowY+H/2-DW/2,w:DW,h:DW,dec:s.dec,kind:"dec",step:s,f,P,ln:P.steps.slice(j+1).filter(q=>q.dec&&q.dec.nx&&!q.dec.nx.end).length};x+=DW+G+40}});
      P._seq=seq;
      if(P.outdoc){x+=14;nodes[`${f.id}|${P.id}|out`]={id:`${f.id}|${P.id}|out`,x,y:rowY+8,w:150,h:H-16,kind:"out",doc:P.outdoc,f,P,from:P._gates?seq[seq.length-1]:items[items.length-1]};seq.push(`${f.id}|${P.id}|out`);x+=150+G}
      if(d.key==="tobe"&&P.opp){x+=6;nodes[`${f.id}|${P.id}|opp`]={id:`${f.id}|${P.id}|opp`,x,y:rowY-6,w:250,h:H+12,kind:"opp",opp:P.opp,f,P,from:items[items.length-1]};x+=270}
      maxX=Math.max(maxX,x);
      y=rowY+H+POUT+RGAP+fext+(P.steps.some(s=>s.dec&&s.dec.nx)?30:0);
    });
    if(d.key==="tobe"&&f.opp){nodes[`${f.id}|opp`]={id:`${f.id}|opp`,x:x0,y:y-18,w:460,h:44,kind:"fopp",opp:f.opp,f};y+=56}
    // challenge / TPI strips
    if((f.ch&&f.ch.length)||(f.tpi&&f.tpi.length)){y+=4;
      const strip=(items,kind,lab,fill,stroke,col,bw)=>{h+=text(x0,y+12,[lab],{fs:10.5,fw:700,fill:col,a:"start"});y+=20;let bx=x0;
        items.forEach((c,i)=>{const id=`${f.id}|${kind}${i}`;const head=kind==="ch"?"[CHALLENGE]":`[SOLUTION] ${c.st||"TPI"}`;const tl=wrap(c.t,Math.floor(bw/5.6),2);nodes[id]={id,kind,c,f,x:bx,y,w:bw,h:50};
          h+=`<g class="opn ${sel===id?"sel":""}" tabindex="0" role="button" data-id="${id}"><title>${esc2(head)}: ${esc2(c.t)}${c.ref?" - "+esc2(c.ref):""}</title><rect class="b" x="${bx}" y="${y}" width="${bw}" height="50" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>${text(bx+10,y+14,[head],{fs:9.5,fw:700,fill:col,a:"start"})}${c.ref?text(bx+bw-8,y+14,[c.ref],{fs:8.8,fill:col,a:"end"}):""}${text(bx+10,y+29,tl,{fs:9.8,fill:"var(--navy)",a:"start"})}</g>`;bx+=bw+12;maxX=Math.max(maxX,bx);if((i+1)%4===0&&i<items.length-1){bx=x0;y+=50+10}});
        y+=50+14};
      if(f.ch&&f.ch.length)strip(f.ch,"ch","Pain points (register)","#fdecec","var(--pain)","#a00015",330);
      if(f.tpi&&f.tpi.length)strip(f.tpi,"tpi","TPI register items (Aug 2026)","#e6f4ec","var(--ok)","#13643a",430);
    }
    // downstream strip
    px=x0+8;const dnY=y-10;h+=text(x0,dnY+12,["Downstream"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});px+=78;
    f.down.forEach(u=>{const p=pill(px,dnY,(u.c?"AI: ":"")+u.p,u.c?"var(--prop)":pc(u.p),!!u.c,`${u.c?"AI SUGGESTED - ":""}${u.p}: ${u.w} (${u.src})`);h+=p.h;px+=p.w+6});
    maxX=Math.max(maxX,px);y+=STRIP+6;
    f._box={top,bot:y,c};y+=26;
  });
  const FR=Math.max(maxX+40,1180);d._fr=FR;svgW=FR;svgH=y+PAD;
  return h;
}
function noBranch(n){const q=n.dec,nx=q.nx,cx=n.x+DW/2,by=n.y+DW,rowY=n.y-(H/2-DW/2),rb=n.P&&n.P._rb?n.P._rb:rowY+H;let o="";if(nx.none)return nx.nl?text(cx+5,by+13,[nx.nl],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"}):"";
  if(nx.end){const hold=nx.kind==="hold",w=Math.max(96,nx.end.length*6.4+22),ty=(n.gate&&rb>rowY+H)?rowY+H+56+H/2-13:rb+34;o+=`<path d="M${cx},${by} L${cx},${ty}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+13,[q.swap?"Yes":"No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})+`<g><title>${esc2(q.q)} No: ${esc2(q.no)}</title><rect x="${cx-w/2}" y="${ty}" width="${w}" height="26" rx="13" fill="${hold?"#fff4e0":"#fdecec"}" stroke="${hold?"#e8891c":"#d0021b"}" stroke-width="1.5"/>${text(cx,ty+17,[nx.end],{fs:9.8,fw:700,fill:hold?"#8a4b00":"#a00015"})}</g>`;return o}
  const T=nx.out?nodes[`${n.f.id}|${n.P.id}|out`]:nodes[`${n.f.id}|${n.P.id}|${nx.step}`];if(!T)return text(cx,n.y+DW+11,wrap("No: "+q.no,26,1),{fs:8.5,fill:"#7b3597"});
  const yb=rb+40+(n.ln||0)*12,ex=nx.out?T.x+T.w/2:T.x+T.w-16-(n.ln||0)*16,ty=T.y+T.h;
  o+=`<path d="M${cx},${by} L${cx},${yb} L${ex},${yb} L${ex},${ty}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+13,[q.swap?"Yes":"No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
  const nl=q.nl||nx.nl;if(nl){const lw=nl.length*5.4+8;o+=`<rect x="${cx+10}" y="${yb-7}" width="${lw}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(cx+14,yb+3,[nl],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}
  return o}
function fixBranch(n){const q=n.dec,F=nodes[`${n.f.id}|${n.P.id}|${q.fix.n}`];if(!F)return "";const cx=n.x+DW/2,by=n.y+DW,rowY=n.y-(H/2-DW/2),ym=rowY+H+18,ex=F.x+W+16,rx=F.x-16,cy=rowY+H/2;let o="";
  o+=`<path d="M${cx},${by} L${cx},${ym} L${ex},${ym} L${ex},${F.y+H/2} L${F.x+W},${F.y+H/2}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+12,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
  const S1=nodes[`${n.f.id}|${n.P.id}|1`];
  if(n.P.id==="SOC-01.1"){const S2=nodes[`${n.f.id}|${n.P.id}|1`];if(S2){const k=["1a","1b","1c"].indexOf(q.fix.n),yy=F.y+H+22+k*9,tx=S2.x+30+k*14,fx=F.x+W/2;o+=`<path d="M${fx},${F.y+H} L${fx},${yy} L${tx},${yy} L${tx},${S2.y+H}" class="fl" marker-end="url(#o1)"/>`}}else if(S1&&false){const k=["1a","1b","1c"].indexOf(q.fix.n),by=F.y+H+18+k*10,sx=S1.x+30+k*12,fx=F.x+W/2;o+=`<path d="M${fx},${F.y+H} L${fx},${by} L${sx},${by} L${sx},${S1.y+H}" class="fl" stroke-dasharray="5 3" marker-end="url(#o1)"/>`;
  if(k===0)o+=`<rect x="${sx+8}" y="${by-7}" width="${"Retry from step 1".length*5+6}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(sx+11,by+3,["Retry from step 1"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}
  else if(!q.noRetry){o+=`<path d="M${F.x},${F.y+H/2} L${rx},${F.y+H/2} L${rx},${cy} L${n.x},${cy}" class="fl" stroke-dasharray="5 3" marker-end="url(#o1)"/>`;
  const ly=(F.y+H/2+cy)/2;o+=`<rect x="${rx-34}" y="${ly-7}" width="31" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(rx-4,ly+3,["Retry"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"end"});
  }
  if(n.P.id==="SOC-05.1"){const O=nodes[`${n.f.id}|${n.P.id}|out`],S3=nodes[`${n.f.id}|${n.P.id}|3`],fx=F.x+W/2;if(O){const tx=O.x+O.w/2,jy=F.y+H+30;o+=`<path d="M${fx+12},${F.y+H} L${fx+12},${jy} L${tx},${jy} L${tx},${O.y+O.h}" class="fl" marker-end="url(#o1)"/>`}if(S3){const tx=S3.x+W-10,jy=F.y+H+16;o+=`<path d="M${fx-12},${F.y+H} L${fx-12},${jy} L${tx},${jy} L${tx},${S3.y+H}" class="fl" marker-end="url(#o1)"/>`}}else if(q.fix.join){const sq=n.P._seq||[],J=q.fix.join==="out"?nodes[`${n.f.id}|${n.P.id}|out`]:nodes[sq[sq.indexOf(n.id)+2]];if(J){const jx=F.x+W/2,jy=F.y+H+34,tx=J.x+J.w/2;if(J.kind==="dec"){const cyy=J.y+J.h/2,mx=J.x-14;o+=`<path d="M${jx},${F.y+H} L${jx},${jy} L${mx},${jy} L${mx},${cyy} L${J.x},${cyy}" class="fl" marker-end="url(#o1)"/>`}else o+=`<path d="M${jx},${F.y+H} L${jx},${jy} L${tx},${jy} L${tx},${J.y+J.h}" class="fl" marker-end="url(#o1)"/>`}}
  return o}
function draw(){
  const d=DATA[page];const strips=layout(d);let h=`<defs><marker id="o1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--navy)"/></marker><marker id="o2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#7b3597"/></marker><marker id="o3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#0070c0"/></marker><marker id="o4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="${d.accent}"/></marker><marker id="o5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0L10,5L0,10z" fill="${d.accent}"/></marker></defs>
  <style>.fl{fill:none;stroke:var(--navy);stroke-width:1.6}.rw{fill:none;stroke:#7b3597;stroke-width:1.4;stroke-dasharray:5 4}svg[data-f="man"] .nd:not(.ty-man),svg[data-f="hyb"] .nd:not(.ty-hyb),svg[data-f="auto"] .nd:not(.ty-auto),svg[data-f="pp"] .nd:not(.has-pp),svg[data-f="tpi"] .nd:not(.has-tpi){opacity:.14}svg[data-f="tpi"] .nd.has-tpi rect.b{stroke:#13643a;stroke-width:4;filter:drop-shadow(0 0 5px rgba(19,100,58,.55))}.opn{cursor:pointer}.opn:hover rect.b,.opn.sel rect.b{stroke-width:2.4}</style>`;
  // frames
  d.frames.forEach((f,fi)=>{const b=f._box;const wdt=d._fr-PAD*2;
    h+=`<rect x="${PAD}" y="${b.top}" width="${wdt}" height="${b.bot-b.top}" rx="14" fill="${b.c}" fill-opacity=".05" stroke="${b.c}" stroke-opacity=".35"/><rect x="${PAD}" y="${b.top}" width="${wdt}" height="${FH-6}" rx="14" fill="${b.c}"/><rect x="${PAD}" y="${b.top+20}" width="${wdt}" height="${FH-26}" fill="${b.c}"/>`;
    {const ts=d.tshift||0;h+=text(PAD+16+ts,b.top+26,[`${fi+1}. ${f.name}`],{fs:15,fw:700,fill:"#fff",a:"start"})+text(PAD+16+ts+f.name.length*9.2+30,b.top+26,[`${f.owner} · ${f.win}`],{fs:11,fill:"#fff",a:"start"});}
    if(f.pp&&f.pp.length)h+=`<g><title>Pain points: ${esc2(f.pp.join(" | "))}</title><circle cx="${PAD+wdt-22}" cy="${b.top+20}" r="9" fill="#fff"/><text x="${PAD+wdt-22}" y="${b.top+24.5}" font-size="12" font-weight="700" fill="var(--pain)" text-anchor="middle">!</text></g>`;
    if(f.ctl&&f.ctl.length)h+=`<g><title>Controls: ${esc2(f.ctl.join(" | "))}</title><circle cx="${PAD+wdt-48}" cy="${b.top+20}" r="9" fill="#fff"/><text x="${PAD+wdt-48}" y="${b.top+24.5}" font-size="11" font-weight="700" fill="${b.c}" text-anchor="middle">C</text></g>`;
  });
  h+=strips;(d.frames||[]).forEach(f=>f.procs.forEach(P=>{if(P.back){const A=nodes[`${f.id}|${P.id}|${P.back.from}`],B=nodes[`${f.id}|${P.id}|${P.back.to}`];if(A&&B){const yy=A.y+A.h+16,ax=A.x+A.w/2,bx=B.x+B.w/2+(P.back.dx||0);h+=`<path d="M${ax},${A.y+A.h} L${ax},${yy} L${bx},${yy} L${bx},${B.y+B.h}" class="fl" marker-end="url(#o1)"/>`}}}));
  // chain between processes and key processes (internal O2C flow)
  (d.chain||[]).forEach((e,i)=>{const A=nodes[e.a],B=nodes[e.b];if(!A||!B)return;const lane=PAD+CH+(i%(d.lanes||4))*(d.lanes?8:11);const col=d.accent;
    const ax=A.x+A.w/2,ay=A.y+A.h,yg=e.below&&A.f&&A.f._box?A.f._box.bot+7+(i%3)*6:A.y+A.h+(e.dy!=null?e.dy:(A.kind==="out"?30:34));
    const by=B.kind==="in"?B.y+B.h/2:B.y;let p;
    if(B.kind==="in"){p=`M${ax},${ay} L${ax},${yg} L${lane},${yg} L${lane},${by} L${B.x},${by}`}
    else{p=`M${ax},${ay} L${ax},${yg} L${lane},${yg} L${lane},${B.y-16} L${B.x+B.w/2-24},${B.y-16} L${B.x+B.w/2-24},${B.y}`}
    h+=`<path d="${p}" fill="none" stroke="${col}" stroke-width="${e.loop?1.5:2.2}" ${e.loop?'stroke-dasharray="6 4"':""} stroke-opacity=".9" marker-end="url(#${e.loop?"o4":"o5"})"/>`;
    if(e.lab){const lw=e.lab.length*5.6+10,lx=e.below?ax-lw-8:ax+8;const ly=yg+(e.ldy||0);h+=`<rect x="${lx}" y="${ly-13}" width="${lw}" height="15" rx="4" fill="var(--card)" fill-opacity=".9"/>`+text(lx+5,ly-2,[e.lab],{fs:9.2,fw:600,fill:col,a:"start"})}
  });
  // same-output link between two processes' outputs
  d.frames.forEach(f=>{const so=f.sameOut;if(!so)return;const A=nodes[`${f.id}|${so.a}|out`],B=nodes[`${f.id}|${so.b}|out`];if(!A||!B)return;const ax=A.x+A.w/2,bx=B.x+B.w/2,ym=B.y-72;
    h+=`<path d="M${ax},${A.y+A.h} L${ax},${ym} L${bx},${ym} L${bx},${B.y}" fill="none" stroke="${d.accent}" stroke-width="1.8" stroke-dasharray="3 4" stroke-linecap="round"/><circle cx="${ax}" cy="${A.y+A.h}" r="3.5" fill="${d.accent}"/><circle cx="${bx}" cy="${B.y}" r="3.5" fill="${d.accent}"/>`;
    if(so.lab){const lw=so.lab.length*5.6+14,lx=Math.min(ax,bx)+Math.abs(bx-ax)/2-lw/2;h+=`<rect x="${lx}" y="${ym-9}" width="${lw}" height="17" rx="8" fill="var(--card)" stroke="${d.accent}" stroke-width="1"/>`+text(lx+lw/2,ym+3,[so.lab],{fs:9.2,fw:600,fill:d.accent})}});
  // edges
  d.frames.forEach(f=>f.procs.forEach(P=>{if(!P._gates)return;const sq=P._seq;for(let i=0;i<sq.length-1;i++){const A=nodes[sq[i]],B=nodes[sq[i+1]];if(!A||!B)continue;if(A.kind==="fork"){A.next=B;continue}const ay=A.kind==="in"?A.y+A.h/2:(A.kind==="dec"?A.y+A.h/2:A.y+H/2);h+=`<path d="M${A.x+A.w},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`}}));
  Object.values(nodes).forEach(n=>{if(n.kind==='in'){if(n.P._gates)return;const B=nodes[`${n.f.id}|${n.P.id}|1`];if(B)h+=`<path d="M${n.x+n.w},${n.y+H/2} L${B.x},${B.y+H/2}" class="fl" marker-end="url(#o1)"/>`;return}if(n.kind||n.fixOf||(n.P&&n.P._gates))return;const P=n.P,j=n.j;const nxt=P.steps[j+1];if(!nxt)return;const B=nodes[`${n.f.id}|${P.id}|${nxt.n}`];const D=nodes[n.id+"|d"];const ay=n.y+H/2;
    if(D){h+=`<path d="M${n.x+W},${ay} L${D.x},${ay}" class="fl" marker-end="url(#o1)"/><path d="M${D.x+DW},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`;}
    else h+=`<path d="M${n.x+W},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`});
  // handoff pills on steps + decisions + nodes
  Object.values(nodes).filter(n=>n.kind==="fork").forEach(n=>{const s=n.fk,f=n.f,P=n.P,cy0=n.rowY+H/2,cxd=n.dx+DW/2;let o="",yEnd=cy0;
    s.branches.forEach((b,bi)=>{const D=nodes[`${f.id}|${P.id}|${b.step.n}|d`],S=nodes[`${f.id}|${P.id}|${b.step.n}`];const cy=S.y+H/2;
      o+=`<path d="M${D.x+DW},${cy} L${S.x},${cy}" class="fl" marker-end="url(#o1)"/><path d="M${S.x+W},${cy} L${n.bx},${cy}" class="fl"/>`;yEnd=Math.max(yEnd,cy);
      const nxD=s.branches[bi+1]?nodes[`${f.id}|${P.id}|${s.branches[bi+1].step.n}|d`]:null;
      if(nxD)o+=`<path d="M${cxd},${D.y+DW} L${cxd},${nxD.y}" class="fl" marker-end="url(#o1)"/>`+text(cxd+5,D.y+DW+13,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
      else{const ye=S.y+H+30;const OT=s.elseOut?nodes[`${f.id}|${P.id}|out`]:null;o+=(OT?`<path d="M${cxd},${D.y+DW} L${cxd},${ye} L${OT.x+OT.w/2},${ye} L${OT.x+OT.w/2},${OT.y+OT.h}" class="fl" marker-end="url(#o1)"/>`:`<path d="M${cxd},${D.y+DW} L${cxd},${ye} L${n.bx},${ye}" class="fl"/>`)+text(cxd+5,D.y+DW+13,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
        if(s.elseLab){const lw=s.elseLab.length*5.4+8;o+=`<rect x="${cxd+10}" y="${ye-7}" width="${lw}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(cxd+14,ye+3,[s.elseLab],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}if(!OT)yEnd=Math.max(yEnd,ye)}});
    o+=`<path d="M${n.bx},${yEnd} L${n.bx},${cy0}" class="fl"/>`;if(n.next)o+=`<path d="M${n.bx},${cy0} L${n.next.x},${cy0}" class="fl" marker-end="url(#o1)"/>`;
    if(s.lab)o+=text(n.dx+DW/2,n.rowY-6,[s.lab],{fs:10,fw:700,fill:"var(--muted)"});
    h+=o});
  Object.values(nodes).forEach(n=>{
    if(n.kind==="ch"||n.kind==="tpi"||n.kind==="fork")return;
    if(n.kind==="opp"||n.kind==="fopp"){const o=n.opp,fr=n.kind==="opp"?nodes[`${n.f.id}|${n.P.id}|out`]:null;const tl=wrap(o.t,n.kind==="opp"?38:70,n.kind==="opp"?2:1);
      if(fr)h+=`<path d="M${fr.x+fr.w},${fr.y+fr.h/2} L${n.x},${n.y+n.h/2}" fill="none" stroke="#0070c0" stroke-width="1.4" stroke-dasharray="4 3" marker-end="url(#o3)"/>`;
      h+=`<g class="opn ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}"><title>AI Opportunity (${esc2(o.ty)}): ${esc2(o.t)} - ${esc2(o.d)}</title><rect class="b" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="9" fill="#e8f1fb" stroke="#0070c0" stroke-width="1.5"/>
      ${text(n.x+10,n.y+15,[n.kind==="fopp"?`AI Opportunity - ${n.f.name.length>30?n.f.name.slice(0,29)+"…":n.f.name}`:"AI Opportunity"],{fs:10.5,fw:700,fill:"#0070c0",a:"start"})}<rect x="${n.x+n.w-124}" y="${n.y+5}" width="118" height="14" rx="4" fill="${/digital/i.test(o.ty)?"#5b2a7a":"#0070c0"}"/><text x="${n.x+n.w-65}" y="${n.y+15}" font-size="8.3" font-weight="700" fill="#fff" text-anchor="middle">${esc2(o.ty)}</text>
      ${text(n.x+10,n.y+31,tl,{fs:10.3,fill:"var(--navy)",a:"start"})}</g>`;return}
    if(n.kind==="in"){const col=d.accent;h+=`<g><title>${esc2(n.lab)}: ${esc2(n.txt)}</title><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="9" fill="${col}"/>${text(n.x+n.w/2,n.y+15,[n.lab],{fs:9.5,fw:700,fill:"#fff"})}${text(n.x+n.w/2,n.y+31,wrap(n.txt,21,3),{fs:9.4,fill:"#fff"})}</g>`;return}
    if(n.kind==="out"){const fr=nodes[n.from];if(!n.P._gates)h+=`<path d="M${fr.x+fr.w},${fr.y+H/2} L${n.x},${n.y+n.h/2}" class="fl" marker-end="url(#o1)"/>`;h+=`<g><title>Output: ${esc2(n.doc)}${n.P.outnote?" - "+esc2(n.P.outnote):""}</title><path d="M${n.x},${n.y} L${n.x+n.w-12},${n.y} L${n.x+n.w},${n.y+12} L${n.x+n.w},${n.y+n.h} L${n.x},${n.y+n.h}z" fill="#fff7e0" stroke="#d9a400" stroke-width="1.4"/><path d="M${n.x+n.w-12},${n.y} L${n.x+n.w-12},${n.y+12} L${n.x+n.w},${n.y+12}" fill="none" stroke="#d9a400"/>${text(n.x+8,n.y+15,["Output"],{fs:9.5,fw:700,fill:"#8a6d00",a:"start"})}${text(n.x+n.w/2,n.y+30,wrap(n.doc,24,n.doc.length>48?3:2),{fs:9.8,fill:"var(--navy)"})}</g>`;return}
    if(n.kind==="dec"){const cx=n.x+DW/2,cy=n.y+DW/2,q=n.dec;const ql=wrap(q.q,22,2);h+=`<g class="opn ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}"><title>${esc2(q.q)} Yes: ${esc2(q.yes)}. No: ${esc2(q.no)}</title>${n.fork?`<rect x="${cx-(ql[0].length*5.5+8)/2}" y="${n.y-17}" width="${ql[0].length*5.5+8}" height="14" rx="3" fill="var(--card)" fill-opacity=".95"/>`:""}<path class="b" d="M${cx},${n.y} L${n.x+DW},${cy} L${cx},${n.y+DW} L${n.x},${cy}z" fill="#f3ecfa" stroke="#7b3597" stroke-width="1.4"/>${text(cx,n.y-7-(ql.length-1)*11.4,ql,{fs:9.5,fw:600,fill:"#5b2a7a"})}${text(n.x+DW+4,cy-5,[q.swap?"No":"Yes"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}</g>${n.fork?"":n.gate&&q.fix?fixBranch(n):q.nx?noBranch(n):text(cx,n.y+DW+11,wrap("No: "+q.no,26,1),{fs:8.5,fill:"#7b3597"})}`;return}
    const s=n.s,c=TYC[s.was||s.ty],ch=s.ch||"same",lines=wrap(s.t,ch!=="same"?16:(s.t.length>42?23:21),s.t.length>42?3:2);
    let px=n.x+2;const inl=s.in||[];inl.slice(0,2).forEach(x=>{const p=pill(px,n.y-PIN+3,x[0],pc(x[0]),false,`From ${x[0]}: ${x[1]}`);h+=p.h+`<line class="source-step-leader" x1="${px+p.w/2}" y1="${n.y-PIN+20}" x2="${px+p.w/2}" y2="${n.y}" stroke="${pc(x[0])}" stroke-width="1.2"/>`;px+=p.w+4});
    if(inl.length>2){const p=pill(px,n.y-PIN+3,`+${inl.length-2}`,"#667085",false,inl.slice(2).map(x=>`From ${x[0]}: ${x[1]}`).join(" | "));h+=p.h}
    px=n.x+2;const outl=s.out||[];outl.slice(0,2).forEach(x=>{const p=pill(px,n.y+H+7,x[0],pc(x[0]),false,`To ${x[0]}: ${x[1]}`);h+=p.h+`<line class="source-step-leader" x1="${px+p.w/2}" y1="${n.y+H}" x2="${px+p.w/2}" y2="${n.y+H+7}" stroke="${pc(x[0])}" stroke-width="1.2"/>`;px+=p.w+4});if(outl.length>2){const p=pill(px,n.y+H+7,`+${outl.length-2}`,"#667085",false,outl.slice(2).map(x=>`To ${x[0]}: ${x[1]}`).join(" | "));h+=p.h}
    h+=`<g class="nd ty-${s.was||s.ty} ${s.pp&&s.pp.length?"has-pp":""} ${(s.ci||TPIS.has(n.id))?"has-tpi":""} ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}" aria-label="${esc2(s.t)}"><title>${esc2(s.t)} - ${TYNM[s.was||s.ty]} - ${esc2(s.sys)}</title>
      <rect class="b" x="${n.x}" y="${n.y}" width="${W}" height="${H}" rx="9" fill="${ch==="new"?"#eef5fc":"var(--card)"}" stroke="${c}" stroke-width="2.2" ${ch==="new"?'stroke-dasharray="6 3"':""}/>
      <circle cx="${n.x+14}" cy="${n.y+14}" r="9" fill="${c}"/><text x="${n.x+14}" y="${n.y+17.5}" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">${s.n}</text>
      ${text(n.x+W/2+(ch!=="same"?-6:8),n.y+(lines.length>1?15:21),lines,{fs:10.8,fw:600,fill:"var(--navy)"})}
      ${text(n.x+9,n.y+H-9,[wrap(s.sys,23,1)[0]],{fs:9.2,fill:"var(--muted)",a:"start"})}
      ${s.pp&&s.pp.length?(d.fixes&&ch!=="same"?`<g><title>Pain point addressed by this change: ${esc2(s.pp.join(" | "))}</title><circle cx="${n.x+W-11}" cy="${n.y+H-11}" r="7" fill="#1f8a4c"/><text x="${n.x+W-11}" y="${n.y+H-7.5}" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">✔</text></g>`:`<circle cx="${n.x+W-11}" cy="${n.y+H-11}" r="7" fill="var(--pain)"/><text x="${n.x+W-11}" y="${n.y+H-7.5}" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">!</text>`):""}
      ${s.cop?`<rect x="${n.x+W-44}" y="${n.y-7}" width="38" height="13" rx="4" fill="#fff" stroke="#0070c0" stroke-dasharray="3 2"/><text x="${n.x+W-25}" y="${n.y+2.5}" font-size="8" font-weight="700" fill="#0070c0" text-anchor="middle">${esc2(s.cop.tag||"Copilot")}</text>`:""}
      ${ch!=="same"?`<rect x="${n.x+W-34}" y="${n.y+4}" width="30" height="13" rx="4" fill="var(--prop)"/><text x="${n.x+W-19}" y="${n.y+13.5}" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">${ch==="new"?"NEW":"AI"}</text>`:""}
    </g>`;
  });
  const svg=document.querySelector(E.svg);svg.setAttribute("viewBox",`0 0 ${svgW} ${svgH}`);svg.setAttribute("data-f",filter);svg.innerHTML=h;
  svg.querySelectorAll(".nd,.opn").forEach(g=>{const f=()=>detail(g.dataset.id);g.onclick=f;g.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();f()}}});
}
function detail(id){const n=nodes[id];if(!n)return;sel=id;
  document.querySelector(E.svg).querySelectorAll(".opn").forEach(g=>g.classList.toggle("sel",g.dataset.id===id));
  if(n.kind==="opp"||n.kind==="fopp"){const o=n.opp;document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)}${n.P?" / "+esc2(n.P.name):""}</span><h3 style="color:#0070c0">AI Opportunity: ${esc2(o.t)}</h3><dl><div><dt>Type</dt><dd><b>${esc2(o.ty)}</b></dd></div><div><dt>How it would work and tools</dt><dd class="opl">${esc2(o.d)}</dd></div>${(n.P?n.P.steps.flatMap(s=>s.pp||[]):(n.f.pp||[])).length?`<div><dt style="color:var(--pain)">Pain points it addresses</dt><dd class="ppl">${[...new Set(n.P?n.P.steps.flatMap(s=>s.pp||[]):(n.f.pp||[]))].map(esc2).join("<br>")}</dd></div>`:""}<div><dt>Feasibility</dt><dd><span class="badge st ur">${esc2(o.feas||"Under review")}</span></dd></div><div><dt>Source</dt><dd>${esc2(o.rid)} - hypothesis to validate with TDT and the LT</dd></div></dl>`;return}
  if(n.kind==="ch"||n.kind==="tpi"){const c=n.c,ids=(c.steps||[]).map(s=>`${n.f.id}|${s}`);document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.toggle("sel",ids.includes(g.dataset.id)));
    const names=ids.map(i=>nodes[i]).filter(Boolean).map(x=>`<b>${esc2(x.P.name)}</b> · ${esc2(x.s.n)}. ${esc2(x.s.t)}`).join("<br>");
    document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)}</span><h3 style="color:${n.kind==="ch"?"#a00015":"#13643a"}">${n.kind==="ch"?"[CHALLENGE] Pain point":`[SOLUTION] ${esc2(c.st||"TPI")}`}</h3><p style="margin:4px 0 0">${esc2(c.t)}</p><dl>${names?`<div><dt>${n.kind==="ch"?"Where it hits (highlighted on the map)":"Steps it addresses (highlighted on the map)"}</dt><dd>${names}</dd></div>`:""}${c.ref?`<div><dt>Reference</dt><dd>${esc2(c.ref)}</dd></div>`:""}<div><dt>Source</dt><dd>${esc2(c.ref||"")}</dd></div></dl>`;return}
  if(n.kind==="dec"){const q=n.dec;document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.remove("sel"));
    const r=(t,v,cls)=>v?`<div><dt>${t}</dt><dd class="${cls||""}">${v}</dd></div>`:"";
    document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f?n.f.name:"")}${n.P?" / "+esc2(n.P.name):""}</span><h3 style="color:#5b2a7a">Decision: ${esc2(q.q)}</h3>${q.d?`<p style="margin:4px 0 0">${esc2(q.d)}</p>`:""}<dl>${r("Example",q.ex?`<i>${esc2(q.ex)}</i>`:"")}${r("Checked by",q.o?esc2(q.o):"")}${r("System",q.sys?esc2(q.sys):"")}<div><dt>If yes</dt><dd>${esc2(q.yes)}</dd></div><div><dt>If no</dt><dd>${esc2(q.no)}</dd></div>${q.pp&&q.pp.length?r('<span style="color:var(--pain)">Pain point when the answer is no</span>',q.pp.map(esc2).join("<br>"),"ppl"):""}${r("Source",q.src?esc2(q.src):"")}</dl>`;return}
  const s=n.s;document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.toggle("sel",g.dataset.id===id));
  const row=(t,v,cls)=>v?`<div><dt>${t}</dt><dd class="${cls||""}">${v}</dd></div>`:"";
  const ownc=o=>o.split(/\s\/\s|,\s*/).map(x=>`<span class="own"><i style="background:${pc(x)}"></i>${esc2(x)}</span>`).join("");
  let html=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)} / ${esc2(n.P.name)} (${esc2(n.P.id)})</span><h3>${s.n}. ${esc2(s.t)}</h3><p style="margin:4px 0 0">${esc2(s.d)}</p><dl>`;
  html+=row("Who",ownc(s.o))+row("System",esc2(s.sys))+row("Activity type",`<b style="color:${TYC[s.ty]}">${TYNM[s.ty]}</b>${s.was?` <small>(as-is: ${TYNM[s.was]})</small>`:""}`);
  if(s.in&&s.in.length)html+=row("Input from",s.in.map(x=>`<b>${esc2(x[0])}</b>: ${esc2(x[1])}`).join("<br>"));
  if(s.out&&s.out.length)html+=row("Output to",s.out.map(x=>`<b>${esc2(x[0])}</b>: ${esc2(x[1])}`).join("<br>"));
  if(s.dec)html+=row("Decision",`<b>${esc2(s.dec.q)}</b><br>Yes &rarr; ${esc2(s.dec.yes)}<br>No &rarr; ${esc2(s.dec.no)}`);
  if(s.ctl)html+=row("Control",esc2(s.ctl));
  if(s.pp&&s.pp.length)html+=row('<span style="color:var(--pain)">Pain points</span>',s.pp.map(esc2).join("<br>"),"ppl");
  if(s.ci)html+=row("Existing CI / TPI",esc2(s.ci));
  if(page==="tobe"&&s.ch&&s.ch!=="same")html+=row('<span style="color:var(--prop)">AI suggestion (hypothesis, to validate)</span>',`${s.aik?`<span class="badge ${/digital/i.test(s.aik)?"dg":"pi2"}">${esc2(s.aik)}</span><br>`:""}<b>${esc2(s.rec||"")}</b><br>Tools: ${esc2(s.tools||"")}<br><small>Basis: ${esc2(s.opp||"")}</small>`,"opl");
  if(page==="tobe"&&s.cop)html+=row('<span style="color:#0070c0">Copilot / Agent Builder option (added hypothesis, to validate)</span>',`<b>${esc2(s.cop.tool)}</b><br>${esc2(s.cop.d)}`,"opl");
  html+=row("Source",esc2(s.src))+`</dl>`;
  if(page==="tobe"&&s.ch==="same"&&!s.cop)html+=`<p style="font-size:12px;color:var(--muted)">No change proposed for this step.</p>`;
  document.querySelector(E.det).innerHTML=html;
}
function legend(){const d=DATA[page];const sw=(c,dash)=>`<svg width="22" height="12"><line x1="0" y1="6" x2="22" y2="6" stroke="${c}" stroke-width="1.6" ${dash?'stroke-dasharray="4 3"':""}/></svg>`;
  const box=c=>`<svg width="20" height="12"><rect x="1" y="1" width="18" height="10" rx="3" fill="none" stroke="${c}" stroke-width="2"/></svg>`;
  document.querySelector(E.leg).innerHTML=`<span>${box("#d0021b")}Manual</span><span>${box("#e8891c")}Semi-automated</span><span>${box("#2f6fce")}Automated</span><span><svg width="14" height="14"><circle cx="7" cy="7" r="6.5" fill="#c8102e"/><text x="7" y="10.5" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">!</text></svg>Pain point</span><span><svg width="14" height="14"><path d="M7,1L13,7L7,13L1,7z" fill="#f3ecfa" stroke="#7b3597"/></svg>Decision</span><span>${sw("var(--navy)")}Flow</span><span>${sw(d.accent)}Chain between processes</span><span>${sw(d.accent,1)}Loop back</span>${d.frames.some(f=>f.ch&&f.ch.length)?`<span><svg width="22" height="12"><rect x="1" y="1" width="20" height="10" rx="3" fill="#fdecec" stroke="var(--pain)"/></svg>[CHALLENGE] pain point</span><span><svg width="22" height="12"><rect x="1" y="1" width="20" height="10" rx="3" fill="#e6f4ec" stroke="var(--ok)"/></svg>[SOLUTION] TPI / CI</span><span>${sw(d.accent,1)}Same output</span>`:""}${d.frames.some(f=>f.procs.some(p=>p.steps.some(s=>s.gate&&s.fix&&!s.noRetry)))?`<span>${sw("var(--navy)",1)}Retry after the fix</span>`:""}${d.frames.some(f=>f.procs.some(p=>p.steps.some(s=>s.dec&&s.dec.nx&&s.dec.nx.end)))?`<span><svg width="26" height="14"><rect x="1" y="1" width="24" height="12" rx="6" fill="#fdecec" stroke="#d0021b" stroke-width="1.3"/></svg>End of the flow (reject / hold)</span>`:""}<span><svg width="34" height="14"><rect width="34" height="14" rx="4" fill="${d.accent}"/><text x="17" y="10.5" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">Input</text></svg>Trigger / input</span><span><svg width="18" height="14"><path d="M1,1 L12,1 L17,6 L17,13 L1,13z" fill="#fff7e0" stroke="#d9a400"/></svg>Output</span>${page==="tobe"?`<span><svg width="70" height="16"><rect x="1" y="1" width="68" height="14" rx="7" fill="none" stroke="#0070c0" stroke-width="1.3" stroke-dasharray="3 2"/><text x="35" y="11.5" font-size="9" font-weight="700" fill="#0070c0" text-anchor="middle">AI: R2R</text></svg>AI-suggested dependency</span><span><svg width="60" height="16"><rect x="1" y="1" width="58" height="14" rx="4" fill="#e8f1fb" stroke="#0070c0"/><text x="30" y="11.5" font-size="8.5" font-weight="700" fill="#0070c0" text-anchor="middle">AI Opportunity</text></svg>AI opportunity (Claude)</span><span><svg width="30" height="13"><rect width="30" height="13" rx="4" fill="#0070c0"/><text x="15" y="10" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">AI</text></svg>Step changed (AI suggested)</span><span><svg width="30" height="13"><rect width="30" height="13" rx="4" fill="#0070c0"/><text x="15" y="10" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">NEW</text></svg>New step</span>`:""}<span>Pills = input from / output to; strips = upstream / downstream</span>`;}
function setScale(s){scale=Math.max(.3,Math.min(2,s));const svg=document.querySelector(E.svg);svg.style.width=svgW*scale+"px";svg.style.height=svgH*scale+"px"}
function fit(){const w=document.querySelector(E.scroll).clientWidth-10;setScale(Math.min(1,w/svgW))}
function render(pg,fl){if(pg)page=pg;if(fl)filter=fl;sel=null;draw();legend();document.querySelector(E.det).innerHTML='<p class="none">Select a step in the map to see what happens, who does it, the system, inputs, outputs, decisions, pain points and the source.</p>';fit()}
function setFilter(f){filter=f;document.querySelector(E.svg).setAttribute("data-f",f)}
function goto(fid,pid){const n=nodes[`${fid}|${pid}|in`];if(!n)return;const sc=document.querySelector(E.scroll);sc.scrollTo({left:Math.max(0,(n.x-30)*scale),top:Math.max(0,(n.y-70)*scale),behavior:"smooth"});const first=Object.values(nodes).find(x=>x.P&&x.P.id===pid&&x.s&&!x.fixOf);if(first){detail(first.id);const dr=document.getElementById("dr-"+KEY);if(dr)dr.classList.add("on")}}
return {getNodes:()=>nodes,getDimensions:()=>({width:svgW,height:svgH}),render,setFilter,zi:()=>setScale(scale+.15),zo:()=>setScale(scale-.15),fit,page:()=>page,setScale,getScale:()=>scale,goto};
};
window.TowerRenderers["R2R"]=function makeTowerMap(KEY,DATA,E){
const TPIS=new Set();Object.values(DATA).forEach(dd=>dd&&dd.frames&&dd.frames.forEach(f=>(f.tpi||[]).forEach(t=>(t.steps||[]).forEach(r=>TPIS.add(f.id+"|"+r)))));
const W=158,H=74,G=46,DW=34,PAD=24,FH=E.frameHeaderHeight||46,ROWL=E.processHeaderGap||22,PIN=E.processInputGap||24,POUT=24,RGAP=44,STRIP=E.handoffStripHeight||30,INW=118,CH=14;
const TYC={man:"#d0021b",auto:"#2f6fce",hyb:"#e8891c"},TYNM={man:"Manual",hyb:"Semi-automated",auto:"Automated"};
const esc2=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function wrap(t,n,max){const w=String(t).split(" ");const L=[];let c="";w.forEach(x=>{if((c+" "+x).trim().length>n){if(c)L.push(c);c=x}else c=(c+" "+x).trim()});if(c)L.push(c);max=max||2;if(L.length>max){L[max-1]=L.slice(max-1).join(" ");if(L[max-1].length>n+2)L[max-1]=L[max-1].slice(0,n)+"…";L.length=max}return L}
function text(x,y,lines,o={}){return `<text x="${x}" y="${y}" font-size="${o.fs||11.5}" font-weight="${o.fw||500}" fill="${o.fill||"var(--ink)"}" text-anchor="${o.a||"middle"}" font-family="Inter,Segoe UI,Arial,sans-serif">${lines.map((l,i)=>`<tspan x="${x}" dy="${i?1.2:0}em">${esc2(l)}</tspan>`).join("")}</text>`}
let page="asis",filter="all",nodes={},svgW=0,svgH=0,scale=1,sel=null;
const pc=p=>{if(/authority/i.test(p))return "#475467";const k=String(p).split(/[ -]/)[0];return ({O2C:"var(--O2C)",R2R:"var(--R2R)",TAX:"var(--Tax)",Tax:"var(--Tax)",P2P:"var(--P2P)",CAPEX:"var(--CAPEX)",Controlling:"var(--Controlling)",C2C:"var(--O2C)",GFR:"#152847",IT:"#0e7490",System:"#667085",GPS:"#0e7490",Counterparties:"#667085",Action:"#667085",All:"#667085",Deloitte:"#65758b",Supplier:"#8a6d3b",Business:"#b7791f",Procurement:"#c2410c",Sales:"#0f766e",Financial:"#7b3597",CFC:"#7b3597",ATO:"#475467",Vietnam:"#475467",Group:"#152847",DMT:"#0e7490",Customer:"#8a6d3b",Distributors:"#8a6d3b",Distribution:"#0f766e",Bank:"#475467",Payroll:"#b7791f",Local:"#b7791f",FP:"var(--FPA)",HR:"#9d174d",International:"#152847",Area:"#152847",Group:"#152847",MC:"#b7791f",BUD:"#b7791f",BUDs:"#b7791f",Brand:"#b7791f",Cost:"#b7791f",Business:"#b7791f",CFO:"#7b3597",CP:"#7b3597",CBP:"#c77a0a",Embedded:"#c77a0a",SAP:"#667085",CMR:"#667085",PMR:"#667085",AZ:"#667085",AZForce:"#667085",Enpire:"#667085",OneGRC:"#475467",Approver:"#7b3597",Market:"#b7791f",Posting:"var(--R2R)",FBPs:"#c77a0a",Planning:"#667085","P&MR":"#667085"})[k]||(String(p).startsWith("FP&A")?"var(--FPA)":"#667085")};
function pill(x,y,label,c,dash,title,anchorLeft){const w=label.length*6.2+16;return {w,h:`<g class="source-pill"><title>${esc2(title||label)}</title><rect x="${x}" y="${y}" width="${w}" height="17" rx="8.5" fill="var(--card)" stroke="${c}" stroke-width="1.3" ${dash?'stroke-dasharray="3 2"':""}/>${text(x+w/2,y+12,[label],{fs:10,fw:600,fill:c})}</g>`}}
function layout(d){
  nodes={};let h="",y=PAD+10,maxX=0;const x0=PAD+(d.chan||60);
  // phase chevrons (processes grouped by key process)
  {const raw=d.frames.flatMap(f=>f.procs.map(p=>({p,f})));const procs=[];raw.forEach(it=>{const k=it.p.phase||it.p.name;const L=procs[procs.length-1];if(L&&L.k===k&&L.f===it.f){L.ids.push(it.p.id)}else procs.push({k,f:it.f,p:it.p,ids:[it.p.id]})});const cw=procs.length<=3?230:150,ch=40;let cx=x0;
   h+=text(x0,y+12,["Process phases"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});y+=18;
   procs.forEach(({p,f},i)=>{const fi=d.frames.indexOf(f);const col=d.accent;const op=.55+.15*(fi%3);
     h+=`<g><title>${esc2(f.name)} / ${esc2(p.phase||p.name)} (${esc2(procs[i].ids.join(", "))})</title><path d="M${cx},${y} L${cx+cw-14},${y} L${cx+cw},${y+ch/2} L${cx+cw-14},${y+ch} L${cx},${y+ch} L${cx+14},${y+ch/2}z" fill="${col}" fill-opacity="${op}"/>${text(cx+cw/2+4,y+ch/2+4,wrap(`${i+1}. ${p.phase||p.name}`,cw>200?32:20,1),{fs:10.5,fw:700,fill:"#fff"})}</g>`;cx+=cw+4});
   maxX=Math.max(maxX,cx);y+=ch+22;}
  d.frames.forEach((f,fi)=>{
    const top=y;const c=d.accent;
    y+=FH;
    // upstream strip
    let px=x0+8;const upY=y+4;h+=text(x0,upY+12,["Upstream"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});px+=66;
    f.up.forEach(u=>{const p=pill(px,upY,(u.c?"AI: ":"")+u.p,u.c?"var(--prop)":pc(u.p),!!u.c,`${u.c?"AI SUGGESTED - ":""}${u.p}: ${u.w} (${u.src})`);h+=p.h;px+=p.w+6});
    maxX=Math.max(maxX,px);y+=STRIP;
    f.procs.forEach((P,pi)=>{
      y+=ROWL;if(P.validation){const vl=wrap(P.validation,145,3);h+=text(x0,y-4,vl,{fs:10.5,fw:600,fill:"#5b2a7a",a:"start"});y+=vl.length*13+12}const rowY=y+PIN;let x=x0;const items=[];
      nodes[`${f.id}|${P.id}|in`]={id:`${f.id}|${P.id}|in`,x,y:rowY,w:INW,h:H,kind:"in",lab:P.inbox[0],txt:P.inbox[1],f,P};x+=INW+G-12;
      P._headingY=y;h+=`<g class="source-process-heading">`;h+=text(x0,y-4,[`${P.name}`],{fs:12,fw:700,fill:"var(--navy)",a:"start"});h+=text(x0+P.name.length*7.2+10,y-4,[`${P.id} · ${P.owner}`],{fs:10.5,fill:"var(--muted)",a:"start"});h+=`</g>`;
      const seq=[`${f.id}|${P.id}|in`];let fext=0;P._rb=rowY+H;P._gates=false;
      P.steps.forEach((s,j)=>{
        if(s.gate){P._gates=true;x+=60;const gid=`${f.id}|${P.id}|${s.n}`;nodes[gid]={id:gid,x,y:rowY+H/2-DW/2,w:DW,h:DW,kind:"dec",gate:true,dec:s,f,P,j,ln:P.steps.slice(j+1).filter(q=>q.gate&&q.nx&&!q.nx.end).length};seq.push(gid);
          if(s.fix){const fs=s.fix,fid=`${f.id}|${P.id}|${fs.n}`;nodes[fid]={id:fid,x:x+DW/2-W/2,y:rowY+H+56,w:W,h:H,s:fs,f,P,j,fixOf:gid};fext=56+H+4;P._rb=rowY+H+fext-4}
          x+=DW+G+76;return}
        if(s.fork){P._gates=true;const BG=56,nb=s.branches.length;x+=30;const dx=x,sx=dx+DW+G+40,bx=sx+W+30;
          s.branches.forEach((b,bi)=>{const by=rowY+bi*(H+BG);const nq=s.branches[bi+1];const did=`${f.id}|${P.id}|${b.step.n}|d`;
            nodes[did]={id:did,x:dx,y:by+H/2-DW/2,w:DW,h:DW,kind:"dec",fork:true,f,P,dec:{q:b.q,ex:b.ex,o:b.o,d:b.d,src:b.src,yes:`Step ${b.step.n} - ${b.step.t}`,no:nq?`Check: ${nq.q}`:(s.elseLab||"No")+" - release"}};
            const sid=`${f.id}|${P.id}|${b.step.n}`;nodes[sid]={id:sid,x:sx,y:by,w:W,h:H,s:b.step,f,P,j,br:true}});
          const fid=`${f.id}|${P.id}|fork${j}`;nodes[fid]={id:fid,kind:"fork",fk:s,f,P,x:dx,w:bx-dx,dx,sx,bx,rowY};seq.push(fid);
          fext=Math.max(fext,(nb-1)*(H+BG)+34);P._rb=Math.max(P._rb,rowY+H+(nb-1)*(H+BG)+30);x=bx+40;return}
        const id=`${f.id}|${P.id}|${s.n}`;nodes[id]={id,x,y:rowY,w:W,h:H,s,f,P,j};items.push(id);seq.push(id);x+=W+G;
        if(s.dec){x+=30;nodes[id+"|d"]={id:id+"|d",x:x,y:rowY+H/2-DW/2,w:DW,h:DW,dec:s.dec,kind:"dec",step:s,f,P,ln:P.steps.slice(j+1).filter(q=>q.dec&&q.dec.nx&&!q.dec.nx.end).length};x+=DW+G+40}});
      P._seq=seq;
      if(P.outdoc){x+=14;nodes[`${f.id}|${P.id}|out`]={id:`${f.id}|${P.id}|out`,x,y:rowY+8,w:150,h:H-16,kind:"out",doc:P.outdoc,f,P,from:P._gates?seq[seq.length-1]:items[items.length-1]};seq.push(`${f.id}|${P.id}|out`);x+=150+G}
      if(d.key==="tobe"&&P.opp){x+=6;nodes[`${f.id}|${P.id}|opp`]={id:`${f.id}|${P.id}|opp`,x,y:rowY-6,w:250,h:H+12,kind:"opp",opp:P.opp,f,P,from:items[items.length-1]};x+=270}
      maxX=Math.max(maxX,x);
      y=rowY+H+POUT+RGAP+fext+(P.steps.some(s=>s.dec&&s.dec.nx)?30:0);
    });
    if(d.key==="tobe"&&f.opp){nodes[`${f.id}|opp`]={id:`${f.id}|opp`,x:x0,y:y-18,w:460,h:44,kind:"fopp",opp:f.opp,f};y+=56}
    // challenge / TPI strips
    if((f.ch&&f.ch.length)||(f.tpi&&f.tpi.length)){y+=4;
      const strip=(items,kind,lab,fill,stroke,col,bw)=>{h+=text(x0,y+12,[lab],{fs:10.5,fw:700,fill:col,a:"start"});y+=20;let bx=x0;
        items.forEach((c,i)=>{const id=`${f.id}|${kind}${i}`;const head=kind==="ch"?"[CHALLENGE]":`[SOLUTION] ${c.st||"TPI"}`;const tl=wrap(c.t,Math.floor(bw/5.6),2);nodes[id]={id,kind,c,f,x:bx,y,w:bw,h:50};
          h+=`<g class="opn ${sel===id?"sel":""}" tabindex="0" role="button" data-id="${id}"><title>${esc2(head)}: ${esc2(c.t)}${c.ref?" - "+esc2(c.ref):""}</title><rect class="b" x="${bx}" y="${y}" width="${bw}" height="50" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>${text(bx+10,y+14,[head],{fs:9.5,fw:700,fill:col,a:"start"})}${c.ref?text(bx+bw-8,y+14,[c.ref],{fs:8.8,fill:col,a:"end"}):""}${text(bx+10,y+29,tl,{fs:9.8,fill:"var(--navy)",a:"start"})}</g>`;bx+=bw+12;maxX=Math.max(maxX,bx);if((i+1)%4===0&&i<items.length-1){bx=x0;y+=50+10}});
        y+=50+14};
      if(f.ch&&f.ch.length)strip(f.ch,"ch","Pain points (register)","#fdecec","var(--pain)","#a00015",330);
      if(f.tpi&&f.tpi.length)strip(f.tpi,"tpi","TPI register items (Jul-Aug 2026)","#e6f4ec","var(--ok)","#13643a",430);
    }
    // downstream strip
    px=x0+8;const dnY=y-10;h+=text(x0,dnY+12,["Downstream"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});px+=78;
    f.down.forEach(u=>{const p=pill(px,dnY,(u.c?"AI: ":"")+u.p,u.c?"var(--prop)":pc(u.p),!!u.c,`${u.c?"AI SUGGESTED - ":""}${u.p}: ${u.w} (${u.src})`);h+=p.h;px+=p.w+6});
    maxX=Math.max(maxX,px);y+=STRIP+6;
    f._box={top,bot:y,c};y+=26;
  });
  const FR=Math.max(maxX+40,1180);d._fr=FR;svgW=FR;svgH=y+PAD;
  return h;
}
function noBranch(n){const q=n.dec,nx=q.nx,cx=n.x+DW/2,by=n.y+DW,rowY=n.y-(H/2-DW/2),rb=n.P&&n.P._rb?n.P._rb:rowY+H;let o="";if(nx.none)return nx.nl?text(cx+5,by+13,[nx.nl],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"}):"";
  if(nx.end){const hold=nx.kind==="hold",w=Math.max(96,nx.end.length*6.4+22),ty=(n.gate&&rb>rowY+H)?rowY+H+56+H/2-13:rb+34;o+=`<path d="M${cx},${by} L${cx},${ty}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+13,[q.swap?"Yes":"No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})+`<g><title>${esc2(q.q)} No: ${esc2(q.no)}</title><rect x="${cx-w/2}" y="${ty}" width="${w}" height="26" rx="13" fill="${hold?"#fff4e0":"#fdecec"}" stroke="${hold?"#e8891c":"#d0021b"}" stroke-width="1.5"/>${text(cx,ty+17,[nx.end],{fs:9.8,fw:700,fill:hold?"#8a4b00":"#a00015"})}</g>`;return o}
  const T=nx.out?nodes[`${n.f.id}|${n.P.id}|out`]:nodes[`${n.f.id}|${n.P.id}|${nx.step}`];if(!T)return text(cx,n.y+DW+11,wrap("No: "+q.no,26,1),{fs:8.5,fill:"#7b3597"});
  const yb=rb+40+(n.ln||0)*12,ex=nx.out?T.x+T.w/2:T.x+T.w-16-(n.ln||0)*16,ty=T.y+T.h;
  o+=`<path d="M${cx},${by} L${cx},${yb} L${ex},${yb} L${ex},${ty}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+13,[q.swap?"Yes":"No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
  const nl=q.nl||nx.nl;if(nl){const lw=nl.length*5.4+8;o+=`<rect x="${cx+10}" y="${yb-7}" width="${lw}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(cx+14,yb+3,[nl],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}
  return o}
function fixBranch(n){const q=n.dec,F=nodes[`${n.f.id}|${n.P.id}|${q.fix.n}`];if(!F)return "";const cx=n.x+DW/2,by=n.y+DW,rowY=n.y-(H/2-DW/2),ym=rowY+H+18,ex=F.x+W+16,rx=F.x-16,cy=rowY+H/2;let o="";
  o+=`<path d="M${cx},${by} L${cx},${ym} L${ex},${ym} L${ex},${F.y+H/2} L${F.x+W},${F.y+H/2}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+12,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
  const S1=nodes[`${n.f.id}|${n.P.id}|1`];
  if(n.P.id==="SOC-01.1"){const S2=nodes[`${n.f.id}|${n.P.id}|1`];if(S2){const k=["1a","1b","1c"].indexOf(q.fix.n),yy=F.y+H+22+k*9,tx=S2.x+30+k*14,fx=F.x+W/2;o+=`<path d="M${fx},${F.y+H} L${fx},${yy} L${tx},${yy} L${tx},${S2.y+H}" class="fl" marker-end="url(#o1)"/>`}}else if(S1&&false){const k=["1a","1b","1c"].indexOf(q.fix.n),by=F.y+H+18+k*10,sx=S1.x+30+k*12,fx=F.x+W/2;o+=`<path d="M${fx},${F.y+H} L${fx},${by} L${sx},${by} L${sx},${S1.y+H}" class="fl" stroke-dasharray="5 3" marker-end="url(#o1)"/>`;
  if(k===0)o+=`<rect x="${sx+8}" y="${by-7}" width="${"Retry from step 1".length*5+6}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(sx+11,by+3,["Retry from step 1"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}
  else if(!q.noRetry){o+=`<path d="M${F.x},${F.y+H/2} L${rx},${F.y+H/2} L${rx},${cy} L${n.x},${cy}" class="fl" stroke-dasharray="5 3" marker-end="url(#o1)"/>`;
  const ly=(F.y+H/2+cy)/2;o+=`<rect x="${rx-34}" y="${ly-7}" width="31" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(rx-4,ly+3,["Retry"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"end"});
  }
  if(n.P.id==="SOC-05.1"){const O=nodes[`${n.f.id}|${n.P.id}|out`],S3=nodes[`${n.f.id}|${n.P.id}|3`],fx=F.x+W/2;if(O){const tx=O.x+O.w/2,jy=F.y+H+30;o+=`<path d="M${fx+12},${F.y+H} L${fx+12},${jy} L${tx},${jy} L${tx},${O.y+O.h}" class="fl" marker-end="url(#o1)"/>`}if(S3){const tx=S3.x+W-10,jy=F.y+H+16;o+=`<path d="M${fx-12},${F.y+H} L${fx-12},${jy} L${tx},${jy} L${tx},${S3.y+H}" class="fl" marker-end="url(#o1)"/>`}}else if(q.fix.join){const sq=n.P._seq||[],J=q.fix.join==="out"?nodes[`${n.f.id}|${n.P.id}|out`]:nodes[sq[sq.indexOf(n.id)+2]];if(J){const jx=F.x+W/2,jy=F.y+H+34,tx=J.x+J.w/2;if(J.kind==="dec"){const cyy=J.y+J.h/2,mx=J.x-14;o+=`<path d="M${jx},${F.y+H} L${jx},${jy} L${mx},${jy} L${mx},${cyy} L${J.x},${cyy}" class="fl" marker-end="url(#o1)"/>`}else o+=`<path d="M${jx},${F.y+H} L${jx},${jy} L${tx},${jy} L${tx},${J.y+J.h}" class="fl" marker-end="url(#o1)"/>`}}
  return o}
function draw(){
  const d=DATA[page];const strips=layout(d);let h=`<defs><marker id="o1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--navy)"/></marker><marker id="o2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#7b3597"/></marker><marker id="o3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#0070c0"/></marker><marker id="o4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="${d.accent}"/></marker><marker id="o5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0L10,5L0,10z" fill="${d.accent}"/></marker></defs>
  <style>.fl{fill:none;stroke:var(--navy);stroke-width:1.6}.rw{fill:none;stroke:#7b3597;stroke-width:1.4;stroke-dasharray:5 4}svg[data-f="man"] .nd:not(.ty-man),svg[data-f="hyb"] .nd:not(.ty-hyb),svg[data-f="auto"] .nd:not(.ty-auto),svg[data-f="pp"] .nd:not(.has-pp),svg[data-f="tpi"] .nd:not(.has-tpi){opacity:.14}svg[data-f="tpi"] .nd.has-tpi rect.b{stroke:#13643a;stroke-width:4;filter:drop-shadow(0 0 5px rgba(19,100,58,.55))}.opn{cursor:pointer}.opn:hover rect.b,.opn.sel rect.b{stroke-width:2.4}</style>`;
  // frames
  d.frames.forEach((f,fi)=>{const b=f._box;const wdt=d._fr-PAD*2;
    h+=`<rect x="${PAD}" y="${b.top}" width="${wdt}" height="${b.bot-b.top}" rx="14" fill="${b.c}" fill-opacity=".05" stroke="${b.c}" stroke-opacity=".35"/><rect x="${PAD}" y="${b.top}" width="${wdt}" height="${FH-6}" rx="14" fill="${b.c}"/><rect x="${PAD}" y="${b.top+20}" width="${wdt}" height="${FH-26}" fill="${b.c}"/>`;
    {const ts=d.tshift||0;h+=text(PAD+16+ts,b.top+26,[`${fi+1}. ${f.name}`],{fs:15,fw:700,fill:"#fff",a:"start"})+text(PAD+16+ts+f.name.length*9.2+30,b.top+26,[`${f.owner} · ${f.win}`],{fs:11,fill:"#fff",a:"start"});}
    if(f.pp&&f.pp.length)h+=`<g><title>Pain points: ${esc2(f.pp.join(" | "))}</title><circle cx="${PAD+wdt-22}" cy="${b.top+20}" r="9" fill="#fff"/><text x="${PAD+wdt-22}" y="${b.top+24.5}" font-size="12" font-weight="700" fill="var(--pain)" text-anchor="middle">!</text></g>`;
    if(f.ctl&&f.ctl.length)h+=`<g><title>Controls: ${esc2(f.ctl.join(" | "))}</title><circle cx="${PAD+wdt-48}" cy="${b.top+20}" r="9" fill="#fff"/><text x="${PAD+wdt-48}" y="${b.top+24.5}" font-size="11" font-weight="700" fill="${b.c}" text-anchor="middle">C</text></g>`;
  });
  h+=strips;(d.frames||[]).forEach(f=>f.procs.forEach(P=>{if(P.back){const A=nodes[`${f.id}|${P.id}|${P.back.from}`],B=nodes[`${f.id}|${P.id}|${P.back.to}`];if(A&&B){const yy=A.y+A.h+16,ax=A.x+A.w/2,bx=B.x+B.w/2+(P.back.dx||0);h+=`<path d="M${ax},${A.y+A.h} L${ax},${yy} L${bx},${yy} L${bx},${B.y+B.h}" class="fl" marker-end="url(#o1)"/>`}}}));
  // chain between processes and key processes (internal O2C flow)
  (d.chain||[]).forEach((e,i)=>{const A=nodes[e.a],B=nodes[e.b];if(!A||!B)return;const lane=PAD+CH+(i%(d.lanes||4))*(d.lanes?8:11);const col=d.accent;
    const ax=A.x+A.w/2,ay=A.y+A.h,yg=e.below&&A.f&&A.f._box?A.f._box.bot+7+(i%3)*6:A.y+A.h+(e.dy!=null?e.dy:(A.kind==="out"?30:34));
    const by=B.kind==="in"?B.y+B.h/2:B.y;let p;
    if(B.kind==="in"){p=`M${ax},${ay} L${ax},${yg} L${lane},${yg} L${lane},${by} L${B.x},${by}`}
    else{p=`M${ax},${ay} L${ax},${yg} L${lane},${yg} L${lane},${B.y-16} L${B.x+B.w/2-24},${B.y-16} L${B.x+B.w/2-24},${B.y}`}
    h+=`<path d="${p}" fill="none" stroke="${col}" stroke-width="${e.loop?1.5:2.2}" ${e.loop?'stroke-dasharray="6 4"':""} stroke-opacity=".9" marker-end="url(#${e.loop?"o4":"o5"})"/>`;
    if(e.lab){const lw=e.lab.length*5.6+10,lx=e.below?ax-lw-8:ax+8;const ly=yg+(e.ldy||0);h+=`<rect x="${lx}" y="${ly-13}" width="${lw}" height="15" rx="4" fill="var(--card)" fill-opacity=".9"/>`+text(lx+5,ly-2,[e.lab],{fs:9.2,fw:600,fill:col,a:"start"})}
  });
  // same-output link between two processes' outputs
  d.frames.forEach(f=>{const so=f.sameOut;if(!so)return;const A=nodes[`${f.id}|${so.a}|out`],B=nodes[`${f.id}|${so.b}|out`];if(!A||!B)return;const ax=A.x+A.w/2,bx=B.x+B.w/2,ym=B.y-72;
    h+=`<path d="M${ax},${A.y+A.h} L${ax},${ym} L${bx},${ym} L${bx},${B.y}" fill="none" stroke="${d.accent}" stroke-width="1.8" stroke-dasharray="3 4" stroke-linecap="round"/><circle cx="${ax}" cy="${A.y+A.h}" r="3.5" fill="${d.accent}"/><circle cx="${bx}" cy="${B.y}" r="3.5" fill="${d.accent}"/>`;
    if(so.lab){const lw=so.lab.length*5.6+14,lx=Math.min(ax,bx)+Math.abs(bx-ax)/2-lw/2;h+=`<rect x="${lx}" y="${ym-9}" width="${lw}" height="17" rx="8" fill="var(--card)" stroke="${d.accent}" stroke-width="1"/>`+text(lx+lw/2,ym+3,[so.lab],{fs:9.2,fw:600,fill:d.accent})}});
  // edges
  d.frames.forEach(f=>f.procs.forEach(P=>{if(!P._gates)return;const sq=P._seq;for(let i=0;i<sq.length-1;i++){const A=nodes[sq[i]],B=nodes[sq[i+1]];if(!A||!B)continue;if(A.kind==="fork"){A.next=B;continue}const ay=A.kind==="in"?A.y+A.h/2:(A.kind==="dec"?A.y+A.h/2:A.y+H/2);h+=`<path d="M${A.x+A.w},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`}}));
  Object.values(nodes).forEach(n=>{if(n.kind==='in'){if(n.P._gates)return;const B=nodes[`${n.f.id}|${n.P.id}|1`];if(B)h+=`<path d="M${n.x+n.w},${n.y+H/2} L${B.x},${B.y+H/2}" class="fl" marker-end="url(#o1)"/>`;return}if(n.kind||n.fixOf||(n.P&&n.P._gates))return;const P=n.P,j=n.j;const nxt=P.steps[j+1];if(!nxt)return;const B=nodes[`${n.f.id}|${P.id}|${nxt.n}`];const D=nodes[n.id+"|d"];const ay=n.y+H/2;
    if(D){h+=`<path d="M${n.x+W},${ay} L${D.x},${ay}" class="fl" marker-end="url(#o1)"/><path d="M${D.x+DW},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`;}
    else h+=`<path d="M${n.x+W},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`});
  // handoff pills on steps + decisions + nodes
  Object.values(nodes).filter(n=>n.kind==="fork").forEach(n=>{const s=n.fk,f=n.f,P=n.P,cy0=n.rowY+H/2,cxd=n.dx+DW/2;let o="",yEnd=cy0;
    s.branches.forEach((b,bi)=>{const D=nodes[`${f.id}|${P.id}|${b.step.n}|d`],S=nodes[`${f.id}|${P.id}|${b.step.n}`];const cy=S.y+H/2;
      o+=`<path d="M${D.x+DW},${cy} L${S.x},${cy}" class="fl" marker-end="url(#o1)"/><path d="M${S.x+W},${cy} L${n.bx},${cy}" class="fl"/>`;yEnd=Math.max(yEnd,cy);
      const nxD=s.branches[bi+1]?nodes[`${f.id}|${P.id}|${s.branches[bi+1].step.n}|d`]:null;
      if(nxD)o+=`<path d="M${cxd},${D.y+DW} L${cxd},${nxD.y}" class="fl" marker-end="url(#o1)"/>`+text(cxd+5,D.y+DW+13,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
      else{const ye=S.y+H+30;const OT=s.elseOut?nodes[`${f.id}|${P.id}|out`]:null;o+=(OT?`<path d="M${cxd},${D.y+DW} L${cxd},${ye} L${OT.x+OT.w/2},${ye} L${OT.x+OT.w/2},${OT.y+OT.h}" class="fl" marker-end="url(#o1)"/>`:`<path d="M${cxd},${D.y+DW} L${cxd},${ye} L${n.bx},${ye}" class="fl"/>`)+text(cxd+5,D.y+DW+13,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
        if(s.elseLab){const lw=s.elseLab.length*5.4+8;o+=`<rect x="${cxd+10}" y="${ye-7}" width="${lw}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(cxd+14,ye+3,[s.elseLab],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}if(!OT)yEnd=Math.max(yEnd,ye)}});
    o+=`<path d="M${n.bx},${yEnd} L${n.bx},${cy0}" class="fl"/>`;if(n.next)o+=`<path d="M${n.bx},${cy0} L${n.next.x},${cy0}" class="fl" marker-end="url(#o1)"/>`;
    if(s.lab)o+=text(n.dx+DW/2,n.rowY-6,[s.lab],{fs:10,fw:700,fill:"var(--muted)"});
    h+=o});
  Object.values(nodes).forEach(n=>{
    if(n.kind==="ch"||n.kind==="tpi"||n.kind==="fork")return;
    if(n.kind==="opp"||n.kind==="fopp"){const o=n.opp,fr=n.kind==="opp"?nodes[`${n.f.id}|${n.P.id}|out`]:null;const tl=wrap(o.t,n.kind==="opp"?38:70,n.kind==="opp"?2:1);
      if(fr)h+=`<path d="M${fr.x+fr.w},${fr.y+fr.h/2} L${n.x},${n.y+n.h/2}" fill="none" stroke="#0070c0" stroke-width="1.4" stroke-dasharray="4 3" marker-end="url(#o3)"/>`;
      h+=`<g class="opn ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}"><title>AI Opportunity (${esc2(o.ty)}): ${esc2(o.t)} - ${esc2(o.d)}</title><rect class="b" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="9" fill="#e8f1fb" stroke="#0070c0" stroke-width="1.5"/>
      ${text(n.x+10,n.y+15,[n.kind==="fopp"?`AI Opportunity - ${n.f.name.length>30?n.f.name.slice(0,29)+"…":n.f.name}`:"AI Opportunity"],{fs:10.5,fw:700,fill:"#0070c0",a:"start"})}<rect x="${n.x+n.w-124}" y="${n.y+5}" width="118" height="14" rx="4" fill="${/digital/i.test(o.ty)?"#5b2a7a":"#0070c0"}"/><text x="${n.x+n.w-65}" y="${n.y+15}" font-size="8.3" font-weight="700" fill="#fff" text-anchor="middle">${esc2(o.ty)}</text>
      ${text(n.x+10,n.y+31,tl,{fs:10.3,fill:"var(--navy)",a:"start"})}</g>`;return}
    if(n.kind==="in"){const col=d.accent;h+=`<g><title>${esc2(n.lab)}: ${esc2(n.txt)}</title><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="9" fill="${col}"/>${text(n.x+n.w/2,n.y+15,[n.lab],{fs:9.5,fw:700,fill:"#fff"})}${text(n.x+n.w/2,n.y+31,wrap(n.txt,21,3),{fs:9.4,fill:"#fff"})}</g>`;return}
    if(n.kind==="out"){const fr=nodes[n.from];if(!n.P._gates)h+=`<path d="M${fr.x+fr.w},${fr.y+H/2} L${n.x},${n.y+n.h/2}" class="fl" marker-end="url(#o1)"/>`;h+=`<g><title>Output: ${esc2(n.doc)}${n.P.outnote?" - "+esc2(n.P.outnote):""}</title><path d="M${n.x},${n.y} L${n.x+n.w-12},${n.y} L${n.x+n.w},${n.y+12} L${n.x+n.w},${n.y+n.h} L${n.x},${n.y+n.h}z" fill="#fff7e0" stroke="#d9a400" stroke-width="1.4"/><path d="M${n.x+n.w-12},${n.y} L${n.x+n.w-12},${n.y+12} L${n.x+n.w},${n.y+12}" fill="none" stroke="#d9a400"/>${text(n.x+8,n.y+15,["Output"],{fs:9.5,fw:700,fill:"#8a6d00",a:"start"})}${text(n.x+n.w/2,n.y+30,wrap(n.doc,24,n.doc.length>48?3:2),{fs:9.8,fill:"var(--navy)"})}</g>`;return}
    if(n.kind==="dec"){const cx=n.x+DW/2,cy=n.y+DW/2,q=n.dec;const ql=wrap(q.q,22,2);h+=`<g class="opn ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}"><title>${esc2(q.q)} Yes: ${esc2(q.yes)}. No: ${esc2(q.no)}</title>${n.fork?`<rect x="${cx-(ql[0].length*5.5+8)/2}" y="${n.y-17}" width="${ql[0].length*5.5+8}" height="14" rx="3" fill="var(--card)" fill-opacity=".95"/>`:""}<path class="b" d="M${cx},${n.y} L${n.x+DW},${cy} L${cx},${n.y+DW} L${n.x},${cy}z" fill="#f3ecfa" stroke="#7b3597" stroke-width="1.4"/>${text(cx,n.y-7-(ql.length-1)*11.4,ql,{fs:9.5,fw:600,fill:"#5b2a7a"})}${text(n.x+DW+4,cy-5,[q.swap?"No":"Yes"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}</g>${n.fork?"":n.gate&&q.fix?fixBranch(n):q.nx?noBranch(n):text(cx,n.y+DW+11,wrap("No: "+q.no,26,1),{fs:8.5,fill:"#7b3597"})}`;return}
    const s=n.s,c=TYC[s.was||s.ty],ch=s.ch||"same",lines=wrap(s.t,ch!=="same"?16:(s.t.length>42?23:21),s.t.length>42?3:2);
    let px=n.x+2;const inl=s.in||[];inl.slice(0,2).forEach(x=>{const p=pill(px,n.y-PIN+3,x[0],pc(x[0]),false,`From ${x[0]}: ${x[1]}`);h+=p.h+`<line class="source-step-leader" x1="${px+p.w/2}" y1="${n.y-PIN+20}" x2="${px+p.w/2}" y2="${n.y}" stroke="${pc(x[0])}" stroke-width="1.2"/>`;px+=p.w+4});
    if(inl.length>2){const p=pill(px,n.y-PIN+3,`+${inl.length-2}`,"#667085",false,inl.slice(2).map(x=>`From ${x[0]}: ${x[1]}`).join(" | "));h+=p.h}
    px=n.x+2;const outl=s.out||[];outl.slice(0,2).forEach(x=>{const p=pill(px,n.y+H+7,x[0],pc(x[0]),false,`To ${x[0]}: ${x[1]}`);h+=p.h+`<line class="source-step-leader" x1="${px+p.w/2}" y1="${n.y+H}" x2="${px+p.w/2}" y2="${n.y+H+7}" stroke="${pc(x[0])}" stroke-width="1.2"/>`;px+=p.w+4});if(outl.length>2){const p=pill(px,n.y+H+7,`+${outl.length-2}`,"#667085",false,outl.slice(2).map(x=>`To ${x[0]}: ${x[1]}`).join(" | "));h+=p.h}
    h+=`<g class="nd ty-${s.was||s.ty} ${s.pp&&s.pp.length?"has-pp":""} ${(s.ci||TPIS.has(n.id))?"has-tpi":""} ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}" aria-label="${esc2(s.t)}"><title>${esc2(s.t)} - ${TYNM[s.was||s.ty]} - ${esc2(s.sys)}</title>
      <rect class="b" x="${n.x}" y="${n.y}" width="${W}" height="${H}" rx="9" fill="${ch==="new"?"#eef5fc":"var(--card)"}" stroke="${c}" stroke-width="2.2" ${ch==="new"?'stroke-dasharray="6 3"':""}/>
      <circle cx="${n.x+14}" cy="${n.y+14}" r="9" fill="${c}"/><text x="${n.x+14}" y="${n.y+17.5}" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">${s.n}</text>
      ${text(n.x+W/2+(ch!=="same"?-6:8),n.y+(lines.length>1?15:21),lines,{fs:10.8,fw:600,fill:"var(--navy)"})}
      ${text(n.x+9,n.y+H-9,[wrap(s.sys,23,1)[0]],{fs:9.2,fill:"var(--muted)",a:"start"})}
      ${s.pp&&s.pp.length?(d.fixes&&ch!=="same"?`<g><title>Pain point addressed by this change: ${esc2(s.pp.join(" | "))}</title><circle cx="${n.x+W-11}" cy="${n.y+H-11}" r="7" fill="#1f8a4c"/><text x="${n.x+W-11}" y="${n.y+H-7.5}" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">✔</text></g>`:`<circle cx="${n.x+W-11}" cy="${n.y+H-11}" r="7" fill="var(--pain)"/><text x="${n.x+W-11}" y="${n.y+H-7.5}" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">!</text>`):""}
      ${s.cop?`<rect x="${n.x+W-44}" y="${n.y-7}" width="38" height="13" rx="4" fill="#fff" stroke="#0070c0" stroke-dasharray="3 2"/><text x="${n.x+W-25}" y="${n.y+2.5}" font-size="8" font-weight="700" fill="#0070c0" text-anchor="middle">${esc2(s.cop.tag||"Copilot")}</text>`:""}
      ${ch!=="same"?`<rect x="${n.x+W-34}" y="${n.y+4}" width="30" height="13" rx="4" fill="var(--prop)"/><text x="${n.x+W-19}" y="${n.y+13.5}" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">${ch==="new"?"NEW":"AI"}</text>`:""}
    </g>`;
  });
  const svg=document.querySelector(E.svg);svg.setAttribute("viewBox",`0 0 ${svgW} ${svgH}`);svg.setAttribute("data-f",filter);svg.innerHTML=h;
  svg.querySelectorAll(".nd,.opn").forEach(g=>{const f=()=>detail(g.dataset.id);g.onclick=f;g.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();f()}}});
}
function detail(id){const n=nodes[id];if(!n)return;sel=id;
  document.querySelector(E.svg).querySelectorAll(".opn").forEach(g=>g.classList.toggle("sel",g.dataset.id===id));
  if(n.kind==="opp"||n.kind==="fopp"){const o=n.opp;document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)}${n.P?" / "+esc2(n.P.name):""}</span><h3 style="color:#0070c0">AI Opportunity: ${esc2(o.t)}</h3><dl><div><dt>Type</dt><dd><b>${esc2(o.ty)}</b></dd></div><div><dt>How it would work and tools</dt><dd class="opl">${esc2(o.d)}</dd></div>${(n.P?n.P.steps.flatMap(s=>s.pp||[]):(n.f.pp||[])).length?`<div><dt style="color:var(--pain)">Pain points it addresses</dt><dd class="ppl">${[...new Set(n.P?n.P.steps.flatMap(s=>s.pp||[]):(n.f.pp||[]))].map(esc2).join("<br>")}</dd></div>`:""}<div><dt>Feasibility</dt><dd><span class="badge st ur">${esc2(o.feas||"Under review")}</span></dd></div><div><dt>Source</dt><dd>${esc2(o.rid)} - hypothesis to validate with the R2R team and the LT</dd></div></dl>`;return}
  if(n.kind==="ch"||n.kind==="tpi"){const c=n.c,ids=(c.steps||[]).map(s=>`${n.f.id}|${s}`);document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.toggle("sel",ids.includes(g.dataset.id)));
    const names=ids.map(i=>nodes[i]).filter(Boolean).map(x=>`<b>${esc2(x.P.name)}</b> · ${esc2(x.s.n)}. ${esc2(x.s.t)}`).join("<br>");
    document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)}</span><h3 style="color:${n.kind==="ch"?"#a00015":"#13643a"}">${n.kind==="ch"?"[CHALLENGE] Pain point":`[SOLUTION] ${esc2(c.st||"TPI")}`}</h3><p style="margin:4px 0 0">${esc2(c.t)}</p><dl>${names?`<div><dt>${n.kind==="ch"?"Where it hits (highlighted on the map)":"Steps it addresses (highlighted on the map)"}</dt><dd>${names}</dd></div>`:""}${c.ref?`<div><dt>Reference</dt><dd>${esc2(c.ref)}</dd></div>`:""}<div><dt>Source</dt><dd>${esc2(c.ref||"")}</dd></div></dl>`;return}
  if(n.kind==="dec"){const q=n.dec;document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.remove("sel"));
    const r=(t,v,cls)=>v?`<div><dt>${t}</dt><dd class="${cls||""}">${v}</dd></div>`:"";
    document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f?n.f.name:"")}${n.P?" / "+esc2(n.P.name):""}</span><h3 style="color:#5b2a7a">Decision: ${esc2(q.q)}</h3>${q.d?`<p style="margin:4px 0 0">${esc2(q.d)}</p>`:""}<dl>${r("Example",q.ex?`<i>${esc2(q.ex)}</i>`:"")}${r("Checked by",q.o?esc2(q.o):"")}${r("System",q.sys?esc2(q.sys):"")}<div><dt>If yes</dt><dd>${esc2(q.yes)}</dd></div><div><dt>If no</dt><dd>${esc2(q.no)}</dd></div>${q.pp&&q.pp.length?r('<span style="color:var(--pain)">Pain point when the answer is no</span>',q.pp.map(esc2).join("<br>"),"ppl"):""}${r("Source",q.src?esc2(q.src):"")}</dl>`;return}
  const s=n.s;document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.toggle("sel",g.dataset.id===id));
  const row=(t,v,cls)=>v?`<div><dt>${t}</dt><dd class="${cls||""}">${v}</dd></div>`:"";
  const ownc=o=>o.split(/\s\/\s|,\s*/).map(x=>`<span class="own"><i style="background:${pc(x)}"></i>${esc2(x)}</span>`).join("");
  let html=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)} / ${esc2(n.P.name)} (${esc2(n.P.id)})</span><h3>${s.n}. ${esc2(s.t)}</h3><p style="margin:4px 0 0">${esc2(s.d)}</p><dl>`;
  html+=row("Who",ownc(s.o))+row("System",esc2(s.sys))+row("Activity type",`<b style="color:${TYC[s.ty]}">${TYNM[s.ty]}</b>${s.was?` <small>(as-is: ${TYNM[s.was]})</small>`:""}`);
  if(s.in&&s.in.length)html+=row("Input from",s.in.map(x=>`<b>${esc2(x[0])}</b>: ${esc2(x[1])}`).join("<br>"));
  if(s.out&&s.out.length)html+=row("Output to",s.out.map(x=>`<b>${esc2(x[0])}</b>: ${esc2(x[1])}`).join("<br>"));
  if(s.dec)html+=row("Decision",`<b>${esc2(s.dec.q)}</b><br>Yes &rarr; ${esc2(s.dec.yes)}<br>No &rarr; ${esc2(s.dec.no)}`);
  if(s.ctl)html+=row("Control",esc2(s.ctl));
  if(s.pp&&s.pp.length)html+=row('<span style="color:var(--pain)">Pain points</span>',s.pp.map(esc2).join("<br>"),"ppl");
  if(s.ci)html+=row("Existing CI / TPI",esc2(s.ci));
  if(page==="tobe"&&s.ch&&s.ch!=="same")html+=row('<span style="color:var(--prop)">AI suggestion (hypothesis, to validate)</span>',`${s.aik?`<span class="badge ${/digital/i.test(s.aik)?"dg":"pi2"}">${esc2(s.aik)}</span><br>`:""}<b>${esc2(s.rec||"")}</b><br>Tools: ${esc2(s.tools||"")}<br><small>Basis: ${esc2(s.opp||"")}</small>`,"opl");
  if(page==="tobe"&&s.cop)html+=row('<span style="color:#0070c0">Copilot / Agent Builder option (added hypothesis, to validate)</span>',`<b>${esc2(s.cop.tool)}</b><br>${esc2(s.cop.d)}`,"opl");
  html+=row("Source",esc2(s.src))+`</dl>`;
  if(page==="tobe"&&s.ch==="same"&&!s.cop)html+=`<p style="font-size:12px;color:var(--muted)">No change proposed for this step.</p>`;
  document.querySelector(E.det).innerHTML=html;
}
function legend(){const d=DATA[page];const sw=(c,dash)=>`<svg width="22" height="12"><line x1="0" y1="6" x2="22" y2="6" stroke="${c}" stroke-width="1.6" ${dash?'stroke-dasharray="4 3"':""}/></svg>`;
  const box=c=>`<svg width="20" height="12"><rect x="1" y="1" width="18" height="10" rx="3" fill="none" stroke="${c}" stroke-width="2"/></svg>`;
  document.querySelector(E.leg).innerHTML=`<span>${box("#d0021b")}Manual</span><span>${box("#e8891c")}Semi-automated</span><span>${box("#2f6fce")}Automated</span><span><svg width="14" height="14"><circle cx="7" cy="7" r="6.5" fill="#c8102e"/><text x="7" y="10.5" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">!</text></svg>Pain point</span><span><svg width="14" height="14"><path d="M7,1L13,7L7,13L1,7z" fill="#f3ecfa" stroke="#7b3597"/></svg>Decision</span><span>${sw("var(--navy)")}Flow</span><span>${sw(d.accent)}Chain between processes</span><span>${sw(d.accent,1)}Loop back</span>${d.frames.some(f=>f.ch&&f.ch.length)?`<span><svg width="22" height="12"><rect x="1" y="1" width="20" height="10" rx="3" fill="#fdecec" stroke="var(--pain)"/></svg>[CHALLENGE] pain point</span><span><svg width="22" height="12"><rect x="1" y="1" width="20" height="10" rx="3" fill="#e6f4ec" stroke="var(--ok)"/></svg>[SOLUTION] TPI / CI</span><span>${sw(d.accent,1)}Same output</span>`:""}${d.frames.some(f=>f.procs.some(p=>p.steps.some(s=>s.gate&&s.fix&&!s.noRetry)))?`<span>${sw("var(--navy)",1)}Retry after the fix</span>`:""}${d.frames.some(f=>f.procs.some(p=>p.steps.some(s=>s.dec&&s.dec.nx&&s.dec.nx.end)))?`<span><svg width="26" height="14"><rect x="1" y="1" width="24" height="12" rx="6" fill="#fdecec" stroke="#d0021b" stroke-width="1.3"/></svg>End of the flow (reject / hold)</span>`:""}<span><svg width="34" height="14"><rect width="34" height="14" rx="4" fill="${d.accent}"/><text x="17" y="10.5" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">Input</text></svg>Trigger / input</span><span><svg width="18" height="14"><path d="M1,1 L12,1 L17,6 L17,13 L1,13z" fill="#fff7e0" stroke="#d9a400"/></svg>Output</span>${page==="tobe"?`<span><svg width="70" height="16"><rect x="1" y="1" width="68" height="14" rx="7" fill="none" stroke="#0070c0" stroke-width="1.3" stroke-dasharray="3 2"/><text x="35" y="11.5" font-size="9" font-weight="700" fill="#0070c0" text-anchor="middle">AI: R2R</text></svg>AI-suggested dependency</span><span><svg width="60" height="16"><rect x="1" y="1" width="58" height="14" rx="4" fill="#e8f1fb" stroke="#0070c0"/><text x="30" y="11.5" font-size="8.5" font-weight="700" fill="#0070c0" text-anchor="middle">AI Opportunity</text></svg>AI opportunity (Claude)</span><span><svg width="30" height="13"><rect width="30" height="13" rx="4" fill="#0070c0"/><text x="15" y="10" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">AI</text></svg>Step changed (AI suggested)</span><span><svg width="30" height="13"><rect width="30" height="13" rx="4" fill="#0070c0"/><text x="15" y="10" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">NEW</text></svg>New step</span>`:""}<span>Pills = input from / output to; strips = upstream / downstream</span>`;}
function setScale(s){scale=Math.max(.3,Math.min(2,s));const svg=document.querySelector(E.svg);svg.style.width=svgW*scale+"px";svg.style.height=svgH*scale+"px"}
function fit(){const w=document.querySelector(E.scroll).clientWidth-10;setScale(Math.min(1,w/svgW))}
function render(pg,fl){if(pg)page=pg;if(fl)filter=fl;sel=null;draw();legend();document.querySelector(E.det).innerHTML='<p class="none">Select a step in the map to see what happens, who does it, the system, inputs, outputs, decisions, pain points and the source.</p>';fit()}
function setFilter(f){filter=f;document.querySelector(E.svg).setAttribute("data-f",f)}
function goto(fid,pid){const n=nodes[`${fid}|${pid}|in`];if(!n)return;const sc=document.querySelector(E.scroll);sc.scrollTo({left:Math.max(0,(n.x-30)*scale),top:Math.max(0,(n.y-70)*scale),behavior:"smooth"});const first=Object.values(nodes).find(x=>x.P&&x.P.id===pid&&x.s&&!x.fixOf);if(first){detail(first.id);const dr=document.getElementById("dr-"+KEY);if(dr)dr.classList.add("on")}}
return {getNodes:()=>nodes,getDimensions:()=>({width:svgW,height:svgH}),render,setFilter,zi:()=>setScale(scale+.15),zo:()=>setScale(scale-.15),fit,page:()=>page,setScale,getScale:()=>scale,goto};
};
window.TowerRenderers["CTRL"]=function makeTowerMap(KEY,DATA,E){
const TPIS=new Set();Object.values(DATA).forEach(dd=>dd&&dd.frames&&dd.frames.forEach(f=>(f.tpi||[]).forEach(t=>(t.steps||[]).forEach(r=>TPIS.add(f.id+"|"+r)))));
const W=158,H=74,G=46,DW=34,PAD=24,FH=E.frameHeaderHeight||46,ROWL=E.processHeaderGap||22,PIN=E.processInputGap||24,POUT=24,RGAP=44,STRIP=E.handoffStripHeight||30,INW=118,CH=14;
const TYC={man:"#d0021b",auto:"#2f6fce",hyb:"#e8891c"},TYNM={man:"Manual",hyb:"Semi automated",auto:"Automated"};
const esc2=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function wrap(t,n,max){const w=String(t).split(" ");const L=[];let c="";w.forEach(x=>{if((c+" "+x).trim().length>n){if(c)L.push(c);c=x}else c=(c+" "+x).trim()});if(c)L.push(c);max=max||2;if(L.length>max){L[max-1]=L.slice(max-1).join(" ");if(L[max-1].length>n+2)L[max-1]=L[max-1].slice(0,n)+"…";L.length=max}return L}
function text(x,y,lines,o={}){return `<text x="${x}" y="${y}" font-size="${o.fs||11.5}" font-weight="${o.fw||500}" fill="${o.fill||"var(--ink)"}" text-anchor="${o.a||"middle"}" font-family="Inter,Segoe UI,Arial,sans-serif">${lines.map((l,i)=>`<tspan x="${x}" dy="${i?1.2:0}em">${esc2(l)}</tspan>`).join("")}</text>`}
let page="asis",filter="all",nodes={},svgW=0,svgH=0,scale=1,sel=null;
const pc=p=>{const k=String(p).split(/[ -]/)[0];return ({GFR:"#4b2a86",IT:"#667085",C2C:"var(--O2C)",Non:"#b7791f","Non-SAP":"#b7791f",Investor:"#152847",SET:"#152847",Intercompany:"var(--R2R)",Action:"var(--R2R)",Other:"#667085",All:"#667085",Material:"#8a6d3b",Finance:"#667085",Auditors:"#475467",Deloitte:"#475467",KPMG:"#475467",GFS:"var(--FPA)",O2C:"var(--O2C)",R2R:"var(--R2R)",TAX:"var(--Tax)",Tax:"var(--Tax)",P2P:"var(--P2P)",CAPEX:"var(--CAPEX)",Controlling:"var(--Controlling)",DMT:"#0e7490",Customer:"#8a6d3b",Distributors:"#8a6d3b",Distribution:"#0f766e",Bank:"#475467",Payroll:"#b7791f",Local:"#b7791f",FP:"var(--FPA)",HR:"#9d174d",International:"#152847",Area:"#152847",Group:"#152847",MC:"#b7791f",BUD:"#b7791f",BUDs:"#b7791f",Brand:"#b7791f",Cost:"#b7791f",Business:"#b7791f",CFO:"#7b3597",CP:"#7b3597",CBP:"#c77a0a",Embedded:"#c77a0a",SAP:"#667085",CMR:"#667085",PMR:"#667085",AZ:"#667085",AZForce:"#667085",Enpire:"#667085",OneGRC:"#475467",Approver:"#7b3597",Market:"#b7791f",Posting:"var(--R2R)",FBPs:"#c77a0a",Planning:"#667085","P&MR":"#667085"})[k]||(String(p).startsWith("FP&A")?"var(--FPA)":"#667085")};
function pill(x,y,label,c,dash,title,anchorLeft){const w=label.length*6.2+16;return {w,h:`<g class="source-pill"><title>${esc2(title||label)}</title><rect x="${x}" y="${y}" width="${w}" height="17" rx="8.5" fill="var(--card)" stroke="${c}" stroke-width="1.3" ${dash?'stroke-dasharray="3 2"':""}/>${text(x+w/2,y+12,[label],{fs:10,fw:600,fill:c})}</g>`}}
function layout(d){
  nodes={};let h="",y=PAD+10,maxX=0;const x0=PAD+(d.chan||60);
  // phase chevrons (processes grouped by key process)
  {const raw=d.frames.flatMap(f=>f.procs.map(p=>({p,f})));const procs=[];raw.forEach(it=>{const k=it.p.phase||it.p.name;const L=procs[procs.length-1];if(L&&L.k===k&&L.f===it.f){L.ids.push(it.p.id)}else procs.push({k,f:it.f,p:it.p,ids:[it.p.id]})});const cw=procs.length<=3?230:150,ch=40;let cx=x0;
   h+=text(x0,y+12,["Process phases"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});y+=18;
   procs.forEach(({p,f},i)=>{const fi=d.frames.indexOf(f);const col=d.accent;const op=.55+.15*(fi%3);
     h+=`<g><title>${esc2(f.name)} / ${esc2(p.phase||p.name)} (${esc2(procs[i].ids.join(", "))})</title><path d="M${cx},${y} L${cx+cw-14},${y} L${cx+cw},${y+ch/2} L${cx+cw-14},${y+ch} L${cx},${y+ch} L${cx+14},${y+ch/2}z" fill="${col}" fill-opacity="${op}"/>${text(cx+cw/2+4,y+ch/2+4,wrap(`${i+1}. ${p.phase||p.name}`,cw>200?32:20,1),{fs:10.5,fw:700,fill:"#fff"})}</g>`;cx+=cw+4});
   maxX=Math.max(maxX,cx);y+=ch+22;}
  d.frames.forEach((f,fi)=>{
    const top=y;const c=d.accent;
    y+=FH;
    // upstream strip
    let px=x0+8;const upY=y+4;h+=text(x0,upY+12,["Upstream"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});px+=66;
    f.up.forEach(u=>{const p=pill(px,upY,(u.c?"AI: ":"")+u.p,u.c?"var(--prop)":pc(u.p),!!u.c,`${u.c?"AI SUGGESTED - ":""}${u.p}: ${u.w} (${u.src})`);h+=p.h;px+=p.w+6});
    maxX=Math.max(maxX,px);y+=STRIP;
    f.procs.forEach((P,pi)=>{
      y+=ROWL;const rowY=y+PIN;let x=x0;const items=[];
      nodes[`${f.id}|${P.id}|in`]={id:`${f.id}|${P.id}|in`,x,y:rowY,w:INW,h:H,kind:"in",lab:P.inbox[0],txt:P.inbox[1],f,P};x+=INW+G-12;
      P._headingY=y;h+=`<g class="source-process-heading">`;h+=text(x0,y-4,[`${P.name}`],{fs:12,fw:700,fill:"var(--navy)",a:"start"});h+=text(x0+P.name.length*7.2+10,y-4,[`${P.id} · ${P.owner}`],{fs:10.5,fill:"var(--muted)",a:"start"});h+=`</g>`;
      const seq=[`${f.id}|${P.id}|in`];let fext=0;P._rb=rowY+H;P._gates=false;
      P.steps.forEach((s,j)=>{
        if(s.gate){P._gates=true;x+=60;const gid=`${f.id}|${P.id}|${s.n}`;nodes[gid]={id:gid,x,y:rowY+H/2-DW/2,w:DW,h:DW,kind:"dec",gate:true,dec:s,f,P,j,ln:P.steps.slice(j+1).filter(q=>q.gate&&q.nx&&!q.nx.end).length};seq.push(gid);
          if(s.fix){const fs=s.fix,fid=`${f.id}|${P.id}|${fs.n}`;nodes[fid]={id:fid,x:x+DW/2-W/2,y:rowY+H+56,w:W,h:H,s:fs,f,P,j,fixOf:gid};fext=56+H+4;P._rb=rowY+H+fext-4}
          x+=DW+G+76;return}
        if(s.fork){P._gates=true;const BG=56,nb=s.branches.length;x+=30;const dx=x,sx=dx+DW+G+40,bx=sx+W+30;
          s.branches.forEach((b,bi)=>{const by=rowY+bi*(H+BG);const nq=s.branches[bi+1];const did=`${f.id}|${P.id}|${b.step.n}|d`;
            nodes[did]={id:did,x:dx,y:by+H/2-DW/2,w:DW,h:DW,kind:"dec",fork:true,f,P,dec:{q:b.q,ex:b.ex,o:b.o,d:b.d,src:b.src,yes:`Step ${b.step.n} - ${b.step.t}`,no:nq?`Check: ${nq.q}`:(s.elseLab||"No")+" - release"}};
            const sid=`${f.id}|${P.id}|${b.step.n}`;nodes[sid]={id:sid,x:sx,y:by,w:W,h:H,s:b.step,f,P,j,br:true}});
          const fid=`${f.id}|${P.id}|fork${j}`;nodes[fid]={id:fid,kind:"fork",fk:s,f,P,x:dx,w:bx-dx,dx,sx,bx,rowY};seq.push(fid);
          fext=Math.max(fext,(nb-1)*(H+BG)+34);P._rb=Math.max(P._rb,rowY+H+(nb-1)*(H+BG)+30);x=bx+40;return}
        const id=`${f.id}|${P.id}|${s.n}`;nodes[id]={id,x,y:rowY,w:W,h:H,s,f,P,j};items.push(id);seq.push(id);x+=W+G;
        if(s.dec){x+=30;nodes[id+"|d"]={id:id+"|d",x:x,y:rowY+H/2-DW/2,w:DW,h:DW,dec:s.dec,kind:"dec",step:s,f,P,ln:P.steps.slice(j+1).filter(q=>q.dec&&q.dec.nx&&!q.dec.nx.end).length};x+=DW+G+40}});
      P._seq=seq;
      if(P.outdoc){x+=14;nodes[`${f.id}|${P.id}|out`]={id:`${f.id}|${P.id}|out`,x,y:rowY+8,w:150,h:H-16,kind:"out",doc:P.outdoc,f,P,from:P._gates?seq[seq.length-1]:items[items.length-1]};seq.push(`${f.id}|${P.id}|out`);x+=150+G}
      if(d.key==="tobe"&&P.opp){x+=6;nodes[`${f.id}|${P.id}|opp`]={id:`${f.id}|${P.id}|opp`,x,y:rowY-6,w:190,h:H+12,kind:"opp",opp:P.opp,f,P,from:items[items.length-1]};x+=210}
      maxX=Math.max(maxX,x);
      y=rowY+H+POUT+RGAP+fext+(P.steps.some(s=>s.dec&&s.dec.nx)?30:0);
    });
    if(d.key==="tobe"&&f.opp){nodes[`${f.id}|opp`]={id:`${f.id}|opp`,x:x0,y:y-18,w:460,h:44,kind:"fopp",opp:f.opp,f};y+=56}
    // challenge / TPI strips
    if((f.ch&&f.ch.length)||(f.tpi&&f.tpi.length)){y+=4;
      const strip=(items,kind,lab,fill,stroke,col,bw)=>{h+=text(x0,y+12,[lab],{fs:10.5,fw:700,fill:col,a:"start"});y+=20;let bx=x0;
        items.forEach((c,i)=>{if(i&&i%4===0){bx=x0;y+=58}const id=`${f.id}|${kind}${i}`;const head=kind==="ch"?"[CHALLENGE]":`[SOLUTION] ${c.st||"TPI"}`;const tl=wrap(c.t,Math.floor(bw/5.6),2);nodes[id]={id,kind,c,f,x:bx,y,w:bw,h:50};
          h+=`<g class="opn ${sel===id?"sel":""}" tabindex="0" role="button" data-id="${id}"><title>${esc2(head)}: ${esc2(c.t)}${c.ref?" - "+esc2(c.ref):""}</title><rect class="b" x="${bx}" y="${y}" width="${bw}" height="50" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>${text(bx+10,y+14,[head],{fs:9.5,fw:700,fill:col,a:"start"})}${c.ref?text(bx+bw-8,y+14,[c.ref],{fs:8.8,fill:col,a:"end"}):""}${text(bx+10,y+29,tl,{fs:9.8,fill:"var(--navy)",a:"start"})}</g>`;bx+=bw+12});
        maxX=Math.max(maxX,bx);y+=50+14};
      if(f.ch&&f.ch.length)strip(f.ch,"ch","Pain points (register)","#fdecec","var(--pain)","#a00015",330);
      if(f.tpi&&f.tpi.length)strip(f.tpi,"tpi",d.key==="tobe"?"TPI register items (Controlling.xlsx) - [SOLUTION] with workbook status":"TPI 2026 initiatives (workbook)","#e6f4ec","var(--ok)","#13643a",430);
    }
    // downstream strip
    px=x0+8;const dnY=y-10;h+=text(x0,dnY+12,["Downstream"],{fs:10.5,fw:700,fill:"var(--muted)",a:"start"});px+=78;
    f.down.forEach(u=>{const p=pill(px,dnY,(u.c?"AI: ":"")+u.p,u.c?"var(--prop)":pc(u.p),!!u.c,`${u.c?"AI SUGGESTED - ":""}${u.p}: ${u.w} (${u.src})`);h+=p.h;px+=p.w+6});
    maxX=Math.max(maxX,px);y+=STRIP+6;
    f._box={top,bot:y,c};y+=26;
  });
  const FR=Math.max(maxX+40,1180);d._fr=FR;svgW=FR;svgH=y+PAD;
  return h;
}
function noBranch(n){const q=n.dec,nx=q.nx,cx=n.x+DW/2,by=n.y+DW,rowY=n.y-(H/2-DW/2),rb=n.P&&n.P._rb?n.P._rb:rowY+H;let o="";if(nx.none)return nx.nl?text(cx+5,by+13,[nx.nl],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"}):"";
  if(nx.end){const hold=nx.kind==="hold",w=Math.max(96,nx.end.length*6.4+22),ty=(n.gate&&rb>rowY+H)?rowY+H+56+H/2-13:rb+34;o+=`<path d="M${cx},${by} L${cx},${ty}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+13,[q.swap?"Yes":"No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})+`<g><title>${esc2(q.q)} No: ${esc2(q.no)}</title><rect x="${cx-w/2}" y="${ty}" width="${w}" height="26" rx="13" fill="${hold?"#fff4e0":"#fdecec"}" stroke="${hold?"#e8891c":"#d0021b"}" stroke-width="1.5"/>${text(cx,ty+17,[nx.end],{fs:9.8,fw:700,fill:hold?"#8a4b00":"#a00015"})}</g>`;return o}
  const T=nx.out?nodes[`${n.f.id}|${n.P.id}|out`]:nodes[`${n.f.id}|${n.P.id}|${nx.step}`];if(!T)return text(cx,n.y+DW+11,wrap("No: "+q.no,26,1),{fs:8.5,fill:"#7b3597"});
  const yb=rb+40+(n.ln||0)*12,ex=nx.out?T.x+T.w/2:T.x+T.w-16,ty=T.y+T.h;
  o+=`<path d="M${cx},${by} L${cx},${yb} L${ex},${yb} L${ex},${ty}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+13,[q.swap?"Yes":"No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
  const nl=q.nl||nx.nl;if(nl){const lw=nl.length*5.4+8;o+=`<rect x="${cx+10}" y="${yb-7}" width="${lw}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(cx+14,yb+3,[nl],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}
  return o}
function fixBranch(n){const q=n.dec,F=nodes[`${n.f.id}|${n.P.id}|${q.fix.n}`];if(!F)return "";const cx=n.x+DW/2,by=n.y+DW,rowY=n.y-(H/2-DW/2),ym=rowY+H+18,ex=F.x+W+16,rx=F.x-16,cy=rowY+H/2;let o="";
  o+=`<path d="M${cx},${by} L${cx},${ym} L${ex},${ym} L${ex},${F.y+H/2} L${F.x+W},${F.y+H/2}" class="fl" marker-end="url(#o1)"/>`+text(cx+5,by+12,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
  const S1=nodes[`${n.f.id}|${n.P.id}|1`];
  if(n.P.id==="SOC-01.1"){const S2=nodes[`${n.f.id}|${n.P.id}|1`];if(S2){const k=["1a","1b","1c"].indexOf(q.fix.n),yy=F.y+H+22+k*9,tx=S2.x+30+k*14,fx=F.x+W/2;o+=`<path d="M${fx},${F.y+H} L${fx},${yy} L${tx},${yy} L${tx},${S2.y+H}" class="fl" marker-end="url(#o1)"/>`}}else if(S1&&false){const k=["1a","1b","1c"].indexOf(q.fix.n),by=F.y+H+18+k*10,sx=S1.x+30+k*12,fx=F.x+W/2;o+=`<path d="M${fx},${F.y+H} L${fx},${by} L${sx},${by} L${sx},${S1.y+H}" class="fl" stroke-dasharray="5 3" marker-end="url(#o1)"/>`;
  if(k===0)o+=`<rect x="${sx+8}" y="${by-7}" width="${"Retry from step 1".length*5+6}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(sx+11,by+3,["Retry from step 1"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}
  else if(!q.noRetry){o+=`<path d="M${F.x},${F.y+H/2} L${rx},${F.y+H/2} L${rx},${cy} L${n.x},${cy}" class="fl" stroke-dasharray="5 3" marker-end="url(#o1)"/>`;
  const ly=(F.y+H/2+cy)/2;o+=`<rect x="${rx-34}" y="${ly-7}" width="31" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(rx-4,ly+3,["Retry"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"end"});
  }
  if(n.P.id==="SOC-05.1"){const O=nodes[`${n.f.id}|${n.P.id}|out`],S3=nodes[`${n.f.id}|${n.P.id}|3`],fx=F.x+W/2;if(O){const tx=O.x+O.w/2,jy=F.y+H+30;o+=`<path d="M${fx+12},${F.y+H} L${fx+12},${jy} L${tx},${jy} L${tx},${O.y+O.h}" class="fl" marker-end="url(#o1)"/>`}if(S3){const tx=S3.x+W-10,jy=F.y+H+16;o+=`<path d="M${fx-12},${F.y+H} L${fx-12},${jy} L${tx},${jy} L${tx},${S3.y+H}" class="fl" marker-end="url(#o1)"/>`}}else if(q.fix.join){const sq=n.P._seq||[],J=q.fix.join==="out"?nodes[`${n.f.id}|${n.P.id}|out`]:nodes[sq[sq.indexOf(n.id)+2]];if(J){const jx=F.x+W/2,jy=F.y+H+34,tx=J.x+J.w/2;if(J.kind==="dec"){const cyy=J.y+J.h/2,mx=J.x-14;o+=`<path d="M${jx},${F.y+H} L${jx},${jy} L${mx},${jy} L${mx},${cyy} L${J.x},${cyy}" class="fl" marker-end="url(#o1)"/>`}else o+=`<path d="M${jx},${F.y+H} L${jx},${jy} L${tx},${jy} L${tx},${J.y+J.h}" class="fl" marker-end="url(#o1)"/>`}}
  return o}
function draw(){
  const d=DATA[page];const strips=layout(d);let h=`<defs><marker id="o1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--navy)"/></marker><marker id="o2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#7b3597"/></marker><marker id="o3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#0070c0"/></marker><marker id="o4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="${d.accent}"/></marker><marker id="o5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0L10,5L0,10z" fill="${d.accent}"/></marker></defs>
  <style>.fl{fill:none;stroke:var(--navy);stroke-width:1.6}.rw{fill:none;stroke:#7b3597;stroke-width:1.4;stroke-dasharray:5 4}svg[data-f="man"] .nd:not(.ty-man),svg[data-f="hyb"] .nd:not(.ty-hyb),svg[data-f="auto"] .nd:not(.ty-auto),svg[data-f="pp"] .nd:not(.has-pp),svg[data-f="tpi"] .nd:not(.has-tpi){opacity:.14}svg[data-f="tpi"] .nd.has-tpi rect.b{stroke:#13643a;stroke-width:4;filter:drop-shadow(0 0 5px rgba(19,100,58,.55))}.opn{cursor:pointer}.opn:hover rect.b,.opn.sel rect.b{stroke-width:2.4}</style>`;
  // frames
  d.frames.forEach((f,fi)=>{const b=f._box;const wdt=d._fr-PAD*2;
    h+=`<rect x="${PAD}" y="${b.top}" width="${wdt}" height="${b.bot-b.top}" rx="14" fill="${b.c}" fill-opacity=".05" stroke="${b.c}" stroke-opacity=".35"/><rect x="${PAD}" y="${b.top}" width="${wdt}" height="${FH-6}" rx="14" fill="${b.c}"/><rect x="${PAD}" y="${b.top+20}" width="${wdt}" height="${FH-26}" fill="${b.c}"/>`;
    {const ts=d.tshift||0;h+=text(PAD+16+ts,b.top+26,[`${fi+1}. ${f.name}`],{fs:15,fw:700,fill:"#fff",a:"start"})+text(PAD+16+ts+f.name.length*9.2+30,b.top+26,[`${f.owner} · ${f.win}`],{fs:11,fill:"#fff",a:"start"});}
    if(f.pp&&f.pp.length)h+=`<g><title>Pain points: ${esc2(f.pp.join(" | "))}</title><circle cx="${PAD+wdt-22}" cy="${b.top+20}" r="9" fill="#fff"/><text x="${PAD+wdt-22}" y="${b.top+24.5}" font-size="12" font-weight="700" fill="var(--pain)" text-anchor="middle">!</text></g>`;
    if(f.ctl&&f.ctl.length)h+=`<g><title>Controls: ${esc2(f.ctl.join(" | "))}</title><circle cx="${PAD+wdt-48}" cy="${b.top+20}" r="9" fill="#fff"/><text x="${PAD+wdt-48}" y="${b.top+24.5}" font-size="11" font-weight="700" fill="${b.c}" text-anchor="middle">C</text></g>`;
  });
  h+=strips;let BT="";(d.frames||[]).forEach(f=>f.procs.forEach(P=>{if(P.back){const A=nodes[`${f.id}|${P.id}|${P.back.from}`],B=nodes[`${f.id}|${P.id}|${P.back.to}`];if(A&&B){const yy=A.y+A.h+16,ax=A.x+A.w/2,bx=B.x+B.w/2+(P.back.dx||0);h+=`<path d="M${ax},${A.y+A.h} L${ax},${yy} L${bx},${yy} L${bx},${B.y+B.h}" class="fl"/>`;BT+=`<path d="M${bx},${B.y+B.h+19} L${bx},${B.y+B.h}" class="fl" marker-end="url(#o1)"/>`}}}));
  // chain between processes and key processes (internal O2C flow)
  (d.chain||[]).forEach((e,i)=>{const A=nodes[e.a],B=nodes[e.b];if(!A||!B)return;const lane=PAD+CH+(i%(d.lanes||4))*(d.lanes?8:11);const col=d.accent;
    const ax=A.x+A.w/2,ay=A.y+A.h,yg=e.below&&A.f&&A.f._box?A.f._box.bot+7+(i%3)*6:A.y+A.h+(e.dy!=null?e.dy:(A.kind==="out"?30:34));
    const by=B.kind==="in"?B.y+B.h/2:B.y;let p;
    if(B.kind==="in"){p=`M${ax},${ay} L${ax},${yg} L${lane},${yg} L${lane},${by} L${B.x},${by}`}
    else{p=`M${ax},${ay} L${ax},${yg} L${lane},${yg} L${lane},${B.y-16} L${B.x+B.w/2-24},${B.y-16} L${B.x+B.w/2-24},${B.y}`}
    h+=`<path d="${p}" fill="none" stroke="${col}" stroke-width="${e.loop?1.5:2.2}" ${e.loop?'stroke-dasharray="6 4"':""} stroke-opacity=".9" marker-end="url(#${e.loop?"o4":"o5"})"/>`;
    if(e.lab){const lw=e.lab.length*5.6+10,lx=e.below?ax-lw-8:ax+8;const ly=yg+(e.ldy||0);h+=`<rect x="${lx}" y="${ly-13}" width="${lw}" height="15" rx="4" fill="var(--card)" fill-opacity=".9"/>`+text(lx+5,ly-2,[e.lab],{fs:9.2,fw:600,fill:col,a:"start"})}
  });
  // same-output link between two processes' outputs
  d.frames.forEach(f=>{const so=f.sameOut;if(!so)return;const A=nodes[`${f.id}|${so.a}|out`],B=nodes[`${f.id}|${so.b}|out`];if(!A||!B)return;const ax=A.x+A.w/2,bx=B.x+B.w/2,ym=B.y-72;
    h+=`<path d="M${ax},${A.y+A.h} L${ax},${ym} L${bx},${ym} L${bx},${B.y}" fill="none" stroke="${d.accent}" stroke-width="1.8" stroke-dasharray="3 4" stroke-linecap="round"/><circle cx="${ax}" cy="${A.y+A.h}" r="3.5" fill="${d.accent}"/><circle cx="${bx}" cy="${B.y}" r="3.5" fill="${d.accent}"/>`;
    if(so.lab){const lw=so.lab.length*5.6+14,lx=Math.min(ax,bx)+Math.abs(bx-ax)/2-lw/2;h+=`<rect x="${lx}" y="${ym-9}" width="${lw}" height="17" rx="8" fill="var(--card)" stroke="${d.accent}" stroke-width="1"/>`+text(lx+lw/2,ym+3,[so.lab],{fs:9.2,fw:600,fill:d.accent})}});
  // edges
  d.frames.forEach(f=>f.procs.forEach(P=>{if(!P._gates)return;const sq=P._seq;for(let i=0;i<sq.length-1;i++){const A=nodes[sq[i]],B=nodes[sq[i+1]];if(!A||!B)continue;if(A.kind==="fork"){A.next=B;continue}const ay=A.kind==="in"?A.y+A.h/2:(A.kind==="dec"?A.y+A.h/2:A.y+H/2);h+=`<path d="M${A.x+A.w},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`}}));
  Object.values(nodes).forEach(n=>{if(n.kind==='in'){if(n.P._gates)return;const B=nodes[`${n.f.id}|${n.P.id}|1`];if(B)h+=`<path d="M${n.x+n.w},${n.y+H/2} L${B.x},${B.y+H/2}" class="fl" marker-end="url(#o1)"/>`;return}if(n.kind||n.fixOf||(n.P&&n.P._gates))return;const P=n.P,j=n.j;const nxt=P.steps[j+1];if(!nxt)return;const B=nodes[`${n.f.id}|${P.id}|${nxt.n}`];const D=nodes[n.id+"|d"];const ay=n.y+H/2;
    if(D){h+=`<path d="M${n.x+W},${ay} L${D.x},${ay}" class="fl" marker-end="url(#o1)"/><path d="M${D.x+DW},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`;}
    else h+=`<path d="M${n.x+W},${ay} L${B.x},${ay}" class="fl" marker-end="url(#o1)"/>`});
  // handoff pills on steps + decisions + nodes
  Object.values(nodes).filter(n=>n.kind==="fork").forEach(n=>{const s=n.fk,f=n.f,P=n.P,cy0=n.rowY+H/2,cxd=n.dx+DW/2;let o="",yEnd=cy0;
    s.branches.forEach((b,bi)=>{const D=nodes[`${f.id}|${P.id}|${b.step.n}|d`],S=nodes[`${f.id}|${P.id}|${b.step.n}`];const cy=S.y+H/2;
      o+=`<path d="M${D.x+DW},${cy} L${S.x},${cy}" class="fl" marker-end="url(#o1)"/><path d="M${S.x+W},${cy} L${n.bx},${cy}" class="fl"/>`;yEnd=Math.max(yEnd,cy);
      const nxD=s.branches[bi+1]?nodes[`${f.id}|${P.id}|${s.branches[bi+1].step.n}|d`]:null;
      if(nxD)o+=`<path d="M${cxd},${D.y+DW} L${cxd},${nxD.y}" class="fl" marker-end="url(#o1)"/>`+text(cxd+5,D.y+DW+13,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
      else{const ye=S.y+H+30;const OT=s.elseOut?nodes[`${f.id}|${P.id}|out`]:null;o+=(OT?`<path d="M${cxd},${D.y+DW} L${cxd},${ye} L${OT.x+OT.w/2},${ye} L${OT.x+OT.w/2},${OT.y+OT.h}" class="fl" marker-end="url(#o1)"/>`:`<path d="M${cxd},${D.y+DW} L${cxd},${ye} L${n.bx},${ye}" class="fl"/>`)+text(cxd+5,D.y+DW+13,["No"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"});
        if(s.elseLab){const lw=s.elseLab.length*5.4+8;o+=`<rect x="${cxd+10}" y="${ye-7}" width="${lw}" height="13" rx="3" fill="var(--card)" fill-opacity=".92"/>`+text(cxd+14,ye+3,[s.elseLab],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}if(!OT)yEnd=Math.max(yEnd,ye)}});
    o+=`<path d="M${n.bx},${yEnd} L${n.bx},${cy0}" class="fl"/>`;if(n.next)o+=`<path d="M${n.bx},${cy0} L${n.next.x},${cy0}" class="fl" marker-end="url(#o1)"/>`;
    if(s.lab)o+=text(n.dx+DW/2,n.rowY-6,[s.lab],{fs:10,fw:700,fill:"var(--muted)"});
    h+=o});
  Object.values(nodes).forEach(n=>{
    if(n.kind==="ch"||n.kind==="tpi"||n.kind==="fork")return;
    if(n.kind==="opp"||n.kind==="fopp"){const o=n.opp,fr=n.kind==="opp"?nodes[`${n.f.id}|${n.P.id}|out`]:null;const tl=wrap(o.t,n.kind==="opp"?26:70,n.kind==="opp"?2:1);
      if(fr)h+=`<path d="M${fr.x+fr.w},${fr.y+fr.h/2} L${n.x},${n.y+n.h/2}" fill="none" stroke="#0070c0" stroke-width="1.4" stroke-dasharray="4 3" marker-end="url(#o3)"/>`;
      h+=`<g class="opn ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}"><title>AI Opportunity (${esc2(o.ty)}): ${esc2(o.t)} - ${esc2(o.d)}</title><rect class="b" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="9" fill="#e8f1fb" stroke="#0070c0" stroke-width="1.5"/>
      ${text(n.x+10,n.y+15,[n.kind==="fopp"?`AI Opportunity - ${n.f.name.length>30?n.f.name.slice(0,29)+"…":n.f.name}`:"AI Opportunity"],{fs:10.5,fw:700,fill:"#0070c0",a:"start"})}<rect x="${n.x+n.w-96}" y="${n.y+5}" width="90" height="14" rx="4" fill="#0070c0"/><text x="${n.x+n.w-51}" y="${n.y+15}" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">${esc2(o.ty)}</text>
      ${text(n.x+10,n.y+31,tl,{fs:10.3,fill:"var(--navy)",a:"start"})}${o.feas?`<rect x="${n.kind==="fopp"?n.x+n.w+8:n.x}" y="${n.kind==="fopp"?n.y+n.h/2-7.5:n.y+n.h+4}" width="${o.feas.length*5.6+16}" height="15" rx="4" fill="${/review/i.test(o.feas)?"#b45309":/future/i.test(o.feas)?"#5f6b7a":/applicable|relevant/i.test(o.feas)?"#667085":/not/i.test(o.feas)?"var(--pain)":/progress/i.test(o.feas)?"var(--hyb)":"var(--ok)"}"/><text x="${(n.kind==="fopp"?n.x+n.w+8:n.x)+8}" y="${n.kind==="fopp"?n.y+n.h/2+3:n.y+n.h+14.5}" font-size="9" font-weight="700" fill="#fff" text-anchor="start">${esc2(o.feas)}</text>`:""}</g>`;return}
    if(n.kind==="in"){const col=d.accent;h+=`<g><title>${esc2(n.lab)}: ${esc2(n.txt)}</title><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="9" fill="${col}"/>${text(n.x+n.w/2,n.y+15,[n.lab],{fs:9.5,fw:700,fill:"#fff"})}${text(n.x+n.w/2,n.y+31,wrap(n.txt,21,3),{fs:9.4,fill:"#fff"})}</g>`;return}
    if(n.kind==="out"){const fr=nodes[n.from];if(!n.P._gates)h+=`<path d="M${fr.x+fr.w},${fr.y+H/2} L${n.x},${n.y+n.h/2}" class="fl" marker-end="url(#o1)"/>`;h+=`<g><title>Output: ${esc2(n.doc)}${n.P.outnote?" - "+esc2(n.P.outnote):""}</title><path d="M${n.x},${n.y} L${n.x+n.w-12},${n.y} L${n.x+n.w},${n.y+12} L${n.x+n.w},${n.y+n.h} L${n.x},${n.y+n.h}z" fill="#fff7e0" stroke="#d9a400" stroke-width="1.4"/><path d="M${n.x+n.w-12},${n.y} L${n.x+n.w-12},${n.y+12} L${n.x+n.w},${n.y+12}" fill="none" stroke="#d9a400"/>${text(n.x+8,n.y+15,["Output"],{fs:9.5,fw:700,fill:"#8a6d00",a:"start"})}${text(n.x+n.w/2,n.y+30,wrap(n.doc,24,n.doc.length>48?3:2),{fs:9.8,fill:"var(--navy)"})}</g>`;return}
    if(n.kind==="dec"){const cx=n.x+DW/2,cy=n.y+DW/2,q=n.dec;const ql=wrap(q.q,22,2);h+=`<g class="opn ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}"><title>${esc2(q.q)} Yes: ${esc2(q.yes)}. No: ${esc2(q.no)}</title>${n.fork?`<rect x="${cx-(ql[0].length*5.5+8)/2}" y="${n.y-17}" width="${ql[0].length*5.5+8}" height="14" rx="3" fill="var(--card)" fill-opacity=".95"/>`:""}<path class="b" d="M${cx},${n.y} L${n.x+DW},${cy} L${cx},${n.y+DW} L${n.x},${cy}z" fill="#f3ecfa" stroke="#7b3597" stroke-width="1.4"/>${text(cx,n.y-7-(ql.length-1)*11.4,ql,{fs:9.5,fw:600,fill:"#5b2a7a"})}${text(n.x+DW+4,cy-5,[q.swap?"No":"Yes"],{fs:8.5,fw:600,fill:"#5b2a7a",a:"start"})}</g>${n.fork?"":n.gate&&q.fix?fixBranch(n):q.nx?noBranch(n):text(cx,n.y+DW+11,wrap("No: "+q.no,26,1),{fs:8.5,fill:"#7b3597"})}`;return}
    const s=n.s,c=TYC[s.was||s.ty],ch=s.ch||"same",lines=wrap(s.t,ch!=="same"?16:(s.t.length>42?23:21),s.t.length>42?3:2);
    let px=n.x+2;const inl=s.in||[];inl.slice(0,2).forEach(x=>{const p=pill(px,n.y-PIN+3,x[0],pc(x[0]),false,`From ${x[0]}: ${x[1]}`);h+=p.h+`<line class="source-step-leader" x1="${px+p.w/2}" y1="${n.y-PIN+20}" x2="${px+p.w/2}" y2="${n.y}" stroke="${pc(x[0])}" stroke-width="1.2"/>`;px+=p.w+4});
    if(inl.length>2){const p=pill(px,n.y-PIN+3,`+${inl.length-2}`,"#667085",false,inl.slice(2).map(x=>`From ${x[0]}: ${x[1]}`).join(" | "));h+=p.h}
    px=n.x+2;const outl=s.out||[];outl.slice(0,2).forEach(x=>{const p=pill(px,n.y+H+7,x[0],pc(x[0]),false,`To ${x[0]}: ${x[1]}`);h+=p.h+`<line class="source-step-leader" x1="${px+p.w/2}" y1="${n.y+H}" x2="${px+p.w/2}" y2="${n.y+H+7}" stroke="${pc(x[0])}" stroke-width="1.2"/>`;px+=p.w+4});if(outl.length>2){const p=pill(px,n.y+H+7,`+${outl.length-2}`,"#667085",false,outl.slice(2).map(x=>`To ${x[0]}: ${x[1]}`).join(" | "));h+=p.h}
    h+=`<g class="nd ty-${s.was||s.ty} ${s.pp&&s.pp.length?"has-pp":""} ${(s.ci||TPIS.has(n.id))?"has-tpi":""} ${sel===n.id?"sel":""}" tabindex="0" role="button" data-id="${n.id}" aria-label="${esc2(s.t)}"><title>${esc2(s.t)} - ${TYNM[s.was||s.ty]} - ${esc2(s.sys)}</title>
      <rect class="b" x="${n.x}" y="${n.y}" width="${W}" height="${H}" rx="9" fill="${ch==="new"?"#eef5fc":"var(--card)"}" stroke="${c}" stroke-width="2.2" ${ch==="new"?'stroke-dasharray="6 3"':""}/>
      <circle cx="${n.x+14}" cy="${n.y+14}" r="9" fill="${c}"/><text x="${n.x+14}" y="${n.y+17.5}" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">${s.n}</text>
      ${text(n.x+W/2+(ch!=="same"?-6:8),n.y+(lines.length>1?15:21),lines,{fs:10.8,fw:600,fill:"var(--navy)"})}
      ${text(n.x+9,n.y+H-9,[wrap(s.sys,23,1)[0]],{fs:9.2,fill:"var(--muted)",a:"start"})}
      ${s.pp&&s.pp.length?(d.fixes&&ch!=="same"?`<g><title>Pain point addressed by this change: ${esc2(s.pp.join(" | "))}</title><circle cx="${n.x+W-11}" cy="${n.y+H-11}" r="7" fill="#1f8a4c"/><text x="${n.x+W-11}" y="${n.y+H-7.5}" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">✔</text></g>`:`<circle cx="${n.x+W-11}" cy="${n.y+H-11}" r="7" fill="var(--pain)"/><text x="${n.x+W-11}" y="${n.y+H-7.5}" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">!</text>`):""}
      ${ch!=="same"?`<rect x="${n.x+W-34}" y="${n.y+4}" width="30" height="13" rx="4" fill="var(--prop)"/><text x="${n.x+W-19}" y="${n.y+13.5}" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">${ch==="new"?"NEW":"AI"}</text>`:""}
      ${s.cop?`<rect x="${n.x+W-44}" y="${n.y-7}" width="38" height="13" rx="4" fill="#fff" stroke="#0070c0" stroke-dasharray="3 2"/><text x="${n.x+W-25}" y="${n.y+2.5}" font-size="8" font-weight="700" fill="#0070c0" text-anchor="middle">${esc2(s.cop.tag||"Copilot")}</text>`:""}
      ${s.feas?`<rect x="${n.x+(s.feasdx||0)+W/2-Math.max(W,s.feas.length*4.7+14)/2}" y="${n.y+H+(outl.length?27:3)}" width="${Math.max(W,s.feas.length*4.7+14)}" height="14" rx="4" fill="${/review/i.test(s.feas)?"#b45309":/future/i.test(s.feas)?"#5f6b7a":/applicable|relevant/i.test(s.feas)?"#667085":/not/i.test(s.feas)?"var(--pain)":/progress/i.test(s.feas)?"var(--hyb)":"var(--ok)"}"/><text x="${n.x+(s.feasdx||0)+W/2}" y="${n.y+H+(outl.length?37:13)}" font-size="8.3" font-weight="700" fill="#fff" text-anchor="middle">${esc2(s.feas)}</text>${s.feasn?`<text x="${n.x+(s.feasdx||0)+W/2+Math.max(W,s.feas.length*4.7+14)/2+5}" y="${n.y+H+(outl.length?37:13)}" font-size="9.5" font-weight="600" fill="var(--navy)" text-anchor="start">${esc2(s.feasn)}</text>`:""}`:""}
    </g>`;
  });
  const svg=document.querySelector(E.svg);svg.setAttribute("viewBox",`0 0 ${svgW} ${svgH}`);svg.setAttribute("data-f",filter);svg.innerHTML=h+BT;
  svg.querySelectorAll(".nd,.opn").forEach(g=>{const f=()=>detail(g.dataset.id);g.onclick=f;g.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();f()}}});
}
function detail(id){const n=nodes[id];if(!n)return;sel=id;
  document.querySelector(E.svg).querySelectorAll(".opn").forEach(g=>g.classList.toggle("sel",g.dataset.id===id));
  if(n.kind==="opp"||n.kind==="fopp"){const o=n.opp;document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)}${n.P?" / "+esc2(n.P.name):""}</span><h3 style="color:#0070c0">AI Opportunity: ${esc2(o.t)}</h3><dl><div><dt>Type</dt><dd><b>${esc2(o.ty)}</b></dd></div><div><dt>How it would work and tools</dt><dd class="opl">${esc2(o.d)}</dd></div>${(n.P?n.P.steps.flatMap(s=>s.pp||[]):(n.f.pp||[])).length?`<div><dt style="color:var(--pain)">Pain points it addresses</dt><dd class="ppl">${[...new Set(n.P?n.P.steps.flatMap(s=>s.pp||[]):(n.f.pp||[]))].map(esc2).join("<br>")}</dd></div>`:""}${o.feasc?`<div><dt style="color:var(--ok)">AI feasibility comment</dt><dd>${esc2(o.feasc)}</dd></div>`:""}<div><dt>Source</dt><dd>${esc2(o.rid)} (hypothesis - needs validation with Controlling)</dd></div>${o.feas?`<div><dt>Feasibility</dt><dd><b>${esc2(o.feas)}</b></dd></div>`:""}${o.feasc?`<div><dt>Register basis</dt><dd>${esc2(o.feasc)}</dd></div>`:""}</dl>`;return}
  if(n.kind==="ch"||n.kind==="tpi"){const c=n.c,ids=(c.steps||[]).map(s=>`${n.f.id}|${s}`);document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.toggle("sel",ids.includes(g.dataset.id)));
    const names=ids.map(i=>nodes[i]).filter(Boolean).map(x=>`<b>${esc2(x.P.name)}</b> · ${esc2(x.s.n)}. ${esc2(x.s.t)}`).join("<br>");
    document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)}</span><h3 style="color:${n.kind==="ch"?"#a00015":"#13643a"}">${n.kind==="ch"?"[CHALLENGE] Pain point":`[SOLUTION] ${esc2(c.st||"TPI")}`}</h3><p style="margin:4px 0 0">${esc2(c.t)}</p><dl>${names?`<div><dt>${n.kind==="ch"?"Where it hits (highlighted on the map)":"Steps it addresses (highlighted on the map)"}</dt><dd>${names}</dd></div>`:""}${c.ref?`<div><dt>Reference</dt><dd>${esc2(c.ref)}</dd></div>`:""}<div><dt>Source</dt><dd>${esc2(c.src||("Controlling key processes workbook, "+(n.kind==="ch"?"Pain Points":"TPI 2026")+" column"))}</dd></div></dl>`;return}
  if(n.kind==="dec"){const q=n.dec;document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.remove("sel"));
    const r=(t,v,cls)=>v?`<div><dt>${t}</dt><dd class="${cls||""}">${v}</dd></div>`:"";
    document.querySelector(E.det).innerHTML=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f?n.f.name:"")}${n.P?" / "+esc2(n.P.name):""}</span><h3 style="color:#5b2a7a">Decision: ${esc2(q.q)}</h3>${q.d?`<p style="margin:4px 0 0">${esc2(q.d)}</p>`:""}<dl>${r("Example",q.ex?`<i>${esc2(q.ex)}</i>`:"")}${r("Checked by",q.o?esc2(q.o):"")}${r("System",q.sys?esc2(q.sys):"")}<div><dt>If yes</dt><dd>${esc2(q.yes)}</dd></div><div><dt>If no</dt><dd>${esc2(q.no)}</dd></div>${q.pp&&q.pp.length?r('<span style="color:var(--pain)">Pain point when the answer is no</span>',q.pp.map(esc2).join("<br>"),"ppl"):""}${r("Source",q.src?esc2(q.src):"")}</dl>`;return}
  const s=n.s;document.querySelector(E.svg).querySelectorAll(".nd").forEach(g=>g.classList.toggle("sel",g.dataset.id===id));
  const row=(t,v,cls)=>v?`<div><dt>${t}</dt><dd class="${cls||""}">${v}</dd></div>`:"";
  const ownc=o=>o.split(/\s\/\s|,\s*/).map(x=>`<span class="own"><i style="background:${pc(x)}"></i>${esc2(x)}</span>`).join("");
  let html=`<span style="font-size:11.5px;color:var(--muted)">${esc2(n.f.name)} / ${esc2(n.P.name)} (${esc2(n.P.id)})</span><h3>${s.n}. ${esc2(s.t)}</h3><p style="margin:4px 0 0">${esc2(s.d)}</p><dl>`;
  html+=row("Who",ownc(s.o))+row("System",esc2(s.sys))+row("Activity type",`<b style="color:${TYC[s.ty]}">${TYNM[s.ty]}</b>${s.was?` <small>(as-is: ${TYNM[s.was]})</small>`:""}`);
  if(s.in&&s.in.length)html+=row("Input from",s.in.map(x=>`<b>${esc2(x[0])}</b>: ${esc2(x[1])}`).join("<br>"));
  if(s.out&&s.out.length)html+=row("Output to",s.out.map(x=>`<b>${esc2(x[0])}</b>: ${esc2(x[1])}`).join("<br>"));
  if(s.dec)html+=row("Decision",`<b>${esc2(s.dec.q)}</b><br>Yes &rarr; ${esc2(s.dec.yes)}<br>No &rarr; ${esc2(s.dec.no)}`);
  if(s.ctl)html+=row("Control",esc2(s.ctl));
  if(s.pp&&s.pp.length)html+=row('<span style="color:var(--pain)">Pain points</span>',s.pp.map(esc2).join("<br>"),"ppl");
  if(s.ci)html+=row("Existing CI / TPI",esc2(s.ci));
  if(page==="tobe"&&s.ch&&s.ch!=="same")html+=row('<span style="color:var(--prop)">AI suggestion (hypothesis, to validate)</span>',`<b>${esc2(s.rec||"")}</b><br>Tools: ${esc2(s.tools||"")}<br><small>Basis: ${esc2(s.opp||"")}</small>`,"opl");
  if(page==="tobe"&&s.cop)html+=row('<span style="color:#0070c0">Copilot / Agent Builder option (added hypothesis, to validate)</span>',`<b>${esc2(s.cop.tool)}</b><br>${esc2(s.cop.d)}`,"opl");
  if(s.feasc)html+=row(`<span style="color:var(--ok)">${esc2(s.feasl||"AI enhancement comment")}</span>`,esc2(s.feasc));
  html+=row("Source",esc2(s.src))+`</dl>`;
  if(page==="tobe"&&s.ch==="same")html+=`<p style="font-size:12px;color:var(--muted)">No change proposed for this step.</p>`;
  document.querySelector(E.det).innerHTML=html;
}
function legend(){const d=DATA[page];const sw=(c,dash)=>`<svg width="22" height="12"><line x1="0" y1="6" x2="22" y2="6" stroke="${c}" stroke-width="1.6" ${dash?'stroke-dasharray="4 3"':""}/></svg>`;
  const box=c=>`<svg width="20" height="12"><rect x="1" y="1" width="18" height="10" rx="3" fill="none" stroke="${c}" stroke-width="2"/></svg>`;
  document.querySelector(E.leg).innerHTML=`<span>${box("#d0021b")}Manual</span><span>${box("#e8891c")}Semi-automated</span><span>${box("#2f6fce")}Automated</span><span><svg width="14" height="14"><circle cx="7" cy="7" r="6.5" fill="#c8102e"/><text x="7" y="10.5" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">!</text></svg>Pain point</span><span><svg width="14" height="14"><path d="M7,1L13,7L7,13L1,7z" fill="#f3ecfa" stroke="#7b3597"/></svg>Decision</span><span>${sw("var(--navy)")}Flow</span><span>${sw(d.accent)}Chain between processes</span><span>${sw(d.accent,1)}Loop back</span>${d.frames.some(f=>f.ch&&f.ch.length)?`<span><svg width="22" height="12"><rect x="1" y="1" width="20" height="10" rx="3" fill="#fdecec" stroke="var(--pain)"/></svg>[CHALLENGE] pain point</span><span><svg width="22" height="12"><rect x="1" y="1" width="20" height="10" rx="3" fill="#e6f4ec" stroke="var(--ok)"/></svg>[SOLUTION] TPI / CI</span><span>${sw(d.accent,1)}Same output</span>`:""}${d.frames.some(f=>f.procs.some(p=>p.steps.some(s=>s.gate&&s.fix&&!s.noRetry)))?`<span>${sw("var(--navy)",1)}Retry after the fix</span>`:""}${d.frames.some(f=>f.procs.some(p=>p.steps.some(s=>s.dec&&s.dec.nx&&s.dec.nx.end)))?`<span><svg width="26" height="14"><rect x="1" y="1" width="24" height="12" rx="6" fill="#fdecec" stroke="#d0021b" stroke-width="1.3"/></svg>End of the flow (reject / hold)</span>`:""}<span><svg width="34" height="14"><rect width="34" height="14" rx="4" fill="${d.accent}"/><text x="17" y="10.5" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">Input</text></svg>Trigger / input</span><span><svg width="18" height="14"><path d="M1,1 L12,1 L17,6 L17,13 L1,13z" fill="#fff7e0" stroke="#d9a400"/></svg>Output</span>${page==="tobe"?`<span><svg width="70" height="16"><rect x="1" y="1" width="68" height="14" rx="7" fill="none" stroke="#0070c0" stroke-width="1.3" stroke-dasharray="3 2"/><text x="35" y="11.5" font-size="9" font-weight="700" fill="#0070c0" text-anchor="middle">AI: R2R</text></svg>AI-suggested dependency</span><span><svg width="60" height="16"><rect x="1" y="1" width="58" height="14" rx="4" fill="#e8f1fb" stroke="#0070c0"/><text x="30" y="11.5" font-size="8.5" font-weight="700" fill="#0070c0" text-anchor="middle">AI Opportunity</text></svg>AI opportunity (register)</span><span><svg width="30" height="13"><rect width="30" height="13" rx="4" fill="#0070c0"/><text x="15" y="10" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">AI</text></svg>Step changed (AI suggested)</span><span><svg width="30" height="13"><rect width="30" height="13" rx="4" fill="#0070c0"/><text x="15" y="10" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">NEW</text></svg>New step</span>`:""}<span>Pills = input from / output to; strips = upstream / downstream</span>`;}
function setScale(s){scale=Math.max(.3,Math.min(2,s));const svg=document.querySelector(E.svg);svg.style.width=svgW*scale+"px";svg.style.height=svgH*scale+"px"}
function fit(){const w=document.querySelector(E.scroll).clientWidth-10;setScale(Math.min(1,w/svgW))}
function render(pg,fl){if(pg)page=pg;if(fl)filter=fl;sel=null;draw();legend();document.querySelector(E.det).innerHTML='<p class="none">Select a step in the map to see what happens, who does it, the system, inputs, outputs, decisions, pain points and the source.</p>';fit()}
function setFilter(f){filter=f;document.querySelector(E.svg).setAttribute("data-f",f)}
return {getNodes:()=>nodes,getDimensions:()=>({width:svgW,height:svgH}),render,setFilter,zi:()=>setScale(scale+.15),zo:()=>setScale(scale-.15),fit,page:()=>page,setScale,getScale:()=>scale};
};
