# Weather Dashboard — Project Plan

A plain HTML/CSS/JS weather dashboard built as a learning exercise. Covers API integration, DOM manipulation, responsive layout, data visualization, and map embedding.

---

## Tech Stack

- **HTML/CSS/JS** — no frameworks or build tools
- **OpenWeatherMap API** — free tier for weather data
- **Chart.js** — temperature trend chart (CDN, no install)
- **Leaflet.js** — interactive map (CDN, no install)
- **RainViewer** — free radar tile overlay
- **GitHub Pages or Netlify** — free hosting

---

## Features

- City search with autocomplete-style input
- Auto-detect user location via Geolocation API
- Current conditions card (temp, humidity, wind, weather icon)
- Hourly forecast strip (horizontal scroll)
- 7-day forecast card row
- Temperature trend line chart
- Interactive radar map synced to searched city

---

## Phases

### Phase 1 — Project Setup & API (1–2 hrs)

**Goal:** Get data flowing before building any UI.

- Register for a free OpenWeatherMap account and obtain an API key
- Scaffold the three project files: `index.html`, `style.css`, `app.js`
- Write a basic `fetch()` call to the Current Weather endpoint
- Log the JSON response to the console to confirm it works
- Store the API key in a `config.js` file (add to `.gitignore` before pushing)

---

### Phase 2 — City Search (2–3 hrs)

**Goal:** Let users find any city in the world.

- Add a search `<input>` and button to the page header
- On submit, call OpenWeatherMap's Geocoding API to resolve the city name to coordinates
- Display a short dropdown list of matching results (handle ambiguous names, e.g. "Springfield")
- Store the selected city name and coordinates in a JS state object
- Trigger a full data refresh whenever a new city is selected
- Add a "Use my location" button that calls `navigator.geolocation.getCurrentPosition()`
- Persist the last-searched city in `localStorage` so it reloads on the next visit

---

### Phase 3 — Current Conditions UI (1–2 hrs)

**Goal:** Show the key weather stats for the selected city.

- Build a conditions card displaying:
  - City name and country flag emoji
  - Temperature (with °C / °F toggle)
  - Feels-like temperature
  - Weather description and icon (from OpenWeatherMap's icon CDN)
  - Humidity, wind speed, UV index
- Update the card every time the selected city changes

---

### Phase 4 — Forecast Display (2–3 hrs)

**Goal:** Show what the weather will look like over the next week.

- Call the 5-day / 3-hour Forecast endpoint
- Render a horizontal scrollable strip showing the next 24 hours (hourly temp + icon)
- Render a 7-day summary row using CSS Grid (high/low temp + icon per day)
- Add a Chart.js line chart below the strips showing the temperature trend for the next 48 hours
- All three sections update automatically when the city changes

---

### Phase 5 — Maps & Radar (2–3 hrs)

**Goal:** Give users a visual sense of weather patterns in the area.

- Embed a Leaflet.js map centred on the selected city's coordinates
- Add RainViewer's radar tile layer on top of the OpenStreetMap base layer
- Include a simple layer toggle so users can show/hide the radar overlay
- Pan and re-centre the map automatically whenever a new city is selected

---

### Phase 6 — Polish & Deploy (1–2 hrs)

**Goal:** Make the app feel complete and put it online.

- Add loading spinners while API calls are in-flight
- Show friendly error messages for failed requests or unknown city names
- Add a dark/light mode toggle (CSS custom properties make this straightforward)
- Test on mobile screen sizes and fix any layout issues
- Push to GitHub and enable GitHub Pages **or** drag the folder into Netlify for a live URL

---

## Estimated Total Time

| Phase | Focus | Time |
|-------|-------|------|
| 1 | Setup & API | 1–2 hrs |
| 2 | City search | 2–3 hrs |
| 3 | Current conditions | 1–2 hrs |
| 4 | Forecast display | 2–3 hrs |
| 5 | Maps & radar | 2–3 hrs |
| 6 | Polish & deploy | 1–2 hrs |
| **Total** | | **9–15 hrs** |

---

## Suggested File Structure

```
weather-dashboard/
├── index.html
├── style.css
├── app.js
├── config.js        ← API key (add to .gitignore)
└── .gitignore
```

---

## Key Learning Outcomes

- Making authenticated `fetch()` requests to a REST API
- Parsing and transforming JSON data for display
- DOM manipulation and dynamic UI updates
- Browser Geolocation API
- `localStorage` for lightweight persistence
- Responsive layout with CSS Grid and Flexbox
- Chart.js for data visualization
- Leaflet.js for interactive maps
- Deploying a static site
