<script>
  import { onMount } from "svelte";
  import { createThomas } from "./visualizations/thomas";
  import { createThomasWebGL } from "./visualizations/thomas-webgl";

  let canvasRef; // oxlint-disable-line no-unassigned-vars - false positive: assigned in template via bind:this

  onMount(() => {
    const canvas = canvasRef;
    if (!canvas) return;

    const webglViz = createThomasWebGL();
    const useWebGL = webglViz.init(canvas);

    let viz, ctx;
    if (useWebGL) {
      viz = webglViz;
      ctx = null;
    } else {
      webglViz.destroy();
      ctx = canvas.getContext("2d", { alpha: false });
      viz = createThomas();
    }

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
      if (!useWebGL) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      viz.resize(W, H);
    }

    function getColors() {
      return { bg: "5,5,8", litBase: 42, litSpd: 32 };
    }

    let cachedColors = getColors();
    if (useWebGL) viz.setColors(cachedColors);

    function render() {
      if (!document.body.classList.contains("menu-is-open")) {
        az += (targetAz - az) * 0.06;
        el += (targetEl - el) * 0.06;
        viz.frame(ctx, W, H, az, el, cachedColors);
      }
      animId = requestAnimationFrame(render);
    }

    let hasGyro = false;

    function onMouseMove(e) {
      if (hasGyro) return;
      targetAz = ((e.clientX / W) - 0.5) * Math.PI * 2;
      targetEl = ((e.clientY / H) - 0.5) * Math.PI * 0.8;
    }

    function onTouchMove(e) {
      e.preventDefault();
      if (hasGyro) return;
      const t = e.touches[0];
      targetAz = ((t.clientX / W) - 0.5) * Math.PI * 2;
      targetEl = ((t.clientY / H) - 0.5) * Math.PI * 0.8;
    }

    function onDeviceOrientation(e) {
      if (e.gamma === null || e.beta === null) return;
      hasGyro = true;
      let g = Math.max(-45, Math.min(45, e.gamma));
      let b = Math.max(0, Math.min(90, e.beta)) - 45;
      targetAz = (g / 45) * Math.PI;
      targetEl = (b / 45) * Math.PI * 0.8;
    }

    function requestGyroPermission() {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(state => {
            if (state === 'granted') {
              window.addEventListener('deviceorientation', onDeviceOrientation);
            }
          }).catch(console.error);
      }
    }

    function onResize() {
      resize();
    }

    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchstart", requestGyroPermission, { once: true });
    window.addEventListener("deviceorientation", onDeviceOrientation);
    window.addEventListener("resize", onResize);

    resize();
    if (!useWebGL) viz.init(ctx, W, H);
    render();

    return () => {
      cancelAnimationFrame(animId);
      viz.destroy();
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchstart", requestGyroPermission);
      window.removeEventListener("deviceorientation", onDeviceOrientation);
      window.removeEventListener("resize", onResize);
    };
  });
</script>

<div style="position: fixed; inset: 0; z-index: -1;">
  <canvas
    bind:this={canvasRef}
    style="display: block; width: 100vw; height: 100vh;"
  ></canvas>
</div>
