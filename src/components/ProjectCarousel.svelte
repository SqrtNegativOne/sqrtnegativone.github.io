<script>
  import { onMount } from "svelte";
  import ProjectCard from "./ProjectCard.svelte";
  import "./ProjectCarousel.css";

  export let projects = [];

  let trackRef;
  let progress = 0;

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
