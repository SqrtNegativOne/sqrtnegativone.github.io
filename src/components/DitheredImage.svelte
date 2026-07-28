<script>
  import { onMount } from "svelte";

  export let src = "";
  export let alt = "";
  let className = "";
  export { className as class };

  let canvasRef;
  let loaded = false;

  const BAYER_4x4 = [
    [ 0,  8,  2, 10],
    [12,  4, 14,  6],
    [ 3, 11,  1,  9],
    [15,  7, 13,  5],
  ];

  $effect(() => {
    if (!src || !canvasRef) return;

    loaded = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      const canvas = canvasRef;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const w = canvas.width;
      const h = canvas.height;

      const contrast = 1.4;
      for (let i = 0; i < data.length; i += 4) {
        let gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        gray = Math.max(0, Math.min(255, (gray - 128) * contrast + 128));
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const gray = data[idx];
          const threshold = (BAYER_4x4[y % 4][x % 4] / 16) * 255;
          const newPixel = gray > threshold ? 255 : 0;

          data[idx] = newPixel;
          data[idx + 1] = newPixel;
          data[idx + 2] = newPixel;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      loaded = true;
    };
  });
</script>

<canvas
  bind:this={canvasRef}
  class={className}
  role="img"
  aria-label={alt}
  style="opacity: {loaded ? 1 : 0}; transition: opacity 0.5s ease;"
></canvas>
