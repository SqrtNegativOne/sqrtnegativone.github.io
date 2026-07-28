<script>
  export let displayed = "";
  export let phase = "idle";
  export let onCycle = () => {};
</script>

{#if phase !== "idle" || displayed}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <p class="quote" onclick={onCycle}>
    {displayed}
    {#if phase !== "idle"}
      <span class="quote-cursor">|</span>
    {/if}
  </p>
{/if}
