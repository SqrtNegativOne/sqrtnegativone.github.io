<script lang="ts">
  interface Props {
    value: string;
    placeholder?: string;
    class?: string;
  }

  let { value = $bindable(''), placeholder = 'Search...', class: className = '' }: Props = $props();
</script>

<div class="relative flex-1 {className}">
  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[oklch(0.7107_0.0351_256.79)]">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
    </svg>
  </div>
  <input
    type="text"
    bind:value
    {placeholder}
    class="input-field pl-9 pr-8 text-sm"
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
  {/if}
</div>
