from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from typing import Optional
from app.models.bill import Bill
from app.nlp.pipeline import get_nlp_pipeline


class BillService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_bill(self, bill_id: UUID) -> Optional[Bill]:
        result = await self.db.execute(select(Bill).where(Bill.id == bill_id))
        return result.scalar_one_or_none()

    async def list_bills(self, page, page_size, status=None, chamber=None, party=None):
        query = select(Bill)
        if status:  query = query.where(Bill.status == status)
        if chamber: query = query.where(Bill.chamber == chamber)
        if party:   query = query.where(Bill.sponsor_party == party)
        count  = await self.db.scalar(select(func.count()).select_from(query.subquery()))
        query  = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        bills  = result.scalars().all()
        return {"total": count or 0, "page": page, "page_size": page_size, "bills": bills}

    async def create_bill(self, payload) -> Bill:
        bill = Bill(**payload.model_dump())
        self.db.add(bill)
        await self.db.flush()
        return bill

    async def update_bill(self, bill_id: UUID, payload) -> Optional[Bill]:
        bill = await self.get_bill(bill_id)
        if not bill:
            return None
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(bill, field, value)
        await self.db.flush()
        return bill

    async def delete_bill(self, bill_id: UUID) -> bool:
        bill = await self.get_bill(bill_id)
        if not bill:
            return False
        await self.db.delete(bill)
        return True

    async def analyze_bill(self, bill_id: UUID) -> Optional[Bill]:
        bill = await self.get_bill(bill_id)
        if not bill or not bill.full_text:
            return bill
        nlp      = get_nlp_pipeline()
        analysis = nlp.full_analysis(bill.full_text)
        bill.summary              = analysis["summary"]
        bill.sentiment_label      = analysis["sentiment"]["label"]
        bill.sentiment_score      = analysis["sentiment"]["score"]
        bill.sentiment_confidence = analysis["sentiment"]["confidence"]
        bill.keywords             = analysis["keywords"]
        bill.entities             = analysis["entities"]
        await self.db.flush()
        return bill