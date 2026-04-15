// Thomas attractor — WebGL2 renderer.
// Simulation still runs in JS (it's ~0.5 ms/frame — not the bottleneck).
// The win is moving projection + styling + rasterization from Canvas 2D (2200
// stroke() calls, 2200 state flushes) to a single GPU drawcall.
//
// Interface: createThomasWebGL() → { init, frame, resize, destroy } | null
//   Returns null if WebGL2 isn't available so the caller can fall back.
//
// Storage layout is age-major:
//   positions[(age * N + i) * 3 + k]
//   age 0  = newest point on the trail
//   age T-1 = oldest point on the trail
// Each frame: copyWithin shifts age 0..T-2 → 1..T-1, then we simulate and
// write the new point at age 0. A single Float32Array memcpy (copyWithin) is
// much cheaper than a per-particle ring-buffer head.

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

const VERT_SRC = `#version 300 es
precision highp float;

in vec3 aPos;

uniform int   uN;
uniform float uCa, uSa, uCe, uSe;
uniform float uXScale, uYScale;
uniform sampler2D uPData; // R=hue/360, G=speed (0..1)

flat out float vHue;
flat out float vSpd;

void main() {
  // Same camera math as the Canvas 2D version, expressed in clip space:
  //   projX = W/2 + x1 * (H/11)   →   clipX = x1 * (2H / 11W)
  //   projY = H/2 - y2 * (H/11)   →   clipY = y2 * (2/11)
  float x1 = aPos.x * uCa + aPos.z * uSa;
  float y2 = aPos.y * uCe - (-aPos.x * uSa + aPos.z * uCa) * uSe;
  gl_Position = vec4(x1 * uXScale, y2 * uYScale, 0.0, 1.0);

  // All 14 vertices of a given particle share hue/speed. Layout is age-major,
  // so (gl_VertexID % N) is the particle index.
  int pIdx = gl_VertexID - (gl_VertexID / uN) * uN;
  vec2 pd = texelFetch(uPData, ivec2(pIdx, 0), 0).rg;
  vHue = pd.r;
  vSpd = pd.g;
}
`;

const FRAG_SRC = `#version 300 es
precision highp float;

flat in float vHue;
flat in float vSpd;

uniform float uLitBase;
uniform float uLitSpd;

out vec4 fragColor;

// HSL→RGB (hue in [0,1], s/l in [0,1]). Branchless, standard formulation.
vec3 hsl2rgb(float h, float s, float l) {
  vec3 k = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  float c = (1.0 - abs(2.0 * l - 1.0)) * s;
  return l + c * (k - 0.5);
}

void main() {
  // Mirror the Canvas 2D color logic:
  //   hue  = hueBase + spd * 50       (out of 360)
  //   lit  = litBase + spd * litSpd   (out of 100)
  //   alpha = 0.55 + spd * 0.25
  float hue = vHue + vSpd * (50.0 / 360.0);
  float lit = (uLitBase + vSpd * uLitSpd) / 100.0;
  float alpha = 0.55 + vSpd * 0.25;
  vec3 rgb = hsl2rgb(hue, 0.75, lit);
  fragColor = vec4(rgb, alpha);
}
`;

function compileShader(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error("shader compile failed: " + log);
  }
  return sh;
}

function linkProgram(gl, vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(p);
    gl.deleteProgram(p);
    throw new Error("program link failed: " + log);
  }
  return p;
}

