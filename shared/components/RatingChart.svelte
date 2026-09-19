<script lang="ts">
  let { rating, expected = false }: { rating: number, expected?: boolean } = $props();
  const uid = $props.id();

  const TILE_ANGLES = [0, 60, 120, 180, 240, 300];
  // Petal outline in local (unrotated) coordinates, shared by every petal.
  const PETAL: [number, number][] = [
    [0, 0], [120, 0], [150, 51.96], [120, 103.92], [60, 103.92]
  ];
  const PETAL_POINTS = PETAL.map(([x, y]) => `${x},${y}`).join(' ');

  // Polar angles of the petal's two upper outer vertices. Knowing them lets the
  // half-filled petal be cut exactly on the petal boundary, so the filled part
  // gets the same solid outline + fill as a fully-filled petal (and the dim
  // dashed ghost underneath is completely covered instead of bleeding through).
  const ANGLE_V2 = Math.atan2(51.96, 150);
  const ANGLE_V3 = Math.atan2(103.92, 120);

  // Empty petals stay neutral grey so the filled ones carry all the colour.
  const GHOST_STROKE = 'oklch(0.6363 0.0133 286.02)';

  // Rating palette as oklch anchors [rating, L, C, H]. Interpolating between
  // them keeps the exact same colours at every half step while giving
  // fractional ratings (1.6, 4.8, 5.4, 5.8, …) a colour of their own instead of
  // snapping down to the band below.
  const RAMP: [number, number, number, number][] = [
    [1.0, 0.500, 0.204, 28.59], [1.5, 0.530, 0.192, 32.18],
    [2.0, 0.560, 0.176, 37.70], [2.5, 0.590, 0.150, 48.38],
    [3.0, 0.620, 0.131, 63.37], [3.5, 0.650, 0.117, 75.82],
    [4.0, 0.680, 0.110, 90.66], [4.5, 0.710, 0.115, 106.32],
    [5.0, 0.740, 0.127, 119.15], [5.5, 0.770, 0.138, 124.73],
    [6.0, 0.800, 0.151, 129.59], [6.5, 0.830, 0.155, 143.11],
    [7.0, 0.860, 0.150, 151.90]
  ];

  let color = $derived.by(() => {
    const r = Math.max(1, Math.min(7, rating));
    let i = 0;
    while (i < RAMP.length - 2 && r > RAMP[i + 1][0]) i++;
    const a = RAMP[i];
    const b = RAMP[i + 1];
    const t = (r - a[0]) / (b[0] - a[0]);
    const lerp = (x: number, y: number) => (x + (y - x) * t).toFixed(4);
    return `oklch(${lerp(a[1], b[1])} ${lerp(a[2], b[2])} ${lerp(a[3], b[3])})`;
  });

  // Rating 1 corresponds to 0 filled petals; rating 7 fills all 6.
  let total = $derived(Math.max(0, Math.min(6, rating - 1)));
  let full = $derived(Math.floor(total + 1e-9));
  let partial = $derived(total - full);
  let hasPartial = $derived(partial > 0.02);

  // Outline of the filled wedge: origin → the outer vertices it reaches → the
  // point where the radial cut leaves the petal. Traced on the real boundary so
  // no clipPath (and no half-width strokes) is needed.
  let partialPoints = $derived.by(() => {
    if (!hasPartial) return '';
    const theta = (partial * Math.PI) / 3;
    const dir: [number, number] = [Math.cos(theta), Math.sin(theta)];
    const pts: [number, number][] = [PETAL[0], PETAL[1]];
    if (theta >= ANGLE_V2) pts.push(PETAL[2]);
    if (theta >= ANGLE_V3) pts.push(PETAL[3]);
    pts.push(intersectRay(dir, pts[pts.length - 1], PETAL[pts.length]));
    return pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  });

  function intersectRay(
    dir: [number, number],
    p: [number, number],
    q: [number, number]
  ): [number, number] {
    const ex = q[0] - p[0];
    const ey = q[1] - p[1];
    const s = (-p[0] * ey + ex * p[1]) / (ex * dir[1] - dir[0] * ey);
    return [s * dir[0], s * dir[1]];
  }
</script>

<div class="flex items-center">
  <div
    class="relative w-[44px] h-[44px] flex items-center justify-center shrink-0"
    role="img"
    aria-label="{expected ? 'Expected rating' : 'Rating'} {rating} out of 7"
  >
    <svg class="w-full h-full" style="color: {color}" viewBox="-162 -162 324 324" fill="none" shape-rendering="geometricPrecision">
      <defs>
        <!-- Charge runs from the base out to the tip, so a filled petal reads as
             "lit up" instead of an even 15% wash that goes muddy on dark. -->
        <linearGradient id="{uid}-fill" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="150" y2="51.96">
          <stop offset="0%" stop-color="currentColor" stop-opacity="0.20" />
          <stop offset="60%" stop-color="currentColor" stop-opacity="0.28" />
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.42" />
        </linearGradient>
        {#if expected}
          <!-- Anticipated ratings are hatched instead of filled. The -angle
               counter-rotation keeps every petal's lines parallel in screen
               space rather than fanning around the centre. -->
          {#each TILE_ANGLES as angle, i}
            <pattern
              id="{uid}-hatch-{i}"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate({45 - angle})"
            >
              <line x1="0" y1="0" x2="0" y2="30" stroke="currentColor" stroke-width="5" opacity="0.8" />
            </pattern>
          {/each}
        {/if}
      </defs>
      <g stroke-linejoin="round" stroke-linecap="round">
        {#each TILE_ANGLES as angle, i}
          {@const isFull = i < full}
          {@const isPartial = i === full && hasPartial}
          {@const paint = expected ? `url(#${uid}-hatch-${i})` : `url(#${uid}-fill)`}
          <g transform="rotate({angle})">
            {#if isPartial}
              <!-- dashed ghost of the whole petal; the solid wedge covers the filled half -->
              <polygon points={PETAL_POINTS} fill="none" stroke={GHOST_STROKE} stroke-width="4" stroke-dasharray="10 8" opacity="0.4" />
              <!-- two stacked wide strokes = cheap bloom, no SVG filter needed -->
              <polygon points={partialPoints} fill="none" stroke="currentColor" stroke-width="14" opacity="0.10" />
              <polygon points={partialPoints} fill="none" stroke="currentColor" stroke-width="7" opacity="0.12" />
              <polygon points={partialPoints} fill={paint} stroke="currentColor" stroke-width="5" stroke-dasharray={expected ? '12 7' : undefined} />
            {:else if isFull}
              <polygon points={PETAL_POINTS} fill="none" stroke="currentColor" stroke-width="14" opacity="0.10" />
              <polygon points={PETAL_POINTS} fill="none" stroke="currentColor" stroke-width="7" opacity="0.12" />
              <polygon points={PETAL_POINTS} fill={paint} stroke="currentColor" stroke-width="5" stroke-dasharray={expected ? '12 7' : undefined} />
            {:else}
              <polygon points={PETAL_POINTS} fill="none" stroke={GHOST_STROKE} stroke-width="4" stroke-dasharray="10 8" opacity="0.4" />
            {/if}
          </g>
        {/each}
      </g>
    </svg>
  </div>
</div>
