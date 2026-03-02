"""
DRDO DAMS — Internal Requisition Approval Router
==================================================
Handles requisition approval for equipment procurement.
"""

from fastapi import APIRouter, Depends, Body
from dependencies import get_current_user
import uuid

router = APIRouter()


@router.post("/payment/process")
async def process_payment(
    amount: int = Body(..., embed=True),
    current_user: dict = Depends(get_current_user),
):
    """
    Simulate an internal requisition approval.
    In production this would integrate with the DRDO procurement workflow.
    """
    approval_id = f"DRDO-{uuid.uuid4().hex[:10].upper()}"
    return {
        "success": True,
        "client_secret": approval_id,
    }


@router.get("/stripeapi")
async def get_payment_config(current_user: dict = Depends(get_current_user)):
    """Return a placeholder key for the frontend payment step."""
    return {"stripeApiKey": "internal_approval_mode"}
