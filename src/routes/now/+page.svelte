<script lang="ts">
  import markdownIt from 'markdown-it';
  import Seo from '$lib/components/Seo.svelte';
  import { formatNowDate, type NowEntry } from '$lib/now';

  let { data } = $props<{ data: { entries: NowEntry[]; latest: NowEntry | null } }>();

  const md = markdownIt({ html: true, linkify: true, typographer: true });

  let renderedLatest = $derived(
    data.latest ? md.render(data.latest.content) : ''
  );

  let pastEntries = $derived(
    data.entries.length > 1 ? data.entries.slice(1) : []
  );
</script>

<Seo
  title="Now — Ark Malhotra"
  description="What Ark Malhotra is currently learning, building, and reading."
  path="/now"
/>

<div class="now-container">
  <!-- Page Header -->
  <header class="now-header">
    <div class="header-tag">
      <span class="pulse-dot"></span>
      <span class="tag-text">CURRENT STATUS</span>
    </div>
    <div class="sivers-note">
      This is a <a href="https://nownownow.com/about" target="_blank" rel="noopener noreferrer">/now page</a> detailing what I'm actively focused on.
    </div>
  </header>

  {#if data.latest}
    <!-- Latest / Featured Day Entry -->
    <article class="latest-card">
      <div class="latest-meta">
        <time datetime={data.latest.date} class="entry-date">
          {formatNowDate(data.latest.date)}
        </time>
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <a href="/now/{data.latest.date}" class="permalink-pill" title="Individual day page">
          <span>permalink</span>
          <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {#if data.latest.title}
        <h1 class="latest-title">{data.latest.title}</h1>
      {/if}

      <div class="now-prose">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html renderedLatest}
      </div>
    </article>
  {:else}
    <div class="empty-state">
      <p>No day entries posted yet.</p>
    </div>
  {/if}

  <!-- Previous Day Pages Archive -->
  {#if pastEntries.length > 0}
    <section class="archive-section" aria-labelledby="archive-heading">
      <div class="archive-header">
        <h2 id="archive-heading" class="archive-title">PAST LOGS ({pastEntries.length})</h2>
        <span class="archive-sub">Previous daily snapshots</span>
      </div>

      <div class="archive-list">
        {#each pastEntries as entry (entry.id)}
          <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
          <a href="/now/{entry.date}" class="archive-item">
            <div class="archive-item-left">
              <span class="archive-item-date">{entry.date}</span>
              {#if entry.title}
                <span class="archive-item-title">{entry.title}</span>
              {/if}
            </div>
            <div class="archive-item-arrow" aria-hidden="true">
              <span>View</span> &rarr;
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}
</div>

<style>
  .now-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding-bottom: 2rem;
  }

  .now-header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-bottom: 1px solid var(--glass-border, oklch(1 0 0 / 0.08));
    padding-bottom: 1.25rem;
  }

  .header-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .pulse-dot {
    width: 7px;
    height: 7px;
    border-radius: 9999px;
    background-color: oklch(0.85 0.18 150);
    box-shadow: 0 0 10px oklch(0.85 0.18 150 / 0.8);
    animation: pulse 2s infinite ease-in-out;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.85); }
  }

  .tag-text {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    color: var(--text-secondary);
    text-transform: uppercase;
  }

  .sivers-note {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .sivers-note a {
    color: var(--text);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .sivers-note a:hover {
    color: oklch(0.85 0.15 220);
  }

  /* Latest Card */
  .latest-card {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .latest-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .entry-date {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.85rem;
    color: var(--text-secondary);
    letter-spacing: 0.05em;
  }

  .permalink-pill {
    display: inline-flex;
    align-items: center;
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-secondary);
    background: oklch(1 0 0 / 0.04);
    border: 1px solid var(--glass-border, oklch(1 0 0 / 0.1));
    padding: 0.25rem 0.6rem;
    border-radius: 9999px;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .permalink-pill:hover {
    color: var(--text);
    background: oklch(1 0 0 / 0.1);
    border-color: oklch(1 0 0 / 0.25);
  }

  .latest-title {
    font-family: "Instrument Serif", Georgia, serif;
    font-size: 2.2rem;
    line-height: 1.15;
    color: var(--text);
    font-weight: 400;
    margin: 0;
  }

  /* Markdown prose styling */
  .now-prose {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .now-prose :global(h2),
  .now-prose :global(h3) {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.85rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin: 1.25rem 0 0.5rem 0;
    font-weight: 500;
  }

  .now-prose :global(h2:first-child),
  .now-prose :global(h3:first-child) {
    margin-top: 0;
  }

  .now-prose :global(p) {
    font-size: 1.02rem;
    line-height: 1.65;
    color: var(--text);
    margin: 0 0 0.75rem 0;
  }

  .now-prose :global(ul) {
    list-style-type: disc;
    padding-left: 1.25rem;
    margin: 0 0 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .now-prose :global(li) {
    font-size: 0.98rem;
    line-height: 1.6;
    color: var(--text);
  }

  .now-prose :global(a) {
    color: oklch(0.75 0.18 240);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .now-prose :global(a:hover) {
    color: oklch(0.9 0.15 240);
  }

  .now-prose :global(strong) {
    color: var(--text);
    font-weight: 600;
  }

  .now-prose :global(em) {
    font-style: italic;
  }

  .now-prose :global(code) {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.85em;
    background: oklch(1 0 0 / 0.08);
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
  }

  /* Archive Section */
  .archive-section {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--glass-border, oklch(1 0 0 / 0.08));
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .archive-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
  }

  .archive-title {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-weight: 500;
  }

  .archive-sub {
    font-size: 0.75rem;
    color: var(--text-secondary);
    opacity: 0.7;
  }

  .archive-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .archive-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--glass-border, oklch(1 0 0 / 0.08));
    background: transparent;
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .archive-item:hover {
    background: oklch(1 0 0 / 0.04);
    border-color: var(--text-secondary);
    transform: translateX(3px);
  }

  .archive-item-left {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .archive-item-date {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.8rem;
    color: var(--text-secondary);
    letter-spacing: 0.05em;
  }

  .archive-item-title {
    font-size: 0.95rem;
    color: var(--text);
    font-weight: 500;
  }

  .archive-item-arrow {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.75rem;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 0.35rem;
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .archive-item:hover .archive-item-arrow {
    opacity: 1;
    color: var(--text);
  }

  .empty-state {
    padding: 3rem 1rem;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  @media (max-width: 640px) {
    .latest-title {
      font-size: 1.75rem;
    }
  }
</style>
