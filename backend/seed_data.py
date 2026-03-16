import asyncio
from datetime import datetime
from app.core.database import engine
from app.models.bill import Bill, BillStatus, SentimentLabel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import delete

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

sample_bills = [
    Bill(bill_number="HR-1234", title="Infrastructure Investment and Jobs Modernization Act",
         summary="A comprehensive bill to rebuild America's roads, bridges, broadband internet, and public transit systems with a $1.2 trillion investment over 10 years.",
         status=BillStatus.ENACTED, chamber="House", sponsor="Rep. John Smith", sponsor_party="Democrat",
         introduced_date=datetime(2024, 1, 15), yea_votes=312, nay_votes=118, abstain_votes=5,
         sentiment_label=SentimentLabel.POSITIVE, sentiment_score=0.78, sentiment_confidence=0.91,
         keywords=["infrastructure","jobs","broadband","transportation"],
         source="Congress.gov", source_url="https://congress.gov/bill/hr-1234"),

    Bill(bill_number="S-567", title="Clean Energy Transition and Climate Resilience Act",
         summary="Establishes a national clean energy standard requiring 80% of electricity from renewable sources by 2035, with tax incentives for solar, wind, and battery storage.",
         status=BillStatus.INTRODUCED, chamber="Senate", sponsor="Sen. Maria Johnson", sponsor_party="Democrat",
         introduced_date=datetime(2024, 2, 20), yea_votes=52, nay_votes=47, abstain_votes=1,
         sentiment_label=SentimentLabel.POSITIVE, sentiment_score=0.65, sentiment_confidence=0.87,
         keywords=["energy","climate","renewable","solar","wind"],
         source="Congress.gov", source_url="https://congress.gov/bill/s-567"),

    Bill(bill_number="HR-2891", title="Border Security and Immigration Enforcement Act",
         summary="Increases funding for border patrol by $4.2 billion, adds 2,000 new agents, and implements stricter asylum processing procedures.",
         status=BillStatus.IN_COMMITTEE, chamber="House", sponsor="Rep. Robert Davis", sponsor_party="Republican",
         introduced_date=datetime(2024, 3, 5), yea_votes=198, nay_votes=231, abstain_votes=6,
         sentiment_label=SentimentLabel.NEGATIVE, sentiment_score=-0.42, sentiment_confidence=0.79,
         keywords=["border","immigration","security","asylum"],
         source="Congress.gov", source_url="https://congress.gov/bill/hr-2891"),

    Bill(bill_number="S-1102", title="Affordable Prescription Drug Pricing Reform Act",
         summary="Allows Medicare to negotiate drug prices directly with pharmaceutical companies and caps out-of-pocket costs at $2,000 per year for seniors.",
         status=BillStatus.PASSED_SENATE, chamber="Senate", sponsor="Sen. Patricia Williams", sponsor_party="Democrat",
         introduced_date=datetime(2024, 1, 28), yea_votes=57, nay_votes=43, abstain_votes=0,
         sentiment_label=SentimentLabel.POSITIVE, sentiment_score=0.82, sentiment_confidence=0.94,
         keywords=["healthcare","drugs","medicare","pricing","seniors"],
         source="Congress.gov", source_url="https://congress.gov/bill/s-1102"),

    Bill(bill_number="HR-3456", title="National Defense Authorization Act 2025",
         summary="Authorizes $886 billion in defense spending for fiscal year 2025, including funding for military personnel, weapons systems, and cybersecurity initiatives.",
         status=BillStatus.ENACTED, chamber="House", sponsor="Rep. Michael Thompson", sponsor_party="Republican",
         introduced_date=datetime(2024, 4, 10), yea_votes=380, nay_votes=48, abstain_votes=7,
         sentiment_label=SentimentLabel.NEUTRAL, sentiment_score=0.12, sentiment_confidence=0.72,
         keywords=["defense","military","national security","cybersecurity"],
         source="Congress.gov", source_url="https://congress.gov/bill/hr-3456"),

    Bill(bill_number="S-789", title="Student Loan Forgiveness and Higher Education Access Act",
         summary="Cancels up to $20,000 in federal student loan debt for borrowers earning under $125,000 annually and reforms income-driven repayment plans.",
         status=BillStatus.FAILED, chamber="Senate", sponsor="Sen. James Anderson", sponsor_party="Democrat",
         introduced_date=datetime(2024, 2, 14), yea_votes=44, nay_votes=56, abstain_votes=0,
         sentiment_label=SentimentLabel.POSITIVE, sentiment_score=0.55, sentiment_confidence=0.83,
         keywords=["education","student loans","debt","forgiveness"],
         source="Congress.gov", source_url="https://congress.gov/bill/s-789"),

    Bill(bill_number="HR-4521", title="Small Business Tax Relief and Economic Growth Act",
         summary="Reduces the corporate tax rate for small businesses with under $10 million in revenue from 21% to 15% and expands the qualified business income deduction.",
         status=BillStatus.PASSED_HOUSE, chamber="House", sponsor="Rep. Sarah Miller", sponsor_party="Republican",
         introduced_date=datetime(2024, 3, 22), yea_votes=267, nay_votes=162, abstain_votes=6,
         sentiment_label=SentimentLabel.POSITIVE, sentiment_score=0.69, sentiment_confidence=0.88,
         keywords=["tax","small business","economy","growth"],
         source="Congress.gov", source_url="https://congress.gov/bill/hr-4521"),

    Bill(bill_number="S-2234", title="Gun Violence Prevention and Community Safety Act",
         summary="Expands background checks for all firearm sales, implements a 7-day waiting period, and bans assault-style weapons and high-capacity magazines.",
         status=BillStatus.IN_COMMITTEE, chamber="Senate", sponsor="Sen. Lisa Chen", sponsor_party="Democrat",
         introduced_date=datetime(2024, 5, 1), yea_votes=48, nay_votes=51, abstain_votes=1,
         sentiment_label=SentimentLabel.NEGATIVE, sentiment_score=-0.31, sentiment_confidence=0.76,
         keywords=["gun control","safety","background checks","firearms"],
         source="Congress.gov", source_url="https://congress.gov/bill/s-2234"),

    Bill(bill_number="HR-5678", title="American Semiconductor and Technology Leadership Act",
         summary="Provides $52 billion in subsidies for domestic semiconductor manufacturing and $200 billion for scientific research to compete with China in advanced technology.",
         status=BillStatus.ENACTED, chamber="House", sponsor="Rep. David Wilson", sponsor_party="Republican",
         introduced_date=datetime(2024, 1, 8), yea_votes=364, nay_votes=60, abstain_votes=11,
         sentiment_label=SentimentLabel.POSITIVE, sentiment_score=0.88, sentiment_confidence=0.96,
         keywords=["technology","semiconductors","manufacturing","China","competition"],
         source="Congress.gov", source_url="https://congress.gov/bill/hr-5678"),

    Bill(bill_number="S-3301", title="Voting Rights Protection and Election Integrity Act",
         summary="Restores and expands the Voting Rights Act, mandates automatic voter registration, and establishes federal standards for election administration.",
         status=BillStatus.INTRODUCED, chamber="Senate", sponsor="Sen. Angela Brown", sponsor_party="Democrat",
         introduced_date=datetime(2024, 4, 18), yea_votes=49, nay_votes=51, abstain_votes=0,
         sentiment_label=SentimentLabel.NEUTRAL, sentiment_score=0.08, sentiment_confidence=0.68,
         keywords=["voting rights","elections","democracy","registration"],
         source="Congress.gov", source_url="https://congress.gov/bill/s-3301"),

    Bill(bill_number="HR-6789", title="Childcare Affordability and Early Education Investment Act",
         summary="Caps childcare costs at 7% of family income, creates 100,000 new Head Start slots, and invests $400 billion in early childhood education over 10 years.",
         status=BillStatus.PASSED_HOUSE, chamber="House", sponsor="Rep. Nancy Green", sponsor_party="Democrat",
         introduced_date=datetime(2024, 2, 28), yea_votes=228, nay_votes=201, abstain_votes=6,
         sentiment_label=SentimentLabel.POSITIVE, sentiment_score=0.74, sentiment_confidence=0.90,
         keywords=["childcare","education","families","early childhood"],
         source="Congress.gov", source_url="https://congress.gov/bill/hr-6789"),

    Bill(bill_number="S-4412", title="Opioid Crisis Response and Mental Health Parity Act",
         summary="Allocates $10 billion to combat the opioid epidemic, expands addiction treatment access, and requires insurance companies to cover mental health services equally.",
         status=BillStatus.ENACTED, chamber="Senate", sponsor="Sen. Thomas Harris", sponsor_party="Republican",
         introduced_date=datetime(2024, 3, 14), yea_votes=94, nay_votes=6, abstain_votes=0,
         sentiment_label=SentimentLabel.POSITIVE, sentiment_score=0.91, sentiment_confidence=0.97,
         keywords=["opioid","mental health","addiction","healthcare","insurance"],
         source="Congress.gov", source_url="https://congress.gov/bill/s-4412"),
]

async def seed():
    async with AsyncSessionLocal() as session:
        await session.execute(delete(Bill))
        for bill in sample_bills:
            session.add(bill)
        await session.commit()
        print(f"✅ Successfully seeded {len(sample_bills)} bills!")

if __name__ == "__main__":
    asyncio.run(seed())