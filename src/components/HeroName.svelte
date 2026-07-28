<script>
  const FULL = "Ark Malhotra.";
  const SHORT = "Ark.";
  let phase = "idle";
</script>

<div class="name-wrapper">
  <h1 class="name">
    <span class="name-full">
      {#each FULL.split("") as char, i}
        <span
          class={phase !== "idle" ? `char char-${phase}` : "char"}
          style="--i: {i}"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      {/each}
    </span>
    <span class="name-short">
      {#each SHORT.split("") as char, i}
        <span
          class={phase !== "idle" ? `char char-${phase}` : "char"}
          style="--i: {i}"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      {/each}
    </span>
  </h1>
</div>
