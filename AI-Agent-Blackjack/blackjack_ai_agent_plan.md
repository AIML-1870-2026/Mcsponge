# Blackjack AI Agent — Development Plan

## Overview

A static single-file webpage (HTML, CSS, JavaScript) that implements a Blackjack-playing AI agent. The user provides their Anthropic API key via a `.env` file upload — the key is read in-memory only and never stored or transmitted beyond the API call. The agent reads the current game state, calls an LLM for a recommendation, and executes the action.

---

## Stage 1 — Core Game Engine

Build and validate the Blackjack game logic before any AI or UI work.

- Standard 52-card deck with shuffle
- Deal initial hands (2 cards to player, 2 to dealer — one dealer card face down)
- Hand scoring with correct Ace handling (11 unless it causes a bust, then 1)
- Determine available actions per game state:
  - **Split** — only available if player holds a pair
  - **Double** — only available on the player's first two cards
  - **Insurance** — only available when dealer's up-card is an Ace
  - **Hit / Stand** — always available during player's turn
- Dealer logic: dealer hits on 16 or less, stands on 17 or more
- Win/loss/push resolution and balance updates
- Starting balance: **$1,000**

**Deliverable:** Fully testable game logic, runnable in the browser console.

---

## Stage 2 — UI Layout

Build the interface to match the reference design. No AI integration yet — use placeholder values.

- Dark felt-style card table with **Dealer** and **Player** sections
- Card rendering: suit symbols, face card labels, face-down card placeholder
- Score display beneath each hand
- Current Bet indicator on the player side
- Action buttons: `HIT`, `STAND`, `DOUBLE`, `SPLIT`, `INSURANCE` (disable contextually)
- **Game Status** bar showing round outcome messages
- **AI recommends: --** label and **Execute Recommendation** button (wired but inactive)
- **AI Analysis** panel on the right (placeholder text)
- Header controls:
  - Model Family dropdown
  - Model dropdown
  - Bet Amount input
  - Balance display
  - `PLAY` button (disabled until model selected)
  - `REFRESH MODELS` button
- `ABOUT` modal

**Deliverable:** Fully interactive UI with working game flow, no AI calls.

---

## Stage 3 — API Key & LLM Integration

Connect the game to the Anthropic API.

- `.env` file upload input — parse `ANTHROPIC_API_KEY=...` in-memory only; never write to DOM, localStorage, or any external service
- `REFRESH MODELS` calls the Anthropic models endpoint to populate both dropdowns dynamically; group by model family
- On each player turn, send game state to the LLM:
  - Player hand (cards + score)
  - Dealer up-card
  - Available actions
  - Current balance and bet

**Key design decision — structured JSON output:**

Prompt the model to return a JSON object rather than free text, to avoid unreliable keyword parsing:

```json
{
  "action": "hit",
  "reasoning": "Player has 14 against dealer 7; basic strategy says hit."
}
```

Wrap parsing in a `try/catch`; fall back gracefully if the model returns prose. Display the `reasoning` in the **AI Analysis** panel and the `action` in the **AI recommends** label.

**Deliverable:** End-to-end AI recommendation loop working correctly.

---

## Stage 4 — Execute Recommendation & Polish

Wire the Execute Recommendation button and tighten the full game loop.

- `Execute Recommendation` reads the parsed action and triggers the corresponding game function (same as if the player clicked that action button manually)
- Validate that the AI's recommended action matches an actually available action before executing
- Console logging throughout for debugging: raw API request, raw response, parsed action, game state transitions
- Edge case handling: blackjack on deal, bust, push, dealer blackjack
- Graceful error states: invalid API key, network failure, malformed model response
- Disable action buttons and `PLAY` appropriately between states

**Deliverable:** Fully playable, end-to-end verified game with AI agent.

---

## Stage 5 — Stretch Challenges

### 5a — Multi-Hand / Deck Management

- Support multiple simultaneous player hands (from splits)
- Track cards dealt to prevent duplicates within a shoe
- Optional: configurable number of decks (1, 2, 4, 6, 8)

### 5b — Performance Analytics

- Track cumulative stats across hands:
  - Win rate (wins / total hands)
  - Bankroll history (chart or numeric display)
  - Decision quality: compare AI recommendation to basic strategy and flag deviations
- Display a summary panel or modal that updates after each hand
- Optional: export stats as a CSV

### 5c — Explainability Controls

- Add a toggle or dropdown for explanation detail level:
  - **Basic** — one-line action recommendation only (`"You should hit."`)
  - **Statistical** — includes probabilities and expected value (`"Hitting here wins 43% of the time vs. standing at 38%."`)
  - **In-depth** — full strategic breakdown referencing card counting context, deck composition, and edge cases
- Pass the selected detail level into the system prompt so the LLM calibrates its response length and depth accordingly

---

## Technical Reference

| Concern | Approach |
|---|---|
| API key security | Parse `.env` into a JS variable; never written to DOM or storage |
| Extracting AI action | Prompt for JSON: `{"action":"hit","reasoning":"..."}` |
| Ace scoring | Track as 11; subtract 10 if hand busts |
| Dealer logic | Hits on ≤16, stands on ≥17 |
| Balance tracking | JS variable updated after each hand resolves |
| Model population | Fetch from Anthropic models endpoint on `REFRESH MODELS` click |
| Error handling | `try/catch` on all API calls; display error in AI Analysis panel |
| Debugging | Log game state, raw request, raw response, and parsed action to console |

---

## Suggested Build Order Summary

1. Game engine (deck, deal, score, win/loss)
2. UI layout and manual game flow
3. `.env` parser + raw API call
4. JSON-based AI recommendation loop
5. Execute Recommendation wiring
6. Balance updates and full edge case coverage
7. Stretch: analytics, explainability controls, multi-deck support
