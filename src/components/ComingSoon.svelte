<script>
  import { navigate } from "svelte-routing";
</script>

<div class="not-found">
  <h2 class="not-found-code">Soon</h2>
  <p class="not-found-message">This page is still being assembled.</p>
  <button class="not-found-back" onclick={() => navigate("/")}>
    &lt; go back home
  </button>
</div>
