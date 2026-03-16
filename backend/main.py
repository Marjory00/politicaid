from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import bills, analytics, search, ingest, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Politicaid an AI-powered legislative bill analysis platform.",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router,    prefix="/api/v1",            tags=["Health"])
app.include_router(bills.router,     prefix="/api/v1/bills",      tags=["Bills"])
app.include_router(analytics.router, prefix="/api/v1/analytics",  tags=["Analytics"])
app.include_router(search.router,    prefix="/api/v1/search",     tags=["Search"])
app.include_router(ingest.router,    prefix="/api/v1/ingest",     tags=["Ingestion"])