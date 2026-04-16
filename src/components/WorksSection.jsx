import React, { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import logoUrl from '../constant/logopro.png'
import GlitchText from './GlitchText'
import WorksPage from './WorksPage'
import ProjectDetails from './ProjectDetails'
import { ACCENT, BRIGHT, MID, BG } from '../constant/theme'

gsap.registerPlugin(ScrollTrigger)

const PROJECTS = [
  {
    id: 1,
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
    title: 'Project Four',
    category: 'AI Engineering',
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

const WorksSection = () => {
  const [worksOpen, setWorksOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
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
        }
      })

      tl.fromTo(lidRef.current,
        { rotateX: -15 },
        { rotateX: -110, duration: 1, ease: 'power2.inOut' },
        0
      )

      cardRefs.current.forEach((card, i) => {
        tl.to(card, { y: -60, duration: 0.6, ease: 'power2.out' }, 0.2 + i * 0.05)
      })

      tl.to([visualBackRef.current, visualLidRef.current], {
        scale: 0.3,
        x: -window.innerWidth * 0.35,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.inOut',
      }, 1.0)

      const spacing = window.innerWidth * 0.42
      const startX = -(PROJECTS.length - 1) * spacing / 2

      cardRefs.current.forEach((card, i) => {
        tl.to(card, {
          x: startX + i * spacing,
          y: 0,
          rotate: 0,
          width: '38vw',
          minWidth: 420,
          height: '72vh',
          maxHeight: 680,
          top: '50%',
          left: '50%',
          marginLeft: '-19vw',
          marginTop: '-36vh',
          scale: 1,
          duration: 1.4,
          ease: 'expo.inOut',
        }, 1.2 + i * 0.08)

        tl.to(infoRefs.current[i], { opacity: 1, duration: 0.4 }, 2.2)
      })

      tl.to(trackRef.current, {
        x: -(PROJECTS.length - 1) * spacing,
        duration: 2,
        ease: 'none',
      }, 2.5)

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const initialCardStyle = (p, i) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -90,
    marginTop: -60,
    width: 180,
    height: 120,
    transform: `rotate(${(i - 2) * 6}deg) translateY(${i * -4}px)`,
    borderRadius: 16,
    overflow: 'hidden',
    background: '#080c12',
    border: `1px solid ${p.color}44`,
    boxShadow: `0 0 16px ${p.color}22`,
    cursor: 'pointer',
  })

  return (
    <>
      <section
        ref={sectionRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          background: '#0a0a0a', 
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 40,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
            zIndex: 1,
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            zIndex: 10,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            whiteSpace: 'nowrap',
          }}
        >
          <div
            style={{
              width: 40,
              height: 1,
              background: `linear-gradient(90deg, transparent, #00aaff, transparent)`, 
              marginBottom: 4,
            }}
          />
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.35em',
              color: '#00aaff', 
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            // selected works
          </p>
          <div style={{ filter: 'none' }}> {/* Quick trick to invert glitch text to dark */}
            <GlitchText text="WORKS" className="text-5xl md:text-7xl" />
          </div>
        </div>

        <div
          ref={trackRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 320,
              height: 240,
              perspective: 800,
            }}
          >
            <div ref={visualBackRef} style={{ position: 'absolute', inset: 0 }}>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '38%',
                  height: 28,
                  background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                  border: '1.5px solid #00aaff', 
                  borderBottom: 'none',
                  borderRadius: '8px 8px 0 0',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  height: '88%',
                  background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                  border: '1.5px solid #00aaff', 
                  borderRadius: '4px 16px 16px 16px',
                }}
              />
            </div>

            <div ref={visualLidRef} style={{ position: 'absolute', inset: 0 }}>
              <div
                ref={lidRef}
                style={{
                  position: 'absolute',
                  bottom: '87%',
                  width: '100%',
                  height: '88%',
                  background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                  border: '1.5px solid #00aaff', 
                  borderRadius: '4px 16px 16px 16px',
                  transformOrigin: 'bottom center',
                  transform: 'rotateX(-15deg)',
                  zIndex: 60,
                  transformStyle: 'preserve-3d',
                }}
              >
                <img
                  src={logoUrl}
                  alt="Folder"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: 64,
                    opacity: 0.4,
                    filter: 'drop-shadow(0 0 12px rgba(0,170,255,0.4))',
                  }}
                />
              </div>
            </div>
          </div>

          {PROJECTS.map((p, i) => (
            <div
              key={p.id}
              ref={el => cardRefs.current[i] = el}
              onClick={() => setSelectedProject(p)}
              onMouseEnter={() => {
                gsap.to(imgRefs.current[i], { scale: 1.06, opacity: 1, duration: 0.5, ease: 'power2.out' })
                gsap.to(glowRefs.current[i], { opacity: 1, duration: 0.4 })
              }}
              onMouseLeave={() => {
                gsap.to(imgRefs.current[i], { scale: 1.0, opacity: 0.75, duration: 0.5 })
                gsap.to(glowRefs.current[i], { opacity: 0, duration: 0.4 })
              }}
              style={initialCardStyle(p, i)}
            >
              <img
                ref={el => imgRefs.current[i] = el}
                src={p.image}
                alt={p.title}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.75,
                  willChange: 'transform, opacity',
                }}
              />

              <div
                ref={el => glowRefs.current[i] = el}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  boxShadow: `inset 0 0 60px ${p.color}33`,
                  border: `1px solid ${p.color}44`,
                  borderRadius: 16,
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              />

              <div
                ref={el => infoRefs.current[i] = el}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  pointerEvents: 'none',
                  zIndex: 3,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '55%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.88), transparent)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '36px 32px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 9,
                      letterSpacing: '0.3em',
                      color: p.color,
                      textTransform: 'uppercase',
                      margin: '0 0 10px',
                    }}
                  >
                    {p.category} — {p.year}
                  </p>
                  <h3
                    style={{
                      fontFamily: "'Black Ops One', cursive",
                      fontSize: 'clamp(18px,2vw,28px)',
                      color: '#0a0a0a', // Keep bright reading against dark image gradient
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      margin: '0 0 14px',
                      lineHeight: 1.1,
                    }}
                  >
                    {p.title}
                  </h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {p.tags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 9,
                          padding: '5px 12px',
                          border: `1.5px solid ${p.color}`,
                          borderRadius: 99,
                          color: '#0a0a0a',
                          background: p.color,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    width: 28,
                    height: 28,
                    borderTop: `1.5px solid ${p.color}`,
                    borderRight: `1.5px solid ${p.color}`,
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    top: 20,
                    left: 24,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9,
                    letterSpacing: '0.3em',
                    color: '#ffffff',
                    background: `${p.color}88`,
                    padding: '2px 8px',
                    borderRadius: 4,
                    textTransform: 'uppercase',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 32,
            right: 32,
            opacity: 0.65,
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              color: '#00aaff', 
            }}
          >
            Portfolio 2025
          </span>
        </div>

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 28,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 1,
            height: '45vh',
            background: 'rgba(0,170,255,0.12)', 
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '30%',
              background: '#ff3366', 
            }}
          />
        </div>

        <div
          onClick={() => setWorksOpen(true)}
          onMouseEnter={e => {
            gsap.to(e.currentTarget, {
              scale: 1.05,
              y: -5,
              boxShadow: `0 15px 30px rgba(0,0,0,0.15)`,
              borderColor: '#00aaff', 
              duration: 0.4,
              ease: 'back.out(1.5)'
            })
            gsap.to(e.currentTarget.querySelector('.arrow'), { x: 5, backgroundColor: '#ff3366', borderColor: '#ff3366', color: '#0a0a0a', duration: 0.3 })
          }}
          onMouseLeave={e => {
            gsap.to(e.currentTarget, {
              scale: 1,
              y: 0,
              boxShadow: `0 10px 20px rgba(0,0,0,0.05)`,
              borderColor: 'rgba(255,255,255,0.15)',
              duration: 0.4,
              ease: 'power2.out'
            })
            gsap.to(e.currentTarget.querySelector('.arrow'), { x: 0, backgroundColor: 'transparent', borderColor: '#00aaff', color: '#00aaff', duration: 0.3 })
          }}
          style={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 280,
            height: 75,
            background: '#0a0a0a', 
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 12,
            cursor: 'pointer',
            zIndex: 100,
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            overflow: 'hidden',
            boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
          }}
        >

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 4, pointerEvents: 'none' }}>
             <span style={{
               fontFamily: "'Space Mono', monospace",
               fontSize: 9,
               letterSpacing: '0.2em',
               color: '#00aaff', 
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

          <div
            className="arrow"
            style={{
              position: 'relative',
              zIndex: 1,
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: `1px solid #00aaff`, 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00aaff', 
              fontSize: 16,
              transition: 'background-color 0.3s, border-color 0.3s, color 0.3s',
            }}
          >
            →
          </div>

          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 16,
              height: 16,
              borderTop: `1.5px solid #ff3366`, 
              borderRight: `1.5px solid #ff3366`, 
              borderTopRightRadius: 10,
              opacity: 1,
            }}
          />
        </div>

      </section>

      <WorksPage open={worksOpen} onClose={() => setWorksOpen(false)} />

      <ProjectDetails project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  )
}

export default React.memo(WorksSection)
