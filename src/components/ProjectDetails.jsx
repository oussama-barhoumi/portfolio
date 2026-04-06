import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

const ProjectDetails = ({ project, onClose }) => {
  const containerRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    if (!project) return

    const tl = gsap.timeline()
    tl.fromTo(containerRef.current,
      { opacity: 0, backdropFilter: 'blur(0px)' },
      { opacity: 1, backdropFilter: 'blur(20px)', duration: 0.4, ease: 'power2.out' }
    )
    tl.fromTo(contentRef.current,
      { opacity: 0, scale: 0.95, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'expo.out' },
      '-=0.2'
    )
  }, [project])

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: onClose })
    tl.to(contentRef.current, { opacity: 0, scale: 0.95, y: 10, duration: 0.3, ease: 'power2.in' })
    tl.to(containerRef.current, { opacity: 0, backdropFilter: 'blur(0px)', duration: 0.3, ease: 'power2.in' }, '-=0.2')
  }

  // Prevent scroll when open
  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [project])

  if (!project) return null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999, // Needs to be above everything, including WorksPage (z: 200)
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(5, 7, 10, 0.85)', // BG color
        padding: '2rem',
      }}
      onClick={handleClose}
    >
      <div
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 900,
          background: 'rgba(10, 15, 25, 0.7)',
          border: `1px solid ${project.color}55`,
          borderRadius: 24,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${project.color}33`,
          position: 'relative'
        }}
      >
        {/* Header Image */}
        <div style={{ height: 320, position: 'relative', overflow: 'hidden' }}>
          <img 
            src={project.image} 
            alt={project.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,15,25,1), transparent)' }} />
          
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.3s, transform 0.3s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = project.color; e.currentTarget.style.transform = 'scale(1.1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.transform = 'scale(1)' }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '0 48px 48px', marginTop: -60, position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
            <div>
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: project.color, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
                {project.category} // {project.year}
              </p>
              <h2 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 48, color: '#e8edf2', textTransform: 'uppercase', margin: 0, letterSpacing: '0.04em' }}>
                {project.title}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            {/* Left Column: Resume */}
            <div style={{ flex: '1 1 400px' }}>
              <h4 style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#fff', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                Project Resume
              </h4>
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: '#e8edf2', lineHeight: 1.8, opacity: 0.9 }}>
                {project.resume}
              </p>
            </div>

            {/* Right Column: Details */}
            <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: 32 }}>
              
              <div>
                <h4 style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#fff', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                  Tech Stack
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {project.techStack.map(tech => (
                    <span key={tech} style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 11,
                      padding: '6px 14px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 4,
                      color: '#e8edf2',
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#fff', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                  Time Spent
                </h4>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, borderBottom: `2px solid ${project.color}55`, paddingBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>⏱</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 18, color: '#e8edf2', fontWeight: 'bold' }}>
                    {project.timeSpent}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default ProjectDetails
