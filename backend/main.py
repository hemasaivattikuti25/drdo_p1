from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import asyncio
import os

from config.database import db_manager
from utils.health_monitor import monitor_health
from routers import product, auth, order, payment, admin, analytics

# ── Rate Limiter ──────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hooks using the modern lifespan protocol."""
    await db_manager.connect("replica")
    asyncio.create_task(monitor_health())
    yield
    await db_manager.disconnect()


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="DRDO DAMS API",
    version="3.0",
    description=(
        "Defence Asset Management System — FastAPI backend with MongoDB "
        "Replica Set hot redundancy. Built at DRDL, Hyderabad (DRDO)."
    ),
    contact={
        "name": "Hemasai Vattikuti",
        "url": "https://github.com/hemasaivattikuti25",
    },
    lifespan=lifespan,
)

# Attach rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static File Uploads ───────────────────────────────────────────────────────
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(product.router,    prefix="/api/v1")
app.include_router(auth.router,       prefix="/api/v1")
app.include_router(order.router,      prefix="/api/v1")
app.include_router(payment.router,    prefix="/api/v1")
app.include_router(admin.router,      prefix="/api/v1")
app.include_router(analytics.router,  prefix="/api/v1")


# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "message": "DRDO DAMS API is running",
        "version": "3.0",
        "docs": "/docs",
        "dbMode": db_manager.mode,
    }
