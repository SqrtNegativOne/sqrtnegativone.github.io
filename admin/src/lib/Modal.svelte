<script lang="ts">
  import type { Snippet } from 'svelte';
  import { tick, untrack } from 'svelte';
  import { isTopModal, popModal, pushModal } from '$lib/modalStack';

  interface Props {
    /** Used only for the dialog's accessible name — there is no visible title bar. */
    title?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
    open?: boolean;
    onclose: () => void;
    /** Optional custom save action. Defaults to submitting the first form in the modal. */
    onsave?: () => void;
    /** When true, Esc/backdrop asks to confirm before discarding. */
    dirty?: boolean;
    /** When true, save shortcuts are ignored (e.g. while a request is in flight). */
    saving?: boolean;
    /** Extra classes for the scrollable body. */
    bodyClass?: string;
    children: Snippet;
    footer?: Snippet;
  }

  let {
    title = 'Dialog',
    maxWidth = 'lg',
    open = true,
    onclose,
    onsave,
    dirty = false,
    saving = false,
    bodyClass = 'overflow-y-auto p-6 space-y-4',
    children,
    footer
  }: Props = $props();

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl'
  };

  const modalId = Symbol('modal');

  let panel: HTMLDivElement | undefined = $state();
  let restoreFocus: HTMLElement | null = null;
  let confirmDiscard = $state(false);
  let paletteOpen = $state(false);
  let paletteQuery = $state('');
  let paletteIndex = $state(0);
  let paletteInput: HTMLInputElement | undefined = $state();

  type FieldEntry = { el: HTMLElement; label: string };
  let fields = $state<FieldEntry[]>([]);

  const FOCUSABLE_SELECTOR =
    'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

  // Register with the shared stack and move focus into the modal while it is open.
  $effect(() => {
    if (!open) return;
    pushModal(modalId);
    restoreFocus = document.activeElement as HTMLElement | null;

    tick().then(() => {
      const target =
        (panel?.querySelector('[data-autofocus]') as HTMLElement | null) ??
        (panel?.querySelector(FOCUSABLE_SELECTOR) as HTMLElement | null);
      target?.focus();
    });

    return () => {
      popModal(modalId);
      restoreFocus?.focus?.();
    };
  });

  // Reset transient UI whenever the modal opens.
  $effect(() => {
    if (!open) return;
    untrack(() => {
      confirmDiscard = false;
      paletteOpen = false;
      paletteQuery = '';
      paletteIndex = 0;
    });
  });

  function focusables(): HTMLElement[] {
    if (!panel) return [];
    return Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[];
  }

  function requestSave() {
    if (saving) return;
    if (onsave) {
      onsave();
      return;
    }
    panel?.querySelector('form')?.requestSubmit();
  }

  function attemptClose() {
    if (dirty && !confirmDiscard) {
      confirmDiscard = true;
      return;
    }
    onclose();
  }

  function fieldLabel(el: HTMLElement): string {
    const explicit = el.getAttribute('data-field');
    if (explicit) return explicit;

    const id = el.getAttribute('id');
    if (id) {
      const label = panel?.querySelector(`label[for="${id}"]`);
      const text = label?.textContent?.replace(/\s+/g, ' ').trim();
      if (text) return text;
    }

    const aria = el.getAttribute('aria-label');
    if (aria) return aria;

    const placeholder = el.getAttribute('placeholder');
    if (placeholder) return placeholder;

    const wrapping = el.closest('label')?.textContent?.replace(/\s+/g, ' ').trim();
    if (wrapping) return wrapping;

    return el.getAttribute('name') || 'Field';
  }

  function collectFields() {
    if (!panel) return;
    fields = (
      Array.from(
        panel.querySelectorAll(
          'input:not([type="hidden"]):not([disabled]):not([data-no-field]), textarea:not([disabled]):not([data-no-field]), select:not([disabled]):not([data-no-field])'
        )
      ) as HTMLElement[]
    )
      .map((el) => ({ el, label: fieldLabel(el) }))
      .filter((entry) => entry.label);
  }

  function openPalette() {
    collectFields();
    paletteOpen = true;
    paletteQuery = '';
    paletteIndex = 0;
    tick().then(() => paletteInput?.focus());
  }

  let filteredFields = $derived.by(() => {
    const query = paletteQuery.trim().toLowerCase();
    if (!query) return fields;
    return fields.filter((field) => field.label.toLowerCase().includes(query));
  });

  function chooseField(field: FieldEntry) {
    paletteOpen = false;
    field.el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    field.el.focus();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!open || !isTopModal(modalId)) return;
    const mod = e.ctrlKey || e.metaKey;

    if (paletteOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        paletteOpen = false;
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        paletteIndex = Math.min(paletteIndex + 1, filteredFields.length - 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        paletteIndex = Math.max(paletteIndex - 1, 0);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const field = filteredFields[paletteIndex];
        if (field) chooseField(field);
      } else if (e.key === 'Tab') {
        e.preventDefault();
      }
      return;
    }

    if (mod && !e.altKey && (e.key === 's' || e.key === 'S' || e.key === 'Enter')) {
      e.preventDefault();
      requestSave();
      return;
    }

    if (mod && !e.altKey && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      openPalette();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      if (confirmDiscard) {
        confirmDiscard = false;
        return;
      }
      attemptClose();
      return;
    }

    if (e.key === 'Tab') {
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !panel?.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !panel?.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) attemptClose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    onclick={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-label={title}
    data-modal="true"
    tabindex="-1"
  >
    <div
      bind:this={panel}
      class="relative bg-[oklch(0.2103_0.0059_285.89)] border border-[oklch(0.2739_0.0055_286.03)] rounded shadow-2xl w-full {maxWidthClasses[
        maxWidth
      ]} max-h-[90vh] flex flex-col overflow-hidden"
    >
      <!-- Field jump palette (Ctrl/Cmd + K) -->
      {#if paletteOpen}
        <div
          class="absolute inset-x-3 top-3 z-30 rounded border border-[oklch(0.34_0.005_286.03)] bg-[oklch(0.1603_0.0059_285.89)] shadow-2xl shadow-black/70 overflow-hidden"
        >
          <input
            data-no-field
            bind:this={paletteInput}
            bind:value={paletteQuery}
            oninput={() => (paletteIndex = 0)}
            placeholder="Jump to field…"
            class="w-full bg-transparent border-b border-[oklch(0.2739_0.0055_286.03)] px-4 py-2.5 text-sm text-white placeholder-[oklch(0.60_0.02_256.79)] focus:outline-none"
          />
          <div class="max-h-56 overflow-y-auto py-1">
            {#if filteredFields.length === 0}
              <div class="px-4 py-2 text-xs text-[oklch(0.60_0.02_256.79)]">No matching field</div>
            {:else}
              {#each filteredFields as field, i (field.el)}
                <button
                  type="button"
                  onclick={() => chooseField(field)}
                  onmouseenter={() => (paletteIndex = i)}
                  class="w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer {i === paletteIndex
                    ? 'bg-blue-500/15 text-white'
                    : 'text-[oklch(0.80_0.02_256.79)] hover:bg-white/5'}"
                >
                  {field.label}
                </button>
              {/each}
            {/if}
          </div>
        </div>
      {/if}

      <!-- Body -->
      <div class="flex-1 {bodyClass}">
        {@render children()}
      </div>

      <!-- Discard confirmation -->
      {#if confirmDiscard}
        <div
          class="px-6 py-3 border-t border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-3 shrink-0"
        >
          <span class="text-sm text-amber-200">Discard unsaved changes?</span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn-secondary text-xs px-3 py-1.5"
              onclick={() => (confirmDiscard = false)}
            >
              Keep editing
            </button>
            <button
              type="button"
              class="text-xs px-3 py-1.5 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors cursor-pointer"
              onclick={onclose}
            >
              Discard
            </button>
          </div>
        </div>
      {/if}

      <!-- Footer -->
      {#if footer}
        <div
          class="px-6 py-4 border-t border-[oklch(0.2739_0.0055_286.03)] flex justify-end items-center gap-3 bg-[oklch(0.1603_0.0059_285.89)] shrink-0"
        >
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}
