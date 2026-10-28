let pending;
// The badge and destination share one source and one cached request.
export function loadSourceRegisters(){
 return pending??=(fetch('./data/tower-content.json').then(r=>{
  if(!r.ok)throw Error('The source registers could not be loaded.');
  return r.json();
 }).catch(error=>{pending=null;throw error;}));
}
export function aiOpportunityCount(tower){
 const section=tower?.ai?.find(s=>s.id.startsWith('opp-'));
 if(!section)return 0;
 return new DOMParser().parseFromString(section.html,'text/html').querySelectorAll('.sc-opp').length;
}
