from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.core.database import get_db
from app.models.bill import Bill

router = APIRouter()

@router.get("/")
async def search_bills(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db)
):
    query = select(Bill).where(
        or_(
            Bill.title.ilike(f"%{q}%"),
            Bill.bill_number.ilike(f"%{q}%"),
            Bill.sponsor.ilike(f"%{q}%"),
            Bill.summary.ilike(f"%{q}%"),
        )
    ).limit(20)
    result = await db.execute(query)
    bills = result.scalars().all()
    return {"results": bills, "query": q, "total": len(bills)}