"""
Pydantic Schemas for API Request/Response Models
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum

# ================================
# ENUMS
# ================================

class StockStatus(str, Enum):
    NORMAL = "normal"
    LOW_STOCK = "low_stock"
    OUT_OF_STOCK = "out_of_stock"
    OVERSTOCK = "overstock"

class MovementType(str, Enum):
    INBOUND = "inbound"
    OUTBOUND = "outbound"
    TRANSFER = "transfer"
    ADJUSTMENT = "adjustment"
    RETURN = "return"
    DAMAGED = "damaged"
    LOST = "lost"

class ETLFormat(str, Enum):
    CSV = "csv"
    EXCEL = "excel"
    JSON = "json"
    XML = "xml"
    YAML = "yaml"
    TSV = "tsv"
    PARQUET = "parquet"
    JSONL = "jsonl"
    PDF = "pdf"

class RuleType(str, Enum):
    VALIDATION = "validation"
    TRANSFORMATION = "transformation"
    BUSINESS_LOGIC = "business_logic"
    ALERT = "alert"
    AUTOMATION = "automation"

class AlertSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

# ================================
# AUTHENTICATION SCHEMAS
# ================================

class LoginRequest(BaseModel):
    """Login request schema with optional 2FA"""
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")
    two_factor_token: Optional[str] = Field(None, description="6-digit 2FA token", min_length=6, max_length=8)

class UserRegistrationRequest(BaseModel):
    """User registration request schema"""
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="User password (minimum 8 characters)")
    name: str = Field(..., description="User full name")
    role: str = Field("user", description="User role (admin, manager, user)")

# ================================
# INVENTORY SCHEMAS
# ================================

class ItemBase(BaseModel):
    """Base item schema - ALIGNED WITH SQLALCHEMY MODEL"""
    sku: str = Field(..., max_length=100, description="Stock Keeping Unit")
    name: str = Field(..., max_length=200, description="Item name")
    description: Optional[str] = Field(None, description="Item description")
    barcode: Optional[str] = Field(None, max_length=100, description="Barcode")
    category_id: int = Field(..., description="Category ID (REQUIRED)")
    supplier_id: Optional[int] = Field(None, description="Supplier ID")
    location_id: Optional[int] = Field(None, description="Location ID")
    
    # Pricing - FIXED FIELD NAMES TO MATCH DATABASE
    price: Optional[float] = Field(None, ge=0, description="Unit price")
    cost: Optional[float] = Field(None, ge=0, description="Cost price")
    last_cost: Optional[float] = Field(None, ge=0, description="Last cost price")
    average_cost: Optional[float] = Field(None, ge=0, description="Average cost price")
    
    # Stock levels - ADDED MISSING FIELDS
    min_stock: Optional[int] = Field(0, ge=0, description="Minimum stock level")
    max_stock: Optional[int] = Field(1000, ge=0, description="Maximum stock level")
    reorder_point: Optional[int] = Field(10, ge=0, description="Reorder point")
    reorder_quantity: Optional[int] = Field(100, ge=0, description="Reorder quantity")
    
    # Physical attributes - ADDED MISSING FIELDS
    weight: Optional[float] = Field(None, ge=0, description="Item weight")
    dimensions: Optional[str] = Field(None, max_length=100, description="Dimensions (LxWxH)")
    unit: Optional[str] = Field("pcs", max_length=20, description="Unit of measure")
    
    # Tracking options - ADDED MISSING FIELDS
    batch_tracking: Optional[bool] = Field(False, description="Enable batch tracking")
    serial_tracking: Optional[bool] = Field(False, description="Enable serial tracking")
    expiry_tracking: Optional[bool] = Field(False, description="Enable expiry tracking")
    
    # Status flags - ADDED MISSING FIELDS
    is_active: Optional[bool] = Field(True, description="Item is active")
    is_sellable: Optional[bool] = Field(True, description="Item is sellable")
    is_purchasable: Optional[bool] = Field(True, description="Item is purchasable")
    
    # Additional metadata - ADDED MISSING FIELDS
    tags: Optional[Dict[str, Any]] = Field(None, description="Item tags")
    custom_fields: Optional[Dict[str, Any]] = Field(None, description="Custom fields")

class ItemCreate(ItemBase):
    """Schema for creating new item - ALIGNED WITH DATABASE"""
    quantity: Optional[int] = Field(0, ge=0, description="Initial quantity")
    reserved_quantity: Optional[int] = Field(0, ge=0, description="Reserved quantity")
    available_quantity: Optional[int] = Field(0, ge=0, description="Available quantity")

class ItemUpdate(BaseModel):
    """Schema for updating item - FULLY ALIGNED WITH DATABASE MODEL"""
    # Basic info - FIXED FIELD NAMES
    sku: Optional[str] = Field(None, max_length=100, description="Stock Keeping Unit")
    name: Optional[str] = Field(None, max_length=200, description="Item name")
    description: Optional[str] = Field(None, description="Item description")
    barcode: Optional[str] = Field(None, max_length=100, description="Barcode")
    
    # IDs
    category_id: Optional[int] = Field(None, description="Category ID")
    supplier_id: Optional[int] = Field(None, description="Supplier ID")
    location_id: Optional[int] = Field(None, description="Location ID")
    
    # Inventory tracking - FIXED FIELD NAMES TO MATCH DATABASE
    quantity: Optional[int] = Field(None, ge=0, description="Current quantity")
    reserved_quantity: Optional[int] = Field(None, ge=0, description="Reserved quantity")
    available_quantity: Optional[int] = Field(None, ge=0, description="Available quantity")
    
    # Stock levels - ADDED MISSING FIELDS  
    min_stock: Optional[int] = Field(None, ge=0, description="Minimum stock level")
    max_stock: Optional[int] = Field(None, ge=0, description="Maximum stock level")
    reorder_point: Optional[int] = Field(None, ge=0, description="Reorder point")
    reorder_quantity: Optional[int] = Field(None, ge=0, description="Reorder quantity")
    
    # Pricing - FIXED FIELD NAMES TO MATCH DATABASE
    price: Optional[float] = Field(None, ge=0, description="Unit price")
    cost: Optional[float] = Field(None, ge=0, description="Cost price")
    last_cost: Optional[float] = Field(None, ge=0, description="Last cost price")
    average_cost: Optional[float] = Field(None, ge=0, description="Average cost price")
    
    # Physical attributes - ADDED MISSING FIELDS
    weight: Optional[float] = Field(None, ge=0, description="Item weight")
    dimensions: Optional[str] = Field(None, max_length=100, description="Dimensions")
    unit: Optional[str] = Field(None, max_length=20, description="Unit of measure")
    
    # Tracking options - ADDED MISSING FIELDS
    batch_tracking: Optional[bool] = Field(None, description="Enable batch tracking")
    serial_tracking: Optional[bool] = Field(None, description="Enable serial tracking")
    expiry_tracking: Optional[bool] = Field(None, description="Enable expiry tracking")
    
    # Status flags - ADDED MISSING FIELDS
    is_active: Optional[bool] = Field(None, description="Item is active")
    is_sellable: Optional[bool] = Field(None, description="Item is sellable")
    is_purchasable: Optional[bool] = Field(None, description="Item is purchasable")
    
    # Timestamps - ADDED MISSING FIELDS
    last_counted: Optional[datetime] = Field(None, description="Last count date")
    last_movement: Optional[datetime] = Field(None, description="Last movement date")
    
    # Additional metadata - ADDED MISSING FIELDS
    tags: Optional[Dict[str, Any]] = Field(None, description="Item tags")
    custom_fields: Optional[Dict[str, Any]] = Field(None, description="Custom fields")

class ItemResponse(BaseModel):
    """Schema for item response - FULLY ALIGNED WITH DATABASE MODEL"""
    # Primary key
    id: int
    
    # Basic info - FIXED FIELD NAMES TO MATCH DATABASE
    sku: str
    name: str
    description: Optional[str]
    barcode: Optional[str]
    
    # IDs
    category_id: int
    supplier_id: Optional[int]
    location_id: Optional[int]
    
    # Inventory tracking - ALL FIELDS FROM DATABASE
    quantity: int
    reserved_quantity: int
    available_quantity: int
    
    # Stock levels - ALL FIELDS FROM DATABASE
    min_stock: int
    max_stock: int
    reorder_point: int
    reorder_quantity: int
    
    # Pricing - FIXED FIELD NAMES TO MATCH DATABASE
    price: Optional[float]
    cost: Optional[float]
    last_cost: Optional[float]
    average_cost: Optional[float]
    
    # Physical attributes - ALL FIELDS FROM DATABASE
    weight: Optional[float]
    dimensions: Optional[str]
    unit: str
    
    # Tracking options - ALL FIELDS FROM DATABASE
    batch_tracking: bool
    serial_tracking: bool
    expiry_tracking: bool
    
    # Status flags - ALL FIELDS FROM DATABASE
    is_active: bool
    is_sellable: bool
    is_purchasable: bool
    
    # Timestamps - ALL FIELDS FROM DATABASE
    created_at: datetime
    updated_at: datetime
    last_counted: Optional[datetime]
    last_movement: Optional[datetime]
    
    # Additional metadata - ALL FIELDS FROM DATABASE
    tags: Optional[Dict[str, Any]]
    custom_fields: Optional[Dict[str, Any]]
    
    # Computed/relationship fields for API convenience
    category: Optional[str] = Field(None, description="Category name")
    supplier: Optional[str] = Field(None, description="Supplier name")
    location: Optional[str] = Field(None, description="Location name")
    stock_status: StockStatus = Field(description="Computed stock status")
    total_value: float = Field(description="Computed total value")
    recent_movements: Optional[List[Dict[str, Any]]] = Field(None, description="Recent movements")

    class Config:
        from_attributes = True

class ItemListResponse(BaseModel):
    """Schema for paginated item list response"""
    items: List[ItemResponse]
    total_items: int
    page: int
    page_size: int
    total_pages: int

# ================================
# STOCK MOVEMENT SCHEMAS
# ================================

class StockAdjustment(BaseModel):
    """Schema for stock adjustment"""
    item_id: int = Field(..., description="Item ID")
    quantity_change: int = Field(..., description="Quantity change (positive or negative)")
    reason: Optional[str] = Field(None, max_length=500, description="Reason for adjustment")

class StockTransfer(BaseModel):
    """Schema for stock transfer"""
    from_item_id: int = Field(..., description="Source item ID")
    to_item_id: int = Field(..., description="Destination item ID")
    quantity: int = Field(..., gt=0, description="Transfer quantity")
    notes: Optional[str] = Field(None, max_length=500, description="Transfer notes")

class InventoryMovementResponse(BaseModel):
    """Schema for inventory movement response"""
    id: int
    item_id: int
    item_name: Optional[str]
    item_sku: Optional[str]
    movement_type: MovementType
    quantity: int
    reference: Optional[str]
    notes: Optional[str]
    user: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# ================================
# ETL SCHEMAS
# ================================

class ETLImportRequest(BaseModel):
    """Schema for ETL import request"""
    format_type: ETLFormat = Field(..., description="File format")
    mapping_config: Optional[Dict[str, Any]] = Field(None, description="Column mapping configuration")
    validation_rules: Optional[List[str]] = Field(None, description="Validation rules")

class ETLImportResponse(BaseModel):
    """Schema for ETL import response"""
    total_records: int
    successful_imports: int
    failed_imports: int
    errors: List[str]

class ETLExportRequest(BaseModel):
    """Schema for ETL export request"""
    format_type: ETLFormat = Field(..., description="Export format")
    filters: Optional[Dict[str, Any]] = Field(None, description="Data filters")

class ETLStatistics(BaseModel):
    """Schema for ETL statistics"""
    supported_formats: List[str]
    total_imports: int
    total_exports: int
    last_import: Optional[datetime]
    last_export: Optional[datetime]
    processing_status: str

# ================================
# RULES ENGINE SCHEMAS
# ================================

class RuleCondition(BaseModel):
    """Schema for rule condition"""
    field: str = Field(..., description="Field to evaluate")
    operator: str = Field(..., description="Comparison operator")
    value: Any = Field(..., description="Value to compare against")

class RuleAction(BaseModel):
    """Schema for rule action"""
    type: str = Field(..., description="Action type")
    field: Optional[str] = Field(None, description="Field to modify")
    value: Optional[Any] = Field(None, description="Value to set")

class RuleCreate(BaseModel):
    """Schema for creating custom rule"""
    id: Optional[str] = Field(None, description="Rule ID")
    type: RuleType = Field(..., description="Rule type")
    priority: int = Field(..., ge=1, le=4, description="Rule priority (1-4)")
    condition: RuleCondition = Field(..., description="Rule condition")
    action: RuleAction = Field(..., description="Rule action")
    description: Optional[str] = Field(None, max_length=500, description="Rule description")

class RuleResponse(BaseModel):
    """Schema for rule response"""
    id: str
    type: RuleType
    priority: int
    active: bool
    description: str
    created_at: datetime

class RuleResult(BaseModel):
    """Schema for rule execution result"""
    rule_id: str
    rule_name: str
    status: str
    message: str
    data: Optional[Dict[str, Any]] = None
    timestamp: datetime

class RulesSummary(BaseModel):
    """Schema for rules summary"""
    total_rules: int
    active_rules: int
    inactive_rules: int
    rules_by_type: Dict[str, int]
    rules_by_priority: Dict[int, int]
    rules_list: List[RuleResponse]

# ================================
# ANALYTICS SCHEMAS
# ================================

class AnalyticsRequest(BaseModel):
    """Schema for analytics request"""
    filters: Optional[Dict[str, Any]] = Field(None, description="Data filters")
    date_range: Optional[Dict[str, datetime]] = Field(None, description="Date range")
    metrics: Optional[List[str]] = Field(None, description="Requested metrics")

class ChartData(BaseModel):
    """Schema for chart data"""
    type: str = Field(..., description="Chart type")
    data: List[Dict[str, Any]] = Field(..., description="Chart data")
    title: str = Field(..., description="Chart title")
    x: Optional[str] = Field(None, description="X-axis field")
    y: Optional[str] = Field(None, description="Y-axis field")

class OverviewMetrics(BaseModel):
    """Schema for overview metrics"""
    total_items: int
    total_value: float
    average_value_per_item: float
    low_stock_count: int
    out_of_stock_count: int
    overstock_count: int
    stock_turnover_ratio: float
    profit_margin_avg: float
    categories_count: int
    suppliers_count: int
    locations_count: int

class Alert(BaseModel):
    """Schema for alert"""
    type: str
    severity: AlertSeverity
    message: str
    details: Optional[str] = None
    item_id: Optional[int] = None
    timestamp: datetime

class Insight(BaseModel):
    """Schema for business insight"""
    type: str
    title: str
    description: str
    recommendation: str
    impact: str
    data: Optional[Dict[str, Any]] = None

class Recommendation(BaseModel):
    """Schema for recommendation"""
    type: str
    priority: str
    title: str
    description: str
    action: str
    expected_benefit: str
    items: Optional[List[Dict[str, Any]]] = None

class ForecastData(BaseModel):
    """Schema for forecast data"""
    dates: List[str]
    values: List[float]
    confidence_interval: Optional[Dict[str, List[float]]] = None

class PerformanceMetrics(BaseModel):
    """Schema for performance metrics"""
    inventory_turnover: Dict[str, Any]
    stockout_rate: Dict[str, Any]
    carrying_cost_ratio: Dict[str, Any]
    fill_rate: Dict[str, Any]
    abc_analysis: Dict[str, int]

class TrendAnalysis(BaseModel):
    """Schema for trend analysis"""
    category_trends: Dict[str, Dict[str, Any]]
    overall_trend: Dict[str, Any]
    emerging_patterns: List[str]

class DashboardResponse(BaseModel):
    """Schema for dashboard response"""
    overview: OverviewMetrics
    charts: Dict[str, ChartData]
    alerts: List[Alert]
    insights: List[Insight]
    recommendations: List[Recommendation]
    forecasts: Dict[str, ForecastData]
    performance: PerformanceMetrics
    trends: TrendAnalysis

# ================================
# UTILITY SCHEMAS
# ================================

class CategoryResponse(BaseModel):
    """Schema for category response"""
    id: int
    name: str
    description: Optional[str]

class SupplierResponse(BaseModel):
    """Schema for supplier response"""
    id: int
    name: str
    contact: Optional[str]

class LocationResponse(BaseModel):
    """Schema for location response"""
    id: int
    name: str
    type: str

class ApiResponse(BaseModel):
    """Generic API response schema"""
    success: bool
    message: str
    data: Optional[Any] = None
    errors: Optional[List[str]] = None

class PaginationParams(BaseModel):
    """Schema for pagination parameters"""
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(50, ge=1, le=1000, description="Items per page")

class DateRangeFilter(BaseModel):
    """Schema for date range filtering"""
    start_date: Optional[datetime] = Field(None, description="Start date")
    end_date: Optional[datetime] = Field(None, description="End date")

class StockCountItem(BaseModel):
    """Schema for stock count item"""
    id: int
    sku: str
    name: str
    system_quantity: int
    counted_quantity: Optional[int] = None
    variance: Optional[int] = None
    status: str = "pending"

class StockCountResponse(BaseModel):
    """Schema for stock count response"""
    count_id: str
    started_at: datetime
    location_id: Optional[int]
    total_items: int
    items: List[StockCountItem]

class AnomalyDetectionResult(BaseModel):
    """Schema for anomaly detection result"""
    item_id: int
    sku: str
    name: str
    anomaly_type: str
    anomaly_score: float
    reason: str
    recommendation: str
    timestamp: datetime

class OptimizationResult(BaseModel):
    """Schema for optimization result"""
    item_id: int
    sku: str
    current_level: int
    optimal_level: int
    cost_reduction: float
    action: str

class InventoryOptimizationResponse(BaseModel):
    """Schema for inventory optimization response"""
    optimized_items: List[OptimizationResult]
    total_cost_reduction: float
    total_service_level_improvement: float
    recommendations: List[str]

# ================================
# VALIDATORS
# ================================

# Validators for schemas are included in the base class definitions