<script>
  import markdownIt from "markdown-it";
  import questionsMarkdown from "../../data/questions.md?raw";

  const md = markdownIt({ html: true, linkify: true, typographer: true });
  const renderedContent = md.render(questionsMarkdown);
</script>

<div class="questions-page">
  <h1 class="questions-title">questions։։</h1>
  <div class="questions-content">
    {@html renderedContent}
  </div>
  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
  <a href="/" class="back-link">&lt; back to main</a>
</div>

<style>
.questions-page {
  background-color: oklch(0 0 0);
  color: oklch(1 0 0);
  min-height: 100vh;
  height: 100vh;
  width: 100vw;
  padding: 4rem 2rem;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
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

.questions-content {
  max-width: 64rem;
}

.questions-content :global(p) {
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0 0 2rem 0;
  font-weight: 400;
  white-space: pre-line;
}

.questions-content :global(ul),
.questions-content :global(ol) {
  padding-left: 1.75rem;
  margin: 0 0 2rem 0;
}

.questions-content :global(ul) {
  list-style-type: disc;
}

.questions-content :global(ol) {
  list-style-type: decimal;
}

.questions-content :global(li) {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.25rem;
  font-weight: 400;
}

.questions-content :global(a) {
  color: oklch(0.429 0.2973 264.05) !important;
  text-decoration: underline !important;
}

.questions-content :global(a:hover) {
  color: oklch(0.6 0.25 264.05) !important;
}

.questions-content :global(blockquote) {
  border-left: 2px solid oklch(0.4 0 0);
  padding-left: 1rem;
  margin: 1.5rem 0;
  opacity: 0.85;
}

.questions-content :global(code) {
  background-color: oklch(0.15 0 0);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
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
