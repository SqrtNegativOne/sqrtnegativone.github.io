<script>
  import "./ShaderImage.css";
  export let src = "";
  export let alt = "";
  let className = "";
  export { className as class };
</script>

<div class="shader-image-wrapper {className}">
  <img
    {src}
    {alt}
    class="shader-image"
    loading="lazy"
  />
</div>
