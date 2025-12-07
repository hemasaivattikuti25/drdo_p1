from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class OrderItem(BaseModel):
    name: str
    quantity: int
    image: str
    price: float
    product: str # Product ID

class ShippingInfo(BaseModel):
    address: str
    city: str
    phoneNo: str
    postalCode: str
    country: str
    state: str

class PaymentInfo(BaseModel):
    id: str
    status: str

class Order(BaseModel):
    shippingInfo: ShippingInfo
    orderItems: List[OrderItem]
    user: Optional[str] = None # User ID (Set by backend)
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
