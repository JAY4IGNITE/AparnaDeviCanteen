import SceneWrapper from './SceneWrapper';
import { Blob, Donut } from './primitives';
import { C } from './palette';

/**
 * Subtle floating geometry behind the admin dashboard KPI area (PRD priority #4).
 * Purely decorative — never overlaps the numeric values, no shadows.
 */
export default function DashboardDecoration3D({ active = true }) {
  return (
    <SceneWrapper
      active={active}
      shadows={false}
      parallax
      cameraPosition={[0, 0, 6]}
      ambient={0.8}
      floatProps={{ speed: 1.1, rotationIntensity: 0.5, floatIntensity: 0.9 }}
    >
      <group>
        <Blob color={C.orange} radius={0.7} position={[1.1, 0.3, 0]} detail={0} />
        <Donut color={C.amber} position={[-1.2, -0.4, -0.5]} rotation={[0.6, 0.3, 0]} />
        <Blob color={C.deepOrange} radius={0.35} position={[-0.2, 1.0, -0.3]} detail={0} />
      </group>
    </SceneWrapper>
  );
}
