<script>
  let { src = "", alt = "", class: className = "" } = $props();
</script>

<img
  {src}
  {alt}
  class={className}
  style="display: block;"
/>
