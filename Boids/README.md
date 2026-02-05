# Boids Simulation

An interactive flocking simulation based on Craig Reynolds' Boids algorithm. Watch as autonomous agents exhibit emergent collective behavior through three simple rules: separation, alignment, and cohesion.

## Live Demo

[View the simulation](https://aiml-1870-2026.github.io/Mcsponge/Boids/)

## Features

### Core Behaviors

- **Separation** - Boids steer to avoid crowding nearby flockmates
- **Alignment** - Boids steer toward the average heading of nearby flockmates
- **Cohesion** - Boids steer toward the average position of nearby flockmates

### Controls

| Control | Description |
|---------|-------------|
| Separation | Adjusts how strongly boids avoid each other (0-5) |
| Alignment | Adjusts how strongly boids match neighbor velocity (0-5) |
| Cohesion | Adjusts how strongly boids group together (0-5) |
| Neighbor Radius | Detection range for nearby boids (20-200px) |
| Max Speed | Maximum boid velocity (1-10) |

### Behavior Presets

- **Schooling** - High alignment, medium cohesion, low separation. Mimics fish schools moving in coordinated patterns.
- **Chaotic** - Low alignment, low cohesion, small neighbor radius. Creates scattered, unpredictable movement.
- **Cluster** - High cohesion, moderate separation. Forms tight groups that move together.

### Trail Themes

- **Default** - Cyan to blue-green coloring based on speed
- **Neon** - Vibrant neon colors with glow effects and longer trails
- **Nature** - Earthy tones including forest greens, browns, and sky blues

### Mouse Effects

- **Off** - No mouse interaction
- **Attract** - Boids are drawn toward the cursor (green indicator)
- **Repel** - Boids flee from the cursor (red indicator)

### Obstacles

- **Click** on the canvas to place circular obstacles
- **Shift+Click** to remove an obstacle
- Boids will steer around obstacles automatically
- Use the **Clear Obstacles** button to remove all obstacles

### Stats Display

- **FPS** - Frames per second
- **Boids** - Total number of boids (150)
- **Avg Speed** - Average velocity across all boids
- **Avg Neighbors** - Average number of nearby boids per boid
- **Obstacles** - Number of placed obstacles

## How It Works

The simulation implements Reynolds' steering behaviors where each boid:

1. Calculates forces from separation, alignment, and cohesion rules
2. Adds obstacle avoidance forces when near obstacles
3. Adds mouse influence forces when mouse effects are enabled
4. Combines all forces and applies to velocity
5. Updates position based on velocity
6. Wraps around screen edges

## Technologies

- HTML5 Canvas
- Vanilla JavaScript
- CSS3
