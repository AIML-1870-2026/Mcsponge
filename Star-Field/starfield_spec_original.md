# Starfield Particle System - Specification Document

## Project Overview
An interactive web-based starfield particle system where white particle dots radiate outward from the center of the screen against a black background. Users can control various properties of the particle system through interactive sliders.

## Visual Design

### Layout
- **Background**: Pure black (#000000)
- **Particles**: White dots (#FFFFFF)
- **Canvas**: Full-screen, responsive to window size
- **Controls Panel**: Fixed position on the left side of the screen

### Particle Behavior
- **Origin**: All particles spawn from the center of the screen
- **Movement**: Particles move outward in random directions (360° radially)
- **Trail Effect**: Particles leave trails behind them (length controllable via slider)
- **Lifecycle**: Particles respawn at center when they exit the screen boundaries

## Interactive Controls

The website should feature four sliders that allow real-time adjustment of particle properties:

### 1. Trail Length Slider
- **Purpose**: Controls how long the particle trails appear
- **Range**: 0 (no trail, just dots) to 100 (long trails)
- **Effect**: Adjusts the opacity fade/trail rendering of particle paths
- **Default**: 50 (medium trail length)

### 2. Speed Slider
- **Purpose**: Controls how fast particles move outward from center
- **Range**: 1 (very slow) to 100 (very fast)
- **Effect**: Multiplies the velocity of all particles
- **Default**: 50 (medium speed)

### 3. Particle Count Slider
- **Purpose**: Controls the total number of active particles
- **Range**: 10 (sparse) to 1000 (dense)
- **Effect**: Adds or removes particles from the system dynamically
- **Default**: 200 particles

### 4. Spawn Radius Slider
- **Purpose**: Controls the radius from the center point where particles initially spawn
- **Range**: 0 (exact center point) to 100 pixels (circular area)
- **Effect**: Creates variation in spawn position - higher values make particles appear from a larger circular area around the center
- **Default**: 0 (all spawn from exact center)

## Technical Requirements

### Core Technologies
- **HTML5 Canvas** for rendering particles and trails
- **Vanilla JavaScript** for particle system logic and animation
- **CSS3** for styling controls and layout
- **RequestAnimationFrame** for smooth 60fps animation

### Particle System Logic

#### Particle Properties
Each particle should have:
- Position (x, y coordinates)
- Velocity (direction and speed)
- Trail history (array of previous positions)

#### Animation Loop
1. Clear canvas (with transparency for trail effect)
2. Update particle positions based on velocity
3. Draw particle trails
4. Draw particle dots
5. Check boundaries and respawn particles that exit screen
6. Repeat using requestAnimationFrame

#### Trail Implementation
Trails can be achieved by:
- **Option A**: Drawing with partial canvas clearing (leaving ghosting effect)
- **Option B**: Storing position history for each particle and drawing fading lines
- Trail length slider adjusts either opacity of ghosting or number of history points rendered

### Performance Considerations
- Optimize for 60fps with up to 1000 particles
- Use efficient canvas drawing methods
- Consider throttling slider updates to avoid performance issues
- Implement particle pooling to avoid constant object creation/destruction

## User Interface

### Controls Panel Design
```
┌─────────────────────────────────────┐
│ Starfield Controls                  │
├─────────────────────────────────────┤
│ Trail Length:    [====●=====] 50    │
│ Speed:           [====●=====] 50    │
│ Particle Count:  [====●=====] 200   │
│ Spawn Radius:    [●==========] 0    │
└─────────────────────────────────────┘
```

**Position**: Fixed on the left side of the screen
**Alignment**: Vertically centered or positioned near the top-left
**Layout**: Horizontal sliders stacked vertically

### Control Panel Features
- **Position**: Fixed to the left side of the screen (e.g., 20px from left edge)
- **Vertical Position**: Centered vertically or positioned near top
- Semi-transparent dark background for readability
- Real-time value display next to each slider
- Smooth, responsive slider controls
- Optional minimize/maximize button for controls panel
- Styling should not distract from the starfield effect

## Responsive Design
- Canvas should resize to match window dimensions
- Particles should respawn at new center when window resizes
- Controls should remain accessible on mobile devices
- Touch-friendly slider controls for mobile
- Consider vertical layout for controls on mobile devices

## Browser Compatibility
- Modern browsers with Canvas support (Chrome, Firefox, Safari, Edge)
- Fallback message for browsers without Canvas support
- Graceful degradation for older browsers

## Performance Targets
- Maintain 60fps with default settings (200 particles)
- Maintain 30fps+ with maximum particles (1000)
- Smooth slider interaction with no lag
- Efficient memory usage (no memory leaks from particle creation)

## Optional Enhancements (Future Considerations)
- Color picker for particle and background colors
- Particle size slider
- Multiple spawn points option
- Gravity/physics effects toggle
- Save/load preset configurations
- Export as video or animated GIF
- Pause/play button
- Reset to defaults button
- Fullscreen mode toggle

## File Structure
```
starfield-website/
├── index.html          # Main HTML structure
├── css/
│   └── styles.css      # Styling for controls and layout
├── js/
│   ├── particle.js     # Particle class definition
│   ├── starfield.js    # Main particle system logic
│   └── controls.js     # Slider control handlers
└── README.md           # Project documentation
```

## Implementation Notes

### Canvas Setup
- Use full window dimensions: `canvas.width = window.innerWidth`
- Handle window resize events to update canvas size
- Set up 2D rendering context

### Particle Direction Calculation
```javascript
// Random angle in radians (0 to 2π)
const angle = Math.random() * Math.PI * 2;

// Convert to velocity components
const velocity = {
    x: Math.cos(angle) * speed,
    y: Math.sin(angle) * speed
};
```

### Trail Effect Implementation
For optimal visual effect, consider using:
- `globalAlpha` to fade trails
- Previous frame persistence (partial canvas clearing)
- Motion blur effect through opacity layering

### Spawn Radius Implementation
```javascript
// Random position within spawn radius circle
const spawnAngle = Math.random() * Math.PI * 2;
const spawnDistance = Math.random() * spawnRadius;

const spawnX = centerX + Math.cos(spawnAngle) * spawnDistance;
const spawnY = centerY + Math.sin(spawnAngle) * spawnDistance;
```

## Success Criteria
- ✅ Particles radiate smoothly from center of screen
- ✅ All four sliders work in real-time without lag
- ✅ Trail length creates visible effect from 0 to 100
- ✅ Performance remains smooth at default settings
- ✅ Visual aesthetic matches specification (black/white)
- ✅ Responsive design works on desktop and mobile
- ✅ Code is clean, commented, and maintainable

## Testing Checklist
- [ ] Test all slider ranges (min, max, mid values)
- [ ] Test window resize functionality
- [ ] Test on multiple browsers
- [ ] Test on mobile devices (touch controls)
- [ ] Performance test with 1000 particles
- [ ] Visual verification of trail lengths
- [ ] Spawn radius verification at different values
- [ ] Speed verification from slowest to fastest

---

**Version**: 1.0  
**Last Updated**: January 2026  
**Status**: Specification Complete - Ready for Development
