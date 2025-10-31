import { Fragment, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import CyberneticFace from './cybernetic/CyberneticFace'
import CyberneticEyes from './cybernetic/CyberneticEyes'
import SolarSystem from './cybernetic/SolarSystem'
// DataParticles temporarily disabled while exploring other graphics

export default function Avatar() {
  const headGroupRef = useRef<THREE.Group>(null)

  // Subtle human-like idle/speaking micro-movements
  useFrame((state) => {
  if (!headGroupRef.current) return

    const t = state.clock.elapsedTime

    // Keep the head generally facing the user (no large rotations)
    // Very subtle micro rotations to mimic natural speaking motion
    const yaw = Math.sin(t * 0.6) * 0.02 + Math.sin(t * 1.7) * 0.01
    const pitch = Math.sin(t * 0.8 + 1.2) * 0.012 + Math.sin(t * 1.3) * 0.006

  headGroupRef.current.rotation.set(pitch, yaw, 0)

    // Subtle breathing-like vertical movement
  headGroupRef.current.position.y = Math.sin(t * 0.5) * 0.02

    // Avoid zoom pulsing to keep a steady presence
  headGroupRef.current.scale.setScalar(1)
  })

  return (
    <Fragment>
      {/* Keep SolarSystem anchored to world origin, independent of head motion */}
      <group position={[0, 0, 0]}>
        <SolarSystem />
      </group>

      {/* Head and eyes with subtle motion */}
      <group ref={headGroupRef} position={[0, 0, 0]}>
        <CyberneticFace />
        <CyberneticEyes />
        {/* Subtle, single-theme atmospheric light (reduced brightness) */}
        <pointLight position={[0, 0, 2]} color="#3a7fd4" intensity={0.25} distance={4} />
      </group>
    </Fragment>
  )
}