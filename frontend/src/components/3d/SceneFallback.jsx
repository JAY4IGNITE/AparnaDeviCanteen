import { UtensilsCrossed } from 'lucide-react';

/**
 * Brand-correct static stand-in for a decorative 3D scene. Rendered whenever the
 * canvas is skipped (no WebGL / reduced-motion / low-capability device), so those
 * users get an on-palette orange/amber panel instead of an off-theme graphic.
 * Purely decorative — the surrounding Lazy3D layer is already aria-hidden and
 * pointer-events: none.
 */
const SceneFallback = ({ icon: Icon = UtensilsCrossed, className = '' }) => (
  <div className={`scene-fallback ${className}`.trim()}>
    <Icon strokeWidth={1.25} aria-hidden="true" />
  </div>
);

export default SceneFallback;
