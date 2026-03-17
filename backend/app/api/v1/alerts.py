"""
Alerts API — manage email subscriptions for bill status changes.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.core.database import get_db
from app.services.alert_service import AlertService
from app.schemas.alert_schema import AlertCreate, AlertResponse, AlertListResponse

router = APIRouter()


@router.post("/", response_model=AlertResponse, status_code=201)
async def create_alert(
    payload: AlertCreate,
    db: AsyncSession = Depends(get_db),
):
    """Subscribe an email to status change alerts for a specific bill."""
    try:
        alert = await AlertService(db).create_alert(payload)
        await db.commit()
        return alert
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/email/{email}", response_model=AlertListResponse)
async def get_alerts_by_email(
    email: str,
    db: AsyncSession = Depends(get_db),
):
    """Get all active alerts for an email address."""
    alerts = await AlertService(db).get_alerts_by_email(email)
    return {"total": len(alerts), "alerts": alerts}


@router.delete("/{alert_id}", status_code=204)
async def delete_alert(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Unsubscribe — deactivate an alert."""
    deleted = await AlertService(db).delete_alert(alert_id)
    await db.commit()
    if not deleted:
        raise HTTPException(status_code=404, detail="Alert not found")