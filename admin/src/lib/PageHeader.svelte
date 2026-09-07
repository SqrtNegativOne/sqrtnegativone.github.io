<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    actionLabel?: string;
    onaction?: () => void;
    titleSuffix?: Snippet;
    children?: Snippet;
  }

  let { title, actionLabel, onaction, titleSuffix, children }: Props = $props();
</script>

<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
  <div class="flex items-center gap-3">
    <h1 class="text-3xl font-bold text-white tracking-tight">{title}</h1>
    {#if titleSuffix}
      {@render titleSuffix()}
    {/if}
  </div>

  {#if actionLabel && onaction}
    <button
      type="button"
      onclick={onaction}
      class="btn-primary flex items-center gap-2 cursor-pointer shrink-0"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
      <span>{actionLabel}</span>
    </button>
  {:else if children}
    <div class="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
      {@render children()}
    </div>
  {/if}
</div>
