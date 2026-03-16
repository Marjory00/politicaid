from fastapi import APIRouter
router = APIRouter()

@router.post("/congress")
async def ingest_from_congress():
    return {"message": "Congress API ingestion not yet configured. Add your CONGRESS_API_KEY to .env to enable this feature."}