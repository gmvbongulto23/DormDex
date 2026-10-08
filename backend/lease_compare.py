"""Compare two leases with Gemini or the existing keyword checker."""
import json
import os
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from ai import MODEL
from lease import LeaseCheck, _basic_check

router = APIRouter()


class LeaseCompareIn(BaseModel):
    lease_a: str = Field(min_length=50, max_length=20000)
    lease_b: str = Field(min_length=50, max_length=20000)


class LeaseCompareResult(BaseModel):
    summary: str
    lease_a: LeaseCheck
    lease_b: LeaseCheck
    recommendation: str


def _ai_compare(lease_a: str, lease_b: str) -> Optional[LeaseCompareResult]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    try:
        from google import genai

        prompt = (
            "Compare these two student housing leases. Assess each lease separately using plain English, "
            "quote exact wording for red flags, list costs and suggest questions. Recommend which lease "
            "appears less risky based only on the provided text. Return the requested JSON schema.\n\n"
            f"LEASE A:\n{lease_a}\n\nLEASE B:\n{lease_b}"
        )
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json", "response_schema": LeaseCompareResult},
        )
        return LeaseCompareResult.model_validate(json.loads(response.text))
    except Exception as error:
        print(f"[lease_compare] Gemini failed, using basic comparison: {str(error)[:150]}")
        return None


def _basic_compare(lease_a: str, lease_b: str) -> LeaseCompareResult:
    result_a = _basic_check(lease_a)
    result_b = _basic_check(lease_b)
    risk_weight = {"high": 3, "medium": 2, "low": 1}
    risk_a = sum(risk_weight[flag.severity] for flag in result_a.red_flags)
    risk_b = sum(risk_weight[flag.severity] for flag in result_b.red_flags)

    if risk_a < risk_b:
        recommendation = "Lease A has fewer keyword-detected red flags; confirm the details with the landlord."
    elif risk_b < risk_a:
        recommendation = "Lease B has fewer keyword-detected red flags; confirm the details with the landlord."
    else:
        recommendation = "The leases have the same keyword-detected risk score; compare the listed costs and ask questions."

    summary = (
        f"Basic comparison: Lease A has {len(result_a.red_flags)} red flags and {len(result_a.costs)} listed costs; "
        f"Lease B has {len(result_b.red_flags)} red flags and {len(result_b.costs)} listed costs."
    )
    return LeaseCompareResult(
        summary=summary,
        lease_a=result_a,
        lease_b=result_b,
        recommendation=recommendation,
    )


@router.post("/lease/compare")
def compare_leases(body: LeaseCompareIn):
    ai_result = _ai_compare(body.lease_a, body.lease_b)
    result = ai_result or _basic_compare(body.lease_a, body.lease_b)
    return {"source": "ai" if ai_result else "basic", **result.model_dump()}