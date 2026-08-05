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

<style>
.name-wrapper {
  padding: 0.3rem 0 0;
  width: max-content;
}
.name {
  font-family: "Instrument Serif", serif;
  font-weight: 300;
  font-size: clamp(4.5rem, 10vw, 10rem);
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
.name-short {
  display: none;
}
@media (max-width: 1024px) and (min-width: 641px) {
  .name-wrapper {
    grid-area: name;
    align-self: start;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  .name { font-size: clamp(2.5rem, 8vw, 4.5rem); }
  .name-full  { display: none;   }
  .name-short { display: inline; }
}
@media (max-width: 640px) {
  .name-wrapper {
    grid-area: name;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  .name { font-size: 15vw; }
  .name-full  { display: none;   }
  .name-short { display: inline; }
}
</style>
