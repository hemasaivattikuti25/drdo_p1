import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def check_db():
    uri = "mongodb://localhost:27017"
    client = AsyncIOMotorClient(uri)
    
    dbs = await client.list_database_names()
    print("Databases:", dbs)
    
    db = client["favcart"]
    collections = await db.list_collection_names()
    print("Collections in favcart:", collections)
    
    count = await db.products.count_documents({})
    print(f"Product count in favcart.products: {count}")

if __name__ == "__main__":
    asyncio.run(check_db())
