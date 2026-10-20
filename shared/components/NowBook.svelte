<script lang="ts">
  import { tick } from 'svelte';
  import { formatArcRange, type NowBookItem } from '../lib/arcs';

  let {
    items = [],
    label = 'Arcs',
    emptyKicker = 'NOTHING ON THE SHELF',
    emptyTitle = 'Nothing current',
    emptyMessage = 'Check back soon.'
  }: {
    items: NowBookItem[];
    /** Accessible name for the tab strip. Keep it audience-appropriate. */
    label?: string;
    emptyKicker?: string;
    emptyTitle?: string;
    emptyMessage?: string;
  } = $props();

  let selected = $state(0);
  let active = $derived(items[selected] ?? null);

  // Keep the selection valid when items change underneath us.
  $effect(() => {
    if (selected > items.length - 1) {
      selected = Math.max(0, items.length - 1);
    }
  });

  function focusTab(index: number) {
    return tick().then(() => {
      document.getElementById(`now-tab-${items[index]?.id}`)?.focus();
    });
  }

  function handleTabKeydown(event: KeyboardEvent, index: number) {
    if (items.length === 0) return;

    let next: number;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        next = (index + 1) % items.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        next = (index - 1 + items.length) % items.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    selected = next;
    void focusTab(next);
  }
</script>

