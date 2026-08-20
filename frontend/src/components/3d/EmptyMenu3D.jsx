import SceneWrapper from './SceneWrapper';
import { Plate, Bowl } from './primitives';

/** Customer "no menu items" empty state (PRD priority #3). */
export default function EmptyMenu3D({ active = true }) {
  return (
    <SceneWrapper
      active={active}
      shadows={false}
      cameraPosition={[0, 0.6, 5]}
      floatProps={{ speed: 1.3, rotationIntensity: 0.4, floatIntensity: 0.8 }}
    >
      <group rotation={[0.3, 0, 0]}>
        <Plate position={[0, -0.35, 0]} />
        <Bowl color="#fb923c" position={[0, -0.05, 0]} scale={[0.72, 0.45, 0.72]} />
      </group>
    </SceneWrapper>
  );
}
