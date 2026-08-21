import { RoundedBox } from '@react-three/drei';
import SceneWrapper from './SceneWrapper';
import { Plate, Bowl, Cup, Donut } from './primitives';
import { C } from './palette';

/** Wide featured banner strip for the customer Menu (PRD priority #5). */
export default function FoodTray3D({ active = true }) {
  return (
    <SceneWrapper
      active={active}
      cameraPosition={[0, 0.7, 6.2]}
      fov={40}
      floatProps={{ speed: 1.1, rotationIntensity: 0.2, floatIntensity: 0.5 }}
    >
      <group rotation={[0.36, 0, 0]}>
        <RoundedBox
          args={[4.6, 0.25, 2.5]}
          radius={0.12}
          smoothness={3}
          position={[0, -0.55, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={C.surface} roughness={0.6} metalness={0.12} />
        </RoundedBox>
        <Plate position={[-1.35, -0.32, 0.1]} />
        <Donut position={[-1.35, -0.12, 0.1]} rotation={[Math.PI / 2, 0, 0]} />
        <Bowl color={C.orange} position={[0.5, -0.18, -0.15]} />
        <Cup position={[1.75, -0.05, 0.45]} />
      </group>
    </SceneWrapper>
  );
}
