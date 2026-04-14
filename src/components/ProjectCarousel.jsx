import { useRef, useEffect, useState } from "react";
import ProjectCard from "./ProjectCard";
import "./ProjectCarousel.css";

export default function ProjectCarousel({ projects }) {
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const max = track.scrollWidth - track.clientWidth;
      setProgress(max > 0 ? track.scrollLeft / max : 0);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="carousel-wrapper">
      <div className="carousel-track" ref={trackRef}>
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>

      {/* Progress bar */}
      <div className="carousel-progress-bar">
        <div
          className="carousel-progress-fill"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

    </div>
  );
}
