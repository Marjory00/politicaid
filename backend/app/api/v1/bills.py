from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from app.core.database import get_db
from app.models.bill import Bill, BillStatus

router = APIRouter()

@router.get("/")
async def get_bills(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    chamber: Optional[str] = None,
    party: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Bill)
    count_query = select(func.count()).select_from(Bill)

    if status:
        try:
            status_enum = BillStatus(status)
            query = query.where(Bill.status == status_enum)
            count_query = count_query.where(Bill.status == status_enum)
        except ValueError:
            pass
    if chamber:
        query = query.where(Bill.chamber == chamber)
        count_query = count_query.where(Bill.chamber == chamber)
    if party:
        query = query.where(Bill.sponsor_party == party)
        count_query = count_query.where(Bill.sponsor_party == party)

    total = await db.scalar(count_query)
    result = await db.execute(query.offset((page - 1) * page_size).limit(page_size))
    bills = result.scalars().all()

    return {
        "bills": bills,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }

@router.get("/{bill_id}")
async def get_bill(bill_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Bill).where(Bill.id == bill_id))
    bill = result.scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill

@router.post("/{bill_id}/analyze")
async def analyze_bill(bill_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Bill).where(Bill.id == bill_id))
    bill = result.scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill