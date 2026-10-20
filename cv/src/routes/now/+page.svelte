<script lang="ts">
  import Seo from '$shared/components/Seo.svelte';
  import NowBook from '$shared/components/NowBook.svelte';
  import type { NowBookItem } from '$shared/lib/arcs';

  let { data } = $props<{ data: { items: NowBookItem[] } }>();
</script>

<Seo
  title="Now — Ark Malhotra"
  description="What Ark Malhotra is focused on right now: current work, study, and projects."
  path="/now"
  base="https://cv.sqrt.fyi"
/>

<div class="now-page">
  <header class="now-head">
    <p class="eyebrow">CURRENT FOCUS</p>
    <h1>Now</h1>
    <p class="lede">
      The work and study I'm actively focused on at the moment. Pick an area to
      read more.
    </p>
  </header>

  <NowBook
    items={data.items}
    label="Focus areas"
    emptyKicker="NO CURRENT FOCUS"
    emptyTitle="Nothing in focus right now"
    emptyMessage="There are no current focus areas listed. Check back soon."
  />
</div>

<style>
  .now-page {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    width: 100%;
    min-width: 0;
  }

  .now-head {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    padding-bottom: 1.1rem;
    border-bottom: 1px solid var(--glass-border, oklch(1 0 0 / 0.08));
  }

  .eyebrow {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.68rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  h1 {
    margin: 0.1rem 0 0;
    font-family: "Instrument Serif", Georgia, serif;
    font-size: 3rem;
    font-weight: 400;
    line-height: 1;
    color: var(--text);
  }

  .lede {
    max-width: 36rem;
    margin: 0;
    font-size: 1rem;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  @media (max-width: 640px) {
    h1 {
      font-size: 2.4rem;
    }

    .lede {
      font-size: 0.95rem;
    }
  }
</style>
