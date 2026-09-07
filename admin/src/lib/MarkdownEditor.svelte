<script lang="ts">
  import markdownIt from 'markdown-it';

  interface Props {
    value: string;
    placeholder?: string;
    minHeight?: string;
    showStats?: boolean;
    previewClass?: string;
    onkeydown?: (e: KeyboardEvent) => void;
  }

  let {
    value = $bindable(''),
    placeholder = 'Write Markdown here...',
    minHeight = '350px',
    showStats = true,
    previewClass = '',
    onkeydown
  }: Props = $props();

  const md = markdownIt({ html: true, linkify: true, typographer: true });

  let viewMode: 'split' | 'edit' | 'preview' = $state('split');
  let renderedPreview = $derived(md.render(value || '*(No content written yet)*'));

  let stats = $derived(() => {
    const text = value.trim();
    if (!text) return { lines: 0, words: 0, chars: 0 };
    const lines = text.split('\n').length;
    const words = text.split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    return { lines, words, chars };
  });
</script>

<div class="flex flex-col space-y-3">
  <!-- View Mode Switcher -->
  <div class="flex justify-end items-center">
    <div class="flex bg-[oklch(0.1803_0.0059_285.89)] rounded-lg p-0.5 border border-[oklch(0.2739_0.0055_286.03)] text-xs">
      <button
        type="button"
        class="px-2.5 py-1 rounded transition-colors cursor-pointer {viewMode === 'edit' ? 'bg-blue-500/20 text-blue-400 font-semibold' : 'text-[oklch(0.7107_0.0351_256.79)] hover:text-white'}"
        onclick={() => viewMode = 'edit'}
      >
        Editor
      </button>
      <button
        type="button"
        class="px-2.5 py-1 rounded transition-colors cursor-pointer {viewMode === 'split' ? 'bg-blue-500/20 text-blue-400 font-semibold' : 'text-[oklch(0.7107_0.0351_256.79)] hover:text-white'}"
        onclick={() => viewMode = 'split'}
      >
        Split
      </button>
      <button
        type="button"
        class="px-2.5 py-1 rounded transition-colors cursor-pointer {viewMode === 'preview' ? 'bg-blue-500/20 text-blue-400 font-semibold' : 'text-[oklch(0.7107_0.0351_256.79)] hover:text-white'}"
        onclick={() => viewMode = 'preview'}
      >
        Preview
      </button>
    </div>
  </div>

  <!-- Panels Grid -->
  <div
    class="grid gap-4"
    class:grid-cols-1={viewMode !== 'split'}
    class:md:grid-cols-2={viewMode === 'split'}
    style="min-height: {minHeight};"
  >
    {#if viewMode !== 'preview'}
      <div class="flex flex-col bg-black/40 rounded-xl border border-[oklch(0.2739_0.0055_286.03)] overflow-hidden">
        <textarea
          bind:value
          {placeholder}
          {onkeydown}
          class="w-full flex-1 bg-transparent text-white font-mono text-sm leading-relaxed p-4 focus:outline-none resize-none"
          style="min-height: {minHeight};"
        ></textarea>
        {#if showStats}
          <div class="px-3 py-1.5 bg-[oklch(0.1803_0.0059_285.89)] border-t border-[oklch(0.2739_0.0055_286.03)] text-[11px] text-[oklch(0.7107_0.0351_256.79)] font-mono flex justify-between items-center">
            <span>Ctrl+S to save</span>
            <span>{stats().lines} lines · {stats().words} words · {stats().chars} chars</span>
          </div>
        {/if}
      </div>
    {/if}

    {#if viewMode !== 'edit'}
      <div class="flex flex-col bg-black/70 rounded-xl border border-[oklch(0.2739_0.0055_286.03)] overflow-y-auto p-5 text-white {previewClass}">
        <div class="markdown-preview text-sm leading-relaxed">
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html renderedPreview}
        </div>
      </div>
    {/if}
  </div>
</div>
