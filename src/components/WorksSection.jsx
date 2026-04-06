import React, { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import logoUrl from '../constant/logopro.png'
import GlitchText from './GlitchText'
import WorksPage from './WorksPage'
import ProjectDetails from './ProjectDetails'

gsap.registerPlugin(ScrollTrigger)

// ─── Theme ────────────────────────────────────────────────────────────────────
const ACCENT = '#00aaff'
const BRIGHT = '#33bbff'
const MID    = '#0077cc'
const BG     = '#05070a'

// ─── Projects ─────────────────────────────────────────────────────────────────
const PROJECTS = [
  { 
    id: 1, 
    title: 'Project One', 
    category: 'UI/UX Design', 
    year: '2024', 
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop', 
    color: '#00aaff', 
    tags: ['React','Figma'],
    resume: 'A comprehensive modern redesign of a fintech dashboard focusing on dark mode accessibility, micro-animations, and high-contrast data visualization. The project involved wireframing, prototyping, and final implementation using React and Tailwind.',
    techStack: ['React', 'Figma', 'Framer Motion', 'TailwindCSS'],
    timeSpent: '4 Weeks'
  },
  { 
    id: 2, 
    title: 'Project Two', 
    category: 'Full Stack', 
    year: '2024', 
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop', 
    color: '#aa00ff', 
    tags: ['Node','MongoDB'],
    resume: 'A scalable e-commerce backend built with Node.js and Express. It features secure JWT authentication, Stripe payment integration, real-time order tracking using WebSockets, and a fully optimized MongoDB aggregation pipeline for product search.',
    techStack: ['Node.js', 'Express', 'MongoDB', 'Socket.io', 'Stripe API'],
    timeSpent: '2 Months'
  },
  { 
    id: 3, 
    title: 'Project Three', 
    category: '3D / WebGL', 
    year: '2023', 
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop', 
    color: '#00ffaa', 
    tags: ['Three.js','GSAP'],
    resume: 'An immersive interactive web gallery utilizing Three.js and custom GLSL shaders. Users can navigate through a 3D environment to view artwork, accompanied by smooth camera animations powered by GSAP. Performance optimized to maintain 60FPS on mobile.',
    techStack: ['Three.js', 'GLSL', 'GSAP', 'React Three Fiber'],
    timeSpent: '6 Weeks'
  },
  { 
    id: 4, 
    title: 'Project Four', 
    category: 'AI Engineering', 
    year: '2024', 
    image: 'https://images.unsplash.com/photo-1633415730303-34e813a37d6e?q=80&w=600&auto=format&fit=crop', 
    color: '#ff6600', 
    tags: ['Python','TensorFlow'],
    resume: 'A computer vision pipeline designed for real-time edge detection and object classification. The model was trained using TensorFlow on a custom dataset, then exported via ONNX for rapid inference inside a lightweight Python Flask service.',
    techStack: ['Python', 'TensorFlow', 'OpenCV', 'Flask', 'ONNX'],
    timeSpent: '3 Months'
  },
  { 
    id: 5, 
    title: 'Project Five', 
    category: 'Motion Design', 
    year: '2023', 
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop', 
    color: '#ffcc00', 
    tags: ['GSAP','CSS'],
    resume: 'A highly kinetic landing page showcasing advanced CSS typography and sequential scroll-driven animations. Heavily relies on GSAP ScrollTrigger to orchestrate complex timeline sequences, pinning, and parallax effects to tell a compelling brand story.',
    techStack: ['HTML5', 'Vanilla CSS', 'GSAP', 'ScrollTrigger'],
    timeSpent: '3 Weeks'
  },
]

// ─── Component ────────────────────────────────────────────────────────────────
const WorksSection = () => {
  const [worksOpen, setWorksOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const sectionRef    = useRef(null)
  const trackRef      = useRef(null)
  const visualBackRef = useRef(null)
  const visualLidRef  = useRef(null)
  const lidRef        = useRef(null)

  const cardRefs = useRef([])
  const infoRefs = useRef([])
  const glowRefs = useRef([])
  const imgRefs  = useRef([])

  // Added refs for Japanese reveal and end-sequence
  const japanOverlayRef = useRef(null)
  const kanjiCharsRef   = useRef([])
  const kanjiSubRef     = useRef(null)
  const wipeRef         = useRef(null)
  const japanShown      = useRef(false)
  const progressRef     = useRef(0)
  const [showContact, setShowContact] = useState(false)

  // Refresh all pins after mount so they're in sync
  useEffect(() => {
    const timer = setTimeout(() => ScrollTrigger.refresh(), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=3000',
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            progressRef.current = self.progress
          }
        }
      })

      // ── Phase 1: open the folder lid ───────────────────────────────────
      tl.fromTo(lidRef.current,
        { rotateX: -15 },
        { rotateX: -110, duration: 1, ease: 'power2.inOut' },
        0
      )

      // Phase 1: cards peek/rise from the folder center
      cardRefs.current.forEach((card, i) => {
        tl.to(card, { y: -60, duration: 0.6, ease: 'power2.out' }, 0.2 + i * 0.05)
      })

      // ── Phase 2: folder shrinks to corner ──────────────────────────────
      tl.to([visualBackRef.current, visualLidRef.current], {
        scale:    0.3,
        x:        -window.innerWidth * 0.35,
        opacity:  0,
        duration: 1.2,
        ease:     'power3.inOut',
      }, 1.0)

      // Phase 2: cards fly to their final expanded, vertically-centred positions.
      // Cards are direct children of the track (= 100 vw × 100 vh), so
      // top: '50%' + marginTop: '-36vh' (half of 72vh) gives true viewport centre.
      const spacing = window.innerWidth * 0.42
      const startX  = -(PROJECTS.length - 1) * spacing / 2

      cardRefs.current.forEach((card, i) => {
        tl.to(card, {
          x:          startX + i * spacing,
          y:          0,
          rotate:     0,
          width:      '38vw',
          minWidth:   420,
          height:     '72vh',
          maxHeight:  680,
          top:        '50%',      // ← centre vertically inside track
          left:       '50%',
          marginLeft: '-19vw',    // ← offset by half card width
          marginTop:  '-36vh',    // ← offset by half card height (72vh / 2)
          scale:      1,
          duration:   1.4,
          ease:       'expo.inOut',
        }, 1.2 + i * 0.08)

        tl.to(infoRefs.current[i], { opacity: 1, duration: 0.4 }, 2.2)
      })

      // ── Phase 3: pan the track horizontally ────────────────────────────
      tl.to(trackRef.current, {
        x:        -(PROJECTS.length - 1) * spacing,
        duration: 2,
        ease:     'none',
      }, 2.5)

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // ── Japan End-of-Scroll Animation ────────────────────────────────
  useEffect(() => {
    let raf
    const tick = () => {
      // Reached 92%+ of the horizontal pan scroll timeline
      if (progressRef.current >= 0.92 && !japanShown.current) {
        japanShown.current = true
        showJapanese()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const showJapanese = () => {
    const tl = gsap.timeline()
    
    // Overlay fades in
    tl.to(japanOverlayRef.current, {
      opacity: 1, duration: 0.6, ease: 'power2.out', pointerEvents: 'auto'
    })
    
    // Each kanji character drops in one by one
    tl.fromTo(kanjiCharsRef.current.filter(Boolean),
      { y: -120, opacity: 0, rotateX: 90 },
      { y: 0, opacity: 1, rotateX: 0,
        duration: 0.7, stagger: 0.12, ease: 'expo.out' },
    '-=0.2')
    
    // Subtitle line fades in
    tl.fromTo(kanjiSubRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
    '-=0.2')
    
    // Hold for 1.8s then trigger circle wipe
    tl.to({}, { duration: 1.8 })
    tl.call(() => triggerCircleWipe())
  }

  const triggerCircleWipe = () => {
    const wipe = wipeRef.current
    if (!wipe) return
  
    // Circle starts at center, size 0, expands to cover full screen
    gsap.set(wipe, { opacity: 1, scale: 0 })
  
    gsap.to(wipe, {
      scale: 1,
      duration: 1.1,
      ease: 'power4.inOut',
      onComplete: () => {
        // Show contact form underneath
        setShowContact(true)
        // Fade wipe circle out
        gsap.to(wipe, {
          opacity: 0, duration: 0.5, delay: 0.1,
          onComplete: () => gsap.set(wipe, { scale: 0 })
        })
        // Hide japanese overlay
        gsap.to(japanOverlayRef.current, { opacity: 0, duration: 0.3 })
      }
    })
  }

  // Initial card style — starts mimicking position inside the folder.
  // Cards are children of the TRACK (100 vw × 100 vh), so top:'50%' / left:'50%'
  // lands them at the viewport centre — same as the folder origin group.
  const initialCardStyle = (p, i) => ({
    position:      'absolute',
    top:           '50%',
    left:          '50%',
    marginLeft:    -90,    // centre 180 px initial width
    marginTop:     -60,    // centre 120 px initial height (shifts to -36vh via GSAP)
    width:         180,
    height:        120,
    transform:     `rotate(${(i - 2) * 6}deg) translateY(${i * -4}px)`,
    borderRadius:  16,
    overflow:      'hidden',
    background:    '#080c12',
    border:        `1px solid ${p.color}44`,
    boxShadow:     `0 0 16px ${p.color}22`,
    cursor:        'pointer',
  })

  return (
    <>
    <section
      ref={sectionRef}
      style={{
        position:       'relative',
        width:          '100%',
        height:         '100vh',
        background:     BG,
        overflow:       'hidden',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        zIndex:         40,
      }}
    >
      {/* ── Scan-line texture ─────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:        'absolute',
          inset:           0,
          pointerEvents:   'none',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,170,255,0.012) 2px, rgba(0,170,255,0.012) 4px)',
          zIndex:          1,
        }}
      />

      {/* ── Section header ────────────────────────────────────────────── */}
      <div
        style={{
          position:      'absolute',
          top:           40,
          left:          '50%',
          transform:     'translateX(-50%)',
          textAlign:     'center',
          zIndex:        10,
          pointerEvents: 'none',
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          gap:           12,
          whiteSpace:    'nowrap',
        }}
      >
        <div
          style={{
            width:        40,
            height:       1,
            background:   `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
            marginBottom: 4,
          }}
        />
        <p
          style={{
            fontFamily:    "'Space Mono', monospace",
            fontSize:      9,
            letterSpacing: '0.35em',
            color:         `${ACCENT}aa`,
            textTransform: 'uppercase',
            margin:        0,
          }}
        >
          // selected works
        </p>
        <GlitchText text="WORKS" className="text-5xl md:text-7xl" />
      </div>

      {/* ── Scroll track (full viewport, panned by GSAP Phase 3) ──────── */}
      <div
        ref={trackRef}
        style={{
          position: 'absolute',
          top:      0,
          left:     0,
          width:    '100%',
          height:   '100%',
        }}
      >
        {/* ── Folder visuals (back + lid only — no cards inside) ────────
            The origin group sits at viewport centre so it overlaps the
            initial card positions (cards are siblings, not children). */}
        <div
          style={{
            position:  'absolute',
            top:       '50%',
            left:      '50%',
            transform: 'translate(-50%, -50%)',
            width:     320,
            height:    240,
            perspective: 800,
          }}
        >
          {/* Folder back */}
          <div ref={visualBackRef} style={{ position: 'absolute', inset: 0 }}>
            {/* Tab */}
            <div
              style={{
                position:     'absolute',
                top:          0,
                left:         0,
                width:        '38%',
                height:       28,
                background:   'linear-gradient(135deg, rgba(0,30,60,0.55) 0%, rgba(0,5,15,0.75) 100%)',
                border:       '1.5px solid rgba(0,170,255,0.25)',
                borderBottom: 'none',
                borderRadius: '8px 8px 0 0',
              }}
            />
            {/* Body */}
            <div
              style={{
                position:     'absolute',
                bottom:       0,
                width:        '100%',
                height:       '88%',
                background:   'linear-gradient(135deg, rgba(0,30,60,0.55) 0%, rgba(0,5,15,0.75) 100%)',
                border:       '1.5px solid rgba(0,170,255,0.25)',
                borderRadius: '4px 16px 16px 16px',
                boxShadow:    'inset 0 0 30px rgba(0,170,255,0.08)',
              }}
            />
          </div>

          {/* Folder lid */}
          <div ref={visualLidRef} style={{ position: 'absolute', inset: 0 }}>
            <div
              ref={lidRef}
              style={{
                position:        'absolute',
                bottom:          '87%',
                width:           '100%',
                height:          '88%',
                background:      'linear-gradient(135deg, rgba(0,30,60,0.55) 0%, rgba(0,5,15,0.75) 100%)',
                border:          '1.5px solid rgba(0,170,255,0.25)',
                borderRadius:    '4px 16px 16px 16px',
                boxShadow:       'inset 0 0 30px rgba(0,170,255,0.08)',
                transformOrigin: 'bottom center',
                transform:       'rotateX(-15deg)',
                zIndex:          60,
                transformStyle:  'preserve-3d',
              }}
            >
              <img
                src={logoUrl}
                alt="Folder Logo"
                style={{
                  position:  'absolute',
                  top:       '50%',
                  left:      '50%',
                  transform: 'translate(-50%,-50%)',
                  width:     64,
                  opacity:   0.4,
                  filter:    'drop-shadow(0 0 12px rgba(0,170,255,0.4))',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Project cards — siblings of the folder, children of the track.
              This means top/left/margin are relative to the FULL viewport,
              so centering with top:'50%' + marginTop:'-36vh' is accurate. ── */}
        {PROJECTS.map((p, i) => (
          <div
            key={p.id}
            ref={el => cardRefs.current[i] = el}
            onClick={() => setSelectedProject(p)}
            onMouseEnter={() => {
              gsap.to(imgRefs.current[i],  { scale: 1.06, opacity: 1,   duration: 0.5, ease: 'power2.out' })
              gsap.to(glowRefs.current[i], { opacity: 1,                  duration: 0.4 })
            }}
            onMouseLeave={() => {
              gsap.to(imgRefs.current[i],  { scale: 1.0, opacity: 0.75, duration: 0.5 })
              gsap.to(glowRefs.current[i], { opacity: 0,                  duration: 0.4 })
            }}
            style={initialCardStyle(p, i)}
          >
            {/* Image */}
            <img
              ref={el => imgRefs.current[i] = el}
              src={p.image}
              alt={p.title}
              style={{
                position:   'absolute',
                inset:      0,
                width:      '100%',
                height:     '100%',
                objectFit:  'cover',
                opacity:    0.75,
                willChange: 'transform, opacity',
              }}
            />

            {/* Hover glow */}
            <div
              ref={el => glowRefs.current[i] = el}
              style={{
                position:      'absolute',
                inset:         0,
                opacity:       0,
                boxShadow:     `inset 0 0 60px ${p.color}33`,
                border:        `1px solid ${p.color}44`,
                borderRadius:  16,
                pointerEvents: 'none',
                zIndex:        2,
              }}
            />

            {/* Info overlay */}
            <div
              ref={el => infoRefs.current[i] = el}
              style={{
                position:      'absolute',
                inset:         0,
                opacity:       0,
                pointerEvents: 'none',
                zIndex:        3,
              }}
            >
              {/* Bottom gradient */}
              <div
                style={{
                  position:   'absolute',
                  bottom:     0,
                  left:       0,
                  right:      0,
                  height:     '55%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.88), transparent)',
                }}
              />
              {/* Text */}
              <div
                style={{
                  position: 'absolute',
                  bottom:   0,
                  left:     0,
                  right:    0,
                  padding:  '36px 32px',
                }}
              >
                <p
                  style={{
                    fontFamily:    "'Space Mono', monospace",
                    fontSize:      9,
                    letterSpacing: '0.3em',
                    color:         p.color,
                    textTransform: 'uppercase',
                    margin:        '0 0 10px',
                  }}
                >
                  {p.category} — {p.year}
                </p>
                <h3
                  style={{
                    fontFamily:    "'Black Ops One', cursive",
                    fontSize:      'clamp(18px,2vw,28px)',
                    color:         '#e8edf2',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    margin:        '0 0 14px',
                    lineHeight:    1.1,
                  }}
                >
                  {p.title}
                </h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {p.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        fontFamily:    "'Space Mono', monospace",
                        fontSize:      9,
                        padding:       '5px 12px',
                        border:        `1.5px solid ${p.color}55`,
                        borderRadius:  99,
                        color:         p.color,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Neon corner accent */}
              <div
                style={{
                  position:    'absolute',
                  top:         20,
                  right:       20,
                  width:       28,
                  height:      28,
                  borderTop:   `1.5px solid ${p.color}`,
                  borderRight: `1.5px solid ${p.color}`,
                }}
              />

              {/* Index */}
              <div
                style={{
                  position:      'absolute',
                  top:           20,
                  left:          24,
                  fontFamily:    "'Space Mono', monospace",
                  fontSize:      9,
                  letterSpacing: '0.3em',
                  color:         `${p.color}88`,
                  textTransform: 'uppercase',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Corner metadata ───────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:      'absolute',
          top:           32,
          right:         32,
          opacity:       0.22,
          zIndex:        10,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily:    "'Space Mono', monospace",
            fontSize:      9,
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            color:         '#ffffff',
          }}
        >
          Portfolio 2025
        </span>
      </div>

      {/* ── Left progress bar ─────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          left:       28,
          top:        '50%',
          transform:  'translateY(-50%)',
          width:      1,
          height:     '45vh',
          background: 'rgba(0,170,255,0.12)',
          zIndex:     10,
        }}
      >
        <div
          style={{
            width:      '100%',
            height:     '30%',
            background: `linear-gradient(to bottom, ${BRIGHT}, ${MID})`,
            boxShadow:  `0 0 8px ${ACCENT}88`,
          }}
        />
      </div>

      {/* ── Explore More Card Button ───────────────────────────────────── */}
      <div
        onClick={() => setWorksOpen(true)}
        onMouseEnter={e => {
          gsap.to(e.currentTarget, { 
            scale: 1.05, 
            y: -5,
            boxShadow: `0 15px 30px rgba(0,0,0,0.5), 0 0 20px ${ACCENT}44`,
            borderColor: ACCENT, 
            duration: 0.4, 
            ease: 'back.out(1.5)' 
          })
          gsap.to(e.currentTarget.querySelector('.arrow'), { x: 5, backgroundColor: `${ACCENT}22`, borderColor: ACCENT, duration: 0.3 })
          gsap.to(e.currentTarget.querySelector('.bg-gradient'), { opacity: 1, duration: 0.4 })
        }}
        onMouseLeave={e => {
          gsap.to(e.currentTarget, { 
            scale: 1, 
            y: 0,
            boxShadow: `0 10px 20px rgba(0,0,0,0.4), 0 0 0px ${ACCENT}00`,
            borderColor: 'rgba(255,255,255,0.08)', 
            duration: 0.4,
            ease: 'power2.out'
          })
          gsap.to(e.currentTarget.querySelector('.arrow'), { x: 0, backgroundColor: 'transparent', borderColor: `${ACCENT}55`, duration: 0.3 })
          gsap.to(e.currentTarget.querySelector('.bg-gradient'), { opacity: 0, duration: 0.4 })
        }}
        style={{
          position:        'absolute',
          bottom:          40,
          left:            '50%',
          transform:       'translateX(-50%)',
          width:           280,
          height:          75,
          background:      'rgba(10, 15, 25, 0.65)',
          backdropFilter:  'blur(10px)',
          border:          '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius:    12,
          cursor:          'pointer',
          zIndex:          20,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'space-between',
          padding:         '0 24px',
          overflow:        'hidden',
          boxShadow:       '0 10px 20px rgba(0,0,0,0.4)',
        }}
      >
        {/* Hover gradient background */}
        <div 
          className="bg-gradient"
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${ACCENT}22 0%, transparent 100%)`,
            opacity: 0,
            zIndex: 0,
          }}
        />
        
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ 
            fontFamily: "'Space Mono', monospace", 
            fontSize: 9, 
            letterSpacing: '0.2em', 
            color: `${ACCENT}aa`, 
            textTransform: 'uppercase' 
          }}>
            // view all
          </span>
          <span style={{ 
            fontFamily: "'Black Ops One', cursive", 
            fontSize: 18, 
            color: '#e8edf2', 
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            Explore More
          </span>
        </div>
        
        {/* Arrow Circle */}
        <div 
          className="arrow"
          style={{ 
            position: 'relative', 
            zIndex: 1,
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: `1px solid ${ACCENT}55`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: BRIGHT,
            fontSize: 16,
            transition: 'background-color 0.3s, border-color 0.3s',
          }}
        >
          →
        </div>

        {/* Neon corner accent */}
        <div
          style={{
            position:    'absolute',
            top:         0,
            right:       0,
            width:       16,
            height:      16,
            borderTop:   `1.5px solid ${ACCENT}`,
            borderRight: `1.5px solid ${ACCENT}`,
            borderTopRightRadius: 10,
            opacity:     0.8,
          }}
        />
      </div>

    </section>

    {/* ── Works full-screen overlay ─────────────────────────────────────── */}
    <WorksPage open={worksOpen} onClose={() => setWorksOpen(false)} />

    {/* ── Project Details Overlay ─────────────────────────────────────── */}
    <ProjectDetails project={selectedProject} onClose={() => setSelectedProject(null)} />

    {/* ── Japanese Name Reveal Overlay ────────────────────────────────── */}
    <div
      ref={japanOverlayRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 150, // Below WorksPage(200)
        background: '#05070a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        opacity: 0, pointerEvents: 'none',
      }}
    >
      {/* Scan lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,170,255,0.012) 2px, rgba(0,170,255,0.012) 4px)',
        pointerEvents: 'none',
      }} />

      {/* Neon radial glow behind text */}
      <div style={{
        position: 'absolute',
        width: 600, height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,170,255,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Small label above */}
      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 10, letterSpacing: '0.4em',
        color: 'rgba(0,170,255,0.5)',
        textTransform: 'uppercase',
        marginBottom: 32,
        position: 'relative', zIndex: 5
      }}>
        // ウサマ
      </p>

      {/* Kanji characters — each in its own span for stagger */}
      <div style={{
        display: 'flex', gap: 16,
        perspective: 800,
        perspectiveOrigin: '50% 50%',
        position: 'relative', zIndex: 5
      }}>
        {['ウ','サ','マ'].map((char, i) => (
          <span
            key={i}
            ref={el => kanjiCharsRef.current[i] = el}
            style={{
              fontFamily: "'Black Ops One', cursive",
              fontSize: 'clamp(80px, 18vw, 180px)',
              color: 'transparent',
              background: `linear-gradient(135deg, #ffffff 0%, #33bbff 40%, #ffffff 100%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: `drop-shadow(0 0 30px rgba(0,170,255,0.6))`,
              lineHeight: 1,
              display: 'inline-block',
            }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* Latin subtitle */}
      <p
        ref={kanjiSubRef}
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11, letterSpacing: '0.55em',
          color: 'rgba(255,255,255,0.25)',
          textTransform: 'uppercase',
          marginTop: 28,
          position: 'relative', zIndex: 5
        }}
      >
        Oussama — Creative Designer
      </p>

      {/* Bottom neon rule */}
      <div style={{
        width: 60, height: 1, marginTop: 32,
        background: `linear-gradient(90deg, transparent, #00aaff, transparent)`,
        position: 'relative', zIndex: 5
      }} />
    </div>

    {/* ── Circle Wipe Transition ──────────────────────────────────────── */}
    <div
      ref={wipeRef}
      style={{
        position: 'fixed',
        top: '50%', left: '50%',
        width: '200vmax', height: '200vmax',
        marginTop: '-100vmax', marginLeft: '-100vmax',
        borderRadius: '50%',
        background: '#00aaff',
        zIndex: 160,
        opacity: 0,
        transform: 'scale(0)',
        pointerEvents: 'none',
      }}
    />

    {/* ── Contact Form ────────────────────────────────────────────────── */}
    {showContact && (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 155,
        background: '#05070a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ maxWidth: 560, width: '90%' }}>
          <p style={{ fontFamily:"'Space Mono'", fontSize:9,
            letterSpacing:'0.35em', color:'rgba(0,170,255,0.5)',
            textTransform:'uppercase', marginBottom:16 }}>
            // get in touch
          </p>
          <h2 style={{ fontFamily:"'Black Ops One'", fontSize:'clamp(32px,6vw,64px)',
            color:'#e8edf2', textTransform:'uppercase',
            letterSpacing:'0.04em', marginBottom:40 }}>
            Let's Work<br/>
            <span style={{ color:'#00aaff',
              textShadow:'0 0 22px #00aaff, 0 0 55px rgba(0,170,255,0.3)' }}>
              Together.
            </span>
          </h2>

          {/* Inputs */}
          {['Your Name', 'Your Email', 'Your Message'].map((placeholder, i) => (
            i < 2
            ? <input key={i} placeholder={placeholder} style={{
                width: '100%', background: 'rgba(0,170,255,0.04)',
                border: '1px solid rgba(0,170,255,0.2)',
                borderRadius: 8, padding: '16px 20px',
                fontFamily: "'Space Mono'", fontSize: 12,
                color: '#e8edf2', marginBottom: 16,
                outline: 'none', letterSpacing: '0.05em',
                boxSizing: 'border-box',
              }} />
            : <textarea key={i} placeholder={placeholder} rows={4} style={{
                width: '100%', background: 'rgba(0,170,255,0.04)',
                border: '1px solid rgba(0,170,255,0.2)',
                borderRadius: 8, padding: '16px 20px',
                fontFamily: "'Space Mono'", fontSize: 12,
                color: '#e8edf2', marginBottom: 24, resize: 'none',
                outline: 'none', letterSpacing: '0.05em',
                boxSizing: 'border-box',
              }} />
          ))}

          <button style={{
            width: '100%', padding: '16px',
            background: 'transparent',
            border: '1.5px solid rgba(0,170,255,0.5)',
            color: '#e8edf2',
            fontFamily: "'Space Mono'", fontSize: 11,
            letterSpacing: '0.3em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 8,
            boxShadow: '0 0 22px rgba(0,170,255,0.1)',
            transition: 'all 0.3s',
          }}>
            Send Message →
          </button>
        </div>
      </div>
    )}
    </>
  )
}

export default WorksSection
