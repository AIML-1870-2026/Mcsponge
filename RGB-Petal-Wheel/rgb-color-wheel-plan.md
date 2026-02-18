# RGB Color Wheel — Educational Website
## Project Specification for Claude Code

---

## Overview

Build a single-page educational color theory tool using **plain HTML, CSS, and JavaScript** (no frameworks, no build step). The site teaches users how RGB colors work, how color formats relate to each other, and how colors form harmonic relationships on the wheel.

**Files to create:**
```
index.html   ← Markup and layout
style.css    ← All visual styling
app.js       ← Color logic, canvas drawing, interactions
```

---

## Layout

Three-column layout on desktop, single-column stack on mobile.

| Left Panel | Center | Right Panel |
|---|---|---|
| Color value displays (RGB, HEX, HSL) | Color wheel canvas + lightness slider | Harmony swatches + saved palette |

---

## Features

### 1. Drag-to-Pick Color Wheel

- Draw the wheel on a `<canvas>` element using `ImageData`
- Each pixel is calculated from polar coordinates: **angle → hue**, **distance from center → saturation**
- A draggable crosshair marker follows the user's cursor on the wheel
- Crosshair clamps to the wheel edge if dragged outside the circle
- Below the wheel: a **lightness slider** (range 0–100) that adjusts the L value in HSL — this demonstrates the third dimension of color space
- Support both **mouse** and **touch** events for mobile compatibility

**Color math:**
- Wheel pixel color: `HSL(angle_in_degrees, radius/max_radius * 100%, lightness%)`
- On pick: convert canvas coordinates → polar → HSL → RGB → HEX

---

### 2. RGB / HEX / HSL Value Display (Left Panel)

Three labeled rows, each showing the current color's value in real time:

| Label | Format | Example | Educational note |
|---|---|---|---|
| RGB | `rgb(255, 100, 50)` | `255, 100, 50` | "Used in screens and CSS" |
| HEX | `#FF6432` | `#FF6432` | "Shorthand used in web design" |
| HSL | `hsl(17°, 100%, 60%)` | `17°, 100%, 60%` | "Describes color as humans perceive it" |

- Values update live as the user drags the wheel or moves sliders
- Each value is **click-to-copy** — clicking triggers a brief `"Copied!"` flash animation
- Below the values: **three individual RGB channel sliders** (R, G, B — each range 0–255) that stay in sync with the wheel picker bidirectionally

---

### 3. Color Harmony Suggestions (Right Panel — Top)

A tab/toggle bar to switch between harmony modes. Each mode calculates related colors by rotating hue on the HSL color wheel.

| Mode | Description | Colors shown | Hue offsets |
|---|---|---|---|
| Complementary | Opposite on the wheel | 2 | 0°, 180° |
| Analogous | Neighbors on the wheel | 3 | -30°, 0°, +30° |
| Triadic | Evenly spaced triangle | 3 | 0°, 120°, 240° |
| Split-Complementary | One + two near its complement | 3 | 0°, 150°, 210° |
| Tetradic | Four corners of a square | 4 | 0°, 90°, 180°, 270° |

**For each harmony:**
- Display color swatches with their HEX values below
- Show a **1-sentence description** of when/why designers use this harmony
- Draw the harmony points as **small dot overlays directly on the wheel canvas** so the user sees the geometric relationship visually
- Clicking any harmony swatch sets it as the new active color

---

### 4. Saved Color Palette / History (Right Panel — Bottom)

- A **"Save Color"** button adds the current color to a palette row
- Maximum **16 saved colors** — when full, the oldest is dropped
- Each saved chip:
  - Shows its HEX value as a tooltip on hover
  - Can be clicked to restore that color as the active selection
- A **"Clear Palette"** button resets the entire saved palette
- Palette is persisted in **`localStorage`** so it survives page refreshes

---

## Educational Layer

These details make the tool genuinely teach color theory — not just display values:

- **Harmony dot overlays on the wheel** — the user *sees* why complementary colors are opposite, why triadic colors are evenly spaced, etc.
- **Format explanations** — each color format row includes a short plain-English note about what it's used for
- **Harmony descriptions** — each harmony mode includes a 1-sentence explanation beneath the swatches
- **Lightness slider** — visually demonstrates that the color wheel is a cross-section of a 3D cylinder (hue × saturation × lightness), not just a flat circle. Label it: *"The wheel shows hue + saturation. This slider reveals the third dimension: lightness."*

---

## Technical Notes

### Canvas Drawing

```js
// Pseudocode for wheel pixel calculation
for each pixel (x, y) on canvas:
  dx = x - centerX
  dy = y - centerY
  dist = sqrt(dx² + dy²)
  if dist <= radius:
    hue = atan2(dy, dx) converted to 0–360°
    saturation = dist / radius  (0.0 to 1.0)
    color = hslToRgb(hue, saturation, lightness)
    draw pixel
```

### Color Conversion Functions Needed

- `hslToRgb(h, s, l)` → `{r, g, b}`
- `rgbToHsl(r, g, b)` → `{h, s, l}`
- `rgbToHex(r, g, b)` → `"#RRGGBB"`
- `hexToRgb(hex)` → `{r, g, b}`

### State Management

Keep a single source-of-truth color state object:
```js
const state = {
  h: 0,       // 0–360
  s: 100,     // 0–100
  l: 50,      // 0–100
  harmonyMode: 'complementary',
  palette: []  // loaded from localStorage on init
};
```

All UI elements (wheel crosshair, sliders, value displays, harmony swatches) read from and write to this state object.

### Redrawing the Wheel

- Redraw the full wheel canvas only when **lightness changes** (dragging the lightness slider)
- On hue/saturation change (dragging the crosshair), only reposition the crosshair marker — no full redraw needed
- Redraw harmony dots on every color change

### localStorage

```js
// Save
localStorage.setItem('palette', JSON.stringify(state.palette));

// Load on init
const saved = localStorage.getItem('palette');
if (saved) state.palette = JSON.parse(saved);
```

---

## Accessibility & UX

- All interactive elements are keyboard-accessible
- Color value rows use `role="button"` and `tabindex="0"` for click-to-copy
- Lightness slider uses a native `<input type="range">` for built-in accessibility
- Harmony swatch buttons include `aria-label` with their HEX value
- On mobile (< 768px), stack panels vertically: wheel on top, left panel below, right panel at bottom

---

## Suggested Build Order

1. Draw the color wheel canvas statically
2. Add mouse/touch drag interaction → update state
3. Wire lightness slider → redraw wheel
4. Build RGB/HEX/HSL display panels → sync with state
5. Add RGB channel sliders → bidirectional sync with wheel
6. Build harmony calculator → display swatches
7. Draw harmony dots as overlays on the wheel
8. Add click-to-set from harmony swatches
9. Build save palette UI + localStorage persistence
10. Add click-to-copy with flash animation
11. Add educational labels and descriptions
12. Responsive/mobile layout pass
13. Polish: transitions, hover states, crosshair animation
