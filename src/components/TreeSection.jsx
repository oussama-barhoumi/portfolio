import React, { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Html, Float, Sparkles, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GlitchText from './GlitchText'

gsap.registerPlugin(ScrollTrigger)

const SAKURA_URL = '/constant/sakura/scene.gltf'


const CATEGORIES = [
  {
    id: 'fullstack',
    label: 'Full Stack Developer',
    position: [2.3, 2.1, 1.2],
    desc: 'End-to-end ownership — from database schema to pixel-perfect UI. I architect systems that scale under pressure, bridging distributed backends with interfaces that feel instant. Every layer considered. Every decision deliberate.'
  },
  {
    id: 'ai',
    label: 'AI Engineering',
    position: [4.2, 2.8, -0.8],
    desc: 'Engineering autonomous intelligence systems. From training bespoke large language models to deploying sophisticated machine learning pipelines that adapt proactively to dynamic data patterns.'
  },
  {
    id: 'uiux',
    label: 'UI/UX Design',
    position: [1.1, 0.7, 2.2],
    desc: 'Design is tension — between clarity and drama, stillness and motion. I craft interfaces where every transition earns its place and every layout provokes a reaction. Premium isn\'t a style. It\'s a standard.'
  },
  {
    id: '3d',
    label: '3D Modeling',
    position: [5.5, 0.3, -0.8],
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
  } catch {
    // audio not supported
  }
}

function TreeModel({ hoveredNode, isTreeInView }) {
  const { scene } = useGLTF(SAKURA_URL)
  const group = useRef()

  const { clonedScene, meshMaterials } = useMemo(() => {
    const clone = scene.clone()
    const mats = []
    clone.traverse((node) => {
      if (node.isMesh) {
        node.material = node.material.clone()
        node.material.emissive = new THREE.Color(0x000000)
        node.material.emissiveIntensity = 0
        mats.push(node.material)
      }
    })
    return { clonedScene: clone, meshMaterials: mats }
  }, [scene])

  useEffect(() => {
    meshMaterials.forEach((mat) => {
      // Blossom meshes get a warm pink glow; bark gets a subtle red
      const isBlossom = mat.name?.toLowerCase().includes('sakura') ||
        mat.map?.image?.src?.includes('sakura')
      if (hoveredNode) {
        gsap.to(mat.emissive, {
          r: isBlossom ? 0.30 : 0.12,
          g: isBlossom ? 0.06 : 0.01,
          b: isBlossom ? 0.10 : 0.03,
          duration: 0.65,
          ease: 'power2.out',
        })
      } else {
        gsap.to(mat.emissive, {
          r: 0, g: 0, b: 0,
          duration: 0.65,
          ease: 'power2.out',
        })
      }
    })
  }, [meshMaterials, hoveredNode])

  useEffect(() => {
    if (!group.current) return
    if (isTreeInView) {
      gsap.to(group.current.scale, { x: 0.12, y: 0.12, z: 0.12, duration: 2.2, ease: 'elastic.out(1, 0.6)' })
      gsap.to(group.current.rotation, { y: 0, duration: 2.2, ease: 'power3.out' })
    } else {
      gsap.to(group.current.scale, { x: 0, y: 0, z: 0, duration: 0.8, ease: 'power2.in' })
      gsap.to(group.current.rotation, { y: Math.PI / 4, duration: 0.8, ease: 'power2.in' })
    }
  }, [isTreeInView])

  // Sakura GLTF is much larger than the GLB maple — scale and re-center accordingly
  return <primitive ref={group} object={clonedScene} scale={0} position={[2.9, -1.5, 0]} />
}

function BranchHotspot({ data, hoveredNode, setHoveredNode, isTreeInView }) {
  const isHovered = hoveredNode === data.id
  const labelRef = useRef()
  const glowRef = useRef()
  const lineRef = useRef()

  useEffect(() => {
    // Kill any in-progress tweens on these elements before starting new ones
    // — prevents overlapping animations when hover state flips quickly
    gsap.killTweensOf([labelRef.current, lineRef.current].filter(Boolean))

    if (isHovered) {
      playHoverSound()
      if (labelRef.current) gsap.to(labelRef.current, { opacity: 1, y: -18, scale: 1.05, duration: 0.55, ease: 'power3.out' })
      if (glowRef.current) gsap.to(glowRef.current.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.6, ease: 'power2.out' })
      if (lineRef.current) gsap.fromTo(lineRef.current, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.5, ease: 'expo.out' })
    } else {
      if (labelRef.current) gsap.to(labelRef.current, { opacity: 0, y: 0, scale: 0.92, duration: 0.38, ease: 'power2.inOut' })
      if (glowRef.current) gsap.to(glowRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'power2.out' })
      if (lineRef.current) gsap.to(lineRef.current, { scaleX: 0, opacity: 0, duration: 0.30, ease: 'power2.in' })
    }
  }, [isHovered])

  const groupRef = useRef()

  useEffect(() => {
    if (!groupRef.current) return
    if (isTreeInView) {
      gsap.to(groupRef.current.scale, { x: 1, y: 1, z: 1, duration: 1.5, delay: 0.6 + Math.random() * 0.4, ease: 'elastic.out(1, 0.5)' })
    } else {
      gsap.to(groupRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.4, ease: 'power2.in' })
    }
  }, [isTreeInView])

  return (
    <group ref={groupRef} position={data.position} scale={0}>
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
          <Sparkles count={22} scale={3.5} size={4.5} speed={0.30} opacity={0.80} color="#ffcc00" /> {/* YELLOW */}
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
            className="absolute top-1/2 right-full w-[25vw] h-px origin-right mr-4"
            style={{ background: 'linear-gradient(to right, transparent, #ffcc00, #ffcc00)' }} 
          />

          <div 
            className="px-6 py-3 rounded-full relative overflow-hidden flex items-center gap-3"
            style={{ 
              background: '#0a0a0a', 
              border: '1px solid rgba(255,204,0,0.4)', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ffcc00' }} /> {/* YELLOW */}
            <h3 className="font-syne font-bold text-sm tracking-[0.2em] uppercase" style={{ color: '#e8edf2' }}> {/* CHARCOAL */}
              {data.label}
            </h3>
            <div className="absolute inset-0 w-full h-[200%] -translate-y-full animate-[scan_2s_linear_infinite]" style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,204,0,0.05), transparent)' }} />
          </div>
        </div>
      </Html>
    </group>
  )
}

