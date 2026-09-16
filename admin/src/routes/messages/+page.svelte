<script lang="ts">
  import { onMount } from 'svelte';
  import { listMessages, deleteMessage, type D1Message } from '$lib/d1';
  import { notificationState } from '$lib/notificationState.svelte';
  import PageHeader from '$lib/PageHeader.svelte';
  import SearchBar from '$lib/SearchBar.svelte';
  import EmptyState from '$lib/EmptyState.svelte';
  import { filterAndSortItems, type FilterRule, type SortRule, type FilterProperty } from '$lib/searchUtils';
  import MessageCard from './MessageCard.svelte';

  let messages = $state<D1Message[]>([]);
  let isLoading = $state(true);
  let deletingId = $state<number | null>(null);

  let searchQuery = $state('');
  let filters = $state<FilterRule[]>([]);
  let sorts = $state<SortRule[]>([]);

  let countries = $derived(
    Array.from(new Set(messages.map((m) => m.country).filter((c): c is string => !!c))).sort()
  );

  let filterProperties = $derived<FilterProperty[]>([
    { value: 'body', label: 'Body', type: 'text' },
    {
      value: 'country',
      label: 'Country',
      type: 'select',
      options: countries.map((c) => ({ value: c, label: c }))
    },
    { value: 'user_agent', label: 'User agent', type: 'text' },
    { value: 'created_at', label: 'Received', type: 'text' }
  ]);

  // Keep newest-first as the stable default; users can override via the sort menu.
  let filteredMessages = $derived(
    filterAndSortItems<D1Message>({
      items: messages,
      searchQuery,
      searchFields: ['body', 'country', 'user_agent', 'created_at'],
      filters,
      sorts
    })
  );

  async function loadMessages() {
    isLoading = true;
    const result = await listMessages();
    if (result.isOk()) messages = result.value;
    isLoading = false;
  }

  async function handleDelete(message: D1Message) {
    if (deletingId !== null) return;
    const preview = message.body.length > 140 ? `${message.body.slice(0, 140)}…` : message.body;
    if (!confirm(`Delete this message?\n\n${preview}`)) return;

    deletingId = message.id;
    const result = await deleteMessage(message.id);
    if (result.isOk()) {
      messages = messages.filter((m) => m.id !== message.id);
      notificationState.success('Message deleted.', { title: 'Deleted' });
    }
    deletingId = null;
  }

  onMount(() => {
    void loadMessages();
  });
</script>

<svelte:head>
  <title>Manage Messages | Admin</title>
</svelte:head>

<div class="space-y-6">
  <PageHeader title="Messages">
    <button
      type="button"
      class="btn-secondary flex items-center gap-2 cursor-pointer"
      onclick={loadMessages}
      disabled={isLoading}
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
      <span>{isLoading ? 'Loading…' : 'Refresh'}</span>
    </button>
  </PageHeader>

  {#if isLoading && messages.length === 0}
    <div class="card p-12 text-center text-[oklch(0.7107_0.0351_256.79)]">Loading messages…</div>
  {:else if messages.length === 0}
    <EmptyState
      title="No messages yet"
      message="Messages submitted through the sqrt.fyi contact form will show up here."
    />
  {:else}
    <SearchBar
      bind:value={searchQuery}
      bind:filters
      bind:sorts
      properties={filterProperties}
      placeholder="Search messages…"
      totalCount={messages.length}
      filteredCount={filteredMessages.length}
    />

    {#if filteredMessages.length === 0}
      <EmptyState
        title="No matching messages"
        message="Try adjusting your search query or filters."
      />
    {:else}
      <div class="space-y-3">
        {#each filteredMessages as message (message.id)}
          <MessageCard
            {message}
            query={searchQuery}
            deleting={deletingId === message.id}
            ondelete={handleDelete}
          />
        {/each}
      </div>
    {/if}
  {/if}
</div>
