// Helper to click outside
export function clickOutside(node: HTMLElement, cb: () => void) {
  const handle = (e: Event) => {
    if (e.target instanceof Node && !node.contains(e.target)) cb();
  };
  document.addEventListener('click', handle, true);
  return {
    destroy() {
      document.removeEventListener('click', handle, true);
    }
  };
}
