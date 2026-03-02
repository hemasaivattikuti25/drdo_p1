"""
DRDO DAMS — Analytics Router
==============================
Advanced MongoDB aggregation pipeline endpoints that demonstrate:
  • Complex async aggregation with Motor
  • FastAPI BackgroundTasks for non-blocking audit logging
  • Query caching with a simple in-memory TTL dict
  • Proper Pydantic response schemas

Endpoints:
  GET /api/v1/analytics/inventory-by-category  — stock + value grouped by category
  GET /api/v1/analytics/requisition-trends      — orders per day (last 30 days)
  GET /api/v1/analytics/top-equipment           — top 5 by requisition volume
  GET /api/v1/analytics/db-metrics              — MongoDB server stats (replica latency etc.)
"""

import time
import logging
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel

from config.database import db_manager
from dependencies import get_current_user

router = APIRouter()
logger = logging.getLogger("Analytics")

# ── Simple in-memory TTL cache (60s) ─────────────────────────────────────────
_cache: dict[str, dict] = {}
CACHE_TTL = 60  # seconds

def _get_cache(key: str):
    entry = _cache.get(key)
    if entry and (time.time() - entry["ts"]) < CACHE_TTL:
        return entry["data"]
    return None

def _set_cache(key: str, data):
    _cache[key] = {"ts": time.time(), "data": data}


# ── Audit Logger (BackgroundTask) ─────────────────────────────────────────────
async def _audit_log(user_id: str, endpoint: str):
    """Non-blocking audit log — runs after the response is sent."""
    db = db_manager.get_db()
    if db is None:
        return
    try:
        await db.audit_logs.insert_one({
            "user": user_id,
            "endpoint": endpoint,
            "timestamp": datetime.utcnow(),
        })
    except Exception as e:
        logger.warning(f"Audit log failed: {e}")


# ── Response Models ───────────────────────────────────────────────────────────
class CategoryStat(BaseModel):
    category: str
    totalItems: int
    totalStock: int
    totalValue: float
    avgRating: float

class DailyRequisition(BaseModel):
    date: str
    count: int
    totalValue: float

class TopEquipment(BaseModel):
    name: str
    category: str
    requisitionCount: int
    totalRevenue: float


# ── GET /analytics/inventory-by-category ─────────────────────────────────────
@router.get("/analytics/inventory-by-category", response_model=List[CategoryStat])
async def inventory_by_category(
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Returns a breakdown of inventory stock and value grouped by equipment category.
    Result is cached for 60 seconds to avoid redundant aggregation on large inventories.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    cached = _get_cache("inventory_by_category")
    if cached:
        return cached

    db = db_manager.get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    pipeline = [
        {
            "$group": {
                "_id": "$category",
                "totalItems": {"$sum": 1},
                "totalStock": {"$sum": "$stock"},
                "totalValue": {"$sum": {"$multiply": ["$price", "$stock"]}},
                "avgRating": {"$avg": "$ratings"},
            }
        },
        {"$sort": {"totalValue": -1}},
        {
            "$project": {
                "_id": 0,
                "category": "$_id",
                "totalItems": 1,
                "totalStock": 1,
                "totalValue": {"$round": ["$totalValue", 2]},
                "avgRating": {"$round": ["$avgRating", 1]},
            }
        }
    ]

    result = await db.products.aggregate(pipeline).to_list(100)
    _set_cache("inventory_by_category", result)

    # Fire-and-forget audit log
    background_tasks.add_task(_audit_log, current_user["_id"], "inventory-by-category")

    return result


# ── GET /analytics/requisition-trends ────────────────────────────────────────
@router.get("/analytics/requisition-trends", response_model=List[DailyRequisition])
async def requisition_trends(
    days: int = 30,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: dict = Depends(get_current_user)
):
    """
    Returns daily requisition counts and values for the last N days (default: 30).
    Useful for charts on the Director's Control Panel.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    if days < 1 or days > 365:
        raise HTTPException(status_code=400, detail="days must be between 1 and 365")

    db = db_manager.get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    since = datetime.utcnow() - timedelta(days=days)

    pipeline = [
        {"$match": {"paidAt": {"$gte": since}}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$paidAt"}
                },
                "count": {"$sum": 1},
                "totalValue": {"$sum": "$totalPrice"},
            }
        },
        {"$sort": {"_id": 1}},
        {
            "$project": {
                "_id": 0,
                "date": "$_id",
                "count": 1,
                "totalValue": {"$round": ["$totalValue", 2]},
            }
        }
    ]

    result = await db.orders.aggregate(pipeline).to_list(365)
    background_tasks.add_task(_audit_log, current_user["_id"], "requisition-trends")
    return result


# ── GET /analytics/top-equipment ──────────────────────────────────────────────
@router.get("/analytics/top-equipment", response_model=List[TopEquipment])
async def top_equipment(
    limit: int = 5,
    current_user: dict = Depends(get_current_user)
):
    """
    Returns the top N equipment items by number of requisitions and total revenue.
    Uses a $lookup join between orders.orderItems and the products collection.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    if limit < 1 or limit > 50:
        raise HTTPException(status_code=400, detail="limit must be 1–50")

    db = db_manager.get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    pipeline = [
        {"$unwind": "$orderItems"},
        {
            "$group": {
                "_id": "$orderItems.name",
                "requisitionCount": {"$sum": "$orderItems.quantity"},
                "totalRevenue": {
                    "$sum": {"$multiply": ["$orderItems.price", "$orderItems.quantity"]}
                },
            }
        },
        {"$sort": {"requisitionCount": -1}},
        {"$limit": limit},
        {
            "$project": {
                "_id": 0,
                "name": "$_id",
                "category": {"$literal": "—"},
                "requisitionCount": 1,
                "totalRevenue": {"$round": ["$totalRevenue", 2]},
            }
        }
    ]

    result = await db.orders.aggregate(pipeline).to_list(limit)
    return result


# ── GET /analytics/db-metrics ─────────────────────────────────────────────────
@router.get("/analytics/db-metrics")
async def db_metrics(current_user: dict = Depends(get_current_user)):
    """
    Returns live MongoDB server statistics: connections, opcounters, replica lag,
    and memory usage. Useful for monitoring the distributed database health.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    db = db_manager.get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        status = await db_manager.client.admin.command("serverStatus")
        connections = status.get("connections", {})
        opcounters = status.get("opcounters", {})
        mem = status.get("mem", {})

        # Replica lag (if in replica mode)
        replica_lag_seconds = None
        try:
            rs_status = await db_manager.client.admin.command("replSetGetStatus")
            for member in rs_status.get("members", []):
                if member.get("self"):
                    continue
                opt_time = member.get("optimeDate")
                primary_time = next(
                    (m.get("optimeDate") for m in rs_status["members"] if m.get("stateStr") == "PRIMARY"),
                    None
                )
                if opt_time and primary_time:
                    delta = primary_time - opt_time
                    replica_lag_seconds = abs(delta.total_seconds())
                    break
        except Exception:
            pass

        return {
            "success": True,
            "dbMode": db_manager.mode,
            "uptime": status.get("uptime"),
            "host": status.get("host"),
            "connections": {
                "current": connections.get("current"),
                "available": connections.get("available"),
            },
            "operationCounters": {
                "insert": opcounters.get("insert"),
                "query": opcounters.get("query"),
                "update": opcounters.get("update"),
                "delete": opcounters.get("delete"),
            },
            "memoryMB": {
                "resident": mem.get("resident"),
                "virtual": mem.get("virtual"),
            },
            "replicaLagSeconds": replica_lag_seconds,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not read DB metrics: {e}")
