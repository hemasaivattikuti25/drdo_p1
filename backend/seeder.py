import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

products = [
    {
        "name": "OPPO F21s Pro 5G",
        "price": 245.67,
        "description": "OPPO F21s Pro 5G is a powerful device with a RAM extension feature, that offers brilliant operational speed to users.",
        "ratings": 4.5,
        "images": [
            {
                "image": "/images/products/1.jpg"
            }
        ],
        "category": "Mobile Phones",
        "seller": "Amazon",
        "stock": 22,
        "numOfReviews": 0,
        "reviews": []
    },
    {
        "name": "WRISTIO HD, Bluetooth Calling Smart Watch",
        "price": 150.32,
        "description": "Minix Wristio HD is a new age smart watch with a 1.3 inch HD display and a 2.5D curved glass.",
        "ratings": 3.5,
        "images": [
            {
                "image": "/images/products/2.jpg"
            }
        ],
        "category": "Accessories",
        "seller": "Flipkart",
        "stock": 5,
        "numOfReviews": 0,
        "reviews": []
    },
    {
        "name": "Dell Inspiron 3511 Laptop",
        "price": 440.57,
        "description": "Dell Inspiron 3511 Laptop, Intel i3-1115G4, 8GB, 512GB SSD, Win 11 + MSO'21, 15.6\" (39.61 cms) FHD WVA AG, Carbon Black",
        "ratings": 4.8,
        "images": [
            {
                "image": "/images/products/3.jpg"
            }
        ],
        "category": "Laptops",
        "seller": "Ebay",
        "stock": 10,
        "numOfReviews": 0,
        "reviews": []
    },
    {
        "name": "PTron Bassbuds Duo",
        "price": 12.45,
        "description": "PTron Bassbuds Duo in-Ear True Wireless Bluetooth 5.1 Headphones with Mic, TWS Deep Bass, Touch Control, IPX4 Water/Sweat Resistance",
        "ratings": 4.1,
        "images": [
            {
                "image": "/images/products/4.jpg"
            }
        ],
        "category": "Headphones",
        "seller": "Amazon",
        "stock": 100,
        "numOfReviews": 0,
        "reviews": []
    }
]

async def seed_products():
    uri = "mongodb://localhost:27017/favcart"
    client = AsyncIOMotorClient(uri)
    db = client.get_default_database()
    
    print("Deleting existing products...")
    await db.products.delete_many({})
    
    print("Inserting new products...")
    for product in products:
        product["createdAt"] = datetime.now()
        await db.products.insert_one(product)
        
    print("Products seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_products())
