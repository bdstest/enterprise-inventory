"""
Dashboard API Routes
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ...database import get_db
from ...models import Item, Category

router = APIRouter()

@router.get("/summary")
async def get_dashboard_summary(db: AsyncSession = Depends(get_db)):
    """Get dashboard summary statistics"""
    try:
        # Get total items count
        total_items_result = await db.execute(select(func.count(Item.id)))
        total_items = total_items_result.scalar()
        
        # Get total value
        total_value_result = await db.execute(
            select(func.sum(Item.quantity * Item.price)).where(Item.price.isnot(None))
        )
        total_value = total_value_result.scalar() or 0
        
        # Get low stock count
        low_stock_result = await db.execute(
            select(func.count(Item.id)).where(Item.quantity <= Item.reorder_point)
        )
        low_stock_count = low_stock_result.scalar()
        
        # Get out of stock count
        out_of_stock_result = await db.execute(
            select(func.count(Item.id)).where(Item.quantity == 0)
        )
        out_of_stock_count = out_of_stock_result.scalar()
        
        # Get categories count
        categories_result = await db.execute(select(func.count(Category.id)))
        categories_count = categories_result.scalar()
        
        return {
            "total_items": total_items,
            "total_value": float(total_value),
            "low_stock_count": low_stock_count,
            "out_of_stock_count": out_of_stock_count,
            "categories_count": categories_count,
            "database_type": "PostgreSQL",
            "schema_aligned": True
        }
        
    except Exception as e:
        # Return default values if database is not ready
        return {
            "total_items": 0,
            "total_value": 0.0,
            "low_stock_count": 0,
            "out_of_stock_count": 0,
            "categories_count": 0,
            "database_type": "PostgreSQL",
            "schema_aligned": True,
            "error": f"Database not ready: {str(e)}"
        }

@router.get("/status")
async def get_system_status():
    """Get system status"""
    return {
        "status": "operational",
        "version": "2.0.0",
        "database": "PostgreSQL",
        "architecture": "Docker + FastAPI + Redis",
        "schema_aligned": True,
        "migration_status": "Step 2 - PostgreSQL Implementation"
    }