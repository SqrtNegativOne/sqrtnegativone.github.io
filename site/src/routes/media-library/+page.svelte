<script>
  import "@fontsource/silkscreen/400.css";
  import "@fontsource/vt323/400.css";
  import MediaLibrary from './MediaLibrary/MediaLibrary.svelte';
  import Seo from '$shared/components/Seo.svelte';
</script>

<Seo
  title="Media Library — Sqrt-1"
  description="A personal tracker for the books, films, and games Sqrt-1 is consuming and collecting."
  path="/media-library"
  noindex
/>

<MediaLibrary />
