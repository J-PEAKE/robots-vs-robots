// Every phase awaits animation completion. Cancellation prevents late state writes.
export function createAnimator(reduced = matchMedia('(prefers-reduced-motion: reduce)')) {
 const active=new Set(); let disposed=false;
 return {get disposed(){return disposed;},async play(element,frames,duration,options={}){
  if(disposed)throw new DOMException('Cancelled','AbortError');
  if(!element)return;
  const animation=element.animate(reduced.matches?[{opacity:1},{opacity:1}]:frames,{duration:reduced.matches?30:duration,easing:'cubic-bezier(.22,.8,.3,1)',fill:'forwards',...options});
  active.add(animation);
  try{await animation.finished;if(disposed)throw new DOMException('Cancelled','AbortError');}finally{active.delete(animation);animation.cancel();}
 },cancel(){disposed=true;for(const animation of active)animation.cancel();active.clear();}};
}
export const axeMarkup=`<svg class="summoned-axe" viewBox="0 0 130 180" aria-hidden="true"><path class="axe-trail" d="M15 100Q-5 5 106 14" fill="none" stroke="#a7fff4" stroke-width="13" opacity=".65"/><path d="M53 160L67 35" stroke="#253f60" stroke-width="15" stroke-linecap="round"/><path d="M53 160L67 35" stroke="#a1bccd" stroke-width="7"/><path d="M50 136L59 138M52 123L61 125M54 110L63 112" stroke="#354463" stroke-width="5"/><path class="axe-blade" d="M67 28Q94 4 115 28L119 70Q89 65 67 82Z" fill="#67fff1" stroke="white" stroke-width="5"/><path d="M76 35Q97 22 106 32L109 57Q92 54 76 63" fill="white"/><circle cx="67" cy="62" r="9" fill="#ffdc52" stroke="#354463" stroke-width="4"/></svg>`;
