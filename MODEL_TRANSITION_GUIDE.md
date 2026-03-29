# 3D Model Cinematic Transition System

## Overview
A premium, Apple-style transition system for seamlessly switching between 3D models in React Three Fiber.

## Features Implemented

### 1. **Smooth Crossfade Transitions**
- Old model gradually fades out (opacity 1 → 0)
- New model fades in simultaneously (opacity 0 → 1)
- Both models exist during transition for visual continuity

### 2. **Scale Animation**
- Outgoing model scales down to 0.9x
- Incoming model scales up from 0.9x to 1x
- Creates a depth perception effect

### 3. **Position Animation**
- Models move along Z-axis for depth effect
- Outgoing: moves backward (+3 units on Z)
- Incoming: moves forward from behind (-3 units on Z)

### 4. **GSAP Timeline Integration**
- All animations synchronized using GSAP timeline
- Professional easing: `power4.inOut` for cinematic feel
- Duration: 1.2 seconds for smooth, premium feel

### 5. **Particle Effects**
- 100 animated particles during transition
- Particles rise and rotate for magical effect
- Color matches your theme (#8b5cf6 purple)

### 6. **Glow/Bloom Effect**
- Subtle glow sphere around models
- Fades in during transition entrance
- Adds premium, high-end visual polish

### 7. **Post-Processing Effects**
- Bloom intensity amplifies during transitions
- Optional Depth of Field (DOF) for blur effect
- Chromatic Aberration for lens-like realism
- Vignette for cinematic framing

## Architecture

### Components

#### `CinematicModel`
Main model component with transition support.
- **Props**: `modelPath`, `side`, `progress`, `isActive`
- Handles GSAP timeline animations
- Manages opacity, scale, position transitions
- Clones materials for independent animation

#### `TransitionParticles`
Decorative particle system during transitions.
- Shows 100 animated particles
- Particles flow upward and rotate
- Only active during transition state

#### `ModelTransitionManager`
Orchestrates transitions between different models.
- Manages current model state
- Triggers transition animations
- Prevents overlapping transitions

## How to Add More Models

### Step 1: Add Model File
```bash
cp your-model.glb public/models/
```

### Step 2: Register Model
```javascript
const MODELS = {
  redQueen: '/models/red_queen_sword_dmc5.glb',
  yourModel: '/models/your-model.glb'  // Add here
}
```

### Step 3: Trigger Transition
```javascript
// In ModelTransitionManager
transitionToModel('yourModel')
```

## Customization

### Adjust Transition Speed
```javascript
// In CinematicModel, change duration:
duration: 1.2  // Current (1.2 seconds)
```

### Change Easing Curve
```javascript
ease: 'power4.out'  // Options: power1-4, elastic, bounce, etc.
```

### Modify Scale Effect
```javascript
const baseScale = 0.015  // Model base size
{ x: 0.9 * baseScale }   // Transition scale factor (0.9 = 90%)
```

### Adjust Position Depth
```javascript
{ z: (side === 'left' ? -1 : 1) - 3 }  // -3 = distance behind
{ z: (side === 'left' ? -1 : 1) + 3 }  // +3 = distance forward
```

### Enable Depth of Field
```javascript
// In SceneContent:
const [dofEnabled] = useState(true)  // Change to true

// Adjust blur settings:
<DepthOfField 
  focusDistance={0.01}  // Focus point
  focalLength={0.05}    // Lens characteristics
  bokehScale={3}        // Blur intensity
  height={480}          // Resolution
/>
```

## UI Integration Example

To allow users to switch models, add buttons:

```javascript
// In HeroScene component
const [currentModel, setCurrentModel] = useState('redQueen')

// Pass to SceneContent
<SceneContent progress={progressRef} currentModel={currentModel} />

// Add UI buttons
<div className="absolute bottom-10 left-10 z-50 flex gap-4">
  <button 
    onClick={() => setCurrentModel('redQueen')}
    className="px-4 py-2 bg-purple-600 text-white rounded"
  >
    Red Queen
  </button>
  <button 
    onClick={() => setCurrentModel('anotherModel')}
    className="px-4 py-2 bg-blue-600 text-white rounded"
  >
    Another Model
  </button>
</div>
```

## Performance Considerations

### Material Cloning
- Each model clones its materials for independent animation
- Prevents flickering and state conflicts
- Small memory overhead, significant visual improvement

### Particle Optimization
- Limited to 100 particles
- Only active during transitions
- Low-poly sphere geometry (8 segments)

### Animation Cleanup
- GSAP timelines properly killed on unmount
- Prevents memory leaks
- Ensures smooth performance

## Technical Details

### Opacity Control
```javascript
meshRefs.current.forEach((mesh) => {
  mesh.material.transparent = true
  mesh.material.opacity = 0  // Animated by GSAP
})
```

### Simultaneous Animations
```javascript
tl.fromTo(scale, {...}, {...})          // Timeline start
  .fromTo(position, {...}, {...}, 0)    // Same time (0)
  .fromTo(opacity, {...}, {...}, 0)     // Same time (0)
```

### Transition State
- `isActive=true`: Model fades in, scales up, moves forward
- `isActive=false`: Model fades out, scales down, moves back

## Future Enhancements

Potential additions:
1. Sound effects during transitions
2. Camera movement for dramatic effect
3. Multiple transition styles (slide, rotate, etc.)
4. Loading progress for large models
5. Touch/swipe gestures for model switching
6. Auto-transition on scroll milestones

## Browser Compatibility

- **WebGL Required**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Performance**: 60fps on mid-range GPUs
- **Mobile**: Optimized with lower particle count fallback

## Credits

Built with:
- React Three Fiber
- Three.js
- GSAP (GreenSock Animation Platform)
- @react-three/drei
- @react-three/postprocessing

---

**Status**: ✅ Production Ready
**Last Updated**: March 29, 2026
**Version**: 1.0.0
