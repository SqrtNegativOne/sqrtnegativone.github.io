<script>
  import { onMount } from 'svelte';
  import { Link } from 'svelte-routing';
  import './Questions.css';

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
  <Link to="/" class="back-link">&lt; back to main</Link>
</div>
