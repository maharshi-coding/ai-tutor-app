'use client'

import { useRef, memo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, Html } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

const AvatarModel = memo(function AvatarModel({ isSpeaking }: { isSpeaking: boolean }) {
  const headRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (headRef.current) {
      // Gentle hover
      headRef.current.position.y = Math.sin(t) * 0.1

      // Speaking pulse
      const baseScale = 1
      const speakScale = isSpeaking ? 1 + Math.sin(t * 6) * 0.08 : 1
      const finalScale = baseScale * speakScale
      headRef.current.scale.set(finalScale, finalScale, finalScale)
      headRef.current.rotation.y = Math.sin(t * 0.3) * 0.3
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.4
    }
  })

  return (
    <>
      {/* Neon back disc - reduced segments from 64 to 32 */}
      <mesh position={[0, 0, -0.8]}>
        <circleGeometry args={[1.6, 32]} />
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.08} />
      </mesh>

      {/* Holographic ring */}
      <mesh ref={ringRef} position={[0, -0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.4, 0.03, 32, 100]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={1.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Main head - reduced segments from 64 to 32 for better performance */}
      <mesh ref={headRef} position={[0, 0.1, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.5}
          roughness={0.1}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Face visor */}
      <mesh position={[0, 0.25, 0.95]}>
        <boxGeometry args={[1.2, 0.65, 0.1]} />
        <meshStandardMaterial
          color="#020617"
          metalness={0.9}
          roughness={0.1}
          emissive="#38bdf8"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Eyes - reduced segments from 32 to 16 */}
      <mesh position={[-0.3, 0.3, 1.01]}>
        <circleGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#e0f2fe" />
      </mesh>
      <mesh position={[0.3, 0.3, 1.01]}>
        <circleGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#e0f2fe" />
      </mesh>

      {/* Talking mouth bar */}
      <mesh position={[0, 0.05, 1.01]}>
        <boxGeometry args={[0.5, 0.06, 0.05]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive={isSpeaking ? '#22c55e' : '#16a34a'}
          emissiveIntensity={isSpeaking ? 2 : 0.7}
        />
      </mesh>
    </>
  )
})

interface AvatarProps {
  isSpeaking?: boolean
  className?: string
}

export default function Avatar({ isSpeaking = false, className = '' }: AvatarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`w-full h-full rounded-3xl neon-border overflow-hidden ${className}`}
    >
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-4, -2, -4]} intensity={0.7} />
        <Environment preset="city" />
        <AvatarModel isSpeaking={isSpeaking} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </motion.div>
  )
}
