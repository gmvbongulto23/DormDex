"""AI lease checker: flags hidden fees, deposit rules and risky clauses in plain language.

Uses Gemini when available. If there's no key, the quota runs out, or the call fails,
a keyword-based checker runs instead so the feature never breaks during a demo.
"""
import json
import os
import re
from typing import List, Literal, Optional

from pydantic import BaseModel, Field

from ai import MODEL  # same Gemini model as the review summaries (loads .env)


# ---------- Result shape (shared by the AI and the basic checker) ----------
class RedFlag(BaseModel):
    title: str = Field(description="Short name of the issue, e.g. 'Non-refundable deposit'")
    severity: Literal["high", "medium", "low"]
    quote: str = Field(description="The exact lease wording this is based on, max ~25 words")
    why: str = Field(description="One plain-language sentence on why a student should care")


class CostItem(BaseModel):
    item: str = Field(description="What the charge is, e.g. 'Security deposit'")
    amount: str = Field(description="Amount as written, e.g. '$1,500' or '10% of rent'")
    note: Optional[str] = Field(default=None, description="Refundable? When is it charged?")


class LeaseCheck(BaseModel):
    summary: str = Field(description="2-3 plain-language sentences for a first-time renter")
    red_flags: List[RedFlag]
    costs: List[CostItem]
    questions: List[str] = Field(description="3-6 questions to ask the landlord before signing")


PROMPT = """You help college students, including first-time and international renters, understand a lease before signing.
Read the lease text below and return JSON only.

Rules:
- Use plain, simple English. No legal jargon.
- red_flags: clauses that could cost the student money or surprise them: non-refundable or high deposits,
  extra fees (cleaning, admin, parking, pets, late fees), automatic renewal, early termination penalties,
  utilities not included, joint liability with roommates, landlord entry without notice, repairs charged to tenant.
  Quote the exact lease wording. Only include things actually in the text.
- costs: every dollar amount or fee in the lease.
- questions: specific questions the student should ask the landlord, based on what's unclear or risky.
- If the text is not a lease, say so in the summary and return empty lists.

Lease text:
\"\"\"
{text}
\"\"\""""


# ---------- Gemini ----------
def _ai_check(text: str) -> Optional[LeaseCheck]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        resp = client.models.generate_content(
            model=MODEL,
            contents=PROMPT.format(text=text),
            config={"response_mime_type": "application/json", "response_schema": LeaseCheck},
        )
        return LeaseCheck.model_validate(json.loads(resp.text))
    except Exception as e:  # quota, network, bad JSON
        print(f"[lease] Gemini failed, using basic checker: {str(e)[:150]}")
        return None


# ---------- Basic keyword checker (fallback) ----------
RULES = [
    # (pattern, title, severity, why)
    (r"non[- ]?refundable", "Non-refundable charge", "high",
     "You won't get this money back, even if you leave the place clean."),
    (r"automatic(ally)? renew|auto[- ]?renew|renews? automatically", "Automatic renewal", "high",
     "The lease may renew on its own unless you give notice by a deadline."),
    (r"early termination|break(ing)? (the|this) lease|terminat\w+ (this|the) lease early", "Early termination penalty", "high",
     "Leaving before the lease ends could cost you extra fees or rent."),
    (r"jointly and severally|joint(ly)? and several", "Joint liability with roommates", "high",
     "You could be responsible for the full rent or damages if a roommate doesn't pay."),
    (r"(tenant|resident|lessee)s? (is|are|shall be)? ?responsible for (all )?(the )?utilit|utilities (are )?not included", "Utilities not included", "medium",
     "Your real monthly cost will be higher than the rent."),
    (r"late (fee|charge)", "Late fee", "medium", "Paying rent late adds extra charges."),
    (r"cleaning fee|carpet cleaning", "Cleaning fee", "medium", "Money may be taken from your deposit or charged at move-out."),
    (r"(application|admin(istrative)?|processing) fee", "Extra upfront fee", "medium", "Adds to what you pay before moving in."),
    (r"parking", "Parking terms", "low", "Parking may cost extra or be limited."),
    (r"pet (fee|deposit|rent)", "Pet charges", "low", "Pets may add fees or monthly rent."),
    (r"(enter|access) the (premises|unit|apartment)", "Landlord entry", "low",
     "Check how much notice the landlord must give before entering."),
    (r"(cost|pay) (of |for )?(any )?repair|responsible for .{0,40}repair", "Repair costs", "low", "Check which repairs you would have to pay for."),
]
MONEY = re.compile(r"\$\s?\d{1,3}(?:,\d{3})+(?:\.\d{2})?|\$\s?\d+(?:\.\d{2})?")


