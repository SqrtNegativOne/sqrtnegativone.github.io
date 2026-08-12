import { onMount } from 'svelte';
// Helper to click outside
export function clickOutside(node, cb) {
  const handle = (e) => {
    if (!node.contains(e.target)) cb();
  };
  document.addEventListener('click', handle, true);
  return {
    destroy() {
      document.removeEventListener('click', handle, true);
    }
  };
}
