# 🥷 Ninja Endless Jumper — Game Design Plan

---

## Overview

A retro pixel art endless runner/jumper set in ancient Japan. The player controls a ninja who automatically dashes forward through a scrolling world of rooftops and traditional Japanese houses. The goal is to survive as long as possible by jumping over obstacles, collecting coins, and pulling off double jumps to reach higher platforms.

---

## Visual Style

**Theme:** Ancient Japan — feudal era rooftops, lanterns, cherry blossom trees, moonlit skies.

**Art Style:** Pixel art with a limited retro color palette (16–32 colors max). Everything is blocky, chunky, and charming.

**Key Visual Elements:**

- **Background layers (parallax scrolling):**
  - Layer 1 (far): Deep indigo/navy night sky with a large moon and scattered stars
  - Layer 2 (mid): Silhouetted mountain ranges and distant pagodas
  - Layer 3 (near): Ancient Japanese houses with curved tiled rooftops, glowing paper lanterns, and torii gates
- **Foreground / Ground:** Rooftop tiles and wooden platforms the ninja runs across
- **Ambient details:** Falling cherry blossom petals drifting across the screen
- **Font:** Press Start 2P (Google Fonts) — classic retro pixel font for all UI text

---

## Player Character — The Ninja

**Appearance:**
- Small pixel art ninja dressed in a dark navy/black gi with a white headband
- Glowing white eyes (the only bright detail on the character)
- A small katana or shuriken visible on the sprite

**Animations:**
| State | Animation |
|---|---|
| Running | 4-frame leg cycle, arms pumping |
| Jump | Tucked body, arms swept back |
| Double Jump | Quick spin / shuriken burst effect |
| Death | Tumble animation, fade out |

**Physics:**
- Gravity pulls the ninja down continuously
- First jump applies an upward velocity
- Second jump (double jump) can be triggered mid-air before landing
- No wall jumping or sliding

---

## File Structure

```
/ninja-jumper/
├── index.html       ← Canvas element, UI overlays, Google Fonts link
├── style.css        ← Page styling, fonts, mobile layout, UI panels
└── game.js          ← All game logic, rendering, input handling
```

---

## Core Features

### Double Jump
- Player presses jump once to leap, a second press mid-air triggers the double jump
- Double jump has a slightly smaller boost than the first jump
- A small visual burst effect (pixel shuriken / star particles) plays on double jump
- Jump counter resets upon landing on any platform

### Coins
- Gold pixel-art coins spawn on platforms throughout the level
- Coins rotate with a simple 2-frame animation
- Collecting coins adds +10 to the score
- Coin spawn rate and placement are randomised but always reachable
- A coin counter is displayed in the HUD (top right)

### Mobile Touch Support
- Tap anywhere on the screen to jump
- Second tap mid-air triggers double jump
- The canvas scales responsively to fit any screen size
- A subtle "TAP TO JUMP" hint is shown on the start screen for mobile users

---

## Game Mechanics

### Scrolling World
- The world scrolls from right to left at a constant speed
- Platforms, obstacles, and background layers scroll at different speeds (parallax effect)
- Ground tiles loop seamlessly

### Obstacles
- **Bamboo spikes** rising from platforms
- **Lantern poles** blocking the path
- **Gap traps** — missing sections of rooftop the player must jump over
- Obstacles are procedurally spawned with randomised gaps between them (ensuring the level is always beatable)

### Difficulty Scaling
- Scroll speed increases gradually every 10 seconds
- Obstacle frequency increases as score grows
- Gap widths become wider at higher scores
- Speed cap is applied so the game stays fair (never impossible)

---

## Scoring System

| Action | Points |
|---|---|
| Surviving (per second) | +1 |
| Collecting a coin | +10 |
| Passing an obstacle | +5 |

- Live score displayed top-left in the HUD
- High score saved to `localStorage` and displayed on the Game Over screen
- Score flashes briefly when a coin is collected

---

## Game States

```
[ Start Screen ]
      ↓  (Press Space / Tap)
[ Playing ]
      ↓  (Hit obstacle)
[ Game Over Screen ]
      ↓  (Press Space / Tap)
[ Playing ] (restart)
```

### Start Screen
- Game title "NINJA RUNNER" in pixel font
- Animated ninja running in the background (idle preview)
- "PRESS SPACE TO START" / "TAP TO START"

### HUD (During Play)
- Top-left: Current score
- Top-right: Coin count
- Top-right corner: Best score (greyed out)

### Game Over Screen
- "GAME OVER" in large pixel font (red)
- Final score and high score displayed
- "PRESS SPACE / TAP TO RESTART"

---

## Controls

| Platform | Action | Input |
|---|---|---|
| Desktop | Jump | `Space` or `↑` |
| Desktop | Double Jump | `Space` / `↑` again mid-air |
| Desktop | Pause | `P` or `Esc` |
| Mobile | Jump | Tap screen |
| Mobile | Double Jump | Tap again mid-air |

---

## Game Loop Architecture

All logic lives inside `game.js` and is structured as follows:

```
init()
  └── Load assets, set up canvas, bind input events, set initial state

gameLoop()  ← driven by requestAnimationFrame
  ├── update()
  │     ├── Move scroll speed
  │     ├── Apply gravity to player
  │     ├── Move platforms, obstacles, coins, background layers
  │     ├── Check collisions (player ↔ obstacles, player ↔ coins)
  │     ├── Spawn new platforms, obstacles, coins
  │     ├── Update score
  │     └── Update difficulty scaling
  └── draw()
        ├── Clear canvas
        ├── Draw background layers (parallax)
        ├── Draw ground / platforms
        ├── Draw coins
        ├── Draw obstacles
        ├── Draw player (correct animation frame)
        ├── Draw particle effects
        └── Draw HUD / UI overlays
```

---

## Development Phases

### Phase 1 — Core Loop
Set up the HTML canvas, draw a scrolling tiled ground, implement player gravity and a single jump.

### Phase 2 — Obstacles & Collision
Spawn obstacles (spikes, poles, gaps), implement pixel-perfect collision detection, trigger game over state.

### Phase 3 — Double Jump & Coins
Add the double jump mechanic with visual feedback. Spawn coins on platforms with collection logic and score tracking.

### Phase 4 — Pixel Art & Backgrounds
Draw the ninja sprite and animations. Add the parallax background with Japanese houses, mountains, and moon. Apply the retro palette and Press Start 2P font.

### Phase 5 — Polish & Mobile
Add particle effects (double jump burst, coin sparkle, death tumble). Implement responsive canvas scaling and touch input for mobile. Add the start screen and game over screen with high score persistence.

### Phase 6 — Optional Extras
- Sound effects (8-bit jump, coin collect, death jingle)
- Pause functionality
- Additional obstacle types (moving lanterns, birds)
- Cherry blossom particle system in background

---

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 Canvas | Game rendering |
| Vanilla JavaScript | All game logic (no libraries) |
| CSS3 | Page layout, fonts, UI styling |
| Google Fonts (Press Start 2P) | Retro pixel UI font |
| localStorage | High score persistence |

---

*Plan version 1.0 — Ready for development.*
