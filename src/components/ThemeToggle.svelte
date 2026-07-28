<script>
  let dark = $state(true);

  $effect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light"
    );
  });
</script>

<button
  class="theme-toggle"
  onclick={() => dark = !dark}
  aria-label="Toggle light/dark mode"
>
  {dark ? "light" : "dark"}
</button>
