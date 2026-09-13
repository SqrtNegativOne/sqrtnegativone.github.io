<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';

  interface Shortcut {
    keys: string[];
    label: string;
  }

  interface ShortcutSection {
    title: string;
    /** Show this section only when the current path starts with one of these prefixes. Omit for always-on. */
    routes?: string[];
    shortcuts: Shortcut[];
  }

  const sections: ShortcutSection[] = [
    {
      title: 'General',
      shortcuts: [
        { keys: ['?'], label: 'Show / hide this cheat sheet' },
        { keys: ['/'], label: 'Focus the search bar' },
        { keys: ['Ctrl', 'N'], label: 'Create a new item on this page' },
        { keys: ['N'], label: 'Create a new item (when not typing)' },
        { keys: ['Esc'], label: 'Close the active dialog' }
      ]
    },
    {
      title: 'Media editor',
      routes: ['/media'],
      shortcuts: [
        { keys: ['Ctrl', 'S'], label: 'Save the media item' },
        { keys: ['Ctrl', 'Enter'], label: 'Save from inside any field' },
        { keys: ['Enter'], label: 'Search metadata (new item, title field)' },
        { keys: ['Esc'], label: 'Cancel edit / close match results' }
      ]
    },
    {
      title: 'Now entries',
      routes: ['/now'],
      shortcuts: [
        { keys: ['Ctrl', 'S'], label: 'Save the day entry' },
        { keys: ['Esc'], label: 'Close the editor' }
      ]
    },
    {
      title: 'Questions',
      routes: ['/questions'],
      shortcuts: [{ keys: ['Ctrl', 'S'], label: 'Save the markdown' }]
    }
  ];

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);
  const modKey = $derived(isMac ? '⌘' : 'Ctrl');

  let open = $state(false);

  const visibleSections = $derived(
    sections.filter(
      (s) => !s.routes || s.routes.some((prefix) => page.url.pathname.startsWith(prefix))
    )
  );

  function displayKey(key: string): string {
    if (!isMac) return key;
    if (key === 'Ctrl') return modKey;
    if (key === 'Enter') return '↵';
    return key;
  }

  function onKeydown(e: KeyboardEvent) {
    const target = e.target as HTMLElement | null;
    const isInput =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      !!target?.isContentEditable;

    // Escape closes the cheat sheet before anything beneath it reacts.
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      e.stopImmediatePropagation();
      open = false;
      return;
    }

    const isQuestionMark = e.key === '?' || (e.key === '/' && e.shiftKey);
    if (isQuestionMark && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      e.stopImmediatePropagation();
      open = !open;
    }
  }

  onMount(() => {
    // Capture phase so the sheet can intercept Escape before open modals close.
    window.addEventListener('keydown', onKeydown, true);
    return () => window.removeEventListener('keydown', onKeydown, true);
  });
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    onclick={() => (open = false)}
    role="dialog"
    aria-modal="true"
    data-modal-kind="shortcuts"
    tabindex="-1"
  >
    <div
      class="bg-[oklch(0.2103_0.0059_285.89)] border border-[oklch(0.2739_0.0055_286.03)] rounded shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <div class="px-6 py-4 border-b border-[oklch(0.2739_0.0055_286.03)] bg-[oklch(0.1603_0.0059_285.89)] flex justify-between items-center shrink-0">
        <div>
          <h2 class="text-xl font-semibold text-white tracking-tight">Keyboard shortcuts</h2>
          <p class="text-xs text-[oklch(0.7107_0.0351_256.79)] mt-0.5">Press <kbd class="kbd">?</kbd> anytime to toggle this panel.</p>
        </div>
        <button
          type="button"
          aria-label="Close shortcuts"
          onclick={() => (open = false)}
          class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white p-1 rounded transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        {#each visibleSections as section (section.title)}
          <section class="space-y-2">
            <h3 class="text-[11px] font-mono uppercase tracking-[0.16em] text-amber-400/90">{section.title}</h3>
            <ul class="divide-y divide-[oklch(0.2739_0.0055_286.03)] rounded border border-[oklch(0.2739_0.0055_286.03)] overflow-hidden">
              {#each section.shortcuts as shortcut (shortcut.label)}
                <li class="flex items-center justify-between gap-4 px-4 py-2.5 bg-[oklch(0.1603_0.0059_285.89)]/40">
                  <span class="text-sm text-[oklch(0.80_0.02_256.79)]">{shortcut.label}</span>
                  <span class="flex items-center gap-1 shrink-0">
                    {#each shortcut.keys as key, i (key)}
                      {#if i > 0}<span class="text-[oklch(0.60_0.02_256.79)] text-xs">+</span>{/if}
                      <kbd class="kbd">{displayKey(key)}</kbd>
                    {/each}
                  </span>
                </li>
              {/each}
            </ul>
          </section>
        {/each}
      </div>

      <div class="px-6 py-3 border-t border-[oklch(0.2739_0.0055_286.03)] bg-[oklch(0.1603_0.0059_285.89)] text-[11px] text-[oklch(0.60_0.02_256.79)] shrink-0">
        Shortcuts are context-aware and change with the page you are on.
      </div>
    </div>
  </div>
{/if}

<style>
  .kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.6rem;
    padding: 0.15rem 0.4rem;
    font-family: "IBM Plex Mono", ui-monospace, monospace;
    font-size: 11px;
    line-height: 1;
    color: oklch(0.85 0.01 256.79);
    background: oklch(0.28 0.005 285.89);
    border: 1px solid oklch(0.34 0.005 286.03);
    border-bottom-width: 2px;
    border-radius: 4px;
    white-space: nowrap;
  }
</style>
