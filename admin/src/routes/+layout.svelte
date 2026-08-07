<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  let { children } = $props();
  let mobileMenuOpen = $state(false);

  async function shutdown() {
    if (confirm("Are you sure you want to shut down the admin server?")) {
      await fetch('/shutdown', { method: 'POST' });
      document.body.innerHTML = '<div class="h-screen w-screen flex flex-col items-center justify-center bg-[#09090b]"><h1 class="text-3xl font-bold text-white mb-2">Server Offline</h1><p class="text-[#94a3b8]">You can safely close this tab.</p></div>';
    }
  }
</script>

<div class="flex h-screen bg-[#09090b]">
  <!-- Sidebar -->
  <aside class="w-64 border-r border-[#27272a] bg-[#18181b] flex flex-col {mobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 shadow-2xl' : 'hidden'} md:flex md:static">
    <div class="p-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Admin Portal
        </h1>
        <p class="text-xs text-[#94a3b8] mt-1">sqrtnegativone.github.io</p>
      </div>
      <button class="md:hidden text-[#94a3b8]" onclick={() => mobileMenuOpen = false}>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
    
    <nav class="flex-1 px-4 space-y-2 mt-4" onclick={() => mobileMenuOpen = false}>
      <a href="/" class="flex items-center px-4 py-3 rounded-lg transition-colors {page.url.pathname === '/' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-[#94a3b8] hover:bg-[#27272a] hover:text-white'}">
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
        Dashboard
      </a>
      <a href="/media" class="flex items-center px-4 py-3 rounded-lg transition-colors {page.url.pathname.startsWith('/media') ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-[#94a3b8] hover:bg-[#27272a] hover:text-white'}">
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
        Media
      </a>
      <a href="/projects" class="flex items-center px-4 py-3 rounded-lg transition-colors {page.url.pathname.startsWith('/projects') ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-[#94a3b8] hover:bg-[#27272a] hover:text-white'}">
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        Projects
      </a>
      <a href="/skills" class="flex items-center px-4 py-3 rounded-lg transition-colors {page.url.pathname.startsWith('/skills') ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-[#94a3b8] hover:bg-[#27272a] hover:text-white'}">
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
        Skills
      </a>
      <a href="/quotes" class="flex items-center px-4 py-3 rounded-lg transition-colors {page.url.pathname.startsWith('/quotes') ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-[#94a3b8] hover:bg-[#27272a] hover:text-white'}">
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
        Quotes
      </a>
      
      <div class="pt-6 mt-6 border-t border-[#27272a]">
        <button onclick={shutdown} class="w-full flex items-center px-4 py-3 rounded-lg transition-colors text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20">
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Shutdown Server
        </button>
      </div>
    </nav>
  </aside>

  <!-- Main Content -->
  <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
    <!-- Mobile header -->
    <header class="md:hidden flex items-center justify-between p-4 border-b border-[#27272a] bg-[#18181b]">
      <h1 class="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
        Admin
      </h1>
      <button class="text-[#94a3b8] hover:text-white p-1" onclick={() => mobileMenuOpen = true}>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>
    </header>

    <div class="flex-1 overflow-auto p-6 md:p-10">
      <div class="max-w-6xl mx-auto">
        {@render children()}
      </div>
    </div>
  </main>
</div>
