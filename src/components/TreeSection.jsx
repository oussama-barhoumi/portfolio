import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Html, Float, Sparkles, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GlitchText from './GlitchText'

gsap.registerPlugin(ScrollTrigger)

const SAKURA_URL = '/constant/sakura/scene.gltf'

// ─── Sakura rose / warm gold palette ────────────────────────────────────────
// Primary accent  : #c9a96e  (antique gold / warm amber)
// Secondary accent: #e8b4b8  (soft sakura pink)
// Glow highlight  : #f5c5c5  (pale blossom)
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: 'fullstack',
    label: 'Full Stack Developer',
    position: [2.3, 2.1, 1.2],
    mobilePosition: [1.2, 1.4, 1.0],
    desc: 'End-to-end ownership — from database schema to pixel-perfect UI. I architect systems that scale under pressure, bridging distributed backends with interfaces that feel instant. Every layer considered. Every decision deliberate.'
  },
  {
    id: 'ai',
    label: 'AI Engineering',
    position: [4.2, 2.8, -0.8],
    mobilePosition: [2.0, 2.2, -0.5],
    desc: 'Engineering autonomous intelligence systems. From training bespoke large language models to deploying sophisticated machine learning pipelines that adapt proactively to dynamic data patterns.'
  },
  {
    id: 'uiux',
    label: 'UI/UX Design',
    position: [1.1, 0.7, 2.2],
    mobilePosition: [0.8, 0.5, 1.5],
    desc: 'Design is tension — between clarity and drama, stillness and motion. I craft interfaces where every transition earns its place and every layout provokes a reaction. Premium isn\'t a style. It\'s a standard.'
  },
  {
    id: '3d',
    label: '3D Modeling',
    position: [5.5, 0.3, -0.8],
    mobilePosition: [2.2, 0.2, -0.5],
    desc: 'Geometry is language. I speak it fluently — sculpting WebGL environments where light behaves, shadows breathe, and depth is felt. Spatial experiences built not just to impress, but to immerse.'
  }
]

const ROTATION_ANGLES = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]

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
  } catch { }
}

function useBreakpoint() {
  const [bp, setBp] = useState('desktop')
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      if (w < 640) setBp('mobile')
      else if (w < 1024) setBp('tablet')
      else setBp('desktop')
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return bp
}

function TreeModel({ hoveredNode, isTreeInView, breakpoint, swipeRotation }) {
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
      const isBlossom = mat.name?.toLowerCase().includes('sakura') ||
        mat.map?.image?.src?.includes('sakura')
      if (hoveredNode) {
        gsap.to(mat.emissive, {
          // warm rose glow on hover
          r: isBlossom ? 0.35 : 0.18,
          g: isBlossom ? 0.08 : 0.04,
          b: isBlossom ? 0.12 : 0.04,
          duration: 0.65,
          ease: 'power2.out',
        })
      } else {
        gsap.to(mat.emissive, { r: 0, g: 0, b: 0, duration: 0.65, ease: 'power2.out' })
      }
    })
  }, [meshMaterials, hoveredNode])

  useEffect(() => {
    if (!group.current) return
    const isMobile = breakpoint === 'mobile'
    const targetScale = isMobile ? 0.07 : breakpoint === 'tablet' ? 0.09 : 0.12
    if (isTreeInView) {
      gsap.to(group.current.scale, { x: targetScale, y: targetScale, z: targetScale, duration: 2.2, ease: 'elastic.out(1, 0.6)' })
      gsap.to(group.current.rotation, { y: swipeRotation, duration: 1.2, ease: 'power3.out' })
    } else {
      gsap.to(group.current.scale, { x: 0, y: 0, z: 0, duration: 0.8, ease: 'power2.in' })
      gsap.to(group.current.rotation, { y: Math.PI / 4, duration: 0.8, ease: 'power2.in' })
    }
  }, [isTreeInView, breakpoint, swipeRotation])

  const isSmallMobile = window.innerWidth <= 430
  const position = breakpoint === 'mobile' ? [0, isSmallMobile ? -1.8 : -1.2, 0]
    : breakpoint === 'tablet' ? [1.5, -1.3, 0]
      : [2.9, -1.5, 0]

  return <primitive ref={group} object={clonedScene} scale={0} position={position} />
}

