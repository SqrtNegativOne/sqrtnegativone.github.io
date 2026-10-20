<script lang="ts">
  import TypeBadge from './TypeBadge.svelte';
  import type { MediaGroup } from '../lib/mediaLibrary';

  let {
    group,
    id = undefined,
    panelId = undefined,
    expanded = false,
    onToggle
  }: {
    group: MediaGroup;
    id?: string;
    /** id of the panel this heading controls, wired to aria-controls. */
    panelId?: string;
    expanded?: boolean;
    onToggle: () => void;
  } = $props();
</script>

<h3 {id} class="ml-group-heading">
  <button
    type="button"
    class="ml-group-toggle"
    aria-expanded={expanded}
    aria-controls={panelId}
    onclick={onToggle}
  >
    <span class="ml-group-chevron" class:ml-group-chevron--expanded={expanded} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>
    </span>
    <TypeBadge type={group.key} variant="icon" sizeClass="w-4 h-4" />
    <span class="ml-group-label">{group.label}</span>
    <span class="ml-group-count">{group.items.length}</span>
  </button>
</h3>

<style>
  .ml-group-heading {
    margin: 0;
    font-family: "IBM Plex Mono", ui-monospace, monospace;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: oklch(0.785 0.0112 286.14);
  }

  .ml-group-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    text-align: left;
    cursor: pointer;
  }

  .ml-group-toggle:focus-visible {
    outline: 2px solid oklch(0.72 0.12 250);
    outline-offset: 4px;
    border-radius: 4px;
  }

  .ml-group-chevron {
    display: inline-flex;
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    color: oklch(0.6363 0.0133 286.02);
    transition: transform 150ms ease;
  }

  .ml-group-chevron svg {
    width: 100%;
    height: 100%;
  }

  .ml-group-chevron--expanded {
    transform: rotate(90deg);
  }

  .ml-group-toggle:hover .ml-group-label {
    color: oklch(0.9707 0.0027 286.35);
  }

  .ml-group-label {
    line-height: 1;
  }

  .ml-group-count {
    padding: 1px 7px;
    border-radius: 999px;
    background: oklch(1 0 0 / 0.06);
    color: oklch(0.6363 0.0133 286.02);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.08em;
    line-height: 1.6;
  }

  @media (prefers-reduced-motion: reduce) {
    .ml-group-chevron {
      transition: none;
    }
  }
</style>
