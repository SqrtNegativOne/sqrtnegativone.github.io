(function () {
  const canvas = document.getElementById('dither-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Bayer 8×8 ordered dithering matrix, normalized to [0, 1)
  const BAYER = [
     0, 32,  8, 40,  2, 34, 10, 42,
    48, 16, 56, 24, 50, 18, 58, 26,
    12, 44,  4, 36, 14, 46,  6, 38,
    60, 28, 52, 20, 62, 30, 54, 22,
     3, 35, 11, 43,  1, 33,  9, 41,
    51, 19, 59, 27, 49, 17, 57, 25,
    15, 47,  7, 39, 13, 45,  5, 37,
    63, 31, 55, 23, 61, 29, 53, 21,
  ].map(v => v / 64);

  const CELL = 6; // pixel size of each dither cell

  // Mouse position in normalized coords [-inf, inf]; starts off-screen
  let mx = -10, my = -10;
  // Smooth mouse tracking
  let smx = -10, smy = -10;

  document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mx = (e.clientX - rect.left) / rect.width;
    my = (e.clientY - rect.top) / rect.height;
  });

  document.addEventListener('touchmove', e => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mx = (touch.clientX - rect.left) / rect.width;
    my = (touch.clientY - rect.top) / rect.height;
  }, { passive: true });

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Layered sine-wave noise field — organic motion without external libraries
  function fieldValue(nx, ny, t) {
    const v = (
      Math.sin(nx * 6.28 + t * 0.70) * 0.20 +
      Math.sin(ny * 5.50 + t * 0.50) * 0.20 +
      Math.sin((nx + ny) * 4.71 + t * 1.10) * 0.17 +
      Math.sin((nx - ny) * 3.93 + t * 0.35) * 0.15 +
      Math.sin(nx * 11.0 + t * 1.50) * 0.08 +
      Math.sin(ny *  9.4 + t * 1.30) * 0.08 +
      Math.sin((nx * 1.4 - ny * 0.9) * 7.8 + t * 0.90) * 0.07 +
      Math.sin(nx * 15.7 + t * 2.10) * 0.03 +
      Math.sin(ny * 13.4 + t * 1.80) * 0.02
    ) * 0.5 + 0.5; // normalize to [0, 1]

    // Mouse glow: a smooth radial bump that adds density near the cursor
    const dx = nx - smx;
    const dy = ny - smy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const glow = Math.max(0, 1 - dist * 5.0) ** 2 * 0.60;

    return Math.min(1, v + glow);
  }

  // Color palette — kept very dark to stay subtle
  // "off" pixel: site background
  const OFF_R = 18, OFF_G = 18, OFF_B = 18;
  // "on" pixel: a dim cyan-tinted dark, visible but not garish
  const ON_R  = 26, ON_G  = 48, ON_B  = 50;

  let t = 0;

  function draw() {
    t += 0.010;

    // Ease mouse tracking so it trails smoothly
    smx += (mx - smx) * 0.08;
    smy += (my - smy) * 0.08;

    const W  = canvas.width;
    const H  = canvas.height;
    const cw = Math.ceil(W / CELL);
    const ch = Math.ceil(H / CELL);

    const img = ctx.createImageData(W, H);
    const d   = img.data;

    for (let cy = 0; cy < ch; cy++) {
      const ny  = cy / ch;
      const bRow = (cy % 8) * 8;

      for (let cx = 0; cx < cw; cx++) {
        const nx        = cx / cw;
        const threshold = BAYER[bRow + (cx % 8)];
        const on        = fieldValue(nx, ny, t) > threshold;

        const r = on ? ON_R  : OFF_R;
        const g = on ? ON_G  : OFF_G;
        const b = on ? ON_B  : OFF_B;

        // Fill the CELL×CELL block
        const x0 = cx * CELL, y0 = cy * CELL;
        const x1 = Math.min(x0 + CELL, W);
        const y1 = Math.min(y0 + CELL, H);

        for (let py = y0; py < y1; py++) {
          const rowOff = py * W;
          for (let px = x0; px < x1; px++) {
            const i    = (rowOff + px) * 4;
            d[i]       = r;
            d[i + 1]   = g;
            d[i + 2]   = b;
            d[i + 3]   = 255;
          }
        }
      }
    }

    ctx.putImageData(img, 0, 0);
    requestAnimationFrame(draw);
  }

  draw();
})();
