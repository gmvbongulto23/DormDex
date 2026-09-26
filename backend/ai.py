"""AI review summaries with Gemini. Falls back to a rule-based summary if no key or the call fails,
so the demo never breaks."""
import os

MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def _fallback_summary(reviews) -> str:
    n = len(reviews)
    avg = lambda f: sum(getattr(r, f) for r in reviews) / n
    parts = []
    parts.append("Landlord rated well" if avg("landlord_rating") >= 4 else
                 "Mixed landlord feedback" if avg("landlord_rating") >= 3 else "Landlord often rated poorly")
    parts.append("maintenance is reliable" if avg("maintenance_rating") >= 4 else
                 "maintenance is hit or miss" if avg("maintenance_rating") >= 3 else "maintenance complaints are common")
    parts.append("residents feel safe" if avg("safety_rating") >= 4 else "some safety concerns reported")
    return f"{parts[0]}; {parts[1]}; {parts[2]}. Based on {n} student review{'s' if n != 1 else ''}."


def summarize_reviews(listing, reviews) -> str:
    if not reviews:
        return "No reviews yet. Be the first to share your experience."

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return _fallback_summary(reviews)

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        review_text = "\n".join(
            f"- ({r.overall_rating}/5, utilities ${r.monthly_utilities}/mo) {r.text}" for r in reviews
        )
        prompt = (
            f"You summarize student housing reviews for '{listing.name}' (landlord: {listing.landlord_name}).\n"
            "Write 2 short sentences, max 40 words total, plain language. Cover landlord responsiveness, "
            "maintenance, and any cost or safety patterns. Only use facts in the reviews. No preamble.\n\n"
            f"Reviews:\n{review_text}"
        )
        resp = client.models.generate_content(model=MODEL, contents=prompt)
        text = (resp.text or "").strip()
        return text or _fallback_summary(reviews)
    except Exception as e:  # network, quota, bad key
        print(f"[ai] Gemini failed, using fallback: {e}")
        return _fallback_summary(reviews)
