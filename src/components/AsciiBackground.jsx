import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, Mesh, Plane, Program, Renderer, RenderTarget } from 'ogl';

// ── Shared fullscreen vertex shader ─────────────────────────────────────────
const VERT = /* glsl */ `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

// ── Perlin noise (Stefan Gustavson, public domain) ───────────────────────────
const CNOISE = /* glsl */ `
vec4 _mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 _permute(vec4 x){return _mod289(((x*34.0)+1.0)*x);}
vec4 _taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
vec3 _fade(vec3 t){return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0=floor(P),Pi1=Pi0+1.0;
  Pi0=_mod289(vec4(Pi0,0.0)).xyz;
  Pi1=_mod289(vec4(Pi1,0.0)).xyz;
  vec3 Pf0=fract(P),Pf1=Pf0-1.0;
  vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x);
  vec4 iy=vec4(Pi0.yy,Pi1.yy);
  vec4 iz0=vec4(Pi0.zzzz),iz1=vec4(Pi1.zzzz);
  vec4 ixy=_permute(_permute(ix)+iy);
  vec4 ixy0=_permute(ixy+iz0),ixy1=_permute(ixy+iz1);
  vec4 gx0=ixy0/7.0,gy0=fract(floor(gx0)/7.0)-0.5;gx0=fract(gx0);
  vec4 gz0=vec4(0.5)-abs(gx0)-abs(gy0);
  vec4 sz0=step(gz0,vec4(0.0));
  gx0-=sz0*(step(0.0,gx0)-0.5);gy0-=sz0*(step(0.0,gy0)-0.5);
  vec4 gx1=ixy1/7.0,gy1=fract(floor(gx1)/7.0)-0.5;gx1=fract(gx1);
  vec4 gz1=vec4(0.5)-abs(gx1)-abs(gy1);
  vec4 sz1=step(gz1,vec4(0.0));
  gx1-=sz1*(step(0.0,gx1)-0.5);gy1-=sz1*(step(0.0,gy1)-0.5);
  vec3 g000=vec3(gx0.x,gy0.x,gz0.x),g100=vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010=vec3(gx0.z,gy0.z,gz0.z),g110=vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001=vec3(gx1.x,gy1.x,gz1.x),g101=vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011=vec3(gx1.z,gy1.z,gz1.z),g111=vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0=_taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000*=norm0.x;g010*=norm0.y;g100*=norm0.z;g110*=norm0.w;
  vec4 norm1=_taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001*=norm1.x;g011*=norm1.y;g101*=norm1.z;g111*=norm1.w;
  vec3 fade_xyz=_fade(Pf0);
  vec4 nz=mix(vec4(dot(g000,Pf0),dot(g100,vec3(Pf1.x,Pf0.yz)),dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z)),dot(g110,vec3(Pf1.xy,Pf0.z))),
              vec4(dot(g001,vec3(Pf0.xy,Pf1.z)),dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z)),dot(g011,vec3(Pf0.x,Pf1.yz)),dot(g111,Pf1)),
              fade_xyz.z);
  vec2 nyz=mix(nz.xy,nz.zw,fade_xyz.y);
  return 2.2*mix(nyz.x,nyz.y,fade_xyz.x);
}`;

// ── Perlin → HSV colour pass ─────────────────────────────────────────────────
const PERLIN_FRAG = /* glsl */ `#version 300 es
precision mediump float;
uniform float uTime;
uniform float uFrequency;
uniform float uSpeed;
uniform float uValue;
in vec2 vUv;
out vec4 fragColor;
${CNOISE}
vec3 hsv2rgb(vec3 c){
  vec4 K=vec4(1.0,2.0/3.0,1.0/3.0,3.0);
  vec3 p=abs(fract(c.xxx+K.xyz)*6.0-K.www);
  return c.z*mix(K.xxx,clamp(p-K.xxx,0.0,1.0),c.y);
}
void main(){
  float hue=abs(cnoise(vec3(vUv*uFrequency,uTime*uSpeed)));
  fragColor=vec4(hsv2rgb(vec3(hue,1.0,uValue)),1.0);
}`;

// ── ASCII rasterisation pass ─────────────────────────────────────────────────
const ASCII_FRAG = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform sampler2D uTexture;
out vec4 fragColor;

float character(int n,vec2 p){
  p=floor(p*vec2(-4.0,4.0)+2.5);
  if(clamp(p.x,0.0,4.0)==p.x&&clamp(p.y,0.0,4.0)==p.y){
    int a=int(round(p.x)+5.0*round(p.y));
    if(((n>>a)&1)==1)return 1.0;
  }
  return 0.0;
}
void main(){
  vec2 pix=gl_FragCoord.xy;
  vec3 col=texture(uTexture,floor(pix/16.0)*16.0/uResolution.xy).rgb;
  float g=0.3*col.r+0.59*col.g+0.11*col.b;
  int n=4096;
  if(g>0.2)n=65600;
  if(g>0.3)n=163153;
  if(g>0.4)n=15255086;
  if(g>0.5)n=13121101;
  if(g>0.6)n=15252014;
  if(g>0.7)n=13195790;
  if(g>0.8)n=11512810;
  vec2 p=mod(pix/8.0,2.0)-vec2(1.0);
  fragColor=vec4(col*character(n,p),1.0);
}`;

