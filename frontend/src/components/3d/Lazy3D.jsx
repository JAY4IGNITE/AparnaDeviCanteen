import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { use3DEnabled, useInView } from './capabilities';

/**
 * Gate + lazy loader for a decorative 3D scene. Renders the scene only when
 * (a) 3D is enabled (WebGL + no reduced-motion + capable device),
 * (b) the placeholder has scrolled into view.
 * Otherwise — and on any runtime/WebGL error — it renders the static `fallback`.
 * The whole layer is aria-hidden and non-interactive.
 *
 * `load` is a `() => import('./SomeScene')` thunk; the scene's default export is
 * a component that accepts an `active` prop it forwards to SceneWrapper so the
 * render loop pauses when the canvas leaves the viewport.
 */

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    // Swallow: a decorative canvas must never take the page down.
  }
  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

function DefaultFallback() {
  return (
    <div
      className="size-full rounded-2xl"
      style={{
        background:
          'radial-gradient(120% 120% at 70% 20%, rgba(249,115,22,0.16), rgba(249,115,22,0) 60%), linear-gradient(160deg, var(--bg-card), var(--bg-secondary))',
      }}
    />
  );
}

export default function Lazy3D({ load, fallback, className = '', style, rootMargin = '200px' }) {
  const enabled = use3DEnabled();
  const [ref, inView] = useInView({ rootMargin });
  const [everInView, setEverInView] = useState(false);

  useEffect(() => {
    if (inView) setEverInView(true);
  }, [inView]);

  // Capture the loader once so an inline `() => import(...)` doesn't recreate the
  // lazy component (and remount the WebGL context) on every render.
  const loadRef = useRef(load);
  loadRef.current = load;
  const Scene = useMemo(
    () => (enabled ? lazy((...args) => loadRef.current(...args)) : null),
    [enabled]
  );

  const staticFallback = fallback ?? <DefaultFallback />;
  const show = enabled && everInView && Scene;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ position: 'relative', pointerEvents: 'none', ...style }}
    >
      {show ? (
        <SceneErrorBoundary fallback={staticFallback}>
          <Suspense fallback={staticFallback}>
            <Scene active={inView} />
          </Suspense>
        </SceneErrorBoundary>
      ) : (
        staticFallback
      )}
    </div>
  );
}
