const minor=new Set(['a','an','and','as','at','but','by','for','from','in','into','nor','of','on','or','per','the','to','via','vs','with']);
export function titleCase(value){
 const words=String(value??'').split(/(\s+)/);let first=true;
 return words.map((word,i)=>{if(!word.trim())return word;const clean=word.replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu,'');if(!clean)return word;
 const v=clean.split(/([-–/])/).map((part,j,parts)=>{
  if(!/\p{L}/u.test(part))return part;
  if(/^[A-Z\d&+.]{2,}s?$/.test(part)||/[a-z][A-Z]/.test(part)||/\d/.test(part))return part;
  const lower=part.toLowerCase();
  if(minor.has(lower)&&!(first&&j===0)&&!(i===words.length-1&&j===parts.length-1))return lower;
  return lower.replace(/^\p{L}/u,c=>c.toUpperCase());
 }).join('');first=/[:.!?]$/.test(word);return word.replace(clean,v);
 }).join('');
}
export function normalizeHeadings(root=document){
 root.querySelectorAll('h1,h2,h3,h4,h5,h6,.process-name,.hud-mix-heading strong,.hud-health-row>span:first-child,.tw-section-title>span,.detail-title .demo-data,.tw-navigation button span,.tw-mobile-nav option,.hud-chip .chip-lbl,.tw-record-copy strong,.tw-stage-copy strong,.neural-headings strong,.sc-opp>summary b,.sc-pg>summary b,.flow-cycle-title,.flow-title,.tw-ai-notice strong').forEach(el=>{
  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;while(n=walker.nextNode()){const next=titleCase(n.nodeValue);if(n.nodeValue!==next)n.nodeValue=next;}
 });
}
