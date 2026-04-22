import React, { useRef, useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import logoUrl from '../constant/logopro.png'
import ProjectDetails from './ProjectDetails'
import { ACCENT, BRIGHT, BG } from '../constant/theme'
import BlobGhostButton from './button'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════════════════
   MOBILE WORKS VIEW  (≤ 640 px)
   Desktop section below is completely untouched.
═══════════════════════════════════════════════════════════════════ */

function MobileWorksView({ onClose, onSelect }) {
  const wrapRef     = useRef(null)
  const navRef      = useRef(null)
  const scrollRef   = useRef(null)
  const rowRefs     = useRef([])
  const orbRef      = useRef(null)
  const ctxRef      = useRef(null)
  const [activeIdx, setActiveIdx] = useState(0)

  const activeColor = PROJECTS[activeIdx]?.color ?? ACCENT

  /* ── Enter animation ──────────────────────────────────────────── */
  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(wrapRef.current,
      { y: '100%', opacity: 0 },
      { y: '0%', opacity: 1, duration: 0.75, ease: 'expo.out' }
    )
    tl.fromTo(navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }, '0.3'
    )
    tl.fromTo(rowRefs.current.filter(Boolean),
      { y: 48, opacity: 0 },
      { y: 0, opacity: 0.3, duration: 0.55, stagger: 0.07, ease: 'power3.out' }, '0.35'
    )
  }, [])

  /* ── GSAP ScrollTrigger focus ─────────────────────────────────── */
  useEffect(() => {
    const timer = setTimeout(() => {
      ctxRef.current = gsap.context(() => {
        rowRefs.current.forEach((row, i) => {
          if (!row) return
          ScrollTrigger.create({
            trigger: row,
            scroller: scrollRef.current,
            start: 'top 58%',
            end:   'bottom 42%',
            onEnter:     () => { setActiveIdx(i); animRow(row, true)  },
            onLeave:     () => { animRow(row, false) },
            onEnterBack: () => { setActiveIdx(i); animRow(row, true)  },
            onLeaveBack: () => { animRow(row, false) },
          })
        })
      }, scrollRef.current)
    }, 150)
    return () => { clearTimeout(timer); ctxRef.current?.revert() }
  }, [])

  function animRow(el, active) {
    gsap.to(el, {
      scale:   active ? 1.035 : 0.94,
      opacity: active ? 1 : 0.3,
      duration: 0.38,
      ease: active ? 'power2.out' : 'power2.in',
    })
  }

  /* ── Orb colour shift ─────────────────────────────────────────── */
  useEffect(() => {
    if (!orbRef.current) return
    gsap.to(orbRef.current, {
      background: `radial-gradient(circle, ${activeColor}22 0%, transparent 70%)`,
      duration: 0.7, ease: 'power2.out',
    })
  }, [activeColor])

  const handleClose = useCallback(() => {
    ctxRef.current?.revert()
    gsap.to(wrapRef.current, {
      y: '100%', opacity: 0, duration: 0.5, ease: 'power3.in',
      onComplete: onClose,
    })
  }, [onClose])

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: '#07070b',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "'Matemasie', sans-serif",
      }}
    >
      {/* ── Ambient bg ── */}
      <div aria-hidden style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        {/* grid */}
        <div style={{
          position:'absolute', inset:0,
          backgroundImage:
            'repeating-linear-gradient(0deg,transparent,transparent 48px,rgba(255,255,255,0.015) 48px,rgba(255,255,255,0.015) 49px),'+
            'repeating-linear-gradient(90deg,transparent,transparent 48px,rgba(255,255,255,0.015) 48px,rgba(255,255,255,0.015) 49px)',
        }} />
        {/* reactive orb */}
        <div ref={orbRef} style={{
          position:'absolute', top:'6%', left:'50%', transform:'translateX(-50%)',
          width:380, height:380, borderRadius:'50%',
          background:`radial-gradient(circle, ${ACCENT}22 0%, transparent 70%)`,
          filter:'blur(52px)',
        }} />
        {/* bottom bleed */}
        <div style={{
          position:'absolute', bottom:'-10%', left:'50%', transform:'translateX(-50%)',
          width:300, height:300, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(255,51,102,0.07) 0%, transparent 70%)',
          filter:'blur(60px)',
        }} />
        {/* glass panels */}
        <div style={{
          position:'absolute', top:'5%', right:'-20%',
          width:190, height:300, borderRadius:22,
          background:'rgba(255,255,255,0.017)',
          border:'1px solid rgba(255,255,255,0.03)',
          backdropFilter:'blur(12px)', transform:'rotate(15deg)',
        }} />
        <div style={{
          position:'absolute', bottom:'7%', left:'-18%',
          width:170, height:250, borderRadius:22,
          background:'rgba(255,255,255,0.013)',
          border:'1px solid rgba(255,255,255,0.025)',
          backdropFilter:'blur(12px)', transform:'rotate(-11deg)',
        }} />
      </div>

      {/* ── Sticky Navbar ── */}
      <nav
        ref={navRef}
        style={{
          position:'relative', zIndex:20, flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'15px 20px',
          background:'rgba(7,7,11,0.8)',
          backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)',
          borderBottom:'1px solid rgba(255,255,255,0.055)',
        }}
      >
        {/* Left: hamburger + grid */}
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <button
            onClick={handleClose}
            aria-label="Close"
            style={{ background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', flexDirection:'column', gap:5 }}
          >
            {[22,14,22].map((w,i) => (
              <div key={i} style={{ width:w, height:1.5, background:'rgba(255,255,255,0.6)', borderRadius:2 }} />
            ))}
          </button>
          <button
            aria-label="Grid"
            style={{ background:'none', border:'none', cursor:'pointer', padding:0, display:'grid', gridTemplateColumns:'1fr 1fr', gap:3.5 }}
          >
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width:5, height:5, borderRadius:1.5, background:'rgba(255,255,255,0.4)' }} />
            ))}
          </button>
        </div>

        {/* Center ghost label */}
        <span style={{
          position:'absolute', left:'50%', transform:'translateX(-50%)',
          fontSize:7.5, letterSpacing:'0.22em', textTransform:'uppercase',
          color:'rgba(255,255,255,0.2)', whiteSpace:'nowrap', pointerEvents:'none',
        }}>
          CATEGORIZED / FREESTYLE
        </span>

        {/* Right: Contact pill */}
        <button
          onClick={handleClose}
          style={{
            fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase',
            color:'rgba(255,255,255,0.78)',
            background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.13)',
            borderRadius:99, padding:'8px 16px', cursor:'pointer',
            backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
            boxShadow:`0 0 0 1px rgba(255,255,255,0.04), 0 0 18px ${activeColor}18`,
            transition:'box-shadow 0.4s ease, border-color 0.4s ease',
          }}
        >
          Contact
        </button>
      </nav>

      {/* ── Project count ── */}
      <div style={{ position:'relative', zIndex:10, padding:'22px 22px 0', flexShrink:0 }}>
        <p style={{
          fontSize:8, letterSpacing:'0.38em', textTransform:'uppercase',
          color:activeColor, margin:0, transition:'color 0.5s ease',
        }}>
          // 0{PROJECTS.length} works
        </p>
        <div style={{
          marginTop:7, width:28, height:1,
          background:`linear-gradient(90deg, ${activeColor}, transparent)`,
          transition:'background 0.5s ease',
        }} />
      </div>

      {/* ── Scrollable list ── */}
      <div
        ref={scrollRef}
        style={{
          flex:1, overflowY:'auto', overflowX:'hidden',
          position:'relative', zIndex:10,
          padding:'0 22px',
          WebkitOverflowScrolling:'touch',
        }}
      >
        <div style={{ height:'26vh' }} />

        {PROJECTS.map((p, i) => (
          <div
            key={p.id}
            ref={el => rowRefs.current[i] = el}
            onClick={() => onSelect(p)}
            style={{
              padding:'30px 0 26px',
              borderBottom:'1px solid rgba(255,255,255,0.055)',
              cursor:'pointer',
              opacity:0.3,
              willChange:'transform, opacity',
            }}
          >
            {/* index + category */}
            <p style={{
              fontSize:9, letterSpacing:'0.32em', textTransform:'uppercase',
              color:p.color, margin:'0 0 10px', opacity:0.8,
            }}>
              {String(i+1).padStart(2,'0')} &mdash; {p.category}
            </p>

            {/* title */}
            <h2 style={{
              fontSize:'clamp(28px,8.5vw,42px)',
              color:'#f0ece5',
              letterSpacing:'-0.01em',
              textTransform:'uppercase',
              lineHeight:1.0,
              margin:'0 0 16px',
            }}>
              {p.title}
            </h2>

            {/* tags + arrow */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, alignItems:'center' }}>
              {p.tags.map(tag => (
                <span key={tag} style={{
                  fontSize:9, letterSpacing:'0.15em', textTransform:'uppercase',
                  padding:'5px 12px', borderRadius:99,
                  border:'1px solid rgba(255,255,255,0.13)',
                  color:'rgba(255,255,255,0.5)',
                  background:'rgba(255,255,255,0.035)',
                  backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
                }}>
                  {tag}
                </span>
              ))}
              {/* year pill */}
              <span style={{
                fontSize:9, letterSpacing:'0.15em', textTransform:'uppercase',
                padding:'5px 12px', borderRadius:99,
                border:`1px solid ${p.color}55`,
                color:p.color,
                background:`${p.color}0d`,
                backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
              }}>
                {p.year}
              </span>
              <span style={{
                marginLeft:'auto', fontSize:18, lineHeight:1,
                color:`${p.color}80`,
              }}>→</span>
            </div>
          </div>
        ))}

        {/* End of list */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'26px 0 8px' }}>
          <div style={{
            flex:1, height:1,
            background:`linear-gradient(90deg, ${activeColor}55, transparent)`,
            transition:'background 0.5s ease',
          }} />
          <span style={{ fontSize:8, letterSpacing:'0.28em', color:'rgba(255,255,255,0.18)', textTransform:'uppercase' }}>
            End of list
          </span>
        </div>
        <div style={{ height:'28vh' }} />
      </div>

      {/* ── Right rail progress dots ── */}
      <div style={{
        position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
        display:'flex', flexDirection:'column', gap:7,
        zIndex:25, pointerEvents:'none',
      }}>
        {PROJECTS.map((_,i) => (
          <div key={i} style={{
            width: i===activeIdx ? 3 : 2,
            height: i===activeIdx ? 24 : 7,
            borderRadius:99,
            background: i===activeIdx ? activeColor : 'rgba(255,255,255,0.1)',
            transition:'all 0.4s ease',
          }} />
        ))}
      </div>

      {/* ── Bottom accent line ── */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, height:2,
        background:`linear-gradient(90deg, transparent, ${activeColor}cc, transparent)`,
        transition:'background 0.6s ease', zIndex:25,
      }} />
    </div>
  )
}
/* ═══════════════════════════════════════════════════════════════════
   END MOBILE VIEW
═══════════════════════════════════════════════════════════════════ */

