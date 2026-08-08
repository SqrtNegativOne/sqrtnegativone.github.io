<script lang="ts">
  let { rating } = $props<{ rating: number }>();
  let percent = $derived((rating / 7) * 100);
  let colorHex = $derived(rating > 4 ? 'oklch(0.7729 0.1535 163.22)' : rating === 4 ? 'oklch(0.7137 0.1434 254.62)' : 'oklch(0.7106 0.1661 22.22)');
  let bgHex = $derived(rating > 4 ? 'oklch(0.7729 0.1535 163.22 / 0.2)' : rating === 4 ? 'oklch(0.7137 0.1434 254.62 / 0.2)' : 'oklch(0.7106 0.1661 22.22 / 0.2)');
</script>

<div style="display: flex; align-items: center; gap: 8px;">
  <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
    <svg style="width: 100%; height: 100%; transform: rotate(-90deg);" viewBox="0 0 36 36">
      <path stroke={bgHex} stroke-width="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
      <path stroke={colorHex} stroke-width="4" stroke-dasharray="{percent}, 100" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
    </svg>
  </div>
  <span style="font-weight: 500; font-family: 'IBM Plex Mono', ui-monospace, monospace; font-size: 15px; color: {colorHex}">{rating}</span>
</div>
