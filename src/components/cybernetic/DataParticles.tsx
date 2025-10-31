import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Sphere } from '@react-three/drei'
import * as THREE from 'three'

interface DataParticlesProps {
  position?: [number, number, number]
  count?: number
}

export default function DataParticles({ position = [0, 0, 0], count = 20 }: DataParticlesProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Generate particles around the face
  const particles = useMemo(() => {
    const particleData = []
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 2 + Math.random() * 2
      const height = (Math.random() - 0.5) * 4
      
      particleData.push({
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ] as [number, number, number],
        speed: 0.5 + Math.random() * 1,
        char: Math.random() > 0.5 ? '0' : '1',
        size: 0.02 + Math.random() * 0.02
      })
    }
    return particleData
  }, [count])

  useFrame((state) => {
    if (groupRef.current) {
      // Slow rotation around the face
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
      
      // Animate individual particles
      groupRef.current.children.forEach((child, index) => {
        const particle = particles[index]
        if (child && particle) {
          child.position.y += Math.sin(state.clock.elapsedTime * particle.speed + index) * 0.01
        }
      })
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {particles.map((particle, index) => (
        <group key={`particle-${index}`} position={particle.position}>
          {/* Binary digits */}
          <Text
            fontSize={0.1}
            color="#00ffff"
            anchorX="center"
            anchorY="middle"
          >
            {particle.char}
          </Text>
          
          {/* Small glowing sphere */}
          <Sphere args={[particle.size, 8, 8]}>
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.5}
              transparent
              opacity={0.7}
            />
          </Sphere>
        </group>
      ))}
    </group>
  )
}