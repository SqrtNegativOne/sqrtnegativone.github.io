<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let { url, onclose }: { url: string; onclose: () => void } = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onclose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="fixed inset-0 bg-black/95 z-[80] flex items-center justify-center p-5"
  role="dialog"
  aria-modal="true"
  data-modal="true"
  tabindex="-1"
  onclick={onclose}
  transition:fade={{ duration: 150 }}
>
  <button
    type="button"
    aria-label="Close poster"
    class="fixed top-4 right-4 text-[oklch(0.6363_0.0133_286.02)] hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
    onclick={(e) => { e.stopPropagation(); onclose(); }}
  >
    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
  </button>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <img
    src={url}
    alt="Full poster"
    class="max-w-full max-h-full object-contain shadow-2xl shadow-black/60"
    onclick={(e) => e.stopPropagation()}
    transition:scale={{ start: 0.95, duration: 150, easing: cubicOut }}
  />
</div>
