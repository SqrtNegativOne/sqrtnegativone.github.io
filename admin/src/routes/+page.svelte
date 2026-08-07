<svelte:head>
  <title>Admin Dashboard</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
    <p class="text-[#94a3b8] mt-2">Manage your static site content from one place.</p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <a href="/media" class="card p-6 group hover:border-blue-500/50 transition-all cursor-pointer relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
      </div>
      <h2 class="text-xl font-semibold text-white mb-2">Media</h2>
      <p class="text-[#94a3b8] text-sm">Manage books, movies, shows, and games.</p>
    </a>

    <a href="/projects" class="card p-6 group hover:border-emerald-500/50 transition-all cursor-pointer relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div class="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-110 transition-transform">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
      </div>
      <h2 class="text-xl font-semibold text-white mb-2">Projects</h2>
      <p class="text-[#94a3b8] text-sm">Update your portfolio projects and details.</p>
    </a>

    <a href="/skills" class="card p-6 group hover:border-purple-500/50 transition-all cursor-pointer relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div class="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
      </div>
      <h2 class="text-xl font-semibold text-white mb-2">Skills</h2>
      <p class="text-[#94a3b8] text-sm">Manage your tech stack and skill icons.</p>
    </a>

    <a href="/quotes" class="card p-6 group hover:border-amber-500/50 transition-all cursor-pointer relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div class="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4 text-amber-400 group-hover:scale-110 transition-transform">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
      </div>
      <h2 class="text-xl font-semibold text-white mb-2">Quotes</h2>
      <p class="text-[#94a3b8] text-sm">Manage your collection of quotes.</p>
    </a>
  </div>
</div>