function SceneContent({ hoveredNode, setHoveredNode, isTreeInView }) {
  useFrame((state, delta) => {
    // Read camera + mouse from state (not useThree) to satisfy mutation rules
    // Frame-rate-independent exponential lerp — replaces GSAP tween that was
    // creating a new animation instance on every single frame (60×/sec memory churn)
    const { camera, mouse } = state
    const t = 1 - Math.exp(-4 * delta)
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, 1 + mouse.x * 3, t)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 3 + mouse.y * 1.5, t)
    camera.lookAt(0, 1, 0)
  })

  return (
    <>
      <ambientLight intensity={0.30} />
      <directionalLight position={[5, 10, 5]} intensity={2.0} color="#ffe8f0" castShadow />
      <spotLight position={[-6, 4, 8]} angle={0.45} penumbra={1} intensity={5} color="#ff6b9d" />
      <spotLight position={[8, -4, -4]} angle={0.40} penumbra={1} intensity={3} color="#660022" />


      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
        <TreeModel hoveredNode={hoveredNode} isTreeInView={isTreeInView} />
        {CATEGORIES.map(cat => (
          <BranchHotspot key={cat.id} data={cat} hoveredNode={hoveredNode} setHoveredNode={setHoveredNode} isTreeInView={isTreeInView} />
        ))}
      </Float>

      <ContactShadows resolution={256} frames={1} position={[0, -3.5, 0]} opacity={0.5} scale={15} blur={2.5} far={4} color="#000000" />
    </>
  )
}


