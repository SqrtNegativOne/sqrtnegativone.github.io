<script>
  import { onMount, onDestroy } from "svelte";

  const INTERACTIVE = "a, button, [role='button'], .nav-link, .blog-item, .skill-item";
  let dotRef;

  function onMove(e) {
    if (!dotRef) return;
    dotRef.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
  }

  function onOver(e) {
    if (!dotRef) return;
    if (e.target.closest(INTERACTIVE)) {
      dotRef.classList.add("cursor-expanded");
    }
  }

  function onOut(e) {
    if (!dotRef) return;
    if (e.target.closest(INTERACTIVE)) {
      dotRef.classList.remove("cursor-expanded");
    }
  }

  onMount(() => {
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
  });

  onDestroy(() => {
    // Svelte 5 runs destroy in browser during unmount
    if (typeof window !== 'undefined') {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    }
  });
</script>

<div bind:this={dotRef} class="custom-cursor"></div>
