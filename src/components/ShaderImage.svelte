<script>
  let { src = "", alt = "", class: className = "" } = $props();
</script>

<div class="shader-image-wrapper {className}">
  <img
    {src}
    {alt}
    class="shader-image"
    loading="lazy"
  />
</div>

<style>
.shader-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.shader-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  filter: grayscale(1);
  transition: filter 0.4s ease-out;
  display: block;
}

.shader-image-wrapper:hover .shader-image {
  filter: grayscale(0);
}

</style>
