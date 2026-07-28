<script>
  import projects from "../data/projects.json";
  import ProjectCarousel from "./ProjectCarousel.svelte";
  import "./Projects.css";
</script>

<div class="projects-page">
  <ProjectCarousel {projects} />
</div>
