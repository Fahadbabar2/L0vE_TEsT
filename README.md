# 💘 Love Test — Backend

A Node.js + Express backend for **Love Test**, a couple compatibility game.

**Flow:**
1. Girl answers 8 questions about herself → creates a session → gets a shareable link.
2. She sends the link to the boy.
3. Boy opens the link, answers the same 8 questions, guessing her answers.
4. Backend compares them, calculates a Love % (`correct / 8`), and generates a love-themed chat narrative.

Data is saved permanently to a JSON file on disk (`db/sessions.json`) — no external database server, no native compilation, works identically on Windows/Mac/Linux.

---

## Setup

```bash
cd love-test-backend
npm install
cp .env.example .env
npm start
```
(On Windows Command Prompt, use `copy .env.example .env` instead of `cp`)

Server runs at `http://localhost:5000`.

For auto-reload during development:
```bash
npm run dev
```

---

## The 8 Questions

| key | Girl is asked | Boy is asked |
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

Base URL: `http://localhost:5000/api`

### 1. Get questions for the girl
```
GET /questions/girl
```

### 2. Get questions for the boy
```
GET /questions/boy?girlName=Aisha
```

### 3. Create a session (girl submits her answers)
```
POST /sessions
Content-Type: application/json

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
👉 Build a link like `https://yourapp.com/boy?session=uuid-here` and let the girl share it (copy button / WhatsApp share).

### 4. Check session status
```
GET /sessions/:id
```

### 5. Boy submits his guesses (triggers scoring)
```
POST /sessions/:id/boy-answers
Content-Type: application/json

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
**Response** — full result, including the generated chat:
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
    "breakdown": [ { "id": 1, "key": "favColor", "label": "Favorite Color", "girlAnswer": "Pink", "boyAnswer": "Pink", "correct": true }, ... ],
    "chat": [
      { "sender": "system", "text": "💌 Love Test Results for Ali & Aisha" },
      { "sender": "cupid", "text": "Aww, this is really sweet. 💕" },
      { "sender": "cupid", "text": "✅ Ali got \"Favorite Color\" right! ..." },
      { "sender": "cupid", "text": "❌ For \"Favorite Food\", he guessed \"Karahi\" but Aisha actually said \"Biryani\". ..." },
      { "sender": "cupid", "text": "📊 Final Score: 6/8 correct — that's a 75% Love Match!" }
    ]
  }
}
```
👉 Render `result.chat` as a chat bubble UI in Loveable — that's the "love themed chat" experience.

### 6. Fetch result later (e.g. reload page)
```
GET /sessions/:id/result
```

---

## Answer Matching Logic

Answers are compared leniently, not with strict string equality:
- Case, punctuation, and extra spacing are ignored.
- If one answer contains the other (e.g. "Rooftop" vs "Rooftop at sunset"), it still counts as **correct**.

Tweak `isMatch()` in `utils/loveEngine.js` for stricter or fuzzier matching.

## Love % Tiers
- 100% → `soulmates`
- 75–99% → `deeply_in_love`
- 50–74% → `good_connection`
- 25–49% → `needs_more_talks`
- 0–24% → `just_getting_started`

---

## Connecting Your Loveable Frontend

1. Deploy this backend (Render, Railway, Fly.io all work fine) or run locally for testing.
2. In Loveable, set an environment variable / config for the API base URL.
3. CORS is already enabled for all origins (tighten in `server.js` for production if you want).
4. Typical frontend flow:
   - Screen 1: fetch `/questions/girl`, girl fills form → `POST /sessions` → get `sessionId` → show a shareable link `yourapp.com/boy?session=SESSION_ID`.
   - Screen 2: boy opens link → fetch `/questions/boy?girlName=...` → fills form → `POST /sessions/:id/boy-answers`.
   - Screen 3: show `result.chat` as an animated chat bubble reveal, then the big percentage number.

## Project Structure
```
love-test-backend/
├── server.js                  # Express app entry point
├── db/database.js             # JSON-file storage (sessions.json)
├── data/questions.js          # The 8 questions (girl & boy phrasing)
├── controllers/sessionController.js
├── routes/sessionRoutes.js
└── utils/loveEngine.js        # Matching, scoring, chat generation
```
