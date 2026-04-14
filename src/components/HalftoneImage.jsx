export default function HalftoneImage({ src, alt = "", className = "" }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ display: "block" }}
    />
  );
}

/*
  CMYK halftone — saved for later (needs: import { HalftoneCmyk } from "@paper-design/shaders-react")

  <HalftoneCmyk
    image={src}
    colorBack="#fffaf0"
    colorC="#59afc5"
    colorM="#d8697c"
    colorY="#fad85c"
    colorK="#2d2824"
    size={0.2}
    gridNoise={0.45}
    type="sharp"
    softness={0.4}
    contrast={1.25}
    floodC={0.15}
    floodM={0}
    floodY={0}
    floodK={0}
    gainC={0.3}
    gainM={0}
    gainY={0.2}
    gainK={0}
    grainMixer={0.15}
    grainOverlay={0.1}
    grainSize={0.5}
    fit="cover"
  />
*/
