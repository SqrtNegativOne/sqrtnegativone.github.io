<script>
  const FULL = "Ark Malhotra.";
  const SHORT = "Ark.";
  let phase = "idle";

  let containerWidth = $state(0);
  let fullTextWidth = $state(0);
  let useShort = $derived(fullTextWidth > containerWidth && containerWidth > 0);
</script>

<div class="name-wrapper" bind:clientWidth={containerWidth}>
  <div class="measure-container" bind:clientWidth={fullTextWidth} aria-hidden="true">
    <h1 class="name" style="margin:0; padding:0;">{FULL}</h1>
  </div>

  <h1 class="name">
    <span class="name-full" class:hidden={useShort}>
      {#each FULL.split("") as char, i (i)}
        <span
          class={phase !== "idle" ? `char char-${phase}` : "char"}
          style="--i: {i}"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      {/each}
    </span>
    <span class="name-short" class:hidden={!useShort}>
      {#each SHORT.split("") as char, i (i)}
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

<style>
.name-wrapper {
  padding: 0.3rem 0 0;
  width: 100%;
  position: relative;
}
.measure-container {
  position: absolute;
  visibility: hidden;
  pointer-events: none;
  width: max-content;
  z-index: -1;
  top: 0;
  left: 0;
}
.hidden {
  display: none !important;
}
.name {
  font-family: "Instrument Serif", serif;
  font-weight: 300;
  font-size: clamp(5rem, 11vw, 11rem);
  line-height: 0.9;
  letter-spacing: -0.04em;
  color: var(--name-color);
  white-space: nowrap;
  margin: 0;
}
@keyframes charOut {
  0%   { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes charIn {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}
.name .char-out {
  animation-name: charOut;
  animation-duration: 55ms;
  animation-timing-function: ease-in;
  animation-delay: calc(var(--i) * 22ms);
  animation-fill-mode: both;
}
.name .char-in {
  animation-name: charIn;
  animation-duration: 55ms;
  animation-timing-function: ease-out;
  animation-delay: calc(var(--i) * 22ms);
  animation-fill-mode: both;
}
@media (max-width: 1024px) and (min-width: 641px) {
  .name-wrapper {
    grid-area: name;
    align-self: start;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  .name { font-size: clamp(3rem, 9vw, 5rem); }
}
@media (max-width: 640px) {
  .name-wrapper {
    grid-area: name;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  .name { font-size: 17vw; }
}
</style>
