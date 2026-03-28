import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'

const HeroOverlay = ({ progress }) => {
  const titleRef = useRef()
  const subtitleRef = useRef()

  useEffect(() => {
    let rafId

    const tick = () => {
      const p = progress.current
      const show = THREE.MathUtils.clamp((p - 0.75) * 10, 0, 1)
      const hide = THREE.MathUtils.clamp((p - 0.9) * 20, 0, 1) // 0.9 -> 0.95 hides it
      const finalOpacity = show * (1 - hide)

      if (titleRef.current && subtitleRef.current) {
        titleRef.current.style.opacity = finalOpacity
        titleRef.current.style.transform = `translateY(${(1 - show) * 40 - hide * 40}px)`
        titleRef.current.style.filter = `blur(${(1 - show) * 10 + hide * 10}px)`

        subtitleRef.current.style.opacity = finalOpacity
        subtitleRef.current.style.transform = `translateY(${(1 - show) * 20 - hide * 20}px)`
        subtitleRef.current.style.filter = `blur(${(1 - show) * 6 + hide * 6}px)`
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [progress])

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
      <div className="flex flex-col items-center pt-20 px-4">
        <h1
          ref={titleRef}
          className="flex flex-col text-center font-syne font-black uppercase tracking-tighter"
          style={{
            opacity: 0,
            transform: 'translateY(40px)',
            filter: 'blur(10px)',
            fontSize: 'clamp(4rem, 12vw, 10rem)',
            lineHeight: '0.8'
          }}
        >
          <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Oussama</span>
          <span
            className="text-transparent mt-2"
            style={{ WebkitTextStroke: '2px rgba(255, 255, 255, 0.9)' }}
          >
            Barhoumi
          </span>
        </h1>

        <div
          ref={subtitleRef}
          className="flex items-center gap-4 mt-12"
          style={{
            opacity: 0,
            transform: 'translateY(20px)',
            filter: 'blur(6px)',
          }}
        >
          <div className="w-12 h-[1px] bg-purple-500 opacity-50" />

          <div className="w-12 h-[1px] bg-blue-500 opacity-50" />
        </div>
      </div>


      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span className="text-[10px] uppercase tracking-widest text-slate-500">Scroll to Explore</span>
        <div className="w-px h-12 bg-linear-to-t from-purple-500 to-transparent" />
      </div>
    </div>
  )
}

export default HeroOverlay
