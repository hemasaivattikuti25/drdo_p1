from fastapi import APIRouter, HTTPException, Request, Depends, Body
from config.database import db_manager
from models.order import Order
from bson import ObjectId
from dependencies import get_current_user
from datetime import datetime

router = APIRouter()

@router.post("/order/new")
async def new_order(order: Order, current_user: dict = Depends(get_current_user)):
    db = db_manager.get_db()
    order_dict = order.dict()
    order_dict["user"] = current_user["_id"]
    order_dict["paidAt"] = datetime.now()
    
    new_order = await db.orders.insert_one(order_dict)
    created_order = await db.orders.find_one({"_id": new_order.inserted_id})
    created_order["_id"] = str(created_order["_id"])
    
    return {"success": True, "order": created_order}

@router.get("/order/{id}")
async def get_order(id: str, current_user: dict = Depends(get_current_user)):
    db = db_manager.get_db()
    try:
        obj_id = ObjectId(id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    order = await db.orders.find_one({"_id": obj_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order["_id"] = str(order["_id"])
    return {"success": True, "order": order}

@router.get("/myorders")
async def my_orders(current_user: dict = Depends(get_current_user)):
    db = db_manager.get_db()
    orders_cursor = db.orders.find({"user": current_user["_id"]})
    orders = await orders_cursor.to_list(length=1000)
    
    for o in orders:
        o["_id"] = str(o["_id"])
        
    return {"success": True, "orders": orders}

# --- Admin Routes ---

@router.get("/admin/orders")
async def admin_orders(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
        
    db = db_manager.get_db()
    orders_cursor = db.orders.find({})
    orders = await orders_cursor.to_list(length=1000)
    
    total_amount = sum(o.get("totalPrice", 0) for o in orders)
    
    for o in orders:
        o["_id"] = str(o["_id"])
        
    return {"success": True, "orders": orders, "totalAmount": total_amount}

@router.put("/admin/order/{id}")
async def update_order(id: str, orderStatus: str = Body(..., embed=True), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
        
    db = db_manager.get_db()
    try:
        obj_id = ObjectId(id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")

    order = await db.orders.find_one({"_id": obj_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.get("orderStatus") == "Delivered":
        raise HTTPException(status_code=400, detail="Order already delivered")
        
    update_data = {"orderStatus": orderStatus}
    if orderStatus == "Delivered":
        update_data["deliveredAt"] = datetime.now()
        
    await db.orders.update_one({"_id": obj_id}, {"$set": update_data})
    
    return {"success": True}

@router.delete("/admin/order/{id}")
async def delete_order(id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
        
    db = db_manager.get_db()
    await db.orders.delete_one({"_id": ObjectId(id)})
    return {"success": True}