export function createThomasWebGL() {
  let N = 2200;
  let gl = null;
  let program, vao, posVBO, idxEBO, pDataTex;
  let uLoc = {};
  let positions;       // Float32Array, age-major, size TRAIL*N*3
  let hueBase;         // Float32Array, size N — base hue per particle, 0..1
  let pData;           // Float32Array, size N*2 — (hue, spd) packed RG
  let asyncTimers = [];
  let fpsFrames = 0, fpsStart = 0, adapted = false;

  function tryGetContext(canvas) {
    const opts = { alpha: false, antialias: true, premultipliedAlpha: false,
                   preserveDrawingBuffer: false, powerPreference: "high-performance" };
    const ctx = canvas.getContext("webgl2", opts);
    if (!ctx) return null;
    // Need float textures to store per-particle data.
    if (!ctx.getExtension("EXT_color_buffer_float")) {
      // Not strictly needed for sampling, but RG32F textures sometimes require it.
      // We only SAMPLE the texture, never render to it, so this is usually optional.
    }
    return ctx;
  }

  function allocCPU() {
    positions = new Float32Array(TRAIL * N * 3);
    hueBase   = new Float32Array(N);
    pData     = new Float32Array(N * 2);
  }

  function seedParticles(warmSteps) {
    for (let i = 0; i < N; i++) {
      let x = (Math.random() - 0.5) * 4;
      let y = (Math.random() - 0.5) * 4;
      let z = (Math.random() - 0.5) * 4;
      [x, y, z] = stepParticle(x, y, z, warmSteps);
      for (let t = 0; t < TRAIL; t++) {
        const off = (t * N + i) * 3;
        positions[off] = x; positions[off + 1] = y; positions[off + 2] = z;
      }
      // Blue → purple band matching the original.
      hueBase[i] = (180 + ((Math.random() * 130) | 0)) / 360;
      pData[i * 2]     = hueBase[i];
      pData[i * 2 + 1] = 0;
    }
  }

  // Finish convergence off the critical path.
  function warmUpAsync() {
    const EXTRA = 500;
    const BATCH = 300;
    let cursor = 0;
    function chunk() {
      const end = Math.min(cursor + BATCH, N);
      for (let i = cursor; i < end; i++) {
        // Read current newest (age 0), integrate EXTRA steps, fill all trail slots.
        const idx0 = i * 3;
        let x = positions[idx0], y = positions[idx0 + 1], z = positions[idx0 + 2];
        [x, y, z] = stepParticle(x, y, z, EXTRA);
        for (let t = 0; t < TRAIL; t++) {
          const off = (t * N + i) * 3;
          positions[off] = x; positions[off + 1] = y; positions[off + 2] = z;
        }
      }
      cursor = end;
      if (cursor < N) asyncTimers.push(setTimeout(chunk, 0));
    }
    asyncTimers.push(setTimeout(chunk, 0));
  }

  function buildGPU() {
    // --- Program ---
    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    program = linkProgram(gl, vs, fs);
    gl.deleteShader(vs); gl.deleteShader(fs);

    uLoc = {
      uN:       gl.getUniformLocation(program, "uN"),
      uCa:      gl.getUniformLocation(program, "uCa"),
      uSa:      gl.getUniformLocation(program, "uSa"),
      uCe:      gl.getUniformLocation(program, "uCe"),
      uSe:      gl.getUniformLocation(program, "uSe"),
      uXScale:  gl.getUniformLocation(program, "uXScale"),
      uYScale:  gl.getUniformLocation(program, "uYScale"),
      uPData:   gl.getUniformLocation(program, "uPData"),
      uLitBase: gl.getUniformLocation(program, "uLitBase"),
      uLitSpd:  gl.getUniformLocation(program, "uLitSpd"),
    };

    const aPosLoc = gl.getAttribLocation(program, "aPos");

    // --- VAO + VBO + EBO ---
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    posVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posVBO);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(aPosLoc, 3, gl.FLOAT, false, 0, 0);

    idxEBO = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxEBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buildIndices(), gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    // --- Per-particle data texture (RG32F, N × 1) ---
    pDataTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, pDataTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, N, 1, 0, gl.RG, gl.FLOAT, pData);
  }

  function buildIndices() {
    // For each particle: (TRAIL - 1) line segments connecting consecutive ages.
    // Age-major layout → vertex index of (age t, particle i) = t * N + i.
    // Max index = (TRAIL - 1) * N + (N - 1) — fits in uint16 while N*TRAIL < 65536.
    // At N = 2200, TRAIL = 14 → max = 30,799. ✓
    const perP = (TRAIL - 1) * 2;
    const idx = new Uint16Array(N * perP);
    let w = 0;
    for (let i = 0; i < N; i++) {
      for (let t = 0; t < TRAIL - 1; t++) {
        idx[w++] = t * N + i;
        idx[w++] = (t + 1) * N + i;
      }
    }
    return idx;
  }

  function rebuildBuffers() {
    // Called after N changes (adaptive quality). Reupload VBO/EBO + texture.
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, posVBO);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxEBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buildIndices(), gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    gl.bindTexture(gl.TEXTURE_2D, pDataTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, N, 1, 0, gl.RG, gl.FLOAT, pData);
  }

  return {
    init(canvas) {
      gl = tryGetContext(canvas);
      if (!gl) return false;
      try {
        allocCPU();
        seedParticles(100);
        buildGPU();
        warmUpAsync();
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        return true;
      } catch (e) {
        console.warn("WebGL init failed, falling back:", e);
        gl = null;
        return false;
      }
    },

    frame(_ctx, W, H, az, el, colors) {
      if (!gl) return;

      // Adaptive quality: sample 90 frames; halve-ish N if FPS < 38.
      if (!adapted) {
        if (fpsFrames === 0) fpsStart = performance.now();
        fpsFrames++;
        if (fpsFrames === 90) {
          const fps = 90000 / (performance.now() - fpsStart);
          if (fps < 38) {
            N = Math.max(600, (N * 0.55) | 0);
            allocCPU();
            seedParticles(100);
            rebuildBuffers();
            warmUpAsync();
          }
          adapted = true;
        }
      }

      // --- Simulation (CPU) -------------------------------------------------
      // Shift the trail: age 0..T-2 → age 1..T-1. Single memcpy.
      positions.copyWithin(N * 3, 0, (TRAIL - 1) * N * 3);

      // Integrate one step for each particle; write new point at age 0.
      // Compute per-particle speed from (newest - oldest) world distance squared.
      for (let i = 0; i < N; i++) {
        const prev = (N + i) * 3;              // previous newest, now at age 1
        const x = positions[prev], y = positions[prev + 1], z = positions[prev + 2];
        const nx = x + (Math.sin(y) - B * x) * DT;
        const ny = y + (Math.sin(z) - B * y) * DT;
        const nz = z + (Math.sin(x) - B * z) * DT;

        const newest = i * 3;
        positions[newest]     = nx;
        positions[newest + 1] = ny;
        positions[newest + 2] = nz;

        const oldest = ((TRAIL - 1) * N + i) * 3;
        const dx = nx - positions[oldest];
        const dy = ny - positions[oldest + 1];
        const dz = nz - positions[oldest + 2];
        // Empirically calibrated to match the original's (2D projected delta²
        // × 0.00015) scaling at the default viewport. Clamp to [0, 1].
        let spd = (dx * dx + dy * dy + dz * dz) * 0.85;
        if (spd > 1) spd = 1;

        pData[i * 2]     = hueBase[i];
        pData[i * 2 + 1] = spd;
      }

      // --- Upload (GPU) -----------------------------------------------------
      gl.bindBuffer(gl.ARRAY_BUFFER, posVBO);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);

      gl.bindTexture(gl.TEXTURE_2D, pDataTex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, N, 1, gl.RG, gl.FLOAT, pData);

      // --- Draw -------------------------------------------------------------
      // Clear to bg color. colors.bg is "r,g,b" in 0..255.
      const bgParts = colors.bg.split(",");
      gl.clearColor(+bgParts[0] / 255, +bgParts[1] / 255, +bgParts[2] / 255, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.bindVertexArray(vao);

      gl.uniform1i(uLoc.uN, N);
      gl.uniform1f(uLoc.uCa, Math.cos(az));
      gl.uniform1f(uLoc.uSa, Math.sin(az));
      gl.uniform1f(uLoc.uCe, Math.cos(el));
      gl.uniform1f(uLoc.uSe, Math.sin(el));
      gl.uniform1f(uLoc.uXScale, (2 * H) / (11 * W));
      gl.uniform1f(uLoc.uYScale, 2 / 11);
      gl.uniform1f(uLoc.uLitBase, colors.litBase);
      gl.uniform1f(uLoc.uLitSpd,  colors.litSpd);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, pDataTex);
      gl.uniform1i(uLoc.uPData, 0);

      gl.drawElements(gl.LINES, N * (TRAIL - 1) * 2, gl.UNSIGNED_SHORT, 0);

      gl.bindVertexArray(null);
    },

    resize() {
      if (!gl) return;
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    },

    destroy() {
      asyncTimers.forEach(clearTimeout);
      asyncTimers = [];
      if (!gl) return;
      gl.deleteBuffer(posVBO);
      gl.deleteBuffer(idxEBO);
      gl.deleteVertexArray(vao);
      gl.deleteTexture(pDataTex);
      gl.deleteProgram(program);
      gl = null;
    },
  };
}
