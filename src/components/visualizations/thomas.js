// Thomas attractor particle visualization
// Interface: createThomas() → { init, frame, resize, destroy }
//
// Swap this file for a different visualization by implementing the same
// four-method interface and updating the import in Home.jsx.

const DT = 0.08, B = 0.19;
const TRAIL = 14;

function stepParticle(x, y, z, steps) {
  for (let j = 0; j < steps; j++) {
    const nx = x + (Math.sin(y) - B * x) * DT;
    const ny = y + (Math.sin(z) - B * y) * DT;
    const nz = z + (Math.sin(x) - B * z) * DT;
    x = nx; y = ny; z = nz;
  }
  return [x, y, z];
}

// Colour cache keyed by (hue bucket × lightness bucket) — avoids string alloc per frame
const colCache = new Array(400);
function getCol(hue, lightness) {
  const hk  = (hue / 10) | 0;
  const lk  = (lightness / 5) | 0;
  const key = hk * 20 + lk;
  if (!colCache[key]) colCache[key] = `hsl(${hk * 10},75%,${lk * 5}%)`;
  return colCache[key];
}

export function createThomas() {
  let N = 2200;
  let pos, trail, trailHead, hues, projX, projY;
  let asyncTimers = [];

  // Adaptive quality: sample 90 frames then reduce N if FPS < 38
  let fpsFrames = 0, fpsStart = 0, adapted = false;

  function allocAndSeedParticles(warmSteps) {
    pos       = new Float32Array(N * 3);
    trail     = new Float32Array(N * TRAIL * 3);
    trailHead = new Int32Array(N);
    hues      = new Uint16Array(N);
    projX     = new Float32Array(N * TRAIL);
    projY     = new Float32Array(N * TRAIL);

    for (let i = 0; i < N; i++) {
      let x = (Math.random() - 0.5) * 4;
      let y = (Math.random() - 0.5) * 4;
      let z = (Math.random() - 0.5) * 4;
      [x, y, z] = stepParticle(x, y, z, warmSteps);
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      hues[i] = 180 + ((Math.random() * 130) | 0); // blue → purple
      trailHead[i] = 0;
      for (let t = 0; t < TRAIL; t++) {
        trail[(i * TRAIL + t) * 3]     = x;
        trail[(i * TRAIL + t) * 3 + 1] = y;
        trail[(i * TRAIL + t) * 3 + 2] = z;
      }
    }
  }

  // Finish convergence off the critical path: 500 extra steps per particle
  // spread across 300-particle batches so each chunk ≈ 1–2 ms.
  function warmUpAsync() {
    const EXTRA = 500;
    const BATCH = 300;
    let cursor = 0;
    function chunk() {
      const end = Math.min(cursor + BATCH, N);
      for (let i = cursor; i < end; i++) {
        let x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
        [x, y, z] = stepParticle(x, y, z, EXTRA);
        pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
        for (let t = 0; t < TRAIL; t++) {
          trail[(i * TRAIL + t) * 3]     = x;
          trail[(i * TRAIL + t) * 3 + 1] = y;
          trail[(i * TRAIL + t) * 3 + 2] = z;
        }
      }
      cursor = end;
      if (cursor < N) asyncTimers.push(setTimeout(chunk, 0));
    }
    asyncTimers.push(setTimeout(chunk, 0));
  }

  return {
    /** Called once after the canvas is sized. */
    init(_ctx, _W, _H) {
      allocAndSeedParticles(100); // short sync warm-up so particles are near attractor
      warmUpAsync();              // finish convergence without blocking
    },

    /** Called on every animation frame. az/el are camera Euler angles.
     *  colors: { bg: "r,g,b", litBase: number, litSpd: number } */
    frame(ctx, W, H, az, el, colors) {
      // Adaptive quality check
      if (!adapted) {
        if (fpsFrames === 0) fpsStart = performance.now();
        fpsFrames++;
        if (fpsFrames === 90) {
          const fps = 90000 / (performance.now() - fpsStart);
          if (fps < 38) {
            N = Math.max(600, (N * 0.55) | 0);
            allocAndSeedParticles(100);
            warmUpAsync();
          }
          adapted = true;
        }
      }

      // Pre-hoist trig — reused across all N × TRAIL projections this frame
      const ca = Math.cos(az), sa = Math.sin(az);
      const ce = Math.cos(el), se = Math.sin(el);
      const sc = H / 11, cx = W * 0.5, cy = H * 0.5;

      const { bg, litBase, litSpd } = colors;

      ctx.fillStyle = `rgb(${bg})`;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = `rgba(${bg},0.20)`;
      ctx.fillRect(0, 0, W, H);

      // Step all particles + project trails into flat TypedArrays
      for (let i = 0; i < N; i++) {
        const b3 = i * 3;
        const x0 = pos[b3], y0 = pos[b3 + 1], z0 = pos[b3 + 2];

        const nx = x0 + (Math.sin(y0) - B * x0) * DT;
        const ny = y0 + (Math.sin(z0) - B * y0) * DT;
        const nz = z0 + (Math.sin(x0) - B * z0) * DT;
        pos[b3] = nx; pos[b3 + 1] = ny; pos[b3 + 2] = nz;

        const head = trailHead[i];
        const tb   = (i * TRAIL + head) * 3;
        trail[tb] = nx; trail[tb + 1] = ny; trail[tb + 2] = nz;
        trailHead[i] = (head + 1) % TRAIL;

        const base = i * TRAIL;
        for (let t = 0; t < TRAIL; t++) {
          const p  = (base + t) * 3;
          const tx = trail[p], ty = trail[p + 1], tz = trail[p + 2];
          const x1 = tx * ca + tz * sa;
          const y2 = ty * ce - (-tx * sa + tz * ca) * se;
          projX[base + t] = cx + x1 * sc;
          projY[base + t] = cy - y2 * sc;
        }
      }

      // Draw trails
      ctx.lineWidth = 0.9;
      for (let i = 0; i < N; i++) {
        const base = i * TRAIL;
        const head = (trailHead[i] + TRAIL - 1) % TRAIL;
        const tail = trailHead[i];

        const dx  = projX[base + head] - projX[base + tail];
        const dy  = projY[base + head] - projY[base + tail];
        const spd = Math.min(1.0, (dx * dx + dy * dy) * 0.00015);

        const hue  = hues[i] + ((spd * 50) | 0);
        const lite = litBase + ((spd * litSpd) | 0);
        ctx.strokeStyle = getCol(hue, lite);
        ctx.globalAlpha = 0.55 + spd * 0.25;

        ctx.beginPath();
        ctx.moveTo(projX[base + tail], projY[base + tail]);
        for (let t = 1; t < TRAIL; t++) {
          const idx = (tail + t) % TRAIL;
          ctx.lineTo(projX[base + idx], projY[base + idx]);
        }
        ctx.stroke();
      }

      ctx.globalAlpha = 1.0;
    },

    /** Called whenever the canvas is resized. State arrays stay valid — only
     *  the projection math changes via W/H passed into frame(). */
    resize(_W, _H) {},

    /** Cancel any pending async warm-up timers. */
    destroy() {
      asyncTimers.forEach(clearTimeout);
      asyncTimers = [];
    },
  };
}
