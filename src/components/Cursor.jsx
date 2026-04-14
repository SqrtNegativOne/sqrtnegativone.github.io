import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, [role='button'], .nav-link, .blog-item, .skill-item";

export default function Cursor() {
  const dotRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;

    const onMove = (e) => {
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;
    };

    const onOver = (e) => {
      if (e.target.closest(INTERACTIVE)) {
        dot.classList.add("cursor-expanded");
      }
    };

    const onOut = (e) => {
      if (e.target.closest(INTERACTIVE)) {
        dot.classList.remove("cursor-expanded");
      }
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  return <div ref={dotRef} className="custom-cursor" />;
}
