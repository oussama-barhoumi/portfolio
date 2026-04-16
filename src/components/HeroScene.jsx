import React, { useRef, useMemo, Suspense, useEffect, useState, Component } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Stars, Sparkles, Environment, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import logoUrl from '../constant/logopro.png'
import { ACCENT, BRIGHT, MID, BG, STEEL, BRICK, WHITE } from '../constant/theme'

gsap.registerPlugin(ScrollTrigger)

const MODEL_PATH = '/constant/oussama_doll/scene.gltf'

const DARK = '#001833'
const VERY_DARK = '#000d1a'
const WARM = '#d0eeff'

const SCROLL_LENGTH = 1500

const mouse = { x: 0, y: 0, hovered: false }

const EMISSIVE_HOVER = new THREE.Color(0, 0.2, 0.5)
const EMISSIVE_IDLE = new THREE.Color(0, 0, 0)

const smoothstep = (t) => {
  t = Math.max(0, Math.min(1, t))
  return t * t * (3 - 2 * t)
}

const lerp = THREE.MathUtils.lerp

class SceneErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(err) {}
  render() { return this.state.error ? null : this.props.children }
}

const PulsingLight = () => {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.color.set(mouse.hovered ? BRIGHT : ACCENT)
    ref.current.intensity = 6 + Math.sin(clock.getElapsedTime() * 2.7) * 2
  })
  return <pointLight ref={ref} position={[0.4, -0.5, 4]} color={ACCENT} intensity={6} distance={9} />
}

const buildDollScene = (scene) => {
  const clone = scene.clone(true)

  const box = new THREE.Box3().setFromObject(clone)
  const center = new THREE.Vector3()
  const size = new THREE.Vector3()
  box.getCenter(center)
  box.getSize(size)
  clone.position.sub(center)

  const normalScale = 2.0 / (Math.max(size.x, size.y, size.z) || 1)
  const materials = []

  clone.traverse((node) => {
    if (!node.isMesh) return
    node.frustumCulled = false
    node.castShadow = true

    const src = node.material
    const isBasic = src.isMeshBasicMaterial || src.type === 'MeshBasicMaterial'

    const m = isBasic
      ? new THREE.MeshStandardMaterial({
        map: src.map ?? null,
        color: src.color ?? new THREE.Color(1, 1, 1),
        metalness: 0.55,
        roughness: 0.35,
      })
      : src.clone()

    m.transparent = true
    m.opacity = 1
    m.emissive = new THREE.Color(0)
    m.emissiveIntensity = 0
    m.needsUpdate = true
    node.material = m
    materials.push(m)
  })

  return { clone, normalScale, materials }
}

