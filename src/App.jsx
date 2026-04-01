import Home from './pages/home'
import GlobalBackground from './components/GlobalBackground'
import CursorGlow from './components/CursorGlow'

function App() {
  return (
    <>
      {/* Fixed atmospheric canvas — z-0, behind everything */}
      <GlobalBackground />
      {/* Three-layer blue neon cursor — site-wide, z-9999 */}
      <CursorGlow />
      {/* z-index: 1 creates a stacking context above GlobalBackground (z-0)
          so all page sections (transparent or opaque) render correctly on top */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Home />
      </main>
    </>
  )
}

export default App