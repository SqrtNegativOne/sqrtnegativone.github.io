<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let isModalOpen = $state(false);
  let isEditing = $state(false);
  let currentItem = $state({
    name: '', icon: '', logo: '', mono: '', originalName: ''
  });

  function openNew() {
    isEditing = false;
    currentItem = { name: '', icon: '', logo: '', mono: '', originalName: '' };
    isModalOpen = true;
  }

  function openEdit(item: any) {
    isEditing = true;
    currentItem = { ...item, originalName: item.name };
    isModalOpen = true;
  }
</script>

<svelte:head>
  <title>Manage Skills | Admin</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-bold text-white tracking-tight">Skills</h1>
      <p class="text-[oklch(0.7107_0.0351_256.79)] mt-2">Manage your technologies and tools.</p>
    </div>
    <button onclick={openNew} class="btn-primary flex items-center">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
      Add Skill
    </button>
  </div>

  {#if form?.error}
    <div class="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
      {form.error}
    </div>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {#each data.skills as item}
      <div class="card p-4 flex flex-col group relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="flex items-center space-x-4 mb-4 relative">
          <div class="w-12 h-12 bg-[oklch(0.2077_0.0398_265.75)] rounded-lg border border-[oklch(0.3717_0.0392_257.29)] flex items-center justify-center">
            {#if item.icon}
              <i class="{item.icon} text-2xl text-white"></i>
            {:else}
              <span class="text-xl font-bold text-[oklch(0.7107_0.0351_256.79)]">{item.name.charAt(0)}</span>
            {/if}
          </div>
          <div>
            <h3 class="font-medium text-white">{item.name}</h3>
            <p class="text-xs text-[oklch(0.7107_0.0351_256.79)] truncate w-32">{item.logo || 'No logo'}</p>
          </div>
        </div>
        <div class="mt-auto flex justify-end space-x-2 border-t border-[oklch(0.3717_0.0392_257.29)] pt-3 relative">
          <button onclick={() => openEdit(item)} class="text-blue-400 hover:text-blue-300 text-sm px-2 py-1 rounded bg-blue-500/10">Edit</button>
          <form method="POST" action="?/delete" use:enhance class="inline">
            <input type="hidden" name="name" value={item.name} />
            <button type="submit" class="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded bg-red-500/10" onclick={(e) => !confirm('Are you sure?') && e.preventDefault()}>Delete</button>
          </form>
        </div>
      </div>
    {/each}
  </div>
  {#if data.skills.length === 0}
    <div class="card p-8 text-center text-[oklch(0.7107_0.0351_256.79)]">No skills found. Add some!</div>
  {/if}
</div>

{#if isModalOpen}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-[oklch(0.2795_0.0368_260.03)] border border-[oklch(0.3717_0.0392_257.29)] rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
      <div class="p-6 border-b border-[oklch(0.3717_0.0392_257.29)] flex justify-between items-center">
        <h2 class="text-xl font-semibold text-white">{isEditing ? 'Edit Skill' : 'Add New Skill'}</h2>
        <button aria-label="Close modal" onclick={() => isModalOpen = false} class="text-[oklch(0.7107_0.0351_256.79)] hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      
      <form method="POST" action="?/save" use:enhance={() => {
        return async ({ result, update }) => {
          if (result.type === 'success') {
            isModalOpen = false;
          }
          update();
        };
      }} class="flex-1 overflow-y-auto p-6 space-y-4">
        <input type="hidden" name="isNew" value={(!isEditing).toString()} />
        <input type="hidden" name="originalName" value={currentItem.originalName} />
        
        <div class="space-y-2">
          <label for="skill-name" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Name</label>
          <input id="skill-name" type="text" name="name" bind:value={currentItem.name} class="input-field" required />
        </div>
        
        <div class="space-y-2">
          <label for="skill-icon" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Icon (e.g. devicon class)</label>
          <input id="skill-icon" type="text" name="icon" bind:value={currentItem.icon} class="input-field" />
        </div>
        
        <div class="space-y-2">
          <label for="skill-logo" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Logo Path</label>
          <input id="skill-logo" type="text" name="logo" bind:value={currentItem.logo} class="input-field" />
        </div>
        
        <div class="space-y-2">
          <label for="skill-mono" class="block text-sm font-medium text-[oklch(0.7107_0.0351_256.79)]">Mono Logo Path</label>
          <input id="skill-mono" type="text" name="mono" bind:value={currentItem.mono} class="input-field" />
        </div>
        
        <div class="mt-8 flex justify-end space-x-4 pt-4 border-t border-[oklch(0.3717_0.0392_257.29)]">
          <button type="button" onclick={() => isModalOpen = false} class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Save Skill</button>
        </div>
      </form>
    </div>
  </div>
{/if}
