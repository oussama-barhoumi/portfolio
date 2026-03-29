import React, { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Html, Float, Sparkles, Environment, ContactShadows, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'
import GlitchText from './GlitchText'

import mapleUrl from '../constant/japanese_red_maple.glb'


const CATEGORIES = [
  {
    id: 'fullstack',
    label: 'Full Stack Developer',
    position: [1.5, 2.5, 1.5],
    desc: 'End-to-end ownership — from database schema to pixel-perfect UI. I architect systems that scale under pressure, bridging distributed backends with interfaces that feel instant. Every layer considered. Every decision deliberate.'
  },
  {
    id: 'ai',
    label: 'AI Engineering',
    position: [4.39, 2.5, -1.0],
    desc: 'Engineering autonomous intelligence systems. From training bespoke large language models to deploying sophisticated machine learning pipelines that adapt proactively to dynamic data patterns.'
  },
  {
    id: 'uiux',
    label: 'UI/UX Design',
    position: [1.0, 1.5, 2.0],
    desc: 'Design is tension — between clarity and drama, stillness and motion. I craft interfaces where every transition earns its place and every layout provokes a reaction. Premium isn\'t a style. It\'s a standard.'
  },
  {
    id: '3d',
    label: '3D Modeling',
    position: [5, 0.8, -1.0],
    desc: 'Geometry is language. I speak it fluently — sculpting WebGL environments where light behaves, shadows breathe, and depth is felt. Spatial experiences built not just to impress, but to immerse.'
  }
]

const playHoverSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1)

    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    oscillator.start()
    oscillator.stop(audioCtx.currentTime + 0.1)
  } catch (e) {

  }
}

function TreeModel({ hoveredNode }) {
  const { scene } = useGLTF(mapleUrl)
  const group = useRef()

  const clonedScene = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((node) => {
      if (node.isMesh) {
        node.material = node.material.clone()
        node.material.emissive = new THREE.Color(0x000000)
        node.material.emissiveIntensity = 0
      }
    })
    return clone
  }, [scene])

  useEffect(() => {
    clonedScene.traverse((node) => {
      if (node.isMesh) {
        if (hoveredNode) {
          gsap.to(node.material.emissive, {
            r: 0.15, g: 0.0, b: 0.05,
            duration: 0.6,
            ease: 'power2.out'
          })
        } else {
          gsap.to(node.material.emissive, {
            r: 0, g: 0, b: 0,
            duration: 0.6,
            ease: 'power2.out'
          })
        }
      }
    })
  }, [clonedScene, hoveredNode])

  return <primitive ref={group} object={clonedScene} scale={0.030} position={[3, -1.9, 0]} />
}

function BranchHotspot({ data, hoveredNode, setHoveredNode }) {
  const isHovered = hoveredNode === data.id
  const labelRef = useRef()
  const glowRef = useRef()
  const lineRef = useRef()

  useEffect(() => {
    if (isHovered) {
      playHoverSound()
      gsap.to(labelRef.current, { opacity: 1, y: -20, scale: 1.1, duration: 0.5, ease: 'back.out(1.5)' })
      if (glowRef.current) gsap.to(glowRef.current.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.5 })
      if (lineRef.current) gsap.fromTo(lineRef.current, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.6, ease: 'power3.out' })
    } else {
      gsap.to(labelRef.current, { opacity: 0, y: 0, scale: 0.9, duration: 0.4, ease: 'power2.inOut' })
      if (glowRef.current) gsap.to(glowRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.5 })
      if (lineRef.current) gsap.to(lineRef.current, { scaleX: 0, opacity: 0, duration: 0.4, ease: 'power3.in' })
    }
  }, [isHovered])

  return (
    <group position={data.position}>
      <mesh
        visible={false}
        scale={0.8}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredNode(data.id)
          document.body.style.cursor = 'crosshair'
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHoveredNode(null)
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial />
      </mesh>

      {isHovered && (
        <group ref={glowRef}>
          <Sparkles count={40} scale={3} size={6} speed={0.6} opacity={1} color="#ff3366" />
        </group>
      )}

      <Html center style={{ pointerEvents: 'none' }}>
        <div
          ref={labelRef}
          className="opacity-0 whitespace-nowrap will-change-transform relative"
          style={{ transform: 'translateY(0px) scale(0.9)' }}
        >

          <div
            ref={lineRef}
            className="absolute top-1/2 right-full w-[25vw] h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-red-500 origin-right mr-4"
          />

          <div className="px-6 py-3 rounded-full border border-red-500/30 bg-black/60 backdrop-blur-xl relative overflow-hidden shadow-[0_0_20px_rgba(255,51,102,0.2)] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h3 className="text-white font-syne font-bold text-sm tracking-[0.2em] uppercase">
              {data.label}
            </h3>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent w-full h-[200%] -translate-y-full animate-[scan_2s_linear_infinite]" />
          </div>
        </div>
      </Html>
    </group>
  )
}

