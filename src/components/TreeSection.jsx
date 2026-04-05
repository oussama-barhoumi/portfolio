import React, { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Html, Float, Sparkles, ContactShadows, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import GlitchText from './GlitchText'
import logoUrl from '../constant/logopro.png'

// ─── Theme ────────────────────────────────────────────────────────────────────
const ACCENT = '#00aaff'
const BRIGHT = '#33bbff'
const MID = '#0077cc'
const DARK_BG = 'rgba(0,12,28,0.80)'

const SAKURA_URL = '/constant/tree/scene.gltf'

const CATEGORIES = [
  { id: 'fullstack', label: 'Full Stack Developer', color: '#00aaff', position: [-1.8, 1.2, 1.6], desc: 'End-to-end ownership — from database schema to pixel-perfect UI. I architect systems that scale under pressure, bridging distributed backends with interfaces that feel instant. Every layer considered. Every decision deliberate.' },
  { id: 'ai',        label: 'AI Engineering',       color: '#aa00ff', position: [1.8, 1.6, 0.4],  desc: 'Engineering autonomous intelligence systems. From training bespoke large language models to deploying sophisticated machine learning pipelines that adapt proactively to dynamic data patterns.' },
  { id: 'uiux',      label: 'UI/UX Design',         color: '#ff6600', position: [-1.6, -0.4, 2.0], desc: "Design is tension — between clarity and drama, stillness and motion. I craft interfaces where every transition earns its place and every layout provokes a reaction. Premium isn't a style. It's a standard." },
  { id: '3d',        label: '3D Modeling',          color: '#00ffaa', position: [1.6, -0.8, 0.6], desc: 'Geometry is language. I speak it fluently — sculpting WebGL environments where light behaves, shadows breathe, and depth is felt. Spatial experiences built not just to impress, but to immerse.' },
]

// ─── Hover sound (subtle electronic ping) ─────────────────────────────────────
const playHoverSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1400, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.04, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.12)
  } catch { /* audio not supported */ }
}

// ─── Tree Model ───────────────────────────────────────────────────────────────
function TreeModel({ hoveredNode, onReady }) {
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
        node.material.metalness = Math.max(node.material.metalness ?? 0, 0.4)
        node.material.roughness = Math.min(node.material.roughness ?? 1, 0.6)
        mats.push(node.material)
      }
    })
    return { clonedScene: clone, meshMaterials: mats }
  }, [scene])

  // Compute auto-center/scale from bounding box
  const { normalScale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const ns = 3.8 / (Math.max(size.x, size.y, size.z) || 1)
    if (onReady) onReady({ normalScale: ns, offset: center })
    return { normalScale: ns, offset: center }
  }, [clonedScene, onReady])


  useEffect(() => {
    meshMaterials.forEach((mat) => {
      if (hoveredNode) {
        gsap.to(mat.emissive, { r: 0.04, g: 0.16, b: 0.35, duration: 0.65, ease: 'power2.out' })
        gsap.to(mat, { emissiveIntensity: 0.7, duration: 0.65, ease: 'power2.out' })
      } else {
        gsap.to(mat.emissive, { r: 0, g: 0, b: 0, duration: 0.65, ease: 'power2.out' })
        gsap.to(mat, { emissiveIntensity: 0, duration: 0.65, ease: 'power2.out' })
      }
    })
  }, [meshMaterials, hoveredNode])

  return (
    <group ref={group}>
      <primitive
        object={clonedScene}
        scale={normalScale}
        position={[
          -offset.x * normalScale,
          -offset.y * normalScale,
          -offset.z * normalScale,
        ]}
      />
    </group>
  )
}

