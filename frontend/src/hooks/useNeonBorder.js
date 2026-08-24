/**
 * useNeonBorder – React hook
 * Ported from vanilla JS by Uiverse.io
 * Adds an animated neon glow border around the referenced element.
 */
import { useEffect } from 'react';

// ── defaults ────────────────────────────────────────────────────
const DEFAULTS = {
  color: '#CC9149',
  rounded: 24,
  thickness: 4,
  borderSize: 50,
  glow: 100,
  speed: 16,
};

const GLOW_LAYERS = [
  { blur: 8, opacity: 0.5, reach: 0.3 },
  { blur: 15, opacity: 0.3, reach: 0.6 },
  { blur: 57, opacity: 0.18, reach: 1 },
];

const MAX_GLOW_BLUR = 57;
const MAX_GLOW_REACH = 36;
const ARC_SAMPLES = 24;
const MIN_ARC = 0.015;

// ── helpers ─────────────────────────────────────────────────────
function withAlpha(input, alpha) {
  const a = Math.max(0, Math.min(1, alpha));
  if (typeof input !== 'string') return `rgba(0,0,0,${a})`;
  const s = input.trim();

  const hex = s.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4)
      h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16);
    if (!Number.isFinite(n)) return `rgba(0,0,0,${a})`;
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  const rgb = s.match(/^rgba?\(([^)]+)\)/i);
  if (rgb) {
    const parts = rgb[1].split(',').map((v) => parseFloat(v));
    if (parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite))
      return `rgba(${parts[0]},${parts[1]},${parts[2]},${a})`;
  }
  return `rgba(0,0,0,${a})`;
}

function perimeterPoint(u, w, h) {
  const d = (((u % 1) + 1) % 1) * 2 * (w + h);
  if (d < w) return [d, 0];
  if (d < w + h) return [w, d - w];
  if (d < w * 2 + h) return [w - (d - w - h), h];
  return [0, h - (d - w * 2 - h)];
}

function cornerLap(k, w, h) {
  const p = 2 * (w + h);
  const at = [0, w / p, (w + h) / p, (w * 2 + h) / p];
  return Math.floor(k / 4) + at[((k % 4) + 4) % 4];
}

function perimeterAngle(u, w, h) {
  const [x, y] = perimeterPoint(u, w, h);
  return (Math.atan2(x - w / 2, h / 2 - y) * 180) / Math.PI;
}

function buildArc(lap, lengthPct, w, h, color) {
  const fw = w > 0 ? w : 100;
  const fh = h > 0 ? h : 100;
  const len = Math.max(0, Math.min(100, lengthPct));
  const span = Math.max(MIN_ARC, (len / 100) * 0.5);
  const solidT = len / 100;

  const stops = [];
  let base = 0, prev = 0, acc = 0;

  for (let i = 0; i <= ARC_SAMPLES; i++) {
    const f = i / ARC_SAMPLES;
    const angle = perimeterAngle(lap + (f - 0.5) * span, fw, fh);
    if (i === 0) base = angle;
    else {
      let d = angle - prev;
      while (d > 180) d -= 360;
      while (d < -180) d += 360;
      acc += d;
    }
    prev = angle;
    const t = Math.abs(f - 0.5) * 2;
    const k = solidT >= 1 ? 1 : t <= solidT ? 1 : 1 - (t - solidT) / (1 - solidT);
    const smooth = k * k * (3 - 2 * k);
    stops.push(`${withAlpha(color, smooth)} ${acc.toFixed(2)}deg`);
  }
  stops.push(`${withAlpha(color, 0)} ${acc.toFixed(2)}deg`);
  stops.push(`${withAlpha(color, 0)} 360deg`);
  return `conic-gradient(from ${base.toFixed(2)}deg at 50% 50%,${stops.join(',')})`;
}

// ── DOM layer builders ──────────────────────────────────────────
function createBorderLayer() {
  const el = document.createElement('div');
  Object.assign(el.style, {
    position: 'absolute', inset: '0',
    pointerEvents: 'none', borderRadius: 'inherit', overflow: 'visible',
  });
  return el;
}

