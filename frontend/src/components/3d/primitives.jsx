import { RoundedBox } from '@react-three/drei';
import { C } from './palette';

/**
 * Low-poly, brand-tinted food primitives shared across scenes. Every export is a
 * component (React Three Fiber elements), so react/only-export-components is
 * satisfied. Geometry is intentionally cheap: rounded boxes, low-segment
 * spheres/cylinders, flat shading — no GLTF, no textures (PRD §14).
 */

function Std({ color, rough = 0.5, metal = 0.05, flat = true }) {
  return <meshStandardMaterial color={color} roughness={rough} metalness={metal} flatShading={flat} />;
}

export function Plate({ color = C.cream, ...props }) {
  return (
    <mesh {...props} castShadow receiveShadow>
      <cylinderGeometry args={[1.5, 1.35, 0.16, 32]} />
      <Std color={color} flat={false} rough={0.35} />
    </mesh>
  );
}

export function Bowl({ color = C.orange, ...props }) {
  return (
    <mesh {...props} castShadow scale={[1, 0.62, 1]}>
      <sphereGeometry args={[0.85, 24, 18]} />
      <Std color={color} flat={false} rough={0.3} metal={0.15} />
    </mesh>
  );
}

export function Cup({ color = C.deepOrange, ...props }) {
  return (
    <group {...props}>
      <mesh castShadow>
        <cylinderGeometry args={[0.48, 0.38, 0.95, 24]} />
        <Std color={color} flat={false} rough={0.35} />
      </mesh>
      {/* lid */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.52, 0.52, 0.14, 24]} />
        <Std color={C.cream} flat={false} />
      </mesh>
      {/* straw */}
      <mesh position={[0.12, 0.9, 0]} rotation={[0, 0, 0.2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.7, 10]} />
        <Std color={C.accent} flat={false} />
      </mesh>
    </group>
  );
}

export function Burger({ scale = 1, ...props }) {
  return (
    <group scale={scale} {...props}>
      {/* bottom bun */}
      <RoundedBox args={[1.5, 0.4, 1.5]} radius={0.18} smoothness={4} position={[0, -0.55, 0]} castShadow>
        <Std color={C.bun} flat={false} rough={0.6} />
      </RoundedBox>
      {/* patty */}
      <RoundedBox args={[1.55, 0.32, 1.55]} radius={0.14} smoothness={3} position={[0, -0.2, 0]} castShadow>
        <Std color={C.patty} flat={false} rough={0.8} />
      </RoundedBox>
      {/* cheese */}
      <RoundedBox args={[1.62, 0.12, 1.62]} radius={0.06} smoothness={2} position={[0, 0.0, 0]} castShadow>
        <Std color={C.cheese} flat={false} rough={0.4} />
      </RoundedBox>
      {/* lettuce */}
      <RoundedBox args={[1.66, 0.14, 1.66]} radius={0.07} smoothness={2} position={[0, 0.14, 0]} castShadow>
        <Std color={C.lettuce} flat={false} rough={0.7} />
      </RoundedBox>
      {/* top bun (domed) */}
      <mesh position={[0, 0.5, 0]} scale={[0.78, 0.5, 0.78]} castShadow>
        <sphereGeometry args={[1, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Std color={C.bun} flat={false} rough={0.6} />
      </mesh>
    </group>
  );
}

export function Bag({ color = C.orange, ...props }) {
  return (
    <group {...props}>
      <RoundedBox args={[1.3, 1.5, 1.0]} radius={0.12} smoothness={3} castShadow receiveShadow>
        <Std color={color} flat={false} rough={0.55} />
      </RoundedBox>
      {/* handles */}
      <mesh position={[-0.32, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.22, 0.05, 12, 24, Math.PI]} />
        <Std color={C.deepOrange} flat={false} />
      </mesh>
      <mesh position={[0.32, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.22, 0.05, 12, 24, Math.PI]} />
        <Std color={C.deepOrange} flat={false} />
      </mesh>
      {/* front band */}
      <RoundedBox args={[1.34, 0.5, 1.04]} radius={0.08} smoothness={2} position={[0, -0.15, 0]} castShadow>
        <Std color={C.cream} flat={false} />
      </RoundedBox>
    </group>
  );
}

export function Bell({ color = C.amber, ...props }) {
  return (
    <group {...props}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <coneGeometry args={[0.9, 1.2, 24]} />
        <Std color={color} flat={false} rough={0.3} metal={0.25} />
      </mesh>
      <mesh position={[0, -0.5, 0]} castShadow>
        <torusGeometry args={[0.55, 0.12, 12, 28]} />
        <Std color={color} flat={false} rough={0.3} metal={0.25} />
      </mesh>
      {/* clapper */}
      <mesh position={[0, -0.62, 0]} castShadow>
        <sphereGeometry args={[0.16, 16, 12]} />
        <Std color={C.deepOrange} flat={false} />
      </mesh>
      {/* top knob */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <sphereGeometry args={[0.14, 16, 12]} />
        <Std color={C.deepOrange} flat={false} />
      </mesh>
    </group>
  );
}

export function Avatar({ color = C.orange, ...props }) {
  return (
    <group {...props}>
      {/* head */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.45, 24, 18]} />
        <Std color={C.cream} flat={false} rough={0.4} />
      </mesh>
      {/* body */}
      <mesh position={[0, -0.35, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.75, 1.1, 24]} />
        <Std color={color} flat={false} rough={0.5} />
      </mesh>
    </group>
  );
}

export function Blob({ color = C.orange, radius = 0.5, detail = 1, ...props }) {
  return (
    <mesh {...props} castShadow>
      <icosahedronGeometry args={[radius, detail]} />
      <Std color={color} />
    </mesh>
  );
}

export function Donut({ color = C.accent, ...props }) {
  return (
    <mesh {...props} castShadow>
      <torusGeometry args={[0.5, 0.22, 16, 32]} />
      <Std color={color} flat={false} rough={0.4} />
    </mesh>
  );
}
