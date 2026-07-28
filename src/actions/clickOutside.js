export function clickOutside(node, callback) {
  const handleClick = event => {
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      callback(event);
    }
  };

  document.addEventListener('click', handleClick, true);
  document.addEventListener('touchstart', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('touchstart', handleClick, true);
    }
  };
}
