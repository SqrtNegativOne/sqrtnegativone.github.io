<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { clickOutside } from "../actions/clickOutside.js";
  import ShaderImage from "./ShaderImage.svelte";

  export let project; // oxlint-disable-line no-unassigned-vars - false positive: assigned by svelte compiler
  export let index; // oxlint-disable-line no-unassigned-vars - false positive: assigned by svelte compiler

  let expanded = false;

  const id = Math.random().toString(36).substr(2, 9);
  const cardId = `card-${project.id}-${id}`;
  const imgId = `img-${project.id}-${id}`;
  const titleId = `title-${project.id}-${id}`;

  const GithubIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>`;
  const ExternalIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>`;

  function onKey(e) {
    if (e.key === "Escape") expanded = false;
  }

  function handleClose() {
    expanded = false;
  }

  function handleOpen() {
    expanded = true;
  }
</script>

<svelte:window on:keydown={onKey} />

{#if expanded}
  <!-- Dim backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-[10001] bg-black/50"
    transition:fade={{ duration: 200 }}
    onclick={handleClose}
  ></div>

  <!-- Modal -->
  <div class="fixed inset-0 z-[10002] grid place-items-center p-6 pointer-events-none">
    <div
      use:clickOutside={handleClose}
      class="pointer-events-auto w-full max-w-[480px] max-h-[85vh] overflow-y-auto [scrollbar-width:none] flex flex-col bg-[var(--bg)] border border-[var(--text-secondary)]"
    >
      <!-- Close button -->
      <button
        onclick={handleClose}
        aria-label="Close"
        class="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center border border-[var(--glass-border)] bg-[var(--bg)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--text-secondary)] transition-colors font-['IBM_Plex_Mono'] text-xs"
      >
        ×
      </button>

      <!-- Image -->
      {#if project.image}
        <div class="w-full h-64 flex-shrink-0">
          <ShaderImage
            src={project.image}
            alt={project.name}
            class="w-full h-full"
            width={480}
            height={256}
          />
        </div>
      {/if}

      <!-- Content -->
      <div class="p-6 flex flex-col gap-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2
              class="font-['Instrument_Serif'] italic text-2xl font-normal text-[var(--text)] leading-tight"
            >
              {project.name}
            </h2>
            {#if project.private}
              <span class="font-['IBM_Plex_Mono'] text-[0.5rem] tracking-widest border border-[var(--glass-border)] px-1.5 py-0.5 text-[var(--text-secondary)] opacity-60 mt-1 inline-block">
                private
              </span>
            {/if}
          </div>
          {#if project.github || project.url}
            <div class="flex gap-3 flex-shrink-0 mt-1">
              {#if project.github}
                <a href={project.github} target="_blank" rel="noopener noreferrer"
                  class="font-['IBM_Plex_Mono'] text-[0.6rem] text-[var(--text-secondary)] hover:text-[var(--text)] flex items-center gap-1.5 border-b border-dotted border-[var(--text-secondary)] pb-px transition-colors">
                  {@html GithubIcon} src
                </a>
              {/if}
              {#if project.url}
                <a href={project.url} target="_blank" rel="noopener noreferrer"
                  class="font-['IBM_Plex_Mono'] text-[0.6rem] text-[var(--text-secondary)] hover:text-[var(--text)] flex items-center gap-1.5 border-b border-dotted border-[var(--text-secondary)] pb-px transition-colors">
                  {@html ExternalIcon} live
                </a>
              {/if}
            </div>
          {/if}
        </div>

        <p
          transition:fade={{ duration: 200 }}
          class="font-['Inter'] text-sm text-[var(--text-secondary)] leading-relaxed"
        >
          {project.description}
        </p>

        {#if project.tags.length > 0}
          <div class="flex flex-wrap gap-x-3 gap-y-1">
            {#each project.tags as tag}
              <span class="font-['IBM_Plex_Mono'] text-[0.5rem] tracking-wide text-[var(--text-secondary)] opacity-55">
                {tag}
              </span>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- ── Collapsed card in carousel ─────────────── -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<article
  class="project-card flex-none w-[360px] flex flex-col border border-[var(--glass-border)] hover:border-[var(--text-secondary)] transition-all overflow-hidden cursor-pointer group hover:shadow-[0_0_24px_rgba(var(--text-secondary-rgb),0.15)]"
  style="visibility: {expanded ? 'hidden' : 'visible'};"
  onclick={handleOpen}
>
  <!-- Image -->
  {#if project.image}
    <div class="w-full h-52 flex-shrink-0">
      <ShaderImage
        src={project.image}
        alt={project.name}
        class="w-full h-full"
        width={360}
        height={208}
      />
    </div>
  {:else}
    <!-- Placeholder when no image — subtle gradient -->
    <div class="w-full h-52 flex-shrink-0 bg-gradient-to-br from-[var(--glass-bg)] to-transparent flex items-center justify-center">
      <span class="font-['IBM_Plex_Mono'] text-[2rem] opacity-10 select-none">
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  {/if}

  <!-- Text area -->
  <div class="flex flex-col flex-1 p-6 gap-0">
    <!-- Header row -->
    <div class="flex justify-end items-center mb-3">
      <div class="flex items-center gap-2">
        {#if project.private}
          <span class="font-['IBM_Plex_Mono'] text-[0.45rem] tracking-widest border border-[var(--glass-border)] px-1.5 py-0.5 text-[var(--text-secondary)] opacity-60">
            private
          </span>
        {/if}
        <span class="font-['IBM_Plex_Mono'] text-[0.45rem] tracking-widest text-[var(--text-secondary)] opacity-0 group-hover:opacity-50 transition-opacity">
          expand ↗
        </span>
      </div>
    </div>

    <!-- Title + description -->
    <div class="flex flex-col flex-1 gap-2">
      <h3
        class="font-['Instrument_Serif'] italic text-lg font-normal text-[var(--text)] leading-snug"
      >
        {project.name}
      </h3>
      <p class="font-['Inter'] text-[0.72rem] text-[var(--text-secondary)] leading-relaxed line-clamp-4 flex-1">
        {project.description}
      </p>
    </div>

    <!-- Footer -->
    <div class="mt-4 flex flex-col gap-1.5">
      {#if project.tags.length > 0}
        <div class="flex flex-wrap gap-x-2 gap-y-1">
          {#each project.tags as tag}
            <span class="font-['IBM_Plex_Mono'] text-[0.45rem] tracking-wide text-[var(--text-secondary)] opacity-55">
              {tag}
            </span>
          {/each}
        </div>
      {/if}
      {#if project.github || project.url}
        <div class="flex gap-3 mt-1">
          {#if project.github}
            <a href={project.github} target="_blank" rel="noopener noreferrer"
              onclick={(e) => e.stopPropagation()}
              class="font-['IBM_Plex_Mono'] text-[0.5rem] text-[var(--text-secondary)] hover:text-[var(--text)] flex items-center gap-1 border-b border-dotted border-[var(--text-secondary)] pb-px transition-colors">
              {@html GithubIcon} src
            </a>
          {/if}
          {#if project.url}
            <a href={project.url} target="_blank" rel="noopener noreferrer"
              onclick={(e) => e.stopPropagation()}
              class="font-['IBM_Plex_Mono'] text-[0.5rem] text-[var(--text-secondary)] hover:text-[var(--text)] flex items-center gap-1 border-b border-dotted border-[var(--text-secondary)] pb-px transition-colors">
              {@html ExternalIcon} live
            </a>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</article>
