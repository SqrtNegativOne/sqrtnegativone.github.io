<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { navItems } from '$lib/nav';
  import GitSyncWidget from '$lib/GitSyncWidget.svelte';
  import ToastContainer from '$lib/ToastContainer.svelte';
  import { notificationState } from '$lib/notificationState.svelte';

  let { children } = $props();
  let mobileMenuOpen = $state(false);

  onMount(() => {
    notificationState.initGlobalHandlers();
  });
</script>

<div class="flex h-screen bg-[oklch(0.1408_0.0044_285.82)] text-[oklch(0.9842_0.0034_247.86)] overflow-hidden">
  <!-- Desktop Collapsible Sidebar (w-16 placeholder so content doesn't shift, with aside animating out over content) -->
  <div class="relative z-40 shrink-0 hidden md:block w-16 h-full">
    <aside
      class="absolute inset-y-0 left-0 w-16 hover:w-60 transition-[width,box-shadow] duration-250 ease-in-out bg-[oklch(0.2103_0.0059_285.89)] border-r border-[oklch(0.2739_0.0055_286.03)] flex flex-col overflow-hidden group hover:shadow-2xl hover:shadow-black/80"
    >
      <div class="h-16 px-4 flex items-center justify-between shrink-0 border-b border-[oklch(0.2739_0.0055_286.03)]">
        <a href="/" class="flex items-center gap-3 text-white hover:text-cyan-400 transition-colors shrink-0" aria-label="Dashboard">
          <svg class="w-8 h-8 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 4 21 L 9 21 L 11 17 L 14 25 L 19 8 L 28 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" stroke-linejoin="miter"/>
            <circle cx="4" cy="21" r="1.8" fill="currentColor"/>
            <circle cx="28" cy="8" r="1.8" fill="currentColor"/>
          </svg>
          <span class="font-bold text-sm tracking-wider text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:delay-75">
            ADMIN
          </span>
        </a>
      </div>

      <nav class="flex-1 px-2.5 space-y-1 py-3 overflow-y-auto overflow-x-hidden">
        <a
          href="/"
          class="flex items-center h-10 px-2.5 rounded transition-colors {page.url.pathname === '/' ? 'bg-[oklch(0.1408_0.0044_285.82)] text-white font-medium' : 'text-[oklch(0.7107_0.0351_256.79)] hover:text-white hover:bg-white/5'}"
          title="Dashboard"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span class="ml-3 text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:delay-75">
            Dashboard
          </span>
        </a>
        {#each navItems as item (item.href)}
          {@const active = page.url.pathname.startsWith(item.href)}
          <a
            href={item.href}
            class="flex items-center h-10 px-2.5 rounded transition-colors {active ? 'bg-[oklch(0.1408_0.0044_285.82)] text-white font-medium' : 'text-[oklch(0.7107_0.0351_256.79)] hover:text-white hover:bg-white/5'}"
            title={item.label}
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">{@html item.path}</svg>
            <span class="ml-3 text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:delay-75">
              {item.label}
            </span>
          </a>
        {/each}
      </nav>

      <GitSyncWidget />
    </aside>
  </div>

  <!-- Mobile Drawer Sidebar -->
  {#if mobileMenuOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
      onclick={() => mobileMenuOpen = false}
    ></div>
    <aside class="fixed inset-y-0 left-0 z-50 w-64 bg-[oklch(0.2103_0.0059_285.89)] border-r border-[oklch(0.2739_0.0055_286.03)] flex flex-col shadow-2xl md:hidden">
      <div class="h-16 px-4 flex items-center justify-between border-b border-[oklch(0.2739_0.0055_286.03)]">
        <a href="/" class="flex items-center gap-3 text-white" aria-label="Dashboard" onclick={() => mobileMenuOpen = false}>
          <svg class="w-8 h-8 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 4 21 L 9 21 L 11 17 L 14 25 L 19 8 L 28 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" stroke-linejoin="miter"/>
            <circle cx="4" cy="21" r="1.8" fill="currentColor"/>
            <circle cx="28" cy="8" r="1.8" fill="currentColor"/>
          </svg>
          <span class="font-bold text-sm tracking-wider text-white">ADMIN</span>
        </a>
        <button aria-label="Close mobile menu" class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white p-1 cursor-pointer" onclick={() => mobileMenuOpen = false}>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <nav class="flex-1 px-3 space-y-1 py-3 overflow-y-auto" onclick={() => mobileMenuOpen = false}>
        <a
          href="/"
          class="flex items-center h-10 px-3 rounded transition-colors {page.url.pathname === '/' ? 'bg-[oklch(0.1408_0.0044_285.82)] text-white font-medium' : 'text-[oklch(0.7107_0.0351_256.79)] hover:text-white hover:bg-white/5'}"
        >
          <svg class="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          Dashboard
        </a>
        {#each navItems as item (item.href)}
          {@const active = page.url.pathname.startsWith(item.href)}
          <a
            href={item.href}
            class="flex items-center h-10 px-3 rounded transition-colors {active ? 'bg-[oklch(0.1408_0.0044_285.82)] text-white font-medium' : 'text-[oklch(0.7107_0.0351_256.79)] hover:text-white hover:bg-white/5'}"
          >
            <svg class="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">{@html item.path}</svg>
            {item.label}
          </a>
        {/each}
      </nav>

      <GitSyncWidget isMobile={true} />
    </aside>
  {/if}

  <!-- Main Content -->
  <main class="flex-1 flex flex-col min-w-0 overflow-hidden bg-[oklch(0.1408_0.0044_285.82)]">
    <!-- Mobile top bar with hamburger button -->
    <div class="md:hidden flex items-center justify-between p-3 border-b border-[oklch(0.2739_0.0055_286.03)] bg-[oklch(0.2103_0.0059_285.89)]">
      <a href="/" class="text-white inline-flex items-center" aria-label="Dashboard">
        <svg class="w-6 h-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 4 21 L 9 21 L 11 17 L 14 25 L 19 8 L 28 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" stroke-linejoin="miter"/>
          <circle cx="4" cy="21" r="1.8" fill="currentColor"/>
          <circle cx="28" cy="8" r="1.8" fill="currentColor"/>
        </svg>
      </a>
      <button aria-label="Open mobile menu" class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white p-1 cursor-pointer" onclick={() => mobileMenuOpen = true}>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>
    </div>

    <div class="flex-1 overflow-auto p-6 md:p-10">
      <div class="max-w-6xl mx-auto">
        {@render children()}
      </div>
    </div>
  </main>

  <ToastContainer />
</div>
