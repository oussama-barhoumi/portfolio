import React, { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import logoUrl from '../constant/logopro.png'
import ProjectDetails from './ProjectDetails'
import { ACCENT, BRIGHT, BG } from '../constant/theme'

const PROJECTS = [
  { 
    id: 1, 
    icon: '⊕', 
    title: 'Project One', 
    category: 'UI/UX Design', 
    year: '2024', 
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop', 
    color: ACCENT, 
    tags: ['React','Figma'],
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
    tags: ['Node','MongoDB'],
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
    tags: ['Three.js','GSAP'],
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
    tags: ['Python','TensorFlow'],
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
    tags: ['GSAP','CSS'],
    resume: 'A highly kinetic landing page showcasing advanced CSS typography and sequential scroll-driven animations. Heavily relies on GSAP ScrollTrigger to orchestrate complex timeline sequences, pinning, and parallax effects to tell a compelling brand story.',
    techStack: ['HTML5', 'Vanilla CSS', 'GSAP', 'ScrollTrigger'],
    timeSpent: '3 Weeks'
  },
]

const FAN_CONFIGS = [
  { x: -280, y:  60, rotY:  42, rotZ:  -8, scale: 0.82, z: 0   },
  { x: -140, y:  20, rotY:  22, rotZ:  -4, scale: 0.90, z: 80  },
  { x:    0, y:   0, rotY:   0, rotZ:   0, scale: 1.00, z: 160 },
  { x:  140, y:  20, rotY: -22, rotZ:   4, scale: 0.90, z: 80  },
  { x:  280, y:  60, rotY: -42, rotZ:   8, scale: 0.82, z: 0   },
]

const WorksPage = ({ open, onClose }) => {
  const overlayRef   = useRef(null)
  const navRef       = useRef(null)
  const listItemsRef = useRef([])
  const cardsRef     = useRef([])
  const [hoveredId, setHoveredId] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  useEffect(() => {
    if (!open || !mounted || !overlayRef.current) return

    const tl = gsap.timeline()

    tl.fromTo(overlayRef.current,
      { y: '100%', opacity: 0 },
      { y: '0%',   opacity: 1, duration: 0.9, ease: 'expo.out' }
    )

    tl.fromTo(navRef.current,
      { y: -30, opacity: 0 },
      { y: 0,   opacity: 1, duration: 0.5, ease: 'power3.out' },
      '0.4'
    )

    tl.fromTo(listItemsRef.current.filter(Boolean),
      { x: -60, opacity: 0 },
      { x: 0,   opacity: 1, duration: 0.6, stagger: 0.07, ease: 'power3.out' },
      '0.5'
    )
  }, [open, mounted])

  useEffect(() => {
    if (!open || !mounted) return
    const cards = cardsRef.current.filter(Boolean)
    if (!cards.length) return

    gsap.set(cards, { x: 600, opacity: 0, rotateY: -30 })

    gsap.to(cards, {
      x:       (i) => FAN_CONFIGS[i].x,
      opacity: 1,
      rotateY: (i) => FAN_CONFIGS[i].rotY,
      duration: 0.9,
      stagger:  0.08,
      ease:    'expo.out',
      delay:    0.5,
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

  return createPortal(
    <div
      ref={overlayRef}
      style={{
        position:      'fixed',
        inset:         0,
        zIndex:        200,
        background:    '#0a0a0a', 
        display:       'flex',
        flexDirection: 'column',
        overflow:      'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position:        'absolute',
          inset:           0,
          pointerEvents:   'none',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
          zIndex:          0,
        }}
      />

      <nav
        ref={navRef}
        style={{
          position:       'relative',
          zIndex:         10,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '22px 44px',
          borderBottom:   '1px solid rgba(255,255,255,0.1)',
          flexShrink:     0,
        }}
      >
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <img src={logoUrl} alt="Logo" style={{ height: 32 }} />
          <span style={{ fontFamily:"'Space Mono', monospace", fontSize:11, color:'rgba(255,255,255,0.5)', letterSpacing:'0.1em' }}>Portfolio</span>
          <span style={{ fontFamily:"'Space Mono', monospace", fontSize:11, color:'rgba(255,255,255,0.3)' }}>/</span>
          <span style={{ fontFamily:"'Space Mono', monospace", fontSize:11, color:'#e8edf2', letterSpacing:'0.1em' }}>Works</span>
        </div>

        <div style={{ display:'flex', gap:16, alignItems:'center' }}>
          <span style={{ fontFamily:"'Space Mono', monospace", fontSize:13, color:'#00aaff', letterSpacing:'0.2em', opacity:0.7 }}>≡ &nbsp; ⊞</span>
        </div>

        <div style={{ display:'flex', gap:24, alignItems:'center' }}>
          <span style={{ fontFamily:"'Space Mono', monospace", fontSize:10, color:'rgba(255,255,255,0.5)', letterSpacing:'0.15em' }}>
            categorized / freestyle
          </span>
          <button
            onClick={handleClose}
            style={{ border:'1px solid rgba(255,255,255,0.2)', borderRadius:4, padding:'8px 22px', fontFamily:"'Space Mono', monospace", fontSize:10, color:'#e8edf2', background:'transparent', cursor:'pointer', letterSpacing:'0.15em', transition:'border-color 0.3s, color 0.3s', willChange: 'transform' }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#ff3366'
              e.currentTarget.style.color = '#ff3366'
              gsap.to(e.currentTarget, { scale: 1.05, duration: 0.3, ease: 'power2.out' })
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              e.currentTarget.style.color = '#e8edf2'
              gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: 'power2.out' })
            }}
          >
            ✕ &nbsp; Close
          </button>
        </div>
      </nav>

      <div style={{ position:'relative', zIndex:5, display:'flex', flex:1, overflow:'hidden' }}>

        <div
          style={{
            width:       '42%',
            padding:     '40px 44px',
            overflowY:   'auto',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            flexShrink:  0,
          }}
        >
          <p style={{ fontFamily:"'Space Mono', monospace", fontSize:9, letterSpacing:'0.35em', color:'#00aaff', textTransform:'uppercase', margin:'0 0 24px' }}>
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
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        '18px 0',
                paddingLeft:    hoveredId === p.id ? 16 : 0,
                borderBottom:   '1px solid rgba(255,255,255,0.05)',
                cursor:         'pointer',
                transition:     'padding-left 0.35s cubic-bezier(0.23,1,0.32,1)',
              }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                <span style={{ fontSize:14, color: hoveredId === p.id ? '#00aaff' : 'rgba(255,255,255,0.3)', transition:'color 0.3s', width:20, textAlign:'center', flexShrink:0 }}>
                  {p.icon}
                </span>
                <div>
                  <div style={{ fontFamily:"'Black Ops One', cursive", fontSize: hoveredId === p.id ? 20 : 16, color: hoveredId === p.id ? '#e8edf2' : 'rgba(255,255,255,0.6)', letterSpacing:'0.04em', textTransform:'uppercase', transition:'font-size 0.3s, color 0.3s', lineHeight:1.2 }}>
                    {p.title}
                  </div>
                  <div style={{ display:'flex', gap:6, marginTop: hoveredId === p.id ? 6 : 0, maxHeight: hoveredId === p.id ? 30 : 0, overflow:'hidden', transition:'max-height 0.3s ease, margin-top 0.3s ease' }}>
                    <span style={{ fontFamily:"'Space Mono', monospace", fontSize:8, letterSpacing:'0.2em', color:'#00aaff', textTransform:'uppercase' }}>{p.category}</span>
                    {p.tags.map(tag => (
                      <span key={tag} style={{ fontFamily:"'Space Mono', monospace", fontSize:8, padding:'2px 7px', border:`1px solid #00aaff`, borderRadius:99, color:'#00aaff', letterSpacing:'0.1em', textTransform:'uppercase' }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
                <span style={{ fontFamily:"'Space Mono', monospace", fontSize:10, color:'rgba(255,255,255,0.4)', letterSpacing:'0.1em' }}>{p.year}</span>
                <span style={{ fontFamily:"'Space Mono', monospace", fontSize:12, color: hoveredId === p.id ? '#ff3366' : 'rgba(255,255,255,0.2)', transition:'color 0.3s', display:'inline-block' }}>→</span>
              </div>
            </div>
          ))}

          <div style={{ marginTop:40, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:32, height:1, background:`linear-gradient(90deg, #00aaff, transparent)` }} />
            <span style={{ fontFamily:"'Space Mono', monospace", fontSize:8, letterSpacing:'0.3em', color:'rgba(255,255,255,0.3)', textTransform:'uppercase' }}>End of list</span>
          </div>
        </div>

        <div
          style={{
            flex:              1,
            display:           'flex',
            alignItems:        'center',
            justifyContent:    'center',
            perspective:       1200,
            perspectiveOrigin: '50% 60%',
            position:          'relative',
          }}
        >
          <div style={{
            position:      'absolute',
            width:         600,
            height:        500,
            borderRadius:  '50%',
            background:    `radial-gradient(ellipse at center, ${
              hoveredId
                ? (PROJECTS.find(p => p.id === hoveredId)?.color ?? ACCENT) + '14'
                : 'rgba(0,170,255,0.05)'
            } 0%, transparent 70%)`,
            transition:    'background 0.6s ease',
            pointerEvents: 'none',
            left:          '50%',
            transform:     'translateX(-50%)',
          }} />

          <div style={{
            position:       'relative',
            width:          340,
            height:         440,
            transformStyle: 'preserve-3d',
          }}>
            {PROJECTS.map((p, i) => {
              const f        = FAN_CONFIGS[i]
              const isActive = hoveredId === p.id
              return (
                <div
                  key={p.id}
                  ref={el => cardsRef.current[i] = el}
                  onClick={() => setSelectedProject(p)}
                  onMouseEnter={() => setHoveredId(p.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    position:       'absolute',
                    inset:          0,
                    borderRadius:   14,
                    overflow:       'hidden',
                    transformStyle: 'preserve-3d',
                    transform:      `
                      translateX(${isActive ? f.x * 1.08 : f.x}px)
                      translateY(${isActive ? f.y - 28 : f.y}px)
                      translateZ(${f.z}px)
                      rotateY(${f.rotY}deg)
                      rotateZ(${f.rotZ}deg)
                      scale(${isActive ? f.scale * 1.08 : f.scale})
                    `,
                    transition: 'transform 0.45s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease, border-color 0.4s ease',
                    border:     `1px solid ${isActive ? '#00aaff' : 'rgba(255,255,255,0.1)'}`, 
                    boxShadow:  isActive
                      ? `0 20px 60px rgba(0,0,0,0.15)`
                      : '0 10px 40px rgba(0,0,0,0.05)',
                    cursor:     'pointer',
                    zIndex:     isActive ? 10 : i,
                    background: '#0a0a0a'
                  }}
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    style={{
                      width:      '100%',
                      height:     '100%',
                      objectFit:  'cover',
                      opacity:    isActive ? 1 : 0.8,
                      filter:     isActive ? 'none' : 'brightness(0.9) grayscale(20%)',
                      transition: 'opacity 0.4s ease, filter 0.4s ease',
                    }}
                  />

                  <div style={{
                    position:   'absolute',
                    bottom:     0,
                    left:       0,
                    right:      0,
                    padding:    '28px 22px',
                    background: 'linear-gradient(to top, rgba(10,15,25,0.95) 0%, rgba(10,15,25,0) 100%)', // Dark gradient
                    opacity:    isActive ? 1 : 0,
                    transform:  isActive ? 'translateY(0)' : 'translateY(12px)',
                    transition: 'opacity 0.4s ease, transform 0.4s ease',
                  }}>
                    <p style={{
                      fontFamily:    "'Space Mono', monospace",
                      fontSize:      9,
                      color:         '#00aaff', 
                      letterSpacing: '0.25em',
                      textTransform: 'uppercase',
                      margin:        '0 0 6px',
                    }}>
                      {p.category} — {p.year}
                    </p>
                    <h3 style={{
                      fontFamily:    "'Black Ops One', cursive",
                      fontSize:      20,
                      color:         '#e8edf2', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      margin:        '0 0 10px',
                    }}>
                      {p.title}
                    </h3>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {p.tags.map(t => (
                        <span key={t} style={{
                          fontFamily:    "'Space Mono', monospace",
                          fontSize:      8,
                          padding:       '3px 9px',
                          border:        `1px solid #00aaff`, 
                          borderRadius:  99,
                          color:         '#0a0a0a', 
                          background:    '#00aaff', 
                          letterSpacing: '0.1em',
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{
                    position:    'absolute',
                    top:         14,
                    right:       14,
                    width:       20,
                    height:      20,
                    borderTop:   `1.5px solid #ff3366`, 
                    borderRight: `1.5px solid #ff3366`, 
                    opacity:     isActive ? 1 : 0.3,
                    transition:  'opacity 0.4s ease',
                  }} />

                  <div style={{
                    position:      'absolute',
                    top:           14,
                    left:          16,
                    fontFamily:    "'Space Mono', monospace",
                    fontSize:      9,
                    letterSpacing: '0.3em',
                    color:         isActive ? '#00aaff' : 'rgba(255,255,255,0.4)', 
                    textTransform: 'uppercase',
                    transition:    'color 0.35s ease',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Hover hint */}
          <div style={{
            position:      'absolute',
            bottom:        32,
            left:          '50%',
            transform:     'translateX(-50%)',
            fontFamily:    "'Space Mono', monospace",
            fontSize:      9,
            letterSpacing: '0.3em',
            color:         'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            whiteSpace:    'nowrap',
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
