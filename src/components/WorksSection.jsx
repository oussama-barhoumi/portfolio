import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import logoUrl from '../constant/logopro.png'

gsap.registerPlugin(ScrollTrigger)

const ACCENT = '#00aaff'

const PROJECTS = [
  { id:1, title:'Project One',   category:'UI/UX',       year:'2024', image:'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop', color:'#00aaff', tags:['React','Figma'] },
  { id:2, title:'Project Two',   category:'Full Stack',  year:'2024', image:'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop', color:'#aa00ff', tags:['Node','MongoDB'] },
  { id:3, title:'Project Three', category:'3D / WebGL',  year:'2023', image:'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop', color:'#00ffaa', tags:['Three.js','GSAP'] },
  { id:4, title:'Project Four',  category:'AI / ML',     year:'2024', image:'https://images.unsplash.com/photo-1633415730303-34e813a37d6e?q=80&w=600&auto=format&fit=crop', color:'#ff6600', tags:['Python','TensorFlow'] },
  { id:5, title:'Project Five',  category:'Motion',      year:'2023', image:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop', color:'#ffcc00', tags:['GSAP','CSS'] },
]

const WorksSection = () => {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const visualBackRef = useRef(null)
  const visualLidRef = useRef(null)
  const lidRef = useRef(null)
  
  const cardRefs = useRef([])
  const infoRefs = useRef([])
  const glowRefs = useRef([])
  const imgRefs = useRef([])

  useEffect(() => {
    if (!sectionRef.current) return
    
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=4000',
          pin: true,
          scrub: 1.4,
          anticipatePin: 1,
        }
      })

      // Phase 1: open the folder lid
      tl.to(lidRef.current, {
        rotateX: -110,
        duration: 1,
        ease: 'power2.inOut',
      }, 0)

      // Phase 1: cards rise up slightly from folder
      cardRefs.current.forEach((card, i) => {
        tl.to(card, {
          y: -60,
          duration: 0.6,
          ease: 'power2.out',
        }, 0.2 + i * 0.05)
      })

      // Phase 2: folder shrinks + fades to corner
      tl.to([visualBackRef.current, visualLidRef.current], {
        scale: 0.3,
        x: -window.innerWidth * 0.35,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.inOut',
      }, 1.0)

      // Phase 2: cards fly to final horizontal positions
      const spacing = window.innerWidth * 0.42
      const startX = -(PROJECTS.length - 1) * spacing / 2

      cardRefs.current.forEach((card, i) => {
        tl.to(card, {
          x: startX + i * spacing,
          y: 0,
          rotate: 0,
          width: '38vw',
          height: '72vh',
          bottom: '14vh', // vertically center relative to screen
          marginLeft: '-19vw', // offset mapping for width: 38vw matching left: 50%
          left: '50%',
          scale: 1,
          duration: 1.4,
          ease: 'expo.inOut',
        }, 1.2 + i * 0.08)

        // Phase 2: Fade in the overlay text elements
        tl.to(infoRefs.current[i], {
          opacity: 1,
          duration: 0.4,
        }, 2.2)
      })

      // Phase 3: horizontal track scroll pan
      tl.to(trackRef.current, {
        x: -(PROJECTS.length - 1) * spacing,
        duration: 2,
        ease: 'none',
      }, 2.5)

    }, sectionRef)
    
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} style={{
      position: 'relative', width: '100%', height: '100vh',
      background: '#05070a', overflow: 'hidden', zIndex: 40
    }}>
      
      {/* Horizontal scroll track wrapper holding all items */}
      <div ref={trackRef} style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'
      }}>
        
        {/* Core Origin Group at Center */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', 
          transform: 'translate(-50%, -50%)',
          width: 320, height: 240, perspective: 800
        }}>
          
          {/* Visual Folder Back */}
          <div ref={visualBackRef} style={{ position: 'absolute', inset: 0 }}>
            {/* Folder tab */}
            <div style={{
              position: 'absolute', top: 0, left: 0,
              width: '38%', height: 28,
              background: '#1a1f2e',
              border: '1.5px solid rgba(0,170,255,0.25)',
              borderBottom: 'none',
              borderRadius: '8px 8px 0 0',
            }} />
            {/* Folder back */}
            <div style={{
              position: 'absolute', bottom: 0,
              width: '100%', height: '88%',
              background: 'linear-gradient(145deg, #1a1f2e, #0d1018)',
              border: '1.5px solid rgba(0,170,255,0.25)',
              borderRadius: '4px 16px 16px 16px',
              boxShadow: '0 0 40px rgba(0,170,255,0.08)',
            }} />
          </div>

          {/* Stacked Project Thumbnails */}
          {PROJECTS.map((p, i) => (
            <div
              key={p.id}
              ref={el => cardRefs.current[i] = el}
              onMouseEnter={() => {
                gsap.to(imgRefs.current[i], { scale: 1.06, opacity: 1, duration: 0.5, ease: 'power2.out' })
                gsap.to(glowRefs.current[i], { opacity: 1, duration: 0.4 })
              }}
              onMouseLeave={() => {
                gsap.to(imgRefs.current[i], { scale: 1.0, opacity: 0.75, duration: 0.5 })
                gsap.to(glowRefs.current[i], { opacity: 0, duration: 0.4 })
              }}
              style={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                marginLeft: -90, // Center 180px width over 50%
                width: 180, height: 120,
                transform: `rotate(${(i - 2) * 6}deg) translateY(${i * -4}px)`,
                borderRadius: 16,
                overflow: 'hidden',
                background: '#080c12',
                border: `1px solid ${p.color}44`,
                boxShadow: `0 0 16px ${p.color}22`,
                transformStyle: 'preserve-3d',
                cursor: 'pointer'
              }}
            >
              {/* Full bleed image */}
              <img ref={el => imgRefs.current[i] = el} src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75, willChange: 'transform' }} />

              {/* Hover Glow Ref */}
              <div ref={el => glowRefs.current[i] = el} style={{
                position: 'absolute', inset: 0, opacity: 0,
                boxShadow: `inset 0 0 60px ${p.color}33`,
                border: `1px solid ${p.color}44`,
                borderRadius: 16, pointerEvents: 'none',
                zIndex: 2
              }} />

              {/* Info Overlay inside card (initially hidden during stack) */}
              <div ref={el => infoRefs.current[i] = el} style={{
                position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'none', zIndex: 3
              }}>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '32px 28px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)',
                }}>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '0.3em',
                    color: p.color, textTransform: 'uppercase', marginBottom: 8 }}>
                    {p.category} — {p.year}
                  </p>
                  <h3 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 'clamp(18px,2vw,28px)',
                    color: '#e8edf2', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
                    {p.title}
                  </h3>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    {p.tags.map(tag => (
                      <span key={tag} style={{
                        fontFamily: "'Space Mono', monospace", fontSize: 9, padding: '4px 10px',
                        border: `1px solid ${p.color}55`, borderRadius: 99,
                        color: p.color, letterSpacing: '0.15em',
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Neon corner accent */}
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  width: 28, height: 28,
                  borderTop: `1.5px solid ${p.color}`,
                  borderRight: `1.5px solid ${p.color}`,
                }} />
              </div>

            </div>
          ))}

          {/* Visual Folder Lid (Rotates down to open) */}
          <div ref={visualLidRef} style={{ position: 'absolute', inset: 0 }}>
            <div ref={lidRef} style={{
              position: 'absolute', bottom: '87%',
              width: '100%', height: '88%',
              background: 'linear-gradient(145deg, #1e2535, #111520)',
              border: '1.5px solid rgba(0,170,255,0.30)',
              borderRadius: '4px 16px 16px 16px',
              transformOrigin: 'bottom center',
              transform: 'rotateX(-15deg)',
              boxShadow: 'inset 0 0 30px rgba(0,170,255,0.04)',
              zIndex: 60,
              transformStyle: 'preserve-3d'
            }}>
              {/* Neon logo on folder lid */}
              <img src={logoUrl} alt="Folder Logo" style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                width: 64, opacity: 0.4,
                filter: 'drop-shadow(0 0 12px #00aaff)',
              }} />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default WorksSection
