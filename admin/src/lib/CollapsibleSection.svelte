<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';

  interface Props {
    /** Heading text for the block. */
    title: string;
    /** The block's text content: non-empty content opens the block. */
    content?: string | null;
    /** Change this to reset the state (modal reopened, different item loaded). */
    resetKey?: string;
    /** `false` renders a plain heading instead of a toggle. */
    collapsible?: boolean;
    /** Amber accent used by the local-only private block. */
    tone?: 'default' | 'private';
    /** Right-aligned control shown next to the heading (e.g. "Log an entry →"). */
    actions?: Snippet;
    children: Snippet;
  }

  let {
    title,
    content = '',
    resetKey = '',
    collapsible = true,
    tone = 'default',
    actions,
    children
  }: Props = $props();

  const uid = $props.id();
  const panelId = `section-${uid}`;

  const hasText = (value?: string | null) => Boolean(value && value.trim());

  let open = $state(true);
  /** Once the header is clicked, stop auto-opening this block for the session. */
  let pinned = $state(false);

  // A fresh modal session starts from the content that already exists: a new
  // item opens empty (tidy), an item that already has notes shows them.
  $effect(() => {
    void resetKey;
    untrack(() => {
      pinned = false;
      open = hasText(content);
    });
  });

  // Content arriving from outside (metadata search filling the synopsis) must
  // not stay hidden behind a collapsed header.
  $effect(() => {
    if (hasText(content) && !pinned && !open) open = true;
  });

  function toggle() {
    pinned = true;
    open = !open;
  }

  /** One-line hint of what a collapsed block is hiding. */
  let preview = $derived((content || '').replace(/\s+/g, ' ').trim());
</script>

<section class="space-y-3">
  <div class="flex items-center justify-between gap-3 border-b border-[oklch(0.2739_0.0055_286.03)] pb-2">
    <h3 class="min-w-0 flex-1">
      {#if collapsible}
        <button
          type="button"
          onclick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          class="group flex w-full min-w-0 cursor-pointer items-center gap-2 rounded text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/70"
        >
          <span
            class="text-[11px] font-mono uppercase tracking-[0.16em] transition-colors {tone === 'private'
              ? 'text-amber-400/85 group-hover:text-amber-300'
              : 'text-[oklch(0.7107_0.0351_256.79)] group-hover:text-white'}"
          >
            {title}
          </span>
          <svg
            class="h-3.5 w-3.5 shrink-0 transition-transform duration-200 {open ? 'rotate-180' : ''} {tone === 'private'
              ? 'text-amber-400/70 group-hover:text-amber-300'
              : 'text-[oklch(0.60_0.02_256.79)] group-hover:text-white'}"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 7.5 10 12.5 15 7.5" />
          </svg>
          {#if !open && preview}
            <span class="min-w-0 flex-1 truncate text-[10px] font-mono text-[oklch(0.5416_0.0154_285.87)]">
              {preview}
            </span>
          {/if}
        </button>
      {:else}
        <span class="text-[11px] font-mono uppercase tracking-[0.16em] text-[oklch(0.7107_0.0351_256.79)]">
          {title}
        </span>
      {/if}
    </h3>
    {#if actions}
      <div class="shrink-0">{@render actions()}</div>
    {/if}
  </div>

  {#if !collapsible || open}
    <div id={panelId} class="space-y-3">
      {@render children()}
    </div>
  {/if}
</section>
