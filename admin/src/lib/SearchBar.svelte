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
    totalCount?: number;
    filteredCount?: number;
    onnew?: (initialQuery?: string) => void;
    class?: string;
    extra?: Snippet;
  }

  let {
    value = $bindable(''),
    placeholder = '',
    properties = [],
    filters = $bindable([]),
    sorts = $bindable([]),
    totalCount,
    filteredCount,
    onnew,
    class: className = '',
    extra
  }: Props = $props();

  let inputEl: HTMLInputElement | undefined = $state();

  function handleInputKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      if (value) {
        value = '';
      } else {
        inputEl?.blur();
      }
    }
  }

  function handleWindowKeydown(e: KeyboardEvent) {
    const activeEl = document.activeElement;
    const isInput =
      activeEl instanceof HTMLInputElement ||
      activeEl instanceof HTMLTextAreaElement ||
      (activeEl as HTMLElement)?.isContentEditable;

    const isModalOpen = !!document.querySelector('[role="dialog"], [data-modal], .fixed.inset-0.z-50, .fixed.inset-0.z-\\[60\\]');

    // Focus search input on '/' when not in input or modal
    if (e.key === '/' && !isInput && !isModalOpen && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      inputEl?.focus();
      inputEl?.select();
      return;
    }

    const isKeyN = e.key === 'n' || e.key === 'N' || e.code === 'KeyN';
    const isCtrlOrMeta = e.ctrlKey || e.metaKey;

    // Ctrl+N / Cmd+N: Works globally across the view (even when search bar is focused),
    // but blocked while a modal dialog is open so active input isn't discarded.
    // Whatever is typed in the search bar becomes the new item's primary field.
    if (isKeyN && isCtrlOrMeta && !e.altKey) {
      e.preventDefault();
      if (onnew && !isModalOpen) {
        onnew(value);
      }
      return;
    }

    // Single-key 'n' or 'N' navigation shortcut (only when not typing in any input or modal)
    if (isKeyN && !isCtrlOrMeta && !e.altKey && !e.shiftKey && !isInput && !isModalOpen) {
      if (onnew) {
        e.preventDefault();
        onnew(value);
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
      onkeydown={handleInputKeydown}
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

  {#if totalCount !== undefined && filteredCount !== undefined && (value || (filters && filters.length > 0))}
    <div
      class="shrink-0 text-xs font-mono px-2.5 py-2 rounded bg-white/5 border border-[oklch(0.2739_0.0055_286.03)] text-[oklch(0.7107_0.0351_256.79)] select-none"
      title="{filteredCount} results of {totalCount} total"
    >
      <span class="text-white font-semibold">{filteredCount}</span>/{totalCount}
    </div>
  {/if}

  {#if properties && properties.length > 0}
    <div class="shrink-0 flex items-center">
      <FilterSort bind:filters bind:sorts {properties} />
    </div>
  {/if}

  {#if extra}
    {@render extra()}
  {/if}
</div>