const Doll = ({ progress, onBurst }) => {
  const { scene } = useGLTF(MODEL_PATH)
  const groupRef = useRef()
  const pivotRef = useRef()

  const isHovered = useRef(false)
  const hoverScale = useRef(1.0)

  const vel = useRef({ x: 0, y: 0 })
  const prevPos = useRef({ x: 0, y: 0 })
  const targetPos = useRef({ x: 0, y: 0 })
  const smoothPos = useRef({ x: 0, y: 0 })


  const { clone, normalScale, materials } = useMemo(() => buildDollScene(scene), [scene])

  useFrame(({ clock }) => {
    if (!groupRef.current || !pivotRef.current) return
    const r = progress.current
    const time = clock.getElapsedTime()

    let lerpSpeed = 0.028
    if (isHovered.current) lerpSpeed = 0.07
    if (!mouse.hovered) lerpSpeed = 0.018

    if (mouse.hovered) {
      targetPos.current.x = mouse.x * 2.0
      targetPos.current.y = mouse.y * 1.3
    } else {
      targetPos.current.x = 0
      targetPos.current.y = 0
    }

    smoothPos.current.x += (targetPos.current.x - smoothPos.current.x) * lerpSpeed
    smoothPos.current.y += (targetPos.current.y - smoothPos.current.y) * lerpSpeed

    vel.current.x = smoothPos.current.x - prevPos.current.x
    vel.current.y = smoothPos.current.y - prevPos.current.y
    prevPos.current = { x: smoothPos.current.x, y: smoothPos.current.y }

    pivotRef.current.rotation.y = lerp(pivotRef.current.rotation.y, vel.current.x * 18, 0.1)
    pivotRef.current.rotation.x = lerp(pivotRef.current.rotation.x, -vel.current.y * 18, 0.1)

    const idleBobX = Math.cos(time * 0.37) * 0.06
    const idleBobY = Math.sin(time * 0.55) * 0.12

    const targetEmissive = isHovered.current ? EMISSIVE_HOVER : EMISSIVE_IDLE
    materials.forEach(m => m.emissive.lerp(targetEmissive, 0.06))
    hoverScale.current = lerp(hoverScale.current, isHovered.current ? 1.1 : 1.0, 0.08)

    if (r <= 0.30) {
      groupRef.current.position.set(
        smoothPos.current.x + idleBobX,
        smoothPos.current.y + idleBobY,
        2
      )
      groupRef.current.scale.setScalar(normalScale * 1.8 * hoverScale.current)

      materials.forEach(m => { m.opacity = 1 })

    } else if (r <= 0.82) {
      groupRef.current.position.set(
        lerp(smoothPos.current.x + idleBobX, 0, smoothstep((r - 0.30) / 0.22)),
        lerp(smoothPos.current.y + idleBobY, 0, smoothstep((r - 0.30) / 0.22)),
        2
      )
      groupRef.current.scale.setScalar(normalScale * 1.8 * hoverScale.current)

      pivotRef.current.rotation.set(
        lerp(pivotRef.current.rotation.x, 0, 0.05),
        lerp(pivotRef.current.rotation.y, 0, 0.05),
        lerp(pivotRef.current.rotation.z, 0, 0.05)
      )

      const fade = Math.max(0, Math.min(1, (r - 0.52) / 0.26))
      const opacity = 1 - (fade * fade * fade)
      materials.forEach(m => { m.opacity = opacity })

    } else {
      groupRef.current.position.set(0, 0, 2)
      materials.forEach(m => { m.opacity = 0 })
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 2]}>
      <group ref={pivotRef}>
        <primitive
          object={clone}
          onClick={(e) => {
            e.stopPropagation()
            if (onBurst) onBurst(e.nativeEvent.clientX, e.nativeEvent.clientY)
          }}
          onPointerEnter={(e) => { e.stopPropagation(); isHovered.current = true; document.body.style.cursor = 'pointer'; }}
          onPointerLeave={(e) => { e.stopPropagation(); isHovered.current = false; document.body.style.cursor = 'auto'; }}
        />
      </group>
    </group>
  )
}

const FloatingLogo = ({ progress, basePosition, phaseOffset = 0, onBurst }) => {
  const texture = useTexture(logoUrl)
  const meshRef = useRef()
  const isHovered = useRef(false)
  const hoverScale = useRef(1.0)

  const BASE_IDLE = useMemo(() => new THREE.Color(0, 0.15, 0.4), [])
  const BASE_HOVER = useMemo(() => new THREE.Color(0, 0.4, 0.8), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const r = progress.current
    const time = clock.getElapsedTime() + phaseOffset

    const floatY = Math.sin(time * 0.4) * 0.15
    const floatX = Math.cos(time * 0.3) * 0.08
    const rotY = Math.sin(time * 0.3) * 0.25

    hoverScale.current = lerp(hoverScale.current, isHovered.current ? 1.08 : 1.0, 0.08)
    const currentScale = 5.5 * hoverScale.current
    meshRef.current.scale.set(currentScale, currentScale, 1)

    const mat = meshRef.current.material
    const targetEmissive = isHovered.current ? BASE_HOVER : BASE_IDLE
    mat.emissive.lerp(targetEmissive, 0.06)
    mat.emissiveIntensity = lerp(mat.emissiveIntensity, isHovered.current ? 0.6 : 0.3, 0.06)

    const [baseX, baseY, baseZ] = basePosition

    if (r <= 0.30) {
      meshRef.current.position.set(baseX + floatX, baseY + floatY, baseZ)
      meshRef.current.rotation.set(0, rotY, 0)
      mat.opacity = 1
    } else if (r <= 0.82) {
      meshRef.current.position.set(
        lerp(baseX + floatX, 0, smoothstep((r - 0.30) / 0.22)),
        lerp(baseY + floatY, 0, smoothstep((r - 0.30) / 0.22)),
        baseZ
      )
      meshRef.current.rotation.set(0, lerp(rotY, 0, 0.05), 0)

      const fade = Math.max(0, Math.min(1, (r - 0.52) / 0.26))
      mat.opacity = 1 - (fade * fade * fade)
    } else {
      mat.opacity = 0
    }
  })

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation()
        if (onBurst) onBurst(e.nativeEvent.clientX, e.nativeEvent.clientY)
      }}
      onPointerEnter={(e) => { e.stopPropagation(); isHovered.current = true; document.body.style.cursor = 'pointer'; }}
      onPointerLeave={(e) => { e.stopPropagation(); isHovered.current = false; document.body.style.cursor = 'auto'; }}
      position={basePosition}
    >
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        map={texture}
        transparent
        emissive={BASE_IDLE}
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}

