from fastapi import APIRouter, HTTPException, Depends, status, Response, Request, Body
from config.database import db_manager
from models.user import User
from utils.jwt import create_access_token
from passlib.context import CryptContext
from bson import ObjectId
from typing import List, Optional
from dependencies import get_current_user
import secrets
import hashlib
from datetime import datetime, timedelta
from utils.email import send_email
import os

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

@router.post("/register", status_code=201)
async def register(user: User, response: Response):
    db = db_manager.get_db()
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    user.password = get_password_hash(user.password)
    new_user = await db.users.insert_one(user.dict(exclude_none=True))
    
    token = create_access_token({"id": str(new_user.inserted_id)})
    response.set_cookie(key="token", value=token, httponly=True)
    
    return {"success": True, "user": user.dict(), "token": token}

@router.post("/login")
async def login(credentials: dict, response: Response):
    email = credentials.get("email")
    password = credentials.get("password")
    
    db = db_manager.get_db()
    user = await db.users.find_one({"email": email})
    
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"id": str(user["_id"])})
    response.set_cookie(key="token", value=token, httponly=True)
    
    user["_id"] = str(user["_id"])
    return {"success": True, "user": user, "token": token}

@router.get("/logout")
async def logout(response: Response):
    response.delete_cookie("token")
    return {"success": True, "message": "Logged out"}

@router.get("/myprofile")
async def my_profile(current_user: dict = Depends(get_current_user)):
    return {"success": True, "user": current_user}

@router.put("/update")
async def update_profile(
    name: str = Body(...), 
    email: str = Body(...), 
    current_user: dict = Depends(get_current_user)
):
    db = db_manager.get_db()
    new_data = {"name": name, "email": email}
    
    await db.users.update_one({"_id": ObjectId(current_user["_id"])}, {"$set": new_data})
    
    updated_user = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
    updated_user["_id"] = str(updated_user["_id"])
    
    return {"success": True, "user": updated_user}

@router.put("/password/change")
async def change_password(
    oldPassword: str = Body(...),
    password: str = Body(...),
    current_user: dict = Depends(get_current_user)
):
    db = db_manager.get_db()
    user = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
    
    if not verify_password(oldPassword, user["password"]):
        raise HTTPException(status_code=401, detail="Old password is incorrect")
        
    new_hash = get_password_hash(password)
    await db.users.update_one({"_id": ObjectId(current_user["_id"])}, {"$set": {"password": new_hash}})
    
    return {"success": True, "message": "Password updated"}

@router.post("/password/forgot")
async def forgot_password(email: str = Body(..., embed=True)):
    db = db_manager.get_db()
    user = await db.users.find_one({"email": email})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Generate token
    reset_token = secrets.token_hex(20)
    reset_token_hash = hashlib.sha256(reset_token.encode()).hexdigest()
    reset_password_expire = datetime.utcnow() + timedelta(minutes=30)
    
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "resetPasswordToken": reset_token_hash,
            "resetPasswordExpire": reset_password_expire
        }}
    )
    
    reset_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/password/reset/{reset_token}"
    message = f"Your password reset token is as follow:\n\n{reset_url}\n\nIf you have not requested this email, then ignore it."
    
    try:
        await send_email("Password Recovery", message, email)
        return {"success": True, "message": f"Email sent to: {email}"}
    except Exception as e:
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$unset": {"resetPasswordToken": "", "resetPasswordExpire": ""}}
        )
        raise HTTPException(status_code=500, detail="Email could not be sent")

@router.post("/password/reset/{token}")
async def reset_password(token: str, password: str = Body(..., embed=True), confirmPassword: str = Body(..., embed=True)):
    if password != confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")
        
    reset_token_hash = hashlib.sha256(token.encode()).hexdigest()
    
    db = db_manager.get_db()
    user = await db.users.find_one({
        "resetPasswordToken": reset_token_hash,
        "resetPasswordExpire": {"$gt": datetime.utcnow()}
    })
    
    if not user:
        raise HTTPException(status_code=400, detail="Password reset token is invalid or has expired")
        
    new_hash = get_password_hash(password)
    
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {"password": new_hash},
            "$unset": {"resetPasswordToken": "", "resetPasswordExpire": ""}
        }
    )
    
    # Auto login? Or just success? Frontend usually redirects to login.
    # But let's return a token just in case, or just success.
    # Frontend actions: dispatch(resetPasswordSuccess(data))
    
    # Let's generate a token so they are logged in automatically if we want, 
    # but standard flow is usually login again.
    # The original controller sent a token. Let's send a token.
    
    token = create_access_token({"id": str(user["_id"])})
    # We can't set cookie easily here without Response object passed in, but we can return it.
    # Or I can add Response to args.
    
    return {"success": True, "token": token, "user": {"_id": str(user["_id"]), "name": user["name"], "email": user["email"], "role": user["role"]}}


# --- Admin Routes ---

@router.get("/admin/users")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
        
    db = db_manager.get_db()
    users_cursor = db.users.find({})
    users = await users_cursor.to_list(length=1000)
    
    for u in users:
        u["_id"] = str(u["_id"])
        
    return {"success": True, "users": users}

@router.get("/admin/user/{id}")
async def get_user(id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
        
    db = db_manager.get_db()
    try:
        obj_id = ObjectId(id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    user = await db.users.find_one({"_id": obj_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user["_id"] = str(user["_id"])
    return {"success": True, "user": user}

@router.delete("/admin/user/{id}")
async def delete_user(id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
        
    db = db_manager.get_db()
    await db.users.delete_one({"_id": ObjectId(id)})
    return {"success": True, "message": "User deleted"}

@router.put("/admin/user/{id}")
async def update_user(id: str, role: str = Body(...), name: str = Body(...), email: str = Body(...), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
        
    db = db_manager.get_db()
    await db.users.update_one({"_id": ObjectId(id)}, {"$set": {"name": name, "email": email, "role": role}})
    return {"success": True, "message": "User updated"}



