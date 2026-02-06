# Turing Patterns Explorer

An interactive reaction-diffusion simulation based on the Gray-Scott model. Watch as simple chemical reactions create complex organic patterns like spots, stripes, and spirals.

## Live Demo

[View the simulation](https://aiml-1870-2026.github.io/Mcsponge/Turing-Patterns/)

## Features

### Pattern Presets

| Pattern | Description |
|---------|-------------|
| Spots | Circular dot formations that spread and multiply |
| Stripes | Linear patterns that flow and branch |
| Waves | Pulsing wave-like propagations |
| Maze | Labyrinthine interconnected pathways |
| Spirals | Rotating spiral formations |

### Color Schemes

- **Default (Purple)** - Deep purple gradient
- **Ocean** - Blue-green aquatic tones
- **Fire** - Red to yellow heat gradient
- **Grayscale** - Black and white contrast
- **Rainbow** - Full spectrum color mapping

### Parameters

| Parameter | Description |
|-----------|-------------|
| Feed Rate (F) | Rate at which Chemical A is replenished (0.01 - 0.1) |
| Kill Rate (K) | Rate at which Chemical B is removed (0.03 - 0.07) |
| Speed | Simulation iterations per frame (1 - 30) |

### Mouse Settings

- **Off** - No mouse interaction
- **Brush** - Paint chemicals directly onto the canvas
  - **Chemical A (Substrate)** - Clears patterns, restores base state
  - **Chemical B (Activator)** - Seeds new reaction points
  - **Brush Size** - Adjustable radius (2 - 30)

### Controls

- **Pause/Resume** - Stop or continue the simulation
- **Reset** - Clear the canvas and start fresh with new seeds

## How It Works

The simulation implements the Gray-Scott reaction-diffusion model:

```
A + 2B → 3B  (Reaction)
B → P       (Decay)
```

Two virtual chemicals (A and B) interact on a 2D grid:

1. **Chemical A** (substrate) is continuously fed into the system
2. **Chemical B** (activator) converts A into more B when they meet
3. **B** slowly decays and is removed from the system
4. Both chemicals diffuse (spread) across the grid at different rates

The balance between feed rate, kill rate, and diffusion creates the emergent patterns. Small changes in F and K parameters produce dramatically different results.

## The Science

Turing patterns are named after Alan Turing, who proposed in 1952 that simple chemical reactions could explain biological pattern formation. These same mathematical principles appear in:

- Animal coat patterns (zebra stripes, leopard spots)
- Fingerprints
- Sand dune formations
- Coral structures
- Chemical oscillations

## Technologies

- HTML5 Canvas
- Vanilla JavaScript
- CSS3
