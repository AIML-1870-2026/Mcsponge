# Product Review Generator — spec.md

## Project Overview

Build a dynamic single-page web application that enables a user to generate product reviews using an LLM. The user provides product details, selects a model, adjusts sentiment, and receives a rendered review.

---

## Reference Code

The `temp/` folder contains a working LLM Switchboard project.
Use it as a reference for:
- How API keys are stored and accessed (in-memory from `.env`, never persisted)
- How API requests to LLM providers are constructed
- How model lists are fetched and cached
- How responses are handled and displayed

**Do NOT include `temp/` in the final build. It is reference only.**

---

## Specifications

### Models and providers
- **OpenAI models only** — no Anthropic dropdown, no provider switching
- The LLM Family dropdown is not required; use a single model selector for OpenAI models
- Fetch available OpenAI models on page load and populate the model dropdown dynamically (cache the result)

### API and data handling
- **API keys loaded from `.env`** — use the same in-memory-only pattern as the Switchboard
- Nothing stored, nothing persisted beyond the session
- **Unstructured responses** — the model returns free-form text, not JSON; no schema templates needed

### Response rendering
- **Markdown rendering** — the model's response will include markdown formatting (bold, lists, headings, etc.)
- Render the response as properly formatted HTML, not raw text
- Use a markdown parsing library (e.g. `marked.js`) to convert the response before displaying it

### Deployment
- **Single-file deployment** — deliver one `index.html` file, ready for GitHub Pages
- All HTML, CSS, and JavaScript must live in a single file
- No backend server required — API calls are made directly from the browser

### CORS note
Anthropic's API blocks direct browser requests (CORS). This project uses **OpenAI only** because their API allows browser-to-API calls without a backend server. This is a deliberate architectural decision, not a limitation.

---

## UI Requirements

### Basic Product Information section
- **Product Name** — text input (e.g. "Wireless Headphones")
- **Category** — dropdown (Electronics, Clothing, Food, Home, Sports, Other)
- **Length** — dropdown (Short, Medium, Long)
- **Style** — dropdown (Conversational, Formal, Humorous, Critical)
- **Comments** — textarea for key features, strengths, weaknesses, or advanced instructions

### LLM and Sentiment Selection section
- **Model** — dropdown populated dynamically from OpenAI's model list
- **Sentiment slider** — range input from 0 to 100
  - 0 = very negative, 50 = neutral, 100 = very positive
  - Display an emoji indicator that updates in real time based on slider value
  - Map the slider value to descriptive language injected into the prompt

### Generated Review section
- Display area for the rendered review output
- Show a loading indicator while the request is in flight
- Include a copy-to-clipboard button
- Default state: "No review generated yet."

---

## Prompt Engineering

The system prompt should establish the model as an experienced product reviewer.

User message template:

```
Write a [length] [style] product review for "[Product Name]" in the [Category] category.
Sentiment level: [mapped descriptor based on slider — e.g. very negative / mixed / mostly positive / enthusiastic].
Additional context: [comments field content, if provided].
Format the review using markdown with appropriate headings, bullet points, and emphasis.
```

---

## Development Phases

### Phase 1 — Project setup
- Create `index.html` with all HTML, CSS, and JS in one file
- Set up `.env` for the OpenAI API key
- Add the `temp/` reference folder (Switchboard code, no `.git` or `.gitignore`)

### Phase 2 — Model discovery
- On page load, call OpenAI's `/v1/models` endpoint
- Filter to chat-capable models only
- Cache the result and populate the model dropdown

### Phase 3 — Core review generation
- Build the prompt template using all form inputs
- Map the sentiment slider (0–100) to a descriptive word/phrase
- POST to OpenAI `/v1/chat/completions` with the selected model
- Display a loading indicator during the request

### Phase 4 — Markdown rendering
- Parse the LLM response using `marked.js` (or equivalent)
- Inject rendered HTML into the review output area
- Sanitize output to prevent XSS

### Phase 5 — Polish
- Add copy-to-clipboard button
- Add error handling for failed API calls or missing API key
- Validate that Product Name is filled before allowing generation
- Ensure the page is responsive and readable on mobile

### Phase 6 — Stretch challenges (optional enhancements)

#### Multiple sentiment layers
- Replace the single sentiment slider with per-aspect sliders: **Price**, **Features**, **Usability**, **Design**
- Each slider independently maps to a descriptor
- Inject all four sentiment values into the prompt as structured context

#### Rich UI components
- Replace the Length and Style dropdowns with interactive sliders or button-toggle groups
- Add a live character count on the Comments textarea
- Add a "randomize" button that fills in sample product info for quick testing

#### Review history
- Keep an in-session log of previously generated reviews
- Display them in a collapsible sidebar or accordion below the main form
- Allow the user to click any past review to reload the inputs that generated it

#### Export options
- Add a "Download as .txt" button that saves the plain-text review
- Add a "Copy as Markdown" button that copies the raw markdown (not the rendered HTML)

---

## Acceptance Criteria

- [ ] Page loads and fetches OpenAI models without errors
- [ ] All form fields are present and functional
- [ ] Sentiment slider updates the emoji in real time
- [ ] Clicking "Generate Review" sends the correct prompt to the selected model
- [ ] Response is rendered as formatted HTML (not raw markdown text)
- [ ] Copy button copies the review to clipboard
- [ ] Error states are handled gracefully
- [ ] Everything works from a single `index.html` file
- [ ] `temp/` folder is excluded from the final deliverable
