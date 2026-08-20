import SceneWrapper from './SceneWrapper';
import { Avatar } from './primitives';

/** Admin "no customers" empty state (PRD priority #3, admin surfaces). */
export default function NoCustomers3D({ active = true }) {
  return (
    <SceneWrapper
      active={active}
      shadows={false}
      cameraPosition={[0, 0.2, 5]}
      floatProps={{ speed: 1.2, rotationIntensity: 0.4, floatIntensity: 0.7 }}
    >
      <Avatar position={[0, -0.1, 0]} rotation={[0, -0.2, 0]} />
    </SceneWrapper>
  );
}
