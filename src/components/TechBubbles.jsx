/**
 * TechBubbles — Sticky scroll-pinned tech stack showcase
 *
 * Behavior:
 *  1. Section pins when it hits the top of viewport
 *  2. Each card reveals progressively as user scrolls (scrub timeline)
 *  3. Labels fade in before their row's cards
 *  4. After ALL cards revealed → section unpins, marquees start rolling
 */
import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const CDN = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons'

// ─── Data ─────────────────────────────────────────────────────────────────────
const ROWS = [
  {
    label: 'Frontend',
    accentColor: '#00aaff',
    direction: 'left',
    techs: [
      { name: 'React',         icon: `${CDN}/react/react-original.svg`,             color: '#61dafb' },
      { name: 'Tailwind',      icon: `${CDN}/tailwindcss/tailwindcss-original.svg`, color: '#38bdf8' },
      { name: 'Sass',          icon: `${CDN}/sass/sass-original.svg`,               color: '#f472b6' },
      { name: 'JavaScript',    icon: `${CDN}/javascript/javascript-original.svg`,   color: '#fbbf24' },
      { name: 'GSAP',          icon: null, badge: 'GSAP',     color: '#88cc00' },
      { name: 'Three.js',      icon: `${CDN}/threejs/threejs-original.svg`,         color: '#e8edf2' },
      { name: 'Framer Motion', icon: null, badge: 'FRAMER',   color: '#8b5cf6' },
      { name: 'Anime.js',      icon: null, badge: 'ANIME.JS', color: '#ff3366' },
      { name: 'AOS',           icon: null, badge: 'AOS',      color: '#00aaff' },
    ],
  },
  {
    label: 'Backend',
    accentColor: '#ff3366',
    direction: 'right',
    techs: [
      { name: 'Laravel',    icon: `${CDN}/laravel/laravel-original.svg`,       color: '#fb7185' },
      { name: 'Node.js',    icon: `${CDN}/nodejs/nodejs-original.svg`,         color: '#4ade80' },
      { name: 'Python',     icon: `${CDN}/python/python-original.svg`,         color: '#fbbf24' },
      { name: 'TensorFlow', icon: `${CDN}/tensorflow/tensorflow-original.svg`, color: '#fb923c' },
      { name: 'PyTorch',    icon: `${CDN}/pytorch/pytorch-original.svg`,       color: '#f43f5e' },
    ],
  },
  {
    label: 'Design & 3D',
    accentColor: '#ffcc00',
    direction: 'left',
    techs: [
      { name: 'Figma',         icon: `${CDN}/figma/figma-original.svg`,              color: '#a78bfa' },
      { name: 'Blender',       icon: `${CDN}/blender/blender-original.svg`,          color: '#fb923c' },
      { name: 'Unreal Engine', icon: `${CDN}/unrealengine/unrealengine-original.svg`,color: '#e8edf2' },
    ],
  },
]

const TOTAL_UNIQUE = ROWS.reduce((s, r) => s + r.techs.length, 0) // 17