const PROJECTS = [
  {
    id: 1,
    icon: '⊕',
    title: 'Project One',
    category: 'UI/UX Design',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
    color: ACCENT,
    tags: ['React', 'Figma'],
    resume: 'A comprehensive modern redesign of a fintech dashboard focusing on dark mode accessibility, micro-animations, and high-contrast data visualization. The project involved wireframing, prototyping, and final implementation using React and Tailwind.',
    techStack: ['React', 'Figma', 'Framer Motion', 'TailwindCSS'],
    timeSpent: '4 Weeks'
  },
  {
    id: 2,
    icon: '↗',
    title: 'Project Two',
    category: 'Full Stack',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    color: '#aa00ff',
    tags: ['Node', 'MongoDB'],
    resume: 'A scalable e-commerce backend built with Node.js and Express. It features secure JWT authentication, Stripe payment integration, real-time order tracking using WebSockets, and a fully optimized MongoDB aggregation pipeline for product search.',
    techStack: ['Node.js', 'Express', 'MongoDB', 'Socket.io', 'Stripe API'],
    timeSpent: '2 Months'
  },
  {
    id: 3,
    icon: '◈',
    title: 'Project Three',
    category: '3D / WebGL',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop',
    color: '#00ffaa',
    tags: ['Three.js', 'GSAP'],
    resume: 'An immersive interactive web gallery utilizing Three.js and custom GLSL shaders. Users can navigate through a 3D environment to view artwork, accompanied by smooth camera animations powered by GSAP. Performance optimized to maintain 60FPS on mobile.',
    techStack: ['Three.js', 'GLSL', 'GSAP', 'React Three Fiber'],
    timeSpent: '6 Weeks'
  },
  {
    id: 4,
    icon: '⌬',
    title: 'Project Four',
    category: 'AI / ML',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1633415730303-34e813a37d6e?q=80&w=600&auto=format&fit=crop',
    color: '#ff6600',
    tags: ['Python', 'TensorFlow'],
    resume: 'A computer vision pipeline designed for real-time edge detection and object classification. The model was trained using TensorFlow on a custom dataset, then exported via ONNX for rapid inference inside a lightweight Python Flask service.',
    techStack: ['Python', 'TensorFlow', 'OpenCV', 'Flask', 'ONNX'],
    timeSpent: '3 Months'
  },
  {
    id: 5,
    icon: '⊛',
    title: 'Project Five',
    category: 'Motion Design',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop',
    color: '#ffcc00',
    tags: ['GSAP', 'CSS'],
    resume: 'A highly kinetic landing page showcasing advanced CSS typography and sequential scroll-driven animations. Heavily relies on GSAP ScrollTrigger to orchestrate complex timeline sequences, pinning, and parallax effects to tell a compelling brand story.',
    techStack: ['HTML5', 'Vanilla CSS', 'GSAP', 'ScrollTrigger'],
    timeSpent: '3 Weeks'
  },
]

