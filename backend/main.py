from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import asyncio
from config.database import db_manager
from utils.health_monitor import monitor_health
from routers import product, auth, order, payment
import os

app = FastAPI(title="FavCart API", version="2.0")

# CORS (Allow Frontend to connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Adjust for your frontend port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include Routers
app.include_router(product.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(order.router, prefix="/api/v1")
app.include_router(payment.router, prefix="/api/v1")

@app.on_event("startup")
async def startup_db_client():
    # Connect to DB (Default to Replica, fallback handled in class)
    await db_manager.connect("replica")
    
    # Start Health Monitor in background
    asyncio.create_task(monitor_health())

@app.on_event("shutdown")
async def shutdown_db_client():
    await db_manager.disconnect()

@app.get("/")
async def root():
    return {"message": "FavCart API is running (FastAPI Version)"}