function BranchHotspot({ data, hoveredNode, setHoveredNode, isTreeInView, breakpoint }) {
  const isMobile = breakpoint === 'mobile'
  const isHovered = hoveredNode === data.id
  const labelRef = useRef()
  const glowRef = useRef()
  const lineRef = useRef()
  const groupRef = useRef()

  const pos = isMobile ? data.mobilePosition : data.position

  useEffect(() => {
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

  useEffect(() => {
    if (!groupRef.current) return
    if (isTreeInView) {
      gsap.to(groupRef.current.scale, { x: 1, y: 1, z: 1, duration: 1.5, delay: 0.6 + Math.random() * 0.4, ease: 'elastic.out(1, 0.5)' })
    } else {
      gsap.to(groupRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.4, ease: 'power2.in' })
    }
  }, [isTreeInView])

  return (
    <group ref={groupRef} position={pos} scale={0}>
      <mesh
        visible={false}
        scale={isMobile ? 1.2 : 0.8}
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
          {/* Warm sakura-pink sparkles */}
          <Sparkles count={isMobile ? 14 : 22} scale={isMobile ? 2.5 : 3.5} size={isMobile ? 3 : 4.5} speed={0.30} opacity={0.80} color="#e8b4b8" />
        </group>
      )}

      {!isMobile && (
        <Html center style={{ pointerEvents: 'none' }}>
          <div
            ref={labelRef}
            className="opacity-0 whitespace-nowrap will-change-transform relative"
            style={{ transform: 'translateY(0px) scale(0.9)' }}
          >
            <div
              ref={lineRef}
              className="absolute top-1/2 right-full h-px origin-right mr-4"
              style={{
                width: '20vw',
                background: 'linear-gradient(to right, transparent, #c9a96e, #c9a96e)'
              }}
            />
            <div
              className="px-6 py-3 rounded-full relative overflow-hidden flex items-center gap-3"
              style={{
                background: 'rgba(10, 8, 12, 0.75)',
                backdropFilter: 'blur(16px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(16px) saturate(1.3)',
                border: '1px solid rgba(201,169,110,0.35)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.35), 0 0 20px rgba(201,169,110,0.08)'
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: '#c9a96e', animation: 'neonPulse 2s ease-in-out infinite' }} />
              <h3 className="font-syne font-bold text-sm tracking-[0.2em] uppercase" style={{ color: '#f0e8dd' }}>
                {data.label}
              </h3>
              <div className="absolute inset-0 w-full h-[200%] -translate-y-full" style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,169,110,0.04), transparent)', animation: 'scan 3s linear infinite' }} />
            </div>
          </div>
        </Html>
      )}

      {isMobile && (
        <Html center style={{ pointerEvents: 'none' }}>
          <div
            style={{
              width: isHovered ? 14 : 8,
              height: isHovered ? 14 : 8,
              borderRadius: '50%',
              background: isHovered ? '#c9a96e' : 'rgba(201,169,110,0.5)',
              border: '1.5px solid rgba(201,169,110,0.8)',
              transition: 'all 0.3s ease',
              boxShadow: isHovered ? '0 0 10px rgba(201,169,110,0.8)' : 'none'
            }}
          />
        </Html>
      )}
    </group>
  )
}

function SceneContent({ hoveredNode, setHoveredNode, isTreeInView, breakpoint, swipeRotation }) {
  const isMobile = breakpoint === 'mobile'
  const isTablet = breakpoint === 'tablet'

  useFrame((state, delta) => {
    const { camera, mouse } = state
    const t = 1 - Math.exp(-4 * delta)
    if (isMobile) {
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 1.5, t)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2 + mouse.y * 0.8, t)
    } else if (isTablet) {
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0.5 + mouse.x * 2, t)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2.5 + mouse.y * 1, t)
    } else {
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 1 + mouse.x * 3, t)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 3 + mouse.y * 1.5, t)
    }
    camera.lookAt(0, 1, 0)
  })

  return (
    <>
      <ambientLight intensity={0.30} />
      {/* Warm sakura-tinted directional light */}
      <directionalLight position={[5, 10, 5]} intensity={2.0} color="#ffe8f0" castShadow />
      {/* Deep rose fill light */}
      <spotLight position={[-6, 4, 8]} angle={0.45} penumbra={1} intensity={5} color="#ff6b9d" />
      {/* Warm amber rim */}
      <spotLight position={[8, -4, -4]} angle={0.40} penumbra={1} intensity={3} color="#7a3320" />

      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
        <TreeModel hoveredNode={hoveredNode} isTreeInView={isTreeInView} breakpoint={breakpoint} swipeRotation={swipeRotation} />
        {CATEGORIES.map(cat => (
          <BranchHotspot
            key={cat.id}
            data={cat}
            hoveredNode={hoveredNode}
            setHoveredNode={setHoveredNode}
            isTreeInView={isTreeInView}
            breakpoint={breakpoint}
          />
        ))}
      </Float>

      <ContactShadows resolution={256} frames={1} position={[0, -3.5, 0]} opacity={0.5} scale={15} blur={2.5} far={4} color="#1a0808" />
    </>
  )
}

