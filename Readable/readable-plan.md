# Readable — Project Plan

A webpage that allows users to explore the readability of various background color, text color, and text size combinations displayed on digital screens.

---

## Layout

Three-panel design with a full-width header at the top:

- **Left sidebar** — Background Color, Text Color, and Text Size controls
- **Center column** — Large preview text area (vertically and horizontally centered), with a bottom stats bar containing the Contrast Ratio and Relative Luminance panels side by side
- **Right sidebar** — Preset Color Palettes and Vision Simulation toggles

The preview text is surrounded by the control panels on all sides, keeping it the visual focus of the page.

---

## Features

### Background Color Controls
Three RGB sliders (R, G, B), each ranging 0–255, with a synchronized integer input field beside each one. A color swatch (54×54px) previews the resulting background color in real time, alongside a live hex code readout.

### Text Color Controls
Same structure as the background controls — three synced RGB sliders and number inputs — but controlling the text color. A matching swatch and hex code show the current text color.

### Text Size Control
A single horizontal slider (10–72px) with a synchronized integer field beside it. Labels along the track hint at common use cases: caption, body, heading, and display.

### Text Display Area
A large, centered preview region that renders sample text using exactly the chosen background color, text color, and font size — updating instantly on every change. The sample text displayed is:

> Sekiro's difficulty is almost entirely regulated by your willingness to dig deep and learn the delicate balance between aggression and defense that defines combat. FromSoft's typical adherence to staunch fairness means every death (or two) is a learning opportunity, culminating in a massively gratifying sense of mastery that turns each encounter into a balletic performance.
>
> The learning experience is well-guided, with the wonderful boss fights serving as tutorials for every aspect of combat. One of the first major fights, the mounted general Gyoubu the Demon chasing you down in a huge field of corpses, mixed devastating unblockables into his barrage of bladed spear swings whilst galloping around a huge arena.

### Contrast Ratio Display
Located in the left panel of the bottom stats bar. Shows:

- The live WCAG contrast ratio in `X.XX:1` format (Bebas Neue, large)
- A **WCAG compliance indicator** displayed directly next to the ratio number — two color-coded pills showing pass/fail status for:
  - **Normal text** (4.5:1 threshold) — green dot + PASS / red dot + FAIL
  - **Large text** (3.0:1 threshold) — green dot + PASS / red dot + FAIL
- Four **WCAG badges** below the ratio: AA Normal, AA Large, AAA Normal, AAA Large — each with a green pass or red fail state

### Relative Luminance Display
Located in the right panel of the bottom stats bar. Two labeled readouts — Background and Text — showing the underlying relative luminance values (0.000–1.000) that feed into the contrast ratio calculation.

### Preset Color Palettes
Six clickable preset combinations in the right sidebar that populate both the background and text color controls at once:

| Preset    | Background  | Text        |
|-----------|-------------|-------------|
| Classic   | White       | Black       |
| Dark Mode | Near-black  | Light gray  |
| Neon      | Deep navy   | Cyan-green  |
| Earthy    | Warm cream  | Dark brown  |
| Pastel    | Soft pink   | Purple      |
| Terminal  | Deep green  | Bright green|

### Vision Simulation Toggles
Six toggle buttons in the right sidebar that apply CSS filter approximations to the preview area:

- **Normal** (default — no filter)
- **Deuteranopia** (red-green, green-weak — SVG color matrix)
- **Protanopia** (red-green, red-weak — SVG color matrix)
- **Tritanopia** (blue-yellow — SVG color matrix)
- **Achromatopsia** (full grayscale — `grayscale(100%)`)
- **Monochromacy** (blue-cone monochromacy — SVG color matrix weighting blue channel ~80%)

---

## Synchronization Behavior

- When a slider moves, its corresponding integer field updates immediately
- When an integer field changes, its corresponding slider updates immediately
- All changes to color or size are reflected in the text display area in real time
- The contrast ratio, WCAG indicators, luminance values, and badges all recalculate automatically whenever the background or text color changes

---

## Contrast Ratio Calculation

Calculated according to WCAG guidelines:

1. Convert each RGB channel value to a linearized value:
   - If `channel / 255 <= 0.04045` → `(channel / 255) / 12.92`
   - Otherwise → `((channel / 255 + 0.055) / 1.055) ^ 2.4`
2. Compute relative luminance: `L = 0.2126R + 0.7152G + 0.0722B`
3. Calculate contrast ratio: `(L1 + 0.05) / (L2 + 0.05)` where L1 ≥ L2
4. Display the ratio in the format `X.XX:1`

### WCAG Thresholds
| Level | Normal text | Large text |
|-------|-------------|------------|
| AA    | 4.5:1       | 3.0:1      |
| AAA   | 7.0:1       | 4.5:1      |

---

## Aesthetic Direction

Bold and expressive — the UI itself is a living demonstration of the tool's purpose.

- **Display font:** Bebas Neue (header, wordmark, section labels, contrast ratio number)
- **Data font:** Space Mono (all sliders, readouts, numbers, badges, buttons)
- **Sidebar width:** 380px (left and right)
- **Color scheme:** Dark sidebar (`#111111`) contrasting with a full-bleed preview canvas; accent colors red (`#e03030`), green (`#30a040`), blue (`#3060e0`) for R/G/B slider indicators
- **Feel:** Editorial, high-contrast, joyful — every control feels intentional and every change feels alive
