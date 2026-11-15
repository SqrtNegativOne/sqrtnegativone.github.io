<script lang="ts">
  import { navItems, type NavItem } from '$lib/nav';
  import SearchBar from '$lib/SearchBar.svelte';
  import EmptyState from '$lib/EmptyState.svelte';
  import { filterAndSortItems } from '$lib/searchUtils';
  import { messageReadState } from '$lib/messageReadState.svelte';

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

  <div class="flex justify-end">
    <button
      type="button"
      class="btn-secondary flex items-center gap-2 text-xs cursor-pointer"
      onclick={() => messageReadState.refresh(true, false)}
      disabled={messageReadState.checking}
      title="Query the remote D1 database for unread messages"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
      <span>{messageReadState.checking ? 'Checking…' : 'Check for new messages'}</span>
    </button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {#each filteredNav as item (item.href)}
<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
      <a href={item.href} class="card p-6 group {item.borderHover} transition-all cursor-pointer relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br {item.bgGradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {#if item.href === '/messages' && messageReadState.unreadCount > 0}
          <span
            class="absolute top-4 right-4 z-10 min-w-6 h-6 px-1.5 flex items-center justify-center rounded-full bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-500/30"
            aria-hidden="true"
          >{messageReadState.unreadCount > 99 ? '99+' : messageReadState.unreadCount}</span>
          <span class="sr-only">{messageReadState.unreadCount} unread {messageReadState.unreadCount === 1 ? 'message' : 'messages'}</span>
        {/if}
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
