<div class="not-found">
  <h2 class="not-found-code">404</h2>
  <p class="not-found-message">
    The page you have requested for exists only in your mind.
  </p>
  <button class="not-found-back" onclick={() => window.location.href = "/"}>
    &lt; return to the phenomenal world
  </button>
</div>

<style>
.not-found {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
  padding: 2rem;
}
.not-found-code {
  font-family: "Instrument Serif", serif;
  font-weight: 400;
  font-size: clamp(5rem, 15vw, 12rem);
  line-height: 1;
  color: var(--text);
}
.not-found-message {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
  max-width: 30ch;
}
.not-found-back {
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-align: center;
  transition: color 0.2s;
  margin-top: 0.5rem;
}
.not-found-back:hover {
  color: var(--text);
}
</style>
