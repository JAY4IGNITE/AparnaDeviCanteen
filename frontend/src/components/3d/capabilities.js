import { useEffect, useRef, useState } from 'react';

/**
 * Capability gates for the decorative 3D layer. No component exports here so the
 * file is exempt from react/only-export-components. Everything degrades to a
 * static fallback when 3D is not appropriate (PRD §11–§13, §20): reduced-motion,
 * no WebGL, or a low-capability device.
 */

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function supportsWebGL() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

export function isLowCapabilityDevice() {
  if (typeof window === 'undefined') return true;
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory; // may be undefined
  // Skip heavy canvases on phones / very low-core / low-memory machines.
  if (coarse && cores <= 4) return true;
  if (typeof mem === 'number' && mem <= 2) return true;
  return false;
}

/**
 * True only when a decorative 3D scene should actually mount. Re-evaluates when
 * the user toggles the reduced-motion OS setting, so the scene appears/disappears
 * without a reload.
 */
export function use3DEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const compute = () =>
      !prefersReducedMotion() && supportsWebGL() && !isLowCapabilityDevice();

    setEnabled(compute());

    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setEnabled(compute());
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  return enabled;
}

/**
 * Continuous in-view observer. Unlike a one-shot lazy trigger it keeps reporting
 * visibility so the render loop can be paused (`frameloop="never"`) when the
 * canvas scrolls off-screen — meeting the PRD's performance budget.
 */
export function useInView({ rootMargin = '150px', threshold = 0 } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true); // no IO support → assume visible, static fallbacks still guard cost
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin, threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, threshold]);

  return [ref, inView];
}
