"""
Compare API — side by side comparison of two bills.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.core.database import get_db
from app.models.bill import Bill

router = APIRouter()


@router.get("/{bill_id_1}/{bill_id_2}")
async def compare_bills(
    bill_id_1: UUID,
    bill_id_2: UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Compare two bills side by side.
    Returns both bills with a computed similarity/difference analysis.
    """
    result1 = await db.execute(select(Bill).where(Bill.id == bill_id_1))
    bill1   = result1.scalar_one_or_none()
    if not bill1:
        raise HTTPException(status_code=404, detail=f"Bill {bill_id_1} not found")

    result2 = await db.execute(select(Bill).where(Bill.id == bill_id_2))
    bill2   = result2.scalar_one_or_none()
    if not bill2:
        raise HTTPException(status_code=404, detail=f"Bill {bill_id_2} not found")

    # Compute keyword overlap
    keywords1 = set(bill1.keywords or [])
    keywords2 = set(bill2.keywords or [])
    shared_keywords = list(keywords1 & keywords2)
    unique_to_1     = list(keywords1 - keywords2)
    unique_to_2     = list(keywords2 - keywords1)

    # Compute sentiment difference
    sentiment_diff = None
    if bill1.sentiment_score is not None and bill2.sentiment_score is not None:
        sentiment_diff = round(abs(bill1.sentiment_score - bill2.sentiment_score), 4)

    # Compute vote totals
    def vote_total(bill):
        return (bill.yea_votes or 0) + (bill.nay_votes or 0) + (bill.abstain_votes or 0)

    def bill_to_dict(bill: Bill) -> dict:
        return {
            "id":                   str(bill.id),
            "bill_number":          bill.bill_number,
            "title":                bill.title,
            "summary":              bill.summary,
            "sponsor":              bill.sponsor,
            "sponsor_party":        bill.sponsor_party,
            "chamber":              bill.chamber,
            "congress_session":     bill.congress_session,
            "status":               bill.status,
            "introduced_date":      str(bill.introduced_date)[:10] if bill.introduced_date else None,
            "subjects":             bill.subjects,
            "keywords":             bill.keywords,
            "sentiment_label":      bill.sentiment_label,
            "sentiment_score":      bill.sentiment_score,
            "sentiment_confidence": bill.sentiment_confidence,
            "yea_votes":            bill.yea_votes,
            "nay_votes":            bill.nay_votes,
            "abstain_votes":        bill.abstain_votes,
            "total_votes":          vote_total(bill),
            "source":               bill.source,
            "source_url":           bill.source_url,
        }

    return {
        "bill_1": bill_to_dict(bill1),
        "bill_2": bill_to_dict(bill2),
        "comparison": {
            "shared_keywords":    shared_keywords,
            "unique_to_bill_1":   unique_to_1,
            "unique_to_bill_2":   unique_to_2,
            "sentiment_diff":     sentiment_diff,
            "same_chamber":       bill1.chamber == bill2.chamber,
            "same_party":         bill1.sponsor_party == bill2.sponsor_party,
            "same_status":        bill1.status == bill2.status,
            "keyword_overlap_pct": round(
                len(shared_keywords) / max(len(keywords1 | keywords2), 1) * 100, 1
            ),
        },
    }