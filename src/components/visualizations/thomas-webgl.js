// Thomas attractor — WebGL2 renderer with FBO ping-pong GPU simulation.
//
// Previous version: CPU simulation loop + ~360 KB bufferSubData every frame.
// This version: simulation runs entirely on GPU via two RGBA32F ping-pong textures
// (N×TRAIL each). Each frame, a sim pass writes new positions into the idle texture;
// the draw pass reads from that texture via texelFetch (no position VBO at all).
// Per-particle hue lives in a static R32F texture (N×1), written once.
// Speed is stored in the alpha channel of the age-0 row of the position texture.
//
// Interface: createThomasWebGL() → { init, setColors, frame, resize, destroy }

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

// Simulation pass: renders an N×TRAIL quad; each fragment = one (particle, age) cell.
// age 0: integrate Thomas attractor step, compute speed → store in alpha.
// age > 0: copy old age-1 (trail shift).
const SIM_VERT = `#version 300 es
void main() {
  const vec2 p[3] = vec2[3](vec2(-1.,-1.), vec2(3.,-1.), vec2(-1.,3.));
  gl_Position = vec4(p[gl_VertexID], 0., 1.);
}`;

const SIM_FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uOldPos;
const float DT  = ${DT.toFixed(4)};
const float B   = ${B.toFixed(4)};
const int   TM2 = ${TRAIL - 2};
out vec4 fragColor;
void main() {
  ivec2 c        = ivec2(gl_FragCoord.xy);
  int   particle = c.x;
  int   age      = c.y;
  if (age == 0) {
    vec3  p  = texelFetch(uOldPos, c, 0).xyz;
    float nx = p.x + (sin(p.y) - B * p.x) * DT;
    float ny = p.y + (sin(p.z) - B * p.y) * DT;
    float nz = p.z + (sin(p.x) - B * p.z) * DT;
    // Speed: dist² from new pos to soon-to-be-oldest (old age TM2 → new age TRAIL-1)
    vec3  o  = texelFetch(uOldPos, ivec2(particle, TM2), 0).xyz;
    vec3  d  = vec3(nx, ny, nz) - o;
    fragColor = vec4(nx, ny, nz, clamp(dot(d, d) * 0.85, 0., 1.));
  } else {
    // Trail shift: new age t ← old age t-1
    fragColor = texelFetch(uOldPos, ivec2(particle, age - 1), 0);
  }
}`;

// Draw pass: no position VBO. gl_VertexID (from EBO) encodes age*N+particle;
// vertex shader decodes and fetches from the position texture.
const DRAW_VERT = `#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uPosTex;   // N×TRAIL RGBA32F: xyz=pos, a=speed (age-0 row only)
uniform sampler2D uHueTex;   // N×1 R32F: per-particle base hue
uniform int   uN;
uniform float uCa, uSa, uCe, uSe, uXScale, uYScale;
flat out float vHue;
flat out float vSpd;
void main() {
  int age = gl_VertexID / uN;
  int par = gl_VertexID - age * uN;
  vec3  pos = texelFetch(uPosTex, ivec2(par, age), 0).xyz;
  float x1  = pos.x * uCa + pos.z * uSa;
  float y2  = pos.y * uCe - (-pos.x * uSa + pos.z * uCa) * uSe;
  gl_Position = vec4(x1 * uXScale, y2 * uYScale, 0., 1.);
  vHue = texelFetch(uHueTex, ivec2(par, 0), 0).r;
  vSpd = texelFetch(uPosTex, ivec2(par, 0), 0).a;
}`;

const DRAW_FRAG = `#version 300 es
precision highp float;
flat in float vHue;
flat in float vSpd;
uniform float uLitBase;
uniform float uLitSpd;
out vec4 fragColor;
vec3 hsl2rgb(float h, float s, float l) {
  vec3  k = clamp(abs(mod(h * 6. + vec3(0., 4., 2.), 6.) - 3.) - 1., 0., 1.);
  float c = (1. - abs(2. * l - 1.)) * s;
  return l + c * (k - 0.5);
}
void main() {
  float hue   = vHue + vSpd * (50. / 360.);
  float lit   = (uLitBase + vSpd * uLitSpd) / 100.;
  float alpha = 0.55 + vSpd * 0.25;
  fragColor   = vec4(hsl2rgb(hue, 0.75, lit), alpha);
}`;

function compileShader(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error("shader: " + log);
  }
  return sh;
}

function linkProgram(gl, vSrc, fSrc) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fSrc);
  const p  = gl.createProgram();
  gl.attachShader(p, vs); gl.attachShader(p, fs);
  gl.linkProgram(p);
  gl.deleteShader(vs); gl.deleteShader(fs);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(p);
    gl.deleteProgram(p);
    throw new Error("link: " + log);
  }
  return p;
}

export function createThomasWebGL() {
  let N = 2200;
  let gl = null;
  let simProg, drawProg;
  let simULoc = {}, drawULoc = {};
  let posTex = [null, null];   // ping-pong RGBA32F N×TRAIL textures
  let fbo    = [null, null];   // one FBO per texture
  let hueTex = null;           // static R32F N×1 hue texture
  let drawVAO = null, idxEBO = null;
  let ping = 0;                // index of the texture currently holding the latest frame

  // Cached color state — only re-upload uniforms when these change.
  let bgR = 0, bgG = 0, bgB = 0;
  let litBase = 42, litSpd = 32;
  let colorDirty = true;       // litBase/litSpd need uploading to draw shader

  let fpsFrames = 0, fpsStart = 0, adapted = false;

  function tryGetContext(canvas) {
    const ctx = canvas.getContext("webgl2", {
      alpha: false, antialias: true, premultipliedAlpha: false,
      preserveDrawingBuffer: false, powerPreference: "high-performance",
    });
    if (!ctx) return null;
    // RGBA32F must be renderable for the FBO sim pass.
    if (!ctx.getExtension("EXT_color_buffer_float")) return null;
    return ctx;
  }

  function makePosTex(data) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, N, TRAIL, 0, gl.RGBA, gl.FLOAT, data || null);
    return t;
  }

  function makeFBO(tex) {
    const f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (status !== gl.FRAMEBUFFER_COMPLETE) throw new Error("FBO incomplete: " + status);
    return f;
  }

  function buildIndices() {
    // age-major layout: vertex (age t, particle i) = index t*N+i.
    // Max index = (TRAIL-1)*N + N-1 = 30799 at N=2200 — fits Uint16.
    const perP = (TRAIL - 1) * 2;
    const idx  = new Uint16Array(N * perP);
    let w = 0;
    for (let i = 0; i < N; i++)
      for (let t = 0; t < TRAIL - 1; t++) {
        idx[w++] = t * N + i;
        idx[w++] = (t + 1) * N + i;
      }
    return idx;
  }

  function seedAndUpload(warmSteps) {
    const posData = new Float32Array(TRAIL * N * 4);  // RGBA32F, age-major
    const hueData = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      let x = (Math.random() - 0.5) * 4;
      let y = (Math.random() - 0.5) * 4;
      let z = (Math.random() - 0.5) * 4;
      [x, y, z] = stepParticle(x, y, z, warmSteps);
      for (let t = 0; t < TRAIL; t++) {
        const off = (t * N + i) * 4;
        posData[off] = x; posData[off + 1] = y; posData[off + 2] = z; // alpha = 0 (speed)
      }
      hueData[i] = (180 + ((Math.random() * 130) | 0)) / 360;
    }

    gl.bindTexture(gl.TEXTURE_2D, posTex[ping]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, N, TRAIL, 0, gl.RGBA, gl.FLOAT, posData);

    gl.bindTexture(gl.TEXTURE_2D, hueTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, N, 1, 0, gl.RED, gl.FLOAT, hueData);
  }

  // Run `count` simulation steps entirely on GPU via FBO ping-pong.
  function simulate(count) {
    gl.useProgram(simProg);
    gl.disable(gl.BLEND);
    gl.viewport(0, 0, N, TRAIL);
    gl.bindVertexArray(null);
    gl.uniform1i(simULoc.uOldPos, 0);

    for (let i = 0; i < count; i++) {
      const dst = 1 - ping;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[dst]);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, posTex[ping]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      ping = dst;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function buildGPU() {
    simProg  = linkProgram(gl, SIM_VERT, SIM_FRAG);
    drawProg = linkProgram(gl, DRAW_VERT, DRAW_FRAG);

    simULoc = { uOldPos: gl.getUniformLocation(simProg, "uOldPos") };

    drawULoc = {
      uN:       gl.getUniformLocation(drawProg, "uN"),
      uPosTex:  gl.getUniformLocation(drawProg, "uPosTex"),
      uHueTex:  gl.getUniformLocation(drawProg, "uHueTex"),
      uCa:      gl.getUniformLocation(drawProg, "uCa"),
      uSa:      gl.getUniformLocation(drawProg, "uSa"),
      uCe:      gl.getUniformLocation(drawProg, "uCe"),
      uSe:      gl.getUniformLocation(drawProg, "uSe"),
      uXScale:  gl.getUniformLocation(drawProg, "uXScale"),
      uYScale:  gl.getUniformLocation(drawProg, "uYScale"),
      uLitBase: gl.getUniformLocation(drawProg, "uLitBase"),
      uLitSpd:  gl.getUniformLocation(drawProg, "uLitSpd"),
    };

    posTex[0] = makePosTex(null);
    posTex[1] = makePosTex(null);
    fbo[0]    = makeFBO(posTex[0]);
    fbo[1]    = makeFBO(posTex[1]);

    // Static hue texture — data uploaded in seedAndUpload().
    hueTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, hueTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Draw VAO: only an EBO (positions come from texelFetch in vertex shader).
    drawVAO = gl.createVertexArray();
    gl.bindVertexArray(drawVAO);
    idxEBO = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxEBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buildIndices(), gl.STATIC_DRAW);
    gl.bindVertexArray(null);
  }

  function rebuildForN() {
    gl.deleteTexture(posTex[0]); gl.deleteTexture(posTex[1]);
    gl.deleteFramebuffer(fbo[0]); gl.deleteFramebuffer(fbo[1]);
    gl.deleteTexture(hueTex);

    posTex[0] = makePosTex(null);
    posTex[1] = makePosTex(null);
    fbo[0]    = makeFBO(posTex[0]);
    fbo[1]    = makeFBO(posTex[1]);

    hueTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, hueTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindVertexArray(drawVAO);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxEBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buildIndices(), gl.STATIC_DRAW);
    gl.bindVertexArray(null);

    ping = 0;
    seedAndUpload(100);
    simulate(600);
    colorDirty = true;
  }

  return {
    init(canvas) {
      gl = tryGetContext(canvas);
      if (!gl) return false;
      try {
        buildGPU();
        ping = 0;
        seedAndUpload(100);
        // GPU warm-up: 600 sim passes replaces the async JS warm-up.
        // These queue immediately and complete before the first rAF fires.
        simulate(600);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        colorDirty = true;
        return true;
      } catch (e) {
        console.warn("WebGL init failed, falling back:", e);
        gl = null;
        return false;
      }
    },

    // Call once at init and whenever data-theme changes (MutationObserver in Home.jsx).
    // Parses bg color once instead of every frame.
    setColors(colors) {
      const parts = colors.bg.split(",");
      bgR = +parts[0] / 255; bgG = +parts[1] / 255; bgB = +parts[2] / 255;
      litBase = colors.litBase;
      litSpd  = colors.litSpd;
      colorDirty = true;
    },

    frame(_ctx, W, H, az, el) {
      if (!gl) return;

      // Adaptive quality: sample 90 frames; halve N if FPS < 38.
      if (!adapted) {
        if (fpsFrames === 0) fpsStart = performance.now();
        if (++fpsFrames === 90) {
          const fps = 90000 / (performance.now() - fpsStart);
          if (fps < 38) {
            N = Math.max(600, (N * 0.55) | 0);
            rebuildForN();
          }
          adapted = true;
        }
      }

      // --- GPU simulation pass (replaces JS loop + bufferSubData) ---
      simulate(1);

      // --- Draw pass ---
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clearColor(bgR, bgG, bgB, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(drawProg);
      gl.enable(gl.BLEND);
      gl.bindVertexArray(drawVAO);

      // Static uniforms: only upload when N or colors change (rare).
      if (colorDirty) {
        gl.uniform1i(drawULoc.uN,       N);
        gl.uniform1i(drawULoc.uPosTex,  0);
        gl.uniform1i(drawULoc.uHueTex,  1);
        gl.uniform1f(drawULoc.uLitBase, litBase);
        gl.uniform1f(drawULoc.uLitSpd,  litSpd);
        colorDirty = false;
      }

      // Per-frame uniforms (camera eases continuously).
      gl.uniform1f(drawULoc.uCa, Math.cos(az));
      gl.uniform1f(drawULoc.uSa, Math.sin(az));
      gl.uniform1f(drawULoc.uCe, Math.cos(el));
      gl.uniform1f(drawULoc.uSe, Math.sin(el));
      gl.uniform1f(drawULoc.uXScale, (2 * H) / (11 * W));
      gl.uniform1f(drawULoc.uYScale,  2 / 11);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, posTex[ping]);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, hueTex);

      gl.drawElements(gl.LINES, N * (TRAIL - 1) * 2, gl.UNSIGNED_SHORT, 0);

      gl.bindVertexArray(null);
    },

    resize() {
      // Viewport is set per-frame before drawing.
    },

    destroy() {
      if (!gl) return;
      gl.deleteTexture(posTex[0]); gl.deleteTexture(posTex[1]);
      gl.deleteFramebuffer(fbo[0]); gl.deleteFramebuffer(fbo[1]);
      gl.deleteTexture(hueTex);
      gl.deleteBuffer(idxEBO);
      gl.deleteVertexArray(drawVAO);
      gl.deleteProgram(simProg);
      gl.deleteProgram(drawProg);
      gl = null;
    },
  };
}
