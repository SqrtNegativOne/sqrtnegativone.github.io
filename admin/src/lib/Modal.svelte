<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    subtitle?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
    open?: boolean;
    onclose: () => void;
    children: Snippet;
    footer?: Snippet;
  }

  let {
    title,
    subtitle,
    maxWidth = 'lg',
    open = true,
    onclose,
    children,
    footer
  }: Props = $props();

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl'
  };

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onclose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onclose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    onclick={handleBackdropClick}
  >
    <div
      class="bg-[oklch(0.2103_0.0059_285.89)] border border-[oklch(0.2739_0.0055_286.03)] rounded-xl shadow-2xl w-full {maxWidthClasses[maxWidth]} max-h-[90vh] flex flex-col overflow-hidden"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-[oklch(0.2739_0.0055_286.03)] flex justify-between items-center bg-[oklch(0.1803_0.0059_285.89)]">
        <div>
          <h2 class="text-xl font-semibold text-white tracking-tight">{title}</h2>
          {#if subtitle}
            <p class="text-xs text-[oklch(0.7107_0.0351_256.79)] mt-0.5">{subtitle}</p>
          {/if}
        </div>
        <button
          type="button"
          aria-label="Close modal"
          onclick={onclose}
          class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        {@render children()}
      </div>

      <!-- Footer -->
      {#if footer}
        <div class="px-6 py-4 border-t border-[oklch(0.2739_0.0055_286.03)] flex justify-end items-center gap-3 bg-[oklch(0.1803_0.0059_285.89)]">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}
