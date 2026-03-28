import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { Stars, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

const HeroSection = ({ progress }) => {
    const containerRef = useRef()
    const textRef = useRef()

    useEffect(() => {
        const tick = () => {
            if (!progress || progress.current === undefined) return
            const p = progress.current


            const show = THREE.MathUtils.clamp((p - 0.9) * 16.6, 0, 1)

            if (containerRef.current) {
                containerRef.current.style.opacity = show
                containerRef.current.style.transform = `translateY(${(1 - show) * 40}px)`
                containerRef.current.style.pointerEvents = show > 0.9 ? 'auto' : 'none'
            }
        }

        gsap.ticker.add(tick)
        return () => gsap.ticker.remove(tick)
    }, [progress])


    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-20 flex flex-col justify-between p-10 font-sans opacity-0 bg-[#050508]"
        >

            <div className="absolute inset-0 z-0 pointer-events-none">
                <Canvas gl={{ antialias: true, alpha: true, stencil: true }} dpr={[1, 2]}>
                    <color attach="background" args={['#050508']} />
                    <fog attach="fog" args={['#050508', 10, 50]} />

                    <ambientLight intensity={0.5} />
                    <spotLight position={[20, 20, 10]} angle={0.15} penumbra={1} intensity={2} color="#8b5cf6" castShadow />
                    <pointLight position={[-10, -10, -10]} intensity={1.5} color="#3b82f6" />

                    <spotLight position={[15, 5, 5]} angle={0.3} intensity={5} color="#ffffff" penumbra={1} />
                    <spotLight position={[-15, 5, 5]} angle={0.3} intensity={5} color="#ffffff" penumbra={1} />

                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <Sparkles count={200} scale={20} size={2} speed={0.4} opacity={0.5} color="#8b5cf6" />

                    <EffectComposer multisampling={0} disableNormalPass>
                        <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} blendFunction={BlendFunction.SCREEN} />
                        <Vignette eskil={false} offset={0.1} darkness={1.1} />
                        <ChromaticAberration offset={[0.002, 0.002]} />
                        <Noise opacity={0.05} />
                    </EffectComposer>
                </Canvas>
            </div>

            <div ref={textRef} className="mt-20 flex-grow flex items-center justify-center relative z-10 pointer-events-none">
                <h1 className="text-[12vw] leading-[0.8] font-black italic uppercase text-white text-center">
                    FULL STACK<br />
                    <span
                        className="text-transparent block"
                        style={{ WebkitTextStroke: '1px white' }}
                    >
                        DEVELOPER
                    </span>
                </h1>
            </div>
        </div>
    )
}

export default HeroSection