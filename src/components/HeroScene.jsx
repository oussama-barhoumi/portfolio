/**
 * HeroScene — GSAP ScrollTrigger edition (Blue Neon edition)
 *
 * Scroll behaviour:
 *   • The hero section is PINNED for `SCROLL_LENGTH` pixels of scroll distance.
 *   • GSAP scrubs `progressRef` (0 → 1) across that pinned range.
 *   • All 3D phase logic reads from `progressRef` — nothing else changed.
 *   • Once the pin releases the next section slides in naturally.
 *
 * Install (if not already):
 *   npm i gsap
 */

import React, { useRef, useMemo, Suspense, useEffect, Component } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Stars, Sparkles, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ─── Config ───────────────────────────────────────────────────────────────────

const MODEL_PATH = '/constant/oussama_doll/scene.gltf'

const R = {
  accent:   '#00aaff',   // electric blue
  bright:   '#33bbff',   // lighter blue
  mid:      '#0077cc',   // mid blue
  dark:     '#001833',   // very dark blue
  veryDark: '#000d1a',   // near-black blue
  warm:     '#d0eeff',   // cool-white tint
}

const BG = '#05070a'

const CHAIN = { topY: 5.2, links: 14, spacing: 0.30 }

// Pixels of scroll the pin lasts — increase for a slower scrub
const SCROLL_LENGTH = 2500

// Shared mutable state — avoids re-renders for per-frame values
const mouse = { x: 0, y: 0, hovered: false }

// Pre-allocated colors to avoid per-frame allocations inside useFrame
const EMISSIVE_HOVER = new THREE.Color(0, 0.2, 0.5)
const EMISSIVE_IDLE  = new THREE.Color(0, 0, 0)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const smoothstep = (t) => {
  t = Math.max(0, Math.min(1, t))
  return t * t * (3 - 2 * t)
}

const lerp = THREE.MathUtils.lerp

// ─── Error Boundary ───────────────────────────────────────────────────────────

class SceneErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(err) { console.error('[HeroScene]', err) }
  render() { return this.state.error ? null : this.props.children }
}

// ─── Chain ────────────────────────────────────────────────────────────────────

const Chain = ({ swingRef }) => {
  const groupRef = useRef()

  const mat = useMemo(() =>
    new THREE.MeshStandardMaterial({ color: 0xb8c8d8, metalness: 1.0, roughness: 0.08 }), [])

  const geo = useMemo(() =>
    new THREE.TorusGeometry(0.065, 0.020, 6, 12), [])

  useFrame(() => {
    if (!groupRef.current || !swingRef.current) return
    groupRef.current.rotation.z = swingRef.current.rotation.z * 0.6
    groupRef.current.rotation.y = swingRef.current.rotation.y * 0.4
  })

  return (
    <group ref={groupRef} position={[0, CHAIN.topY, 0]}>
      {Array.from({ length: CHAIN.links }, (_, i) => (
        <mesh
          key={i}
          geometry={geo}
          material={mat}
          position={[0, -i * CHAIN.spacing, 0]}
          rotation={[0, (i % 2) * (Math.PI / 2), 0]}
        />
      ))}
    </group>
  )
}

// ─── Pulsing Light ────────────────────────────────────────────────────────────

const PulsingLight = () => {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.color.set(mouse.hovered ? R.bright : R.accent)
    ref.current.intensity = 6 + Math.sin(clock.getElapsedTime() * 2.7) * 2
  })
  return <pointLight ref={ref} position={[0.4, -0.5, 4]} color={R.accent} intensity={6} distance={9} />
}

// ─── Doll ─────────────────────────────────────────────────────────────────────

const buildDollScene = (scene) => {
  const clone = scene.clone(true)

  const box    = new THREE.Box3().setFromObject(clone)
  const center = new THREE.Vector3()
  const size   = new THREE.Vector3()
  box.getCenter(center)
  box.getSize(size)
  clone.position.sub(center)

  const normalScale = 2.0 / (Math.max(size.x, size.y, size.z) || 1)
  const materials   = []

  clone.traverse((node) => {
    if (!node.isMesh) return
    node.frustumCulled = false
    node.castShadow    = true

    const src     = node.material
    const isBasic = src.isMeshBasicMaterial || src.type === 'MeshBasicMaterial'

    const m = isBasic
      ? new THREE.MeshStandardMaterial({
          map:       src.map   ?? null,
          color:     src.color ?? new THREE.Color(1, 1, 1),
          metalness: 0.55,
          roughness: 0.35,
        })
      : src.clone()

    m.transparent       = true
    m.opacity           = 1
    m.emissive          = new THREE.Color(0)
    m.emissiveIntensity = 0
    m.needsUpdate       = true
    node.material       = m
    materials.push(m)
  })

  return { clone, normalScale, materials }
}

