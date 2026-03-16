import logging
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.models.bill import Bill
from app.nlp.pipeline import get_nlp_pipeline

logger = logging.getLogger(__name__)
CONGRESS_API_BASE = "https://api.congress.gov/v3"


class IngestService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def ingest_from_congress(self, congress: int, bill_type: str, limit: int):
        if not settings.CONGRESS_API_KEY:
            logger.warning("CONGRESS_API_KEY not set.")
            return
        url    = f"{CONGRESS_API_BASE}/bill/{congress}/{bill_type}"
        params = {"api_key": settings.CONGRESS_API_KEY, "limit": limit, "format": "json"}
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
        nlp = get_nlp_pipeline()
        for item in data.get("bills", []):
            bill_num = f"{item.get('type','')}{item.get('number','')}-{congress}"
            existing = await self.db.execute(select(Bill).where(Bill.bill_number == bill_num))
            if existing.scalar_one_or_none():
                continue
            text     = item.get("title", "")
            analysis = nlp.full_analysis(text) if text else {}
            bill     = Bill(
                bill_number=bill_num, title=text, full_text=text,
                summary=analysis.get("summary",""),
                sentiment_label=analysis.get("sentiment",{}).get("label"),
                sentiment_score=analysis.get("sentiment",{}).get("score"),
                keywords=analysis.get("keywords",[]),
                entities=analysis.get("entities",{}),
                congress_session=str(congress),
                source="congress.gov", source_url=item.get("url",""),
            )
            self.db.add(bill)
        await self.db.commit()

    async def ingest_raw_text(self, bill_number: str, title: str, full_text: str):
        nlp      = get_nlp_pipeline()
        analysis = nlp.full_analysis(full_text)
        bill     = Bill(
            bill_number=bill_number, title=title, full_text=full_text,
            summary=analysis["summary"],
            sentiment_label=analysis["sentiment"]["label"],
            sentiment_score=analysis["sentiment"]["score"],
            sentiment_confidence=analysis["sentiment"]["confidence"],
            keywords=analysis["keywords"], entities=analysis["entities"],
            source="manual",
        )
        self.db.add(bill)
        await self.db.commit()

    async def ingest_from_url(self, url: str, source: str = "manual"):
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            html = resp.text
        from bs4 import BeautifulSoup
        soup     = BeautifulSoup(html, "lxml")
        text     = soup.get_text(separator=" ", strip=True)
        nlp      = get_nlp_pipeline()
        analysis = nlp.full_analysis(text[:10000])
        bill     = Bill(
            bill_number=f"URL-{hash(url) % 100000}",
            title=soup.title.string if soup.title else url[:100],
            full_text=text[:50000], summary=analysis["summary"],
            sentiment_label=analysis["sentiment"]["label"],
            sentiment_score=analysis["sentiment"]["score"],
            keywords=analysis["keywords"], entities=analysis["entities"],
            source=source, source_url=url,
        )
        self.db.add(bill)
        await self.db.commit()