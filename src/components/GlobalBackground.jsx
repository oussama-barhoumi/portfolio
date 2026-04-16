import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useRef } from 'react'

function BgScene() {
  const light1 = useRef()
  const light2 = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (light1.current) light1.current.intensity = 2.2 + Math.sin(t * 0.8) * 0.6
    if (light2.current) light2.current.intensity = 1.2 + Math.sin(t * 1.1 + 1.2) * 0.4
  })

  return (
    <>
      <color attach="background" args={['#05070a']} />
      <fog   attach="fog"        args={['#05070a', 15, 60]} />

      <ambientLight intensity={0.10} />
      {/* Main blue neon key light */}
      <spotLight ref={light1} position={[-10, 8, 12]}  angle={0.5} penumbra={1} intensity={2.2} color="#00aaff" />
      {/* Deep fill — darker blue from behind */}
      <spotLight ref={light2} position={[ 10, -6, -8]} angle={0.5} penumbra={1} intensity={1.2} color="#001833" />
      {/* Subtle accent from below */}
      <pointLight position={[0, -8, 4]} intensity={0.8} color="#0055aa" />

      <Stars radius={130} depth={70} count={1500} factor={4} saturation={0} fade speed={0.5} />

      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom
          luminanceThreshold={0.10}
          luminanceSmoothing={0.88}
          intensity={1.6}
          blendFunction={BlendFunction.SCREEN}
        />
        <Noise opacity={0.024} />
        <Vignette eskil={false} offset={0.08} darkness={1.20} />
      </EffectComposer>
    </>
  )
}

const GlobalBackground = () => (
  <>
    <Canvas
      frameloop="always"
      camera={{ position: [0, 0, 10], fov: 60 }}
      gl={{ antialias: false, alpha: false }}
      dpr={[1, 1]}
      style={{
        position:      'fixed',
        top:           0,
        left:          0,
        width:         '100vw',
        height:        '100vh',
        zIndex:        0, // Pushed behind white sections
        pointerEvents: 'none',
      }}
    >
      <BgScene />
    </Canvas>

    {/* Global TokyoHero Grid overlay */}
    <div aria-hidden style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none',
      zIndex: 0, // Sits between Canvas and foreground
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
    }} />
  </>
)

export default GlobalBackground