// ─── Logo Hotspot ─────────────────────────────────────────────────────────────
function LogoHotspot({ data, hoveredNode, setHoveredNode }) {
  const texture = useTexture(logoUrl)
  const meshRef = useRef()
  const isHovered = hoveredNode === data.id
  const hoverScale = useRef(1.0)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const time = clock.getElapsedTime()
    // gentle independent float relative to mesh local origin
    meshRef.current.position.set(0, Math.sin(time * 0.6 + data.position[0]) * 0.12, 0)
    // face camera (billboard)
    meshRef.current.rotation.y = Math.sin(time * 0.25) * 0.18
    // hover scale lerp
    hoverScale.current = THREE.MathUtils.lerp(hoverScale.current, isHovered ? 1.18 : 1.0, 0.08)
    meshRef.current.scale.setScalar(hoverScale.current)
    // emissive color tint neutral to match HeroScene
    const targetEmissive = isHovered ? new THREE.Color(0, 0.4, 0.8) : new THREE.Color(0, 0.15, 0.4)
    meshRef.current.material.emissive.lerp(targetEmissive, 0.08)
    meshRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
      meshRef.current.material.emissiveIntensity,
      isHovered ? 0.7 : 0.15,
      0.07
    )
  })

  return (
    <group position={data.position}>
      {/* Invisible hit sphere */}
      <mesh
        visible={false}
        scale={1.2}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredNode(data.id); document.body.style.cursor = 'pointer' }}
        onPointerOut={(e)  => { e.stopPropagation(); setHoveredNode(null);    document.body.style.cursor = 'auto'    }}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial />
      </mesh>

      {/* Logo plane */}
      <mesh ref={meshRef}>
        <planeGeometry args={[0.75, 0.75]} />
        <meshStandardMaterial
          map={texture}
          transparent
          emissive={new THREE.Color(0, 0.15, 0.4)}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Neon ring below logo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.65, 0]}>
        <ringGeometry args={[0.34, 0.40, 32]} />
        <meshBasicMaterial color={data.color} transparent opacity={isHovered ? 0.9 : 0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Sparkles in category color */}
      {isHovered && (
        <Sparkles count={18} scale={2.2} size={3.5} speed={0.3} opacity={0.9} color={data.color} />
      )}

      {/* Info label below via Html */}
      {isHovered && (
        <Html center position={[0, -1.3, 0]} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(0,8,20,0.85)',
            backdropFilter: 'blur(12px)',
            border: `1.5px solid ${data.color}`,
            borderRadius: 12,
            padding: '10px 20px',
            minWidth: 180,
            maxWidth: 280,
            boxShadow: `0 0 22px ${data.color}66`,
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: data.color,
              margin: '0 0 6px',
              textShadow: `0 0 8px ${data.color}`,
            }}>
              {data.label}
            </p>
            <p style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              lineHeight: 1.7,
              color: 'rgba(200,230,255,0.75)',
              margin: 0,
            }}>
              {data.desc}
            </p>
            {/* Bottom color bar */}
            <div style={{
              height: 2,
              marginTop: 10,
              borderRadius: 2,
              background: `linear-gradient(90deg, transparent, ${data.color}, transparent)`,
            }} />
          </div>
        </Html>
      )}
    </group>
  )
}

// ─── Scene Content ────────────────────────────────────────────────────────────
function SceneContent({ hoveredNode, setHoveredNode }) {
  useFrame((state, delta) => {
    const { camera, mouse } = state
    const t = 1 - Math.exp(-4 * delta)
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 3, t)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1 + mouse.y * 1.5, t)
    camera.lookAt(0, 1, 0)
  })

  return (
    <>
      <ambientLight intensity={0.25} />
      {/* Cool white key from top */}
      <directionalLight position={[5, 10, 5]} intensity={1.8} color="#d0eeff" castShadow />
      {/* Blue neon rim lights */}
      <spotLight position={[-6, 4, 8]} angle={0.45} penumbra={1} intensity={5} color={ACCENT} />
      <spotLight position={[8, -4, -4]} angle={0.40} penumbra={1} intensity={2} color="#001833" />
      {/* Subtle fill from below */}
      <pointLight position={[0, -4, 4]} intensity={1.5} color={MID} />

      <Float speed={1.2} rotationIntensity={0.10} floatIntensity={0.3}>
        <TreeModel hoveredNode={hoveredNode} onReady={() => {}} />
        {CATEGORIES.map(cat => (
          <LogoHotspot key={cat.id} data={cat} hoveredNode={hoveredNode} setHoveredNode={setHoveredNode} />
        ))}
      </Float>

      <ContactShadows position={[0, -3.5, 0]} opacity={0.35} scale={15} blur={2.5} far={4} color={ACCENT} />
    </>
  )
}

