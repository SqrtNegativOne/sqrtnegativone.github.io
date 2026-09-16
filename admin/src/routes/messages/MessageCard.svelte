<script lang="ts">
  import type { D1Message } from '$lib/d1';
  import { highlightMatches } from '$lib/searchUtils';

  interface Props {
    message: D1Message;
    query?: string;
    deleting?: boolean;
    ondelete: (message: D1Message) => void;
  }

  let { message, query = '', deleting = false, ondelete }: Props = $props();

  function formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }
</script>

<article class="card p-5">
  <div class="flex items-start justify-between gap-4">
    <div class="min-w-0 flex-1">
      <p class="whitespace-pre-wrap break-words leading-relaxed text-[oklch(0.9842_0.0034_247.86)]">
        {#each highlightMatches(message.body, query) as part}
          {#if part.match}<mark class="bg-amber-400/30 text-amber-100 rounded px-0.5">{part.text}</mark>{:else}{part.text}{/if}
        {/each}
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
        {#if message.user_agent}
          <span aria-hidden="true">·</span>
          <span class="truncate max-w-[24rem]" title={message.user_agent}>{message.user_agent}</span>
        {/if}
      </div>
    </div>

    <button
      type="button"
      class="btn-danger text-sm shrink-0 cursor-pointer"
      onclick={() => ondelete(message)}
      disabled={deleting}
    >
      {deleting ? 'Deleting…' : 'Delete'}
    </button>
  </div>
</article>
