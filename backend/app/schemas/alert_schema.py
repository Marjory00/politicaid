"""
Pydantic schemas for alert requests and responses.
"""
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime


class AlertCreate(BaseModel):
    email:       EmailStr
    bill_id:     UUID
    bill_number: str


class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:          UUID
    email:       str
    bill_id:     UUID
    bill_number: str
    last_status: Optional[str]
    is_active:   bool
    created_at:  Optional[datetime]


class AlertListResponse(BaseModel):
    total:  int
    alerts: list[AlertResponse]