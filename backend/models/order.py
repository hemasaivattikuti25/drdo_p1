"""
DRDO DAMS — Requisition / Order Model
======================================
Represents an equipment requisition within the asset management system.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class OrderItem(BaseModel):
    """A single line-item in a requisition."""
    name: str
    quantity: int
    image: str = ""  # optional asset thumbnail
    price: float
    product: str  # Equipment / Product ID


class ShippingInfo(BaseModel):
    """Delivery destination for the requisitioned equipment."""
    address: str
    city: str
    phoneNo: str
    postalCode: str
    country: str = "India"
    state: str


class PaymentInfo(BaseModel):
    """Internal approval reference."""
    id: str
    status: str


class Order(BaseModel):
    """A complete equipment requisition."""
    shippingInfo: ShippingInfo
    orderItems: List[OrderItem]
    user: Optional[str] = None  # User ID (set by backend)
    paymentInfo: PaymentInfo
    paidAt: Optional[datetime] = None
    itemsPrice: float = 0.0
    taxPrice: float = 0.0
    shippingPrice: float = 0.0
    totalPrice: float = 0.0
    orderStatus: str = "Processing"
    deliveredAt: Optional[datetime] = None
    createdAt: datetime = Field(default_factory=datetime.now)

    class Config:
        populate_by_name = True
