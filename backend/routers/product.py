from fastapi import APIRouter, HTTPException, Query, Depends, Body
from config.database import db_manager
from models.product import Product
from typing import List, Optional
from bson import ObjectId
import math
from dependencies import get_current_user

router = APIRouter()

# --- Helper for Search & Filter ---
def filter_products(query, keyword, price_gte, price_lte, category, ratings):
    if keyword:
        query["name"] = {"$regex": keyword, "$options": "i"}
    
    if price_gte or price_lte:
        query["price"] = {}
        if price_gte:
            query["price"]["$gte"] = float(price_gte)
        if price_lte:
            query["price"]["$lte"] = float(price_lte)
            
    if category:
        query["category"] = category
        
    if ratings:
        query["ratings"] = {"$gte": float(ratings)}
    
    return query

@router.get("/products", response_model=dict)
async def get_products(
    keyword: Optional[str] = None,
    category: Optional[str] = None,
    price_gte: Optional[float] = Query(None, alias="price[gte]"),
    price_lte: Optional[float] = Query(None, alias="price[lte]"),
    ratings: Optional[float] = None,
    page: int = 1
):
    db = db_manager.get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
        
    # Build Query
    query = {}
    query = filter_products(query, keyword, price_gte, price_lte, category, ratings)
    
    # Pagination
    res_per_page = 4
    skip = (page - 1) * res_per_page
    
    total_products = await db.products.count_documents(query)
    
    products_cursor = db.products.find(query).skip(skip).limit(res_per_page)
    products = await products_cursor.to_list(length=res_per_page)
    
    # Convert ObjectId
    for p in products:
        p["_id"] = str(p["_id"])

    return {
        "success": True,
        "count": len(products),
        "productsCount": total_products,
        "resPerPage": res_per_page,
        "products": products
    }

@router.get("/product/{id}", response_model=dict)
async def get_product(id: str):
    db = db_manager.get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        obj_id = ObjectId(id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    product = await db.products.find_one({"_id": obj_id})

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product["_id"] = str(product["_id"])
    
    return {
        "success": True,
        "product": product
    }

# --- Admin Routes ---

@router.get("/admin/products", response_model=dict)
async def get_admin_products(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    db = db_manager.get_db()
    products_cursor = db.products.find({})
    products = await products_cursor.to_list(length=1000)
    
    for p in products:
        p["_id"] = str(p["_id"])
        
    return {
        "success": True,
        "products": products
    }

@router.post("/admin/product/new", response_model=dict)
async def create_product(product: Product, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    db = db_manager.get_db()
    product_dict = product.dict()
    product_dict["user"] = ObjectId(current_user["_id"])
    
    new_product = await db.products.insert_one(product_dict)
    created_product = await db.products.find_one({"_id": new_product.inserted_id})
    created_product["_id"] = str(created_product["_id"])
    created_product["user"] = str(created_product["user"])
    
    return {
        "success": True,
        "product": created_product
    }

@router.put("/admin/product/{id}", response_model=dict)
async def update_product(id: str, product_update: dict = Body(...), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db = db_manager.get_db()
    try:
        obj_id = ObjectId(id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")

    # Remove _id from update if present
    if "_id" in product_update:
        del product_update["_id"]

    result = await db.products.update_one({"_id": obj_id}, {"$set": product_update})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
        
    updated_product = await db.products.find_one({"_id": obj_id})
    updated_product["_id"] = str(updated_product["_id"])
    if "user" in updated_product:
        updated_product["user"] = str(updated_product["user"])

    return {
        "success": True,
        "product": updated_product
    }

@router.delete("/admin/product/{id}")
async def delete_product(id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    db = db_manager.get_db()
    try:
        obj_id = ObjectId(id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    result = await db.products.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
        
    return {"success": True, "message": "Product deleted"}

# --- Review Routes ---

@router.put("/review")
async def create_review(
    rating: float = Body(...),
    comment: str = Body(...),
    productId: str = Body(...),
    current_user: dict = Depends(get_current_user)
):
    db = db_manager.get_db()
    try:
        obj_id = ObjectId(productId)
    except:
        raise HTTPException(status_code=400, detail="Invalid Product ID")

    review = {
        "_id": ObjectId(),
        "user": ObjectId(current_user["_id"]),
        "name": current_user["name"],
        "rating": float(rating),
        "comment": comment
    }

    product = await db.products.find_one({"_id": obj_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    reviews = product.get("reviews", [])
    
    # Check if user already reviewed
    already_reviewed = False
    for r in reviews:
        if str(r.get("user")) == str(current_user["_id"]):
            r["comment"] = comment
            r["rating"] = float(rating)
            already_reviewed = True
            break
            
    if not already_reviewed:
        reviews.append(review)
        
    # Calculate new ratings
    avg_rating = 0
    if len(reviews) > 0:
        total = sum(r["rating"] for r in reviews)
        avg_rating = total / len(reviews)

    await db.products.update_one(
        {"_id": obj_id},
        {
            "$set": {
                "reviews": reviews,
                "ratings": avg_rating,
                "numOfReviews": len(reviews)
            }
        }
    )

    return {"success": True}

@router.get("/reviews")
async def get_product_reviews(id: str = Query(...)):
    db = db_manager.get_db()
    try:
        obj_id = ObjectId(id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Product ID")
        
    product = await db.products.find_one({"_id": obj_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    reviews = product.get("reviews", [])
    for r in reviews:
        if "user" in r:
            r["user"] = str(r["user"])
        if "_id" in r:
            r["_id"] = str(r["_id"])
            
    return {
        "success": True,
        "reviews": reviews
    }

@router.delete("/reviews")
async def delete_review(id: str = Query(...), productId: str = Query(...), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db = db_manager.get_db()
    try:
        prod_obj_id = ObjectId(productId)
        review_obj_id = ObjectId(id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    product = await db.products.find_one({"_id": prod_obj_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    reviews = product.get("reviews", [])
    
    # Filter out the review to delete
    new_reviews = [r for r in reviews if str(r.get("_id")) != id]
    
    # Recalculate ratings
    avg_rating = 0
    if len(new_reviews) > 0:
        total = sum(r["rating"] for r in new_reviews)
        avg_rating = total / len(new_reviews)
        
    await db.products.update_one(
        {"_id": prod_obj_id},
        {
            "$set": {
                "reviews": new_reviews,
                "ratings": avg_rating,
                "numOfReviews": len(new_reviews)
            }
        }
    )
        
    return {"success": True}


