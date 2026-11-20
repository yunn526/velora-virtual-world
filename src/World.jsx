import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function Gallery({floor}){
  const group=useRef();
  useEffect(()=>{ if(group.current) group.current.position.y=(floor-1)*4.2; },[floor]);
  useFrame(({camera})=>{
    // Keep the explorer within the gallery bounds.
    camera.position.x=THREE.MathUtils.clamp(camera.position.x,-8,8);
    camera.position.z=THREE.MathUtils.clamp(camera.position.z,-8,8);
    camera.position.y=(floor-1)*4.2+1.65;
  });
  const wallMat='#e7e4df', floorMat='#b9b8b5';
  return <group ref={group}>
    <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,0,0]}><planeGeometry args={[20,20]}/><meshStandardMaterial color={floorMat}/></mesh>
    <mesh position={[0,2, -10]}><boxGeometry args={[20,4,0.25]}/><meshStandardMaterial color={wallMat}/></mesh>
    <mesh position={[0,2, 10]}><boxGeometry args={[20,4,0.25]}/><meshStandardMaterial color={wallMat}/></mesh>
    <mesh position={[-10,2,0]}><boxGeometry args={[0.25,4,20]}/><meshStandardMaterial color={wallMat}/></mesh>
    <mesh position={[10,2,0]}><boxGeometry args={[0.25,4,20]}/><meshStandardMaterial color={wallMat}/></mesh>
    {[ -6,-2,2,6 ].map((x,i)=><group key={i} position={[x,1.9,-9.82]}>
      <mesh><boxGeometry args={[2.3,1.6,0.08]}/><meshStandardMaterial color={i%2?'#d3c8bb':'#c7d2d8'}/></mesh>
      <mesh position={[0,0,0.06]}><boxGeometry args={[1.9,1.2,0.04]}/><meshStandardMaterial color={i%2?'#9c8575':'#91a9b5'}/></mesh>
    </group>)}
    <mesh position={[0,3.95,0]}><boxGeometry args={[20,0.12,20]}/><meshStandardMaterial color={'#f5f2ee'}/></mesh>
    <mesh position={[0,0.12,0]}><boxGeometry args={[2.2,0.24,2.2]}/><meshStandardMaterial color={'#77736d'}/></mesh>
    <mesh position={[0,0.7,0]}><boxGeometry args={[1.4,1.1,1.4]}/><meshStandardMaterial color={'#d4c9b8'}/></mesh>
    <mesh position={[0,1.3,0]}><boxGeometry args={[1.5,0.12,1.5]}/><meshStandardMaterial color={'#f0e8dc'}/></mesh>
    <mesh position={[0,2.4,0]}><boxGeometry args={[0.12,2.1,0.12]}/><meshStandardMaterial color={'#b8a68f'}/></mesh>
    <mesh position={[0,3.5,0]}><sphereGeometry args={[0.18,16,16]}/><meshStandardMaterial color={'#c7a56b'}/></mesh>
    <mesh position={[0,0.08,8.5]}><boxGeometry args={[3,0.16,2]}/><meshStandardMaterial color={'#99958f'}/></mesh>
  </group>
}
export default function World({floor}){ return <Gallery floor={floor}/>; }
