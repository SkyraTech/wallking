/**
 * WebGL background scenes.
 *
 * Five full-screen fragment shaders, each one an abstraction of a real
 * wallcovering process — silk drape, ink diffusion into paper, a woven
 * ground, a metallic foil sheen, and a damask bloom. The reader picks one and
 * it persists; every scene is written to work in both the dark and the light
 * palette by taking its three colours as uniforms rather than hard-coding them.
 *
 * Deliberately raw WebGL2 on a single full-screen triangle — no three.js. A
 * background does not need a scene graph, and this keeps the whole feature
 * around 8kb instead of 600kb.
 */

export type SceneId = "silk" | "ink" | "weave" | "foil" | "damask";

export type Scene = {
  id: SceneId;
  label: string;
  note: string;
  fragment: string;
};

export const VERTEX_SHADER = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

/** Shared preamble: uniforms + value noise + fbm. */
const HEAD = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;   // -1..1, eased
uniform float u_light;   // 0 = dark theme, 1 = light theme
uniform vec3  u_a;       // ground
uniform vec3  u_b;       // mid
uniform vec3  u_c;       // highlight / accent
uniform float u_intensity;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}

float fbm(vec2 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 6; i++){ s += a * noise(p); p *= 2.02; a *= 0.5; }
  return s;
}

vec2 uvNorm(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  return uv;
}

