<script>
  import { onMount, onDestroy } from "svelte";

  const INTERACTIVE = "a, button, [role='button'], .nav-link, .blog-item, .skill-item";
  
  let dotRef;
  
  let targetX = 0, targetY = 0;
  let dotX = 0, dotY = 0;
  
  let isHovering = false;
  let hoverRect = null;
  
  let rafId;
  let isVisible = false;
  let isFirefox = false;

  function onMove(e) {
    if (!isVisible) {
      isVisible = true;
      dotX = e.clientX;
      dotY = e.clientY;
    }
    targetX = e.clientX;
    targetY = e.clientY;
  }

  function onOver(e) {
    const el = e.target.closest(INTERACTIVE);
    if (el) {
      isHovering = true;
      hoverRect = el.getBoundingClientRect();
    }
  }

  function onOut(e) {
    if (e.target.closest(INTERACTIVE)) {
      isHovering = false;
      hoverRect = null;
    }
  }

  function loop() {
    if (!dotRef) {
      rafId = requestAnimationFrame(loop);
      return;
    }
    
    if (isHovering && hoverRect) {
      const centerX = hoverRect.left + hoverRect.width / 2;
      const centerY = hoverRect.top + hoverRect.height / 2;
      dotX += (centerX - dotX) * 0.2;
      dotY += (centerY - dotY) * 0.2;
      
      dotRef.style.width = `${hoverRect.width + 16}px`;
      dotRef.style.height = `${hoverRect.height + 16}px`;
      dotRef.style.borderRadius = '8px';
      dotRef.classList.add("cursor-hovering");
    } else {
      dotX += (targetX - dotX) * 0.5; 
      dotY += (targetY - dotY) * 0.5;
      
      dotRef.style.width = '14px';
      dotRef.style.height = '14px';
      dotRef.style.borderRadius = '50%';
      dotRef.classList.remove("cursor-hovering");
    }

    dotRef.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
    rafId = requestAnimationFrame(loop);
  }

  onMount(() => {
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    
    rafId = requestAnimationFrame(loop);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      cancelAnimationFrame(rafId);
    }
  });
</script>

<div class="cursor-wrapper">
  <div bind:this={dotRef} class="cursor-magnetic" class:visible={isVisible} class:cursor-hovering={isHovering}></div>
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
    width: 14px;
    height: 14px;
    border-radius: 50%;
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
