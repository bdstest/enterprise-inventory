"""
Core Inventory Management Services
Provides comprehensive inventory operations and business logic
"""
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
import logging
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, or_, func, select, text
from ..models import Item, Category, Supplier, Location, InventoryMovement, User, Alert
from ..database import get_db
from .rules_engine import RulesEngine
from .analytics_engine import AnalyticsEngine
import asyncio
from uuid import uuid4

logger = logging.getLogger(__name__)

class InventoryService:
    """Core inventory management service"""
    
    def __init__(self, db_session: Union[Session, AsyncSession]):
        self.db_session = db_session
        self.is_async = isinstance(db_session, AsyncSession)
        if isinstance(db_session, Session):
            self.rules_engine = RulesEngine(db_session)
            self.analytics_engine = AnalyticsEngine(db_session)
    
    async def get_inventory_summary(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get comprehensive inventory summary"""
        try:
            logger.info("Retrieving inventory summary")
            
            if self.is_async:
                # Use async session with select syntax
                query = select(Item)
                if filters:
                    query = self._apply_filters_async(query, filters)
                result = await self.db_session.execute(query)
                items = result.scalars().all()
            else:
                # Use sync session with query syntax
                query = self.db_session.query(Item)
                if filters:
                    query = self._apply_filters(query, filters)
                items = query.all()
            
            # Calculate summary metrics
            total_items = len(items)
            total_quantity = sum(item.quantity for item in items)
            total_value = sum(item.quantity * item.price for item in items)
            
            # Stock status counts
            low_stock = sum(1 for item in items if item.quantity <= item.reorder_point)
            out_of_stock = sum(1 for item in items if item.quantity == 0)
            
            # Category breakdown
            categories = {}
            for item in items:
                cat_name = item.category.name if item.category else 'Uncategorized'
                if cat_name not in categories:
                    categories[cat_name] = {'count': 0, 'value': 0}
                categories[cat_name]['count'] += 1
                categories[cat_name]['value'] += item.quantity * item.price
            
            return {
                'total_items': total_items,
                'total_quantity': total_quantity,
                'total_value': round(total_value, 2),
                'low_stock_count': low_stock,
                'out_of_stock_count': out_of_stock,
                'categories': categories,
                'last_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Inventory summary retrieval failed: {str(e)}")
            raise
    
    async def get_items(self, filters: Dict[str, Any] = None, 
                       pagination: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get inventory items with filtering and pagination"""
        try:
            logger.info("Retrieving inventory items")
            
            if self.is_async:
                # Use async session with select syntax
                query = select(Item)
                if filters:
                    query = self._apply_filters_async(query, filters)
                
                # Count total items
                count_query = select(func.count(Item.id))
                if filters:
                    count_query = self._apply_filters_async(count_query, filters)
                count_result = await self.db_session.execute(count_query)
                total_items = count_result.scalar()
                
                # Apply pagination
                if pagination:
                    page = pagination.get('page', 1)
                    page_size = pagination.get('page_size', 50)
                    offset = (page - 1) * page_size
                    query = query.offset(offset).limit(page_size)
                
                result = await self.db_session.execute(query)
                items = result.scalars().all()
            else:
                # Use sync session with query syntax
                query = self.db_session.query(Item)
                if filters:
                    query = self._apply_filters(query, filters)
                
                total_items = query.count()
                
                if pagination:
                    page = pagination.get('page', 1)
                    page_size = pagination.get('page_size', 50)
                    offset = (page - 1) * page_size
                    query = query.offset(offset).limit(page_size)
                
                items = query.all()
            
            # Convert to dict format
            items_data = []
            for item in items:
                item_data = {
                    'id': item.id,
                    'sku': item.sku,
                    'name': item.name,
                    'description': item.description,
                    'quantity': item.quantity,
                    'unit_price': item.price,
                    'cost_price': item.cost,
                    'reorder_point': item.reorder_point,
                    'max_stock': item.max_stock,
                    'category': item.category.name if item.category else None,
                    'supplier': item.supplier.name if item.supplier else None,
                    'location': item.location.name if item.location else None,
                    'stock_status': self._get_stock_status(item),
                    'total_value': item.quantity * item.price,
                    'created_at': item.created_at,
                    'updated_at': item.updated_at
                }
                items_data.append(item_data)
            
            return {
                'items': items_data,
                'total_items': total_items,
                'page': pagination.get('page', 1) if pagination else 1,
                'page_size': pagination.get('page_size', len(items_data)) if pagination else len(items_data),
                'total_pages': (total_items + pagination.get('page_size', 50) - 1) // pagination.get('page_size', 50) if pagination else 1
            }
            
        except Exception as e:
            logger.error(f"Items retrieval failed: {str(e)}")
            raise
    
    async def get_item_by_id(self, item_id: int) -> Dict[str, Any]:
        """Get single item by ID"""
        try:
            if self.is_async:
                # Use async session with select syntax
                query = select(Item).where(Item.id == item_id)
                result = await self.db_session.execute(query)
                item = result.scalar_one_or_none()
                
                if not item:
                    raise ValueError(f"Item with ID {item_id} not found")
                
                # Get recent movements
                movement_query = select(InventoryMovement)\
                    .where(InventoryMovement.item_id == item_id)\
                    .order_by(InventoryMovement.created_at.desc())\
                    .limit(10)
                movement_result = await self.db_session.execute(movement_query)
                recent_movements = movement_result.scalars().all()
            else:
                # Use sync session with query syntax
                item = self.db_session.query(Item).filter(Item.id == item_id).first()
                
                if not item:
                    raise ValueError(f"Item with ID {item_id} not found")
                
                # Get recent movements
                recent_movements = self.db_session.query(InventoryMovement)\
                    .filter(InventoryMovement.item_id == item_id)\
                    .order_by(InventoryMovement.created_at.desc())\
                    .limit(10).all()
            
            movements_data = []
            for movement in recent_movements:
                movements_data.append({
                    'id': movement.id,
                    'type': movement.movement_type.value if hasattr(movement.movement_type, 'value') else str(movement.movement_type),
                    'quantity': movement.quantity,
                    'reference': movement.reference_number,
                    'notes': movement.notes,
                    'created_at': movement.created_at,
                    'user': getattr(movement.user, 'name', None) if movement.user else None
                })
            
            # Build response without lazy loading to avoid async issues
            category_name = None
            supplier_name = None
            location_name = None
            
            if self.is_async:
                # For async sessions, we need to eagerly load relationships or fetch separately
                if item.category_id:
                    cat_query = select(Category).where(Category.id == item.category_id)
                    cat_result = await self.db_session.execute(cat_query)
                    category = cat_result.scalar_one_or_none()
                    category_name = category.name if category else None
                
                if item.supplier_id:
                    sup_query = select(Supplier).where(Supplier.id == item.supplier_id)
                    sup_result = await self.db_session.execute(sup_query)
                    supplier = sup_result.scalar_one_or_none()
                    supplier_name = supplier.name if supplier else None
                    
                if item.location_id:
                    loc_query = select(Location).where(Location.id == item.location_id)
                    loc_result = await self.db_session.execute(loc_query)
                    location = loc_result.scalar_one_or_none()
                    location_name = location.name if location else None
            else:
                # For sync sessions, we can use the relationships directly
                category_name = item.category.name if item.category else None
                supplier_name = item.supplier.name if item.supplier else None
                location_name = item.location.name if item.location else None
            
            return {
                'id': item.id,
                'sku': item.sku,
                'name': item.name,
                'description': item.description,
                'quantity': item.quantity,
                'unit_price': item.price if item.price else 0.0,
                'cost_price': item.cost if item.cost else 0.0,
                'reorder_point': item.reorder_point,
                'max_stock': item.max_stock,
                'category': category_name,
                'supplier': supplier_name,
                'location': location_name,
                'stock_status': self._get_stock_status(item),
                'total_value': (item.quantity * item.price) if item.price else 0.0,
                'recent_movements': movements_data,
                'created_at': item.created_at,
                'updated_at': item.updated_at
            }
            
        except Exception as e:
            logger.error(f"Item retrieval failed: {str(e)}")
            raise
    
    async def create_item(self, item_data: Dict[str, Any], user_id: int) -> Dict[str, Any]:
        """Create new inventory item"""
        try:
            logger.info(f"Creating new item: {item_data.get('name')}")
            
            # Validate required fields
            required_fields = ['sku', 'name']
            for field in required_fields:
                if field not in item_data:
                    raise ValueError(f"Missing required field: {field}")
            
            # Check for duplicate SKU
            if self.is_async:
                query = select(Item).where(Item.sku == item_data['sku'])
                result = await self.db_session.execute(query)
                existing_item = result.scalar_one_or_none()
            else:
                existing_item = self.db_session.query(Item).filter(Item.sku == item_data['sku']).first()
            
            if existing_item:
                raise ValueError(f"Item with SKU {item_data['sku']} already exists")
            
            # Create new item
            item = Item(
                sku=item_data['sku'],
                name=item_data['name'],
                description=item_data.get('description', ''),
                quantity=item_data.get('quantity', 0),
                price=item_data.get('unit_price', item_data.get('price', 0)),
                cost=item_data.get('cost_price', item_data.get('cost', 0)),
                reorder_point=item_data.get('reorder_point', 10),
                max_stock=item_data.get('max_stock', 1000),
                category_id=item_data.get('category_id'),
                supplier_id=item_data.get('supplier_id'),
                location_id=item_data.get('location_id')
            )
            
            self.db_session.add(item)
            
            if self.is_async:
                await self.db_session.commit()
            else:
                self.db_session.commit()
            
            # Create initial stock movement if quantity > 0
            if item_data.get('quantity', 0) > 0:
                await self._create_movement(
                    item.id,
                    'INBOUND',
                    item_data['quantity'],
                    user_id,
                    'Initial stock entry'
                )
            
            logger.info(f"Item created successfully: {item.id}")
            
            # Return created item data without calling get_item_by_id to avoid greenlet issues
            return {
                'id': item.id,
                'sku': item.sku,
                'name': item.name,
                'description': item.description,
                'quantity': item.quantity,
                'unit_price': item.price if item.price else 0.0,
                'cost_price': item.cost if item.cost else 0.0,
                'reorder_point': item.reorder_point,
                'max_stock': item.max_stock,
                'stock_status': self._get_stock_status(item),
                'total_value': (item.quantity * item.price) if item.price else 0.0,
                'created_at': item.created_at,
                'updated_at': item.updated_at,
                'message': 'Item created successfully'
            }
            
        except Exception as e:
            self.db_session.rollback()
            logger.error(f"Item creation failed: {str(e)}")
            raise
    
    async def update_item(self, item_id: int, item_data: Dict[str, Any], user_id: int) -> Dict[str, Any]:
        """Update existing inventory item"""
        try:
            logger.info(f"Updating item: {item_id}")
            
            # Get item with proper async/sync handling
            if self.is_async:
                query = select(Item).where(Item.id == item_id)
                result = await self.db_session.execute(query)
                item = result.scalar_one_or_none()
            else:
                item = self.db_session.query(Item).filter(Item.id == item_id).first()
            
            if not item:
                raise ValueError(f"Item with ID {item_id} not found")
            
            # Track quantity changes
            old_quantity = item.quantity
            
            # Update item fields
            for field, value in item_data.items():
                if hasattr(item, field):
                    setattr(item, field, value)
            
            item.updated_at = datetime.now()
            
            # Create movement record for quantity changes
            if 'quantity' in item_data and item_data['quantity'] != old_quantity:
                movement_type = 'ADJUSTMENT'
                quantity_change = item_data['quantity'] - old_quantity
                
                await self._create_movement(
                    item_id,
                    movement_type,
                    quantity_change,
                    user_id,
                    f"Quantity adjusted from {old_quantity} to {item_data['quantity']}"
                )
            
            # Commit with proper async/sync handling
            if self.is_async:
                await self.db_session.commit()
            else:
                self.db_session.commit()
            
            logger.info(f"Item updated successfully: {item_id}")
            
            # Return updated item data without calling get_item_by_id to avoid greenlet issues
            return {
                'id': item.id,
                'sku': item.sku,
                'name': item.name,
                'description': item.description,
                'quantity': item.quantity,
                'unit_price': item.price if item.price else 0.0,
                'cost_price': item.cost if item.cost else 0.0,
                'reorder_point': item.reorder_point,
                'max_stock': item.max_stock,
                'stock_status': self._get_stock_status(item),
                'total_value': (item.quantity * item.price) if item.price else 0.0,
                'created_at': item.created_at,
                'updated_at': item.updated_at,
                'message': 'Item updated successfully'
            }
            
        except Exception as e:
            self.db_session.rollback()
            logger.error(f"Item update failed: {str(e)}")
            raise
    
    async def delete_item(self, item_id: int, user_id: int) -> bool:
        """Delete inventory item"""
        try:
            logger.info(f"Deleting item: {item_id}")
            
            item = self.db_session.query(Item).filter(Item.id == item_id).first()
            if not item:
                raise ValueError(f"Item with ID {item_id} not found")
            
            # Check if item has stock
            if item.quantity > 0:
                raise ValueError("Cannot delete item with stock. Adjust quantity to 0 first.")
            
            # Delete related records
            self.db_session.query(InventoryMovement).filter(InventoryMovement.item_id == item_id).delete()
            self.db_session.query(Alert).filter(Alert.item_id == item_id).delete()
            
            # Delete item
            self.db_session.delete(item)
            self.db_session.commit()
            
            logger.info(f"Item deleted successfully: {item_id}")
            return True
            
        except Exception as e:
            self.db_session.rollback()
            logger.error(f"Item deletion failed: {str(e)}")
            raise
    
    async def adjust_stock(self, item_id: int, quantity_change: int, 
                          user_id: int, reason: str = None) -> Dict[str, Any]:
        """Adjust item stock level"""
        try:
            logger.info(f"Adjusting stock for item {item_id}: {quantity_change}")
            
            # Get item with proper async/sync handling
            if self.is_async:
                query = select(Item).where(Item.id == item_id)
                result = await self.db_session.execute(query)
                item = result.scalar_one_or_none()
            else:
                item = self.db_session.query(Item).filter(Item.id == item_id).first()
            
            if not item:
                raise ValueError(f"Item with ID {item_id} not found")
            
            old_quantity = item.quantity
            new_quantity = old_quantity + quantity_change
            
            if new_quantity < 0:
                raise ValueError("Cannot adjust stock below zero")
            
            # Update item quantity
            item.quantity = new_quantity
            item.updated_at = datetime.now()
            
            # Create movement record
            movement_type = 'ADJUSTMENT'
            if quantity_change > 0:
                movement_type = 'INBOUND'
            elif quantity_change < 0:
                movement_type = 'OUTBOUND'
            
            movement = await self._create_movement(
                item_id,
                movement_type,
                quantity_change,
                user_id,
                reason or f"Stock adjustment: {quantity_change}"
            )
            
            # Commit with proper async/sync handling
            if self.is_async:
                await self.db_session.commit()
            else:
                self.db_session.commit()
            
            # Check for alerts
            await self._check_stock_alerts(item)
            
            logger.info(f"Stock adjusted successfully: {item_id}")
            
            return {
                'item_id': item_id,
                'old_quantity': old_quantity,
                'new_quantity': new_quantity,
                'change': quantity_change,
                'movement_id': movement.id,
                'timestamp': datetime.now()
            }
            
        except Exception as e:
            self.db_session.rollback()
            logger.error(f"Stock adjustment failed: {str(e)}")
            raise
    
    async def receive_stock(self, item_id: int, quantity: int, user_id: int,
                           reference: str = None, notes: str = None) -> Dict[str, Any]:
        """Receive stock into inventory"""
        try:
            logger.info(f"Receiving stock for item {item_id}: {quantity}")
            
            if quantity <= 0:
                raise ValueError("Quantity must be positive")
            
            result = await self.adjust_stock(
                item_id,
                quantity,
                user_id,
                f"Stock received - {reference or 'Manual entry'}"
            )
            
            # Update movement with reference
            if reference:
                movement = self.db_session.query(InventoryMovement)\
                    .filter(InventoryMovement.id == result['movement_id']).first()
                if movement:
                    movement.reference_number = reference
                    movement.notes = notes
                    self.db_session.commit()
            
            return result
            
        except Exception as e:
            logger.error(f"Stock receipt failed: {str(e)}")
            raise
    
    async def issue_stock(self, item_id: int, quantity: int, user_id: int,
                         reference: str = None, notes: str = None) -> Dict[str, Any]:
        """Issue stock from inventory"""
        try:
            logger.info(f"Issuing stock for item {item_id}: {quantity}")
            
            if quantity <= 0:
                raise ValueError("Quantity must be positive")
            
            # Check available stock
            item = self.db_session.query(Item).filter(Item.id == item_id).first()
            if not item:
                raise ValueError(f"Item with ID {item_id} not found")
            
            if item.quantity < quantity:
                raise ValueError(f"Insufficient stock. Available: {item.quantity}, Requested: {quantity}")
            
            result = await self.adjust_stock(
                item_id,
                -quantity,
                user_id,
                f"Stock issued - {reference or 'Manual entry'}"
            )
            
            # Update movement with reference
            if reference:
                movement = self.db_session.query(InventoryMovement)\
                    .filter(InventoryMovement.id == result['movement_id']).first()
                if movement:
                    movement.reference_number = reference
                    movement.notes = notes
                    self.db_session.commit()
            
            return result
            
        except Exception as e:
            logger.error(f"Stock issue failed: {str(e)}")
            raise
    
    async def transfer_stock(self, from_item_id: int, to_item_id: int, 
                           quantity: int, user_id: int, notes: str = None) -> Dict[str, Any]:
        """Transfer stock between items"""
        try:
            logger.info(f"Transferring stock from {from_item_id} to {to_item_id}: {quantity}")
            
            if quantity <= 0:
                raise ValueError("Quantity must be positive")
            
            # Issue from source
            from_result = await self.issue_stock(
                from_item_id,
                quantity,
                user_id,
                f"Transfer to item {to_item_id}",
                notes
            )
            
            # Receive at destination
            to_result = await self.receive_stock(
                to_item_id,
                quantity,
                user_id,
                f"Transfer from item {from_item_id}",
                notes
            )
            
            return {
                'from_item_id': from_item_id,
                'to_item_id': to_item_id,
                'quantity': quantity,
                'from_movement_id': from_result['movement_id'],
                'to_movement_id': to_result['movement_id'],
                'timestamp': datetime.now()
            }
            
        except Exception as e:
            logger.error(f"Stock transfer failed: {str(e)}")
            raise
    
    async def get_stock_movements(self, item_id: int = None, 
                                 filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get stock movement history"""
        try:
            query = self.db_session.query(InventoryMovement)
            
            if item_id:
                query = query.filter(InventoryMovement.item_id == item_id)
            
            if filters:
                if 'start_date' in filters:
                    query = query.filter(InventoryMovement.created_at >= filters['start_date'])
                if 'end_date' in filters:
                    query = query.filter(InventoryMovement.created_at <= filters['end_date'])
                if 'movement_type' in filters:
                    query = query.filter(InventoryMovement.movement_type == filters['movement_type'])
            
            movements = query.order_by(InventoryMovement.created_at.desc()).all()
            
            movements_data = []
            for movement in movements:
                movements_data.append({
                    'id': movement.id,
                    'item_id': movement.item_id,
                    'item_name': movement.item.name if movement.item else None,
                    'item_sku': movement.item.sku if movement.item else None,
                    'movement_type': movement.movement_type,
                    'quantity': movement.quantity,
                    'reference': movement.reference_number,
                    'notes': movement.notes,
                    'user': movement.user.name if movement.user else None,
                    'created_at': movement.created_at
                })
            
            return movements_data
            
        except Exception as e:
            logger.error(f"Stock movements retrieval failed: {str(e)}")
            raise
    
    async def get_low_stock_items(self) -> List[Dict[str, Any]]:
        """Get items with low stock levels"""
        try:
            items = self.db_session.query(Item)\
                .filter(Item.quantity <= Item.reorder_point)\
                .order_by(Item.quantity.asc()).all()
            
            low_stock_items = []
            for item in items:
                low_stock_items.append({
                    'id': item.id,
                    'sku': item.sku,
                    'name': item.name,
                    'quantity': item.quantity,
                    'reorder_point': item.reorder_point,
                    'category': item.category.name if item.category else None,
                    'supplier': item.supplier.name if item.supplier else None,
                    'stock_status': self._get_stock_status(item),
                    'urgency': 'critical' if item.quantity == 0 else 'high' if item.quantity < item.reorder_point * 0.5 else 'medium'
                })
            
            return low_stock_items
            
        except Exception as e:
            logger.error(f"Low stock items retrieval failed: {str(e)}")
            raise
    
    async def get_overstock_items(self) -> List[Dict[str, Any]]:
        """Get items with excess stock levels"""
        try:
            items = self.db_session.query(Item)\
                .filter(Item.quantity > Item.max_stock)\
                .order_by(Item.quantity.desc()).all()
            
            overstock_items = []
            for item in items:
                excess_quantity = item.quantity - item.max_stock
                tied_capital = excess_quantity * item.cost
                
                overstock_items.append({
                    'id': item.id,
                    'sku': item.sku,
                    'name': item.name,
                    'quantity': item.quantity,
                    'max_stock': item.max_stock,
                    'excess_quantity': excess_quantity,
                    'tied_capital': tied_capital,
                    'category': item.category.name if item.category else None,
                    'supplier': item.supplier.name if item.supplier else None
                })
            
            return overstock_items
            
        except Exception as e:
            logger.error(f"Overstock items retrieval failed: {str(e)}")
            raise
    
    async def perform_stock_count(self, location_id: int = None) -> Dict[str, Any]:
        """Perform stock count"""
        try:
            logger.info(f"Performing stock count for location: {location_id}")
            
            query = self.db_session.query(Item)
            if location_id:
                query = query.filter(Item.location_id == location_id)
            
            items = query.all()
            
            count_id = str(uuid4())
            count_data = {
                'count_id': count_id,
                'started_at': datetime.now(),
                'location_id': location_id,
                'total_items': len(items),
                'items': []
            }
            
            for item in items:
                count_data['items'].append({
                    'id': item.id,
                    'sku': item.sku,
                    'name': item.name,
                    'system_quantity': item.quantity,
                    'counted_quantity': None,
                    'variance': None,
                    'status': 'pending'
                })
            
            return count_data
            
        except Exception as e:
            logger.error(f"Stock count failed: {str(e)}")
            raise
    
    async def _create_movement(self, item_id: int, movement_type: str, 
                              quantity: int, user_id: int, notes: str = None) -> InventoryMovement:
        """Create inventory movement record"""
        # Get current item to determine quantity_before
        if self.is_async:
            query = select(Item).where(Item.id == item_id)
            result = await self.db_session.execute(query)
            item = result.scalar_one_or_none()
        else:
            item = self.db_session.query(Item).filter(Item.id == item_id).first()
        
        if not item:
            raise ValueError(f"Item with ID {item_id} not found")
        
        quantity_before = item.quantity
        quantity_after = quantity_before + quantity
        
        # Don't set the id manually - let PostgreSQL auto-generate it
        movement = InventoryMovement(
            item_id=item_id,
            movement_type=movement_type,
            quantity=quantity,
            quantity_before=quantity_before,
            quantity_after=quantity_after,
            user_id=user_id,
            notes=notes
        )
        
        self.db_session.add(movement)
        
        if self.is_async:
            await self.db_session.flush()  # Get the ID without committing
        else:
            self.db_session.flush()  # Get the ID without committing
        
        return movement
    
    async def _check_stock_alerts(self, item: Item):
        """Check and create stock alerts"""
        alerts = []
        
        if item.quantity == 0:
            alerts.append({
                'type': 'out_of_stock',
                'severity': 'critical',
                'message': f"Item {item.name} is out of stock",
                'item_id': item.id
            })
        elif item.quantity <= item.reorder_point:
            alerts.append({
                'type': 'low_stock',
                'severity': 'high',
                'message': f"Item {item.name} is below reorder point",
                'item_id': item.id
            })
        elif item.quantity > item.max_stock:
            alerts.append({
                'type': 'overstock',
                'severity': 'medium',
                'message': f"Item {item.name} exceeds maximum stock level",
                'item_id': item.id
            })
        
        # Create alert records
        for alert_data in alerts:
            alert = Alert(
                type=alert_data['type'],
                severity=alert_data['severity'],
                message=alert_data['message'],
                item_id=alert_data['item_id'],
                is_read=False
            )
            self.db_session.add(alert)
    
    def _get_stock_status(self, item: Item) -> str:
        """Get stock status for an item"""
        if item.quantity == 0:
            return 'out_of_stock'
        elif item.quantity <= item.reorder_point:
            return 'low_stock'
        elif item.quantity > item.max_stock:
            return 'overstock'
        else:
            return 'normal'
    
    def _apply_filters(self, query, filters: Dict[str, Any]):
        """Apply filters to query"""
        if 'category_id' in filters:
            query = query.filter(Item.category_id == filters['category_id'])
        
        if 'supplier_id' in filters:
            query = query.filter(Item.supplier_id == filters['supplier_id'])
        
        if 'location_id' in filters:
            query = query.filter(Item.location_id == filters['location_id'])
        
        if 'stock_status' in filters:
            status = filters['stock_status']
            if status == 'low_stock':
                query = query.filter(Item.quantity <= Item.reorder_point)
            elif status == 'out_of_stock':
                query = query.filter(Item.quantity == 0)
            elif status == 'overstock':
                query = query.filter(Item.quantity > Item.max_stock)
            elif status == 'normal':
                query = query.filter(
                    and_(
                        Item.quantity > Item.reorder_point,
                        Item.quantity <= Item.max_stock
                    )
                )
        
        if 'search' in filters:
            search_term = f"%{filters['search']}%"
            query = query.filter(
                or_(
                    Item.name.ilike(search_term),
                    Item.sku.ilike(search_term),
                    Item.description.ilike(search_term)
                )
            )
        
        if 'min_quantity' in filters:
            query = query.filter(Item.quantity >= filters['min_quantity'])
        
        if 'max_quantity' in filters:
            query = query.filter(Item.quantity <= filters['max_quantity'])
        
        if 'min_price' in filters:
            query = query.filter(Item.price >= filters['min_price'])
        
        if 'max_price' in filters:
            query = query.filter(Item.price <= filters['max_price'])
        
        return query
    
    def _apply_filters_async(self, query, filters: Dict[str, Any]):
        """Apply filters to async query"""
        if 'category_id' in filters:
            query = query.where(Item.category_id == filters['category_id'])
        
        if 'supplier_id' in filters:
            query = query.where(Item.supplier_id == filters['supplier_id'])
        
        if 'location_id' in filters:
            query = query.where(Item.location_id == filters['location_id'])
        
        if 'stock_status' in filters:
            status = filters['stock_status']
            if status == 'low_stock':
                query = query.where(Item.quantity <= Item.reorder_point)
            elif status == 'out_of_stock':
                query = query.where(Item.quantity == 0)
            elif status == 'overstock':
                query = query.where(Item.quantity > Item.max_stock)
            elif status == 'normal':
                query = query.where(
                    and_(
                        Item.quantity > Item.reorder_point,
                        Item.quantity <= Item.max_stock
                    )
                )
        
        if 'search' in filters:
            search_term = f"%{filters['search']}%"
            query = query.where(
                or_(
                    Item.name.ilike(search_term),
                    Item.sku.ilike(search_term),
                    Item.description.ilike(search_term)
                )
            )
        
        if 'min_quantity' in filters:
            query = query.where(Item.quantity >= filters['min_quantity'])
        
        if 'max_quantity' in filters:
            query = query.where(Item.quantity <= filters['max_quantity'])
        
        if 'min_price' in filters:
            query = query.where(Item.price >= filters['min_price'])
        
        if 'max_price' in filters:
            query = query.where(Item.price <= filters['max_price'])
        
        return query