const FAN_CONFIGS = [
  { x: -280, y: 60, rotY: 42, rotZ: -8, scale: 0.82, z: 0 },
  { x: -140, y: 20, rotY: 22, rotZ: -4, scale: 0.90, z: 80 },
  { x: 0, y: 0, rotY: 0, rotZ: 0, scale: 1.00, z: 160 },
  { x: 140, y: 20, rotY: -22, rotZ: 4, scale: 0.90, z: 80 },
  { x: 280, y: 60, rotY: -42, rotZ: 8, scale: 0.82, z: 0 },
]

const WorksPage = ({ open, onClose }) => {
  const overlayRef = useRef(null)
  const navRef = useRef(null)
  const listItemsRef = useRef([])
  const cardsRef = useRef([])
  const [hoveredId, setHoveredId] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  useEffect(() => {
    if (!open || !mounted || !overlayRef.current) return

    const tl = gsap.timeline()

    tl.fromTo(overlayRef.current,
      { y: '100%', opacity: 0 },
      { y: '0%', opacity: 1, duration: 0.9, ease: 'expo.out' }
    )

    tl.fromTo(navRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
      '0.4'
    )

    tl.fromTo(listItemsRef.current.filter(Boolean),
      { x: -60, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: 'power3.out' },
      '0.5'
    )
  }, [open, mounted])

  useEffect(() => {
    if (!open || !mounted) return
    const cards = cardsRef.current.filter(Boolean)
    if (!cards.length) return

    gsap.set(cards, { x: 600, opacity: 0, rotateY: -30 })

    gsap.to(cards, {
      x: (i) => FAN_CONFIGS[i].x,
      opacity: 1,
      rotateY: (i) => FAN_CONFIGS[i].rotY,
      duration: 0.9,
      stagger: 0.08,
      ease: 'expo.out',
      delay: 0.5,
    })
  }, [open, mounted])

  const handleClose = () => {
    gsap.to(overlayRef.current, {
      y: '100%', opacity: 0,
      duration: 0.6, ease: 'power3.in',
      onComplete: () => {
        setMounted(false)
        onClose()
      },
    })
  }

  if (!mounted) return null

  /* ── Mobile branch — desktop portal below is completely unchanged ── */
  if (isMobile) {
    return createPortal(
      <>
        <MobileWorksView
          onClose={() => { setMounted(false); onClose() }}
          onSelect={setSelectedProject}
        />
        {selectedProject && (
          <ProjectDetails project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </>,
      document.body
    )
  }

  return createPortal(
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
          zIndex: 0,
        }}
      />

      <nav
        ref={navRef}
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '22px 44px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <img src={logoUrl} alt="Logo" style={{ height: 32 }} />
          <span style={{ fontFamily: "'Matemasie', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>Portfolio</span>
          <span style={{ fontFamily: "'Matemasie', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>/</span>
          <span style={{ fontFamily: "'Matemasie', sans-serif", fontSize: 11, color: '#e8edf2', letterSpacing: '0.1em' }}>Works</span>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontFamily: "'Matemasie', sans-serif", fontSize: 13, color: '#00aaff', letterSpacing: '0.2em', opacity: 0.7 }}>≡ &nbsp; ⊞</span>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <span style={{ fontFamily: "'Matemasie', sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em' }}>
            categorized / freestyle
          </span>
          <BlobGhostButton size="sm" onClick={handleClose}>
            ✕ &nbsp; Close
          </BlobGhostButton>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 5, display: 'flex', flex: 1, overflow: 'hidden' }}>

        <div
          style={{
            width: '42%',
            padding: '40px 44px',
            overflowY: 'auto',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0,
          }}
        >
          <p style={{ fontFamily: "'Matemasie', sans-serif", fontSize: 9, letterSpacing: '0.35em', color: '#00aaff', textTransform: 'uppercase', margin: '0 0 24px' }}>
            // 0{PROJECTS.length} projects
          </p>

          {PROJECTS.map((p, i) => (
            <div
              key={p.id}
              ref={el => listItemsRef.current[i] = el}
              onClick={() => setSelectedProject(p)}
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 0',
                paddingLeft: hoveredId === p.id ? 16 : 0,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer',
                transition: 'padding-left 0.35s cubic-bezier(0.23,1,0.32,1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 14, color: hoveredId === p.id ? '#00aaff' : 'rgba(255,255,255,0.3)', transition: 'color 0.3s', width: 20, textAlign: 'center', flexShrink: 0 }}>
                  {p.icon}
                </span>
                <div>
                  <div style={{ fontFamily: "'Matemasie', sans-serif", fontSize: hoveredId === p.id ? 20 : 16, color: hoveredId === p.id ? '#e8edf2' : 'rgba(255,255,255,0.6)', letterSpacing: '0.04em', textTransform: 'uppercase', transition: 'font-size 0.3s, color 0.3s', lineHeight: 1.2 }}>
                    {p.title}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: hoveredId === p.id ? 6 : 0, maxHeight: hoveredId === p.id ? 30 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease, margin-top 0.3s ease' }}>
                    <span style={{ fontFamily: "'Matemasie', sans-serif", fontSize: 8, letterSpacing: '0.2em', color: '#00aaff', textTransform: 'uppercase' }}>{p.category}</span>
                    {p.tags.map(tag => (
                      <span key={tag} style={{ fontFamily: "'Matemasie', sans-serif", fontSize: 8, padding: '2px 7px', border: `1px solid #00aaff`, borderRadius: 99, color: '#00aaff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <span style={{ fontFamily: "'Matemasie', sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>{p.year}</span>
                <span style={{ fontFamily: "'Matemasie', sans-serif", fontSize: 12, color: hoveredId === p.id ? '#ff3366' : 'rgba(255,255,255,0.2)', transition: 'color 0.3s', display: 'inline-block' }}>→</span>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 1, background: `linear-gradient(90deg, #00aaff, transparent)` }} />
            <span style={{ fontFamily: "'Matemasie', sans-serif", fontSize: 8, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>End of list</span>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: 1200,
            perspectiveOrigin: '50% 60%',
            position: 'relative',
          }}
        >
          <div style={{
            position: 'absolute',
            width: 600,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(ellipse at center, ${hoveredId
              ? (PROJECTS.find(p => p.id === hoveredId)?.color ?? ACCENT) + '14'
              : 'rgba(0,170,255,0.05)'
              } 0%, transparent 70%)`,
            transition: 'background 0.6s ease',
            pointerEvents: 'none',
            left: '50%',
            transform: 'translateX(-50%)',
          }} />

          <div style={{
            position: 'relative',
            width: 340,
            height: 440,
            transformStyle: 'preserve-3d',
          }}>
            {PROJECTS.map((p, i) => {
              const f = FAN_CONFIGS[i]
              const isActive = hoveredId === p.id
              return (
                <div
                  key={p.id}
                  ref={el => cardsRef.current[i] = el}
                  onClick={() => setSelectedProject(p)}
                  onMouseEnter={() => setHoveredId(p.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 14,
                    overflow: 'hidden',
                    transformStyle: 'preserve-3d',
                    transform: `
                      translateX(${isActive ? f.x * 1.08 : f.x}px)
                      translateY(${isActive ? f.y - 28 : f.y}px)
                      translateZ(${f.z}px)
                      rotateY(${f.rotY}deg)
                      rotateZ(${f.rotZ}deg)
                      scale(${isActive ? f.scale * 1.08 : f.scale})
                    `,
                    transition: 'transform 0.45s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease, border-color 0.4s ease',
                    border: `1px solid ${isActive ? '#00aaff' : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: isActive
                      ? `0 20px 60px rgba(0,0,0,0.15)`
                      : '0 10px 40px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    zIndex: isActive ? 10 : i,
                    background: '#0a0a0a'
                  }}
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: isActive ? 1 : 0.8,
                      filter: isActive ? 'none' : 'brightness(0.9) grayscale(20%)',
                      transition: 'opacity 0.4s ease, filter 0.4s ease',
                    }}
                  />

                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '28px 22px',
                    background: 'linear-gradient(to top, rgba(10,15,25,0.95) 0%, rgba(10,15,25,0) 100%)', // Dark gradient
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'translateY(0)' : 'translateY(12px)',
                    transition: 'opacity 0.4s ease, transform 0.4s ease',
                  }}>
                    <p style={{
                      fontFamily: "'Matemasie', sans-serif",
                      fontSize: 9,
                      color: '#00aaff',
                      letterSpacing: '0.25em',
                      textTransform: 'uppercase',
                      margin: '0 0 6px',
                    }}>
                      {p.category} — {p.year}
                    </p>
                    <h3 style={{
                      fontFamily: "'Matemasie', sans-serif",
                      fontSize: 20,
                      color: '#e8edf2',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      margin: '0 0 10px',
                    }}>
                      {p.title}
                    </h3>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {p.tags.map(t => (
                        <span key={t} style={{
                          fontFamily: "'Matemasie', sans-serif",
                          fontSize: 8,
                          padding: '3px 9px',
                          border: `1px solid #00aaff`,
                          borderRadius: 99,
                          color: '#0a0a0a',
                          background: '#00aaff',
                          letterSpacing: '0.1em',
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    width: 20,
                    height: 20,
                    borderTop: `1.5px solid #ff3366`,
                    borderRight: `1.5px solid #ff3366`,
                    opacity: isActive ? 1 : 0.3,
                    transition: 'opacity 0.4s ease',
                  }} />

                  <div style={{
                    position: 'absolute',
                    top: 14,
                    left: 16,
                    fontFamily: "'Matemasie', sans-serif",
                    fontSize: 9,
                    letterSpacing: '0.3em',
                    color: isActive ? '#00aaff' : 'rgba(255,255,255,0.4)',
                    textTransform: 'uppercase',
                    transition: 'color 0.35s ease',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Hover hint */}
          <div style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: "'Matemasie', sans-serif",
            fontSize: 9,
            letterSpacing: '0.3em',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            Hover to explore
          </div>
        </div>{/* end right panel */}
      </div>{/* end flex row */}

      {selectedProject && (
        <ProjectDetails
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>,
    document.body
  )
}

export default React.memo(WorksPage)
