import React, { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'

import logoUrl from '../constant/logopro.png'

const NAV_LINKS = [
  { label: 'Home', id: 'hero' },
  { label: 'Works', id: 'works' },
  { label: 'Tech Stack', id: 'tech' },
  { label: 'Contact', id: 'contact' },
]

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const mobileMenuRef = useRef(null)

  // 1. Scroll effect for blurring navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 2. IntersectionObserver for active link highlighting
  useEffect(() => {
    const sections = NAV_LINKS.map(link => document.getElementById(link.id)).filter(Boolean)
    
    // We check intersections around the upper-middle part of the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry currently intersecting the most or closest to top
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )

    sections.forEach(sec => observer.observe(sec))
    return () => observer.disconnect()
  }, [])

  // 3. GSAP height tween for mobile menu
  useEffect(() => {
    if (!mobileMenuRef.current) return

    if (mobileMenuOpen) {
      gsap.to(mobileMenuRef.current, {
        height: 'auto',
        opacity: 1,
        duration: 0.4,
        ease: 'power3.out',
        display: 'flex'
      })
    } else {
      gsap.to(mobileMenuRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          gsap.set(mobileMenuRef.current, { display: 'none' })
        }
      })
    }
  }, [mobileMenuOpen])

  // Handle smooth scroll clicks
  const scrollToSection = (id) => {
    setMobileMenuOpen(false)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Common UI styles
  const styles = {
    navLink: (isActive) => ({
      fontFamily: "'Space Mono', monospace",
      fontSize: 11,
      color: isActive ? '#00aaff' : 'rgba(232,237,242,0.6)',
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      cursor: 'pointer',
      transition: 'color 0.3s ease',
      borderBottom: isActive ? '1px solid #00aaff' : '1px solid transparent',
      paddingBottom: 2
    }),
  }

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 500,
          padding: '24px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.4s ease',
          background: isScrolled ? 'rgba(5, 10, 15, 0.7)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
          borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
        }}
      >
        <div 
          onClick={() => scrollToSection('hero')}
          style={{ 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <img 
            src={logoUrl} 
            alt="Logo" 
            style={{ 
              height: 32, 
              width: 'auto', 
              objectFit: 'contain'
            }} 
            data-cursor 
          />
        </div>

        {/* Desktop Links */}
        <div style={{ display: 'flex', gap: 32 }} className="hidden md:flex">
          {NAV_LINKS.map(link => (
            <span
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              onMouseEnter={(e) => {
                if (activeSection !== link.id) e.currentTarget.style.color = '#e8edf2'
              }}
              onMouseLeave={(e) => {
                if (activeSection !== link.id) e.currentTarget.style.color = 'rgba(232,237,242,0.6)'
              }}
              style={styles.navLink(activeSection === link.id)}
            >
              {link.label}
            </span>
          ))}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden flex flex-col justify-center gap-[5px] bg-transparent border-none cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ zIndex: 501 }}
        >
          <div style={{ width: 24, height: 2, background: '#e8edf2', transition: 'all 0.3s', transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <div style={{ width: 24, height: 2, background: '#e8edf2', transition: 'all 0.3s', opacity: mobileMenuOpen ? 0 : 1 }} />
          <div style={{ width: 24, height: 2, background: '#e8edf2', transition: 'all 0.3s', transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div
        ref={mobileMenuRef}
        style={{
          position: 'fixed',
          top: isScrolled ? 70 : 80,
          left: 0, right: 0,
          background: 'rgba(5, 10, 15, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          zIndex: 499,
          display: 'none', // Overridden by GSAP
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px 0',
          gap: 24,
          height: 0,
          overflow: 'hidden'
        }}
      >
        {NAV_LINKS.map(link => (
          <span
            key={link.id}
            onClick={() => scrollToSection(link.id)}
            style={styles.navLink(activeSection === link.id)}
          >
            {link.label}
          </span>
        ))}
      </div>
    </>
  )
}

export default React.memo(Navbar)
