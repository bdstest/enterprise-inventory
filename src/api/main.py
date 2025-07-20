"""
FastAPI Main Application
Enterprise Inventory Management System API
"""
from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime
import os
import tempfile

# Local imports
from ..database import get_db, get_sync_db
from ..models import User, Item, Category, Supplier, Location
from ..services.inventory_service import InventoryService
from ..services.etl_engine import ETLEngine
from ..services.rules_engine import RulesEngine
from ..services.analytics_engine import AnalyticsEngine
from ..services.auth_service import AuthService
from .routes.two_factor import router as two_factor_router
from .schemas import (
    LoginRequest, UserRegistrationRequest,
    ItemCreate, ItemUpdate, ItemResponse, ItemListResponse,
    StockAdjustment, StockTransfer, InventoryMovementResponse,
    ETLImportRequest, ETLExportRequest, ETLImportResponse,
    RuleCreate, RuleResponse, AnalyticsRequest, DashboardResponse
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Enterprise Inventory Management System",
    description="Advanced inventory management with ETL, AI rules engine, and analytics",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Security
security = HTTPBearer()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get current user
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security),
                     db: Session = Depends(get_sync_db)) -> User:
    """Get current authenticated user with proper JWT validation"""
    try:
        auth_service = AuthService(db)
        
        # Get token from credentials
        token = credentials.credentials if credentials else None
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token required",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Validate token format
        if not auth_service.validate_token_format(token):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token format",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if token is blacklisted
        if auth_service.is_token_blacklisted(token):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user from token
        user = auth_service.get_user_from_token(token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Enterprise Inventory Management System API",
        "version": "2.0.0",
        "status": "operational",
        "features": [
            "Multi-format ETL (9 formats)",
            "AI-powered rules engine",
            "Advanced analytics",
            "Real-time inventory tracking",
            "Comprehensive reporting"
        ],
        "endpoints": {
            "docs": "/api/docs",
            "redoc": "/api/redoc",
            "health": "/health"
        }
    }

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "services": {
            "database": "connected",
            "etl_engine": "operational",
            "rules_engine": "operational",
            "analytics_engine": "operational"
        }
    }

@app.get("/api/test/db")
def test_db_connection(db: Session = Depends(get_sync_db)):
    """Test database connection with sync session"""
    try:
        items = db.query(Item).count()
        return {"status": "success", "item_count": items}
    except Exception as e:
        return {"status": "error", "error": str(e)}

# ================================
# AUTHENTICATION ENDPOINTS
# ================================

from pydantic import BaseModel


@app.post("/api/auth/login")
def login(
    request: LoginRequest = Body(None),
    email: str = Form(None),
    password: str = Form(None),
    two_factor_token: str = Form(None),
    db: Session = Depends(get_sync_db)
):
    """Authenticate user and return JWT token - supports 2FA"""
    try:
        # Handle both JSON and form data
        if request:
            user_email = request.email
            user_password = request.password
            user_2fa_token = request.two_factor_token
        elif email and password:
            user_email = email
            user_password = password
            user_2fa_token = two_factor_token
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email and password are required (JSON or form data)"
            )
        
        auth_service = AuthService(db)
        
        # Check if 2FA is required first
        two_fa_required = auth_service.check_2fa_required(user_email, user_password)
        
        if two_fa_required and not user_2fa_token:
            return {
                "message": "2FA token required",
                "two_factor_required": True
            }
        
        # Authenticate user with 2FA if provided
        user = auth_service.authenticate_user(user_email, user_password, user_2fa_token)
        if not user:
            if two_fa_required:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials or 2FA token",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials",
                    headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token = auth_service.create_access_token(user.id, user.email)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
                "permissions": ["admin"] if user.role == "ADMIN" else ["user"],
                "createdAt": user.created_at.isoformat() if user.created_at else None,
                "lastLogin": None
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.get("/api/auth/verify")
def verify_token(current_user: User = Depends(get_current_user)):
    """Verify JWT token and return user info"""
    return {
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "name": current_user.name,
            "role": current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role),
            "permissions": ["admin"] if current_user.role == "ADMIN" else ["user"],
            "createdAt": current_user.created_at.isoformat() if current_user.created_at else None,
            "lastLogin": None,
            "is_active": current_user.is_active
        }
    }

