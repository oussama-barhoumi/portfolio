import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

function BgScene() {
  return (
    <>
      <color attach="background" args={['#050508']} />
      <fog attach="fog" args={['#050508', 15, 55]} />

      <ambientLight intensity={0.15} />
      <spotLight position={[-10, 8, 12]} angle={0.5} penumbra={1} intensity={2.5} color="#ff2a2a" />
      <spotLight position={[10, -6, -8]} angle={0.5} penumbra={1} intensity={1.5} color="#330008" />

      <Stars radius={120} depth={60} count={3000} factor={4} saturation={0} fade speed={0.6} />

      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom
          luminanceThreshold={0.12}
          luminanceSmoothing={0.88}
          intensity={1.4}
          blendFunction={BlendFunction.SCREEN}
        />
        <Noise opacity={0.032} />
        <Vignette eskil={false} offset={0.08} darkness={1.15} />
      </EffectComposer>
    </>
  )
}

const GlobalBackground = () => (
  <Canvas
    frameloop="always"
    camera={{ position: [0, 0, 10], fov: 60 }}
    gl={{ antialias: false, alpha: false }}
    dpr={[1, 1]}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 0,
      pointerEvents: 'none',
    }}
  >
    <BgScene />
  </Canvas>
)

export default GlobalBackground
