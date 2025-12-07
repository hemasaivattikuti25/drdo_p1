from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Review(BaseModel):
    user: str
    rating: int
    comment: str

class Product(BaseModel):
    name: str
    price: float
    description: str
    ratings: float = 0.0
    images: List[dict] = []
    category: str
    seller: str
    stock: int
    numOfReviews: int = 0
    reviews: List[Review] = []
    createdAt: datetime = Field(default_factory=datetime.now)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "name": "Product 1",
                "price": 100.0,
                "description": "A great product",
                "category": "Electronics"
            }
        }
