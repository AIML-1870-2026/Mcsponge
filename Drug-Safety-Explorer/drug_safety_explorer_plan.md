# Drug Safety Explorer — Project Plan

## Overview

A single-page web application that compares two drugs side by side using live data from the OpenFDA API. Users can select or search for any two drugs and instantly view their interaction warnings, adverse event reports, and recall history in a tabbed interface.

---

## Data Sources

### OpenFDA API
**Free · No API key required (up to 240 requests/minute)**
Base URL: `https://api.fda.gov`

| Endpoint | What It Contains |
|---|---|
| `/drug/label.json` | FDA-approved labeling — interaction warnings, contraindications, adverse reactions, dosage |
| `/drug/event.json` | FAERS adverse event reports submitted by patients, doctors, and manufacturers |
| `/drug/enforcement.json` | Drug recall and enforcement reports — severity classification and reason |

> **Important limitation:** FAERS reports are voluntarily submitted. A report linking a drug to an adverse event does **not** prove the drug caused the event. This must be communicated clearly to users.

### RxNorm API (NLM)
**Free · No key required**
URL: `https://lhncbc.nlm.nih.gov/RxNav/APIs/`

Used for drug name normalization — mapping brand names to generic names and vice versa. Helps ensure consistent API queries regardless of what name the user types.

---

## Required Compliance Items

Every page load must display the following:

- **Disclaimer banner:** "Educational Use Only — This tool is for learning purposes. Always consult a healthcare professional for medical advice."
- **OpenFDA attribution:** "This product uses publicly available data from the U.S. Food and Drug Administration (FDA). FDA is not responsible for the product and does not endorse or recommend this or any other product."

---

## Features

### Drug Input
- Two input fields — Drug A and Drug B — each with:
  - A dropdown of pre-populated common drugs for quick selection
  - A free-text field for typing any drug name
- A **Compare** button that fires the API queries
- Pre-populated example on page load (Warfarin + Ibuprofen) so users see real data immediately

### Tab 1 — Interaction Warnings
- Queries `/drug/label.json` for each drug
- Displays the `drug_interactions` field as scrollable text
- Side-by-side columns: Drug A (left) | Drug B (right)
- If no data found, shows: *"No drug interaction information found in the FDA label."*

### Tab 2 — Adverse Events
- Queries `/drug/event.json` and counts occurrences by reaction type
- Displays the top 10 most reported reactions as a bar chart (Chart.js)
- Side-by-side columns for Drug A and Drug B
- Includes a disclaimer note below the chart explaining FAERS limitations

### Tab 3 — Recall History
- Queries `/drug/enforcement.json` for past recalls
- Displays recalls color-coded by class:
  - 🔴 **Class I** — serious adverse health consequences or death possible
  - 🟠 **Class II** — temporary or reversible adverse health consequences
  - 🟡 **Class III** — unlikely to cause adverse health consequences
- Optionally shown on a simple timeline view

### Help System
- A **?** button in the header opens a general "How to Read This Data" modal
- Contextual **ⓘ** info buttons next to each tab section, explaining:
  - How to interpret adverse event data (FAERS limitations, reporting bias)
  - What recall classifications mean (Class I, II, III with examples)
  - What drug labels actually tell you (FDA-approved prescribing information)
  - Why some drugs have more reports than others (volume bias)

---

## Edge Case Handling

| Scenario | Behavior |
|---|---|
| Drug not found in OpenFDA | Show: *"No results found for [drug name]."* |
| No adverse events on record | Show: *"No adverse event reports found."* |
| No recall history | Show: *"No recall history found."* |
| API timeout or network error | Show a user-friendly error message with a retry option |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Structure | Single HTML file (no framework) |
| Styling | Embedded CSS |
| Logic | Vanilla JavaScript (ES6+) |
| Charts | Chart.js (loaded from cdnjs.cloudflare.com) |
| Deployment | GitHub Pages |

All API calls are made client-side directly to `api.fda.gov`. No backend or server required.

---

## Architecture

```
User input (Drug A + Drug B)
        ↓
API query engine — 3 parallel fetch calls per drug (6 total)
        ↓
┌────────────────┬───────────────────┬──────────────────────┐
│ /drug/label    │ /drug/event       │ /drug/enforcement    │
│ Interaction    │ Adverse events    │ Recall history       │
│ warnings       │ (FAERS reports)   │ + severity class     │
└────────────────┴───────────────────┴──────────────────────┘
        ↓
Tabbed results panel — Drug A column vs Drug B column
        ↓
Help modals + Educational disclaimer banner
```

---

## Requirements Checklist

- [ ] Queries at least one OpenFDA endpoint using live API calls (not hardcoded data)
- [ ] Single-page web application (HTML/CSS/JS)
- [ ] Deployable to GitHub Pages
- [ ] Disclaimer: educational use only
- [ ] OpenFDA attribution text included
- [ ] Pre-populated example on load
- [ ] Edge cases handled gracefully
- [ ] Help buttons with educational popups throughout

