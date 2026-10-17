<script lang="ts">
  let {
    tags = $bindable<string[]>([]),
    suggestions = [],
    placeholder = 'Add tags…'
  }: {
    tags?: string[];
    suggestions?: string[];
    placeholder?: string;
  } = $props();

  let input = $state('');
  let focused = $state(false);
  let inputEl: HTMLInputElement | undefined = $state();

  /** Normalises tags so the library never accumulates "bad" tags (case/space dupes). */
  function normalizeTag(raw: string): string {
    return raw
      .toLowerCase()
      .replace(/[^a-z0-9 _-]/g, '')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function commit(raw: string) {
    const tag = normalizeTag(raw);
    if (!tag) {
      input = '';
      return;
    }
    if (!tags.some((t) => normalizeTag(t) === tag)) {
      tags = [...tags, tag];
    }
    input = '';
    inputEl?.focus();
  }

  function removeTag(index: number) {
    tags = tags.filter((_, i) => i !== index);
  }

  function removeLast() {
    if (tags.length > 0) tags = tags.slice(0, -1);
  }

  let pool = $derived.by(() => {
    const added = new Set(tags.map(normalizeTag));
    return (suggestions || [])
      .map((s) => ({ raw: String(s), norm: normalizeTag(String(s)) }))
      .filter((s) => s.norm && !added.has(s.norm));
  });

  let matching = $derived.by(() => {
    const q = normalizeTag(input);
    const list = q ? pool.filter((s) => s.norm.includes(q)) : pool;
    return list.slice(0, 8);
  });

  let canCreate = $derived.by(() => {
    const q = normalizeTag(input);
    if (!q) return false;
    return !pool.some((s) => s.norm === q);
  });

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(input);
    } else if (e.key === 'Backspace' && input === '') {
      removeLast();
    } else if (e.key === 'Escape') {
      inputEl?.blur();
    }
  }
</script>

<div class="relative">
  <div
    class="flex flex-wrap items-center gap-1.5 rounded border border-[oklch(0.2739_0.0055_286.03)] bg-[oklch(0.1408_0.0044_285.82)] px-2 py-1.5 transition-all focus-within:ring-1 focus-within:ring-[oklch(0.6231_0.188_259.81)] focus-within:border-[oklch(0.6231_0.188_259.81)]"
  >
    {#each tags as tag, i (i)}
      <span class="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
        {tag}
        <button
          type="button"
          aria-label={`Remove ${tag}`}
          onclick={() => removeTag(i)}
          class="text-blue-300 hover:text-white cursor-pointer leading-none"
        >×</button>
      </span>
    {/each}
    <input
      bind:this={inputEl}
      bind:value={input}
      {placeholder}
      onkeydown={onKeydown}
      onfocus={() => focused = true}
      onblur={() => setTimeout(() => focused = false, 150)}
      class="flex-1 min-w-[90px] bg-transparent border-none outline-none text-sm text-[oklch(0.9842_0.0034_247.86)] placeholder-[oklch(0.60_0.02_256.79)] py-0.5"
    />
  </div>

  {#if focused && (matching.length > 0 || canCreate)}
    <div class="absolute left-0 right-0 top-full mt-1.5 z-30 rounded border border-[oklch(0.2739_0.0055_286.03)] bg-[oklch(0.1603_0.0059_285.89)] shadow-2xl shadow-black/60 overflow-hidden max-h-56 overflow-y-auto py-1">
      {#each matching as s (s.norm)}
        <button
          type="button"
          class="w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm text-[oklch(0.9842_0.0034_247.86)] hover:bg-white/5 cursor-pointer"
          onmousedown={(e) => e.preventDefault()}
          onclick={() => commit(s.raw)}
        >
          <span class="text-blue-400">+</span>
          {s.raw}
        </button>
      {/each}
      {#if canCreate}
        <button
          type="button"
          class="w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm text-blue-300 hover:bg-white/5 cursor-pointer"
          onmousedown={(e) => e.preventDefault()}
          onclick={() => commit(input)}
        >
          <span class="text-blue-400">+</span>
          Add "{normalizeTag(input)}"
        </button>
      {/if}
    </div>
  {/if}
</div>
