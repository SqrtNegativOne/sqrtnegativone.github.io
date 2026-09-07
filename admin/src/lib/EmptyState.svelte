<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    message?: string;
    actionLabel?: string;
    onaction?: () => void;
    icon?: Snippet;
    children?: Snippet;
  }

  let { title, message, actionLabel, onaction, icon, children }: Props = $props();
</script>

<div class="card p-12 text-center border-dashed border-[oklch(0.2739_0.0055_286.03)] flex flex-col items-center justify-center">
  {#if icon}
    <div class="mb-4 text-[oklch(0.7107_0.0351_256.79)] opacity-60">
      {@render icon()}
    </div>
  {:else}
    <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
      </svg>
    </div>
  {/if}

  <h3 class="text-lg font-semibold text-white mb-1">{title}</h3>
  {#if message}
    <p class="text-sm text-[oklch(0.7107_0.0351_256.79)] max-w-sm mb-4">{message}</p>
  {/if}

  {#if actionLabel && onaction}
    <button
      type="button"
      onclick={onaction}
      class="btn-primary text-sm flex items-center gap-2 cursor-pointer mt-2"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
      <span>{actionLabel}</span>
    </button>
  {/if}

  {#if children}
    {@render children()}
  {/if}
</div>
