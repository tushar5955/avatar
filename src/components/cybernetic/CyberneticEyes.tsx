import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import * as THREE from 'three'

interface CyberneticEyesProps {
  position?: [number, number, number]
  scale?: number
}

export default function CyberneticEyes({ position = [0, 0, 0], scale = 1 }: CyberneticEyesProps) {
  const leftEyeRef = useRef<THREE.Mesh>(null)
  const rightEyeRef = useRef<THREE.Mesh>(null)
  const leftGlowRef = useRef<THREE.Mesh>(null)
  const rightGlowRef = useRef<THREE.Mesh>(null)
  const [blinkState, setBlinkState] = useState({ left: 1, right: 1 })
  const [lastBlink, setLastBlink] = useState(0)

  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    // Random blinking
    if (time - lastBlink > 2 + Math.random() * 3) {
      setBlinkState({
        left: Math.random() > 0.5 ? 0.1 : 1,
        right: Math.random() > 0.5 ? 0.1 : 1
      })
      setLastBlink(time)
      
      // Reset blink after short duration
      setTimeout(() => {
        setBlinkState({ left: 1, right: 1 })
      }, 150)
    }

    // Pulsing glow effect
    const leftPulse = Math.sin(time * 4) * 0.3 + 0.7
    const rightPulse = Math.sin(time * 3.5) * 0.3 + 0.7

    if (leftGlowRef.current?.material) {
      (leftGlowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = leftPulse * 2
    }
    if (rightGlowRef.current?.material) {
      (rightGlowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = rightPulse * 2
    }
  })

  return (
    <group position={position} scale={scale}>
  {/* Left Eye (Green) */}
  <group position={[-0.28, 0.18, 0.6]}>
        <Sphere ref={leftEyeRef} args={[0.08, 16, 16]} scale={[1, blinkState.left, 1]}>
          <meshStandardMaterial
            color="#00ff00"
            emissive="#00ff00"
            emissiveIntensity={1}
            transparent
            opacity={0.9}
          />
        </Sphere>
        
        {/* Left Eye Glow */}
  <Sphere ref={leftGlowRef} args={[0.12, 16, 16]} scale={[1, blinkState.left, 1]}>
          <meshStandardMaterial
            color="#00ff00"
            emissive="#00ff00"
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
          />
        </Sphere>
        
        {/* Left Lens Flare */}
        <Sphere args={[0.03, 8, 8]} position={[0.02, 0.02, 0.05]}>
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </Sphere>
      </group>

  {/* Right Eye (Blue) */}
  <group position={[0.28, 0.18, 0.6]}>
        <Sphere ref={rightEyeRef} args={[0.08, 16, 16]} scale={[1, blinkState.right, 1]}>
          <meshStandardMaterial
            color="#0080ff"
            emissive="#0080ff"
            emissiveIntensity={1}
            transparent
            opacity={0.9}
          />
        </Sphere>
        
        {/* Right Eye Glow */}
        <Sphere ref={rightGlowRef} args={[0.12, 16, 16]} scale={[1, blinkState.right, 1]}>
          <meshStandardMaterial
            color="#0080ff"
            emissive="#0080ff"
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
          />
        </Sphere>
        
        {/* Right Lens Flare */}
        <Sphere args={[0.03, 8, 8]} position={[0.02, 0.02, 0.05]}>
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </Sphere>
      </group>
    </group>
  )
}