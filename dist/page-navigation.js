// One cancellable journey between the anatomy and its process workspace.
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let cancelCurrent;

export function cancelPageNavigation() { cancelCurrent?.(); }

export function scrollPageTo(top, {left = 0, instant = false} = {}) {
  cancelPageNavigation();
  const page = document.scrollingElement;
  const targetY = Math.max(0, Math.min(top, page.scrollHeight - innerHeight));
  const targetX = Math.max(0, Math.min(left, page.scrollWidth - innerWidth));
  const startX = scrollX, startY = scrollY;
  const distance = Math.hypot(targetX - startX, targetY - startY);
  if (instant || reduced.matches || distance < 1) {
    window.scrollTo({left: targetX, top: targetY, behavior: 'instant'});
    return Promise.resolve(true);
  }
  return new Promise(resolve => {
    const duration = Math.min(760, 380 + Math.sqrt(distance) * 5);
    const controller = new AbortController();
    let frame, started;
    const finish = complete => {
      cancelAnimationFrame(frame);
      controller.abort();
      if (cancelCurrent === cancel) cancelCurrent = null;
      resolve(complete);
    };
    const cancel = () => finish(false);
    cancelCurrent = cancel;
    const options = {passive: true, signal: controller.signal};
    for (const event of ['wheel', 'touchstart', 'pointerdown']) window.addEventListener(event, cancel, options);
    window.addEventListener('keydown', event => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Escape', 'Tab', ' '].includes(event.key)) cancel();
    }, options);
    const step = now => {
      started ??= now;
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - (1 - progress) ** 4;
      window.scrollTo({left: startX + (targetX - startX) * eased, top: startY + (targetY - startY) * eased, behavior: 'instant'});
      if (progress < 1) frame = requestAnimationFrame(step);
      else finish(true);
    };
    frame = requestAnimationFrame(step);
  });
}
