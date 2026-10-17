// Shared rating palette used by both the petal chart and the gallery-card
// border/glow, so every surface that shows a rating uses the exact same colour.

/** Neutral grey used for empty petals and unrated media. */
export const RATING_GHOST = 'oklch(0.6363 0.0133 286.02)';

// Rating palette as oklch anchors [rating, L, C, H]. Interpolating between
// them keeps the exact same colours at every half step while giving fractional
// ratings (0.6, 3.8, 4.4, 4.8, …) a colour of their own instead of snapping
// down to the band below.
const RAMP: [number, number, number, number][] = [
  [0.0, 0.500, 0.204, 28.59], [0.5, 0.530, 0.192, 32.18],
  [1.0, 0.560, 0.176, 37.70], [1.5, 0.590, 0.150, 48.38],
  [2.0, 0.620, 0.131, 63.37], [2.5, 0.650, 0.117, 75.82],
  [3.0, 0.680, 0.110, 90.66], [3.5, 0.710, 0.115, 106.32],
  [4.0, 0.740, 0.127, 119.15], [4.5, 0.770, 0.138, 124.73],
  [5.0, 0.800, 0.151, 129.59], [5.5, 0.830, 0.155, 143.11],
  [6.0, 0.860, 0.150, 151.90]
];

/** Returns the oklch colour for a 0–6 rating (unrated returns the ghost grey). */
export function ratingColor(rating: number | null | undefined): string {
  if (rating == null) return RATING_GHOST;
  const r = Math.max(0, Math.min(6, rating));
  let i = 0;
  while (i < RAMP.length - 2 && r > RAMP[i + 1][0]) i++;
  const a = RAMP[i];
  const b = RAMP[i + 1];
  const t = (r - a[0]) / (b[0] - a[0]);
  const lerp = (x: number, y: number) => (x + (y - x) * t).toFixed(4);
  return `oklch(${lerp(a[1], b[1])} ${lerp(a[2], b[2])} ${lerp(a[3], b[3])})`;
}