// ─── Logo Card ────────────────────────────────────────────────────────────────
function LogoCard({ tech }) {
  const cardRef = useRef(null)
  const glowRef = useRef(null)

  const onEnter = () => {
    gsap.to(cardRef.current, { scale: 1.15, y: -8, duration: 0.35, ease: 'power2.out' })
    gsap.to(glowRef.current, { opacity: 1, duration: 0.3 })
  }
  const onLeave = () => {
    gsap.to(cardRef.current, { scale: 1, y: 0, duration: 0.4, ease: 'power2.out' })
    gsap.to(glowRef.current, { opacity: 0, duration: 0.3 })
  }

  return (
    <div
      ref={cardRef}
      data-logocard=""
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        position:      'relative',
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           10,
        padding:       '18px 22px',
        borderRadius:  16,
        background:    'rgba(8,14,24,0.92)',
        border:        `1px solid ${tech.color}30`,
        minWidth:      108,
        flexShrink:    0,
        cursor:        'default',
        willChange:    'transform, opacity',
      }}
    >
      {/* Bloom glow */}
      <div ref={glowRef} style={{
        position:     'absolute', inset: -1, borderRadius: 16,
        opacity:      0, pointerEvents: 'none',
        boxShadow:    `0 0 28px ${tech.color}55, inset 0 0 16px ${tech.color}18`,
        background:   `radial-gradient(ellipse at 50% 130%, ${tech.color}22 0%, transparent 65%)`,
      }} />

      {/* Icon or text badge */}
      {tech.icon ? (
        <img
          src={tech.icon} alt={tech.name} width={36} height={36} loading="lazy"
          style={{
            objectFit:  'contain',
            filter:     `drop-shadow(0 0 5px ${tech.color}88)`,
            position:   'relative', zIndex: 1,
          }}
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
      ) : (
        <span style={{
          fontFamily:    "'Matemasie', sans-serif",
          fontSize:      10, fontWeight: 700,
          letterSpacing: '0.15em', color: tech.color,
          position:      'relative', zIndex: 1,
          minHeight:     36, display: 'flex',
          alignItems:    'center', textAlign: 'center',
        }}>
          {tech.badge}
        </span>
      )}

      {/* Name */}
      <span style={{
        fontFamily:    "'Matemasie', sans-serif",
        fontSize:      8, letterSpacing: '0.22em',
        color:         'rgba(232,237,242,0.5)',
        textTransform: 'uppercase', whiteSpace: 'nowrap',
        position:      'relative', zIndex: 1,
      }}>
        {tech.name}
      </span>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const TechBubbles = () => {
  const sectionRef       = useRef(null)
  const rowRefs          = useRef([])   // one per ROWS entry
  const labelRefs        = useRef([])   // one per ROWS entry

  useLayoutEffect(() => {
    let ctx
    let resizeObs

    const init = () => {
      ctx = gsap.context(() => {

        // ── Collect first-set cards per row ──────────────────────────────────
        // Each marquee track has 4× the cards; we only scrub-reveal the first copy.
        const firstSetPerRow = rowRefs.current.map((rowEl, i) => {
          if (!rowEl) return []
          const all = Array.from(rowEl.querySelectorAll('[data-logocard]'))
          return all.slice(0, ROWS[i].techs.length) // first copy only
        })

        // All first-copy cards flat
        const firstSetAll = firstSetPerRow.flat()

        // ── 1. Hide: first-set cards + labels ────────────────────────────────
        gsap.set(firstSetAll, {
          opacity: 0, scale: 0.6, y: 60,
          filter:  'blur(8px)',
          willChange: 'transform, opacity',
        })
        gsap.set(labelRefs.current.filter(Boolean), { opacity: 0, scale: 0.9 })

        // ── 2. Build reveal timeline (controlled by scrub) ───────────────────
        const tl = gsap.timeline({ paused: true })

        rowRefs.current.forEach((rowEl, i) => {
          if (!rowEl) return
          const label     = labelRefs.current[i]
          const rowCards  = firstSetPerRow[i]
          const row       = ROWS[i]

          // Category label fades + grows in first
          tl.to(label, {
            opacity: 1, scale: 1,
            duration: 0.5, ease: 'power2.out',
          }, i === 0 ? 0 : '+=0.15')

          // Cards stagger in one by one
          tl.to(rowCards, {
            opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
            duration: 0.6,
            stagger:  0.08,
            ease:     'power3.out',
          }, '+=0.12')
        })

        // ── 3. Pin + scrub via ScrollTrigger ─────────────────────────────────
        ScrollTrigger.create({
          trigger:       sectionRef.current,
          start:         'top top',
          end:           () => `+=${TOTAL_UNIQUE * 120}`,
          pin:           true,
          scrub:         1,
          anticipatePin: 1,
          animation:     tl,
          invalidateOnRefresh: true,
        })

      }, sectionRef)

      // ── ResizeObserver ──────────────────────────────────────────────────────
      resizeObs = new ResizeObserver(() => ScrollTrigger.refresh())
      if (sectionRef.current) resizeObs.observe(sectionRef.current)
    }

    // Delay so pinned sections above settle before we measure
    const timer = setTimeout(init, 150)

    return () => {
      clearTimeout(timer)
      ctx?.revert()
      resizeObs?.disconnect()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        position:  'relative',
        width:     '100%',
        minHeight: '100vh',
        padding:   '80px 0 60px',
        zIndex:    10,
        overflow:  'hidden',
      }}
    >
      {/* Top accent */}
      <div style={{
        position:   'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width:      '70%', height: 1,
        background: 'linear-gradient(to right,transparent,rgba(0,170,255,0.55),transparent)',
      }} />

      {/* ── Heading (always visible, not part of reveal) ─────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: 56, padding: '0 24px' }}>
        <p style={{
          fontFamily:    "'Matemasie', sans-serif",
          fontSize:      10, letterSpacing: '0.42em',
          color:         '#00aaff', textTransform: 'uppercase', marginBottom: 14,
        }}>
          // expertise / stack
        </p>
        <h2 style={{
          fontFamily:    "'Matemasie', sans-serif",
          fontSize:      'clamp(26px,4vw,56px)',
          color:         '#e8edf2', textTransform: 'uppercase',
          letterSpacing: '0.03em', lineHeight: 1.08,
        }}>
          Tools &amp; Technologies<br />
          <span style={{ color: '#ff3366' }}>I Work With</span>
        </h2>
      </div>

      {/* ── Tech Rows ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {ROWS.map((row, i) => (
          <div key={row.label} ref={el => rowRefs.current[i] = el}>

            {/* Category label (animated by timeline) */}
            <div
              ref={el => labelRefs.current[i] = el}
              style={{
                display:     'flex', alignItems: 'center', gap: 12,
                marginBottom: 14,
                paddingLeft:  'clamp(20px,6vw,80px)',
              }}
            >
              <div style={{ width: 24, height: 1, background: row.accentColor }} />
              <span style={{
                fontFamily:    "'Matemasie', sans-serif",
                fontSize:      9, letterSpacing: '0.35em',
                color:         row.accentColor, textTransform: 'uppercase',
              }}>
                {row.label}
              </span>
            </div>

            {/* Static card grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, padding: '0 clamp(20px,6vw,80px)' }}>
              {row.techs.map((tech, j) => (
                <LogoCard key={`${tech.name}-${i}-${j}`} tech={tech} />
              ))}
            </div>

          </div>
        ))}
      </div>

      {/* Bottom accent */}
      <div style={{
        position:   'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width:      '70%', height: 1,
        background: 'linear-gradient(to right,transparent,rgba(255,51,102,0.5),transparent)',
      }} />
    </section>
  )
}

export default React.memo(TechBubbles)
