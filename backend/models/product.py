"""
DRDO DAMS — Pydantic Schemas (Request + Response Models)
=========================================================
Strongly-typed models for all API contracts. Using Pydantic v1 style
(compatible with FastAPI 0.111 + Pydantic 1.x in requirements.txt).
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime


# ── Review ────────────────────────────────────────────────────────────────────
class Review(BaseModel):
    user: str
    rating: float = Field(..., ge=0.0, le=5.0, description="Inspection score 0–5")
    comment: str


# ── Equipment (Product) ───────────────────────────────────────────────────────
class Product(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    price: float = Field(..., gt=0, description="Unit cost in INR (₹)")
    description: str = Field(..., min_length=10)
    ratings: float = Field(default=0.0, ge=0.0, le=5.0)
    images: List[dict] = []
    category: str = Field(..., description="e.g. Surveillance, Communication, Protective Gear")
    seller: str = Field(..., description="Supplying DRDO lab or PSU")
    stock: int = Field(..., ge=0, description="Units in inventory")
    numOfReviews: int = 0
    reviews: List[Review] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    @validator("name")
    def name_must_not_be_blank(cls, v):
        if not v.strip():
            raise ValueError("Equipment name must not be blank")
        return v.strip()

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "name": "Thermal Imaging Surveillance Camera",
                "price": 185000,
                "description": "High-resolution LWIR thermal imaging camera for perimeter surveillance.",
                "category": "Surveillance",
                "seller": "DRDO IRDE, Dehradun",
                "stock": 5,
            }
        }
