import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Larger five-floor building. Each floor contains three enclosed exhibition zones.
const FLOOR_HEIGHT = 5.4;
const BUILDING_HALF_WIDTH = 24;
const BUILDING_HALF_DEPTH = 18;
const WALL_HEIGHT = 4.7;
const WALL_THICKNESS = 0.28;
const DOOR_HALF_WIDTH = 2.65;

function Box({ position, size, color, roughness = 0.84, metalness = 0, ...props }) {
  return (
    <mesh position={position} castShadow receiveShadow {...props}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
}

function Artwork({ position, rotation = [0, 0, 0], palette = ['#b77d61', '#d9b99a', '#6f7d7a'], size = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={size}>
      <Box position={[0, 0, 0]} size={[2.25, 1.72, 0.15]} color="#625d57" />
      <Box position={[0, 0, 0.09]} size={[2.08, 1.55, 0.06]} color="#f2eee7" />
      <Box position={[0, 0, 0.14]} size={[1.82, 1.28, 0.035]} color={palette[0]} />
      <mesh position={[-0.34, 0.12, 0.17]} rotation={[0, 0, -0.22]}>
        <circleGeometry args={[0.45, 32]} />
        <meshStandardMaterial color={palette[1]} roughness={0.9} />
      </mesh>
      <Box position={[0.38, -0.19, 0.19]} size={[0.76, 0.5, 0.035]} color={palette[2]} rotation={[0, 0, 0.25]} />
      <Box position={[-0.08, -0.4, 0.2]} size={[1.08, 0.1, 0.03]} color="#e6d6c4" />
    </group>
  );
}

function Plant({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.25, 0.6, 20]} />
        <meshStandardMaterial color="#9a7962" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.29, 0.29, 0.06, 20]} />
        <meshStandardMaterial color="#493f35" />
      </mesh>
      {[-0.25, -0.1, 0.08, 0.25].map((x, i) => (
        <mesh key={i} position={[x, 1.02 + (i % 2) * 0.2, (i % 2 ? 0.08 : -0.06)]} rotation={[0.1, 0, (i - 1.5) * 0.22]}>
          <capsuleGeometry args={[0.12, 0.75 + (i % 2) * 0.18, 4, 8]} />
          <meshStandardMaterial color={i % 2 ? '#71856d' : '#87977b'} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

function Bench({ position, rotation = 0, scale = 1 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <Box position={[0, 0.52, 0]} size={[2.35, 0.18, 0.7]} color="#8c7765" />
      <Box position={[0, 0.94, -0.27]} size={[2.35, 0.74, 0.16]} color="#a38d79" />
      {[-0.88, 0.88].map((x) => <Box key={x} position={[x, 0.25, 0]} size={[0.13, 0.52, 0.5]} color="#554f49" />)}
    </group>
  );
}

function WallSign({ title, subtitle, position, rotation = [0, 0, 0] }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#25282b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#c8b28f';
    ctx.fillRect(0, 0, 10, canvas.height);
    ctx.fillStyle = '#f1ece4';
    ctx.font = '600 66px Arial, sans-serif';
    ctx.fillText(title, 42, 112);
    ctx.fillStyle = '#c5b8a7';
    ctx.font = '32px Arial, sans-serif';
    ctx.fillText(subtitle, 44, 180);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, [title, subtitle]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[3.7, 1.23]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

function PortalFrame({ position, rotation = [0, 0, 0], width = 5.3, height = 4.55, color = '#bba98f' }) {
  return (
    <group position={position} rotation={rotation}>
      <Box position={[-width / 2, height / 2, 0]} size={[0.22, height, 0.34]} color={color} />
      <Box position={[width / 2, height / 2, 0]} size={[0.22, height, 0.34]} color={color} />
      <Box position={[0, height, 0]} size={[width + 0.22, 0.24, 0.34]} color={color} />
    </group>
  );
}

function ElevatorLanding({ y }) {
  // A simple, clearly readable elevator bay: metal frame, two sliding doors and call panel.
  return (
    <group>
      <Box position={[-6.45, y + 1.72, 11.72]} size={[0.18, 3.44, 0.22]} color="#aeb2b1" metalness={0.34} />
      <Box position={[-3.82, y + 1.72, 11.72]} size={[0.18, 3.44, 0.22]} color="#aeb2b1" metalness={0.34} />
      <Box position={[-5.135, y + 3.42, 11.72]} size={[2.76, 0.18, 0.22]} color="#c4c5c1" metalness={0.3} />
      <Box position={[-5.135, y + 1.62, 11.82]} size={[2.32, 3.08, 0.08]} color="#45494a" />
      <Box position={[-5.72, y + 1.62, 11.72]} size={[1.12, 2.92, 0.09]} color="#bfc1bf" metalness={0.42} />
      <Box position={[-4.55, y + 1.62, 11.72]} size={[1.12, 2.92, 0.09]} color="#bfc1bf" metalness={0.42} />
      <Box position={[-5.135, y + 1.62, 11.65]} size={[0.035, 2.8, 0.025]} color="#747977" />
      <Box position={[-3.52, y + 1.22, 11.68]} size={[0.24, 0.56, 0.08]} color="#6e7777" metalness={0.25} />
      <Box position={[-3.52, y + 1.48, 11.62]} size={[0.08, 0.08, 0.035]} color="#d9c49e" emissive="#9f8156" emissiveIntensity={0.28} />
      <Box position={[-5.135, y + 3.76, 11.68]} size={[0.92, 0.28, 0.12]} color="#353a3b" />
      <Box position={[-5.135, y + 3.78, 11.60]} size={[0.42, 0.06, 0.025]} color="#d8c29a" emissive="#b18e5b" emissiveIntensity={0.25} />
    </group>
  );
}

function RailSegment({ start, end }) {
  const rail = useMemo(() => {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const direction = new THREE.Vector3().subVectors(b, a);
    const position = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    return { position, quaternion, length: direction.length() };
  }, [start, end]);
  return (
    <mesh position={rail.position} quaternion={rail.quaternion} castShadow>
      <cylinderGeometry args={[0.055, 0.055, rail.length, 10]} />
      <meshStandardMaterial color="#766b5e" metalness={0.18} roughness={0.62} />
    </mesh>
  );
}

function StairPost({ position }) {
  return (
    <mesh position={position} castShadow>
      <cylinderGeometry args={[0.035, 0.035, 0.9, 8]} />
      <meshStandardMaterial color="#857a6c" metalness={0.12} roughness={0.65} />
    </mesh>
  );
}

function StairFlight({ baseY }) {
  // U-shaped switchback stair: two moderate flights with a proper intermediate landing.
  const stepsPerFlight = 15;
  const halfRise = FLOOR_HEIGHT / 2;
  const rise = halfRise / stepsPerFlight;
  const tread = 0.30;
  const width = 1.62;
  // Place the switchback in the central circulation core, away from lobby seating.
  const lowerX = 3.1;
  const upperX = 5.37;
  const startZ = 9.5;
  const middleZ = startZ - stepsPerFlight * tread;
  const railOffset = width / 2 + 0.13;
  const posts = [];

  for (let i = 0; i < stepsPerFlight; i += 4) {
    const stepY = baseY + (i + 1) * rise + 0.43;
    const lowerZ = startZ - (i + 1) * tread;
    const upperZ = middleZ + (i + 1) * tread;
    posts.push(<StairPost key={`lp-${i}`} position={[lowerX - railOffset, stepY, lowerZ]} />);
    posts.push(<StairPost key={`rp-${i}`} position={[lowerX + railOffset, stepY, lowerZ]} />);
    posts.push(<StairPost key={`up-lp-${i}`} position={[upperX - railOffset, baseY + halfRise + (i + 1) * rise + 0.43, upperZ]} />);
    posts.push(<StairPost key={`up-rp-${i}`} position={[upperX + railOffset, baseY + halfRise + (i + 1) * rise + 0.43, upperZ]} />);
  }

  return (
    <group>
      {/* Bottom and upper landings */}
      <Box position={[(lowerX + upperX) / 2, baseY + 0.04, startZ + 0.45]} size={[4.18, 0.16, 1.05]} color="#d5cfc5" />
      <Box position={[(lowerX + upperX) / 2, baseY + halfRise, middleZ - 0.48]} size={[4.18, 0.16, 1.15]} color="#d5cfc5" />
      <Box position={[(lowerX + upperX) / 2, baseY + FLOOR_HEIGHT - 0.04, startZ + 0.45]} size={[4.18, 0.16, 1.05]} color="#d5cfc5" />

      {/* First flight rises towards the north. */}
      {Array.from({ length: stepsPerFlight }, (_, i) => {
        const levelY = (i + 1) * rise;
        const stepZ = startZ - (i + 0.5) * tread;
        const riserZ = startZ - (i + 1) * tread + 0.035;
        return (
          <group key={`lower-step-${i}`}>
            <Box position={[lowerX, baseY + levelY - 0.07, stepZ]} size={[width, 0.14, tread]} color={i % 2 ? '#d5ccbe' : '#c9bdad'} />
            <Box position={[lowerX, baseY + levelY - rise / 2, riserZ]} size={[width, rise, 0.07]} color="#b8ad9e" />
          </group>
        );
      })}

      {/* Second flight returns south, completing the switchback. */}
      {Array.from({ length: stepsPerFlight }, (_, i) => {
        const levelY = halfRise + (i + 1) * rise;
        const stepZ = middleZ + (i + 0.5) * tread;
        const riserZ = middleZ + (i + 1) * tread - 0.035;
        return (
          <group key={`upper-step-${i}`}>
            <Box position={[upperX, baseY + levelY - 0.07, stepZ]} size={[width, 0.14, tread]} color={i % 2 ? '#d5ccbe' : '#c9bdad'} />
            <Box position={[upperX, baseY + levelY - rise / 2, riserZ]} size={[width, rise, 0.07]} color="#b8ad9e" />
          </group>
        );
      })}

      {/* Sloped handrails */}
      <RailSegment start={[lowerX - railOffset, baseY + 0.88, startZ + 0.04]} end={[lowerX - railOffset, baseY + halfRise + 0.88, middleZ - 0.04]} />
      <RailSegment start={[lowerX + railOffset, baseY + 0.88, startZ + 0.04]} end={[lowerX + railOffset, baseY + halfRise + 0.88, middleZ - 0.04]} />
      <RailSegment start={[upperX - railOffset, baseY + halfRise + 0.88, middleZ + 0.04]} end={[upperX - railOffset, baseY + FLOOR_HEIGHT + 0.88, startZ - 0.04]} />
      <RailSegment start={[upperX + railOffset, baseY + halfRise + 0.88, middleZ + 0.04]} end={[upperX + railOffset, baseY + FLOOR_HEIGHT + 0.88, startZ - 0.04]} />
      {posts}
    </group>
  );
}

const FLOOR_PALETTES = [
  [['#b77d61', '#e1c7a7', '#72847f'], ['#81939b', '#d7bb91', '#a87561'], ['#9a806c', '#e0c99e', '#77866d']],
  [['#a66e58', '#e0c09b', '#6d827b'], ['#7c91a2', '#d9b98d', '#a16f62'], ['#93816e', '#e4c9a3', '#778b79']],
  [['#8e796e', '#dfc7a7', '#82928a'], ['#78899a', '#d4b68e', '#a77d69'], ['#a47c63', '#e1c7a4', '#768a82']],
  [['#9c745f', '#e5c9a6', '#82917e'], ['#788c9e', '#dec49b', '#a16e61'], ['#8e7f71', '#e0c7a4', '#718777']],
  [['#65758c', '#d7bd92', '#98736b'], ['#ad7963', '#e4c8a4', '#718982'], ['#8a789b', '#e6d0ac', '#74877c']]
];

function GallerySculpture({ position, tint = '#b68e70', shape = 0 }) {
  return (
    <group position={position}>
      <Box position={[0, 0.62, 0]} size={[1.25, 1.24, 1.25]} color="#c4b8a8" />
      <Box position={[0, 1.29, 0]} size={[1.42, 0.12, 1.42]} color="#eee7dc" />
      <mesh position={[0, 2.0, 0]} castShadow>
        {shape % 3 === 0 ? <icosahedronGeometry args={[0.58, 0]} /> : shape % 3 === 1 ? <dodecahedronGeometry args={[0.58, 0]} /> : <torusKnotGeometry args={[0.38, 0.14, 90, 12]} />}
        <meshStandardMaterial color={tint} roughness={0.48} metalness={0.12} />
      </mesh>
    </group>
  );
}

function ExhibitionWing({ level, zone }) {
  const palettes = FLOOR_PALETTES[level][zone];
  const y = 0;

  if (zone === 0) {
    return (
      <group>
        {/* West wing: a clear central viewing aisle, art on both long walls. */}
        {[-12, -4, 4, 12].map((z, i) => <Artwork key={`outer-${i}`} position={[-23.78, 2.65, z]} rotation={[0, Math.PI / 2, 0]} palette={palettes} />)}
        {[-12, -4, 4, 12].map((z, i) => <Artwork key={`inner-${i}`} position={[-7.22, 2.65, z]} rotation={[0, -Math.PI / 2, 0]} palette={palettes} />)}
        {[-19.5, -13.8, -8.2].map((x, i) => <Artwork key={`back-${i}`} position={[x, 2.65, -17.78]} palette={palettes} size={0.9} />)}
        <GallerySculpture position={[-18.5, y, -6.8]} tint={palettes[0]} shape={level} />
        <Bench position={[-15.7, y, 12.8]} />
        <Plant position={[-21.2, y, 15.0]} scale={0.82} />
        <Plant position={[-9.8, y, 15.0]} scale={0.82} />
      </group>
    );
  }

  if (zone === 1) {
    return (
      <group>
        {/* North wing: keep the middle line open from the entrance to the feature wall. */}
        {[-4.2, 0, 4.2].map((x, i) => <Artwork key={`back-${i}`} position={[x, 2.65, -17.78]} palette={palettes} size={0.92} />)}
        {[-14.2, -10.0].map((z, i) => <Artwork key={`left-${i}`} position={[-6.78, 2.65, z]} rotation={[0, Math.PI / 2, 0]} palette={palettes} size={0.84} />)}
        {[-14.2, -10.0].map((z, i) => <Artwork key={`right-${i}`} position={[6.78, 2.65, z]} rotation={[0, -Math.PI / 2, 0]} palette={palettes} size={0.84} />)}
        <GallerySculpture position={[-3.9, y, -13.0]} tint={palettes[0]} shape={level + 2} />
        <Bench position={[3.9, y, -12.7]} rotation={Math.PI / 2} scale={0.82} />
        <Plant position={[-5.4, y, -16.0]} scale={0.72} />
        <Plant position={[5.4, y, -16.0]} scale={0.72} />
      </group>
    );
  }

  return (
    <group>
      {/* East wing mirrors the west wing with a spacious centre aisle. */}
      {[-12, -4, 4, 12].map((z, i) => <Artwork key={`outer-${i}`} position={[23.78, 2.65, z]} rotation={[0, -Math.PI / 2, 0]} palette={palettes} />)}
      {[-12, -4, 4, 12].map((z, i) => <Artwork key={`inner-${i}`} position={[7.22, 2.65, z]} rotation={[0, Math.PI / 2, 0]} palette={palettes} />)}
      {[-19.5, -13.8, -8.2].map((x, i) => <Artwork key={`back-${i}`} position={[x, 2.65, -17.78]} palette={palettes} size={0.9} />)}
      <GallerySculpture position={[18.5, y, -6.8]} tint={palettes[0]} shape={level + 1} />
      <Bench position={[15.7, y, 12.8]} />
      <Plant position={[21.2, y, 15.0]} scale={0.82} />
      <Plant position={[9.8, y, 15.0]} scale={0.82} />
    </group>
  );
}

function FloorLevel({ level }) {
  const y = level * FLOOR_HEIGHT;
  const isLobby = level === 0;
  const isFeatured = level === 4;

  return (
    <group position={[0, y, 0]}>
      {/* Large continuous floor plate. The partitions create three distinct rooms. */}
      <Box position={[0, -0.2, 0]} size={[48, 0.4, 36]} color="#d8d2c9" />

      {/* Exterior shell: west, east, north and an open grand entrance to the south. */}
      <Box position={[-24, WALL_HEIGHT / 2, 0]} size={[WALL_THICKNESS, WALL_HEIGHT, 36]} color="#ece7df" />
      <Box position={[24, WALL_HEIGHT / 2, 0]} size={[WALL_THICKNESS, WALL_HEIGHT, 36]} color="#ece7df" />
      <Box position={[0, WALL_HEIGHT / 2, -18]} size={[48, WALL_HEIGHT, WALL_THICKNESS]} color="#f0ece5" />
      <Box position={[-14.5, WALL_HEIGHT / 2, 18]} size={[19, WALL_HEIGHT, WALL_THICKNESS]} color="#ece7df" />
      <Box position={[14.5, WALL_HEIGHT / 2, 18]} size={[19, WALL_HEIGHT, WALL_THICKNESS]} color="#ece7df" />
      <PortalFrame position={[0, 0, 17.82]} width={10} height={4.55} />

      {/* Zone A — west wing. Its east wall has one generous doorway. */}
      <Box position={[-7, WALL_HEIGHT / 2, -10.325]} size={[WALL_THICKNESS, WALL_HEIGHT, 15.35]} color="#dcd5ca" />
      <Box position={[-7, WALL_HEIGHT / 2, 10.325]} size={[WALL_THICKNESS, WALL_HEIGHT, 15.35]} color="#dcd5ca" />
      <PortalFrame position={[-7, 0, 0]} rotation={[0, Math.PI / 2, 0]} width={5.3} height={4.55} />

      {/* Zone C — east wing. */}
      <Box position={[7, WALL_HEIGHT / 2, -10.325]} size={[WALL_THICKNESS, WALL_HEIGHT, 15.35]} color="#dcd5ca" />
      <Box position={[7, WALL_HEIGHT / 2, 10.325]} size={[WALL_THICKNESS, WALL_HEIGHT, 15.35]} color="#dcd5ca" />
      <PortalFrame position={[7, 0, 0]} rotation={[0, Math.PI / 2, 0]} width={5.3} height={4.55} />

      {/* Zone B — north wing. The south wall opens into the central hall. */}
      <Box position={[-4.825, WALL_HEIGHT / 2, -5]} size={[4.35, WALL_HEIGHT, WALL_THICKNESS]} color="#dcd5ca" />
      <Box position={[4.825, WALL_HEIGHT / 2, -5]} size={[4.35, WALL_HEIGHT, WALL_THICKNESS]} color="#dcd5ca" />
      <PortalFrame position={[0, 0, -5]} width={5.3} height={4.55} />

      {/* Signboards are visible from the public hall. */}
      <WallSign title="GALLERY A" subtitle="WEST WING · 展區 A" position={[-6.78, 3.35, 0]} rotation={[0, Math.PI / 2, 0]} />
      <WallSign title="GALLERY B" subtitle="NORTH WING · 展區 B" position={[0, 3.35, -4.78]} />
      <WallSign title="GALLERY C" subtitle="EAST WING · 展區 C" position={[6.78, 3.35, 0]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Three independently furnished exhibition areas on every floor. */}
      <ExhibitionWing level={level} zone={0} />
      <ExhibitionWing level={level} zone={1} />
      <ExhibitionWing level={level} zone={2} />

      {/* Central public hall: the first floor is the main reception, upper levels are lounges. */}
      <Box position={[0, 0.025, 4.5]} size={[8.8, 0.05, 8.2]} color={isLobby ? '#c6b59e' : '#c9c3ba'} />
      <Box position={[0, 0.056, 4.5]} size={[5.9, 0.012, 6.5]} color="#e2d9cb" />
      {/* Keep the central route open; seating and greenery stay against the side edges. */}
      <GallerySculpture position={[-2.55, 0, 2.1]} tint={isFeatured ? '#b89366' : '#a58c75'} shape={level + 1} />
      <Bench position={[-1.75, 0, 15.0]} rotation={Math.PI} scale={0.78} />
      <Bench position={[1.85, 0, 15.0]} rotation={Math.PI} scale={0.78} />
      <Plant position={[-6.0, 0, 16.0]} scale={0.72} />
      <Plant position={[1.9, 0, 16.4]} scale={0.72} />

      {isLobby ? (
        <group>
          <Box position={[-2.45, 0.72, 8.0]} size={[2.9, 1.44, 1.05]} color="#8d7966" />
          <Box position={[-2.45, 1.48, 8.0]} size={[3.05, 0.16, 1.2]} color="#eee5d8" />
          <Box position={[-2.45, 2.54, 7.94]} size={[2.15, 0.68, 0.14]} color="#c9ad84" />
        </group>
      ) : (
        <group>
          <Box position={[-2.5, 0.48, 8.0]} size={[2.7, 0.96, 0.72]} color="#a9957e" />
          <Box position={[-2.5, 1.02, 8.0]} size={[2.85, 0.12, 0.84]} color="#ece4d8" />
        </group>
      )}

      {/* Vertical circulation core. Floor selector currently acts as the elevator control. */}
      <ElevatorLanding y={0} />
      {level < 4 && <StairFlight baseY={0} />}

      {/* Ceiling light strips */}
      {[-2.2, 0, 2.2].map((x) => (
        <Box key={`hall-light-${x}`} position={[x, 4.58, 5.0]} size={[1.55, 0.07, 0.32]} color="#e2d1b5" emissive="#9d8058" emissiveIntensity={0.2} />
      ))}
      {isFeatured && <Box position={[0, 4.4, -11.2]} size={[5.8, 0.1, 0.1]} color="#d2b17e" emissive="#a77d45" emissiveIntensity={0.24} />}
    </group>
  );
}

const SPAWNS = {
  lobby: { position: [0, 1.72, 15.2], lookAt: [0, 1.9, -1.5] },
  A: { position: [-15.5, 1.72, 8.5], lookAt: [-22, 2.5, 8.5] },
  B: { position: [0, 1.72, -8.2], lookAt: [0, 2.4, -17] },
  C: { position: [15.5, 1.72, 8.5], lookAt: [22, 2.5, 8.5] }
};

function FloorCamera({ floor, zone }) {
  const { camera } = useThree();
  useEffect(() => {
    const spawn = SPAWNS[zone] || SPAWNS.lobby;
    const baseY = (floor - 1) * FLOOR_HEIGHT;
    camera.position.set(spawn.position[0], baseY + spawn.position[1], spawn.position[2]);
    camera.lookAt(spawn.lookAt[0], baseY + spawn.lookAt[1], spawn.lookAt[2]);
  }, [floor, zone, camera]);
  return null;
}

function crossed(previous, next, boundary) {
  return (previous < boundary && next >= boundary) || (previous > boundary && next <= boundary);
}

function ExplorerMovement({ enabled }) {
  const { camera } = useThree();
  const keys = useRef({});
  const velocity = useRef(new THREE.Vector3());
  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const desired = useRef(new THREE.Vector3());
  const previous = useRef(new THREE.Vector3());
  const nextPosition = useRef(new THREE.Vector3());

  useEffect(() => {
    const down = (event) => {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight'].includes(event.code)) {
        keys.current[event.code] = true;
        if (event.code.startsWith('Arrow')) event.preventDefault();
      }
    };
    const up = (event) => { keys.current[event.code] = false; };
    const clear = () => { keys.current = {}; velocity.current.set(0, 0, 0); };
    window.addEventListener('keydown', down, { passive: false });
    window.addEventListener('keyup', up);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', clear);
    };
  }, []);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    desired.current.set(0, 0, 0);
    if (enabled) {
      camera.getWorldDirection(forward.current);
      forward.current.y = 0;
      forward.current.normalize();
      right.current.crossVectors(forward.current, camera.up).normalize().negate();
      if (keys.current.KeyW || keys.current.ArrowUp) desired.current.add(forward.current);
      if (keys.current.KeyS || keys.current.ArrowDown) desired.current.sub(forward.current);
      if (keys.current.KeyD || keys.current.ArrowRight) desired.current.add(right.current);
      if (keys.current.KeyA || keys.current.ArrowLeft) desired.current.sub(right.current);
      if (desired.current.lengthSq() > 0) desired.current.normalize();
    }

    const sprint = keys.current.ShiftLeft || keys.current.ShiftRight;
    desired.current.multiplyScalar(sprint ? 7.1 : 4.6);
    const smooth = 1 - Math.exp(-delta * 11.5); // Keep the current movement feel for this pass.
    velocity.current.lerp(desired.current, smooth);

    previous.current.copy(camera.position);
    nextPosition.current.copy(camera.position).addScaledVector(velocity.current, delta);
    nextPosition.current.x = THREE.MathUtils.clamp(nextPosition.current.x, -22.6, 22.6);
    nextPosition.current.z = THREE.MathUtils.clamp(nextPosition.current.z, -16.6, 16.6);

    const midZ = nextPosition.current.z;
    const midX = nextPosition.current.x;
    let hitPartition = false;

    // Side gallery doors are centred at z=0; the north gallery door is centred at x=0.
    if (crossed(previous.current.x, midX, -7) && !(midZ > -DOOR_HALF_WIDTH && midZ < DOOR_HALF_WIDTH)) hitPartition = true;
    if (crossed(previous.current.x, midX, 7) && !(midZ > -DOOR_HALF_WIDTH && midZ < DOOR_HALF_WIDTH)) hitPartition = true;
    if (crossed(previous.current.z, nextPosition.current.z, -5) && !(midX > -DOOR_HALF_WIDTH && midX < DOOR_HALF_WIDTH)) hitPartition = true;

    if (hitPartition) {
      nextPosition.current.x = previous.current.x;
      nextPosition.current.z = previous.current.z;
      velocity.current.multiplyScalar(0.12);
    }

    camera.position.copy(nextPosition.current);
  });

  return null;
}

export default function World({ floor, locked, zone = 'lobby' }) {
  return (
    <>
      <FloorCamera floor={floor} zone={zone} />
      <ExplorerMovement enabled={locked} />
      {Array.from({ length: 5 }, (_, index) => <FloorLevel key={index} level={index} />)}
      <pointLight position={[0, 13, 0]} intensity={1.0} distance={38} color="#f3dfc1" />
      <pointLight position={[-16, 8, 0]} intensity={0.55} distance={24} color="#f4dfc3" />
      <pointLight position={[16, 8, 0]} intensity={0.55} distance={24} color="#dce6f0" />
    </>
  );
}
