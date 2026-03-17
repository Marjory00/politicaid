"""
Export API — download bills as PDF or CSV.
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from uuid import UUID
import io

from app.core.database import get_db
from app.models.bill import Bill
from app.services.export_service import ExportService # type: ignore

router = APIRouter()


@router.get("/csv")
async def export_bills_csv(
    status:  Optional[str] = None,
    chamber: Optional[str] = None,
    party:   Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Export all bills (with optional filters) as a CSV file."""
    query = select(Bill)
    if status:  query = query.where(Bill.status == status)
    if chamber: query = query.where(Bill.chamber == chamber)
    if party:   query = query.where(Bill.sponsor_party == party)

    result = await db.execute(query)
    bills  = result.scalars().all()

    if not bills:
        raise HTTPException(status_code=404, detail="No bills found to export")

    svc     = ExportService()
    content = svc.export_csv(bills)

    return StreamingResponse(
        io.BytesIO(content),
        media_type = "text/csv",
        headers    = {"Content-Disposition": "attachment; filename=politicaid_bills.csv"},
    )


@router.get("/pdf")
async def export_bills_pdf(
    status:  Optional[str] = None,
    chamber: Optional[str] = None,
    party:   Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Export all bills (with optional filters) as a PDF report."""
    query = select(Bill)
    if status:  query = query.where(Bill.status == status)
    if chamber: query = query.where(Bill.chamber == chamber)
    if party:   query = query.where(Bill.sponsor_party == party)

    result = await db.execute(query)
    bills  = result.scalars().all()

    if not bills:
        raise HTTPException(status_code=404, detail="No bills found to export")

    svc     = ExportService()
    content = svc.export_pdf(bills)

    return StreamingResponse(
        io.BytesIO(content),
        media_type = "application/pdf",
        headers    = {"Content-Disposition": "attachment; filename=politicaid_bills.pdf"},
    )


@router.get("/bill/{bill_id}/pdf")
async def export_single_bill_pdf(
    bill_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Export a single bill as a detailed PDF report."""
    result = await db.execute(select(Bill).where(Bill.id == bill_id))
    bill   = result.scalar_one_or_none()

    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    svc     = ExportService()
    content = svc.export_single_pdf(bill)

    filename = f"politicaid_{bill.bill_number.replace('-','_')}.pdf"
    return StreamingResponse(
        io.BytesIO(content),
        media_type = "application/pdf",
        headers    = {"Content-Disposition": f"attachment; filename={filename}"},
    )