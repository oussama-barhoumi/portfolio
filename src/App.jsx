import React, { useEffect, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
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
import WorksFullPage from './pages/works/WorksFullPage'

const TokyoHero = React.lazy(() => import('./components/TokyoHero'))

gsap.registerPlugin(ScrollTrigger)

const HomePage = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    })
    const lenisRaf = (time) => { lenis.raf(time * 1000) }
    gsap.ticker.add(lenisRaf)
    gsap.ticker.lagSmoothing(0)
    setTimeout(() => { ScrollTrigger.refresh(); ScrollTrigger.sort() }, 300)
    return () => { gsap.ticker.remove(lenisRaf); lenis.destroy() }
  }, [])

  return (
    <>
      <GlobalBackground />
      <Navbar />
      <DotCursor />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <section id="hero"><HeroScene /></section>
        <TextRevealSection />
        <TreeSection />
        <section id="works"><WorksSection /></section>
        <section id="tech"><TechBubbles /></section>
        <Suspense fallback={null}><TokyoHero /></Suspense>
      </main>
    </>
  )
}

const App = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/works" element={<WorksFullPage />} />
  </Routes>
)

export default App