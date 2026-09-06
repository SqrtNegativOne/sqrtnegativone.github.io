<script lang="ts">
  import markdownIt from 'markdown-it';
  import Seo from '$lib/components/Seo.svelte';
  import { formatNowDate, type NowEntry } from '$lib/now';

  let { data } = $props<{
    data: {
      entry: NowEntry;
      prevEntry: NowEntry | null;
      nextEntry: NowEntry | null;
    };
  }>();

  const md = markdownIt({ html: true, linkify: true, typographer: true });

  let renderedContent = $derived(md.render(data.entry.content));
</script>

<Seo
  title="{data.entry.title ? `${data.entry.title} — Now (${data.entry.date})` : `Now (${data.entry.date})`} — Ark Malhotra"
  description="What Ark Malhotra was working on and learning on {formatNowDate(data.entry.date)}."
  path="/now/{data.entry.date}"
/>

<div class="day-page">
  <!-- Top Navigation -->
  <nav class="day-top-nav" aria-label="Breadcrumb">
    <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
    <a href="/now" class="back-link">
      <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span>Back to /now</span>
    </a>
  </nav>

  <!-- Day Post Card -->
  <article class="day-card">
    <header class="day-header">
      <div class="day-badge-row">
        <time datetime={data.entry.date} class="day-date-tag">
          {formatNowDate(data.entry.date)}
        </time>
        <span class="day-slug">{data.entry.date}</span>
      </div>

      {#if data.entry.title}
        <h1 class="day-title">{data.entry.title}</h1>
      {/if}
    </header>

    <div class="day-prose">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html renderedContent}
    </div>
  </article>

  <!-- Pagination between days -->
  <footer class="day-pagination" aria-label="Day pagination">
    <div class="pagination-prev">
      {#if data.prevEntry}
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <a href="/now/{data.prevEntry.date}" class="pagination-link">
          <span class="pagination-sub">&larr; Older</span>
          <span class="pagination-name">{data.prevEntry.title || data.prevEntry.date}</span>
        </a>
      {/if}
    </div>

    <div class="pagination-next">
      {#if data.nextEntry}
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <a href="/now/{data.nextEntry.date}" class="pagination-link pagination-link--next">
          <span class="pagination-sub">Newer &rarr;</span>
          <span class="pagination-name">{data.nextEntry.title || data.nextEntry.date}</span>
        </a>
      {/if}
    </div>
  </footer>
</div>

<style>
  .day-page {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding-bottom: 2.5rem;
  }

  .day-top-nav {
    display: flex;
    align-items: center;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.2s ease, transform 0.2s ease;
  }

  .back-link:hover {
    color: var(--text);
    transform: translateX(-3px);
  }

  .day-card {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .day-header {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    border-bottom: 1px solid var(--glass-border, oklch(1 0 0 / 0.08));
    padding-bottom: 1.25rem;
  }

  .day-badge-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .day-date-tag {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.85rem;
    color: var(--text);
    background: oklch(1 0 0 / 0.06);
    border: 1px solid var(--glass-border, oklch(1 0 0 / 0.12));
    padding: 0.25rem 0.65rem;
    border-radius: 6px;
    letter-spacing: 0.03em;
  }

  .day-slug {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.75rem;
    color: var(--text-secondary);
    opacity: 0.6;
  }

  .day-title {
    font-family: "Instrument Serif", Georgia, serif;
    font-size: 2.35rem;
    line-height: 1.15;
    color: var(--text);
    font-weight: 400;
    margin: 0;
  }

  /* Prose */
  .day-prose {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .day-prose :global(h2),
  .day-prose :global(h3) {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.85rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin: 1.25rem 0 0.5rem 0;
    font-weight: 500;
  }

  .day-prose :global(h2:first-child),
  .day-prose :global(h3:first-child) {
    margin-top: 0;
  }

  .day-prose :global(p) {
    font-size: 1.02rem;
    line-height: 1.65;
    color: var(--text);
    margin: 0 0 0.75rem 0;
  }

  .day-prose :global(ul) {
    list-style-type: disc;
    padding-left: 1.25rem;
    margin: 0 0 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .day-prose :global(li) {
    font-size: 0.98rem;
    line-height: 1.6;
    color: var(--text);
  }

  .day-prose :global(a) {
    color: oklch(0.75 0.18 240);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .day-prose :global(a:hover) {
    color: oklch(0.9 0.15 240);
  }

  .day-prose :global(strong) {
    color: var(--text);
    font-weight: 600;
  }

  .day-prose :global(em) {
    font-style: italic;
  }

  .day-prose :global(code) {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.85em;
    background: oklch(1 0 0 / 0.08);
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
  }

  /* Day pagination */
  .day-pagination {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--glass-border, oklch(1 0 0 / 0.08));
  }

  .pagination-prev,
  .pagination-next {
    flex: 1;
  }

  .pagination-link {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--glass-border, oklch(1 0 0 / 0.08));
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .pagination-link--next {
    text-align: right;
    align-items: flex-end;
  }

  .pagination-link:hover {
    background: oklch(1 0 0 / 0.04);
    border-color: var(--text-secondary);
  }

  .pagination-sub {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-secondary);
  }

  .pagination-name {
    font-size: 0.9rem;
    color: var(--text);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  @media (max-width: 640px) {
    .day-title {
      font-size: 1.85rem;
    }
    .day-pagination {
      flex-direction: column;
    }
    .pagination-link--next {
      text-align: left;
      align-items: flex-start;
    }
  }
</style>
