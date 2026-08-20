import SceneWrapper from './SceneWrapper';
import { Bag } from './primitives';

/** Customer "no orders yet" empty state (PRD priority #3). */
export default function EmptyOrders3D({ active = true }) {
  return (
    <SceneWrapper
      active={active}
      shadows={false}
      cameraPosition={[0, 0, 5]}
      floatProps={{ speed: 1.4, rotationIntensity: 0.5, floatIntensity: 0.9 }}
    >
      <Bag position={[0, -0.2, 0]} rotation={[0, -0.3, 0]} />
    </SceneWrapper>
  );
}
