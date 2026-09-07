<script lang="ts">
  import { navItems, type NavItem } from '$lib/nav';
  import SearchBar from '$lib/SearchBar.svelte';
  import EmptyState from '$lib/EmptyState.svelte';
  import { filterAndSortItems } from '$lib/searchUtils';

  let searchQuery = $state('');

  let filteredNav = $derived(
    filterAndSortItems<NavItem>({
      items: navItems,
      searchQuery,
      searchFields: ['label', 'description', 'href']
    })
  );
</script>

<svelte:head>
  <title>Admin Dashboard</title>
</svelte:head>

<div class="space-y-6">
  <SearchBar
    bind:value={searchQuery}
    placeholder="Search pages (e.g. projects, blogs, media)..."
    totalCount={navItems.length}
    filteredCount={filteredNav.length}
  />

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {#each filteredNav as item (item.href)}
<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
      <a href={item.href} class="card p-6 group {item.borderHover} transition-all cursor-pointer relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br {item.bgGradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="w-12 h-12 rounded {item.iconBg} flex items-center justify-center mb-4 {item.iconColor} group-hover:scale-110 transition-transform">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{@html item.path}</svg>
        </div>
        <h2 class="text-xl font-semibold text-white mb-2">{item.label}</h2>
        <p class="text-[oklch(0.60_0.02_256.79)] text-sm">{item.description}</p>
      </a>
    {/each}
  </div>

  {#if filteredNav.length === 0}
    <EmptyState
      title="No matching pages"
      message="Try adjusting your search query to find the admin page you're looking for."
      actionLabel="Clear Search"
      onaction={() => searchQuery = ''}
    />
  {/if}
</div>