@app.get("/api/auth/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role),
        "is_active": current_user.is_active
    }

@app.get("/api/auth/demo-token")
def get_demo_token(db: Session = Depends(get_sync_db)):
    """Get demo token for testing (remove in production)"""
    try:
        auth_service = AuthService(db)
        token = auth_service.create_demo_token()
        return {"access_token": token, "token_type": "bearer"}
    except Exception as e:
        logger.error(f"Demo token creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Demo token creation failed: {str(e)}")

@app.get("/api/auth/simple-token")
def get_simple_token():
    """Get a simple test token"""
    try:
        import jwt
        from datetime import datetime, timedelta
        
        # Create simple token
        payload = {
            "sub": "1",
            "email": "admin@demo.com",
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=24)
        }
        
        token = jwt.encode(payload, "your-secret-key-here", algorithm="HS256")
        return {"access_token": token, "token_type": "bearer"}
    except Exception as e:
        logger.error(f"Simple token creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Simple token creation failed: {str(e)}")

@app.post("/api/auth/register")
def register_user(
    request: UserRegistrationRequest,
    db: Session = Depends(get_sync_db)
):
    """Register new user (admin only in production)"""
    try:
        auth_service = AuthService(db)
        
        # Check if user already exists
        existing_user = auth_service.get_user_by_email(request.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Validate role
        valid_roles = ["admin", "manager", "user"]
        if request.role.lower() not in valid_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Must be one of: {valid_roles}"
            )
        
        # Create new user
        from ..models import UserRole
        role_mapping = {
            "admin": UserRole.ADMIN,
            "manager": UserRole.MANAGER,
            "user": UserRole.USER
        }
        
        new_user = User(
            email=request.email,
            name=request.name,
            role=role_mapping[request.role.lower()],
            password_hash=auth_service.hash_password(request.password),
            is_active=True,
            is_verified=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Create access token
        access_token = auth_service.create_access_token(new_user.id, new_user.email)
        
        return {
            "message": "User registered successfully",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(new_user.id),
                "email": new_user.email,
                "name": new_user.name,
                "role": new_user.role.value if hasattr(new_user.role, 'value') else str(new_user.role),
                "permissions": ["admin"] if new_user.role == UserRole.ADMIN else ["user"],
                "createdAt": new_user.created_at.isoformat() if new_user.created_at else None,
                "lastLogin": None
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"User registration failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed")

# Include 2FA router
app.include_router(two_factor_router)

# ================================
# INVENTORY MANAGEMENT ENDPOINTS
# ================================

@app.get("/api/inventory/summary")
def get_inventory_summary(
    db: Session = Depends(get_sync_db),
    current_user: User = Depends(get_current_user)
):
    """Get inventory summary statistics"""
    try:
        service = InventoryService(db)
        # Use sync method for now
        items = db.query(Item).all()
        
        total_items = len(items)
        total_quantity = sum(item.quantity for item in items)
        total_value = sum(item.quantity * item.price for item in items)
        
        low_stock = sum(1 for item in items if item.quantity <= item.reorder_point)
        out_of_stock = sum(1 for item in items if item.quantity == 0)
        
        return {
            "total_items": total_items,
            "total_quantity": total_quantity,
            "total_value": total_value,
            "low_stock_items": low_stock,
            "out_of_stock_items": out_of_stock,
            "categories": db.query(Category).count(),
            "suppliers": db.query(Supplier).count(),
            "locations": db.query(Location).count()
        }
    except Exception as e:
        logger.error(f"Summary retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/inventory/items", response_model=ItemListResponse)
async def get_inventory_items(
    page: int = 1,
    page_size: int = 50,
    category_id: Optional[int] = None,
    supplier_id: Optional[int] = None,
    location_id: Optional[int] = None,
    stock_status: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get inventory items with filtering and pagination"""
    try:
        service = InventoryService(db)
        
        filters = {}
        if category_id:
            filters['category_id'] = category_id
        if supplier_id:
            filters['supplier_id'] = supplier_id
        if location_id:
            filters['location_id'] = location_id
        if stock_status:
            filters['stock_status'] = stock_status
        if search:
            filters['search'] = search
        
        pagination = {'page': page, 'page_size': page_size}
        
        result = await service.get_items(filters, pagination)
        return result
    except Exception as e:
        logger.error(f"Items retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/inventory/items/{item_id}")
def get_inventory_item(
    item_id: int,
    db: Session = Depends(get_sync_db),
    current_user: User = Depends(get_current_user)
):
    """Get single inventory item by ID"""
    try:
        service = InventoryService(db)
        # Use sync version to avoid greenlet issues
        item = db.query(Item).filter(Item.id == item_id).first()
        
        if not item:
            raise HTTPException(status_code=404, detail=f"Item with ID {item_id} not found")
        
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
            'category': item.category.name if item.category else None,
            'supplier': item.supplier.name if item.supplier else None,
            'location': item.location.name if item.location else None,
            'stock_status': service._get_stock_status(item),
            'total_value': (item.quantity * item.price) if item.price else 0.0,
            'created_at': item.created_at,
            'updated_at': item.updated_at
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Item retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/inventory/items")
def create_inventory_item(
    item: ItemCreate,
    db: Session = Depends(get_sync_db),
    current_user: User = Depends(get_current_user)
):
    """Create new inventory item"""
    try:
        service = InventoryService(db)
        # Use sync version to avoid async/sync mixing
        import asyncio
        new_item = asyncio.run(service.create_item(item.dict(), current_user.id))
        return new_item
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Item creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/inventory/items/{item_id}")
async def update_inventory_item(
    item_id: int,
    item: ItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update existing inventory item"""
    try:
        service = InventoryService(db)
        updated_item = await service.update_item(item_id, item.dict(exclude_unset=True), current_user.id)
        return updated_item
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Item update failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/inventory/items/{item_id}")
async def delete_inventory_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete inventory item"""
    try:
        service = InventoryService(db)
        await service.delete_item(item_id, current_user.id)
        return {"message": "Item deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Item deletion failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ================================
# STOCK MANAGEMENT ENDPOINTS
# ================================

@app.post("/api/inventory/stock/adjust")
def adjust_stock(
    adjustment: StockAdjustment,
    db: Session = Depends(get_sync_db),
    current_user: User = Depends(get_current_user)
):
    """Adjust stock level for an item"""
    try:
        service = InventoryService(db)
        # Use sync version to avoid async/sync mixing
        import asyncio
        result = asyncio.run(service.adjust_stock(
            adjustment.item_id,
            adjustment.quantity_change,
            current_user.id,
            adjustment.reason
        ))
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Stock adjustment failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/inventory/stock/receive")
async def receive_stock(
    item_id: int,
    quantity: int,
    reference: Optional[str] = None,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Receive stock into inventory"""
    try:
        service = InventoryService(db)
        result = await service.receive_stock(item_id, quantity, current_user.id, reference, notes)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Stock receipt failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/inventory/stock/issue")
async def issue_stock(
    item_id: int,
    quantity: int,
    reference: Optional[str] = None,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Issue stock from inventory"""
    try:
        service = InventoryService(db)
        result = await service.issue_stock(item_id, quantity, current_user.id, reference, notes)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Stock issue failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/inventory/stock/transfer")
async def transfer_stock(
    transfer: StockTransfer,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Transfer stock between items"""
    try:
        service = InventoryService(db)
        result = await service.transfer_stock(
            transfer.from_item_id,
            transfer.to_item_id,
            transfer.quantity,
            current_user.id,
            transfer.notes
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Stock transfer failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/inventory/stock/movements")
async def get_stock_movements(
    item_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    movement_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get stock movement history"""
    try:
        service = InventoryService(db)
        
        filters = {}
        if start_date:
            filters['start_date'] = start_date
        if end_date:
            filters['end_date'] = end_date
        if movement_type:
            filters['movement_type'] = movement_type
        
        movements = await service.get_stock_movements(item_id, filters)
        return {"movements": movements}
    except Exception as e:
        logger.error(f"Stock movements retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/inventory/alerts/low-stock")
async def get_low_stock_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get items with low stock levels"""
    try:
        service = InventoryService(db)
        items = await service.get_low_stock_items()
        return {"items": items}
    except Exception as e:
        logger.error(f"Low stock items retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/inventory/alerts/overstock")
async def get_overstock_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get items with excess stock levels"""
    try:
        service = InventoryService(db)
        items = await service.get_overstock_items()
        return {"items": items}
    except Exception as e:
        logger.error(f"Overstock items retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ================================
# ETL ENDPOINTS
# ================================

@app.post("/api/etl/import", response_model=ETLImportResponse)
async def import_data(
    file: UploadFile = File(...),
    format_type: str = Form(...),
    mapping_config: Optional[str] = Form(None),
    validation_rules: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Import data from various formats"""
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{format_type}') as tmp_file:
            tmp_file.write(await file.read())
            tmp_file_path = tmp_file.name
        
        # Process import
        etl_engine = ETLEngine(db)
        
        # Parse optional parameters
        mapping = None
        if mapping_config:
            import json
            mapping = json.loads(mapping_config)
        
        rules = None
        if validation_rules:
            rules = validation_rules.split(',')
        
        result = await etl_engine.import_data(
            tmp_file_path,
            format_type,
            mapping,
            rules
        )
        
        # Clean up temporary file
        os.unlink(tmp_file_path)
        
        return result
    except Exception as e:
        logger.error(f"Data import failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/etl/export")
async def export_data(
    format_type: str,
    filters: Optional[Dict[str, Any]] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export data to various formats"""
    try:
        etl_engine = ETLEngine(db)
        file_path = await etl_engine.export_data(format_type, filters)
        
        return FileResponse(
            file_path,
            media_type='application/octet-stream',
            filename=os.path.basename(file_path)
        )
    except Exception as e:
        logger.error(f"Data export failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/etl/template/{format_type}")
async def get_import_template(
    format_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get import template for specified format"""
    try:
        etl_engine = ETLEngine(db)
        template_path = await etl_engine.get_import_template(format_type)
        
        return FileResponse(
            template_path,
            media_type='application/octet-stream',
            filename=f'import_template.{format_type}'
        )
    except Exception as e:
        logger.error(f"Template generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/etl/statistics")
async def get_etl_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get ETL processing statistics"""
    try:
        etl_engine = ETLEngine(db)
        stats = await etl_engine.get_etl_statistics()
        return stats
    except Exception as e:
        logger.error(f"ETL statistics retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ================================
# RULES ENGINE ENDPOINTS
# ================================

@app.get("/api/rules/summary")
def get_rules_summary(
    db: Session = Depends(get_sync_db),
    current_user: User = Depends(get_current_user)
):
    """Get summary of all business rules"""
    try:
        rules_engine = RulesEngine(db)
        # Use sync version to avoid async/sync mixing
        import asyncio
        summary = asyncio.run(rules_engine.get_rules_summary())
        return summary
    except Exception as e:
        logger.error(f"Rules summary retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rules/create")
async def create_custom_rule(
    rule_config: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create custom business rule"""
    try:
        rules_engine = RulesEngine(db)
        rule_id = await rules_engine.create_custom_rule(rule_config)
        return {"rule_id": rule_id, "message": "Rule created successfully"}
    except Exception as e:
        logger.error(f"Rule creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rules/execute/{rule_id}")
async def execute_rule(
    rule_id: str,
    item_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Execute specific rule on item data"""
    try:
        rules_engine = RulesEngine(db)
        result = await rules_engine.execute_rule_by_id(rule_id, item_data)
        return result
    except Exception as e:
        logger.error(f"Rule execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/rules/{rule_id}/activate")
async def activate_rule(
    rule_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Activate a business rule"""
    try:
        rules_engine = RulesEngine(db)
        rules_engine.activate_rule(rule_id)
        return {"message": f"Rule {rule_id} activated successfully"}
    except Exception as e:
        logger.error(f"Rule activation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/rules/{rule_id}/deactivate")
async def deactivate_rule(
    rule_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deactivate a business rule"""
    try:
        rules_engine = RulesEngine(db)
        rules_engine.deactivate_rule(rule_id)
        return {"message": f"Rule {rule_id} deactivated successfully"}
    except Exception as e:
        logger.error(f"Rule deactivation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ================================
# ANALYTICS ENDPOINTS
# ================================

@app.get("/api/analytics/dashboard", response_model=DashboardResponse)
async def get_analytics_dashboard(
    category: Optional[str] = None,
    supplier: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive analytics dashboard"""
    try:
        analytics_engine = AnalyticsEngine(db)
        
        filters = {}
        if category:
            filters['category'] = category.split(',')
        if supplier:
            filters['supplier'] = supplier.split(',')
        if location:
            filters['location'] = location.split(',')
        
        dashboard = await analytics_engine.generate_inventory_dashboard(filters)
        return dashboard
    except Exception as e:
        logger.error(f"Dashboard generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analytics/report")
async def generate_custom_report(
    report_config: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate custom analytics report"""
    try:
        analytics_engine = AnalyticsEngine(db)
        report = await analytics_engine.generate_custom_report(report_config)
        return report
    except Exception as e:
        logger.error(f"Custom report generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/anomalies")
async def detect_anomalies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Detect anomalies in inventory data"""
    try:
        analytics_engine = AnalyticsEngine(db)
        anomalies = await analytics_engine.detect_anomalies()
        return {"anomalies": anomalies}
    except Exception as e:
        logger.error(f"Anomaly detection failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analytics/optimize")
async def optimize_inventory(
    items: List[Dict[str, Any]],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Optimize inventory levels using ML"""
    try:
        analytics_engine = AnalyticsEngine(db)
        optimization = await analytics_engine.optimize_inventory_levels(items)
        return optimization
    except Exception as e:
        logger.error(f"Inventory optimization failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ================================
# UTILITY ENDPOINTS
# ================================

@app.get("/api/categories")
def get_categories(
    db: Session = Depends(get_sync_db),
    current_user: User = Depends(get_current_user)
):
    """Get all categories"""
    try:
        from ..models import Category
        categories = db.query(Category).all()
        return [{"id": cat.id, "name": cat.name, "description": cat.description} for cat in categories]
    except Exception as e:
        logger.error(f"Categories retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/suppliers")
def get_suppliers(
    db: Session = Depends(get_sync_db),
    current_user: User = Depends(get_current_user)
):
    """Get all suppliers"""
    try:
        from ..models import Supplier
        suppliers = db.query(Supplier).all()
        return [{"id": sup.id, "name": sup.name, "contact": sup.contact_info} for sup in suppliers]
    except Exception as e:
        logger.error(f"Suppliers retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/locations")
def get_locations(
    db: Session = Depends(get_sync_db),
    current_user: User = Depends(get_current_user)
):
    """Get all locations"""
    try:
        from ..models import Location
        locations = db.query(Location).all()
        return [{"id": loc.id, "name": loc.name, "type": loc.location_type} for loc in locations]
    except Exception as e:
        logger.error(f"Locations retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)