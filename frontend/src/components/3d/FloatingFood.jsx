import SceneWrapper from './SceneWrapper';
import { Donut, Blob } from './primitives';
import { C } from './palette';

/** Generic floating brand cluster — light, decorative, reusable. */
export default function FloatingFood({ active = true }) {
  return (
    <SceneWrapper
      active={active}
      shadows={false}
      cameraPosition={[0, 0, 6]}
      floatProps={{ speed: 1.5, rotationIntensity: 0.6, floatIntensity: 1.1 }}
    >
      <group>
        <Donut color={C.orange} position={[-1.4, 0.4, 0]} rotation={[0.5, 0.2, 0]} />
        <Blob color={C.amber} radius={0.55} position={[1.3, -0.2, -0.3]} detail={0} />
        <Blob color={C.accent} radius={0.3} position={[0.2, 1.1, 0.2]} detail={0} />
        <Blob color={C.deepOrange} radius={0.26} position={[-0.6, -1.0, 0.3]} detail={0} />
      </group>
    </SceneWrapper>
  );
}
