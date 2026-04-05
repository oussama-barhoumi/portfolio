import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

// ─── Blue neon glitch palette ─────────────────────────────────────────────────
// Primary glitch channels: electric blue + cyan (instead of red/blue RGB split)
const SCRAMBLE_CHARS = '@#$%*01XY<>{}[]+='

const GlitchText = ({ text = 'SYSTEM OVERRIDE', className = '' }) => {
  const containerRef = useRef(null)
  const textRef      = useRef(null)

  const [displayText, setDisplayText] = useState(text)
  const timelineRef         = useRef(null)
  const scrambleIntervalRef = useRef(null)

  const triggerGlitch = () => {
    if (timelineRef.current?.isActive()) return

    let iteration = 0
    clearInterval(scrambleIntervalRef.current)

    scrambleIntervalRef.current = setInterval(() => {
      setDisplayText((prev) =>
        prev.split('').map((char, index) => {
          if (index < iteration)        return text[index]
          if (text[index] === ' ')      return ' '
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        }).join('')
      )
      iteration += 1 / 2
      if (iteration >= text.length) {
        clearInterval(scrambleIntervalRef.current)
        setDisplayText(text)
      }
    }, 30)

    timelineRef.current = gsap.timeline({
      onComplete: () => {
        gsap.set(textRef.current, {
          x: 0, y: 0, skewX: 0,
          clipPath:   'inset(0% 0% 0% 0%)',
          textShadow: 'none',
          opacity:    0,
        })
      }
    })

    const duration     = 0.35
    const frames       = 12
    const timePerFrame = duration / frames

    timelineRef.current.set(textRef.current, { opacity: 1 })

    for (let i = 0; i < frames; i++) {
      const top1 = Math.random() * 80
      const bot1 = Math.random() * (100 - top1)

      // Blue neon glitch: cyan channel left, electric blue right
      const xCyan = (Math.random() - 0.5) * 14 - 3
      const xBlue = (Math.random() - 0.5) * 14 + 3

      timelineRef.current.to(textRef.current, {
        x:          (Math.random() - 0.5) * 15,
        y:          (Math.random() - 0.5) * 6,
        skewX:      (Math.random() - 0.5) * 20,
        clipPath:   `inset(${top1}% 0% ${bot1}% 0%)`,
        // Blue neon dual-channel split instead of red/blue
        textShadow: `${xCyan}px 0 0 #33bbff, ${xBlue}px 0 0 #0055ff`,
        duration:   timePerFrame,
        ease:       'steps(1)',
      }, i * timePerFrame)
    }
  }

  useEffect(() => {
    triggerGlitch()
    return () => {
      timelineRef.current?.kill()
      clearInterval(scrambleIntervalRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative inline-block font-black uppercase tracking-widest ${className}`}
      style={{
        color:      '#e8f6ff',
        background: 'transparent',
        // Subtle neon text glow on idle
        textShadow: '0 0 28px rgba(0,170,255,0.25)',
        cursor:     'none',
      }}
      onMouseEnter={triggerGlitch}
    >
      {/* Base text layer */}
      <span
        className="relative block z-0"
        style={{ opacity: 0.75 }}
      >
        {displayText}
      </span>

      {/* Glitch overlay layer — mix-blend-mode: screen for neon glow */}
      <span
        ref={textRef}
        className="absolute top-0 left-0 w-full h-full block mix-blend-screen pointer-events-none select-none z-10"
        aria-hidden="true"
      >
        {displayText}
      </span>
    </div>
  )
}

export default GlitchText
