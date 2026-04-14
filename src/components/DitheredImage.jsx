import { useRef, useEffect, useState } from "react";

/**
 * Renders a portrait with Bayer (ordered) dithering applied via <canvas>.
 *
 * Bayer dithering uses a threshold matrix instead of error diffusion.
 * Each pixel is compared against a position-dependent threshold from
 * a 4×4 Bayer matrix. This produces a regular, crosshatch-like pattern
 * rather than the organic noise of error-diffusion methods.
 *
 * The 4×4 matrix values (0–15) are normalized to [0, 255] and tiled
 * across the image. A pixel brighter than its threshold becomes white;
 * otherwise it becomes black.
 */

// Classic 4×4 Bayer threshold matrix (values 0–15)
const BAYER_4x4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
];

export default function DitheredImage({ src, alt = "", className = "" }) {
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const w = canvas.width;
      const h = canvas.height;

      // Convert to grayscale + boost contrast
      // Contrast multiplier >1 pushes values away from midpoint (128),
      // making the dither pattern more dramatic.
      const contrast = 1.4;
      for (let i = 0; i < data.length; i += 4) {
        let gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        gray = Math.max(0, Math.min(255, (gray - 128) * contrast + 128));
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }

      // Bayer ordered dithering
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const gray = data[idx];
          // Normalize the 4×4 matrix value (0–15) to a threshold in [0, 255]
          const threshold = (BAYER_4x4[y % 4][x % 4] / 16) * 255;
          const newPixel = gray > threshold ? 255 : 0;

          data[idx] = newPixel;
          data[idx + 1] = newPixel;
          data[idx + 2] = newPixel;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setLoaded(true);
    };

    img.onerror = () => {
      console.warn("DitheredImage: Could not load", src);
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label={alt}
      style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.5s ease" }}
    />
  );
}
