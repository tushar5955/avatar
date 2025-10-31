import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import Avatar from './components/Avatar'
import './App.css'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000000' }}>
      <Canvas>
        {/* Camera positioned to face the avatar */}
        <PerspectiveCamera 
          makeDefault 
          position={[0, 0, 4]} 
          fov={75}
          near={0.1}
          far={1000}
        />
        
        {/* Minimal ambient lighting for cybernetic feel */}
        <ambientLight intensity={0.1} />
        
        {/* Avatar positioned at origin facing the camera */}
        <Avatar />
        
        {/* Controls for interaction */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[0, 0, 0]}
          minDistance={2}
          maxDistance={8}
          autoRotate={false}
        />
        
        {/* Black background */}
        <color attach="background" args={['#000000']} />
      </Canvas>
    </div>
  )
}

export default App
