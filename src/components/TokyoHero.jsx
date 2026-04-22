import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ACCENT } from '../constant/theme'

import logoUrl from '../constant/logopro.png'
import BlobGhostButton from './button'

gsap.registerPlugin(ScrollTrigger)

const TokyoHero = () => {
  const sectionRef = useRef(null)
  const redCircleRef = useRef(null)
  const darkCircleRef = useRef(null)
  const kanjiRef = useRef(null)
  const topLabelRef = useRef(null)
  const glitchOverlayRef = useRef(null)
  const scene1Ref = useRef(null)
  const scene2Ref = useRef(null)
  const marqueeRef = useRef(null)
  const infoPanelRef = useRef(null)


  const WORDS = [
    { text: 'FACES', top: '8%', left: '5%' },
    { text: 'OF', top: '15%', left: '18%' },
    { text: 'TIME', top: '8%', right: '6%' },
    { text: 'SHADOWS', top: '22%', right: '4%' },
    { text: 'TOMORROW', bottom: '25%', left: '3%' },
    { text: 'MASKS', bottom: '15%', left: '12%' },
    { text: 'UTOPIA', bottom: '18%', right: '5%' },
    { text: 'TOKYO', bottom: '8%', right: '14%' },
    { text: 'WHERE', top: '45%', left: '2%' },
    { text: 'PAST', top: '55%', right: '3%' },
    { text: 'COLLIDE', bottom: '35%', right: '8%' },
  ]

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=5000',
        pin: true,
        scrub: 1.0,
        anticipatePin: 1,
      }
    })

    tl.fromTo(redCircleRef.current,
      { scale: 0, opacity: 1 },
      { scale: 18, duration: 1, ease: 'power2.inOut' },
      0)

    tl.to(kanjiRef.current, {
      color: '#001a33', duration: 0.4
    }, 0.3)
    tl.to(topLabelRef.current, {
      color: '#00ffcc', duration: 0.3
    }, 0.3)

    tl.fromTo(darkCircleRef.current,
      { scale: 0 },
      { scale: 12, duration: 0.8, ease: 'power3.inOut' },
      0.6)

    tl.to(kanjiRef.current, {
      color: ACCENT, duration: 0.3
    }, 0.9)

    tl.to(kanjiRef.current, {
      scale: 3, opacity: 0, y: -100,
      duration: 0.6, ease: 'power3.in'
    }, 1.2)

    tl.to(glitchOverlayRef.current, {
      opacity: 1, duration: 0.15
    }, 1.7)
    tl.to(glitchOverlayRef.current, {
      opacity: 0, duration: 0.15
    }, 1.85)
    tl.to(scene1Ref.current, { opacity: 0, duration: 0.3 }, 1.8)
    tl.to(scene2Ref.current, { opacity: 1, duration: 0.4 }, 1.9)



    gsap.to(marqueeRef.current, {
      x: '-50%', duration: 18, ease: 'none', repeat: -1
    })

    return () => {
      tl.kill()
    }
  }, [])

  return (
    <div ref={sectionRef} style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      background: '#0a0a0a'
    }}>
      <div ref={scene1Ref} style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        zIndex: 1
      }}>
        {WORDS.map((w, i) => (
          <span key={i} style={{
            position: 'absolute',
            top: w.top, left: w.left, right: w.right, bottom: w.bottom,
            fontFamily: "'Matemasie', sans-serif",
            fontSize: 10,
            color: 'rgba(0,170,255,0.3)',
            letterSpacing: '0.1em'
          }}>
            {w.text}
          </span>
        ))}

        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <h1 ref={kanjiRef} style={{
            fontFamily: 'serif',
            fontSize: 'clamp(120px, 22vw, 280px)',
            color: '#e8edf2',
            lineHeight: 0.9,
            textAlign: 'center',
            letterSpacing: '-0.02em',
            textShadow: `0 0 40px rgba(255,255,255,0.1)`, // Flat shadow
            zIndex: 10,
            position: 'relative'
          }}>ウサマ</h1>
        </div>

        <p ref={topLabelRef} style={{
          position: 'absolute', top: 24, left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'Matemasie', sans-serif",
          fontSize: 11, letterSpacing: '0.5em',
          color: '#00aaff', textTransform: 'uppercase',
          zIndex: 10
        }}>FOGUME</p>

        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          overflow: 'hidden', borderTop: '1px solid rgba(0,170,255,0.3)',
          padding: '10px 0', background: '#05070a', // SALMON
          zIndex: 10
        }}>
          <div ref={marqueeRef} style={{ display: 'flex', gap: 40, alignItems: 'center', whiteSpace: 'nowrap', width: 'max-content' }}>
            {Array(8).fill(0).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                <span style={{ fontFamily: "'Space Mono'", fontSize: 10, letterSpacing: '0.3em', color: '#e8edf2' }}>TOKYO × UTOPIA × PAST</span>
                <img src={logoUrl} alt="logo" style={{ height: 16, opacity: 0.8, filter: 'grayscale(100%) brightness(2.5)' }} />
                <span style={{ fontFamily: "'Space Mono'", fontSize: 10, letterSpacing: '0.3em', color: '#e8edf2' }}>FACES × SHADOWS</span>
              </div>
            ))}
          </div>
        </div>

        <svg style={{ position: 'absolute', top: 20, left: 20, opacity: 0.3 }} width="40" height="40">
          <circle cx="20" cy="20" r="16" fill="none" stroke="#00aaff" strokeWidth="1" /> {/* STEEL */}
          <ellipse cx="20" cy="20" rx="8" ry="16" fill="none" stroke="#00aaff" strokeWidth="0.8" />
          <line x1="4" y1="20" x2="36" y2="20" stroke="#00aaff" strokeWidth="0.8" />
        </svg>

        <div ref={redCircleRef} style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: 60, height: 60,
          marginLeft: -30, marginTop: -30,
          borderRadius: '50%',
          background: '#ff3366',
          transform: 'scale(0)',
          zIndex: 5,
          boxShadow: `0 0 80px rgba(255,51,102,0.5)`,
        }} />

        <div ref={darkCircleRef} style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: 60, height: 60,
          marginLeft: -30, marginTop: -30,
          borderRadius: '50%',
          background: '#0a0a0a',
          transform: 'scale(0)',
          zIndex: 6,
        }} />
      </div>

      <div ref={glitchOverlayRef} style={{
        position: 'absolute', inset: 0, opacity: 0,
        zIndex: 20, pointerEvents: 'none',
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,170,255,0.08) 2px,
            rgba(0,170,255,0.08) 4px
          )
        `,
        filter: 'url(#chromatic)',
        mixBlendMode: 'screen',
      }} />

      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="chromatic">
            <feColorMatrix type="matrix" values="1 0 0 0 0.04  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="r" in="SourceGraphic" />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0.04  0 0 0 1 0"
              result="gb" in="SourceGraphic" />
            <feMerge><feMergeNode in="r" /><feMergeNode in="gb" /></feMerge>
          </filter>
        </defs>
      </svg>

      <div ref={scene2Ref} style={{
        position: 'absolute', inset: 0, opacity: 0,
        background: '#0a0a0a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 15,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 60% at 50% 40%, rgba(0,150,255,0.08) 0%, transparent 70%)',
        }} />

        <h2 style={{
          fontFamily: "'Black Ops One', cursive",
          fontSize: 'clamp(48px,12vw,140px)',
          color: '#e8edf2',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          textAlign: 'center',
          lineHeight: 0.95,
          textShadow: '0 0 40px rgba(255,255,255,0.05)',
          zIndex: 1
        }}>
          OUSSAMA<br />BARHOUMI
        </h2>

        <div style={{ marginTop: 48, zIndex: 1 }} data-cursor>
          <BlobGhostButton size="lg">
            CREATION
          </BlobGhostButton>
        </div>

        <div ref={infoPanelRef} style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '20px 40px',
          borderTop: '1px solid rgba(0,170,255,0.2)',
          background: 'rgba(0,170,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 1
        }}>
          <span style={{
            fontFamily: "'Space Mono'", fontSize: 9,
            color: 'rgba(255,255,255,0.6)', letterSpacing: '0.2em'
          }}>
            33.5731° N, 7.5898° W // CASABLANCA
          </span>
          <span style={{
            fontFamily: "'Space Mono'", fontSize: 9,
            color: 'rgba(0,170,255,0.8)', letterSpacing: '0.2em'
          }}> {/* STEEL */}
            SITE BY OUSSAMA // 2025
          </span>
          <span style={{
            fontFamily: "'Space Mono'", fontSize: 9,
            color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em'
          }}>
            ウサマ — FOGUME
          </span>
        </div>
      </div>



    </div>
  )
}

export default TokyoHero