function DescriptionPanel({ hoveredNode }) {
  const panelRef = useRef(null)
  const titleRef = useRef(null)
  const descRef = useRef(null)
  const indexRef = useRef(null)

  const activeObj = useMemo(
    () => CATEGORIES.find(c => c.id === hoveredNode) ?? null,
    [hoveredNode]
  )

  const activeIndex = useMemo(
    () => CATEGORIES.findIndex(c => c.id === hoveredNode),
    [hoveredNode]
  )

  useEffect(() => {
    const els = [panelRef.current, titleRef.current, descRef.current, indexRef.current].filter(Boolean)
    if (hoveredNode) {
      gsap.killTweensOf(els)
      if (panelRef.current) {
        gsap.to(panelRef.current, { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' })
      }
      if (indexRef.current) gsap.fromTo(indexRef.current, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, delay: 0.05, ease: 'power2.out' })
      if (titleRef.current) gsap.fromTo(titleRef.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.1, ease: 'back.out(1)' })
      if (descRef.current) gsap.fromTo(descRef.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.2, ease: 'power2.out' })
    } else {
      gsap.killTweensOf(els)
      if (panelRef.current) {
        gsap.to(panelRef.current, { opacity: 0, x: -40, scale: 0.95, filter: 'blur(10px)', duration: 0.4, ease: 'power3.in' })
      }
    }
  }, [hoveredNode])

  return (
    <div
      ref={panelRef}
      className="absolute top-1/2 -translate-y-1/2 left-6 sm:left-10 md:left-16 lg:left-24 w-[85vw] sm:w-[350px] md:w-[380px] p-6 sm:p-8 opacity-0 -translate-x-[40px] scale-95 pointer-events-none z-10"
      style={{ filter: 'blur(10px)' }}
    >
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'rgba(10, 8, 12, 0.65)',
          backdropFilter: 'blur(28px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.5)',
          boxShadow: '0 12px 48px rgba(0,0,0,0.5), 0 0 40px rgba(201,169,110,0.06), inset 0 1px 0 rgba(255,255,255,0.06)',
          border: '1px solid rgba(201,169,110,0.12)',
          borderLeft: '3px solid #c9a96e'
        }}
      />

      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r rounded-tr-2xl" style={{ borderColor: 'rgba(201,169,110,0.25)' }} />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l rounded-bl-2xl" style={{ borderColor: 'rgba(201,169,110,0.15)' }} />
      <div className="absolute bottom-0 left-6 right-6 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(201,169,110,0.2), transparent)' }} />

      {[
        { top: '5%', size: 16, delay: '0s', dur: '4.2s' },
        { top: '20%', size: 14, delay: '0.8s', dur: '5.1s' },
        { top: '38%', size: 12, delay: '1.6s', dur: '4.6s' },
        { top: '55%', size: 18, delay: '0.3s', dur: '5.8s' },
        { top: '70%', size: 11, delay: '2.1s', dur: '4.9s' },
        { top: '85%', size: 16, delay: '1.1s', dur: '5.4s' },
      ].map((p, i) => (
        <div key={i} className="absolute -left-2.5 pointer-events-none" style={{ top: p.top }}>
          <svg width={p.size} height={p.size} viewBox="0 0 20 20" style={{ animation: `sakuraDrift ${p.dur} linear infinite ${p.delay}`, opacity: 1 }}>
            <path d="M10 1C10 1 15 6 15 11C15 15 13 18 10 19C7 18 5 15 5 11C5 6 10 1 10 1Z" fill="rgba(201,169,110,0.4)" />
            <path d="M10 1C10 1 15 6 15 11C15 15 13 18 10 19C7 18 5 15 5 11C5 6 10 1 10 1Z" fill="rgba(232,180,184,0.2)" transform={`rotate(${72 * (i % 5)} 10 10)`} />
            <circle cx="10" cy="10" r="1.5" fill="rgba(201,169,110,0.35)" />
          </svg>
        </div>
      ))}

      <div className="relative z-10">
        <span
          ref={indexRef}
          className="block text-[10px] tracking-[0.3em] uppercase font-mono mb-2"
          style={{ color: '#c9a96e' }}
        >
          {activeIndex >= 0 ? `${String(activeIndex + 1).padStart(2, '0')} / ${String(CATEGORIES.length).padStart(2, '0')}` : '—— / ——'}
        </span>
        <h3 ref={titleRef} className="font-['Noto_Serif_JP'] font-bold text-xl sm:text-2xl uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-4 leading-tight" style={{ color: '#c9a96e' }}>
          {activeObj?.label || 'AWAITING LINK...'}
        </h3>
        <div className="w-10 h-px mb-4" style={{ background: 'linear-gradient(to right, #c9a96e, transparent)' }} />
        <p ref={descRef} className="font-['Noto_Serif_JP'] text-sm md:text-[0.85rem] leading-[2.1] tracking-[0.12em]" style={{ color: 'rgba(240,232,221,0.85)' }}>
          {activeObj?.desc || 'Data stream interrupted.'}
        </p>
      </div>
    </div>
  )
}

