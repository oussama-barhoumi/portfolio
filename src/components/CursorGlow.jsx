/**
 * CursorGlow — three-layer blue neon cursor
 *
 * Layers (bottom → top):
 *   halo  140 px  opacity ~0.08  lerp 0.06  (slow atmosphere)
 *   ring   60 px  opacity ~0.42  lerp 0.10  (mid-range glow)
 *   dot    12 px  opacity ~0.90  no lerp    (exact precision)
 *
 * Hover  (a, button, [data-cursor])  → dot 2×, ring 1.5×, halo 1.3×, brighter blue
 * Click  (mousedown)                 → dot collapses to 0.6× then springs back
 *
 * All positions update via RAF — zero CSS transition on translate.
 * Scale is JS-lerped (no layout reflow).
 * mix-blend-mode: screen → glows naturally over any dark background.
 */

import { useEffect, useRef } from 'react'

// ─── Palette ──────────────────────────────────────────────────────────────────

const CLR_ACCENT = '0,170,255'   // #00aaff
const CLR_BRIGHT = '51,187,255'  // #33bbff

const radial = (rgb, a0, a1 = 0) =>
  `radial-gradient(circle, rgba(${rgb},${a0}) 0%, rgba(${rgb},${a1}) 50%, transparent 72%)`

// ─── useCursor hook ───────────────────────────────────────────────────────────
// Exposes shared hover/click refs so other components can read cursor state
// without subscribing to DOM events themselves.

export function useCursor() {
  const hovered  = useRef(false)
  const clicking = useRef(false)

  useEffect(() => {
    const onOver = (e) => {
      hovered.current = !!e.target.closest('a, button, [data-cursor]')
    }
    const onDown = () => { clicking.current = true  }
    const onUp   = () => { clicking.current = false }

    window.addEventListener('mouseover',  onOver)
    window.addEventListener('mousedown',  onDown)
    window.addEventListener('mouseup',    onUp)

    return () => {
      window.removeEventListener('mouseover',  onOver)
      window.removeEventListener('mousedown',  onDown)
      window.removeEventListener('mouseup',    onUp)
    }
  }, [])

  return { hovered, clicking }
}

// ─── CursorGlow component ─────────────────────────────────────────────────────

export default function CursorGlow() {
  const dotRef  = useRef()
  const ringRef = useRef()
  const haloRef = useRef()

  useEffect(() => {
    // Hide system cursor site-wide
    document.documentElement.style.cursor = 'none'

    // Live cursor position (no lag — dot tracks this exactly)
    const cur = { x: -200, y: -200 }
    // Trailing positions for ring / halo
    const ring = { x: -200, y: -200 }
    const halo = { x: -200, y: -200 }
    // JS-lerped scale values — updated every frame
    const sc = { dot: 1, ring: 1, halo: 1 }
    // State flags
    let hovered  = false
    let clicking = false

    const lerp = (a, b, t) => a + (b - a) * t

    // ── Event listeners ───────────────────────────────────────────────────────

    const onMove = (e) => {
      cur.x    = e.clientX
      cur.y    = e.clientY
      hovered  = !!e.target.closest('a, button, [data-cursor]')
    }
    const onDown = () => { clicking = true  }
    const onUp   = () => { clicking = false }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup',   onUp)

    // ── RAF loop ──────────────────────────────────────────────────────────────

    let raf

    const tick = () => {
      // Trailing positions — ring and halo lag behind cursor
      ring.x = lerp(ring.x, cur.x, 0.10)
      ring.y = lerp(ring.y, cur.y, 0.10)
      halo.x = lerp(halo.x, cur.x, 0.06)
      halo.y = lerp(halo.y, cur.y, 0.06)

      // Target scales
      const tDot  = clicking ? 0.6 : hovered ? 2.0 : 1.0
      const tRing = hovered  ? 1.5 : 1.0
      const tHalo = hovered  ? 1.3 : 1.0

      // Lerp toward targets — clicking uses faster factor for snappy collapse
      sc.dot  = lerp(sc.dot,  tDot,  clicking ? 0.35 : 0.14)
      sc.ring = lerp(sc.ring, tRing, 0.12)
      sc.halo = lerp(sc.halo, tHalo, 0.08)

      const ds = sc.dot.toFixed(3)
      const rs = sc.ring.toFixed(3)
      const hs = sc.halo.toFixed(3)

      // ── Dot — follows cursor exactly, no position lerp ───────────────────
      if (dotRef.current) {
        const rgb = hovered ? CLR_BRIGHT : CLR_ACCENT
        dotRef.current.style.transform  = `translate(${cur.x - 6}px,${cur.y - 6}px) scale(${ds})`
        dotRef.current.style.background = radial(rgb, hovered ? 0.95 : 0.90, hovered ? 0.40 : 0.28)
      }

      // ── Ring — soft glow, lerp 0.10 ──────────────────────────────────────
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.x - 30}px,${ring.y - 30}px) scale(${rs})`
      }

      // ── Halo — wide atmosphere, lerp 0.06 ────────────────────────────────
      if (haloRef.current) {
        haloRef.current.style.transform = `translate(${halo.x - 70}px,${halo.y - 70}px) scale(${hs})`
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup',   onUp)
      document.documentElement.style.cursor = ''
    }
  }, [])

  const base = {
    position:      'fixed',
    top:           0,
    left:          0,
    borderRadius:  '50%',
    pointerEvents: 'none',
    zIndex:        9999,
    mixBlendMode:  'screen',
    willChange:    'transform',
  }

  return (
    <>
      {/* ── Halo — widest, atmosphere layer, slowest trail ─────────────────── */}
      <div
        ref={haloRef}
        style={{
          ...base,
          width:      140,
          height:     140,
          background: radial(CLR_ACCENT, 0.08, 0.02),
        }}
      />

      {/* ── Ring — mid glow, trailing ────────────────────────────────────────── */}
      <div
        ref={ringRef}
        style={{
          ...base,
          width:      60,
          height:     60,
          background: radial(CLR_ACCENT, 0.42, 0.12),
        }}
      />

      {/* ── Dot — sharp precision, exact cursor position ─────────────────────── */}
      <div
        ref={dotRef}
        style={{
          ...base,
          width:      12,
          height:     12,
          background: radial(CLR_ACCENT, 0.90, 0.28),
        }}
      />
    </>
  )
}