def _sentences(text: str) -> List[str]:
    # skip headings like "7. EARLY TERMINATION." so quotes are real sentences
    parts = [s.strip() for s in re.split(r"(?<=[.;])\s+|\n+", text) if s.strip()]
    return [s for s in parts if len(s.split()) >= 5]


def _short(s: str, words: int = 25) -> str:
    w = s.split()
    return " ".join(w[:words]) + ("…" if len(w) > words else "")


def _basic_check(text: str) -> LeaseCheck:
    sentences = _sentences(text)
    flags, seen = [], set()
    for pattern, title, severity, why in RULES:
        for s in sentences:
            if re.search(pattern, s, re.I) and title not in seen:
                flags.append(RedFlag(title=title, severity=severity, quote=_short(s), why=why))
                seen.add(title)
                break

    costs = []
    for s in sentences:
        matches = list(MONEY.finditer(s))
        for i, m in enumerate(matches):
            before = s[matches[i - 1].end() if i else 0:m.start()]            # words leading up to this amount
            after = s[m.end():matches[i + 1].start() if i + 1 < len(matches) else len(s)]
            label = " ".join(before.split()[-6:]).strip(" ,:-")
            label = re.sub(r"^(and|or|plus)\s+", "", label, flags=re.I)
            label = re.sub(r"^(tenant\s+)?(shall\s+|must\s+|will\s+)?pay\s+(a|an|the)?\s*", "", label, flags=re.I)
            label = re.sub(r"\s+(is|of|equal to|shall be)$", "", label, flags=re.I) or "Charge"
            refundable = re.search(r"non[- ]?refundable", before + after, re.I)
            costs.append(CostItem(item=label[:1].upper() + label[1:], amount=m.group().replace(" ", ""),
                                  note="Non-refundable" if refundable else None))
    costs = costs[:10]

    questions = ["Which utilities are included in rent, and what do past tenants usually pay per month?"]
    if "Non-refundable charge" in seen or any("deposit" in c.item.lower() for c in costs):
        questions.append("Exactly which parts of the deposit are refundable, and when will I get it back?")
    if "Automatic renewal" in seen:
        questions.append("How many days' notice do I need to give to avoid automatic renewal?")
    if "Early termination penalty" in seen:
        questions.append("What would it cost if I need to move out early (for example, after one semester)?")
    if "Joint liability with roommates" in seen:
        questions.append("If a roommate moves out or stops paying, what am I responsible for?")
    questions.append("Can I see the unit, and get any promises (repairs, parking) written into the lease?")

    high = sum(f.severity == "high" for f in flags)
    summary = (f"We found {len(flags)} thing{'s' if len(flags) != 1 else ''} to check"
               f"{f', including {high} important one' + ('s' if high != 1 else '') if high else ''}"
               f" and {len(costs)} dollar amount{'s' if len(costs) != 1 else ''}. "
               "This is a basic keyword check; read the full lease and ask the landlord about anything unclear.")
    return LeaseCheck(summary=summary, red_flags=flags, costs=costs, questions=questions[:6])


def check_lease(text: str) -> dict:
    ai = _ai_check(text)
    result = ai or _basic_check(text)
    return {"source": "ai" if ai else "basic", **result.model_dump()}
