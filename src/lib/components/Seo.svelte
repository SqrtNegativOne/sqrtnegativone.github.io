<script>
  let { title, description, path, noindex = false } = $props();

  const SITE_URL = 'https://sqrt.fyi';
</script>

<svelte:head>
  <title>{title}</title>
  <link rel="canonical" href="{SITE_URL}{path}" />
  <meta property="og:url" content="{SITE_URL}{path}" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  {#if noindex}
    <meta name="robots" content="noindex" />
  {/if}
</svelte:head>
