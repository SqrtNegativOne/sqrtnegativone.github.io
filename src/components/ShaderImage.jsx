import "./ShaderImage.css";

export default function ShaderImage({ src, alt, className = "" }) {
  return (
    <div className={`shader-image-wrapper ${className}`}>
      <img
        src={src}
        alt={alt}
        className="shader-image"
        loading="lazy"
      />
    </div>
  );
}