const SpaceParticles = () => {
  const count = 30
  const meshRef = useRef()

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const spds = []
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2
      spds.push({
        x: (Math.random() - 0.5) * 0.003,
        y: (Math.random() - 0.5) * 0.003,
      })
    }
    return { positions: pos, speeds: spds }
  }, [])

  useFrame(() => {
    if (!meshRef.current) return
    const posArr = meshRef.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      posArr[i * 3] += speeds[i].x
      posArr[i * 3 + 1] += speeds[i].y
      if (posArr[i * 3] > 10) posArr[i * 3] = -10
      if (posArr[i * 3] < -10) posArr[i * 3] = 10
      if (posArr[i * 3 + 1] > 6) posArr[i * 3 + 1] = -6
      if (posArr[i * 3 + 1] < -6) posArr[i * 3 + 1] = 6
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color={ACCENT} size={0.04} transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

const HELLO_MSG = "Hello! 👋"
const SCROLL_MSG = "Scroll to discover more ↓"

const DollSpeechBubble = ({ progress, dollScreenPos }) => {
  const [displayText, setDisplayText] = useState('')
  const [phase, setPhase] = useState('typing')
  const [visible, setVisible] = useState(false)
  const bubbleRef = useRef()
  const idleTimer = useRef(null)
  const typeTimer = useRef(null)

  const typeText = (text, onDone) => {
    clearTimeout(typeTimer.current)
    let i = 0
    setDisplayText('')
    const step = () => {
      i++
      setDisplayText(text.slice(0, i))
      if (i < text.length) typeTimer.current = setTimeout(step, 55)
      else if (onDone) onDone()
    }
    typeTimer.current = setTimeout(step, 55)
  }

  useEffect(() => {
    const show = setTimeout(() => {
      setVisible(true)
      setPhase('typing')
      typeText(HELLO_MSG, () => setPhase('hello'))
    }, 900)
    return () => {
      clearTimeout(show)
      clearTimeout(typeTimer.current)
      clearTimeout(idleTimer.current)
    }
  }, [])

  useEffect(() => {
    const onMove = () => {
      clearTimeout(idleTimer.current)
      if (phase === 'scroll') {
        setPhase('typing')
        typeText(HELLO_MSG, () => setPhase('hello'))
      }
      idleTimer.current = setTimeout(() => {
        setPhase('typing')
        typeText(SCROLL_MSG, () => setPhase('scroll'))
      }, 3000)
    }
    idleTimer.current = setTimeout(() => {
      setPhase('typing')
      typeText(SCROLL_MSG, () => setPhase('scroll'))
    }, 3000)
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      clearTimeout(idleTimer.current)
    }
  }, [phase])

  useEffect(() => {
    let raf
    const tick = () => {
      if (bubbleRef.current) {
        const r = progress.current
        const op = r < 0.22 ? 1 : Math.max(0, 1 - (r - 0.22) / 0.08)
        bubbleRef.current.style.opacity = op
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progress])

  useEffect(() => {
    let raf
    const tick = () => {
      if (bubbleRef.current && dollScreenPos.current) {
        const { x, y } = dollScreenPos.current
        bubbleRef.current.style.left = `${x + 38}px`
        bubbleRef.current.style.top = `${y - 80}px`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [dollScreenPos])

  const isScroll = phase === 'scroll'
  const accentColor = isScroll ? BRIGHT : ACCENT

  return (
    <div
      ref={bubbleRef}
      style={{
        position: 'absolute',
        zIndex: 12,
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease',
        background: 'rgba(0,12,28,0.72)',
        border: `1.5px solid ${accentColor}`,
        borderRadius: '18px 18px 18px 4px',
        padding: '10px 18px',
        minWidth: 140,
        maxWidth: 220,
        backdropFilter: 'none',
        boxShadow: `0 0 18px ${accentColor}55, 0 0 40px ${accentColor}22, inset 0 0 12px rgba(0,170,255,0.06)`,
        transform: 'perspective(400px) rotateX(4deg) rotateY(-3deg)',
        transformOrigin: 'bottom left',
      }}
    >
      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 13,
        lineHeight: 1.55,
        color: '#e8f6ff',
        letterSpacing: '0.01em',
        margin: 0,
        textShadow: `0 0 8px ${accentColor}`,
        whiteSpace: 'pre-wrap',
      }}>
        {displayText}
        <span style={{
          display: 'inline-block',
          width: 2,
          height: '1em',
          background: accentColor,
          marginLeft: 2,
          verticalAlign: 'text-bottom',
          animation: 'bubbleCaret 0.8s step-end infinite',
          boxShadow: `0 0 6px ${accentColor}`,
        }} />
      </p>
      <div style={{
        height: 1,
        marginTop: 7,
        background: `linear-gradient(90deg, ${accentColor}, transparent)`,
        opacity: 0.5,
      }} />
      <div style={{
        position: 'absolute',
        bottom: -9,
        left: 14,
        width: 0,
        height: 0,
        borderLeft: '9px solid transparent',
        borderRight: '0px solid transparent',
        borderTop: `9px solid ${accentColor}`,
        filter: `drop-shadow(0 0 4px ${accentColor})`,
      }} />
    </div>
  )
}

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

  return (
    <div ref={ref} style={{ position: 'absolute', bottom: 56, left: 48, zIndex: 10, maxWidth: 540 }}>
      {/* We had pointerEvents: 'none' on the container, but we need the buttons to be clickable. */}
      <div style={{ pointerEvents: 'none' }}>
        <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', marginBottom: 14 }}>
          Oussama.design
        </p>
        <h1 style={{ fontFamily: "'Black Ops One',cursive", fontSize: 'clamp(28px,4vw,54px)', lineHeight: 1.07, textTransform: 'uppercase', letterSpacing: '0.02em', color: '#e8edf2' }}>
          Oussama Barhoumi is a<br />
          <span style={{ color: '#00aaff' }}>creative</span><br />
          designer focusing<br />
          on web experiences,<br />
          and stuff that looks{' '}
          <span style={{ color: '#00aaff' }}>good.</span>
        </h1>
      </div>

      <div style={{ pointerEvents: 'auto', display: 'flex', gap: 16, marginTop: 32 }}>
        <button
          onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.05, duration: 0.3, ease: 'power2.out', background: '#e60039' })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: 'power2.out', background: '#ff3366' })}
          style={{
            background: '#ff3366', color: '#0a0a0a', border: 'none', padding: '14px 28px',
            fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 4, fontWeight: 'bold'
          }}
          data-cursor
        >
          Contact Me
        </button>

        <button
          onClick={() => document.getElementById('works')?.scrollIntoView({ behavior: 'smooth' })}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.05, duration: 0.3, ease: 'power2.out', background: 'rgba(0,170,255,0.2)' })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: 'power2.out', background: 'rgba(0,170,255,0.05)' })}
          style={{
            background: 'rgba(0,170,255,0.05)', color: '#00aaff', border: '1px solid rgba(0,170,255,0.3)', padding: '14px 28px',
            fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 4
          }}
          data-cursor
        >
          See My Work
        </button>
      </div>
    </div>
  )
}



