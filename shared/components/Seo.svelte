<script>
  let { title, description, path, noindex = false, base = 'https://sqrt.fyi' } = $props();
</script>

<svelte:head>
  <title>{title}</title>
  <link rel="canonical" href="{base}{path}" />
  <meta property="og:url" content="{base}{path}" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  {#if noindex}
    <meta name="robots" content="noindex" />
  {/if}
</svelte:head>
