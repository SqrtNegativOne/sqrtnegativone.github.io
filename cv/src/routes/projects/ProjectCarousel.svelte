<script>
  import { onMount } from "svelte";
  import ProjectCard from "./ProjectCard.svelte";
  

  let { projects = [] } = $props();

  let trackRef = $state(null); // oxlint-disable-line no-unassigned-vars - false positive: assigned in template via bind:this
  let progress = $state(0);

  function onScroll() {
    if (!trackRef) return;
    const max = trackRef.scrollWidth - trackRef.clientWidth;
    progress = max > 0 ? trackRef.scrollLeft / max : 0;
  }

  onMount(() => {
    if (trackRef) {
      trackRef.addEventListener("scroll", onScroll, { passive: true });
    }
    return () => {
      if (trackRef) {
        trackRef.removeEventListener("scroll", onScroll);
      }
    };
  });
</script>

<div class="carousel-wrapper">
  <div class="carousel-track" bind:this={trackRef}>
    {#each projects as project, i (project.id)}
      <ProjectCard {project} index={i} />
    {/each}
  </div>

  <!-- Progress bar -->
  <div class="carousel-progress-bar">
    <div
      class="carousel-progress-fill"
      style="width: {progress * 100}%;"
    ></div>
  </div>
</div>

<style>
/* ── Carousel wrapper ───────────────────────────── */
.carousel-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* ── Scrollable card track ──────────────────────── */
.carousel-track {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 1rem;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x proximity;
  /* Thin scrollbar as visual affordance for scrollability */
  scrollbar-width: thin;
  scrollbar-color: var(--text-secondary) transparent;
  padding-bottom: 6px; /* space for the scrollbar */
  padding-right: 2rem; /* breathing room at end */
}

.carousel-track::-webkit-scrollbar {
  height: 3px;
}

.carousel-track::-webkit-scrollbar-track {
  background: transparent;
}

.carousel-track::-webkit-scrollbar-thumb {
  background: var(--text-secondary);
  opacity: 0.4;
}

/* ── Scroll progress bar ────────────────────────── */
.carousel-progress-bar {
  height: 1px;
  background: var(--glass-border);
  position: relative;
  flex-shrink: 0;
}

.carousel-progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--text-secondary);
  opacity: 0.6;
  transition: width 0.15s ease;
}

@media (max-width: 640px) {
  .carousel-track {
    padding-right: 1rem;
  }
}

</style>
