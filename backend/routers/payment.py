from fastapi import APIRouter, HTTPException, Depends, Body
from config.database import db_manager
from dependencies import get_current_user
import os
import stripe

router = APIRouter()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@router.post("/payment/process")
async def process_payment(amount: int = Body(..., embed=True), current_user: dict = Depends(get_current_user)):
    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,
            currency="inr",
            metadata={"integration_check": "accept_a_payment"}
        )
        return {"success": True, "client_secret": payment_intent.client_secret}
    except Exception as e:
        # For now, since we might not have valid keys, let's return a mock success if it fails, 
        # or just raise error. But since frontend mocks it, this might not be called.
        # If called and fails, it's better to know.
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stripeapi")
async def get_stripe_api_key(current_user: dict = Depends(get_current_user)):
    return {"stripeApiKey": os.getenv("STRIPE_API_KEY")}
