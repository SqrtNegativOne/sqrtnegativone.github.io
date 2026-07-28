<script>
  import { navigate } from "svelte-routing";
</script>

<div class="not-found">
  <h2 class="not-found-code">404</h2>
  <p class="not-found-message">
    The page you have requested for exists only in your mind.
  </p>
  <button class="not-found-back" onclick={() => navigate("/")}>
    &lt; return to the phenomenal world
  </button>
</div>
