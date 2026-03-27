import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const HeroOverlay = ({ progress }) => {
  const containerRef = useRef()
  const titleRef = useRef()
  const subtitleRef = useRef()

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      }
    })

    // Peak text reveal during the crossing phase (0.3 - 0.7)
    tl.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.2, 
    }, 0.35) 
    .to(titleRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.2,
    }, 0.65) 
    
    tl.to(subtitleRef.current, {
      opacity: 1,
      duration: 0.2,
    }, 0.4)
    .to(subtitleRef.current, {
      opacity: 0,
      duration: 0.2,
    }, 0.7)

    return () => {
      if (tl.scrollTrigger) tl.scrollTrigger.kill()
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
      <div className="text-center px-4">
        <h1
          ref={titleRef}
          className="text-white text-6xl md:text-8xl font-syne font-extrabold tracking-tighter uppercase leading-none"
          style={{ opacity: 0, transform: 'translateY(-20px)' }}
        >
          Oussama <br /> Barhoumi
        </h1>
        <p
          ref={subtitleRef}
          className="text-slate-400 mt-6 text-sm md:text-base font-inter tracking-[0.3em] uppercase opacity-0"
        >
          The Future of Combat Engineering
        </p>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span className="text-[10px] uppercase tracking-widest text-slate-500">Scroll to Explore</span>
        <div className="w-[1px] h-12 bg-gradient-to-t from-purple-500 to-transparent" />
      </div>
    </div>
  )
}

export default HeroOverlay
