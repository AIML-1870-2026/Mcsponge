# Julia Set Explorer

An interactive fractal explorer for Julia Sets and the Mandelbrot Set. Navigate the complex plane, tweak parameters in real time, and visualize how individual points iterate with Educational Mode.

## Live Demo

[View the explorer](https://aiml-1870-2026.github.io/Mcsponge/Julia-Sets/)

## Features

### Fractal Types

- **Julia Set** — Explore an infinite variety of fractals by adjusting the complex constant C
- **Mandelbrot Set** — The classic fractal that maps the parameter space of all Julia Sets

### Presets

| Preset | C Value | Description |
|--------|---------|-------------|
| Dendrite | 0 + 1i | Tree-like branching structures |
| Spiral | -0.7463 + 0.1102i | Spiraling formations |
| Douady's Rabbit | -0.1228 + 0.7449i | Three-lobed connected Julia Set |
| San Marco | -0.75 + 0i | Cathedral-like symmetric pattern |
| Siegel Disk | -0.391 - 0.587i | Disk-shaped bounded regions |
| Dragons | -0.8 + 0.156i | Dragon-shaped fractal structures |

### Color Schemes

- **Default** — Purple-blue gradient
- **Fire** — Red to yellow heat map
- **Ocean** — Deep blue-green tones
- **Rainbow** — Full spectrum mapping
- **Grayscale** — Black and white contrast

### Controls

**Rendering:**
- Max Iterations (50 - 1000) — Higher values reveal more detail
- Escape Radius (2 - 20) — Threshold for divergence detection

**View:**
- Zoom slider (1x - 1024x, logarithmic)
- Center X / Center Y coordinate inputs
- Reset View button
- Drag to pan, scroll wheel to zoom toward cursor

**Julia Parameters (C = a + bi):**
- Real (a) slider (-2 to 2)
- Imaginary (b) slider (-2 to 2)
- Only visible when Julia Set is selected

### Educational Mode

Click the **Educational Mode** button (top-left) to enter an interactive learning mode:

- Click any point on the fractal to trace its iteration path
- **White dot** marks the starting point z0
- **Red path** indicates the point escaped (diverged)
- **Green path** indicates the point stayed bounded (in the set)
- First 10 iterations are numbered on-screen
- Info panel displays iteration count, final magnitude, and escape status

### Navigation

| Action | Effect |
|--------|--------|
| Click + Drag | Pan the view |
| Scroll Wheel | Zoom toward cursor |
| Hover | Shows complex coordinates |

## How It Works

Both fractals are based on iterating the function:

```
z(n+1) = z(n)^2 + c
```

- **Julia Set**: c is fixed, z0 varies across the plane
- **Mandelbrot Set**: z0 = 0, c varies across the plane

Points that stay bounded (never exceed the escape radius) are colored black and belong to the set. Points that escape are colored based on how quickly they diverge, using smooth coloring for gradient quality.

## Technologies

- HTML5 Canvas
- Vanilla JavaScript
- CSS3
