<script lang="ts">
  import { onMount } from 'svelte';
  import { listMessages, deleteMessage, type D1Message } from '$lib/d1';
  import { notificationState } from '$lib/notificationState.svelte';
  import PageHeader from '$lib/PageHeader.svelte';
  import EmptyState from '$lib/EmptyState.svelte';

  let messages = $state<D1Message[]>([]);
  let isLoading = $state(true);
  let deletingId = $state<number | null>(null);

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

  function formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }

  onMount(() => {
    void loadMessages();
  });
</script>

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

  {#if isLoading}
    <div class="card p-12 text-center text-[oklch(0.7107_0.0351_256.79)]">Loading messages…</div>
  {:else if messages.length === 0}
    <EmptyState
      title="No messages yet"
      message="Messages submitted through the sqrt.fyi contact form will show up here."
    />
  {:else}
    <p class="text-sm text-[oklch(0.7107_0.0351_256.79)]">
      {messages.length} message{messages.length === 1 ? '' : 's'}
    </p>

    <div class="space-y-3">
      {#each messages as message (message.id)}
        <article class="card p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <p class="whitespace-pre-wrap break-words leading-relaxed text-[oklch(0.9842_0.0034_247.86)]">
                {message.body}
              </p>

              <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[oklch(0.7107_0.0351_256.79)]">
                <time datetime={message.created_at}>{formatDate(message.created_at)}</time>
                {#if message.country}
                  <span aria-hidden="true">·</span>
                  <span>{message.country}</span>
                {/if}
                {#if message.ip_hash}
                  <span aria-hidden="true">·</span>
                  <span title={message.ip_hash}>ip {message.ip_hash.slice(0, 10)}…</span>
                {/if}
              </div>
            </div>

            <button
              type="button"
              class="btn-danger text-sm shrink-0 cursor-pointer"
              onclick={() => handleDelete(message)}
              disabled={deletingId === message.id}
            >
              {deletingId === message.id ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </article>
      {/each}
    </div>
  {/if}
</div>