{#if items.length === 0}
  <div class="now-book-empty">
    {#if emptyKicker}
      <p class="empty-kicker">{emptyKicker}</p>
    {/if}
    <h2>{emptyTitle}</h2>
    <p class="empty-message">{emptyMessage}</p>
  </div>
{:else}
  <div class="now-book">
    <div class="book-tabs" role="tablist" aria-label={label} aria-orientation="vertical">
      {#each items as item, index (item.id)}
        <button
          type="button"
          role="tab"
          id={`now-tab-${item.id}`}
          class="book-tab"
          class:is-active={selected === index}
          aria-selected={selected === index}
          aria-controls={`now-panel-${item.id}`}
          tabindex={selected === index ? 0 : -1}
          onclick={() => (selected = index)}
          onkeydown={(event) => handleTabKeydown(event, index)}
        >
          <span class="tab-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <span class="tab-label">{item.title}</span>
          <span class="tab-dot" aria-hidden="true"></span>
        </button>
      {/each}
    </div>

    <div class="book-body">
      {#each items as item, index (item.id)}
        <div
          class="book-panel"
          id={`now-panel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`now-tab-${item.id}`}
          hidden={selected !== index}
          tabindex="0"
        >
          <header class="panel-head">
            <p class="panel-range">{formatArcRange(item.startDate, item.endDate)}</p>
            <h2 class="panel-title">{item.title}</h2>
          </header>

          <div class="panel-prose">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html item.html}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .now-book {
    --book-sidebar: oklch(0.155 0 0);
    --book-panel: oklch(0.205 0 0);

    display: grid;
    grid-template-columns: minmax(10.5rem, 14.5rem) minmax(0, 1fr);
    align-items: stretch;
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    background: var(--book-sidebar);
    box-shadow: 0 18px 50px oklch(0 0 0 / 0.22);
    overflow: hidden;
  }

  /* ── Index tabs ───────────────────────────────── */
  .book-tabs {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    min-width: 0;
    padding: 0.9rem 0 0.9rem 0.9rem;
    background: var(--book-sidebar);
  }

  .book-tab {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.65rem;
    width: 100%;
    margin-right: -1px;
    padding: 0.9rem 0.95rem 0.9rem 1rem;
    border: 1px solid transparent;
    border-right: 0;
    border-radius: 10px 0 0 10px;
    background: transparent;
    color: var(--text-secondary);
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition:
      color 0.18s ease,
      background 0.18s ease,
      border-color 0.18s ease;
  }

  /* Bookmark spine on the left edge of each tab. */
  .book-tab::before {
    content: '';
    position: absolute;
    top: 22%;
    bottom: 22%;
    left: 0;
    width: 2px;
    border-radius: 2px;
    background: transparent;
    transition: background 0.18s ease;
  }

  .book-tab:hover,
  .book-tab:focus-visible {
    color: var(--text);
    background: oklch(1 0 0 / 0.045);
  }

  .book-tab:focus-visible {
    outline: 1px solid oklch(1 0 0 / 0.45);
    outline-offset: -2px;
  }

  .book-tab.is-active {
    color: var(--text);
    background: var(--book-panel);
    border-color: var(--glass-border);
    border-right-color: var(--book-panel);
  }

  .book-tab.is-active::before {
    background: oklch(0.85 0.18 150);
    box-shadow: 0 0 10px oklch(0.85 0.18 150 / 0.6);
  }

  .tab-index {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.62rem;
    letter-spacing: 0.06em;
    color: var(--text-secondary);
    opacity: 0.55;
  }

  .tab-label {
    font-family: "Instrument Serif", Georgia, serif;
    font-size: 1.15rem;
    line-height: 1.15;
    overflow-wrap: anywhere;
  }

  .tab-dot {
    width: 6px;
    height: 6px;
    border: 1px solid oklch(1 0 0 / 0.18);
    border-radius: 999px;
    background: transparent;
  }

  .book-tab.is-active .tab-dot {
    border-color: oklch(0.85 0.18 150);
    background: oklch(0.85 0.18 150);
    box-shadow: 0 0 8px oklch(0.85 0.18 150 / 0.65);
  }

  /* ── Description panel ────────────────────────── */
  .book-body {
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: var(--book-panel);
  }

  .book-panel {
    flex: 1;
    min-height: 20rem;
    padding: 2rem 2.25rem 2.25rem;
    border-left: 1px solid var(--glass-border);
    background: var(--book-panel);
    overflow-wrap: anywhere;
    animation: panel-in 0.22s ease;
  }

  .book-panel[hidden] {
    display: none;
  }

  @keyframes panel-in {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .panel-head {
    margin-bottom: 1.5rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--glass-border);
  }

  .panel-range {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.68rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .panel-title {
    margin: 0.4rem 0 0;
    font-family: "Instrument Serif", Georgia, serif;
    font-size: clamp(1.9rem, 3.2vw, 2.7rem);
    font-weight: 400;
    line-height: 1.08;
    color: var(--text);
  }

  /* ── Markdown prose ───────────────────────────── */
  .panel-prose {
    max-width: 68ch;
    font-size: 1rem;
    line-height: 1.7;
    color: var(--text);
  }

  .panel-prose :global(p) {
    margin: 0 0 1rem;
  }

  .panel-prose :global(p:last-child) {
    margin-bottom: 0;
  }

  .panel-prose :global(h2),
  .panel-prose :global(h3) {
    margin: 1.4rem 0 0.55rem;
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .panel-prose :global(h2:first-child),
  .panel-prose :global(h3:first-child) {
    margin-top: 0;
  }

  .panel-prose :global(ul),
  .panel-prose :global(ol) {
    margin: 0 0 1rem;
    padding-left: 1.3rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .panel-prose :global(ul) {
    list-style: disc;
  }

  .panel-prose :global(ol) {
    list-style: decimal;
  }

  .panel-prose :global(li) {
    line-height: 1.6;
  }

  .panel-prose :global(li::marker) {
    color: var(--text-secondary);
  }

  .panel-prose :global(a) {
    color: oklch(0.78 0.14 230);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .panel-prose :global(a:hover) {
    color: oklch(0.9 0.12 230);
  }

  .panel-prose :global(strong) {
    color: var(--text);
    font-weight: 600;
  }

  .panel-prose :global(em) {
    font-style: italic;
  }

  .panel-prose :global(code) {
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
    background: oklch(1 0 0 / 0.08);
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.85em;
  }

  .panel-prose :global(pre) {
    margin: 0 0 1rem;
    padding: 1rem;
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    background: oklch(0 0 0 / 0.3);
    overflow-x: auto;
  }

  .panel-prose :global(pre code) {
    padding: 0;
    background: transparent;
  }

  .panel-prose :global(blockquote) {
    margin: 0 0 1rem;
    padding: 0.25rem 0 0.25rem 1rem;
    border-left: 2px solid var(--glass-border);
    color: var(--text-secondary);
  }

  .panel-prose :global(hr) {
    margin: 1.5rem 0;
    border: 0;
    border-top: 1px solid var(--glass-border);
  }

  .panel-prose :global(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
  }

  /* ── Empty shelf ──────────────────────────────── */
  .now-book-empty {
    padding: 3.5rem 1.5rem;
    border: 1px dashed var(--glass-border);
    border-radius: 16px;
    background: oklch(1 0 0 / 0.02);
    text-align: center;
  }

  .empty-kicker {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.65rem;
    letter-spacing: 0.18em;
    color: var(--text-secondary);
    opacity: 0.65;
  }

  .now-book-empty h2 {
    margin: 0.6rem 0 0.5rem;
    font-family: "Instrument Serif", Georgia, serif;
    font-size: 1.9rem;
    font-weight: 400;
    line-height: 1.1;
  }

  .empty-message {
    max-width: 34rem;
    margin: 0 auto;
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.6;
  }

  /* ── Mobile: tabs run across the top ──────────── */
  @media (max-width: 720px) {
    .now-book {
      grid-template-columns: minmax(0, 1fr);
      border-radius: 12px;
    }

    .book-tabs {
      flex-direction: row;
      gap: 0;
      padding: 0.55rem 0.55rem 0;
      border-bottom: 1px solid var(--glass-border);
      overflow-x: auto;
      scrollbar-width: none;
    }

    .book-tabs::-webkit-scrollbar {
      display: none;
    }

    .book-tab {
      flex: 0 0 auto;
      width: auto;
      margin: 0 0 -1px;
      padding: 0.7rem 0.9rem;
      border-right: 1px solid transparent;
      border-bottom: 1px solid transparent;
      border-radius: 9px 9px 0 0;
    }

    .book-tab::before {
      top: auto;
      right: 20%;
      bottom: 0;
      left: 20%;
      width: auto;
      height: 2px;
    }

    .book-tab.is-active {
      border-bottom-color: var(--book-panel);
      background: var(--book-panel);
      box-shadow: 0 -1px 0 0 var(--glass-border);
    }

    .book-panel {
      min-height: 0;
      padding: 1.5rem 1.25rem 1.75rem;
      border-left: 0;
    }

    .panel-title {
      font-size: 1.9rem;
    }
  }
</style>
