---
title: Love Test Backend
emoji: 💘
colorFrom: pink
colorTo: red
sdk: docker
app_port: 7860
pinned: false
---

# 💘 Love Test — Backend API

A Node.js + Express backend powering **Love Test**, a romantic couple-compatibility game. This service handles the game logic: collecting each partner's answers, comparing them, scoring the match, and generating a Cupid-narrated love-chat reveal.

**Live frontend:** [heart-script-glow.vercel.app](https://heart-script-glow.vercel.app/)

---

## How the game works

1. **She answers first.** The girl answers 8 personal questions about herself and their relationship. This creates a session and returns a unique link.
2. **She shares the link.** She sends that link to her partner.
3. **He guesses.** The boy opens the link and answers the same 8 questions — guessing what she said.
4. **Cupid reveals the result.** The backend compares both sets of answers, calculates a Love % (`correct ÷ 8`), and generates a warm, romantic chat narrating what he got right, what he missed, and the final score.

Data is persisted to a JSON file on disk (`db/sessions.json`) — no external database, no native compilation required. Runs identically on Windows, macOS, and Linux.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express |
| Storage | File-based JSON store (zero native dependencies) |
| Frontend | Built separately in Loveable, hosted on Vercel |
| Backend hosting | Docker container on Hugging Face Spaces |

---

## Project Structure

```
love-test-backend/
├── Dockerfile                  # Container config for Hugging Face Spaces
├── .dockerignore
├── server.js                   # Express app entry point
├── db/
│   └── database.js             # JSON-file storage (sessions.json)
├── data/
│   └── questions.js            # The 8 questions (girl & boy phrasing)
├── controllers/
│   └── sessionController.js    # Request handling & business logic
├── routes/
│   └── sessionRoutes.js        # API route definitions
└── utils/
    └── loveEngine.js           # Answer matching, scoring, chat generation
```

---

## Running Locally

```bash
git clone https://github.com/Fahadbabar2/LoVE_TEsT.git
cd LoVE_TEsT
npm install
cp .env.example .env
npm start
```
(On Windows Command Prompt, use `copy .env.example .env` instead of `cp`)

The server starts at `http://localhost:5000`. For auto-reload during development:
```bash
npm run dev
```

---

## Deployment (Hugging Face Spaces)

This repo ships with a `Dockerfile` and Hugging Face metadata (the YAML block at the top of this file), so it deploys directly as a **Docker Space**.

1. Push this repo to GitHub (already done ✅).
2. Create a new Space at [huggingface.co/new-space](https://huggingface.co/new-space) with **SDK: Docker**.
3. Add this repo as a git remote and push:
   ```bash
   git remote add space https://huggingface.co/spaces/YOUR_HF_USERNAME/love-test-backend
   git push space main
   ```
4. Once the build finishes, the API is live at:
   ```
   https://YOUR_HF_USERNAME-love-test-backend.hf.space
   ```

> ⚠️ **Storage note:** Hugging Face Spaces rebuild the container on restarts/redeploys, which wipes `db/sessions.json`. This is fine for demos and testing, but for production use with real user data, swap the storage layer for a persistent database (e.g. MongoDB Atlas free tier or a hosted Postgres instance).

---

## The 8 Questions

| Key | Girl is asked | Boy is asked |
|---|---|---|
| `favColor` | What is your favorite color? | What is her favorite color? |
| `favFood` | What is your favorite food? | What is her favorite food? |
| `firstMeet` | Where did you two first meet? | Where did you two first meet? |
| `firstKiss` | Where/when was your first kiss? | Where/when was your first kiss? |
| `firstILoveYou` | Who said "I love you" first, and where? | Who said "I love you" first, and where? |
| `favMemory` | What is your favorite memory together? | What is her favorite memory together? |
| `dreamDate` | What is your dream date? | What is her dream date? |
| `loveMost` | One thing you love most about your partner? | One thing she loves most about you? |

---

## API Reference

Base URL (local): `http://localhost:5000/api`
Base URL (production): `https://YOUR_HF_USERNAME-love-test-backend.hf.space/api`

### `GET /questions/girl`
Returns the 8 questions phrased for the girl.

### `GET /questions/boy?girlName=Aisha`
Returns the 8 questions phrased for the boy, personalized with her name.

### `POST /sessions`
Girl submits her answers. Creates a new session.

**Request**
```json
{
  "girlName": "Aisha",
  "boyName": "Ali",
  "answers": {
    "favColor": "Pink",
    "favFood": "Biryani",
    "firstMeet": "College canteen",
    "firstKiss": "On the rooftop, sunset",
    "firstILoveYou": "He said it first, at the park",
    "favMemory": "Our road trip to Murree",
    "dreamDate": "A quiet beach dinner",
    "loveMost": "How he always makes me laugh"
  }
}
```

**Response**
```json
{ "sessionId": "uuid-here", "status": "waiting_for_boy" }
```
Build a shareable link like `https://heart-script-glow.vercel.app/boy?session=uuid-here` for the girl to send.

### `GET /sessions/:id`
Checks the status of a session (`waiting_for_boy` or `completed`).

### `POST /sessions/:id/boy-answers`
Boy submits his guesses. Triggers scoring and generates the love chat.

**Request**
```json
{
  "boyName": "Ali",
  "answers": {
    "favColor": "Pink",
    "favFood": "Karahi",
    "firstMeet": "College canteen",
    "firstKiss": "Rooftop at sunset",
    "firstILoveYou": "I said it first at the park",
    "favMemory": "Our trip to Murree",
    "dreamDate": "Movie night at home",
    "loveMost": "That she's always honest"
  }
}
```

**Response**
```json
{
  "sessionId": "uuid-here",
  "status": "completed",
  "result": {
    "girlName": "Aisha",
    "boyName": "Ali",
    "percentage": 75,
    "correctCount": 6,
    "total": 8,
    "tier": "deeply_in_love",
    "breakdown": [
      { "id": 1, "key": "favColor", "label": "Favorite Color", "girlAnswer": "Pink", "boyAnswer": "Pink", "correct": true }
    ],
    "chat": [
      { "sender": "system", "text": "💌 A Love Letter From Cupid — Ali & Aisha" },
      { "sender": "cupid", "text": "Ohh, my arrow is glowing warm on this one. 💕 Let's see how well this heart was studied..." },
      { "sender": "cupid", "text": "💘 Ali remembered — \"Favorite Color\" is \"Pink\". A heart that truly listens." },
      { "sender": "cupid", "text": "💭 Ali guessed \"Karahi\" for \"Favorite Food\", but Aisha's heart actually said \"Biryani\". A little detail to fall in love with, next time." },
      { "sender": "cupid", "text": "💗 The verdict is in: 6 out of 8 pieces of her heart, Ali carries with him — a 75% Love Match." },
      { "sender": "cupid", "text": "This is what real attention looks like — a love that listens. Keep whispering these little details to each other. 💗🌹" }
    ]
  }
}
```
Render `result.chat` as an animated chat-bubble reveal in the frontend — this is the emotional centerpiece of the app.

### `GET /sessions/:id/result`
Fetches a completed session's result again (e.g. on page reload).

---

## Answer Matching Logic

Answers are compared leniently, not with strict string equality:
- Case, punctuation, and extra spacing are ignored.
- If one answer contains the other (e.g. "Rooftop" vs. "Rooftop at sunset"), it still counts as **correct**.

Adjust `isMatch()` in `utils/loveEngine.js` for stricter or fuzzier matching.

## Love % Tiers

| Percentage | Tier |
|---|---|
| 100% | `soulmates` |
| 75–99% | `deeply_in_love` |
| 50–74% | `good_connection` |
| 25–49% | `needs_more_talks` |
| 0–24% | `just_getting_started` |

Each tier has its own set of romantic Cupid-narrated intro/outro lines in `utils/loveEngine.js`.

---

## Connecting the Frontend (Loveable → Vercel)

1. In the Loveable project, set the API base URL to the deployed Hugging Face Space:
   `https://YOUR_HF_USERNAME-love-test-backend.hf.space/api`
2. CORS is enabled for all origins by default (tighten in `server.js` for production if needed).
3. Typical flow:
   - **Screen 1:** fetch `/questions/girl` → she fills the form → `POST /sessions` → get `sessionId` → show a shareable link.
   - **Screen 2:** he opens the link → fetch `/questions/boy?girlName=...` → fills the form → `POST /sessions/:id/boy-answers`.
   - **Screen 3:** render `result.chat` as an animated bubble reveal, then the final Love %.

---

## License

MIT — free to use and modify.
