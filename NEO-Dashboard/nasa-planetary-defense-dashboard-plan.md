# NASA Planetary Defense Dashboard — Project Plan

## Overview

A single-page web dashboard built in plain HTML, CSS, and JavaScript that pulls live data from three NASA/JPL APIs and presents it across a visually immersive, space-themed interface. The landing experience features a 3D interactive Earth globe with asteroids plotted at their real miss distances, followed by three deep-dive data tabs.

**Theme:** Mission control for planetary defense  
**Stack:** HTML + CSS + Vanilla JS (no frameworks)  
**APIs:** NeoWs, SBDB Close Approach Data, Sentry Impact Monitoring  
**3D Globe:** [globe.gl](https://globe.gl)

---

## Landing Page — 3D Earth Globe

The first thing a user sees is a live, interactive 3D Earth rendered with `globe.gl`. This week's asteroids are plotted as glowing points orbiting the Earth at their relative miss distances. The Moon appears at exactly 1 lunar distance (LD) as a permanent reference marker, so users can instantly judge whether an asteroid is passing closer or farther than the Moon.

### Globe features

- **Interactive:** Click and drag to rotate, scroll to zoom
- **Asteroid markers:** Each NEO appears as a labeled dot scaled to its estimated size; color encodes hazard status (red = potentially hazardous, green = safe)
- **Moon reference ring:** A ring or marker at 1 LD makes the scale immediately intuitive
- **Tooltips:** Hovering an asteroid shows its name, closest approach date, miss distance in LD, and velocity
- **Live data:** Positions sourced from the NeoWs 7-day feed on page load
- **Auto-rotate:** Globe slowly spins by default; stops on user interaction

### Globe implementation notes

```html
<script src="https://unpkg.com/globe.gl"></script>
```

- Use `globe.pointsData()` to place asteroid markers
- Scale miss distance logarithmically so near-misses and far passes are both visible
- The Moon marker sits at a fixed altitude corresponding to 1 LD (~384,400 km), normalized to the globe's scale
- Keep the globe fullscreen on load; tabs sit below (or in a persistent header nav)

---

## Tab 1 — NeoWs: This Week in Space Rocks

**API:** `https://api.nasa.gov/neo/rest/v1/feed`  
**Endpoint params:** `start_date`, `end_date`, `api_key`

### Headline stats panel ("This Week in Space Rocks")

A row of four stat cards at the top of the tab, each pulling the single most dramatic value from the weekly feed:

| Card | Value |
|---|---|
| Closest approach | Name + miss distance in LD and km |
| Largest object | Name + estimated diameter in meters |
| Fastest flyby | Name + relative velocity in km/s |
| Potentially hazardous | Count out of total this week |

### Size comparison visualization

When a user clicks any asteroid in the table, a panel slides in showing a to-scale silhouette of that asteroid compared to familiar reference objects — a person, a bus, the Eiffel Tower, a football stadium — so the abstract diameter estimate becomes tangible.

### Velocity context panel

Alongside each asteroid's raw velocity, a small bar or annotation shows how it compares to:
- Speed of sound (~0.34 km/s)
- A bullet (~1 km/s)
- The ISS (~7.7 km/s)
- Earth's orbital speed (~29.8 km/s)

### Asteroid table

Sortable, filterable table with columns:

| Column | Notes |
|---|---|
| Name / designation | Links to NASA JPL small body lookup |
| Close approach date | Sortable |
| Miss distance | Shown in LD, lunar distances, and km |
| Diameter estimate | Min–max range in meters |
| Velocity | km/s relative to Earth |
| Hazardous? | Color-coded badge |

### Filtering and sorting controls

- Date range picker (defaults to current week, expandable)
- Toggle: show only potentially hazardous objects
- Sort by any column header
- Search by asteroid name or designation

---

## Tab 2 — SBDB: Upcoming Close Approaches

**API:** `https://ssd-api.jpl.nasa.gov/cad.api`  
**Key params:** `dist-max` (miss distance filter), `date-min`, `date-max`, `sort`

### Intuitive miss distance display

Raw kilometer values are hard to feel. For each approach, display distance in three layers:

- **Lunar distances (LD):** Primary unit — instantly relatable once users see the Moon on the globe
- **Trips around Earth:** Miss distance ÷ Earth's circumference (~40,075 km)
- **NYC to London flights:** Miss distance ÷ ~5,570 km flight path

### Upcoming flybys table (30-day window)

| Column | Notes |
|---|---|
| Object name | Designation + common name if available |
| Close approach date/time | UTC, sortable |
| Miss distance | LD primary, km secondary |
| Velocity at approach | km/s |
| Object diameter | Estimated, in meters |
| Uncertainty | ±sigma value where available |

### Historical timeline

A scrollable horizontal timeline of notable close approaches — both historical (past 50 years) and upcoming (next 10 years). Milestones like 2029 Apophis approach (0.1 LD) are highlighted. Clicking a point loads that object's detail panel.

### Filtering and sorting controls

- Adjustable date window (7 days / 30 days / 1 year / custom)
- Max miss distance slider (1 LD to 10 LD)
- Sort by date, miss distance, velocity, or diameter
- Toggle: include/exclude sub-kilometer objects

---

## Tab 3 — Sentry: Impact Risk Monitor

**API:** `https://ssd-api.jpl.nasa.gov/sentry.api`  
**Key params:** `all` (full list), individual object lookup by designation

### Risk watch list

Every object in the Sentry database with a non-zero impact probability, displayed in a color-coded table ranked by Palermo scale score (most concerning first by default):

| Column | Notes |
|---|---|
| Object name | Links to full Sentry detail page |
| Impact probability | As a 1-in-N chance and as a percentage |
| Palermo scale | Color coded: green < −2, yellow −2 to 0, red > 0 |
| Torino scale | 0–10 integer with category label |
| Potential impact year(s) | First and last possible window |
| Cumulative impact energy | In megatons of TNT equivalent |
| Diameter | Estimated in meters |

### Palermo and Torino scale explainers

Inline tooltip or expandable card explaining what each scale means — many users won't know these. The Torino scale maps to a color and a plain-language description (e.g., "No unusual level of danger").

### Sorting and filtering

- Sort by: Palermo scale, Torino scale, impact probability, year, or diameter
- Filter by Torino scale level
- Toggle: show all objects vs. only Torino > 0

---

## Shared UI / UX Across All Tabs

### Navigation

Persistent top header with:
- Dashboard title and globe icon
- Tab buttons: **Globe** | **This Week** | **Approaches** | **Impact Risk**
- Active tab underlined; smooth content transition on switch

### Loading states

Each API call shows a skeleton loader while fetching — animated placeholder rows that match the table layout. Never a blank white screen.

### Error handling

If an API call fails (rate limit, network error, bad key):
- A clear inline error card replaces the skeleton
- Retry button included
- Fallback message explains what data is missing and why

### Visual design — dark mission control theme

- **Background:** Near-black (`#0a0c12`) with subtle star field texture
- **Accent colors:** Cyan (`#00d4ff`) for primary actions, amber (`#ffb830`) for warnings, red (`#ff4444`) for hazardous flags
- **Typography:** Monospace or semi-monospace for data values (feels like a terminal readout); clean sans-serif for labels
- **Cards:** Slightly lighter dark surface with thin colored border on top
- **Tables:** Alternating row shading, sticky header, colored badges for status
- **Data visualizations:** Minimal chart.js or D3 bar/timeline charts styled to match the dark theme

### Responsive layout

- Desktop: full-width globe, three-column stat cards, wide sortable tables
- Tablet: two-column stat cards, scrollable tables
- Mobile: single-column layout, globe scales down, tables scroll horizontally

---

## File Structure

```
project/
├── index.html              # Shell, tab nav, section containers
├── style.css               # Global dark theme, layout, components
├── app.js                  # Tab router, init, event wiring
├── api.js                  # Fetch helpers, error handling, caching
├── config.js               # API key, base URLs, constants
├── globe/
│   └── globe.js            # globe.gl setup, asteroid plotting, Moon marker
└── tabs/
    ├── neows.js             # Tab 1 — stat cards, size viz, velocity panel, table
    ├── sbdb.js              # Tab 2 — approaches table, timeline, distance display
    └── sentry.js            # Tab 3 — risk watch list, scale explainers
```

---

## API Keys and Setup

All three APIs are free. Get a key at [api.nasa.gov](https://api.nasa.gov). The `DEMO_KEY` works for low-traffic testing (30 req/hour).

| API | Base URL | Key required? |
|---|---|---|
| NeoWs | `https://api.nasa.gov/neo/rest/v1/feed` | Yes (NASA key) |
| SBDB Close Approach | `https://ssd-api.jpl.nasa.gov/cad.api` | No |
| Sentry | `https://ssd-api.jpl.nasa.gov/sentry.api` | No |

Store your key in `config.js` and never commit it to a public repo — use a `.env` file or an environment variable if deploying.

---

## Recommended Build Order

1. **HTML shell + tab navigation** — Get the layout and tab switching working with placeholder content first
2. **`api.js` fetch layer** — Write generic `fetchJSON(url)` with error handling and a simple in-memory cache so you don't hammer the API during development
3. **NeoWs tab** — Best starting point; the API is the most straightforward and gives you the data for the globe too
4. **3D globe** — Once you have NeoWs data flowing, wire it to `globe.gl`; the Moon marker is a single additional data point
5. **SBDB tab** — Reuse table component patterns from Tab 1; add the timeline last
6. **Sentry tab** — Simplest data shape; focus on the color-coded risk table and scale explainers
7. **Polish** — Loading states, error handling, responsive tweaks, dark theme refinements

---

## Stretch Ideas (Post-MVP)

- **Search any asteroid by name** across all three APIs from a global search bar
- **Asteroid detail modal** — click any object anywhere in the dashboard for a full profile
- **Notification / alert system** — flag when a new hazardous object appears in the feed
- **Share a flyby** — generate a shareable link to a specific close approach or Sentry object
- **Export data** — download the current table as CSV
- **Apophis countdown** — a dedicated countdown clock to the April 2029 Apophis close approach (0.1 LD)
