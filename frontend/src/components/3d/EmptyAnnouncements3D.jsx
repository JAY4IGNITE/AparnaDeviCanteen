import SceneWrapper from './SceneWrapper';
import { Bell } from './primitives';

/** Customer "no announcements" empty state (PRD priority #3). */
export default function EmptyAnnouncements3D({ active = true }) {
  return (
    <SceneWrapper
      active={active}
      shadows={false}
      cameraPosition={[0, 0, 5]}
      floatProps={{ speed: 1.5, rotationIntensity: 0.6, floatIntensity: 1.0 }}
    >
      <Bell position={[0, 0, 0]} rotation={[0, 0.2, 0.08]} />
    </SceneWrapper>
  );
}
