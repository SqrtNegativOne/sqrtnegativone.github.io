import{B as e,C as t,H as n,I as r,O as i,X as a,Y as o,et as s,o as c,r as l,s as u,x as d}from"../chunks/BpOraOAu.js";import"../chunks/xihTtKlq.js";import"../chunks/CftuhStn.js";var f=.08,p=.19,m=14;function h(e,t,n,r){for(let i=0;i<r;i++){let r=e+(Math.sin(t)-p*e)*f,i=t+(Math.sin(n)-p*t)*f,a=n+(Math.sin(e)-p*n)*f;e=r,t=i,n=a}return[e,t,n]}var g=Array.from({length:400});function _(e,t){let n=e/10|0,r=t/5|0,i=n*20+r;return g[i]||(g[i]=`hsl(${n*10},75%,${r*5}%)`),g[i]}function v(){let e=2200,t,n,r,i,a,o,s=[],c=0,l=0,u=!1;function d(s){t=new Float32Array(e*3),n=new Float32Array(e*m*3),r=new Int32Array(e),i=new Uint16Array(e),a=new Float32Array(e*m),o=new Float32Array(e*m);for(let a=0;a<e;a++){let e=(Math.random()-.5)*4,o=(Math.random()-.5)*4,c=(Math.random()-.5)*4;[e,o,c]=h(e,o,c,s),t[a*3]=e,t[a*3+1]=o,t[a*3+2]=c,i[a]=180+(Math.random()*130|0),r[a]=0;for(let t=0;t<m;t++)n[(a*m+t)*3]=e,n[(a*m+t)*3+1]=o,n[(a*m+t)*3+2]=c}}function g(){let r=0;function i(){let a=Math.min(r+300,e);for(let e=r;e<a;e++){let r=t[e*3],i=t[e*3+1],a=t[e*3+2];[r,i,a]=h(r,i,a,500),t[e*3]=r,t[e*3+1]=i,t[e*3+2]=a;for(let t=0;t<m;t++)n[(e*m+t)*3]=r,n[(e*m+t)*3+1]=i,n[(e*m+t)*3+2]=a}r=a,r<e&&s.push(setTimeout(i,0))}s.push(setTimeout(i,0))}return{init(e,t,n){d(100),g()},frame(s,h,v,y,b,x){u||(c===0&&(l=performance.now()),c++,c===90&&(9e4/(performance.now()-l)<38&&(e=Math.max(600,e*.55|0),d(100),g()),u=!0));let S=Math.cos(y),C=Math.sin(y),w=Math.cos(b),T=Math.sin(b),E=v/11,D=h*.5,O=v*.5,{bg:k,litBase:A,litSpd:j}=x;s.fillStyle=`rgb(${k})`,s.fillRect(0,0,h,v),s.fillStyle=`rgba(${k},0.20)`,s.fillRect(0,0,h,v);for(let i=0;i<e;i++){let e=i*3,s=t[e],c=t[e+1],l=t[e+2],u=s+(Math.sin(c)-p*s)*f,d=c+(Math.sin(l)-p*c)*f,h=l+(Math.sin(s)-p*l)*f;t[e]=u,t[e+1]=d,t[e+2]=h;let g=r[i],_=(i*m+g)*3;n[_]=u,n[_+1]=d,n[_+2]=h,r[i]=(g+1)%m;let v=i*m;for(let e=0;e<m;e++){let t=(v+e)*3,r=n[t],i=n[t+1],s=n[t+2],c=r*S+s*C,l=i*w-(-r*C+s*S)*T;a[v+e]=D+c*E,o[v+e]=O-l*E}}s.lineWidth=.9;for(let t=0;t<e;t++){let e=t*m,n=(r[t]+m-1)%m,c=r[t],l=a[e+n]-a[e+c],u=o[e+n]-o[e+c],d=Math.min(1,(l*l+u*u)*15e-5);s.strokeStyle=_(i[t]+(d*50|0),A+(d*j|0)),s.globalAlpha=.55+d*.25,s.beginPath(),s.moveTo(a[e+c],o[e+c]);for(let t=1;t<m;t++){let n=(c+t)%m;s.lineTo(a[e+n],o[e+n])}s.stroke()}s.globalAlpha=1},resize(e,t){},destroy(){s.forEach(clearTimeout),s=[]}}}var y=.08,b=.19,x=14;function S(e,t,n,r){for(let i=0;i<r;i++){let r=e+(Math.sin(t)-b*e)*y,i=t+(Math.sin(n)-b*t)*y,a=n+(Math.sin(e)-b*n)*y;e=r,t=i,n=a}return[e,t,n]}var C=`#version 300 es
void main() {
  const vec2 p[3] = vec2[3](vec2(-1.,-1.), vec2(3.,-1.), vec2(-1.,3.));
  gl_Position = vec4(p[gl_VertexID], 0., 1.);
}`,w=`#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uOldPos;
const float DT  = ${y.toFixed(4)};
const float B   = ${b.toFixed(4)};
const int   TM2 = ${x-2};
out vec4 fragColor;
void main() {
  ivec2 c        = ivec2(gl_FragCoord.xy);
  int   particle = c.x;
  int   age      = c.y;
  if (age == 0) {
    vec3  p  = texelFetch(uOldPos, c, 0).xyz;
    float nx = p.x + (sin(p.y) - B * p.x) * DT;
    float ny = p.y + (sin(p.z) - B * p.y) * DT;
    float nz = p.z + (sin(p.x) - B * p.z) * DT;
    // Speed: dist² from new pos to soon-to-be-oldest (old age TM2 → new age TRAIL-1)
    vec3  o  = texelFetch(uOldPos, ivec2(particle, TM2), 0).xyz;
    vec3  d  = vec3(nx, ny, nz) - o;
    fragColor = vec4(nx, ny, nz, clamp(dot(d, d) * 0.85, 0., 1.));
  } else {
    // Trail shift: new age t ← old age t-1
    fragColor = texelFetch(uOldPos, ivec2(particle, age - 1), 0);
  }
}`,T=`#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uPosTex;   // N×TRAIL RGBA32F: xyz=pos, a=speed (age-0 row only)
uniform sampler2D uHueTex;   // N×1 R32F: per-particle base hue
uniform int   uN;
uniform float uCa, uSa, uCe, uSe, uXScale, uYScale;
flat out float vHue;
flat out float vSpd;
void main() {
  int age = gl_VertexID / uN;
  int par = gl_VertexID - age * uN;
  vec3  pos = texelFetch(uPosTex, ivec2(par, age), 0).xyz;
  float x1  = pos.x * uCa + pos.z * uSa;
  float y2  = pos.y * uCe - (-pos.x * uSa + pos.z * uCa) * uSe;
  gl_Position = vec4(x1 * uXScale, y2 * uYScale, 0., 1.);
  vHue = texelFetch(uHueTex, ivec2(par, 0), 0).r;
  vSpd = texelFetch(uPosTex, ivec2(par, 0), 0).a;
}`,E=`#version 300 es
precision highp float;
flat in float vHue;
flat in float vSpd;
uniform float uLitBase;
uniform float uLitSpd;
out vec4 fragColor;
vec3 hsl2rgb(float h, float s, float l) {
  vec3  k = clamp(abs(mod(h * 6. + vec3(0., 4., 2.), 6.) - 3.) - 1., 0., 1.);
  float c = (1. - abs(2. * l - 1.)) * s;
  return l + c * (k - 0.5);
}
void main() {
  float hue   = vHue + vSpd * (50. / 360.);
  float lit   = (uLitBase + vSpd * uLitSpd) / 100.;
  float alpha = 0.55 + vSpd * 0.25;
  fragColor   = vec4(hsl2rgb(hue, 0.75, lit), alpha);
}`;function D(e,t,n){let r=e.createShader(t);if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){let t=e.getShaderInfoLog(r);throw e.deleteShader(r),Error(`shader: `+t)}return r}function O(e,t,n){let r=D(e,e.VERTEX_SHADER,t),i=D(e,e.FRAGMENT_SHADER,n),a=e.createProgram();if(e.attachShader(a,r),e.attachShader(a,i),e.linkProgram(a),e.deleteShader(r),e.deleteShader(i),!e.getProgramParameter(a,e.LINK_STATUS)){let t=e.getProgramInfoLog(a);throw e.deleteProgram(a),Error(`link: `+t)}return a}function k(){let e=2200,t=null,n,r,i={},a={},o=[null,null],s=[null,null],c=null,l=null,u=null,d=0,f=0,p=0,m=0,h=42,g=32,_=!0,v=0,y=0,b=!1;function D(e){let t=e.getContext(`webgl2`,{alpha:!1,antialias:!0,premultipliedAlpha:!1,preserveDrawingBuffer:!1,powerPreference:`high-performance`});return!t||!t.getExtension(`EXT_color_buffer_float`)?null:t}function k(n){let r=t.createTexture();return t.bindTexture(t.TEXTURE_2D,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texImage2D(t.TEXTURE_2D,0,t.RGBA32F,e,x,0,t.RGBA,t.FLOAT,n||null),r}function A(e){let n=t.createFramebuffer();t.bindFramebuffer(t.FRAMEBUFFER,n),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,e,0);let r=t.checkFramebufferStatus(t.FRAMEBUFFER);if(t.bindFramebuffer(t.FRAMEBUFFER,null),r!==t.FRAMEBUFFER_COMPLETE)throw Error(`FBO incomplete: `+r);return n}function j(){let t=new Uint16Array(e*((x-1)*2)),n=0;for(let r=0;r<e;r++)for(let i=0;i<x-1;i++)t[n++]=i*e+r,t[n++]=(i+1)*e+r;return t}function M(n){let r=new Float32Array(x*e*4),i=new Float32Array(e);for(let t=0;t<e;t++){let a=(Math.random()-.5)*4,o=(Math.random()-.5)*4,s=(Math.random()-.5)*4;[a,o,s]=S(a,o,s,n);for(let n=0;n<x;n++){let i=(n*e+t)*4;r[i]=a,r[i+1]=o,r[i+2]=s}i[t]=(180+(Math.random()*130|0))/360}t.bindTexture(t.TEXTURE_2D,o[d]),t.texImage2D(t.TEXTURE_2D,0,t.RGBA32F,e,x,0,t.RGBA,t.FLOAT,r),t.bindTexture(t.TEXTURE_2D,c),t.texImage2D(t.TEXTURE_2D,0,t.R32F,e,1,0,t.RED,t.FLOAT,i)}function N(r){t.useProgram(n),t.disable(t.BLEND),t.viewport(0,0,e,x),t.bindVertexArray(null),t.uniform1i(i.uOldPos,0);for(let e=0;e<r;e++){let e=1-d;t.bindFramebuffer(t.FRAMEBUFFER,s[e]),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,o[d]),t.drawArrays(t.TRIANGLES,0,3),d=e}t.bindFramebuffer(t.FRAMEBUFFER,null)}function P(){n=O(t,C,w),r=O(t,T,E),i={uOldPos:t.getUniformLocation(n,`uOldPos`)},a={uN:t.getUniformLocation(r,`uN`),uPosTex:t.getUniformLocation(r,`uPosTex`),uHueTex:t.getUniformLocation(r,`uHueTex`),uCa:t.getUniformLocation(r,`uCa`),uSa:t.getUniformLocation(r,`uSa`),uCe:t.getUniformLocation(r,`uCe`),uSe:t.getUniformLocation(r,`uSe`),uXScale:t.getUniformLocation(r,`uXScale`),uYScale:t.getUniformLocation(r,`uYScale`),uLitBase:t.getUniformLocation(r,`uLitBase`),uLitSpd:t.getUniformLocation(r,`uLitSpd`)},o[0]=k(null),o[1]=k(null),s[0]=A(o[0]),s[1]=A(o[1]),c=t.createTexture(),t.bindTexture(t.TEXTURE_2D,c),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),l=t.createVertexArray(),t.bindVertexArray(l),u=t.createBuffer(),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,u),t.bufferData(t.ELEMENT_ARRAY_BUFFER,j(),t.STATIC_DRAW),t.bindVertexArray(null)}function F(){t.deleteTexture(o[0]),t.deleteTexture(o[1]),t.deleteFramebuffer(s[0]),t.deleteFramebuffer(s[1]),t.deleteTexture(c),o[0]=k(null),o[1]=k(null),s[0]=A(o[0]),s[1]=A(o[1]),c=t.createTexture(),t.bindTexture(t.TEXTURE_2D,c),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.bindVertexArray(l),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,u),t.bufferData(t.ELEMENT_ARRAY_BUFFER,j(),t.STATIC_DRAW),t.bindVertexArray(null),d=0,M(100),N(600),_=!0}return{init(e){if(t=D(e),!t)return!1;try{return P(),d=0,M(100),N(600),t.disable(t.DEPTH_TEST),t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA),_=!0,!0}catch(e){return console.warn(`WebGL init failed, falling back:`,e),t=null,!1}},setColors(e){let t=e.bg.split(`,`);f=t[0]/255,p=t[1]/255,m=t[2]/255,h=e.litBase,g=e.litSpd,_=!0},frame(n,i,s,u,S){t&&(b||(v===0&&(y=performance.now()),++v===90&&(9e4/(performance.now()-y)<38&&(e=Math.max(600,e*.55|0),F()),b=!0)),N(1),t.bindFramebuffer(t.FRAMEBUFFER,null),t.viewport(0,0,t.drawingBufferWidth,t.drawingBufferHeight),t.clearColor(f,p,m,1),t.clear(t.COLOR_BUFFER_BIT),t.useProgram(r),t.enable(t.BLEND),t.bindVertexArray(l),_&&=(t.uniform1i(a.uN,e),t.uniform1i(a.uPosTex,0),t.uniform1i(a.uHueTex,1),t.uniform1f(a.uLitBase,h),t.uniform1f(a.uLitSpd,g),!1),t.uniform1f(a.uCa,Math.cos(u)),t.uniform1f(a.uSa,Math.sin(u)),t.uniform1f(a.uCe,Math.cos(S)),t.uniform1f(a.uSe,Math.sin(S)),t.uniform1f(a.uXScale,2*s/(11*i)),t.uniform1f(a.uYScale,2/11),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,o[d]),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,c),t.drawElements(t.LINES,e*(x-1)*2,t.UNSIGNED_SHORT,0),t.bindVertexArray(null))},resize(){},destroy(){t&&=(t.deleteTexture(o[0]),t.deleteTexture(o[1]),t.deleteFramebuffer(s[0]),t.deleteFramebuffer(s[1]),t.deleteTexture(c),t.deleteBuffer(u),t.deleteVertexArray(l),t.deleteProgram(n),t.deleteProgram(r),null)}}}var A=t(`<div style="position: fixed; inset: 0; transform: translateZ(0);"><canvas style="display: block; width: 100vw; height: 100vh;"></canvas></div>`);function j(t,f){a(f,!1);let p=e();l(()=>{let e=i(p);if(!e)return;let t=k(),n=t.init(e),r,a;n?(r=t,a=null):(t.destroy(),a=e.getContext(`2d`,{alpha:!1}),r=v());let o,s,c,l=0,u=.3,d=0,f=.3;function m(){let t=Math.min(window.devicePixelRatio||1,1.5);o=window.innerWidth,s=window.innerHeight,e.width=o*t|0,e.height=s*t|0,e.style.width=o+`px`,e.style.height=s+`px`,n||a.setTransform(t,0,0,t,0,0),r.resize(o,s)}function h(){return document.documentElement.getAttribute(`data-theme`)===`dark`?{bg:`5,5,8`,litBase:42,litSpd:32}:{bg:`245,242,237`,litBase:20,litSpd:25}}let g=h();n&&r.setColors(g);let _=new MutationObserver(()=>{g=h(),n&&r.setColors(g)});_.observe(document.documentElement,{attributes:!0,attributeFilter:[`data-theme`]});function y(){document.body.classList.contains(`menu-is-open`)||(d+=(l-d)*.06,f+=(u-f)*.06,r.frame(a,o,s,d,f,g)),c=requestAnimationFrame(y)}function b(e){l=(e.clientX/o-.5)*Math.PI*2,u=(e.clientY/s-.5)*Math.PI*.8}function x(e){e.preventDefault();let t=e.touches[0];l=(t.clientX/o-.5)*Math.PI*2,u=(t.clientY/s-.5)*Math.PI*.8}function S(){cancelAnimationFrame(c),m(),y()}return window.addEventListener(`mousemove`,b),e.addEventListener(`touchmove`,x,{passive:!1}),window.addEventListener(`resize`,S),m(),n||r.init(a,o,s),y(),()=>{cancelAnimationFrame(c),_.disconnect(),r.destroy(),window.removeEventListener(`mousemove`,b),e.removeEventListener(`touchmove`,x),window.removeEventListener(`resize`,S)}}),c();var m=A();u(r(m),e=>n(p,e),()=>i(p)),s(m),d(t,m),o()}function M(e){j(e,{})}export{M as component};