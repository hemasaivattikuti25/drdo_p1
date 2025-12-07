from fastapi import Request, HTTPException, Depends
from utils.jwt import decode_access_token
from config.database import db_manager
from bson import ObjectId

async def get_current_user(request: Request):
    token = request.cookies.get("token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    db = db_manager.get_db()
    user = await db.users.find_one({"_id": ObjectId(payload.get("id"))})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    user["_id"] = str(user["_id"])
    return user
