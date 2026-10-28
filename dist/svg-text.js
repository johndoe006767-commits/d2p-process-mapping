/* Match the rendered font, including the ellipsis, to a real width budget. */
const context=document.createElement('canvas').getContext('2d');
export function measureText(value,size=11,weight=400){
 context.font=`${weight} ${size}px Inter, sans-serif`;
 return context.measureText(String(value??'')).width;
}
export function fitLines(value,width,size=11,max=3,weight=400){
 const fits=s=>measureText(s,size,weight)<=width-.5;
 const tokens=String(value??'').trim().split(/\s+/).filter(Boolean),lines=[];let line='';
 for(let word of tokens){
  if(line&&fits(`${line} ${word}`)){line+=` ${word}`;continue;}
  if(line){lines.push(line);line='';}
  while(word&&!fits(word)){let part='';for(const c of word){if(!fits(part+c))break;part+=c;}if(!part)break;lines.push(part);word=word.slice(part.length);}
  line=word;
 }
 if(line)lines.push(line);
 if(lines.length>max){let last=lines[max-1];while(last&&!fits(last+'…'))last=last.slice(0,-1);lines.length=max;lines[max-1]=last.trimEnd()+'…';}
 return lines;
}
// Source diagrams contain small labels inside fixed shapes. Keep their geometry,
// preserve full copy in SVG titles, and constrain each line to the actual shape.
export function fitSvgLabels(svg){
 svg.querySelectorAll('g').forEach(g=>{
  const rect=[...g.children].filter(n=>n.tagName==='rect').sort((a,b)=>+b.getAttribute('width')*+b.getAttribute('height')-+a.getAttribute('width')*+a.getAttribute('height'))[0];
  if(!rect)return;const x=+rect.getAttribute('x'),y=+rect.getAttribute('y'),w=+rect.getAttribute('width'),h=+rect.getAttribute('height');
  [...g.children].filter(n=>n.tagName==='text').forEach(t=>{
   const tx=+t.getAttribute('x'),ty=+t.getAttribute('y');if(tx<x||tx>x+w||ty<y||ty>y+h)return;
   const style=getComputedStyle(t),size=parseFloat(style.fontSize),weight=style.fontWeight,anchor=t.getAttribute('text-anchor')||'start';
   const available=anchor==='middle'?2*Math.min(tx-x-6,x+w-tx-6):anchor==='end'?tx-x-8:x+w-tx-8;
   if(available<=0)return;const spans=t.querySelectorAll('tspan'),targets=spans.length?[...spans]:[t];
   for(const target of targets){if(target.getComputedTextLength()<=available)continue;const full=target.textContent;target.textContent=fitLines(full,available,size,1,weight)[0]||'';if(!g.querySelector(':scope > title')){const title=document.createElementNS(svg.namespaceURI,'title');title.textContent=full;g.prepend(title);}}
  });
 });
}
