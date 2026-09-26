# DormDex

**Know the place before you sign.**

DormDex helps college students find affordable, trustworthy off-campus housing near Cal State East Bay (Hayward, CA). Students see the **true monthly cost** of each place (rent + the utilities other students actually paid), read **reviews verified by school email**, and get an **AI summary** of what past tenants said.

Built for **MESA U Hacks 3.0: Designing in Your Neighborhood**.

- **Live site:** _add Vercel link_
- **API:** _add Render link_ (interactive docs at `/docs`)

---

## The problem

Students renting near urban campuses face rising rent, listings that leave out utilities and fees, and no trustworthy way to check a landlord before signing. The Hope Center's 2023–24 survey of 74,350 students found **48% experienced housing insecurity**.

We interviewed 8 students (commuters, first-time renters, grad students, roommate groups and international students). The patterns:

- **5 of 8:** listings look affordable until utilities and fees are added
- **8 of 8:** they trust specific, recent, verified reviews over generic praise
- **6 of 8:** how a landlord handles deposits, repairs and communication matters as much as the unit

---

## How to use DormDex

1. **Browse the map.** Open the site to see places near CSUEB. Each pin and card shows the **true monthly cost** (rent + median student-reported utilities).
2. **Filter and sort.** Narrow by max monthly cost, minimum safety score and bedrooms. Sort by cheapest, safest, top rated or closest.
3. **Open a listing.** See the cost breakdown, a roommate cost splitter, landlord / maintenance / safety ratings, an AI summary of all reviews, and every verified review with its date.
4. **Write a review.** Click **+ Write a review**, enter your **school email** (`@csueastbay.edu` or a subdomain like `@horizon.csueastbay.edu`), your ratings, your actual monthly utilities, and your experience.
5. **Verify.** Enter the 6-digit code sent to your email. Your review only counts after it's verified; then the true cost, ratings and AI summary update.

> **Demo mode:** when no email service is configured, the code is shown on screen in a yellow "Demo mode" box instead of being emailed, so the flow can be tested.

### Accessibility

- Every form field has a linked label; errors are announced to screen readers (`role="alert"`)
- Safety is shown as a word + number, never color alone
- Works fully by keyboard (Tab / Enter) and on phone screens
- Plain language ("true monthly cost", not jargon)

---

## Features

| Feature | What it does |
| --- | --- |
| True monthly cost | Rent + **median** utilities reported by verified students |
| Verified reviews | School-email domain check + one-time 6-digit code (15-min expiry, 5 attempts); unverified reviews never count |
| AI review summary | Gemini summarizes each listing's verified reviews in 2 sentences; cached so it's instant |
| Landlord scorecard | Average landlord, maintenance and safety ratings from verified reviews |
| Map + filters | Leaflet map around CSUEB; filter by cost, safety, bedrooms; 4 sort options |
| Roommate splitter | Splits the monthly cost across 1–5 roommates |

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React (Vite), Tailwind CSS, React Router, Leaflet / react-leaflet |
| Backend | Python, FastAPI, SQLAlchemy, SQLite |
| AI | Google Gemini API (`gemini-3.5-flash-lite`) via `google-genai` |
| Email | Resend API (optional; demo mode without it) |
| Hosting | Vercel (frontend), Render (backend) |

### How the pieces fit

```
React app (Vercel)  ──HTTP/JSON──>  FastAPI (Render)  ──>  SQLite database
                                         │
                                         ├──> Gemini API   (review summaries, cached in summaries.json)
                                         └──> Resend API   (verification codes; demo mode if unset)
```

---

## Run locally

**Requirements:** Python 3.11+, Node 18+

### Backend (http://localhost:8000, API docs at http://localhost:8000/docs)

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # then add your GEMINI_API_KEY
python seed.py                    # builds the database with 20 demo listings
uvicorn main:app --reload
```

### Frontend (http://localhost:5173)

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

Without `VITE_API_URL`, the frontend runs on built-in mock data (a "Mock" badge appears).

### Environment variables

| Variable | Where | Required | Purpose |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | backend | For AI summaries | Free key from [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | backend | No | Defaults to `gemini-3.5-flash-lite` |
| `ALLOWED_EMAIL_DOMAINS` | backend | No | Comma-separated school domains; defaults to `csueastbay.edu` |
| `RESEND_API_KEY` | backend | No | Sends real verification emails; without it, demo mode |
| `ALLOWED_ORIGINS` | backend | Production | Frontend URL(s) allowed by CORS; defaults to `*` |
| `VITE_API_URL` | frontend | Yes (for real data) | Backend URL |

### Seed data and AI summaries

- `python seed.py` rebuilds the database and reuses the AI summaries saved in `backend/summaries.json` (no Gemini calls).
- `python seed.py --summaries` also asks Gemini for any missing summaries (paced for the free tier) and saves them.

---

## API

| Method | Route | Description |
| --- | --- | --- |
| GET | `/listings` | Listings with true cost; query: `max_cost`, `min_safety`, `bedrooms`, `sort` (`true_cost`, `safety`, `rating`, `distance`) |
| GET | `/listings/{id}` | One listing with verified reviews, AI summary and rating averages |
| GET | `/listings/{id}/summary` | AI summary (generated and cached if missing) |
| POST | `/listings/{id}/reviews` | Submits a review as **pending**; returns `review_id` (and `demo_code` in demo mode) |
| POST | `/reviews/{review_id}/verify` | Body `{ "code": "123456" }`; verifies the review so it counts |

---

## Data disclaimer

All listings, landlords, addresses and seed reviews are **fictional demo data** generated by `backend/seed.py`, so we never misrepresent real landlords. Safety scores are **demo scores**, not real crime data. Reviews submitted through the site, the verification flow and the AI summaries are live.

---

## AI assistance

We used AI tools during this hackathon and want to be transparent about how:

- **Claude (Anthropic)** helped us plan the architecture, generate starter code for the FastAPI backend and React frontend, write the seed data script, debug errors, and draft documentation. We reviewed, ran, tested and modified all generated code, and we can explain every file.
- **Google Gemini** is part of the product: it writes the 2-sentence review summary for each listing from the verified reviews.

Our own work: the problem research and student interviews, product decisions, UI design, integrating and testing the frontend and backend, and deployment.

---

## What's next

- Send real verification emails (Resend with a verified domain)
- Replace demo safety scores with Hayward open crime data
- "Deposit returned?" and "Did rent match the listing?" review questions (requested in our interviews)
- Reviews tagged by student type (e.g. international students), with consent
- Expand to other CSU and UC campuses; partner with campus housing offices
- Postgres for persistent production data; rate limiting on review submissions

---

## Team

| Name | Role |
| --- | --- |
| Guia Mae Bongulto | Technical Lead: backend, AI, integration |
| Ashna _(last name)_ | Designer / UX Lead: frontend, accessibility |
| _(teammate)_ | _(role)_ |
