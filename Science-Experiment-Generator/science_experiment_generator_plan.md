# Science Experiment Generator — Development Plan

## Overview

A single-file (`index.html`) web app that uses the Anthropic API to generate grade-appropriate science experiments from a list of household supplies. The app renders the AI's markdown response as formatted HTML and allows users to download the result.

---

## Stage 1 — Core MVP

**Goal:** Get a working experiment generator with the essential inputs and output.

**Features:**
- Grade level dropdown (e.g., K-2, 3-5, 6-8, 9-12)
- Free-text area for entering available supplies (one per line)
- "Generate Experiment" button that calls the Anthropic API
- Markdown rendering of the AI response (headings, bold, lists)
- Basic loading state while the API call is in flight
- Clean, readable layout with a title and simple styling

**Constraints to enforce from the start:**
- Single `index.html` file, no build tools
- API key entered in-page and held in memory only (never stored)
- Unstructured/free-form text response from the model — no JSON parsing needed

**Deliverable:** A functional page where a teacher can enter supplies, pick a grade, and get a formatted experiment.

---

## Stage 2 — Polish & Download

**Goal:** Make the output more useful and the experience more complete.

**Features:**
- "Download Experiment" button that saves the generated experiment as a formatted `.txt` or `.html` file
- Improved prompt engineering — structure the AI's output consistently (Title, Objectives, Materials, Steps, Expected Results, Scientific Explanation, Safety Notes)
- Error handling for failed API calls (bad key, network error, rate limit)
- Responsive layout that works on tablet/mobile
- Subtle background styling and typography improvements

**Deliverable:** A polished, shareable single-file app a teacher could actually use in a classroom.

---

## Stage 3 — Quick-Select Supply Library *(Stretch)*

**Goal:** Reduce friction for users who don't know what to type.

**Features:**
- A predefined list of common household/classroom supplies grouped by category (e.g., Kitchen, Art Supplies, Outdoor)
- Clickable chips/tags that append items to the supplies text area
- Optional image thumbnails next to each supply for visual reference
- "Clear all" and "Select all in category" controls

**Why this stage:** Typing supplies freehand is the biggest UX bottleneck. A quick-select library makes the app accessible to younger students or less tech-comfortable teachers.

---

## Stage 4 — Experiment History *(Stretch)*

**Goal:** Let users revisit and compare previously generated experiments within a session.

**Features:**
- A collapsible sidebar or bottom drawer showing past experiments from the current session (stored in memory, not localStorage)
- Each history entry shows the title, grade level, and timestamp
- Clicking a past entry re-renders it in the main output area
- "Pin" a favorite experiment to keep it accessible
- Optional: export all pinned experiments as a single document

**Why this stage:** Teachers often generate several variations before finding the right fit. History makes iteration much faster.

---

## Stage 5 — Supply Substitution & Difficulty Ratings *(Stretch)*

**Goal:** Make the generator smarter and more adaptive.

**Features:**
- After an experiment is generated, a "Suggest Substitutions" button sends the materials list back to the API and returns alternative supplies for any item that might be hard to find
- Difficulty rating displayed on each experiment (Easy / Moderate / Challenging), derived from the AI response or added as a prompt instruction
- Optional filter on history view to show only experiments at or below a chosen difficulty

**Why this stage:** Real classrooms have supply constraints. Substitution suggestions and difficulty ratings make the tool genuinely practical rather than just generative.

---

## Stage 6 — Printable Observation Worksheets *(Stretch)*

**Goal:** Close the loop between the digital generator and the physical classroom.

**Features:**
- A "Generate Worksheet" button that sends the experiment back to the API and asks it to produce a student observation worksheet (hypothesis, data table, reflection questions)
- The worksheet renders in a print-friendly layout (clean white background, no UI chrome)
- A "Print Worksheet" button triggers `window.print()` with a print-specific CSS stylesheet
- Optional: download worksheet as a `.html` file alongside the experiment

**Why this stage:** This turns the app from a planning tool into a complete classroom resource — from experiment design all the way to student assessment.

---

## Summary Table

| Stage | Focus | Key Addition |
|---|---|---|
| 1 | Core MVP | Generate + render experiments |
| 2 | Polish | Download, error handling, prompt structure |
| 3 | Supply UX | Quick-select chip library + images |
| 4 | History | Session-based experiment recall |
| 5 | Smart Features | Substitutions + difficulty ratings |
| 6 | Classroom Ready | Printable student worksheets |