// ─── Left Info Panel ──────────────────────────────────────────────────────────
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
      if (panelRef.current) gsap.to(panelRef.current, { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' })
      if (titleRef.current) gsap.fromTo(titleRef.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.1, ease: 'back.out(1)' })
      if (descRef.current) gsap.fromTo(descRef.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.2, ease: 'power2.out' })
    } else {
      gsap.killTweensOf([panelRef.current, titleRef.current, descRef.current].filter(Boolean))
      if (panelRef.current) gsap.to(panelRef.current, { opacity: 0, x: -40, scale: 0.95, filter: 'blur(10px)', duration: 0.4, ease: 'power3.in' })
    }
  }, [hoveredNode])

  return (
    <div
      ref={panelRef}
      className="absolute top-1/2 -translate-y-1/2 left-10 md:left-24 w-[350px] p-8 opacity-0 -translate-x-[40px] scale-95 pointer-events-none"
      style={{ filter: 'blur(10px)' }}
    >
      {/* Left neon border line */}
      <div
        className="absolute left-0 top-[8%] bottom-[8%] w-[2px] animate-pulse"
        style={{ background: `linear-gradient(to bottom, transparent, ${ACCENT}, transparent)` }}
      />
      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-7 h-7 rounded-tr-2xl" style={{ borderTop: `1px solid ${ACCENT}55`, borderRight: `1px solid ${ACCENT}55` }} />
      <div className="absolute bottom-0 left-0 w-5 h-5" style={{ borderBottom: `1px solid ${ACCENT}33`, borderLeft: `1px solid ${ACCENT}33` }} />
      <div className="absolute bottom-0 left-5 right-5 h-px" style={{ background: `linear-gradient(to right, transparent, ${ACCENT}44, transparent)` }} />

      {/* Glass background */}
      <div
        className="absolute inset-0 rounded-tr-2xl rounded-br-2xl"
        style={{
          background: `linear-gradient(135deg, rgba(0,30,60,0.55) 0%, rgba(0,5,15,0.75) 100%)`,
          backdropFilter: 'blur(20px)',
          boxShadow: `inset 0 0 30px ${ACCENT}0a, 0 0 40px ${ACCENT}18`,
        }}
      />

      {/* Floating neon particles (replace sakura with blue dots) */}
      {[
        { top: '5%', size: 4, delay: '0s', dur: '4.2s' },
        { top: '20%', size: 3, delay: '0.8s', dur: '5.1s' },
        { top: '38%', size: 5, delay: '1.6s', dur: '4.6s' },
        { top: '55%', size: 3, delay: '0.3s', dur: '5.8s' },
        { top: '70%', size: 4, delay: '2.1s', dur: '4.9s' },
        { top: '85%', size: 4, delay: '1.1s', dur: '5.4s' },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute -left-1.5 pointer-events-none"
          style={{ top: p.top }}
        >
          <div
            style={{
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: BRIGHT,
              boxShadow: `0 0 ${p.size * 2}px ${ACCENT}`,
              animation: `sakuraDrift ${p.dur} linear infinite ${p.delay}`,
            }}
          />
        </div>
      ))}

      {/* Panel content */}
      <div className="relative z-10">
        <p
          className="text-[9px] uppercase tracking-[0.35em] mb-3"
          style={{ fontFamily: "'Space Mono', monospace", color: `${ACCENT}aa` }}
        >
          // discipline
        </p>
        <h3
          ref={titleRef}
          className="font-bold text-2xl uppercase tracking-[0.25em] mb-4 leading-tight"
          style={{
            fontFamily: "'Black Ops One', cursive",
            color: '#e8f6ff',
            textShadow: `0 0 20px ${ACCENT}88`,
          }}
        >
          {activeObj?.label || 'AWAITING LINK...'}
        </h3>
        <p
          ref={descRef}
          className="text-sm leading-[2.0] tracking-[0.06em]"
          style={{
            fontFamily: "'Space Mono', monospace",
            color: 'rgba(180,220,255,0.72)',
          }}
        >
          {activeObj?.desc || 'Data stream interrupted.'}
        </p>
      </div>
    </div>
  )
}

// ─── Tree Section ─────────────────────────────────────────────────────────────
const TreeSection = () => {
  const [hoveredNode, setHoveredNode] = useState(null)

  return (
    <section
      className="relative w-full h-screen z-30 overflow-hidden"
      style={{ background: 'transparent' }}
    >
      {/* 3D canvas */}
      <div className="absolute inset-0 z-1">
        <Canvas
          camera={{ position: [0, 1, 9], fov: 48 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 1.5]}
          style={{ background: 'transparent' }}
        >
          <React.Suspense fallback={
            <Html center>
              <div
                className="text-xs tracking-[0.3em] uppercase animate-pulse"
                style={{ fontFamily: "'Space Mono', monospace", color: BRIGHT }}
              >
                Initializing Neural Branches...
              </div>
            </Html>
          }>
            <SceneContent hoveredNode={hoveredNode} setHoveredNode={setHoveredNode} />
          </React.Suspense>
        </Canvas>
      </div>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="absolute top-12 left-10 md:left-24 z-10 pointer-events-auto">
        <GlitchText text="CORE DISCIPLINES" className="text-3xl md:text-5xl leading-none" />
        {/* Blue neon rule */}
        <div
          className="w-16 h-px mt-6 pointer-events-none"
          style={{ background: `linear-gradient(to right, ${ACCENT}, transparent)`, boxShadow: `0 0 8px ${ACCENT}` }}
        />
        <p
          className="mt-6 text-xs md:text-sm tracking-[0.2em] uppercase max-w-xs pointer-events-none"
          style={{ fontFamily: "'Space Mono', monospace", color: 'rgba(0,170,255,0.55)' }}
        >
          Explore the interconnected<br />roots of my expertise.
        </p>
      </div>

      {/* ── Bottom hint ────────────────────────────────────────────────────── */}
      <div className="absolute bottom-12 right-10 md:right-24 z-10 pointer-events-none flex items-center gap-4 opacity-40">
        <div className="w-12 h-px" style={{ background: ACCENT }} />
        <span
          className="text-[10px] uppercase tracking-widest"
          style={{ fontFamily: "'Space Mono', monospace", color: BRIGHT }}
        >
          Hover branches to scan
        </span>
      </div>
    </section>
  )
}

useGLTF.preload(SAKURA_URL)

export default TreeSection