function createGlow(parent, blur, opacity, _reach, thickness) {
  const glowOuter = 10 + MAX_GLOW_REACH + MAX_GLOW_BLUR * 2;
  const layer = document.createElement('div');
  Object.assign(layer.style, {
    position: 'absolute', inset: `${-glowOuter}px`,
    boxSizing: 'border-box', padding: `${glowOuter}px`,
    borderRadius: 'inherit', opacity: String(opacity),
    mixBlendMode: 'plus-lighter',
    filter: `blur(${blur}px)`, WebkitFilter: `blur(${blur}px)`,
    pointerEvents: 'none',
    WebkitMaskImage: 'linear-gradient(#fff 0 0),linear-gradient(#fff 0 0)',
    WebkitMaskClip: 'content-box,border-box',
    WebkitMaskComposite: 'xor',
    maskImage: 'linear-gradient(#fff 0 0),linear-gradient(#fff 0 0)',
    maskClip: 'content-box,border-box',
    maskComposite: 'exclude',
  });
  const band = document.createElement('div');
  Object.assign(band.style, {
    position: 'absolute', inset: '0',
    padding: `${thickness}px`, borderRadius: 'inherit',
    background: 'var(--arc)',
  });
  layer.appendChild(band);
  parent.appendChild(layer);
}

function createMainBorder(parent, thickness) {
  const el = document.createElement('div');
  Object.assign(el.style, {
    position: 'absolute', inset: '0',
    padding: `${thickness}px`, boxSizing: 'border-box',
    borderRadius: 'inherit', background: 'var(--arc)',
    pointerEvents: 'none',
    WebkitMaskImage: 'linear-gradient(#fff 0 0),linear-gradient(#fff 0 0)',
    WebkitMaskClip: 'content-box,border-box',
    WebkitMaskComposite: 'xor',
    maskImage: 'linear-gradient(#fff 0 0),linear-gradient(#fff 0 0)',
    maskClip: 'content-box,border-box',
    maskComposite: 'exclude',
  });
  parent.appendChild(el);
}

// ── hook ────────────────────────────────────────────────────────
export default function useNeonBorder(ref, options = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const config = { ...DEFAULTS, ...options };
    const computed = window.getComputedStyle(el);
    if (computed.position === 'static') el.style.position = 'relative';

    const thickness = Math.max(1, Math.min(10, config.thickness));
    const glowAmount = Math.max(0, Math.min(100, config.glow)) / 100;

    // container
    const container = document.createElement('div');
    Object.assign(container.style, {
      position: 'absolute', inset: '0',
      pointerEvents: 'none', zIndex: '10',
      borderRadius: 'inherit',
    });

    // two border groups (for the two arcs offset by 0.5)
    const groupA = createBorderLayer();
    const groupB = createBorderLayer();
    container.appendChild(groupA);
    container.appendChild(groupB);

    // glow
    if (glowAmount > 0) {
      GLOW_LAYERS.forEach((l) => {
        createGlow(groupA, l.blur, l.opacity * glowAmount, l.reach, thickness);
        createGlow(groupB, l.blur, l.opacity * glowAmount, l.reach, thickness);
      });
    }

    // main solid border
    createMainBorder(groupA, thickness);
    createMainBorder(groupB, thickness);

    el.appendChild(container);

    // ── animation ───────────────────────────────────────────────
    let width = 0, height = 0;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      width = r.width; height = r.height;
    });
    ro.observe(el);
    // initial
    const initRect = el.getBoundingClientRect();
    width = initRect.width; height = initRect.height;

    let last = performance.now();
    let lap = 0, corner = 0, stepT = 0, animId = 0;
    const SLOWEST = 30, FASTEST = 4;

    function animate(now) {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const speed = Math.max(0, Math.min(20, config.speed));
      if (speed > 0) {
        const beat = (SLOWEST + (FASTEST - SLOWEST) * (speed - 1) / 19) / 4;
        stepT += dt / beat;
        while (stepT >= 1) { stepT -= 1; corner += 1; }
        const eased = stepT * stepT * (3 - 2 * stepT);
        const from = cornerLap(corner, width, height);
        const to = cornerLap(corner + 1, width, height);
        lap = from + (to - from) * eased;

        groupA.style.setProperty('--arc', buildArc(lap, config.borderSize, width, height, config.color));
        groupB.style.setProperty('--arc', buildArc(lap + 0.5, config.borderSize, width, height, config.color));
      }
      animId = requestAnimationFrame(animate);
    }
    animId = requestAnimationFrame(animate);

    // cleanup
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      container.remove();
    };
  // We intentionally run this once on mount; options are treated as initial config.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}
