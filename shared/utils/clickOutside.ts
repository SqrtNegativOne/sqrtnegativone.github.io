// Helper to click outside, supporting both mouse and touch
export function clickOutside(node: HTMLElement, cb: (e?: Event) => void) {
  const handle = (e: Event) => {
    if (node && !node.contains(e.target as Node) && !e.defaultPrevented) {
      cb(e);
    }
  };

  document.addEventListener('click', handle, true);
  document.addEventListener('touchstart', handle, true);

  return {
    destroy() {
      document.removeEventListener('click', handle, true);
      document.removeEventListener('touchstart', handle, true);
    }
  };
}
