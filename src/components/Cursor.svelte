<script>
  import { onMount, onDestroy } from "svelte";
  import { spring } from "svelte/motion";

  const INTERACTIVE = "a, button, [role='button'], .nav-link, .blog-item, .skill-item";
  
  let isVisible = false;
  let isHovering = false;
  let hoverEl = null;

  let hoverWidth = 14;
  let hoverHeight = 14;
  let hoverBorderRadius = '50%';

  // Store actual mouse coordinates to fallback to if a hovered element is deleted
  let mouseX = 0;
  let mouseY = 0;
  let checkInterval;

  // We set high damping (0.9) to eliminate the "bouncy spring" effect entirely.
  // Stiffness dictates how fast it follows the mouse.
  const coords = spring({ x: 0, y: 0 }, {
    stiffness: 0.25,
    damping: 0.9
  });

  function onMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      coords.set({ x: mouseX, y: mouseY }, { hard: true });
    }
    
    if (!isHovering) {
      coords.set({ x: mouseX, y: mouseY });
    }
  }

  function updateHoveredElement() {
    if (isHovering && hoverEl) {
      const rect = hoverEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      hoverWidth = rect.width + 16;
      hoverHeight = rect.height + 16;
      hoverBorderRadius = '8px';
      
      coords.set({ x: centerX, y: centerY });
    }
  }

  function onOver(e) {
    const el = e.target.closest(INTERACTIVE);
    if (el) {
      isHovering = true;
      hoverEl = el;
      updateHoveredElement();
    }
  }

  function onOut(e) {
    if (e.target.closest(INTERACTIVE)) {
      isHovering = false;
      hoverEl = null;
      
      hoverWidth = 14;
      hoverHeight = 14;
      hoverBorderRadius = '50%';
      
      coords.set({ x: mouseX, y: mouseY });
    }
  }

  function onScroll() {
    if (isHovering) {
      const rect = hoverEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      coords.set({ x: centerX, y: centerY }, { hard: true });
    }
  }

  // Continuously check if the hovered element was removed from the DOM
  // e.g. when a modal is closed while the mouse is hovering its close button
  function checkHoverElExists() {
    if (isHovering && hoverEl && !document.body.contains(hoverEl)) {
      isHovering = false;
      hoverEl = null;
      hoverWidth = 14;
      hoverHeight = 14;
      hoverBorderRadius = '50%';
      coords.set({ x: mouseX, y: mouseY });
    }
  }

  onMount(() => {
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    
    // Check every 100ms if our hovered element disappeared
    checkInterval = setInterval(checkHoverElExists, 100);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      clearInterval(checkInterval);
    }
  });
</script>

<div class="cursor-wrapper">
  <div 
    class="cursor-magnetic" 
    class:visible={isVisible} 
    class:cursor-hovering={isHovering}
    style="
      transform: translate3d({$coords.x}px, {$coords.y}px, 0) translate(-50%, -50%);
      width: {hoverWidth}px;
      height: {hoverHeight}px;
      border-radius: {hoverBorderRadius};
    "
  ></div>
</div>

<style>
  .cursor-wrapper {
    pointer-events: none;
    z-index: 99999;
    position: fixed;
    inset: 0;
    overflow: hidden;
  }
  
  .cursor-magnetic {
    position: absolute;
    left: 0; top: 0;
    background: #fff;
    border: 1px solid transparent;
    will-change: transform, width, height, border-radius, background, border;
    transition: width 0.3s cubic-bezier(0.2, 1, 0.2, 1), 
                height 0.3s cubic-bezier(0.2, 1, 0.2, 1), 
                border-radius 0.3s,
                background-color 0.3s,
                border-color 0.3s;
    opacity: 0;
  }

  .cursor-magnetic.visible {
    opacity: 1;
  }
  
  .cursor-magnetic.cursor-hovering {
    background: transparent;
    border-color: rgba(255, 255, 255, 0.8);
  }

  @media (hover: none) and (pointer: coarse) {
    .cursor-wrapper { display: none; }
  }
</style>
