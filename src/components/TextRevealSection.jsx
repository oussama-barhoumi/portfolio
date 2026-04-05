import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ─── Theme ────────────────────────────────────────────────────────────────────
const ACCENT = '#00aaff'
const BRIGHT = '#33bbff'
const MID = '#0077cc'

// ─── Config ───────────────────────────────────────────────────────────────────
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

// Each line occupies this many scrub-timeline units
const DUR = 1.0
// Hold at end before unpin
const HOLD = 0.6

// ─── Component ────────────────────────────────────────────────────────────────
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

    // ── Initial state ──────────────────────────────────────────────────────
    gsap.set(wrappers, {
      opacity: 0,
      y: 48,
      scale: 0.96,
      filter: 'blur(7px)',
    })
    gsap.set(glows, { opacity: 0 })

    const totalDur = lineCount * DUR + HOLD

    // ── Pinned scrub timeline ──────────────────────────────────────────────
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

          // Side progress bar
          if (barFillRef.current) {
            barFillRef.current.style.transform = `scaleY(${p})`
          }

          // Active-line glow: highlight the line that is currently revealing
          const lineIdx = p * totalDur / DUR
          glows.forEach((glow, i) => {
            const active = Math.floor(lineIdx) === i && p < 0.97
            glow.style.opacity = active ? String(Math.min(1, (lineIdx - i) * 3)) : '0'
          })
        },
      },
    })

    // ── Sequential line reveals ────────────────────────────────────────────
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

    // Hold all lines visible
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
      style={{ background: '#05070a' }}
    >
      {/* ── Horizontal scan line ───────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,170,255,0.012) 2px, rgba(0,170,255,0.012) 4px)',
          zIndex: 1,
        }}
      />
      {/* ── Film grain ────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.022,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '120px',
        }}
      />

      {/* ── Left progress bar — blue neon ─────────────────────────────────── */}
      <div
        className="absolute left-7 top-1/2 -translate-y-1/2 w-px hidden md:block"
        style={{ height: '45vh', background: 'rgba(0,170,255,0.12)' }}
      >
        <div
          ref={barFillRef}
          className="w-full h-full origin-top"
          style={{
            background: `linear-gradient(to bottom, ${BRIGHT}, ${MID})`,
            transform: 'scaleY(0)',
            boxShadow: `0 0 8px ${ACCENT}88`,
          }}
        />
      </div>

      {/* ── Top label ─────────────────────────────────────────────────────── */}
      <div
        className="absolute top-8 left-8 md:left-16 flex items-center gap-3"
        style={{ opacity: 0.35 }}
      >
        <div className="w-5 h-px" style={{ background: ACCENT }} />
        <span
          className="text-[9px] uppercase tracking-[0.35em]"
          style={{ fontFamily: "'Space Mono', monospace", color: BRIGHT }}
        >
          Identity
        </span>
      </div>

      {/* ── Right corner label ────────────────────────────────────────────── */}
      <div
        className="absolute top-8 right-8 md:right-12"
        style={{ opacity: 0.22 }}
      >
        <span
          className="text-[9px] uppercase tracking-[0.3em] text-white"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          Portfolio 2025
        </span>
      </div>

      {/* ── Lines ─────────────────────────────────────────────────────────── */}
      <div className="relative flex flex-col items-center gap-1 md:gap-2 px-6 w-full max-w-5xl" style={{ zIndex: 2 }}>

        {/* Thin neon rule above name */}
        <div
          className="w-10 h-px mb-5"
          style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }}
        />

        {LINES.map((line, i) => (
          <div
            key={i}
            ref={(el) => { linesRef.current[i] = el }}
            className="relative flex items-center justify-center w-full select-none"
            style={{ willChange: 'transform, opacity, filter' }}
          >
            {/* Number label (left, desktop only) */}
            {line.label && (
              <span
                className="absolute left-0 hidden md:block text-xs tracking-widest"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: `${ACCENT}66`,
                }}
              >
                {line.label}
              </span>
            )}

            {/* Main text */}
            <span
              className="block text-center font-black uppercase"
              style={{
                fontFamily: "'Black Ops One', cursive",
                fontSize: line.size,
                letterSpacing: line.spacing,
                lineHeight: 1,
                color: line.isName ? 'transparent' : 'rgba(255,255,255,0.92)',
                textShadow: line.isName ? 'none' : `0 0 30px ${ACCENT}33`,
                ...(line.isName && {
                  background: `linear-gradient(135deg, #ffffff 0%, ${BRIGHT} 40%, #ffffff 100%)`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: `drop-shadow(0 0 18px ${ACCENT}66)`,
                }),
              }}
            >
              {line.text}
            </span>

            {/* Per-line blue glow (active during reveal) */}
            <div
              ref={(el) => { glowsRef.current[i] = el }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 70% 120% at 50% 50%, ${ACCENT}28 0%, transparent 70%)`,
                opacity: 0,
                filter: 'blur(8px)',
              }}
            />
          </div>
        ))}

        {/* Thin rule below */}
        <div
          className="w-10 h-px mt-4"
          style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }}
        />

      </div>

      {/* ── Scroll hint ───────────────────────────────────────────────────── */}
      <div
        className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        style={{ opacity: 0.3 }}
      >
        <span
          className="text-[8px] uppercase tracking-[0.35em]"
          style={{ fontFamily: "'Space Mono', monospace", color: BRIGHT }}
        >
          Scroll
        </span>
        <div
          className="w-px h-8"
          style={{ background: `linear-gradient(to bottom, ${ACCENT}, transparent)` }}
        />
      </div>
    </section>
  )
}

export default TextRevealSection