function SceneContent({ hoveredNode, setHoveredNode }) {
  const { camera, mouse } = useThree()

  useFrame(() => {
    gsap.to(camera.position, {
      x: 1 + mouse.x * 3,
      y: 3 + mouse.y * 1.5,
      duration: 2,
      ease: 'power3.out'
    })
    camera.lookAt(0, 1, 0)
  })

  return (
    <>
      <color attach="background" args={['#050508']} />
      <fog attach="fog" args={['#050508', 8, 25]} />

      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffd1d1" castShadow />

      <spotLight position={[-8, 5, 10]} angle={0.4} penumbra={1} intensity={5} color="#ff3366" />
      <spotLight position={[8, -5, -5]} angle={0.4} penumbra={1} intensity={5} color="#3b82f6" />

      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
        <TreeModel hoveredNode={hoveredNode} />
        {CATEGORIES.map(cat => (
          <BranchHotspot key={cat.id} data={cat} hoveredNode={hoveredNode} setHoveredNode={setHoveredNode} />
        ))}
      </Float>

      <ContactShadows position={[0, -3.5, 0]} opacity={0.8} scale={15} blur={2.5} far={4} color="#000000" />
      <Environment preset="night" />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.9} intensity={1.5} opacity={0.8} blendFunction={BlendFunction.SCREEN} />
        <Noise opacity={0.04} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  )
}


