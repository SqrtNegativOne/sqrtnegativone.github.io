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

  // Dark and light palette colors (dark = site bg, light = white)
  const DARK  = [18,  18,  18];
  const LIGHT = [255, 255, 255];

  const img = new Image();
  img.src = '/assets/images/index/mountain.jpg';
  img.onload = render;
  window.addEventListener('resize', render);

  function render() {
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    if (W === 0 || H === 0) return;

    canvas.width  = W;
    canvas.height = H;

    // Draw the source image scaled to fill the canvas
    ctx.drawImage(img, 0, 0, W, H);

    // Pull every pixel into a byte array
    const imageData = ctx.getImageData(0, 0, W, H);
    const d = imageData.data;

    for (let y = 0; y < H; y++) {
      const bayerRow = (y % 8) * 8;
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;

        // Perceived luminance (ITU-R BT.601 coefficients)
        const lum = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;

        // Compare luminance against the Bayer threshold for this pixel position
        const col = lum > BAYER[bayerRow + (x % 8)] ? LIGHT : DARK;

        d[i]     = col[0];
        d[i + 1] = col[1];
        d[i + 2] = col[2];
        // alpha stays 255
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }
})();
