<script lang="ts">
  import { clickOutside } from '../utils/clickOutside';
  import mediaProperties from '../../site/static/media/media-properties.json';

  interface PropertyOption {
    value: string;
    label: string;
  }

  interface PropertyDef {
    value: string;
    label: string;
    type?: 'text' | 'select' | 'number';
    options?: PropertyOption[];
  }

  interface FilterEntry {
    property: string;
    operator: string;
    value: string | number | boolean | string[];
  }

  let { filters = $bindable<FilterEntry[]>([]), sorts = $bindable([]), properties = [
    { value: 'type', label: 'Type', type: 'select', options: mediaProperties.types },
    { value: 'status', label: 'Status', type: 'select', options: mediaProperties.statuses },
    { value: 'rating', label: 'Rating', type: 'number' },
    { value: 'title', label: 'Title', type: 'text' }
  ] as PropertyDef[] } = $props();

  let showFilterMenu = $state(false);
  let showSortMenu = $state(false);
  /** Index of the filter whose multi-select value panel is open. */
  let openSelectIndex = $state<number | null>(null);

  /** Default value for a freshly picked property (multi-select props start empty). */
  function defaultFilterValue(def: PropertyDef | undefined): FilterEntry['value'] {
    if (def?.type === 'select') return [];
    if (def?.type === 'number') return 1;
    return '';
  }

  function addFilter() {
    const firstProp = properties[0];
    filters = [...filters, { property: firstProp?.value || 'type', operator: 'is', value: defaultFilterValue(firstProp) }];
  }
  
  function removeFilter(i: number) {
    filters = filters.filter((_, idx) => idx !== i);
    openSelectIndex = null;
  }

  /** Selected values normalised to an array, so legacy single values still work. */
  function selectedValues(value: FilterEntry['value']): string[] {
    if (Array.isArray(value)) return value.map(String);
    if (value === undefined || value === null || value === '') return [];
    return [String(value)];
  }

  function isOptionSelected(value: FilterEntry['value'], optValue: string): boolean {
    return selectedValues(value).includes(optValue);
  }

  function toggleOption(filter: FilterEntry, optValue: string) {
    const current = selectedValues(filter.value);
    filter.value = current.includes(optValue)
      ? current.filter(v => v !== optValue)
      : [...current, optValue];
  }

  function clearSelection(filter: FilterEntry) {
    filter.value = [];
  }

  /** Short label shown on the multi-select trigger. */
  function selectionSummary(filter: FilterEntry): string {
    const def = getPropDef(filter.property);
    const values = selectedValues(filter.value);
    if (values.length === 0) return 'Any';
    const labels = values.map(v => def?.options?.find(o => o.value === v)?.label ?? v);
    if (labels.length <= 2) return labels.join(', ');
    return `${labels[0]} +${labels.length - 1}`;
  }

  /** Full tooltip text for the multi-select trigger. */
  function selectionTitle(filter: FilterEntry): string {
    const def = getPropDef(filter.property);
    const values = selectedValues(filter.value);
    if (values.length === 0) return 'No value selected (matches everything)';
    return values.map(v => def?.options?.find(o => o.value === v)?.label ?? v).join(', ');
  }

  function addSort() {
    const firstProp = properties[0];
    sorts = [...sorts, { property: firstProp?.value || 'title', direction: 'asc' }];
  }
  
  function removeSort(i: number) {
    sorts = sorts.filter((_, idx) => idx !== i);
  }
  
  function getPropDef(val: string): PropertyDef | undefined {
    return properties.find((p) => p.value === val);
  }
</script>

