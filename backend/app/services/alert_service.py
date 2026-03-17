"""
Alert Service — manages email subscriptions and sends status change notifications.
"""
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import Optional
from app.models.alert import BillAlert
from app.models.bill import Bill
from app.schemas.alert_schema import AlertCreate
from app.core.config import settings

logger = logging.getLogger(__name__)


class AlertService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_alert(self, payload: AlertCreate) -> BillAlert:
        """Subscribe an email to status changes for a bill."""
        # Check if alert already exists
        existing = await self.db.execute(
            select(BillAlert).where(
                BillAlert.email   == payload.email,
                BillAlert.bill_id == payload.bill_id,
                BillAlert.is_active == True,
            )
        )
        if existing.scalar_one_or_none():
            raise ValueError(f"Alert already exists for {payload.email} on bill {payload.bill_number}")

        # Get current bill status
        bill_result = await self.db.execute(select(Bill).where(Bill.id == payload.bill_id))
        bill = bill_result.scalar_one_or_none()
        if not bill:
            raise ValueError("Bill not found")

        alert = BillAlert(
            email       = payload.email,
            bill_id     = payload.bill_id,
            bill_number = payload.bill_number,
            last_status = str(bill.status) if bill.status else None,
            is_active   = True,
        )
        self.db.add(alert)
        await self.db.flush()
        return alert

    async def delete_alert(self, alert_id: UUID) -> bool:
        """Unsubscribe — deactivate an alert."""
        result = await self.db.execute(select(BillAlert).where(BillAlert.id == alert_id))
        alert = result.scalar_one_or_none()
        if not alert:
            return False
        alert.is_active = False
        await self.db.flush()
        return True

    async def get_alerts_by_email(self, email: str) -> list[BillAlert]:
        """Get all active alerts for an email address."""
        result = await self.db.execute(
            select(BillAlert).where(
                BillAlert.email     == email,
                BillAlert.is_active == True,
            )
        )
        return result.scalars().all()

    async def check_and_send_alerts(self):
        """
        Check all active alerts and send emails if bill status has changed.
        Called by the scheduler every hour.
        """
        result = await self.db.execute(
            select(BillAlert).where(BillAlert.is_active == True)
        )
        alerts = result.scalars().all()

        for alert in alerts:
            bill_result = await self.db.execute(
                select(Bill).where(Bill.id == alert.bill_id)
            )
            bill = bill_result.scalar_one_or_none()
            if not bill:
                continue

            current_status = str(bill.status) if bill.status else None

            if current_status != alert.last_status:
                # Status changed — send email
                await self._send_status_email(
                    email       = alert.email,
                    bill_number = alert.bill_number,
                    bill_title  = bill.title,
                    old_status  = alert.last_status,
                    new_status  = current_status,
                )
                # Update the stored status
                alert.last_status = current_status
                await self.db.flush()

        await self.db.commit()

    async def _send_status_email(
        self,
        email:       str,
        bill_number: str,
        bill_title:  str,
        old_status:  Optional[str],
        new_status:  Optional[str],
    ):
        """Send a status change notification email."""
        if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
            logger.warning("Email credentials not configured. Skipping email.")
            return

        try:
            from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType # type: ignore

            conf = ConnectionConfig(
                MAIL_USERNAME   = settings.MAIL_USERNAME,
                MAIL_PASSWORD   = settings.MAIL_PASSWORD,
                MAIL_FROM       = settings.MAIL_FROM,
                MAIL_PORT       = settings.MAIL_PORT,
                MAIL_SERVER     = settings.MAIL_SERVER,
                MAIL_STARTTLS   = True,
                MAIL_SSL_TLS    = False,
                USE_CREDENTIALS = True,
            )

            old = (old_status or "unknown").replace("_", " ").title()
            new = (new_status or "unknown").replace("_", " ").title()

            html_body = f"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
              <div style="background:#1a365d;padding:20px;border-radius:8px 8px 0 0">
                <h1 style="color:white;margin:0;font-size:22px">🏛️ PoliticAId</h1>
                <p style="color:#a0aec0;margin:4px 0 0">Legislative Intelligence Platform</p>
              </div>
              <div style="background:#f7fafc;padding:24px;border:1px solid #e2e8f0">
                <h2 style="color:#1a365d;margin:0 0 16px">Bill Status Update</h2>
                <div style="background:white;padding:16px;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:16px">
                  <p style="margin:0 0 8px"><strong style="color:#1a365d">Bill:</strong> {bill_number}</p>
                  <p style="margin:0 0 8px"><strong style="color:#1a365d">Title:</strong> {bill_title}</p>
                  <p style="margin:0 0 8px">
                    <strong style="color:#1a365d">Status changed:</strong>
                    <span style="background:#fee2e2;color:#b91c1c;padding:2px 8px;border-radius:12px;font-size:13px">{old}</span>
                    &nbsp;→&nbsp;
                    <span style="background:#dcfce7;color:#15803d;padding:2px 8px;border-radius:12px;font-size:13px">{new}</span>
                  </p>
                </div>
                <p style="color:#718096;font-size:13px">
                  You are receiving this because you subscribed to alerts for this bill on PoliticAId.
                </p>
              </div>
              <div style="background:#e2e8f0;padding:12px;border-radius:0 0 8px 8px;text-align:center">
                <p style="color:#718096;font-size:12px;margin:0">
                  © 2024 PoliticAId · All rights reserved
                </p>
              </div>
            </div>
            """

            message = MessageSchema(
                subject    = f"PoliticAId Alert: {bill_number} status changed to {new}",
                recipients = [email],
                body       = html_body,
                subtype    = MessageType.html,
            )

            fm = FastMail(conf)
            await fm.send_message(message)
            logger.info(f"Alert email sent to {email} for bill {bill_number}")

        except Exception as e:
            logger.error(f"Failed to send alert email: {e}")