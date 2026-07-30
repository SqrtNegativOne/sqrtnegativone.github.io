<script>
  import projects from "../data/projects.json";
  import ProjectCarousel from "./ProjectCarousel.svelte";
  
</script>

<div class="projects-page">
  <ProjectCarousel {projects} />
</div>

<style>
/* ── Projects page wrapper ─────────────────────── */
.projects-page {
  width: 100%;
  min-width: 0; /* prevent grid blowout */
}

</style>
