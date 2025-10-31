import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Vec3 = [number, number, number]

interface PlanetConfig {
  name: string
  color: string
  radius: number // planet visual radius
  a: number // semi-major axis (distance)
  e: number // eccentricity (0=circle)
  period: number // seconds for one orbit
  inclination: number // radians tilt of orbital plane
  lonOfNode: number // radians rotation around Y
  argOfPeriapsis?: number // radians rotation within the orbital plane
  phase?: number // initial angle offset
  showOrbit?: boolean
  ring?: {
    inner: number
    outer: number
    color: string
    opacity?: number
  }
}

interface SolarSystemProps {
  center?: Vec3
  scale?: number
  dimFactor?: number // globally dim planets to blend with cybernetic look
  tiltScale?: number // exaggerate inclinations to enhance vertical spread
}

export default function SolarSystem({ center = [0, 0, 0], scale = 1, dimFactor = 0.9, tiltScale = 3.5 }: SolarSystemProps) {
  // Planet group refs so we can update positions each frame (group contains planet + any rings)
  const planetRefs = useRef<Record<string, THREE.Group>>({})

  const planets = useMemo<PlanetConfig[]>(() => [
    { name: 'Mercury', color: '#b5b5b5', radius: 0.04, a: 1.05, e: 0.205, period: 10, inclination: THREE.MathUtils.degToRad(7), lonOfNode: THREE.MathUtils.degToRad(48), argOfPeriapsis: THREE.MathUtils.degToRad(29), phase: 0, showOrbit: true },
    { name: 'Venus',   color: '#e3c16f', radius: 0.085, a: 1.25, e: 0.007, period: 25, inclination: THREE.MathUtils.degToRad(3.4), lonOfNode: THREE.MathUtils.degToRad(76), argOfPeriapsis: THREE.MathUtils.degToRad(55), phase: 0.2, showOrbit: true },
    { name: 'Earth',   color: '#4ea1d3', radius: 0.09, a: 1.45, e: 0.017, period: 40, inclination: THREE.MathUtils.degToRad(0), lonOfNode: THREE.MathUtils.degToRad(-11), argOfPeriapsis: THREE.MathUtils.degToRad(102), phase: 0.7, showOrbit: true },
    { name: 'Mars',    color: '#d2653a', radius: 0.06, a: 1.7, e: 0.093, period: 75, inclination: THREE.MathUtils.degToRad(1.85), lonOfNode: THREE.MathUtils.degToRad(49), argOfPeriapsis: THREE.MathUtils.degToRad(286), phase: 1.2, showOrbit: true },
    { name: 'Jupiter', color: '#d8b38a', radius: 0.18, a: 2.1, e: 0.049, period: 300, inclination: THREE.MathUtils.degToRad(1.3), lonOfNode: THREE.MathUtils.degToRad(100), argOfPeriapsis: THREE.MathUtils.degToRad(275), phase: 2.0, showOrbit: true },
    { name: 'Saturn',  color: '#e4cf9f', radius: 0.16, a: 2.5, e: 0.056, period: 700, inclination: THREE.MathUtils.degToRad(2.5), lonOfNode: THREE.MathUtils.degToRad(113), argOfPeriapsis: THREE.MathUtils.degToRad(339), phase: 2.8, showOrbit: true,
      ring: { inner: 0.22, outer: 0.35, color: '#ccb98a', opacity: 0.35 } },
    { name: 'Uranus',  color: '#8fd6d6', radius: 0.12, a: 2.8, e: 0.047, period: 1400, inclination: THREE.MathUtils.degToRad(0.8), lonOfNode: THREE.MathUtils.degToRad(74), argOfPeriapsis: THREE.MathUtils.degToRad(96), phase: 3.6, showOrbit: true },
    { name: 'Neptune', color: '#5a7fe8', radius: 0.11, a: 3.1, e: 0.009, period: 2700, inclination: THREE.MathUtils.degToRad(1.8), lonOfNode: THREE.MathUtils.degToRad(131), argOfPeriapsis: THREE.MathUtils.degToRad(273), phase: 4.4, showOrbit: true }
  ], [])

  // Prebuild simple sphere geometry to share across planets
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1, 20, 20), [])

  // Orbit line geometries (ellipses), one per planet if showOrbit
  const orbitGeometries = useMemo(() => {
    const geos: Record<string, THREE.BufferGeometry> = {}
    planets.forEach(p => {
      if (!p.showOrbit) return
      const segments = 256
      const positions: number[] = []
      const b = p.a * Math.sqrt(1 - p.e * p.e)
      for (let i = 0; i <= segments; i++) {
        const th = (i / segments) * Math.PI * 2
        const x = p.a * Math.cos(th)
        const z = b * Math.sin(th)
        // rotate by argument of periapsis within the orbital plane, then tilt and node
        const v = new THREE.Vector3(x, 0, z)
        const m = new THREE.Matrix4()
          .makeRotationY(p.argOfPeriapsis ?? 0)
          .multiply(new THREE.Matrix4().makeRotationX(p.inclination * tiltScale))
          .multiply(new THREE.Matrix4().makeRotationY(p.lonOfNode))
        v.applyMatrix4(m)
        positions.push(v.x, v.y, v.z)
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      geos[p.name] = geo
    })
    return geos
  }, [planets, tiltScale])

  // Update planet positions each frame
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    planets.forEach(p => {
      const group = planetRefs.current[p.name]
      if (!group) return
      // angular position based on orbital period
      const theta = ((t % p.period) / p.period) * Math.PI * 2 + (p.phase ?? 0)
      const b = p.a * Math.sqrt(1 - p.e * p.e)
      // ellipse parametric position in its plane
      const px = p.a * Math.cos(theta)
      const pz = b * Math.sin(theta)

      // rotate to world space according to orbital elements
      const pos = new THREE.Vector3(px, 0, pz)
      const rot = new THREE.Matrix4()
        .makeRotationY(p.argOfPeriapsis ?? 0)
        .multiply(new THREE.Matrix4().makeRotationX(p.inclination * tiltScale))
        .multiply(new THREE.Matrix4().makeRotationY(p.lonOfNode))
      pos.applyMatrix4(rot)

      group.position.set(
        center[0] + pos.x * scale,
        center[1] + pos.y * scale,
        center[2] + pos.z * scale
      )

      // gentle self-rotation for visual interest
      group.rotation.y += 0.01
    })
  })

  return (
    <group position={center}>
      {/* faint orbit lines */}
      {planets.map(p => (
        p.showOrbit ? (
          <lineLoop key={p.name + '-orbit'} geometry={orbitGeometries[p.name]}>
            <lineBasicMaterial color={new THREE.Color('#2aa7ff')} transparent opacity={0.15} linewidth={1} />
          </lineLoop>
        ) : null
      ))}

      {/* planets */}
      {planets.map(p => (
        <group key={p.name} ref={(g) => { if (g) planetRefs.current[p.name] = g }}>
          {/* planet body */}
          <mesh geometry={sphereGeo} scale={[p.radius, p.radius, p.radius]}>
            <meshStandardMaterial
              color={new THREE.Color(p.color).multiplyScalar(dimFactor)}
              roughness={0.8}
              metalness={0.1}
              emissive={new THREE.Color(p.color).multiplyScalar(0.05)}
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* optional ring for Saturn */}
          {p.ring ? (
            <mesh rotation={[THREE.MathUtils.degToRad(90), 0, 0]}>
              <ringGeometry args={[p.ring.inner, p.ring.outer, 64]} />
              <meshBasicMaterial color={p.ring.color} transparent opacity={p.ring.opacity ?? 0.5} side={THREE.DoubleSide} />
            </mesh>
          ) : null}
        </group>
      ))}

      {/* subtle point light from the center to mimic a "sun" glow from the face */}
      <pointLight position={[0, 0, 0]} color={'#3cc6ff'} intensity={0.35} distance={6} decay={2} />
    </group>
  )
}
