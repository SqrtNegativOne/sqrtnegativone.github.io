<script lang="ts">
  import Seo from '$shared/components/Seo.svelte';
  import NowBook from '$shared/components/NowBook.svelte';
  import type { NowBookItem } from '$shared/lib/arcs';

  let { data } = $props<{ data: { items: NowBookItem[] } }>();
</script>

<Seo
  title="Now — Sqrt-1"
  description="The arcs Sqrt-1 is currently living through: ongoing projects, focuses, and seasons."
  path="/now"
/>

<div class="now-page">
  <header class="now-header">
    <div class="header-tag">
      <span class="pulse-dot"></span>
      <span class="tag-text">ONGOING ARCS</span>
    </div>

    <h1 class="page-title">Now</h1>

    <p class="intro">
      A phone-book index of the arcs I'm currently inside. Pick a tab on the left;
      the right-hand page opens.
    </p>

    <p class="sivers-note">
      This is a <a href="https://nownownow.com/about" target="_blank" rel="noopener noreferrer">/now page</a>
      detailing what I'm actively focused on.
    </p>
  </header>

  <NowBook
    items={data.items}
    label="Arcs"
    emptyTitle="No arcs on the shelf"
    emptyMessage="Nothing is running right now. Check back when the next arc begins."
  />
</div>

<style>
  .now-page {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
    max-width: 56rem;
    margin: 0 auto;
    padding-bottom: 2rem;
  }

  .now-header {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--glass-border, oklch(1 0 0 / 0.08));
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
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.4;
      transform: scale(0.85);
    }
  }

  .tag-text {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .page-title {
    margin: 0.15rem 0 0;
    font-family: "Instrument Serif", Georgia, serif;
    font-size: 3.25rem;
    font-weight: 400;
    line-height: 1;
    color: var(--text);
  }

  .intro {
    max-width: 40rem;
    margin: 0;
    font-size: 1rem;
    line-height: 1.65;
    color: var(--text);
  }

  .sivers-note {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.55;
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

  @media (max-width: 640px) {
    .page-title {
      font-size: 2.5rem;
    }
  }
</style>
