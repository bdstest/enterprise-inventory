"""
Inventory API Routes - PostgreSQL with Schema-Aligned Models
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from ...database import get_db
from ...models import Item, Category, Supplier, Location
from ..schemas import ItemResponse, ItemCreate, ItemUpdate, ItemListResponse

router = APIRouter()

@router.get("/items", response_model=ItemListResponse)
async def get_items(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get items with filtering and pagination"""
    try:
        # Build query
        query = select(Item).options(
            selectinload(Item.category),
            selectinload(Item.supplier),
            selectinload(Item.location)
        )
        
        # Apply filters
        if category_id:
            query = query.where(Item.category_id == category_id)
        
        if search:
            search_term = f"%{search}%"
            query = query.where(
                (Item.name.ilike(search_term)) |
                (Item.sku.ilike(search_term)) |
                (Item.description.ilike(search_term))
            )
        
        # Get total count
        count_query = select(func.count(Item.id))
        if category_id:
            count_query = count_query.where(Item.category_id == category_id)
        if search:
            search_term = f"%{search}%"
            count_query = count_query.where(
                (Item.name.ilike(search_term)) |
                (Item.sku.ilike(search_term)) |
                (Item.description.ilike(search_term))
            )
        
        total_result = await db.execute(count_query)
        total_items = total_result.scalar()
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        # Execute query
        result = await db.execute(query)
        items = result.scalars().all()
        
        return ItemListResponse(
            items=[ItemResponse.model_validate(item) for item in items],
            total_items=total_items,
            page=skip // limit + 1,
            page_size=len(items),
            total_pages=(total_items + limit - 1) // limit
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve items: {str(e)}"
        )

@router.get("/items/{item_id}", response_model=ItemResponse)
async def get_item(item_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single item by ID"""
    try:
        query = select(Item).options(
            selectinload(Item.category),
            selectinload(Item.supplier),
            selectinload(Item.location)
        ).where(Item.id == item_id)
        
        result = await db.execute(query)
        item = result.scalar_one_or_none()
        
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with ID {item_id} not found"
            )
        
        return ItemResponse.model_validate(item)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve item: {str(e)}"
        )

@router.post("/items", response_model=ItemResponse)
async def create_item(item_data: ItemCreate, db: AsyncSession = Depends(get_db)):
    """Create a new item"""
    try:
        # Check if SKU already exists
        existing_query = select(Item).where(Item.sku == item_data.sku)
        existing_result = await db.execute(existing_query)
        existing_item = existing_result.scalar_one_or_none()
        
        if existing_item:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Item with SKU {item_data.sku} already exists"
            )
        
        # Create new item - using schema-aligned field names
        item = Item(
            sku=item_data.sku,
            name=item_data.name,
            description=item_data.description,
            barcode=item_data.barcode,
            category_id=item_data.category_id,
            supplier_id=item_data.supplier_id,
            location_id=item_data.location_id,
            quantity=item_data.quantity or 0,
            reserved_quantity=item_data.reserved_quantity or 0,
            available_quantity=item_data.available_quantity or 0,
            min_stock=item_data.min_stock or 0,
            max_stock=item_data.max_stock or 1000,
            reorder_point=item_data.reorder_point or 10,
            reorder_quantity=item_data.reorder_quantity or 100,
            price=item_data.price,  # Aligned field name
            cost=item_data.cost,    # Aligned field name
            last_cost=item_data.last_cost,
            average_cost=item_data.average_cost,
            weight=item_data.weight,
            dimensions=item_data.dimensions,
            unit=item_data.unit or "pcs",
            batch_tracking=item_data.batch_tracking or False,
            serial_tracking=item_data.serial_tracking or False,
            expiry_tracking=item_data.expiry_tracking or False,
            is_active=item_data.is_active if item_data.is_active is not None else True,
            is_sellable=item_data.is_sellable if item_data.is_sellable is not None else True,
            is_purchasable=item_data.is_purchasable if item_data.is_purchasable is not None else True,
            tags=item_data.tags,
            custom_fields=item_data.custom_fields
        )
        
        db.add(item)
        await db.commit()
        await db.refresh(item)
        
        # Load relationships
        query = select(Item).options(
            selectinload(Item.category),
            selectinload(Item.supplier),
            selectinload(Item.location)
        ).where(Item.id == item.id)
        
        result = await db.execute(query)
        created_item = result.scalar_one()
        
        return ItemResponse.model_validate(created_item)
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create item: {str(e)}"
        )

@router.put("/items/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: int, 
    item_data: ItemUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update an existing item"""
    try:
        # Get existing item
        query = select(Item).where(Item.id == item_id)
        result = await db.execute(query)
        item = result.scalar_one_or_none()
        
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with ID {item_id} not found"
            )
        
        # Update fields that were provided
        update_data = item_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(item, field, value)
        
        await db.commit()
        await db.refresh(item)
        
        # Load relationships
        query = select(Item).options(
            selectinload(Item.category),
            selectinload(Item.supplier),
            selectinload(Item.location)
        ).where(Item.id == item.id)
        
        result = await db.execute(query)
        updated_item = result.scalar_one()
        
        return ItemResponse.model_validate(updated_item)
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update item: {str(e)}"
        )

@router.delete("/items/{item_id}")
async def delete_item(item_id: int, db: AsyncSession = Depends(get_db)):
    """Delete an item"""
    try:
        # Get existing item
        query = select(Item).where(Item.id == item_id)
        result = await db.execute(query)
        item = result.scalar_one_or_none()
        
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with ID {item_id} not found"
            )
        
        await db.delete(item)
        await db.commit()
        
        return {"message": f"Item {item_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete item: {str(e)}"
        )

@router.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Get all categories"""
    try:
        query = select(Category).where(Category.is_active == True)
        result = await db.execute(query)
        categories = result.scalars().all()
        
        return [
            {
                "id": cat.id,
                "name": cat.name,
                "description": cat.description
            }
            for cat in categories
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve categories: {str(e)}"
        )

@router.get("/suppliers")
async def get_suppliers(db: AsyncSession = Depends(get_db)):
    """Get all suppliers"""
    try:
        query = select(Supplier).where(Supplier.is_active == True)
        result = await db.execute(query)
        suppliers = result.scalars().all()
        
        return [
            {
                "id": sup.id,
                "name": sup.name,
                "contact_person": sup.contact_person,
                "email": sup.email
            }
            for sup in suppliers
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve suppliers: {str(e)}"
        )

@router.get("/locations")
async def get_locations(db: AsyncSession = Depends(get_db)):
    """Get all locations"""
    try:
        query = select(Location).where(Location.is_active == True)
        result = await db.execute(query)
        locations = result.scalars().all()
        
        return [
            {
                "id": loc.id,
                "name": loc.name,
                "type": loc.type,
                "address": loc.address
            }
            for loc in locations
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve locations: {str(e)}"
        )