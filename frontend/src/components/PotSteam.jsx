import { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = (position + 1.0) * 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Photorealistic Domain-Warped Fluid Smoke Shader
const FRAGMENT_SHADER = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;

// 2D Hash & Value Noise
float hash(vec2 p) {
  p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
  return -1.0 + 2.0 * fract(16.0 * p.x * p.y * (p.x + p.y));
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// 5-Octave Fractal Brownian Motion
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.877, 0.479, -0.479, 0.877); // Smooth rotation
  for (int i = 0; i < 5; ++i) {
    v += a * noise(p);
    p = rot * p * 2.02 + vec2(0.15, 1.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float time = uTime * 0.28; // Gentle, natural steam speed

  // Convective upward rise with gentle atmospheric sway
  float sway = sin(uv.y * 3.0 - time * 1.5) * 0.04 * uv.y;
  vec2 p = vec2((uv.x - 0.5 - sway) * 2.8, uv.y * 3.2);

  // Upward convection flow
  p.y -= time * 0.75;

  // Domain Warping for authentic curling smoke vortices
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.5)),
    fbm(p + vec2(4.2, 1.7))
  );

  vec2 r = vec2(
    fbm(p + 3.2 * q + vec2(1.7, 3.2)),
    fbm(p + 3.2 * q + vec2(6.3, 2.1))
  );

  float density = fbm(p + 3.0 * r);

  // Shape the steam column: narrow at the pot lid, expanding as it billows upward
  float columnWidth = mix(0.18, 0.52, pow(uv.y, 0.65));
  float centerDist = abs(uv.x - 0.5 - sway);
  float mask = smoothstep(columnWidth, columnWidth * 0.15, centerDist);

  // Vertical dissipation: smooth fade-in from lid, delicate evaporation into the air
  float verticalFade = smoothstep(0.02, 0.18, uv.y) * smoothstep(1.0, 0.35, uv.y);

  // Wispy organic density curve
  float steam = smoothstep(-0.25, 0.75, density + 0.35);
  steam = pow(steam, 1.3) * mask * verticalFade;

  // Secondary fine wisp strand for multi-layered depth
  vec2 p2 = vec2((uv.x - 0.52 + sway * 0.5) * 4.2, uv.y * 4.5 - time * 1.05);
  float wisp = fbm(p2 + 2.5 * q);
  wisp = smoothstep(0.0, 0.8, wisp + 0.2) * smoothstep(0.18, 0.0, centerDist) * verticalFade;

  float finalDensity = clamp(steam * 0.42 + wisp * 0.22, 0.0, 1.0);

  // Warm culinary steam tone: soft golden-ivory near the hot pot, translucent white in air
  vec3 steamColor = mix(vec3(1.0, 0.96, 0.90), vec3(1.0, 0.99, 1.0), uv.y);

  gl_FragColor = vec4(steamColor, finalDensity);
}
`;

export default function PotSteam() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    });

    if (!gl) return;

    // Enable smooth alpha blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Compile Shader helper
    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vert = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const frag = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vert || !frag) return;

    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Fullscreen quad [-1, -1] to [1, 1]
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'uTime');
    const resLoc = gl.getUniformLocation(program, 'uResolution');

    let animId = 0;
    const startTime = performance.now();
    let isVisible = false;

    const render = () => {
      if (!isVisible) return;

      const elapsed = (performance.now() - startTime) * 0.001;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.uniform1f(timeLoc, elapsed);
      gl.uniform2f(resLoc, canvas.width, canvas.height);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    };

    const startAnimation = () => {
      if (animId === 0) {
        animId = requestAnimationFrame(render);
      }
    };

    const stopAnimation = () => {
      if (animId !== 0) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    return () => {
      io.disconnect();
      stopAnimation();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-20 select-none">
      {/* Photorealistic Domain-Warped Steam Simulation */}
      <canvas
        ref={canvasRef}
        width={300}
        height={420}
        className="absolute pointer-events-none"
        style={{
          left: '68.5%',
          top: '42.5%',
          transform: 'translate(-50%, -100%)',
          width: '30%',
          height: '78%',
        }}
      />
    </div>
  );
}
