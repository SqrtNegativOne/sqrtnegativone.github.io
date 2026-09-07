<script lang="ts">
  import type { Snippet } from 'svelte';
  import FilterSort from '../../../shared/components/FilterSort.svelte';
  import type { FilterRule, SortRule, FilterProperty } from './searchUtils';

  interface Props {
    value?: string;
    placeholder?: string;
    properties?: FilterProperty[];
    filters?: FilterRule[];
    sorts?: SortRule[];
    onnew?: () => void;
    class?: string;
    extra?: Snippet;
  }

  let {
    value = $bindable(''),
    placeholder = '',
    properties = [],
    filters = $bindable([]),
    sorts = $bindable([]),
    onnew,
    class: className = '',
    extra
  }: Props = $props();

  let inputEl: HTMLInputElement | undefined = $state();

  function handleWindowKeydown(e: KeyboardEvent) {
    const activeEl = document.activeElement;
    const isInput =
      activeEl instanceof HTMLInputElement ||
      activeEl instanceof HTMLTextAreaElement ||
      (activeEl as HTMLElement)?.isContentEditable;

    if (e.key === '/' && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      inputEl?.focus();
      inputEl?.select();
      return;
    }

    if ((e.key === 'n' || e.key === 'N') && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (onnew) {
        e.preventDefault();
        onnew();
      }
    }
  }
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<div class="flex items-center gap-3 w-full {className}">
  <div class="relative flex-1">
    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[oklch(0.7107_0.0351_256.79)]">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
    </div>

    <input
      bind:this={inputEl}
      type="text"
      bind:value
      {placeholder}
      class="input-field !pl-10 !pr-10 text-sm"
      style="padding-left: 2.5rem !important; padding-right: 2.5rem !important;"
    />

    {#if value}
      <button
        type="button"
        aria-label="Clear search"
        onclick={() => value = ''}
        class="absolute inset-y-0 right-0 pr-3 flex items-center text-[oklch(0.7107_0.0351_256.79)] hover:text-white cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    {:else}
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <kbd class="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[oklch(0.7107_0.0351_256.79)] bg-white/5 border border-[oklch(0.2739_0.0055_286.03)] rounded">
          /
        </kbd>
      </div>
    {/if}
  </div>

  {#if properties && properties.length > 0}
    <div class="shrink-0 flex items-center">
      <FilterSort bind:filters bind:sorts {properties} />
    </div>
  {/if}

  {#if extra}
    {@render extra()}
  {/if}
</div>
