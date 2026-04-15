# LLM Switchboard — website plan

## Overview

A two-column web tool for sending prompts to OpenAI and Anthropic models, comparing outputs, switching between unstructured and structured output modes, and tracking response quality metrics. The UI is clean and tool-like — a fixed left sidebar for configuration and a right panel for prompt input and output.

---

## Features

### Core features (from reference UI)

- **API key setup** — inline text inputs for OpenAI and Anthropic keys, held in memory only, never stored or transmitted beyond the model APIs
- **Provider selector** — toggle between OpenAI and Anthropic
- **Model selector** — dropdown that populates based on the active provider
- **Output mode toggle** — switch between Unstructured (free text) and Structured (JSON) output
- **Example prompts** — a set of clickable chips that load pre-written prompts into the input area
- **Prompt input** — a monospaced textarea with a live character count
- **Send button** — submits the prompt to the selected model and displays the response

### Advanced features (planned for later stages)

- **Response metrics dashboard** — tracks and displays response time, token count (if returned by the API), and response length; includes a small panel to help users understand the cost and speed trade-offs between models
- **Structured output validator** — after receiving a JSON response, validates it against the user-provided schema; highlights which fields matched, which were missing, and which had unexpected types, producing a visual "report card" for the model's schema compliance

---

## UI design direction

Unlike the reference UI (a single scrolling card on a dark background), this redesign uses:

- A **two-column split layout**: left sidebar for configuration, right panel for prompt and output
- **Flat, minimal surfaces** — no decorative backgrounds, no gradients
- A **monospaced prompt area** to reinforce the developer-tool feel
- **Inline key inputs** with status indicator dots (gray = not set, green = live) instead of a file upload drop zone
- **Segmented chips** for provider selection rather than pill toggles

---

## Development stages

### Stage 1 — Project setup and scaffolding

Goals: get a working skeleton in place before any real features land.

- Initialise the project with Next.js (App Router) and TypeScript
- Set up Tailwind CSS with a minimal design token config
- Create the two-column shell layout (sidebar + main panel)
- Add placeholder sections for each sidebar block: API keys, provider, model, output mode
- Add a placeholder prompt area and send button in the main panel
- Set up environment variable handling and a `.env.local` template
- Configure ESLint and Prettier

Deliverable: a running dev server showing the correct layout with no functionality.

---

### Stage 2 — API key management and provider/model selection

Goals: allow users to configure their credentials and choose a model.

- Build the API key input fields for OpenAI and Anthropic
- Store keys in React state only (never persisted to localStorage or sent to a server)
- Add the live status indicator dot per provider (gray → green when a key is entered)
- Display the "keys held in memory only" notice beneath the inputs
- Build the provider selector (OpenAI / Anthropic chip toggle)
- Build the model dropdown, populated dynamically based on the selected provider
- Hardcode initial model lists; make it easy to update as new models are released

Deliverable: users can enter keys, select a provider, and choose a model. No API calls yet.

---

### Stage 3 — Prompt input and unstructured output

Goals: send a real prompt and display the response.

- Build the prompt textarea with live character count
- Add the example prompt chips and wire them to load content into the textarea
- Implement the API call layer — a thin abstraction over the OpenAI and Anthropic SDKs
- Handle loading state (disable send button, show a spinner in the output panel)
- Display the raw text response in the output panel
- Handle and display API errors gracefully (invalid key, rate limit, network failure)

Deliverable: the core loop works — enter a prompt, hit send, see a response.

---

### Stage 4 — Structured output mode

Goals: let users define a JSON schema and receive structured responses.

- Add the Unstructured / Structured toggle to the sidebar
- When Structured is active, reveal a JSON schema textarea below the toggle
- Pass the schema to the API using the appropriate structured output parameter for each provider (OpenAI `response_format`, Anthropic tool use / JSON mode)
- Display the JSON response in the output panel with syntax highlighting
- Show a parse error notice if the response is not valid JSON

Deliverable: both output modes are fully functional.

---

### Stage 5 — Response metrics dashboard

Goals: give users visibility into cost and speed trade-offs between models.

- Capture response time (start timer on send, stop on first token / full response)
- Extract token counts from the API response where available (prompt tokens, completion tokens, total)
- Calculate approximate cost based on published per-token pricing for each model
- Display a small metrics panel below the output area showing:
  - Response time (ms or seconds)
  - Token count (prompt / completion / total)
  - Estimated cost in USD
  - Response length in characters
- Persist the last N responses in state so users can compare metrics across runs
- Add a simple comparison bar (e.g. two mini stat cards side by side) when the user has run the same prompt on two different models

Deliverable: users can see and compare response time, token usage, cost, and length for each run.

---

### Stage 6 — Structured output validator

Goals: give users a "report card" showing how well the model followed their schema.

- After receiving a JSON response in Structured mode, run client-side validation against the user's schema using a library such as `ajv`
- Produce a validation result object with three categories:
  - Fields that matched the schema correctly
  - Fields that were present but had an unexpected type
  - Fields that were missing entirely from the response
- Render a visual report card below the JSON output:
  - A row per expected field with a colour-coded status indicator (green = matched, amber = wrong type, red = missing)
  - A summary line (e.g. "8 / 10 fields valid")
- Make the report card collapsible so it does not crowd the output on simple schemas

Deliverable: users get immediate, structured feedback on model schema compliance.

---

### Stage 7 — Polish and hardening

Goals: make the tool reliable and presentable enough to share.

- Add keyboard shortcuts (e.g. Cmd+Enter to send)
- Improve mobile layout (collapse sidebar into a drawer on narrow screens)
- Add a reset / clear button for the output panel and metrics
- Write unit tests for the API abstraction layer and the schema validator logic
- Document the codebase (README with setup instructions, API key requirements, and local development steps)
- Final accessibility pass: labels, focus order, ARIA roles on custom controls

Deliverable: a polished, tested, shareable tool.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| OpenAI integration | `openai` npm package |
| Anthropic integration | `@anthropic-ai/sdk` npm package |
| JSON schema validation | `ajv` |
| Syntax highlighting | `shiki` or `prism-react-renderer` |

---

## Key constraints

- API keys must never leave the browser — all requests go directly from the client to the provider APIs
- The app has no backend and no database — it is a fully client-side tool
- Token pricing constants should be easy to update in a single config file as providers change their rates