---

## Development Stages

### Stage 1 — Static Shell & Layout
**Goal:** Get the visual structure on screen with no live data.

- [ ] Build the full HTML skeleton: header, disclaimer banner, dual input section, tab bar, results panel
- [ ] Write all embedded CSS: dark theme, two-column grid, tab switching, modal overlay styles
- [ ] Wire up tab switching in JS (show/hide panels on click, active tab highlight)
- [ ] Add the `?` help button and modal open/close logic (no content yet)
- [ ] Hardcode one placeholder result card per column so layout can be verified visually

**Done when:** Page renders correctly, tabs switch, modal opens/closes — all with dummy data.

---

### Stage 2 — API Query Engine
**Goal:** Make real API calls and log raw responses to the console.

- [ ] Write a `fetchLabel(drugName)` function hitting `/drug/label.json?search=openfda.generic_name:"..."`
- [ ] Write a `fetchEvents(drugName)` function hitting `/drug/event.json?search=patient.drug.medicinalproduct:"..."&count=patient.reaction.reactionmeddrapt.exact`
- [ ] Write a `fetchRecalls(drugName)` function hitting `/drug/enforcement.json?search=product_description:"..."`
- [ ] Wire up the **Compare** button to fire all 6 calls in parallel using `Promise.all`
- [ ] Add loading spinners per column while fetches are in flight
- [ ] Log raw API responses to console; verify shape matches expectations

**Done when:** Clicking Compare with "Warfarin" and "Ibuprofen" logs 6 real API responses to the console.

---

### Stage 3 — Tab 1: Interaction Warnings
**Goal:** Render real label data in the Interactions tab.

- [ ] Extract the `drug_interactions` field from the label response
- [ ] Render it as scrollable text inside Drug A and Drug B columns
- [ ] Handle missing field gracefully with fallback message
- [ ] Populate the `ⓘ` contextual info button content for this tab

**Done when:** Warfarin + Ibuprofen shows real FDA label interaction text side by side.

---

### Stage 4 — Tab 2: Adverse Events Chart
**Goal:** Render a bar chart of top 10 reported reactions per drug.

- [ ] Load Chart.js from CDN
- [ ] Parse the `results` array from `/drug/event.json` count response (term + count fields)
- [ ] Slice top 10, then render a horizontal bar chart for Drug A and Drug B
- [ ] Add the FAERS disclaimer note below each chart
- [ ] Populate the `ⓘ` info button explaining FAERS reporting bias

**Done when:** Two side-by-side bar charts render with real reaction data.

---

### Stage 5 — Tab 3: Recall History
**Goal:** Render color-coded recall cards.

- [ ] Parse recall results: extract `classification`, `recall_initiation_date`, `reason_for_recall`, `product_description`
- [ ] Render each recall as a card with color-coded left border (Class I = red, II = orange, III = yellow)
- [ ] Sort by date descending
- [ ] Handle "No recalls found" state
- [ ] Populate the `ⓘ` info button explaining recall classifications

**Done when:** Warfarin or a recalled drug shows at least one color-coded recall card.

---

### Stage 6 — Help System & Compliance Polish
**Goal:** Fill in all educational content and ensure compliance items are present.

- [ ] Write content for the `?` general help modal ("How to Read This Data")
- [ ] Write content for all three `ⓘ` contextual info buttons
- [ ] Confirm disclaimer banner is visible on every load
- [ ] Confirm OpenFDA attribution text is present
- [ ] Pre-populate Drug A = "Warfarin" and Drug B = "Ibuprofen" on load and auto-fire Compare

**Done when:** All help modals have real text; disclaimer and attribution are visible without scrolling.

---

### Stage 7 — Edge Cases & Error Handling
**Goal:** Make the app resilient for unexpected inputs and API failures.

- [ ] Handle drug not found (404 / empty results array) — show fallback message
- [ ] Handle network/timeout errors — show user-friendly error with retry button
- [ ] Test with obscure drug names, misspellings, and brand vs generic name mismatches
- [ ] Verify all six edge case scenarios from the Edge Case Handling table

**Done when:** App never shows a blank panel or broken UI regardless of input.

---

### Stage 8 — Final Review & Deploy
**Goal:** Ship a clean, working build to GitHub Pages.

- [ ] Cross-browser check (Chrome, Firefox, Safari/Edge)
- [ ] Mobile/responsive check — readable on a phone screen
- [ ] Validate all Requirements Checklist items are checked
- [ ] Run through the full Warfarin + Ibuprofen flow one final time
- [ ] `git add . && git commit -m "..."` and push to `main`

**Done when:** Live URL loads correctly and all checklist items pass.

---

## Ideas to Explore Later

- Co-administration analysis — finding FAERS reports where both drugs appear together
- Autocomplete drug search that queries OpenFDA's label endpoint in real time
- Visual recall timeline showing when and why drugs were pulled from the market
- Severity score summary card at the top of each drug column
