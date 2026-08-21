import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows } from '@react-three/drei';
import { MathUtils } from 'three';

/**
 * Shared R3F stage for every decorative scene. Imports three/fiber/drei, so it
 * only ever loads inside a lazily-imported scene module — keeping three out of
 * the main bundle. Always non-interactive: the canvas has pointer-events none
 * and the whole layer is marked aria-hidden by Lazy3D.
 *
 * Soft ambient + directional + warm point light (no drei <Environment>, which
 * would fetch an HDRI and blow the perf budget). `active` toggles the render
 * loop so an off-screen canvas costs nothing.
 */

function Rig({ children, parallax = true, factor = 0.18 }) {
  const group = useRef(null);
  useFrame((state) => {
    if (!group.current) return;
    if (parallax) {
      group.current.rotation.y = MathUtils.lerp(
        group.current.rotation.y,
        state.pointer.x * factor,
        0.05
      );
      group.current.rotation.x = MathUtils.lerp(
        group.current.rotation.x,
        -state.pointer.y * factor * 0.6,
        0.05
      );
    }
  });
  return <group ref={group}>{children}</group>;
}

export default function SceneWrapper({
  children,
  active = true,
  parallax = true,
  float = true,
  shadows = true,
  cameraPosition = [0, 0, 6],
  fov = 45,
  ambient = 0.7,
  directional = 1.15,
  glow = '#f97316',
  floatProps,
  className = '',
  style,
}) {
  const content = float ? (
    <Float
      speed={floatProps?.speed ?? 1.4}
      rotationIntensity={floatProps?.rotationIntensity ?? 0.4}
      floatIntensity={floatProps?.floatIntensity ?? 0.8}
    >
      {children}
    </Float>
  ) : (
    children
  );

  return (
    <Canvas
      className={className}
      style={{ width: '100%', height: '100%', pointerEvents: 'none', ...style }}
      dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: cameraPosition, fov }}
    >
      <ambientLight intensity={ambient} />
      <directionalLight position={[5, 6, 5]} intensity={directional} castShadow={shadows} />
      <pointLight position={[-4, 2, 3]} intensity={0.6} color={glow} />
      <Rig parallax={parallax}>{content}</Rig>
      {shadows && (
        <ContactShadows
          position={[0, -1.6, 0]}
          opacity={0.35}
          scale={10}
          blur={2.6}
          far={4}
          color="#000000"
        />
      )}
    </Canvas>
  );
}