const Doll = ({ progress, swingRef }) => {
  const { scene }   = useGLTF(MODEL_PATH)
  const groupRef    = useRef()
  const pivotRef    = useRef()
  const smoothMouse = useRef({ x: 0, y: 0 })

  const { clone, normalScale, materials } = useMemo(() => buildDollScene(scene), [scene])

  useEffect(() => { if (pivotRef.current) swingRef.current = pivotRef.current })

  useFrame(({ clock }) => {
    if (!groupRef.current || !pivotRef.current) return
    const r    = progress.current
    const time = clock.getElapsedTime()

    smoothMouse.current.x += (mouse.x - smoothMouse.current.x) * 0.1
    smoothMouse.current.y += (mouse.y - smoothMouse.current.y) * 0.1
    const { x: mx, y: my } = smoothMouse.current

    const targetEmissive = mouse.hovered ? EMISSIVE_HOVER : EMISSIVE_IDLE
    materials.forEach(m => m.emissive.lerp(targetEmissive, 0.08))

    if (r <= 0.30) {
      groupRef.current.position.set(0, 0.1, 2)
      groupRef.current.scale.setScalar(normalScale * 1.8)
      pivotRef.current.rotation.set(my * -0.45, mx * 0.9, Math.sin(time * 0.55) * 0.04)
      pivotRef.current.position.y = Math.sin(time * 0.7) * 0.06
      materials.forEach(m => { m.opacity = 1 })

    } else if (r <= 0.82) {
      groupRef.current.position.set(0, 0.1, 2)
      groupRef.current.scale.setScalar(normalScale * 1.8)

      const pivot = pivotRef.current
      pivot.rotation.set(
        lerp(pivot.rotation.x, 0, 0.06),
        lerp(pivot.rotation.y, 0, 0.06),
        lerp(pivot.rotation.z, 0, 0.06),
      )
      pivot.position.y = lerp(pivot.position.y, 0, 0.06)

      const fade = Math.max(0, Math.min(1, (r - 0.52) / 0.26))
      const opacity = 1 - (fade * fade * fade)
      materials.forEach(m => { m.opacity = opacity })

    } else {
      groupRef.current.position.set(0, 0.1, 2)
      materials.forEach(m => { m.opacity = 0 })
    }
  })

  return (
    <group ref={groupRef} position={[0, 0.1, 2]}>
      <group ref={pivotRef}>
        <primitive object={clone} />
      </group>
    </group>
  )
}

// ─── Lightning Overlay ────────────────────────────────────────────────────────

const LIGHTNING_PATHS = [
  'M60 300 L180 240 L130 340 L300 255 L195 375 L375 295 L245 425 L435 335 L310 475',
  'M1380 275 L1258 218 L1312 318 L1138 235 L1252 362 L1068 278 L1198 402 L1008 318 L1128 462',
]

const LightningOverlay = ({ progress }) => {
  const ref = useRef()

  useEffect(() => {
    let raf
    const tick = () => {
      if (ref.current)
        ref.current.style.opacity = progress.current < 0.30
          ? (0.30 + Math.random() * 0.40).toFixed(2)
          : '0'
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progress])

  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none', transition: 'opacity 120ms' }}>
      <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {LIGHTNING_PATHS.map((d, i) => (
          <g key={i} filter="url(#glow)">
            <path d={d} stroke={R.accent} strokeWidth="1.8" fill="none" opacity="0.80" />
            <path d={d} stroke="white"    strokeWidth="0.5" fill="none" opacity="0.35" />
          </g>
        ))}
      </svg>
    </div>
  )
}

// ─── Hero Text ────────────────────────────────────────────────────────────────

