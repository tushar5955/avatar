import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CyberneticFaceProps {
  position?: [number, number, number]
  scale?: number
}

export default function CyberneticFace({ position = [0, 0, 0], scale = 1 }: CyberneticFaceProps) {
  const faceRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null)

  // Create a simple human-like head profile using LatheGeometry
  // Coordinates are defined in the X-Y plane and revolved around the Y axis
  const headProfile = useMemo(() => {
    const pts: THREE.Vector2[] = []
    // y from -1 (chin/neck) to 1 (top), x is radius at that height
    // Neck
    pts.push(new THREE.Vector2(0.15, -1.0))
    pts.push(new THREE.Vector2(0.18, -0.9))
    // Jawline to chin
    pts.push(new THREE.Vector2(0.22, -0.8))
    pts.push(new THREE.Vector2(0.3, -0.6))
    // Cheek
    pts.push(new THREE.Vector2(0.5, -0.2))
    // Mid head (eye area ~ y=0.2)
    pts.push(new THREE.Vector2(0.6, 0.2))
    // Forehead
    pts.push(new THREE.Vector2(0.55, 0.5))
    // Skull top
    pts.push(new THREE.Vector2(0.4, 0.85))
    pts.push(new THREE.Vector2(0.2, 1.0))
    return pts
  }, [])

  useFrame((state) => {
    if (materialRef.current) {
      // Subtle pulsing glow effect
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9
      materialRef.current.emissiveIntensity = pulse * 0.2

      // Subtle transparency variation
      materialRef.current.opacity = 0.8 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1
    }
  })

  return (
    <mesh ref={faceRef} position={position} scale={scale}>
      {/* Human-like head shape */}
      <latheGeometry args={[headProfile, 64]} />
      <meshPhysicalMaterial
        ref={materialRef}
        color="#e8f4fd"
        transparent
        opacity={0.8}
        roughness={0.1}
        metalness={0.8}
        clearcoat={1}
        clearcoatRoughness={0.1}
        emissive="#4a90e2"
        emissiveIntensity={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}