// ─────────────────────────────────────────────────────────────────────────────

function frameClipPath() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const i = w <= 640 ? 16 : 40; // match body::before inset
  // Outer rect CW + inner rect CCW → even-odd rule punches a hole
  return `path(evenodd, 'M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${i} ${i} L ${w - i} ${i} L ${w - i} ${h - i} L ${i} ${h - i} Z')`;
}

export default function AsciiBackground() {
  const wrapperRef = useRef(null);
  const [clip, setClip] = useState(() => frameClipPath());

  const updateClip = useCallback(() => setClip(frameClipPath()), []);

  useEffect(() => {
    window.addEventListener('resize', updateClip);
    return () => window.removeEventListener('resize', updateClip);
  }, [updateClip]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const renderer = new Renderer({ dpr: 1, webgl: 2 });
    const gl = renderer.gl;
    gl.canvas.style.cssText = 'width:100%;height:100%;display:block;';
    wrapper.appendChild(gl.canvas);

    const camera = new Camera(gl, { near: 0.1, far: 100 });
    camera.position.set(0, 0, 3);

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Pass 1: Perlin noise → colour
    const perlinProgram = new Program(gl, {
      vertex: VERT,
      fragment: PERLIN_FRAG,
      uniforms: {
        uTime:      { value: 0 },
        uFrequency: { value: 5.0 },
        uSpeed:     { value: 0.015 },
        uValue:     { value: 0.4 },
      },
    });
    const perlinMesh = new Mesh(gl, {
      geometry: new Plane(gl, { width: 2, height: 2 }),
      program: perlinProgram,
    });
    const target = new RenderTarget(gl);

    // Pass 2: ASCII rasterisation
    const asciiProgram = new Program(gl, {
      vertex: VERT,
      fragment: ASCII_FRAG,
      uniforms: {
        uResolution: { value: [gl.canvas.width, gl.canvas.height] },
        uTexture:    { value: target.texture },
      },
    });
    const asciiMesh = new Mesh(gl, {
      geometry: new Plane(gl, { width: 2, height: 2 }),
      program: asciiProgram,
    });

    // Render loop — capped at 30 fps
    let rafId;
    let lastTime = 0;
    const FRAME_MS = 1000 / 30;

    function tick(now) {
      rafId = requestAnimationFrame(tick);
      if (now - lastTime < FRAME_MS) return;
      lastTime = now;

      perlinProgram.uniforms.uTime.value = now * 0.001;
      renderer.render({ scene: perlinMesh, camera, target });

      asciiProgram.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
      renderer.render({ scene: asciiMesh, camera });
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      try { wrapper.removeChild(gl.canvas); } catch (_) {}
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        pointerEvents: 'none',
        opacity: 0.2,
        clipPath: clip,
      }}
    />
  );
}
