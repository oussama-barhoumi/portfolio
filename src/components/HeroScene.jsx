import React, { useRef, useMemo, Suspense, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  useGLTF,
  Environment,
  Float,
  Stars,
  Sparkles,
  Html
} from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import HeroOverlay from './HeroOverlay'
import HeroSection from './herosection'

gsap.registerPlugin(ScrollTrigger)

const MODEL_PATH = '/constant/death_weapon/scene.gltf'

const Model = ({ side, progress }) => {
  const { scene } = useGLTF(MODEL_PATH)
  const group = useRef()

  const clonedScene = useMemo(() => scene.clone(), [scene])
  const baseScale = 0.06

  useFrame((state, delta) => {
    const r1 = progress.current
    let targetX = 0
    let targetXOffset = side === 'left' ? -18 : 18
    let targetYOffset = side === 'left' ? 0 : 0
    let targetZ = side === 'left' ? -1 : 1
    let targetOpacity = 1

    if (r1 <= 0.3) {

      const t = r1 / 0.3
      const startX = 0
      const endX = side === 'left' ? -19 : 19
      targetX = THREE.MathUtils.lerp(startX, endX, t)
    } else if (r1 <= 0.7) {

      const t = (r1 - 0.3) / 0.4
      const startX = side === 'left' ? -19 : 19
      const endX = side === 'left' ? 19 : -19
      targetX = THREE.MathUtils.lerp(startX, endX, t)
    } else {

      const t = (r1 - 0.7) / 0.3
      const startX = side === 'left' ? 19 : -19
      const endX = side === 'left' ? 25 : -25
      targetX = THREE.MathUtils.lerp(startX, endX, t)

      if (r1 > 0.8) {
        targetOpacity = THREE.MathUtils.lerp(1, 0, (r1 - 0.8) * 5)
      }
    }

    group.current.position.x = targetX + targetXOffset
    group.current.position.y = targetYOffset
    group.current.position.z = targetZ


    group.current.rotation.y += delta * 0.4
    group.current.rotation.z = side === 'left' ? r1 * Math.PI : -r1 * Math.PI


    const scaleFactor = 1 - Math.abs(r1 - 0.5) * 2
    const currentScale = baseScale * (1 + Math.max(0, scaleFactor) * 0.5)
    group.current.scale.setScalar(currentScale)
    group.current.traverse((node) => {
      if (node.isMesh) {
        node.material.transparent = true
        node.material.opacity = targetOpacity
      }
    })
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <primitive ref={group} object={clonedScene} />
    </Float>
  )
}

const SceneContent = ({ progress }) => {
  useFrame((state) => {
    const r1 = progress.current
    state.camera.position.z = THREE.MathUtils.lerp(30, 20, r1)
    state.camera.lookAt(0, 0, 0)
  })

  return (
    <>
      <color attach="background" args={['#050508']} />
      <fog attach="fog" args={['#050508', 10, 50]} />

      <ambientLight intensity={0.5} />
      <spotLight position={[20, 20, 10]} angle={0.15} penumbra={1} intensity={2} color="#8b5cf6" castShadow />
      <pointLight position={[-10, -10, -10]} intensity={1.5} color="#3b82f6" />

      <spotLight position={[15, 5, 5]} angle={0.3} intensity={5} color="#ffffff" penumbra={1} />
      <spotLight position={[-15, 5, 5]} angle={0.3} intensity={5} color="#ffffff" penumbra={1} />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={20} size={2} speed={0.4} opacity={0.5} color="#8b5cf6" />

      <Model side="left" progress={progress} />
      <Model side="right" progress={progress} />

      <EffectComposer multisampling={0} disableNormalPass>
        <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} blendFunction={BlendFunction.SCREEN} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <ChromaticAberration offset={[0.002, 0.002]} />
        <Noise opacity={0.05} />
      </EffectComposer>

      <Environment preset="night" />
    </>
  )
}

const HeroScene = () => {
  const containerRef = useRef()
  const progressRef = useRef(0)

  useEffect(() => {
    const sc = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        progressRef.current = self.progress
      }
    })

    return () => {
      sc.kill()
    }
  }, [])

  return (
    <div ref={containerRef} className="h-[400vh] w-full relative z-10">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <Canvas shadows gl={{ antialias: true, alpha: true, stencil: true }} dpr={[1, 2]}>
          <Suspense fallback={<Html center><div className="text-white text-xs uppercase tracking-widest">Initialising Systems...</div></Html>}>
            <SceneContent progress={progressRef} />
          </Suspense>
        </Canvas>
        <HeroOverlay progress={progressRef} />
        <HeroSection progress={progressRef} />
      </div>
    </div>
  )
}

useGLTF.preload(MODEL_PATH)

export default HeroScene