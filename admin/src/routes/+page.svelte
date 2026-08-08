<script lang="ts">
  import { navItems } from '$lib/nav';
</script>

<svelte:head>
  <title>Admin Dashboard</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
    <p class="text-[oklch(0.7107 0.0351 256.79)] mt-2">Manage your static site content from one place.</p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {#each navItems as item}
      <a href={item.href} class="card p-6 group {item.borderHover} transition-all cursor-pointer relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br {item.bgGradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="w-12 h-12 rounded-lg {item.iconBg} flex items-center justify-center mb-4 {item.iconColor} group-hover:scale-110 transition-transform">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{@html item.path}</svg>
        </div>
        <h2 class="text-xl font-semibold text-white mb-2">{item.label}</h2>
        <p class="text-[oklch(0.7107 0.0351 256.79)] text-sm">{item.description}</p>
      </a>
    {/each}
  </div>
</div>