const useRAFOpacity = (ref, compute, deps = []) => {
  useEffect(() => {
    let raf
    const tick = () => {
      if (ref.current) ref.current.style.opacity = compute()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
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
      background: 'radial-gradient(ellipse 55% 45% at 50% 45%, rgba(0,170,255,0.60) 0%, rgba(29,77,115,0.28) 55%, transparent 82%)',
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

const SceneContent = ({ progress, onBurst }) => {
  useFrame(({ camera }) => { camera.position.set(0, 0, 9); camera.lookAt(0, 0, 0) })

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 12, 45]} />

      <ambientLight intensity={0.45} />
      <spotLight position={[0, 6, 10]} angle={0.5} penumbra={0.9} intensity={8} color={WARM} castShadow />
      <pointLight position={[-5, 2, 5]} intensity={4} color={MID} />
      <pointLight position={[5, 2, 5]} intensity={4} color={ACCENT} />
      <pointLight position={[0, -5, 3]} intensity={1.5} color={VERY_DARK} />
      <PulsingLight />

      <Environment preset="night" environmentIntensity={0.4} />
      <Stars radius={120} depth={80} count={1500} factor={4} saturation={0} fade speed={0.4} />
      <Sparkles count={60} scale={18} size={1.2} speed={0.1} opacity={0.18} color={BRIGHT} />
      <SpaceParticles />

      <Suspense fallback={null}>
        <Doll progress={progress} onBurst={onBurst} />
        <FloatingLogo progress={progress} basePosition={[-4.5, 1.0, 0.5]} phaseOffset={4.2} onBurst={onBurst} />
        <FloatingLogo progress={progress} basePosition={[4.5, 1.0, 0.5]} phaseOffset={0} onBurst={onBurst} />
      </Suspense>

      <EffectComposer multisampling={0} disableNormalPass>
        <Bloom intensity={1.8} luminanceThreshold={0.10} luminanceSmoothing={0.88} blendFunction={BlendFunction.SCREEN} />
        <Vignette eskil={false} offset={0.08} darkness={1.4} />
        <ChromaticAberration offset={[0.0018, 0.0018]} />
        <Noise opacity={0.016} />
      </EffectComposer>
    </>
  )
}

const HeroScene = () => {
  const progressRef = useRef(0)
  const sectionRef = useRef()
  const dollScreenPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

  const [bursts, setBursts] = useState([])

  const spawnBurst = (x, y) => {
    const id = Date.now() + Math.random()
    setBursts(prev => [...prev, { id, x, y }])
    setTimeout(() => {
      setBursts(prev => prev.filter(b => b.id !== id))
    }, 1200)
  }

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes logoDrop {
        0%   { transform: scale(1.2) translateY(0px);   opacity: 1; }
        5%   { transform: scale(1.4) translateY(-8px);  opacity: 1; }
        15%  { transform: scale(1.0) translateY(0px);   opacity: 1; }
        100% { transform: scale(0.4) translateY(180px); opacity: 0; }
      }
    `
    document.head.appendChild(style)
    return () => {
      if (document.head.contains(style)) document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
    const onMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2
      mouse.hovered = true
    }
    const onLeave = () => { mouse.hovered = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: `+=${SCROLL_LENGTH}`,
      pin: true,
      anticipatePin: 1,
      scrub: 1.2,
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
        onMouseMove={(e) => {
          dollScreenPos.current = { x: e.clientX, y: e.clientY }
        }}
      >
        <div style={{ position: 'absolute', inset: 0 }}>
          <SceneErrorBoundary>
            <Canvas
              shadows
              camera={{ position: [0, 0, 9], fov: 45 }}
              gl={{ antialias: false, alpha: false }}
              dpr={[1, 1]}
            >
              <SceneContent progress={progressRef} onBurst={spawnBurst} />
            </Canvas>
          </SceneErrorBoundary>
        </div>

        <FlashOverlay progress={progressRef} />
        <SceneExitOverlay progress={progressRef} />
        <HeroTextOverlay progress={progressRef} />
        <DollSpeechBubble progress={progressRef} dollScreenPos={dollScreenPos} />

        {bursts.map(b => (
          <img
            key={b.id}
            src={logoUrl}
            alt=""
            loading="lazy"
            style={{
              position: 'fixed',
              left: b.x - 16,
              top: b.y - 16,
              width: 32,
              height: 32,
              objectFit: 'contain',
              pointerEvents: 'none',
              zIndex: 99,
              filter: 'drop-shadow(0 0 8px #00aaff)',
              animation: 'logoDrop 1.2s ease-in forwards',
            }}
          />
        ))}

      </section>
    </>
  )
}

useGLTF.preload(MODEL_PATH)

export default React.memo(HeroScene)