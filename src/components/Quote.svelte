<script>
  let { displayed = "", phase = "idle", onCycle = () => {} } = $props();
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

<style>
.quote {
  font-size: 1.15rem; /* bumped up a bit */
  font-style: italic;
  color: var(--quote-color);
  user-select: none;
  max-width: 100%;
  z-index: 11;
}
.quote-cursor {
  font-style: normal;
  margin-left: 1px;
  animation: blink-cursor 0.75s step-end infinite;
}
@keyframes blink-cursor {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
@media (max-width: 1024px) and (min-width: 641px) {
  .quote {
    grid-area: quote;
    font-size: 1.05rem; /* bumped up */
    margin: 0;
    align-self: start;
  }
}
@media (max-width: 640px) {
  .quote {
    grid-area: quote;
    font-size: 1rem; /* bumped up */
  }
}
</style>
