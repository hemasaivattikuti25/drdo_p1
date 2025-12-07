from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from bson import ObjectId

class User(BaseModel):
    name: str
    email: EmailStr
    password: str
    avatar: Optional[str] = None
    role: str = "user"
    createdAt: datetime = Field(default_factory=datetime.now)
    resetPasswordToken: Optional[str] = None
    resetPasswordTokenExpire: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "password": "password123",
                "role": "user"
            }
        }
