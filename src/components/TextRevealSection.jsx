import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ACCENT, BRIGHT, MID, BG } from '../constant/theme'

gsap.registerPlugin(ScrollTrigger)

const LINES = [
  {
    label: null,
    text: 'Oussama',
    isName: true,
    size: 'clamp(3.8rem, 10vw, 9.5rem)',
    spacing: '-0.03em',
  },
  {
    label: '01',
    text: 'Full Stack Developer',
    isName: false,
    size: 'clamp(1.6rem, 4.5vw, 4.2rem)',
    spacing: '-0.02em',
  },
  {
    label: '02',
    text: 'UI / UX Designer',
    isName: false,
    size: 'clamp(1.6rem, 4.5vw, 4.2rem)',
    spacing: '-0.02em',
  },
  {
    label: '03',
    text: '3D Modeler',
    isName: false,
    size: 'clamp(1.6rem, 4.5vw, 4.2rem)',
    spacing: '-0.02em',
  },
  {
    label: '04',
    text: 'AI Engineer',
    isName: false,
    size: 'clamp(1.6rem, 4.5vw, 4.2rem)',
    spacing: '-0.02em',
  },
]

const DUR = 1.0
const HOLD = 0.6

const TextRevealSection = () => {
  const sectionRef = useRef()
  const linesRef = useRef([])
  const glowsRef = useRef([])
  const barFillRef = useRef()
  const lineCount = LINES.length

  useEffect(() => {
    const wrappers = linesRef.current.filter(Boolean)
    const glows = glowsRef.current.filter(Boolean)
    if (!wrappers.length) return

    gsap.set(wrappers, {
      opacity: 0,
      y: 48,
      scale: 0.96,
      filter: 'blur(7px)',
    })
    gsap.set(glows, { opacity: 0 })

    const totalDur = lineCount * DUR + HOLD

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: `+=${lineCount * 110}%`,
        pin: true,
        scrub: 0.85,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress

          if (barFillRef.current) {
            barFillRef.current.style.transform = `scaleY(${p})`
          }

          const lineIdx = p * totalDur / DUR
          glows.forEach((glow, i) => {
            const active = Math.floor(lineIdx) === i && p < 0.97
            glow.style.opacity = active ? String(Math.min(1, (lineIdx - i) * 3)) : '0'
          })
        },
      },
    })

    wrappers.forEach((wrapper, i) => {
      tl.to(
        wrapper,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: DUR,
          ease: 'power3.out',
        },
        i * DUR,
      )
    })

    tl.to({}, { duration: HOLD })

    const section = sectionRef.current
    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === section) st.kill()
      })
      tl.kill()
    }
  }, [lineCount])

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen z-20 flex items-center justify-center overflow-hidden"
      style={{ background: '#05070a' }} // SALMON
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
          zIndex: 1,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.022,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '120px',
        }}
      />

      <div
        className="absolute left-7 top-1/2 -translate-y-1/2 w-px hidden md:block"
        style={{ height: '45vh', background: 'rgba(0,170,255,0.12)' }} 
      >
        <div
          ref={barFillRef}
          className="w-full h-full origin-top"
          style={{
            background: '#ff3366', 
            transform: 'scaleY(0)',
            boxShadow: `0 0 8px rgba(255,51,102,0.4)`, 
          }}
        />
      </div>

      <div
        className="absolute top-8 left-8 md:left-16 flex items-center gap-3"
        style={{ opacity: 0.65 }}
      >
        <div className="w-5 h-px" style={{ background: '#00aaff' }} /> {/* STEEL */}
        <span
          className="text-[9px] uppercase tracking-[0.35em]"
          style={{ fontFamily: "'Matemasie', sans-serif", color: '#00aaff' }}
        >
          Identity
        </span>
      </div>

      <div
        className="absolute top-8 right-8 md:right-12"
        style={{ opacity: 0.65 }}
      >
        <span
          className="text-[9px] uppercase tracking-[0.3em]"
          style={{ fontFamily: "'Matemasie', sans-serif", color: '#00aaff' }}
        >
          Portfolio 2025
        </span>
      </div>

      <div className="relative flex flex-col items-center gap-1 md:gap-2 px-6 w-full max-w-5xl" style={{ zIndex: 2 }}>

        <div
          className="w-10 h-px mb-5"
          style={{ background: `linear-gradient(90deg, transparent, #00aaff, transparent)` }} 
        />

        {LINES.map((line, i) => (
          <div
            key={i}
            ref={(el) => { linesRef.current[i] = el }}
            className="relative flex items-center justify-center w-full select-none"
            style={{ willChange: 'transform, opacity, filter' }}
          >
            {line.label && (
              <span
                className="absolute left-0 hidden md:block text-xs tracking-widest"
                style={{
                  fontFamily: "'Matemasie', sans-serif",
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(0,170,255,0.6)', 
                }}
              >
                {line.label}
              </span>
            )}

            <span
              className="block text-center font-black uppercase"
              style={{
                fontFamily: "'Matemasie', sans-serif",
                fontSize: line.size,
                letterSpacing: line.spacing,
                lineHeight: 1,
                color: line.isName ? 'transparent' : '#e8edf2', 
                textShadow: line.isName ? 'none' : `0 0 30px rgba(0,170,255,0.15)`, // Light STEEL shadow
                ...(line.isName && {
                  background: `linear-gradient(135deg, #e8edf2 0%, #00aaff 100%)`, 
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }),
              }}
            >
              {line.text}
            </span>

            <div
              ref={(el) => { glowsRef.current[i] = el }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 70% 120% at 50% 50%, rgba(0,170,255,0.15) 0%, transparent 70%)`, // Light STEEL glow
                opacity: 0,
                filter: 'blur(8px)',
              }}
            />
          </div>
        ))}

        <div
          className="w-10 h-px mt-4"
          style={{ background: `linear-gradient(90deg, transparent, #00aaff, transparent)` }} 
        />

      </div>

      <div
        className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        style={{ opacity: 0.6 }}
      >
        <span
          className="text-[8px] uppercase tracking-[0.35em]"
          style={{ fontFamily: "'Matemasie', sans-serif", color: '#00aaff' }} 
        >
          Scroll
        </span>
        <div
          className="w-px h-8"
          style={{ background: `linear-gradient(to bottom, #00aaff, transparent)` }} 
        />
      </div>
    </section>
  )
}

export default React.memo(TextRevealSection)
