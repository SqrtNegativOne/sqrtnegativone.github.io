import { useEffect, useRef } from "react";
import { createThomas } from "./visualizations/thomas";

// To swap the visualization, replace this import and the createThomas() call below.
// Any visualization must implement: { init, frame, resize, destroy }

export default function Home() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    const viz = createThomas();

    let W, H, animId;
    let targetAz = 0, targetEl = 0.3, az = 0, el = 0.3;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = (W * dpr) | 0;
      canvas.height = (H * dpr) | 0;
      canvas.style.width  = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      viz.resize(W, H);
    }

    function getColors() {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      return isDark
        ? { bg: "5,5,8",         litBase: 42, litSpd: 32 }
        : { bg: "245,242,237",   litBase: 20, litSpd: 25 };
    }

    function render() {
      az += (targetAz - az) * 0.06;
      el += (targetEl - el) * 0.06;
      viz.frame(ctx, W, H, az, el, getColors());
      animId = requestAnimationFrame(render);
    }

    function onMouseMove(e) {
      targetAz = ((e.clientX / W) - 0.5) * Math.PI * 2;
      targetEl = ((e.clientY / H) - 0.5) * Math.PI * 0.8;
    }

    function onTouchMove(e) {
      e.preventDefault();
      const t = e.touches[0];
      targetAz = ((t.clientX / W) - 0.5) * Math.PI * 2;
      targetEl = ((t.clientY / H) - 0.5) * Math.PI * 0.8;
    }

    function onResize() {
      cancelAnimationFrame(animId);
      resize();
      render();
    }

    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("resize", onResize);

    resize();
    viz.init(ctx, W, H);
    render();

    return () => {
      cancelAnimationFrame(animId);
      viz.destroy();
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100vw", height: "100vh" }}
      />
    </div>
  );
}