const HeroTextOverlay = ({ progress }) => {
  const ref = useRef()

  useEffect(() => {
    let raf
    const tick = () => {
      const r = progress.current
      if (ref.current)
        ref.current.style.opacity = r < 0.22 ? 1 : Math.max(0, 1 - (r - 0.22) / 0.10)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progress])

  const glow = `0 0 22px ${R.accent}, 0 0 55px rgba(0,170,255,0.3)`

  return (
    <div ref={ref} style={{ position: 'absolute', bottom: 56, left: 48, zIndex: 10, maxWidth: 540, pointerEvents: 'none' }}>
      <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', marginBottom: 14 }}>
        Oussama.design
      </p>
      <h1 style={{ fontFamily: "'Black Ops One',cursive", fontSize: 'clamp(28px,4vw,54px)', lineHeight: 1.07, textTransform: 'uppercase', letterSpacing: '0.02em', color: '#e8edf2' }}>
        Oussama is a<br />
        <span style={{ color: R.accent, textShadow: glow }}>creative</span><br />
        designer focusing<br />
        on web experiences,<br />
        and stuff that looks{' '}
        <span style={{ color: R.accent, textShadow: glow }}>good.</span>
      </h1>
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

const Nav = () => (
  <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 44px' }}>
    <div style={{ width: 36, height: 36, border: '1.5px solid rgba(255,255,255,0.22)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: "'Black Ops One',cursive" }}>O</div>
    <button style={{ border: `1.5px solid rgba(0,170,255,0.40)`, padding: '9px 24px', fontSize: 11, letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase', fontFamily: "'Space Mono',monospace", color: '#e8edf2', background: 'transparent' }}>Contact</button>
  </nav>
)

// ─── Overlay Helpers ──────────────────────────────────────────────────────────

const useRAFOpacity = (ref, compute, deps = []) => {
  useEffect(() => {
    let raf
    const tick = () => {
      if (ref.current) ref.current.style.opacity = compute()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

const FlashOverlay = ({ progress }) => {
  const ref = useRef()
  useRAFOpacity(ref, () => {
    const r = progress.current
    if (r < 0.55 || r > 0.70) return 0
    const t = (r - 0.55) / 0.15
    return (t < 0.5 ? t * 2 : (1 - t) * 2) * 0.28
  }, [progress])

  return (
    <div ref={ref} style={{
      position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'none', zIndex: 15, mixBlendMode: 'screen',
      background: 'radial-gradient(ellipse 55% 45% at 50% 45%, rgba(0,170,255,0.60) 0%, rgba(0,100,200,0.28) 55%, transparent 82%)',
    }} />
  )
}

const SceneExitOverlay = ({ progress }) => {
  const ref = useRef()
  useRAFOpacity(ref, () => smoothstep((progress.current - 0.72) / 0.22), [progress])
  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0, background: BG, opacity: 0, pointerEvents: 'none', zIndex: 18 }} />
  )
}

// ─── Hover Detector ───────────────────────────────────────────────────────────

const HoverDetector = ({ canvasRef }) => {
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const onMove = (e) => {
      const { left, top, width, height } = el.getBoundingClientRect()
      const cx = (e.clientX - left) / width
      const cy = (e.clientY - top)  / height
      mouse.hovered = Math.abs(cx - 0.5) < 0.22 && Math.abs(cy - 0.45) < 0.30
    }
    const onLeave = () => { mouse.hovered = false }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

// ─── 3D Scene ─────────────────────────────────────────────────────────────────

const SceneContent = ({ progress, swingRef }) => {
  useFrame(({ camera }) => { camera.position.set(0, 0, 9); camera.lookAt(0, 0, 0) })

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog   attach="fog"        args={[BG, 10, 38]} />

      <ambientLight intensity={0.55} />
      <spotLight position={[0, 4, 10]} angle={0.45} penumbra={0.9} intensity={9} color={R.warm} castShadow />
      <pointLight position={[-4, 1, 5]} intensity={4} color={R.mid}      />
      <pointLight position={[ 4, 1, 5]} intensity={4} color={R.accent}   />
      <pointLight position={[ 0,-4, 3]} intensity={2} color={R.veryDark} />
      <PulsingLight />

      <Environment preset="warehouse" environmentIntensity={0.35} />
      <Stars   radius={90} depth={60} count={2000} factor={3} saturation={0} fade speed={0} />
      <Sparkles count={80} scale={14} size={1.0}   speed={0} opacity={0.14} color={R.bright} />

      <Chain swingRef={swingRef} />
      <Suspense fallback={null}>
        <Doll progress={progress} swingRef={swingRef} />
      </Suspense>

      <EffectComposer multisampling={0} disableNormalPass>
        <Bloom intensity={1.6} luminanceThreshold={0.12} luminanceSmoothing={0.85} blendFunction={BlendFunction.SCREEN} />
        <Vignette eskil={false} offset={0.08} darkness={1.4} />
        <ChromaticAberration offset={[0.0018, 0.0018]} />
        <Noise opacity={0.016} />
      </EffectComposer>
    </>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const HeroScene = () => {
  const progressRef   = useRef(0)
  const swingRef      = useRef(null)
  const canvasWrapRef = useRef()
  const sectionRef    = useRef()

  useEffect(() => {
    const onMove = (e) => {
      mouse.x =  (e.clientX / window.innerWidth  - 0.5) * 2
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger:       sectionRef.current,
      start:         'top top',
      end:           `+=${SCROLL_LENGTH}`,
      pin:           true,
      anticipatePin: 1,
      scrub:         1.2,
      onUpdate: (self) => {
        progressRef.current = self.progress
      },
    })

    return () => st.kill()
  }, [])

  return (
    <>
      <section
        ref={sectionRef}
        style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}
      >
        <div ref={canvasWrapRef} style={{ position: 'absolute', inset: 0 }}>
          <SceneErrorBoundary>
            <Canvas
              shadows
              camera={{ position: [0, 0, 9], fov: 45 }}
              gl={{ antialias: true, alpha: false }}
              dpr={[1, 1.5]}
            >
              <SceneContent progress={progressRef} swingRef={swingRef} />
            </Canvas>
          </SceneErrorBoundary>
          <HoverDetector canvasRef={canvasWrapRef} />
        </div>

        <LightningOverlay progress={progressRef} />
        <FlashOverlay     progress={progressRef} />
        <SceneExitOverlay progress={progressRef} />
        <HeroTextOverlay  progress={progressRef} />
        <Nav />
      </section>
    </>
  )
}

useGLTF.preload(MODEL_PATH)

export default HeroScene