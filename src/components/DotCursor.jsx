import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ACCENT } from '../constant/theme'

const DotCursor = () => {
  const dotRef  = useRef()
  const ringRef = useRef()

  useEffect(() => {
    document.body.style.cursor = 'none'

    const onMove = (e) => {
      gsap.set(dotRef.current, { x: e.clientX, y: e.clientY })
      gsap.to(ringRef.current, {
        x: e.clientX, y: e.clientY,
        duration: 0.18, ease: 'power2.out'
      })
    }

    const onDown = () => gsap.to(ringRef.current, {
      scale: 0.6, duration: 0.15
    })
    const onUp = () => gsap.to(ringRef.current, {
      scale: 1, duration: 0.25, ease: 'back.out(2)'
    })

    const onMouseOver = (e) => {
      if (e.target.closest('a, button, [data-cursor]')) {
        gsap.to(ringRef.current, {
          scale: 2.5, borderColor: '#ffffff',
          duration: 0.3, ease: 'power2.out'
        })
      }
    }

    const onMouseOut = (e) => {
      if (e.target.closest('a, button, [data-cursor]')) {
        gsap.to(ringRef.current, {
          scale: 1, borderColor: `${ACCENT}99`,
          duration: 0.3
        })
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('mouseover', onMouseOver)
    window.addEventListener('mouseout', onMouseOut)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mouseover', onMouseOver)
      window.removeEventListener('mouseout', onMouseOut)
      document.body.style.cursor = 'auto'
    }
  }, [])

  return (
    <>
      <div ref={dotRef} style={{
        position: 'fixed', zIndex: 10000,
        width: 5, height: 5,
        borderRadius: '50%',
        background: ACCENT,
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
        boxShadow: `0 0 6px ${ACCENT}, 0 0 12px ${ACCENT}80`,
      }} />
      <div ref={ringRef} style={{
        position: 'fixed', zIndex: 9999,
        width: 32, height: 32,
        borderRadius: '50%',
        border: `1px solid ${ACCENT}99`,
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
      }} />
    </>
  )
}

export default React.memo(DotCursor)