// ─── Redesigned Mobile Panel — matches image 2 aesthetic ────────────────────
function MobileBottomPanel({ hoveredNode, setHoveredNode, activeIndex, setActiveIndex, onSwipe }) {
  const panelRef = useRef(null)
  const activeObj = CATEGORIES[activeIndex]
  const touchStartX = useRef(null)

  useEffect(() => {
    setHoveredNode(activeObj.id)
  }, [activeIndex])

  // Slide-up entrance
  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(panelRef.current,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.9, ease: 'power3.out' }
      )
    }
  }, [])

  const textRef = useRef(null)
  useEffect(() => {
    if (textRef.current) {
      gsap.fromTo(textRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
      )
    }
  }, [activeIndex])

  const goNext = useCallback(() => {
    setActiveIndex(i => {
      const next = (i + 1) % CATEGORIES.length
      onSwipe(next)
      return next
    })
  }, [onSwipe])

  const goPrev = useCallback(() => {
    setActiveIndex(i => {
      const next = (i - 1 + CATEGORIES.length) % CATEGORIES.length
      onSwipe(next)
      return next
    })
  }, [onSwipe])

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) { dx < 0 ? goNext() : goPrev() }
    touchStartX.current = null
  }

  return (
    <div
      ref={panelRef}
      className="absolute bottom-50 left-0 right-0 z-20 flex flex-col items-center"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 24px)',
        paddingLeft: '5%',
        paddingRight: '5%',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Info card ── */}
      <div
        className="w-full max-w-[480px] relative rounded-2xl overflow-hidden mb-10"
        style={{
          background: 'rgba(8, 5, 8, 0.72)',
          backdropFilter: 'blur(32px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(32px) saturate(1.6)',
          border: '1px solid rgba(201,169,110,0.22)',
          borderLeft: '3px solid #c9a96e',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.4), 0 0 30px rgba(201,169,110,0.07), inset 0 1px 0 rgba(255,255,255,0.04)'
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-5 h-5 border-t border-r" style={{ borderColor: 'rgba(201,169,110,0.3)', borderTopRightRadius: 14 }} />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l" style={{ borderColor: 'rgba(201,169,110,0.2)' }} />

        {/* Scan line overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent 40%, rgba(201,169,110,0.025) 50%, transparent 60%)',
            animation: 'scan 3s linear infinite'
          }}
        />

        <div ref={textRef} className="relative z-10 px-6 py-6">
          {/* Index */}
          <span
            className="text-[10px] tracking-[0.35em] uppercase font-mono mb-2 block"
            style={{ color: '#c9a96e' }}
          >
            {String(activeIndex + 1).padStart(2, '0')} / {String(CATEGORIES.length).padStart(2, '0')}
          </span>

          {/* Title */}
          <h3
            className="font-['Noto_Serif_JP'] font-bold text-xl uppercase tracking-[0.22em] mb-3 leading-tight"
            style={{ color: '#f5ede0' }}
          >
            {activeObj.label}
          </h3>

          {/* Divider */}
          <div className="w-9 h-px mb-4" style={{ background: 'linear-gradient(to right, #c9a96e, transparent)' }} />

          {/* Description */}
          <p
            className="font-['Noto_Serif_JP'] text-[0.80rem] leading-[1.9] tracking-[0.07em]"
            style={{ color: 'rgba(240,232,221,0.82)' }}
          >
            {activeObj.desc}
          </p>
        </div>
      </div>

      {/* ── Swipe indicator ── */}
      <p
        className="flex items-center gap-3 mb-6"
        style={{
          fontSize: '0.6rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'rgba(201,169,110,0.55)',
          fontFamily: 'monospace'
        }}
      >
        <span style={{ display: 'inline-block', width: 28, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,169,110,0.5))' }} />
        swipe to explore
        <span style={{ display: 'inline-block', width: 28, height: 1, background: 'linear-gradient(to left, transparent, rgba(201,169,110,0.5))' }} />
      </p>
    </div>
  )
}

