"""
Data schemas for the refund decision system.
"""
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from enum import Enum


class ComplaintType(str, Enum):
    """Types of customer complaints."""
    LATE_DELIVERY = "LATE_DELIVERY"
    WRONG_ORDER = "WRONG_ORDER"
    MISSING_ITEMS = "MISSING_ITEMS"
    QUALITY_ISSUE = "QUALITY_ISSUE"
    DAMAGED_FOOD = "DAMAGED_FOOD"
    NEVER_ARRIVED = "NEVER_ARRIVED"


class RefundAction(str, Enum):
    """Possible refund actions."""
    REFUND = "REFUND"
    PARTIAL = "PARTIAL"
    REJECT = "REJECT"
    MANUAL_REVIEW = "MANUAL_REVIEW"


class CaseData(BaseModel):
    """Raw case data from CSV."""
    case_id: str
    order_value: float
    delivery_delay_min: int
    restaurant_error_rate: float = Field(ge=0, le=1)
    customer_refund_rate: float = Field(ge=0, le=1)
    complaint_type: ComplaintType
    photo_provided: bool
    is_demo: bool = False
    complaint_text: Optional[str] = None


class DecisionReason(BaseModel):
    """Individual reason contributing to the decision."""
    factor: str
    explanation: str
    impact: float = Field(description="Impact value on the decision score")


class RefundSuggestion(BaseModel):
    """Refund decision suggestion with explanation."""
    action: RefundAction
    confidence: float = Field(ge=0, le=1)
    score: float
    reasons: List[DecisionReason]


class CaseWithSuggestion(BaseModel):
    """Case data with computed refund suggestion."""
    case: CaseData
    suggestion: RefundSuggestion


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str


class TextFeaturesRequest(BaseModel):
    """Request for text feature extraction."""
    text: str = Field(min_length=1, description="Customer complaint text")


class TextFeaturesResponse(BaseModel):
    """Response with extracted text features."""
    food_quality_issue: bool
    missing_item: bool
    wrong_item: bool
    temperature_problem: bool
    packaging_problem: bool
    delivery_spill: bool
    vague_complaint: bool
    customer_aggression: float = Field(ge=0, le=1)
    evidence_strength: float = Field(ge=0, le=1)
    confidence: float = Field(ge=0, le=1, description="LLM confidence in extraction")

