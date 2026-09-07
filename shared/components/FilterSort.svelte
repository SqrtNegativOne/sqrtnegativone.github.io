<script lang="ts">
  import { clickOutside } from '../utils/clickOutside';
  import mediaProperties from '../../static/media/media-properties.json';

  let { filters = $bindable([]), sorts = $bindable([]), properties = [
    { value: 'type', label: 'Type', type: 'select', options: mediaProperties.types },
    { value: 'status', label: 'Status', type: 'select', options: mediaProperties.statuses },
    { value: 'rating', label: 'Rating', type: 'number' },
    { value: 'title', label: 'Title', type: 'text' }
  ] } = $props();

  let showFilterMenu = $state(false);
  let showSortMenu = $state(false);

  function addFilter() {
    const firstProp = properties[0];
    const initialVal = firstProp?.options?.[0]?.value ?? (firstProp?.type === 'number' ? 1 : '');
    filters = [...filters, { property: firstProp?.value || 'type', operator: 'is', value: initialVal }];
  }
  
  function removeFilter(i: number) {
    filters = filters.filter((_, idx) => idx !== i);
  }

  function addSort() {
    const firstProp = properties[0];
    sorts = [...sorts, { property: firstProp?.value || 'title', direction: 'asc' }];
  }
  
  function removeSort(i: number) {
    sorts = sorts.filter((_, idx) => idx !== i);
  }
  
  function getPropDef(val: string) {
    return properties.find((p: Record<string, unknown>) => p.value === val);
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
                <select bind:value={filter.property} class="bg-transparent border-none text-zinc-200 outline-none cursor-pointer">
                  {#each properties as prop (prop.value)}
                    {#if prop.type !== 'text'}
                      <option value={prop.value} class="bg-[oklch(0.2103_0.0059_285.89)] text-white">{prop.label}</option>
                    {/if}
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
                  <select bind:value={filter.value} class="bg-transparent border-none text-zinc-200 outline-none cursor-pointer flex-1 w-0">
                    {#each getPropDef(filter.property)?.options || [] as opt (opt.value)}
                      <option value={opt.value} class="bg-[oklch(0.2103_0.0059_285.89)] text-white">{opt.label}</option>
                    {/each}
                  </select>
                {:else if getPropDef(filter.property)?.type === 'number'}
                  <input type="number" bind:value={filter.value} class="bg-black/30 border border-[oklch(0.2739_0.0055_286.03)] rounded px-2 py-0.5 w-16 text-zinc-200 outline-none" min="1" max="10" />
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