const TreeSection = () => {
  const [hoveredNode, setHoveredNode] = useState(null)
  const [isTreeInView, setIsTreeInView] = useState(false)
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0)
  const [swipeRotation, setSwipeRotation] = useState(0)
  const sectionRef = useRef(null)
  const contentRef = useRef(null)
  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'mobile'

  const handleSwipe = useCallback((nextIndex) => {
    setSwipeRotation(ROTATION_ANGLES[nextIndex] || 0)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=1500',
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

  const isSmallMobile = window.innerWidth <= 430

  // ── Give the tree more vertical room so the card floats naturally ──
  // Mobile: 58% canvas keeps the tree centred in the upper portion
  const canvasHeight = isMobile
    ? (isSmallMobile ? '60%' : '58%')
    : '100%'

  return (
    <section ref={sectionRef} className="relative w-full h-screen bg-transparent z-30 overflow-hidden">
      <div ref={contentRef} className="absolute inset-0 w-full h-full">

        {/* ── 3-D Canvas ── */}
        <div
          className="absolute left-0 right-0 top-0 z-1"
          style={{ height: canvasHeight }}
        >
          <Canvas
            camera={{
              position: isMobile ? [0, 2, 8] : breakpoint === 'tablet' ? [0.5, 2.5, 9] : [1, 3, 10],
              fov: isMobile ? 55 : breakpoint === 'tablet' ? 50 : 45
            }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, isMobile ? 1 : 1.5]}
            style={{ background: 'transparent' }}
          >
            <React.Suspense fallback={
              <Html center>
                <div className="text-white/50 text-xs tracking-[0.3em] uppercase animate-pulse">
                  Initializing Neural Branches...
                </div>
              </Html>
            }>
              <SceneContent
                hoveredNode={hoveredNode}
                setHoveredNode={setHoveredNode}
                isTreeInView={isTreeInView}
                breakpoint={breakpoint}
                swipeRotation={swipeRotation}
              />
            </React.Suspense>
          </Canvas>
        </div>

        {/* ── Desktop heading ── */}
        <div className="hidden md:block absolute top-12 left-10 md:left-16 lg:left-24 z-10 pointer-events-auto">
          <div style={{ filter: 'none' }}>
            <GlitchText text="CORE DISCIPLINES" className="text-3xl md:text-4xl lg:text-5xl leading-none" />
          </div>
          <div className="w-16 h-1 mt-6 pointer-events-none" style={{ background: 'linear-gradient(to right, #c9a96e, transparent)' }} />
          <p className="mt-6 text-xs md:text-sm font-inter tracking-[0.2em] uppercase max-w-xs pointer-events-none" style={{ color: 'rgba(240,232,221,0.5)' }}>
            Explore the interconnected<br />roots of my expertise.
          </p>
        </div>

        {/* ── Mobile heading ── */}
        <div className="md:hidden absolute top-8 left-0 right-0 z-10 flex flex-col items-center pointer-events-none">
          <GlitchText text="CORE DISCIPLINES" className="text-2xl leading-none text-center" />
          <div className="w-12 h-0.5 mt-3" style={{ background: 'linear-gradient(to right, transparent, #c9a96e, transparent)' }} />
        </div>

        {/* ── Desktop description panel ── */}
        {!isMobile && <DescriptionPanel hoveredNode={hoveredNode} />}

        {/* ── Mobile bottom panel (redesigned) ── */}
        {isMobile && (
          <MobileBottomPanel
            hoveredNode={hoveredNode}
            setHoveredNode={setHoveredNode}
            activeIndex={mobileActiveIndex}
            setActiveIndex={setMobileActiveIndex}
            onSwipe={handleSwipe}
          />
        )}

        {/* ── Desktop hint ── */}
        <div className="hidden md:flex absolute bottom-12 right-10 md:right-16 lg:right-24 z-10 pointer-events-none items-center gap-4 opacity-40">
          <div className="w-12 h-px" style={{ background: 'rgba(201,169,110,0.55)' }} />
          <span className="text-[10px] uppercase tracking-widest font-mono" style={{ color: 'rgba(240,232,221,0.5)' }}>Hover branches to scan</span>
        </div>
      </div>
    </section>
  )
}

useGLTF.preload(SAKURA_URL)

export default TreeSection