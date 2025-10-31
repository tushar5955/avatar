import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CyberneticFaceProps {
  position?: [number, number, number]
  scale?: number
}

export default function CyberneticFace({ position = [0, 0, 0], scale = 1 }: CyberneticFaceProps) {
  const groupRef = useRef<THREE.Group>(null)
  const baseMeshRef = useRef<THREE.Mesh>(null)
  const wireMeshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null)
  const ringRefs = useRef<THREE.Line[]>([])

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

  // Reusable lathe geometry so we can render multiple overlays without duplicating buffers
  const headGeometry = useMemo(() => new THREE.LatheGeometry(headProfile, 128), [headProfile])

  // Helper to attach custom shader tweaks (Fresnel rim + scanlines) to the physical material
  const attachHologramShader = (mat: THREE.MeshPhysicalMaterial) => {
    mat.onBeforeCompile = (shader) => {
      // uniforms for time and colors
      shader.uniforms.u_time = { value: 0 }
      shader.uniforms.u_rimColor = { value: new THREE.Color('#3cc6ff') }
      shader.uniforms.u_scanColor = { value: new THREE.Color('#2aa7ff') }
      shader.uniforms.u_fresnelPower = { value: 3.0 }
      shader.uniforms.u_scanlineFreq = { value: 8.0 }
      shader.uniforms.u_scanlineOpacity = { value: 0.06 }
      shader.uniforms.u_holoIntensity = { value: 0.4 }

  // Expose uniforms via userData so we can update in the render loop
      mat.userData.shaderUniforms = shader.uniforms

      // inject varyings and per-vertex computations
      shader.vertexShader = `
        varying float vViewDot;
        varying vec3 vWorldPos;
      ` + shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
          #include <begin_vertex>
          vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
          vec3 worldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
          vec3 viewDir = normalize(cameraPosition - worldPos);
          vViewDot = 1.0 - max(0.0, dot(viewDir, worldNormal));
          vWorldPos = worldPos;
        `
      )

      // inject uniforms and holographic color additions in fragment
      shader.fragmentShader = `
        uniform float u_time;
        uniform vec3 u_rimColor;
        uniform vec3 u_scanColor;
        uniform float u_fresnelPower;
        uniform float u_scanlineFreq;
        uniform float u_scanlineOpacity;
        uniform float u_holoIntensity;
        varying float vViewDot;
        varying vec3 vWorldPos;
      ` + shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
          // Holographic rim + scanlines
          float rim = pow(clamp(vViewDot, 0.0, 1.0), u_fresnelPower);
          float scan = 0.5 + 0.5 * sin(vWorldPos.y * u_scanlineFreq + u_time * 2.0);
          vec3 holo = rim * u_rimColor + (scan * u_scanlineOpacity) * u_scanColor;
          gl_FragColor.rgb += holo * u_holoIntensity;
          #include <dithering_fragment>
        `
      )
    }
  }

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (materialRef.current) {
      // Subtle pulsing glow effect (dimmer)
      const pulse = Math.sin(t * 2) * 0.06 + 0.94
      materialRef.current.emissiveIntensity = pulse * 0.15

      // Subtle transparency variation (reduced amplitude)
      materialRef.current.opacity = 0.76 + Math.sin(t * 1.2) * 0.04

      // drive shader time uniform if present
      const uniforms = materialRef.current.userData?.shaderUniforms
      if (uniforms && uniforms.u_time) uniforms.u_time.value = t
    }

    // Idle motion for the whole group
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.15
      groupRef.current.rotation.z = Math.sin(t * 0.2) * 0.03
    }

    // Rotate holographic rings
    ringRefs.current.forEach((ring, i) => {
      if (!ring) return
      const dir = i % 2 === 0 ? 1 : -1
      ring.rotation.y += 0.005 * dir
      ring.rotation.z += 0.003 * dir
    })
  })

  // Build a neon wireframe overlay material (additive) for a cybernetic look
  const wireframeMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color('#66d9ff'),
    wireframe: true,
    transparent: true,
    opacity: 0.06,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    polygonOffset: true,
    polygonOffsetFactor: -2
  }), [])

  // Helper to generate line rings around the head
  const ringGeometries = useMemo(() => {
    const createCircle = (radius: number, segments = 96) => {
      const geo = new THREE.BufferGeometry()
      const positions: number[] = []
      for (let i = 0; i < segments; i++) {
        const a = (i / segments) * Math.PI * 2
        positions.push(Math.cos(a) * radius, 0, Math.sin(a) * radius)
      }
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
      return geo
    }
    return [createCircle(0.55), createCircle(0.42), createCircle(0.32)]
  }, [])

  const ringMaterial = useMemo(() => new THREE.LineBasicMaterial({
    color: new THREE.Color('#00e5ff'),
    transparent: true,
    opacity: 0.18,
    linewidth: 1
  }), [])

  return (
    <group ref={groupRef} position={position} scale={[scale * 1.12, scale * 1.05, scale * 1.12]}>
      {/* Base human-like head shape */}
      <mesh ref={baseMeshRef} geometry={headGeometry}>
        <meshPhysicalMaterial
          ref={materialRef}
          color="#d9eefb"
          transparent
          opacity={0.78}
          roughness={0.18}
          metalness={0.65}
          ior={1.45}
          transmission={0.05}
          thickness={0.35}
          clearcoat={1}
          clearcoatRoughness={0.12}
          emissive="#3a7fd4"
          emissiveIntensity={0.18}
          side={THREE.DoubleSide}
          onUpdate={(self) => attachHologramShader(self as THREE.MeshPhysicalMaterial)}
        />
      </mesh>

      {/* Neon wireframe overlay slightly expanded to avoid z-fighting */}
      <mesh ref={wireMeshRef} geometry={headGeometry} scale={[1.002, 1.002, 1.002]}>
        <primitive object={wireframeMaterial} attach="material" />
      </mesh>

      {/* Holographic diagnostic rings */}
      <lineLoop
        ref={(el) => el && (ringRefs.current[0] = el)}
        geometry={ringGeometries[0]}
        position={[0, 0.15, 0]}
        rotation={[Math.PI / 3, 0, 0]}
      >
        <primitive object={ringMaterial} attach="material" />
      </lineLoop>
      <lineLoop
        ref={(el) => el && (ringRefs.current[1] = el)}
        geometry={ringGeometries[1]}
        position={[0, 0.45, 0]}
        rotation={[-Math.PI / 4, 0, Math.PI / 6]}
      >
        <primitive object={ringMaterial} attach="material" />
      </lineLoop>
      <lineLoop
        ref={(el) => el && (ringRefs.current[2] = el)}
        geometry={ringGeometries[2]}
        position={[0, -0.25, 0]}
        rotation={[Math.PI / 2.5, 0, -Math.PI / 8]}
      >
        <primitive object={ringMaterial} attach="material" />
      </lineLoop>
    </group>
  )
}