// Dither breaks up banding in the large flat gradients these scenes produce.
float dither(){ return (hash(gl_FragCoord.xy * 0.5 + u_time) - 0.5) / 255.0; }
`;

/* ------------------------------------------------------------------ silk */
const silk = `${HEAD}
void main(){
  vec2 uv = uvNorm() * 0.75;
  uv += u_mouse * 0.04;
  float t = u_time * 0.035;

  // Two rounds of domain warping give the long, soft folds of hanging cloth.
  vec2 q = vec2(fbm(uv + t), fbm(uv + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(uv + 3.4 * q + vec2(1.7, 9.2) + t * 0.6),
                fbm(uv + 3.4 * q + vec2(8.3, 2.8) - t * 0.5));
  float f = fbm(uv + 3.6 * r);

  vec3 col = mix(u_a, u_b, clamp(f * 1.5, 0.0, 1.0));
  col = mix(col, u_c, clamp(length(r) * 0.55, 0.0, 1.0));

  // Sheen running along the fold crests, the way light catches silk.
  float sheen = smoothstep(0.58, 0.92, f + r.x * 0.25);
  col += u_c * sheen * 0.22 * u_intensity;

  float vig = smoothstep(1.35, 0.15, length(uvNorm()));
  col *= mix(0.72, 1.0, vig);

  outColor = vec4(col + dither(), 1.0);
}`;

/* ------------------------------------------------------------------- ink */
const ink = `${HEAD}
void main(){
  vec2 uv = uvNorm() * 0.85;
  uv += u_mouse * 0.04;
  float t = u_time * 0.04;

  // Several slow blooms spreading into the ground, like dye into paper.
  float acc = 0.0;
  for (int i = 0; i < 5; i++){
    float fi = float(i);
    vec2 c = vec2(sin(t * 0.7 + fi * 2.1) * 0.8, cos(t * 0.55 + fi * 1.7) * 0.55);
    float d = length(uv - c);
    float edge = fbm(uv * 2.2 + fi * 4.0 + t * 0.5) * 0.45;
    acc += smoothstep(0.85 + edge, 0.06, d) * (0.55 + 0.25 * sin(fi));
  }
  acc = clamp(acc, 0.0, 1.6);

  float grain = fbm(uv * 5.0 - t * 0.3);
  vec3 col = mix(u_a, u_b, clamp(acc * 0.75, 0.0, 1.0));
  col = mix(col, u_c, clamp(pow(acc, 2.2) * 0.5 + grain * 0.06, 0.0, 1.0));

  // Bleed edge where the dye front stalls.
  float rim = smoothstep(0.55, 0.62, acc) - smoothstep(0.62, 0.78, acc);
  col += u_c * rim * 0.3 * u_intensity;

  outColor = vec4(col + dither(), 1.0);
}`;

/* ----------------------------------------------------------------- weave */
const weave = `${HEAD}
void main(){
  vec2 uv = uvNorm();
  vec2 p = uv * 14.0;
  p += u_mouse * 0.8;
  float t = u_time * 0.08;

  // Warp the lattice slightly so the weave breathes instead of tiling flat.
  float w = fbm(uv * 1.6 + t * 0.2) * 1.4;
  p += vec2(w, -w) * 1.6;

  float warp = sin(p.x + sin(p.y * 0.35 + t) * 0.6);
  float weft = sin(p.y + sin(p.x * 0.35 - t) * 0.6);
  float thread = max(abs(warp), abs(weft));
  float cloth = smoothstep(0.15, 1.0, thread);

  // Slub: occasional thicker fibres, as in a real grasscloth.
  float slub = smoothstep(0.72, 0.98, fbm(uv * 7.0 + 3.0));

  vec3 col = mix(u_a, u_b, cloth * 0.85);
  col = mix(col, u_c, slub * 0.35 + pow(cloth, 6.0) * 0.18 * u_intensity);

  float vig = smoothstep(1.5, 0.2, length(uv));
  col *= mix(0.7, 1.0, vig);

  outColor = vec4(col + dither(), 1.0);
}`;

/* ------------------------------------------------------------------ foil */
const foil = `${HEAD}
void main(){
  vec2 uv = uvNorm() * 0.8;
  uv += u_mouse * 0.05;
  float t = u_time * 0.04;

  float h = fbm(uv * 1.8 + vec2(t, -t * 0.7));
  h += fbm(uv * 4.5 - t * 0.4) * 0.35;

  // Treat the noise as a height field and light it — that reads as beaten
  // metal rather than as a coloured cloud.
  vec2 e = vec2(0.0025, 0.0);
  float hx = fbm((uv + e.xy) * 1.8 + vec2(t, -t * 0.7)) - fbm((uv - e.xy) * 1.8 + vec2(t, -t * 0.7));
  float hy = fbm((uv + e.yx) * 1.8 + vec2(t, -t * 0.7)) - fbm((uv - e.yx) * 1.8 + vec2(t, -t * 0.7));
  vec3 n = normalize(vec3(-hx * 40.0, -hy * 40.0, 1.0));

  vec3 lightDir = normalize(vec3(u_mouse * 0.8 + vec2(0.35, 0.5), 0.8));
  float diff = clamp(dot(n, lightDir), 0.0, 1.0);
  float spec = pow(diff, 22.0);

  vec3 col = mix(u_a, u_b, h * 0.9);
  col += u_c * spec * 0.85 * u_intensity;
  col = mix(col, u_c, diff * 0.14);

  outColor = vec4(col + dither(), 1.0);
}`;

/* ---------------------------------------------------------------- damask */
const damask = `${HEAD}
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

void main(){
  vec2 uv = uvNorm() * 1.1;
  uv += u_mouse * 0.04;
  float t = u_time * 0.025;

  // Mirror into a quadrant to build an ogee, the way a damask is drafted.
  vec2 p = uv;
  p.x = abs(p.x);
  p *= rot(sin(t) * 0.05);
  vec2 cell = fract(p * 0.5) - 0.5;
  cell.x = abs(cell.x);

  float d = length(cell * vec2(1.35, 1.0));
  float petal = smoothstep(0.42, 0.10, d);
  float ring  = smoothstep(0.30, 0.26, d) - smoothstep(0.26, 0.20, d);

  float drift = fbm(uv * 1.2 + t * 2.0);
  float motif = petal * (0.65 + drift * 0.5) + ring * 0.6;

  vec3 col = mix(u_a, u_b, clamp(drift * 0.8, 0.0, 1.0));
  col = mix(col, u_c, clamp(motif * 0.55, 0.0, 1.0) * u_intensity);

  float vig = smoothstep(1.6, 0.1, length(uvNorm()));
  col *= mix(0.68, 1.0, vig);

  outColor = vec4(col + dither(), 1.0);
}`;

export const SCENES: Scene[] = [
  { id: "silk", label: "Silk", note: "Drapes and folds", fragment: silk },
  { id: "ink", label: "Ink", note: "Dye into paper", fragment: ink },
  { id: "weave", label: "Weave", note: "Warp and weft", fragment: weave },
  { id: "foil", label: "Foil", note: "Lit metal leaf", fragment: foil },
  { id: "damask", label: "Damask", note: "Ogee bloom", fragment: damask },
];

export const DEFAULT_SCENE: SceneId = "silk";

export function getScene(id: SceneId) {
  return SCENES.find((s) => s.id === id) ?? SCENES[0];
}

/**
 * Palette per theme. Three stops fed to every shader as uniforms, so a scene
 * never has to know which theme it is running in.
 */
/**
 * Deliberately restrained. A background that competes with the copy is a
 * failed background — these stay close to the page canvas and let the accent
 * appear only as a glow in the brightest fifth of the field. Both reference
 * decks make the same point: Apple keeps the stage near-black, Ameba lets a
 * single blue read as signal against a dark void.
 */
export const SCENE_PALETTE: Record<
  "dark" | "light",
  Record<SceneId, [string, string, string]>
> = {
  dark: {
    silk: ["#0b0d12", "#182230", "#2563eb"],
    ink: ["#0c0e12", "#192338", "#0284c7"],
    weave: ["#0e1015", "#202632", "#d97706"],
    foil: ["#090a0f", "#1e293b", "#f59e0b"],
    damask: ["#0a0b0e", "#1e1b2e", "#3b82f6"],
  },
  light: {
    silk: ["#f6f4ee", "#e2e8f0", "#3b82f6"],
    ink: ["#f8f6f0", "#cbd5e1", "#0284c7"],
    weave: ["#f5f3eb", "#e2e8f0", "#d97706"],
    foil: ["#f7f5f0", "#e2e8f0", "#f59e0b"],
    damask: ["#f8f6f0", "#e2e8f0", "#2563eb"],
  },
};

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}
