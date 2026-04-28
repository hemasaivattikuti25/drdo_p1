from fastapi import APIRouter, HTTPException, Depends
from config.database import db_manager
from dependencies import get_current_user
import platform

router = APIRouter()


# ── Helper ────────────────────────────────────────────────────────────────────
def _require_admin(current_user: dict):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied: admin only")


# ── Dashboard Summary ─────────────────────────────────────────────────────────
@router.get("/admin/dashboard")
async def dashboard(current_user: dict = Depends(get_current_user)):
    """
    Returns aggregated stats for the Director's Control Panel:
    total equipment items, pending/completed requisitions, registered users,
    total inventory value, and current database connection mode.
    """
    _require_admin(current_user)

    db = db_manager.get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    # Equipment (products)
    total_equipment = await db.products.count_documents({})

    # Inventory value
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$price"}}}]
    value_result = await db.products.aggregate(pipeline).to_list(1)
    total_value = value_result[0]["total"] if value_result else 0

    # Requisitions (orders)
    total_requisitions = await db.orders.count_documents({})
    pending_requisitions = await db.orders.count_documents({"orderStatus": {"$ne": "Delivered"}})
    fulfilled_requisitions = await db.orders.count_documents({"orderStatus": "Delivered"})

    # Users
    total_users = await db.users.count_documents({})

    # Out-of-stock
    out_of_stock = await db.products.count_documents({"stock": 0})

    return {
        "success": True,
        "stats": {
            "totalEquipment": total_equipment,
            "outOfStock": out_of_stock,
            "totalInventoryValue": round(total_value, 2),
            "totalRequisitions": total_requisitions,
            "pendingRequisitions": pending_requisitions,
            "fulfilledRequisitions": fulfilled_requisitions,
            "totalUsers": total_users,
            "dbMode": db_manager.mode,
        }
    }


# ── Replica Set / DB Status ───────────────────────────────────────────────────
@router.get("/admin/db-status")
async def db_status(current_user: dict = Depends(get_current_user)):
    """
    Returns MongoDB replica set topology status including PRIMARY/SECONDARY
    members, their health, state, and uptime. Falls back gracefully for
    standalone mode.
    """
    _require_admin(current_user)

    db = db_manager.get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        status = await db_manager.client.admin.command("replSetGetStatus")
        members = []
        for m in status.get("members", []):
            members.append({
                "host": m.get("name"),
                "state": m.get("stateStr"),
                "health": m.get("health"),
                "uptime": m.get("uptime"),
                "self": m.get("self", False),
            })
        return {
            "success": True,
            "mode": "replica",
            "setName": status.get("set"),
            "members": members,
        }
    except Exception:
        # Standalone mode — replSetGetStatus is not available
        try:
            server_status = await db_manager.client.admin.command("serverStatus")
            return {
                "success": True,
                "mode": "standalone",
                "host": server_status.get("host"),
                "uptime": server_status.get("uptime"),
                "members": [],
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not fetch DB status: {e}")


# ── Manual Failover / Mode Switch ────────────────────────────────────────────
@router.post("/admin/switch-db")
async def switch_db(body: dict, current_user: dict = Depends(get_current_user)):
    """
    Manually switch between 'replica' and 'standalone' database modes.
    Body: {"mode": "replica"} or {"mode": "standalone"}
    """
    _require_admin(current_user)

    mode = body.get("mode")
    if mode not in ("replica", "standalone"):
        raise HTTPException(status_code=400, detail="mode must be 'replica' or 'standalone'")

    await db_manager.disconnect()
    await db_manager.connect(mode)

    return {
        "success": True,
        "message": f"Switched to {mode} mode",
        "currentMode": db_manager.mode,
    }


# ── System Health (CPU temp + DB ping) ────────────────────────────────────────
@router.get("/admin/health")
async def system_health(current_user: dict = Depends(get_current_user)):
    """Combined system health: DB ping latency + CPU temperature if available."""
    _require_admin(current_user)

    db = db_manager.get_db()
    db_ok = False
    if db is not None:
        try:
            await db_manager.client.admin.command("ping")
            db_ok = True
        except Exception:
            pass

    cpu_temp = None
    system = platform.system()
    try:
        if system == "Linux":
            with open("/sys/class/thermal/thermal_zone0/temp", "r") as f:
                cpu_temp = int(f.read().strip()) / 1000
    except Exception:
        pass

    return {
        "success": True,
        "dbPing": db_ok,
        "dbMode": db_manager.mode,
        "cpuTemperature": cpu_temp,
        "platform": system,
    }