<div class="flex items-center gap-2 relative h-full">
  <!-- Filter Dropdown -->
  <div class="relative flex items-center" use:clickOutside={() => showFilterMenu = false}>
    <button 
      type="button"
      title="Filter"
      aria-label="Filter"
      class="flex items-center gap-1.5 px-3 py-2 text-sm rounded transition-colors font-medium border border-transparent cursor-pointer {filters.length > 0 ? 'text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20' : 'text-[oklch(0.7107_0.0351_256.79)] hover:text-white hover:bg-white/5'}"
      onclick={() => { showFilterMenu = !showFilterMenu; showSortMenu = false; }}
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
      {filters.length > 0 ? filters.length : ''}
    </button>

    {#if showFilterMenu}
      <div class="absolute top-full right-0 mt-2 w-80 bg-[oklch(0.2103_0.0059_285.89)] border border-[oklch(0.2739_0.0055_286.03)] rounded shadow-2xl p-3 z-50 text-white flex flex-col gap-3">
        <div class="text-xs font-semibold text-[oklch(0.7107_0.0351_256.79)] uppercase tracking-wider mb-1">Filters</div>
        {#if filters.length === 0}
          <div class="text-sm text-[oklch(0.7107_0.0351_256.79)] pb-2">No filters applied</div>
        {:else}
          <div class="flex flex-col gap-2">
            {#each filters as filter, i (i)}
              <div class="flex items-center gap-2 text-sm bg-black/40 p-2 rounded border border-[oklch(0.2739_0.0055_286.03)]">
                <select
                  bind:value={filter.property}
                  onchange={() => {
                    filter.value = defaultFilterValue(getPropDef(filter.property));
                    openSelectIndex = null;
                  }}
                  class="bg-transparent border-none text-zinc-200 outline-none cursor-pointer"
                >
                  {#each properties as prop (prop.value)}
                    <option value={prop.value} class="bg-[oklch(0.2103_0.0059_285.89)] text-white">{prop.label}</option>
                  {/each}
                </select>
                
                <select bind:value={filter.operator} class="bg-transparent border-none text-[oklch(0.7107_0.0351_256.79)] outline-none cursor-pointer">
                  <option value="is" class="bg-[oklch(0.2103_0.0059_285.89)] text-white">is</option>
                  <option value="is_not" class="bg-[oklch(0.2103_0.0059_285.89)] text-white">is not</option>
                  {#if getPropDef(filter.property)?.type === 'number'}
                    <option value=">" class="bg-[oklch(0.2103_0.0059_285.89)] text-white">&gt;</option>
                    <option value="<" class="bg-[oklch(0.2103_0.0059_285.89)] text-white">&lt;</option>
                  {/if}
                </select>

                {#if getPropDef(filter.property)?.type === 'select'}
                  <div class="relative flex-1 w-0">
                    <button
                      type="button"
                      class="w-full flex items-center gap-1 bg-transparent border-none text-left cursor-pointer"
                      title={selectionTitle(filter)}
                      aria-haspopup="listbox"
                      aria-expanded={openSelectIndex === i}
                      onclick={() => openSelectIndex = openSelectIndex === i ? null : i}
                    >
                      <span class="truncate {selectedValues(filter.value).length === 0 ? 'text-[oklch(0.7107_0.0351_256.79)]' : 'text-zinc-200'}">
                        {selectionSummary(filter)}
                      </span>
                      <svg class="w-3.5 h-3.5 shrink-0 text-[oklch(0.7107_0.0351_256.79)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                    </button>

                    {#if openSelectIndex === i}
                      <div
                        class="absolute left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto bg-[oklch(0.2103_0.0059_285.89)] border border-[oklch(0.2739_0.0055_286.03)] rounded shadow-2xl p-1 z-[60] flex flex-col gap-0.5"
                        role="listbox"
                        aria-label="{getPropDef(filter.property)?.label ?? filter.property} values"
                        aria-multiselectable="true"
                        tabindex="-1"
                      >
                        {#each getPropDef(filter.property)?.options || [] as opt (opt.value)}
                          {@const active = isOptionSelected(filter.value, opt.value)}
                          <button
                            type="button"
                            role="option"
                            aria-selected={active}
                            class="flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs cursor-pointer transition-colors hover:bg-white/10 {active ? 'text-white' : 'text-[oklch(0.7107_0.0351_256.79)]'}"
                            onclick={() => toggleOption(filter, opt.value)}
                          >
                            <span class="w-3.5 h-3.5 shrink-0 rounded border flex items-center justify-center {active ? 'bg-blue-500 border-blue-500' : 'border-[oklch(0.3801_0.0052_286.02)]'}">
                              {#if active}
                                <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                              {/if}
                            </span>
                            <span class="truncate">{opt.label}</span>
                          </button>
                        {/each}
                        <button
                          type="button"
                          class="mt-0.5 px-2 py-1.5 rounded text-left text-xs text-[oklch(0.7107_0.0351_256.79)] hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
                          disabled={selectedValues(filter.value).length === 0}
                          onclick={() => clearSelection(filter)}
                        >
                          Clear selection
                        </button>
                      </div>
                    {/if}
                  </div>
                {:else if getPropDef(filter.property)?.type === 'number'}
                  <input type="number" bind:value={filter.value} class="bg-black/30 border border-[oklch(0.2739_0.0055_286.03)] rounded px-2 py-0.5 w-16 text-zinc-200 outline-none" min="0" max="6" step="any" />
                {:else}
                  <input type="text" bind:value={filter.value} class="bg-black/30 border border-[oklch(0.2739_0.0055_286.03)] rounded px-2 py-0.5 flex-1 text-zinc-200 outline-none text-xs" placeholder="Value..." />
                {/if}

                <button onclick={() => removeFilter(i)} class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white ml-auto cursor-pointer" aria-label="Remove filter">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            {/each}
          </div>
        {/if}
        <button onclick={addFilter} class="text-sm text-left text-[oklch(0.7107_0.0351_256.79)] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add filter
        </button>
      </div>
    {/if}
  </div>

  <!-- Sort Dropdown -->
  <div class="relative flex items-center" use:clickOutside={() => showSortMenu = false}>
    <button 
      type="button"
      title="Sort"
      aria-label="Sort"
      class="flex items-center gap-1.5 px-3 py-2 text-sm rounded transition-colors font-medium border border-transparent cursor-pointer {sorts.length > 0 ? 'text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20' : 'text-[oklch(0.7107_0.0351_256.79)] hover:text-white hover:bg-white/5'}"
      onclick={() => { showSortMenu = !showSortMenu; showFilterMenu = false; }}
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/></svg>
      {sorts.length > 0 ? sorts.length : ''}
    </button>

    {#if showSortMenu}
      <div class="absolute top-full right-0 mt-2 w-72 bg-[oklch(0.2103_0.0059_285.89)] border border-[oklch(0.2739_0.0055_286.03)] rounded shadow-2xl p-3 z-50 text-white flex flex-col gap-3">
        <div class="text-xs font-semibold text-[oklch(0.7107_0.0351_256.79)] uppercase tracking-wider mb-1">Sorts</div>
        {#if sorts.length === 0}
          <div class="text-sm text-[oklch(0.7107_0.0351_256.79)] pb-2">No sorts applied</div>
        {:else}
          <div class="flex flex-col gap-2">
            {#each sorts as sort, i (i)}
              <div class="flex items-center gap-2 text-sm bg-black/40 p-2 rounded border border-[oklch(0.2739_0.0055_286.03)]">
                <select bind:value={sort.property} class="bg-transparent border-none text-zinc-200 outline-none cursor-pointer flex-1 w-0">
                  {#each properties as prop (prop.value)}
                    <option value={prop.value} class="bg-[oklch(0.2103_0.0059_285.89)] text-white">{prop.label}</option>
                  {/each}
                </select>
                
                <select bind:value={sort.direction} class="bg-transparent border-none text-[oklch(0.7107_0.0351_256.79)] outline-none cursor-pointer w-24">
                  <option value="asc" class="bg-[oklch(0.2103_0.0059_285.89)] text-white">Ascending</option>
                  <option value="desc" class="bg-[oklch(0.2103_0.0059_285.89)] text-white">Descending</option>
                </select>

                <button onclick={() => removeSort(i)} class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white ml-auto cursor-pointer" aria-label="Remove sort">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            {/each}
          </div>
        {/if}
        <button onclick={addSort} class="text-sm text-left text-[oklch(0.7107_0.0351_256.79)] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add sort
        </button>
      </div>
    {/if}
  </div>
</div>
