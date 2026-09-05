<script lang="ts">
  import { notificationState, type AppNotification } from './notificationState.svelte';

  let expandedDetails = $state<Record<string, boolean>>({});
  let copiedId = $state<string | null>(null);

  function toggleDetails(id: string) {
    expandedDetails[id] = !expandedDetails[id];
  }

  async function copyDetails(notif: AppNotification) {
    const textToCopy = `${notif.title ? notif.title + ': ' : ''}${notif.message}${notif.details ? '\n\nDetails:\n' + notif.details : ''}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      copiedId = notif.id;
      setTimeout(() => {
        if (copiedId === notif.id) copiedId = null;
      }, 2000);
    } catch (e) {
      console.error('Failed to copy to clipboard', e);
    }
  }
</script>

<div 
  class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0" 
  aria-label="Notifications"
>
  {#each notificationState.notifications as notif (notif.id)}
    <div
      role={notif.type === 'error' || notif.type === 'warning' ? 'alert' : 'status'}
      aria-live={notif.type === 'error' ? 'assertive' : 'polite'}
      class="pointer-events-auto rounded-xl p-4 shadow-2xl backdrop-blur-md border transition-all duration-200 flex flex-col gap-2
        {notif.type === 'error' ? 'bg-[oklch(0.20_0.03_260)]/95 border-red-500/40 text-red-100 shadow-red-950/40' : ''}
        {notif.type === 'success' ? 'bg-[oklch(0.20_0.03_260)]/95 border-emerald-500/40 text-emerald-100 shadow-emerald-950/40' : ''}
        {notif.type === 'warning' ? 'bg-[oklch(0.20_0.03_260)]/95 border-amber-500/40 text-amber-100 shadow-amber-950/40' : ''}
        {notif.type === 'info' ? 'bg-[oklch(0.20_0.03_260)]/95 border-blue-500/40 text-blue-100 shadow-blue-950/40' : ''}"
    >
      <div class="flex items-start gap-3">
        <!-- Icon -->
        <div class="shrink-0 mt-0.5">
          {#if notif.type === 'error'}
            <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          {:else if notif.type === 'success'}
            <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          {:else if notif.type === 'warning'}
            <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          {:else}
            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          {/if}
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          {#if notif.title}
            <h4 class="text-sm font-semibold text-white leading-tight mb-1">
              {notif.title}
            </h4>
          {/if}
          <p class="text-xs text-[oklch(0.85_0.02_260)] break-words leading-relaxed">
            {notif.message}
          </p>

          {#if notif.details}
            <div class="mt-2 pt-2 border-t border-white/10">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  onclick={() => toggleDetails(notif.id)}
                  class="text-[11px] font-mono text-white/70 hover:text-white underline cursor-pointer"
                >
                  {expandedDetails[notif.id] ? 'Hide Details' : 'Show Details'}
                </button>
                <button
                  type="button"
                  onclick={() => copyDetails(notif)}
                  class="text-[11px] font-mono text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                >
                  {copiedId === notif.id ? 'Copied!' : 'Copy Error'}
                </button>
              </div>

              {#if expandedDetails[notif.id]}
                <pre class="mt-2 p-2 bg-black/40 rounded text-[10px] font-mono text-red-200 overflow-x-auto max-h-36 whitespace-pre-wrap select-all">
                  {notif.details}
                </pre>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Dismiss button -->
        <button
          type="button"
          aria-label="Dismiss notification"
          onclick={() => notificationState.dismiss(notif.id)}
          class="shrink-0 text-white/50 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  {/each}
</div>
