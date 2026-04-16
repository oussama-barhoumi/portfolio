import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ACCENT, BG } from '../constant/theme'

gsap.registerPlugin(ScrollTrigger)

const ContactSection = () => {
  const contactRef = useRef(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error' | null

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    // Mock fetch API call
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus('success')
      e.target.reset() // clear form
      
      // Clear success message after 3s
      setTimeout(() => setSubmitStatus(null), 3000)
    }, 1500)
  }

  useEffect(() => {
    const el = contactRef.current
    if (!el) return

    gsap.fromTo(
      el.querySelectorAll('.reveal-item'),
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          once: true,
        }
      }
    )
  }, [])

  return (
    <section
      ref={contactRef}
      id="contact"
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#050a0f', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10,
        padding: '100px 0',
      }}
    >
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.02) 2px,rgba(255,255,255,0.02) 4px)`,
      }} />
      <div aria-hidden style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 700, height: 700, borderRadius: '50%', pointerEvents: 'none',
        background: `radial-gradient(circle,rgba(0,170,255,0.05) 0%,transparent 70%)`,
      }} />

      <div style={{ maxWidth: 560, width: '90%', position: 'relative', zIndex: 2 }}>
        <p className="reveal-item" style={{
          fontFamily: "'Space Mono', monospace", fontSize: 9,
          letterSpacing: '0.35em', color: '#00aaff', 
          textTransform: 'uppercase', marginBottom: 16,
        }}>
        // get in touch
        </p>

        <h2 className="reveal-item" style={{
          fontFamily: "'Black Ops One', cursive",
          fontSize: 'clamp(32px,6vw,64px)',
          color: '#e8edf2', 
          textTransform: 'uppercase',
          letterSpacing: '0.04em', marginBottom: 40, lineHeight: 1.1,
        }}>
          Let's Work<br />
          <span style={{
            color: '#00aaff', 
            textShadow: `0 0 30px rgba(0,170,255,0.15)`, 
          }}>Together.</span>
        </h2>

        <div style={{
          width: 48, height: 1, marginBottom: 32,
          background: `linear-gradient(90deg,transparent,#00aaff,transparent)`, 
        }} />

        <form onSubmit={handleSubmit} className="reveal-item">
          {[['user_name', 'Your Name', 'text'], ['user_email', 'Your Email', 'email']].map(([name, ph, type]) => (
            <input required key={name} name={name} type={type} placeholder={ph} style={{
              display: 'block', width: '100%',
              background: '#0a0a0a', 
              border: `1px solid rgba(0,170,255,0.3)`, 
              borderRadius: 8, padding: '15px 20px',
              fontFamily: "'Space Mono', monospace", fontSize: 12,
              color: '#e8edf2', marginBottom: 14, 
              outline: 'none', letterSpacing: '0.05em',
              boxSizing: 'border-box',
              transition: 'border-color 0.25s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#00aaff'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,170,255,0.3)'}
            />
          ))}
          <textarea required name="message" placeholder="Your Message" rows={5} style={{
            display: 'block', width: '100%',
            background: '#0a0a0a', 
            border: `1px solid rgba(0,170,255,0.3)`, 
            borderRadius: 8, padding: '15px 20px',
            fontFamily: "'Space Mono', monospace", fontSize: 12,
            color: '#e8edf2', marginBottom: 28, resize: 'vertical', 
            outline: 'none', letterSpacing: '0.05em',
            boxSizing: 'border-box',
            transition: 'border-color 0.25s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#00aaff'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,170,255,0.3)'}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            onMouseEnter={e => !isSubmitting && gsap.to(e.currentTarget, { background: '#cc0044', borderColor: '#cc0044', scale: 1.02, duration: 0.3 })} 
            onMouseLeave={e => !isSubmitting && gsap.to(e.currentTarget, { background: '#ff3366', borderColor: '#ff3366', scale: 1, duration: 0.3 })} 
            style={{
              width: '100%', padding: '16px',
              background: submitStatus === 'success' ? '#00cc88' : '#ff3366', 
              border: `1.5px solid ${submitStatus === 'success' ? '#00cc88' : '#ff3366'}`, 
              color: '#0a0a0a', fontFamily: "'Space Mono', monospace",
              fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase',
              cursor: isSubmitting ? 'not-allowed' : 'pointer', borderRadius: 8,
              boxShadow: submitStatus === 'success' ? `0 8px 30px rgba(0,204,136,0.2)` : `0 8px 30px rgba(255,51,102,0.3)`,
              transition: 'all 0.4s ease', opacity: isSubmitting ? 0.7 : 1
            }}
            data-cursor
          >
            {isSubmitting ? 'Sending...' : submitStatus === 'success' ? '✓ Message Sent!' : 'Send Message →'}
          </button>
        </form>

        <div className="reveal-item" style={{
          display: 'flex', justifyContent: 'center', marginTop: 40, gap: 32,
          fontFamily: "'Space Mono',monospace", fontSize: 9,
          letterSpacing: '0.3em', color: 'rgba(255,255,255,0.35)', 
          textTransform: 'uppercase',
        }}>
          <span style={{cursor: 'pointer'}} data-cursor>Twitter</span>
          <span style={{cursor: 'pointer'}} data-cursor>GitHub</span>
          <span style={{cursor: 'pointer'}} data-cursor>LinkedIn</span>
        </div>
      </div>
    </section>
  )
}

export default React.memo(ContactSection)