function LeftPanel({ hoveredNode }) {
  const panelRef = useRef(null)
  const titleRef = useRef(null)
  const descRef = useRef(null)

  const activeObj = useMemo(
    () => CATEGORIES.find(c => c.id === hoveredNode) ?? null,
    [hoveredNode]
  )

  useEffect(() => {
    if (hoveredNode) {
      gsap.killTweensOf([panelRef.current, titleRef.current, descRef.current].filter(Boolean))

      if (panelRef.current) {
        gsap.to(panelRef.current, {
          opacity: 1,
          x: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.5,
          ease: 'power3.out'
        })
      }

      if (titleRef.current) gsap.fromTo(titleRef.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.1, ease: 'back.out(1)' })
      if (descRef.current) gsap.fromTo(descRef.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.2, ease: 'power2.out' })
    } else {

      gsap.killTweensOf([panelRef.current, titleRef.current, descRef.current].filter(Boolean))
      if (panelRef.current) {
        gsap.to(panelRef.current, {
          opacity: 0,
          x: -40,
          scale: 0.95,
          filter: 'blur(10px)',
          duration: 0.4,
          ease: 'power3.in'
        })
      }
    }
  }, [hoveredNode])

  return (
    <div
      ref={panelRef}
      className="absolute top-1/2 -translate-y-1/2 left-10 md:left-24 w-[350px] p-8 opacity-0 -translate-x-[40px] scale-95 pointer-events-none"
      style={{ filter: 'blur(10px)' }}
    >
      <div 
        className="absolute inset-0 rounded-tr-2xl rounded-br-2xl" 
        style={{ 
          background: '#0a0a0a', 
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderLeft: '3px solid #ff3366' 
        }} 
      />

      <div className="absolute top-0 right-0 w-7 h-7 border-t border-r rounded-tr-2xl" style={{ borderColor: 'rgba(0,170,255,0.3)' }} /> {/* STEEL */}
      <div className="absolute bottom-0 left-0 w-5 h-5 border-b border-l" style={{ borderColor: 'rgba(0,170,255,0.2)' }} />
      <div className="absolute bottom-0 left-5 right-5 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(0,170,255,0.3), transparent)' }} />


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
            <path d="M10 1C10 1 15 6 15 11C15 15 13 18 10 19C7 18 5 15 5 11C5 6 10 1 10 1Z" fill="rgba(0,170,255,0.4)" />
            <path d="M10 1C10 1 15 6 15 11C15 15 13 18 10 19C7 18 5 15 5 11C5 6 10 1 10 1Z" fill="rgba(0,170,255,0.15)" transform={`rotate(${72 * (i % 5)} 10 10)`} />
            <circle cx="10" cy="10" r="1.5" fill="rgba(0,170,255,0.3)" />
          </svg>
        </div>
      ))}


      <div className="relative z-10">
        <h3 ref={titleRef} className="font-['Noto_Serif_JP'] font-bold text-2xl uppercase tracking-[0.4em] mb-4 leading-tight" style={{ color: '#00aaff' }}> {/* STEEL */}
          {activeObj?.label || 'AWAITING LINK...'}
        </h3>
        <p ref={descRef} className="font-['Noto_Serif_JP'] text-sm md:text-[0.85rem] leading-[2.1] tracking-[0.12em]" style={{ color: '#e8edf2' }}> {/* CHARCOAL */}
          {activeObj?.desc || 'Data stream interrupted.'}
        </p>
      </div>
    </div>
  )
}

const TreeSection = () => {
  const [hoveredNode, setHoveredNode] = useState(null)
  const [isTreeInView, setIsTreeInView] = useState(false)
  const sectionRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=1500', // Pin it
        pin: true,
        anticipatePin: 1,
      })

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 75%',
        onEnter: () => setIsTreeInView(true),
        onLeaveBack: () => setIsTreeInView(false)
      })

      gsap.fromTo(contentRef.current,
        { opacity: 0, scale: 0.92, y: 100 },
        {
          opacity: 1, scale: 1, y: 0,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          }
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative w-full h-screen bg-transparent z-30 overflow-hidden">
      <div ref={contentRef} className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 z-1">
        <Canvas
          camera={{ position: [1, 3, 10], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 1]}
          style={{ background: 'transparent' }}
        >
          <React.Suspense fallback={
            <Html center>
              <div className="text-white/50 text-xs tracking-[0.3em] uppercase animate-pulse">
                Initializing Neural Branches...
              </div>
            </Html>
          }>
            <SceneContent hoveredNode={hoveredNode} setHoveredNode={setHoveredNode} isTreeInView={isTreeInView} />
          </React.Suspense>
        </Canvas>
      </div>


      <div className="absolute top-12 left-10 md:left-24 z-10 pointer-events-auto">
        <div style={{ filter: 'none' }}> {/* Invert to CHARCOAL */}
          <GlitchText text="CORE DISCIPLINES" className="text-3xl md:text-5xl leading-none" />
        </div>
        <div className="w-16 h-1 mt-6 pointer-events-none" style={{ background: 'linear-gradient(to right, #00aaff, transparent)' }} /> {/* STEEL */}
        <p className="mt-6 text-xs md:text-sm font-inter tracking-[0.2em] uppercase max-w-xs pointer-events-none" style={{ color: '#0a0a0a' }}> {/* Readable against 3D canvas */}
          Explore the interconnected<br />roots of my expertise.
        </p>
      </div>

      <LeftPanel hoveredNode={hoveredNode} />

      <div className="absolute bottom-12 right-10 md:right-24 z-10 pointer-events-none flex items-center gap-4 opacity-50">
        <div className="w-12 h-px" style={{ background: 'rgba(255,204,0,0.5)' }} /> {/* YELLOW */}
        <span className="text-[10px] uppercase tracking-widest" style={{ color: '#0a0a0a' }}>Hover branches to scan</span>
      </div>
      </div>
    </section>
  )
}

useGLTF.preload(SAKURA_URL)

export default TreeSection