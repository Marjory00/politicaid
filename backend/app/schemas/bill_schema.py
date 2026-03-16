from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime


class BillCreate(BaseModel):
    bill_number:      str
    title:            str
    full_text:        Optional[str]      = None
    sponsor:          Optional[str]      = None
    sponsor_party:    Optional[str]      = None
    chamber:          Optional[str]      = None
    congress_session: Optional[str]      = None
    status:           Optional[str]      = "introduced"
    introduced_date:  Optional[datetime] = None
    subjects:         Optional[List[str]]= []
    source_url:       Optional[str]      = None
    source:           Optional[str]      = "manual"
    yea_votes:        Optional[int]      = 0
    nay_votes:        Optional[int]      = 0
    abstain_votes:    Optional[int]      = 0


class BillUpdate(BaseModel):
    title:         Optional[str]      = None
    full_text:     Optional[str]      = None
    summary:       Optional[str]      = None
    status:        Optional[str]      = None
    sponsor:       Optional[str]      = None
    sponsor_party: Optional[str]      = None
    yea_votes:     Optional[int]      = None
    nay_votes:     Optional[int]      = None
    abstain_votes: Optional[int]      = None
    subjects:      Optional[List[str]]= None


class BillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:                   UUID
    bill_number:          str
    title:                str
    summary:              Optional[str]
    sponsor:              Optional[str]
    sponsor_party:        Optional[str]
    chamber:              Optional[str]
    congress_session:     Optional[str]
    status:               Optional[str]
    introduced_date:      Optional[datetime]
    last_action_date:     Optional[datetime]
    last_action:          Optional[str]
    subjects:             Optional[List[Any]]
    keywords:             Optional[List[Any]]
    entities:             Optional[Any]
    sentiment_label:      Optional[str]
    sentiment_score:      Optional[float]
    sentiment_confidence: Optional[float]
    yea_votes:            int
    nay_votes:            int
    abstain_votes:        int
    source:               Optional[str]
    source_url:           Optional[str]
    created_at:           Optional[datetime]
    updated_at:           Optional[datetime]


class BillListResponse(BaseModel):
    total:     int
    page:      int
    page_size: int
    bills:     List[BillResponse]