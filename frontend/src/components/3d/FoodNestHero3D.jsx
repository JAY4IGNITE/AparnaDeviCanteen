import SceneWrapper from './SceneWrapper';
import { Burger, Cup, Donut, Blob } from './primitives';
import { C } from './palette';

/** Flagship customer-home hero composition (PRD priority #1). */
export default function FoodNestHero3D({ active = true }) {
  return (
    <SceneWrapper
      active={active}
      cameraPosition={[0, 0.4, 6.4]}
      fov={44}
      floatProps={{ speed: 1.3, rotationIntensity: 0.5, floatIntensity: 0.9 }}
    >
      <group>
        <Burger scale={1.05} position={[-0.3, -0.1, 0]} rotation={[0.12, -0.5, 0]} />
        <Cup position={[1.9, -0.25, 0.3]} rotation={[0, 0.3, 0]} />
        <Donut color={C.accent} position={[-2.2, 0.95, -0.4]} rotation={[0.6, 0, 0.3]} />
        <Blob color={C.amber} radius={0.32} position={[2.0, 1.35, -0.6]} detail={0} />
        <Blob color={C.deepOrange} radius={0.22} position={[-1.7, -1.2, 0.4]} detail={0} />
      </group>
    </SceneWrapper>
  );
}
