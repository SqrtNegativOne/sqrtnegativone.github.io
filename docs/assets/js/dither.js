(() => {
  // src/assets/js/dither.js
  (function() {
    const canvas = document.getElementById("dither-bg");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const BAYER = [
      0,
      32,
      8,
      40,
      2,
      34,
      10,
      42,
      48,
      16,
      56,
      24,
      50,
      18,
      58,
      26,
      12,
      44,
      4,
      36,
      14,
      46,
      6,
      38,
      60,
      28,
      52,
      20,
      62,
      30,
      54,
      22,
      3,
      35,
      11,
      43,
      1,
      33,
      9,
      41,
      51,
      19,
      59,
      27,
      49,
      17,
      57,
      25,
      15,
      47,
      7,
      39,
      13,
      45,
      5,
      37,
      63,
      31,
      55,
      23,
      61,
      29,
      53,
      21
    ].map((v) => v / 64);
    const LEVELS = 4;
    const STEP = 255 / (LEVELS - 1);
    const img = new Image();
    img.src = "/assets/images/index/mountain.jpg";
    img.onload = render;
    window.addEventListener("resize", render);
    function drawCover() {
      const W = canvas.width;
      const H = canvas.height;
      const canvasAspect = W / H;
      const imgAspect = img.naturalWidth / img.naturalHeight;
      let sx, sy, sw, sh;
      if (imgAspect > canvasAspect) {
        sh = img.naturalHeight;
        sw = sh * canvasAspect;
        sx = (img.naturalWidth - sw) / 2;
        sy = 0;
      } else {
        sw = img.naturalWidth;
        sh = sw / canvasAspect;
        sx = 0;
        sy = (img.naturalHeight - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
    }
    function render() {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      if (W === 0 || H === 0) return;
      canvas.width = W;
      canvas.height = H;
      drawCover();
      const imageData = ctx.getImageData(0, 0, W, H);
      const d = imageData.data;
      for (let y = 0; y < H; y++) {
        const bayerRow = y % 8 * 8;
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          const threshold = BAYER[bayerRow + x % 8];
          for (let c = 0; c < 3; c++) {
            const norm = d[i + c] / 255 * (LEVELS - 1);
            const lo = Math.floor(norm);
            const frac = norm - lo;
            const q = frac > threshold ? Math.min(lo + 1, LEVELS - 1) : lo;
            d[i + c] = Math.round(q * STEP);
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }
  })();
})();
//# sourceMappingURL=dither.js.map
