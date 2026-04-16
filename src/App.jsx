import React, { useEffect, Suspense } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'
import Lenis from '@studio-freight/lenis'

import Navbar from './components/Navbar'
import DotCursor from './components/DotCursor'
import HeroScene from './components/HeroScene'
import TextRevealSection from './components/TextRevealSection'
import TreeSection from './components/TreeSection'
import WorksSection from './components/WorksSection'
import TechBubbles from './components/TechBubbles'
import GlobalBackground from './components/GlobalBackground'
import ContactSection from './components/ContactSection'

const TokyoHero = React.lazy(() => import('./components/TokyoHero'))

// Register plugins once at the top
gsap.registerPlugin(ScrollTrigger)

const App = () => {
  useEffect(() => {
    // Lenis smooth scroll setup
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    })

    const lenisRaf = (time) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(lenisRaf)
    gsap.ticker.lagSmoothing(0)

    // Scroll trigger refresh
    setTimeout(() => {
      ScrollTrigger.refresh()
      ScrollTrigger.sort()
    }, 300)

    return () => {
      gsap.ticker.remove(lenisRaf)
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <GlobalBackground />
      <Navbar />
      <DotCursor />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <section id="hero">
          <HeroScene />
        </section>
        <TextRevealSection />
        <TreeSection />
        <section id="works">
          <WorksSection />
        </section>
        <section id="tech">
          <TechBubbles />
        </section>
        <Suspense fallback={null}>
          <TokyoHero />
        </Suspense>
        <ContactSection />
      </main>
    </>
  )
}

export default App