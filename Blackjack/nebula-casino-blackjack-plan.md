# Nebula Casino Blackjack — Website Plan

## Project Overview
A space-casino themed single-player blackjack game built with pure HTML, CSS, and JavaScript. No frameworks, no dependencies — just open in a browser and play.

---

## File Structure
- `index.html` — page structure
- `style.css` — all visual styling and animations
- `game.js` — all game logic and state management

---

## Game Logic

- Standard blackjack rules with a 6-deck shoe
- Fisher-Yates shuffle algorithm
- Ace handling: counted as 1 or 11, whichever is more favorable
- Dealer AI: hits until reaching 17 or above
- Chip balance persisted to localStorage across sessions

**Game phases:**
1. Betting
2. Dealing
3. Player turn
4. Dealer turn
5. Resolution

**Player actions:** Hit, Stand, Double Down, New Game

**Keyboard shortcuts:**
- `H` — Hit
- `S` — Stand
- `D` — Deal / New Game

---

## Blackjack Resolution Rules

### Player Blackjack (dealer does not have blackjack)
- Payout is **1.5x the bet** (classic 3:2 odds)
- Example: a $100 bet returns $250 total ($100 stake + $150 winnings)
- Accompanied by a gold shimmer burst animation on the cards, a glowing **"BLACKJACK!"** text splash in gold, and the chip balance visibly counting up

### Player Blackjack + Dealer Blackjack (push)
- Result is a **push** — the player's original bet is returned in full, no gain or loss
- UI displays a **"PUSH"** indicator with a neutral silver/purple glow animation, visually distinct from both win and loss states

### Dealer Reveal Timing
- The dealer's hole card is flipped immediately when the player has blackjack
- The push/win check occurs before the player takes any action, consistent with standard casino rules

---

## Visual Design

### Theme
**Nebula Casino** — a luxurious deep-space casino aesthetic. The feeling of playing blackjack aboard a futuristic space station orbiting a nebula.

### Color Palette
| Role | Color |
|---|---|
| Background | Deep purple `#0d0618` |
| Mid background | Rich purple `#1a0d2e` |
| Primary accent | Gold `#c9a84c` |
| Light accent | Gold shimmer `#f0d080` |
| Glow / interactive | Purple glow `#a855f7` |
| Secondary glow | Cyan `#06b6d4` |
| Card red suits | Warm red `#e04040` |

### Typography
- **Display / headings:** *Cinzel* — regal, serif, commanding
- **UI labels / buttons:** *Rajdhani* — clean, futuristic, readable

---

## Table Surface
- Holographic Tron-like grid with a perspective projection that recedes toward the horizon
- Rendered via CSS 3D transforms or a `<canvas>` element
- Gold and cyan grid lines on a deep purple base
- Animated with a slow glowing pulse and subtle scanline effect
- Gives the feeling of a futuristic space station playing surface

---

## Card Design

### Card Backs
- Galaxy / nebula swirl design — fully CSS-painted, no external images
- Layered CSS radial gradients: deep purple and violet base with swirling magenta and gold highlights
- Scattered star dots and a subtle shimmer animation

### Card Fronts
- Classic suit symbols: ♠ ♥ ♦ ♣
- Red suits in warm casino red, black suits in near-white
- Ivory/cream card face with a gold border
- Faint drop shadow with a purple glow

---

## UI Elements
- Gold-bordered bet chip buttons
- Glowing chip balance display
- Action buttons (Hit / Stand / Double Down) with hover glow states
- Animated star particles drifting across the background
- **Strategy Hint button:** A dedicated "Hint" button appears during the player's turn. Pressing it shows a tooltip or overlay with the basic strategy recommendation (e.g., "Hit — dealer shows 10, your hard 14 should hit"). Logic is a lookup table mapping `[playerTotal, softOrHard, dealerUpcard]` → action. Button is styled in cyan with a subtle AI/oracle glow to differentiate it from action buttons.

---

## Sound Effects
- **Card flip / deal:** soft papery swoosh on each card dealt
- **Chip clink:** coin/chip sound on bet placement and payout
- **Win cue:** rising chime or fanfare on a player win
- **Blackjack cue:** distinct triumphant sound on natural blackjack
- **Lose cue:** low descending tone on loss
- **Push cue:** neutral soft chime
- All sounds generated via the Web Audio API (no external files) using short synthesized tones and filtered noise. A mute/unmute toggle button persists preference to localStorage.

---

## Betting History & Statistics
- A collapsible side panel (or bottom drawer) tracks session data:
  - Round-by-round log: bet amount, result (W / L / P), net change
  - **Win percentage** across all settled rounds (pushes excluded or shown separately)
  - **Biggest single win** (net chips gained in one round)
  - **Current streak:** consecutive wins or losses with direction indicator
- A **Reset Stats** button clears history and resets all counters (with a confirmation prompt)
- Data stored in localStorage so it survives page refresh

---

## Animations
- **Card deal:** slide + fade in — paired with card flip sound
- **Dealer hole card:** flip reveal animation — paired with card flip sound
- **Blackjack win:** gold shimmer burst + "BLACKJACK!" text splash + chip count-up — paired with blackjack audio cue
- **Push:** silver/purple "PUSH" glow indicator — paired with push chime
- **Win/loss:** distinct flash effects for each outcome — paired with win/lose audio cues
- **Background:** persistent slow star-drift particle system
- **Chip bet placement:** chip clink on each bet increment click

---

## Nice-to-Haves (Post-MVP)
- Split pairs
- Insurance
- Running deck count display
- Sound toggle for ambient space music

---

## Build Order
1. Deck builder + shuffle logic
2. Deal & display cards
3. Hit / stand / dealer AI
4. Win / loss / push detection
5. Betting system & chip balance
6. Table visuals (grid, background)
7. Card art (fronts & backs)
8. Animations & effects
9. Keyboard shortcuts (H / S / D)
10. Web Audio sound effects + mute toggle
11. Strategy hint button + basic strategy lookup table
12. Betting history panel + statistics display + reset button
13. Final polish
