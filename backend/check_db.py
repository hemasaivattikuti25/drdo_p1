"""
DRDO DAMS — Quick Database Connectivity Check
==============================================
Usage:  python3 check_db.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

DB_NAME = "drdo_dams"


async def check_db():
    uri = "mongodb://localhost:27017"
    client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=3000)

    try:
        await client.admin.command("ping")
        print("\u2705 MongoDB is reachable.")
    except Exception as e:
        print(f"\u274c Cannot connect to MongoDB: {e}")
        return

    dbs = await client.list_database_names()
    print(f"Databases: {dbs}")

    db = client[DB_NAME]
    collections = await db.list_collection_names()
    print(f"Collections in {DB_NAME}: {collections}")

    product_count = await db.products.count_documents({})
    user_count = await db.users.count_documents({})
    order_count = await db.orders.count_documents({})
    print(f"Products: {product_count}  |  Users: {user_count}  |  Orders: {order_count}")

    client.close()


if __name__ == "__main__":
    asyncio.run(check_db())
