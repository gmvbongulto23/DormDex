# DormDex
Know the place before you sign. Student-verified reviews, true monthly cost (rent + utilities), and safety insights for off-campus housing near CSUEB. Built for MESA U Hacks 3.0.

## Run locally
Backend (http://localhost:8000, docs at /docs):
    cd backend && python -m venv venv && source venv/bin/activate
    pip install -r requirements.txt && python seed.py --summaries && uvicorn main:app --reload

Frontend (http://localhost:5173):
    cd frontend && npm install
    cp .env.example .env    # or leave .env out to use built-in mock data
    npm run dev

All listings, landlords and reviews in the seed data are fictional.
