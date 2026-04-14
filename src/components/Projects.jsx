import projects from "../data/projects.json";
import ProjectCarousel from "./ProjectCarousel";
import "./Projects.css";

export default function Projects() {
  return (
    <div className="projects-page">
      <ProjectCarousel projects={projects} />
    </div>
  );
}