function LeftPanel({ hoveredNode }) {
  const panelRef = useRef(null)
  const titleRef = useRef(null)
  const descRef = useRef(null)
  const [activeObj, setActiveObj] = useState(null)

  useEffect(() => {
    if (hoveredNode) {
      const cat = CATEGORIES.find(c => c.id === hoveredNode)
      setActiveObj(cat)

      gsap.killTweensOf([panelRef.current, titleRef.current, descRef.current])


      gsap.to(panelRef.current, {
        opacity: 1,
        x: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.5,
        ease: 'power3.out'
      })


      gsap.fromTo(titleRef.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.1, ease: 'back.out(1)' })
      gsap.fromTo(descRef.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.2, ease: 'power2.out' })
    } else {

      gsap.killTweensOf([panelRef.current, titleRef.current, descRef.current])
      gsap.to(panelRef.current, {
        opacity: 0,
        x: -40,
        scale: 0.95,
        filter: 'blur(10px)',
        duration: 0.4,
        ease: 'power3.in'
      })
    }
  }, [hoveredNode])

  return (
    <div
      ref={panelRef}
      className="absolute top-1/2 -translate-y-1/2 left-10 md:left-24 w-[350px] p-8 opacity-0 -translate-x-[40px] scale-95 pointer-events-none"
      style={{ filter: 'blur(10px)' }}
    >

      <div className="absolute left-0 top-[8%] bottom-[8%] w-[2px] bg-gradient-to-b from-transparent via-red-500 to-transparent animate-pulse" />

      <div className="absolute top-0 right-0 w-7 h-7 border-t border-r border-red-500/40 rounded-tr-2xl" />
      <div className="absolute bottom-0 left-0 w-5 h-5 border-b border-l border-red-500/20" />
      <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />


      <div className="absolute inset-0 rounded-tr-2xl rounded-br-2xl bg-gradient-to-br from-red-900/10 to-black/60 backdrop-blur-2xl" />


      {[
        { top: '5%', size: 16, delay: '0s', dur: '4.2s', anim: 'drift1' },
        { top: '20%', size: 14, delay: '0.8s', dur: '5.1s', anim: 'drift2' },
        { top: '38%', size: 12, delay: '1.6s', dur: '4.6s', anim: 'drift3' },
        { top: '55%', size: 18, delay: '0.3s', dur: '5.8s', anim: 'drift4' },
        { top: '70%', size: 11, delay: '2.1s', dur: '4.9s', anim: 'drift1' },
        { top: '85%', size: 16, delay: '1.1s', dur: '5.4s', anim: 'drift3' },
      ].map((p, i) => (
        <div key={i} className="absolute -left-2.5 pointer-events-none" style={{ top: p.top }}>
          <svg width={p.size} height={p.size} viewBox="0 0 20 20" style={{ animation: `sakuraDrift ${p.dur} linear infinite ${p.delay}`, opacity: 1 }}>
            <path d="M10 1C10 1 15 6 15 11C15 15 13 18 10 19C7 18 5 15 5 11C5 6 10 1 10 1Z" fill="rgba(255,100,130,0.7)" />
            <path d="M10 1C10 1 15 6 15 11C15 15 13 18 10 19C7 18 5 15 5 11C5 6 10 1 10 1Z" fill="rgba(210,55,80,0.35)" transform={`rotate(${72 * (i % 5)} 10 10)`} />
            <circle cx="10" cy="10" r="1.5" fill="rgba(255,205,210,0.6)" />
          </svg>
        </div>
      ))}


      <div className="relative z-10">
        <h3 ref={titleRef} className="text-[#fdf6ee] font-['Noto_Serif_JP'] font-bold text-2xl uppercase tracking-[0.4em] mb-4 leading-tight drop-shadow-[0_0_18px_rgba(255,51,102,0.35)]">
          {activeObj?.label || 'AWAITING LINK...'}
        </h3>
        <p ref={descRef} className="text-[#c8b89a] font-['Noto_Serif_JP'] text-sm md:text-[0.85rem] leading-[2.1] tracking-[0.12em] drop-shadow-md">
          {activeObj?.desc || 'Data stream interrupted.'}
        </p>
      </div>
    </div>
  )
}

const TreeSection = () => {
  const [hoveredNode, setHoveredNode] = useState(null)

  return (
    <section className="relative w-full h-screen bg-[#050508] z-30 overflow-hidden cursor-crosshair">

      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [1, 3, 10], fov: 45 }} dpr={[1, 2]}>
          <React.Suspense fallback={
            <Html center>
              <div className="text-white/50 text-xs tracking-[0.3em] uppercase animate-pulse">
                Initializing Neural Branches...
              </div>
            </Html>
          }>
            <SceneContent hoveredNode={hoveredNode} setHoveredNode={setHoveredNode} />
          </React.Suspense>
        </Canvas>
      </div>


      <div className="absolute top-12 left-10 md:left-24 z-10 pointer-events-auto">
        <GlitchText text="CORE DISCIPLINES" className="text-3xl md:text-5xl leading-none" />
        <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-transparent mt-6 pointer-events-none" />
        <p className="text-slate-400 mt-6 text-xs md:text-sm font-inter tracking-[0.2em] uppercase max-w-xs pointer-events-none">
          Explore the interconnected<br />roots of my expertise.
        </p>
      </div>


      <LeftPanel hoveredNode={hoveredNode} />


      <div className="absolute bottom-12 right-10 md:right-24 z-10 pointer-events-none flex items-center gap-4 opacity-50">
        <div className="w-12 h-px bg-white" />
        <span className="text-[10px] uppercase tracking-widest text-white">Hover branches to scan</span>
      </div>
    </section>
  )
}

useGLTF.preload(mapleUrl)

export default TreeSection
