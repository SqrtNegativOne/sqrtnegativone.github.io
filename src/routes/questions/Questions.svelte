<script>
  import { onMount } from 'svelte';

  let questions = [];

  onMount(() => {
    fetch('/questions.json')
      .then(res => res.json())
      .then(data => {
        questions = data.filter(q => !q.solved);
      })
      .catch(err => console.error("Error fetching questions:", err));
  });
</script>

<div class="questions-page">
  <h1 class="questions-title">questions։։</h1>
  <ul class="questions-list">
    {#each questions as q (q.id)}
      <li class="question-item">
        {q.text}
      </li>
    {/each}
  </ul>
  <a href="/" class="back-link">&lt; back to main</a>
</div>

<style>
.questions-page {
  background-color: oklch(0 0 0);
  color: oklch(1 0 0);
  min-height: 100vh;
  width: 100vw;
  padding: 4rem 2rem;
  box-sizing: border-box;
}

.questions-page,
.questions-page * {
  font-family: "Datatype", sans-serif !important;
}

.questions-title {
  font-weight: 500;
  font-size: 5rem;
  margin: 0 0 2rem 0;
  letter-spacing: -0.02em;
}

.questions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.question-item {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-weight: 400;
}

.back-link {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  color: oklch(0.429 0.2973 264.05) !important;
  text-decoration: underline !important;
  cursor: pointer !important;
}

.back-link:visited {
  color: oklch(0.3784 0.1716 302.15) !important;
}

</style>
