from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from typing import Optional
from app.core.database import get_db
from app.models.bill import Bill, BillStatus

router = APIRouter()


@router.get("/summary")
async def analytics_summary(db: AsyncSession = Depends(get_db)):
    total   = await db.scalar(select(func.count(Bill.id)))
    enacted = await db.scalar(select(func.count(Bill.id)).where(Bill.status == BillStatus.ENACTED))
    sent_q  = await db.execute(select(Bill.sentiment_label, func.count(Bill.id)).group_by(Bill.sentiment_label))
    return {
        "total_bills":             total   or 0,
        "enacted_bills":           enacted or 0,
        "pass_rate":               round((enacted or 0) / max(total or 1, 1) * 100, 1),
        "sentiment_distribution":  {row[0]: row[1] for row in sent_q if row[0]},
    }


@router.get("/voting-trends")
async def voting_trends(
    chamber: Optional[str] = None,
    party: Optional[str]   = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(
        Bill.sponsor_party,
        func.sum(Bill.yea_votes).label("total_yea"),
        func.sum(Bill.nay_votes).label("total_nay"),
        func.sum(Bill.abstain_votes).label("total_abstain"),
        func.count(Bill.id).label("bill_count"),
    ).group_by(Bill.sponsor_party)
    if chamber: query = query.where(Bill.chamber      == chamber)
    if party:   query = query.where(Bill.sponsor_party == party)
    rows = (await db.execute(query)).fetchall()
    return {"voting_trends": [
        {"party": r.sponsor_party or "Unknown", "yea_votes": r.total_yea or 0,
         "nay_votes": r.total_nay or 0, "abstain_votes": r.total_abstain or 0,
         "bill_count": r.bill_count}
        for r in rows
    ]}


@router.get("/sentiment-over-time")
async def sentiment_over_time(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(text("""
        SELECT DATE_TRUNC('month', introduced_date) AS month,
               AVG(sentiment_score) AS avg_score, COUNT(*) AS bill_count
        FROM bills
        WHERE introduced_date IS NOT NULL AND sentiment_score IS NOT NULL
        GROUP BY 1 ORDER BY 1 DESC LIMIT 24
    """))).fetchall()
    return {"data": [{"month": str(r[0])[:7], "avg_sentiment": round(float(r[1]), 4),
                      "bill_count": r[2]} for r in rows]}


@router.get("/status-breakdown")
async def status_breakdown(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Bill.status, func.count(Bill.id)).group_by(Bill.status))).fetchall()
    return {"breakdown": [{"status": r[0], "count": r[1]} for r in rows]}


@router.get("/top-subjects")
async def top_subjects(limit: int = Query(10, ge=1, le=50), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(text("""
        SELECT subject, COUNT(*) as cnt
        FROM bills, jsonb_array_elements_text(subjects::jsonb) AS subject
        GROUP BY subject ORDER BY cnt DESC LIMIT :limit
    """), {"limit": limit})).fetchall()
    return {"subjects": [{"subject": r[0], "count": r[1]} for r in rows]}