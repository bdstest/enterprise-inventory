"""
Database Models for Enterprise Inventory Management System
Comprehensive SQLAlchemy models with relationships and constraints
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, JSON, Enum, Numeric, UniqueConstraint, Index, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from enum import Enum as PyEnum
try:
    from .database import Base
except ImportError:
    from database import Base


class UserRole(PyEnum):
    """User role enumeration"""
    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"
    VIEWER = "viewer"


class MovementType(PyEnum):
    """Inventory movement type enumeration"""
    INBOUND = "inbound"
    OUTBOUND = "outbound"
    TRANSFER = "transfer"
    ADJUSTMENT = "adjustment"
    RETURN = "return"
    DAMAGED = "damaged"
    LOST = "lost"


class AlertType(PyEnum):
    """Alert type enumeration"""
    LOW_STOCK = "low_stock"
    REORDER = "reorder"
    OVERSTOCK = "overstock"
    EXPIRY = "expiry"
    SYSTEM = "system"
    CUSTOM = "custom"


class AlertSeverity(PyEnum):
    """Alert severity enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RuleType(PyEnum):
    """Rule type enumeration"""
    VALIDATION = "validation"
    AUTOMATION = "automation"
    ALERT = "alert"
    WORKFLOW = "workflow"


class User(Base):
    """User model for authentication and authorization"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.USER)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    phone = Column(String(20))
    department = Column(String(100))
    last_login = Column(DateTime)
    
    # 2FA/MFA fields
    two_factor_enabled = Column(Boolean, default=False)
    two_factor_secret = Column(String(255))
    backup_codes = Column(JSON)
    two_factor_setup_complete = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    inventory_movements = relationship("InventoryMovement", back_populates="user")
    alerts = relationship("Alert", back_populates="user")
    rules = relationship("InventoryRule", back_populates="created_by")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', name='{self.name}')>"


class Category(Base):
    """Product category model"""
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    parent_id = Column(Integer, ForeignKey("categories.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Self-referential relationship for category hierarchy
    parent = relationship("Category", remote_side=[id], backref="children")
    
    # Relationships
    items = relationship("Item", back_populates="category")
    
    def __repr__(self):
        return f"<Category(id={self.id}, name='{self.name}')>"


class Supplier(Base):
    """Supplier model"""
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, unique=True)
    contact_person = Column(String(100))
    email = Column(String(255))
    phone = Column(String(20))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100))
    postal_code = Column(String(20))
    tax_id = Column(String(50))
    payment_terms = Column(String(100))
    rating = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    items = relationship("Item", back_populates="supplier")
    
    def __repr__(self):
        return f"<Supplier(id={self.id}, name='{self.name}')>"


class Location(Base):
    """Storage location model"""
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    description = Column(Text)
    type = Column(String(50))  # warehouse, store, section, shelf, etc.
    parent_id = Column(Integer, ForeignKey("locations.id"))
    address = Column(Text)
    capacity = Column(Float)
    current_utilization = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Self-referential relationship for location hierarchy
    parent = relationship("Location", remote_side=[id], backref="children")
    
    # Relationships
    items = relationship("Item", back_populates="location")
    inventory_movements = relationship("InventoryMovement", back_populates="location")
    
    def __repr__(self):
        return f"<Location(id={self.id}, name='{self.name}', code='{self.code}')>"


class Item(Base):
    """Inventory item model"""
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    barcode = Column(String(100), unique=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    location_id = Column(Integer, ForeignKey("locations.id"))
    
    # Inventory tracking
    quantity = Column(Integer, nullable=False, default=0)
    reserved_quantity = Column(Integer, default=0)
    available_quantity = Column(Integer, default=0)
    
    # Stock levels
    min_stock = Column(Integer, default=0)
    max_stock = Column(Integer, default=1000)
    reorder_point = Column(Integer, default=10)
    reorder_quantity = Column(Integer, default=100)
    
    # Pricing
    cost = Column(Numeric(10, 2))
    price = Column(Numeric(10, 2))
    last_cost = Column(Numeric(10, 2))
    average_cost = Column(Numeric(10, 2))
    
    # Physical attributes
    weight = Column(Float)
    dimensions = Column(String(100))  # LxWxH
    unit = Column(String(20), default="pcs")
    
    # Tracking
    batch_tracking = Column(Boolean, default=False)
    serial_tracking = Column(Boolean, default=False)
    expiry_tracking = Column(Boolean, default=False)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_sellable = Column(Boolean, default=True)
    is_purchasable = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    last_counted = Column(DateTime)
    last_movement = Column(DateTime)
    
    # Additional metadata
    tags = Column(JSON)
    custom_fields = Column(JSON)
    
    # Relationships
    category = relationship("Category", back_populates="items")
    supplier = relationship("Supplier", back_populates="items")
    location = relationship("Location", back_populates="items")
    inventory_movements = relationship("InventoryMovement", back_populates="item")
    alerts = relationship("Alert", back_populates="item")
    
    # Indexes
    __table_args__ = (
        Index('idx_item_category_supplier', 'category_id', 'supplier_id'),
        Index('idx_item_location_active', 'location_id', 'is_active'),
        Index('idx_item_quantity_levels', 'quantity', 'min_stock', 'reorder_point'),
    )
    
    def __repr__(self):
        return f"<Item(id={self.id}, sku='{self.sku}', name='{self.name}')>"


class InventoryMovement(Base):
    """Inventory movement tracking model"""
    __tablename__ = "inventory_movements"
    
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"))
    
    # Movement details
    movement_type = Column(Enum(MovementType), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_cost = Column(Numeric(10, 2))
    total_cost = Column(Numeric(10, 2))
    
    # Before/after quantities
    quantity_before = Column(Integer, nullable=False)
    quantity_after = Column(Integer, nullable=False)
    
    # Reference information
    reference_type = Column(String(50))  # purchase_order, sales_order, adjustment, etc.
    reference_id = Column(String(100))
    reference_number = Column(String(100))
    
    # Additional details
    reason = Column(String(200))
    notes = Column(Text)
    batch_number = Column(String(100))
    serial_number = Column(String(100))
    expiry_date = Column(DateTime)
    
    # Timestamps
    movement_date = Column(DateTime, default=func.now())
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    item = relationship("Item", back_populates="inventory_movements")
    user = relationship("User", back_populates="inventory_movements")
    location = relationship("Location", back_populates="inventory_movements")
    
    # Indexes
    __table_args__ = (
        Index('idx_movement_item_date', 'item_id', 'movement_date'),
        Index('idx_movement_type_date', 'movement_type', 'movement_date'),
        Index('idx_movement_reference', 'reference_type', 'reference_id'),
    )
    
    def __repr__(self):
        return f"<InventoryMovement(id={self.id}, item_id={self.item_id}, type='{self.movement_type}', qty={self.quantity})>"


class Alert(Base):
    """Alert/notification model"""
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Alert details
    alert_type = Column(Enum(AlertType), nullable=False)
    severity = Column(Enum(AlertSeverity), nullable=False, default=AlertSeverity.MEDIUM)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    
    # Status
    is_read = Column(Boolean, default=False)
    is_resolved = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    read_at = Column(DateTime)
    resolved_at = Column(DateTime)
    expires_at = Column(DateTime)
    
    # Additional data
    alert_metadata = Column(JSON)
    
    # Relationships
    item = relationship("Item", back_populates="alerts")
    user = relationship("User", back_populates="alerts")
    
    # Indexes
    __table_args__ = (
        Index('idx_alert_type_severity', 'alert_type', 'severity'),
        Index('idx_alert_status', 'is_read', 'is_resolved', 'is_active'),
        Index('idx_alert_created', 'created_at'),
    )
    
    def __repr__(self):
        return f"<Alert(id={self.id}, type='{self.alert_type}', severity='{self.severity}')>"


class InventoryRule(Base):
    """Business rules for inventory management"""
    __tablename__ = "inventory_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    rule_type = Column(Enum(RuleType), nullable=False)
    
    # Rule definition
    conditions = Column(JSON, nullable=False)  # JSON array of conditions
    actions = Column(JSON, nullable=False)     # JSON array of actions
    
    # Rule configuration
    priority = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    trigger = Column(String(50))  # manual, automatic, scheduled
    
    # Execution tracking
    execution_count = Column(Integer, default=0)
    last_executed = Column(DateTime)
    last_result = Column(String(100))
    
    # Metadata
    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Additional configuration
    schedule_config = Column(JSON)  # For scheduled rules
    rule_metadata = Column(JSON)
    
    # Relationships
    created_by = relationship("User", back_populates="rules")
    
    # Indexes
    __table_args__ = (
        Index('idx_rule_type_active', 'rule_type', 'is_active'),
        Index('idx_rule_priority', 'priority'),
        UniqueConstraint('name', name='uq_rule_name'),
    )
    
    def __repr__(self):
        return f"<InventoryRule(id={self.id}, name='{self.name}', type='{self.rule_type}')>"


class AuditLog(Base):
    """Audit log for tracking all system changes"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Action details
    action = Column(String(100), nullable=False)  # CREATE, UPDATE, DELETE, etc.
    table_name = Column(String(100), nullable=False)
    record_id = Column(String(100), nullable=False)
    
    # Change tracking
    old_values = Column(JSON)
    new_values = Column(JSON)
    changes = Column(JSON)
    
    # Context
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    session_id = Column(String(100))
    
    # Timestamp
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User")
    
    # Indexes
    __table_args__ = (
        Index('idx_audit_user_action', 'user_id', 'action'),
        Index('idx_audit_table_record', 'table_name', 'record_id'),
        Index('idx_audit_created', 'created_at'),
    )
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, action='{self.action}', table='{self.table_name}')>"


class SystemSetting(Base):
    """System configuration settings"""
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text)
    data_type = Column(String(20), default="string")  # string, integer, float, boolean, json
    description = Column(Text)
    category = Column(String(50))
    is_encrypted = Column(Boolean, default=False)
    is_readonly = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<SystemSetting(key='{self.key}', value='{self.value}')>"


# Additional utility models for advanced features

class ETLJob(Base):
    """ETL job tracking"""
    __tablename__ = "etl_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    job_type = Column(String(50), nullable=False)  # import, export
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    source_format = Column(String(50))
    target_format = Column(String(50))
    file_path = Column(String(500))
    records_processed = Column(Integer, default=0)
    records_success = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)
    error_log = Column(Text)
    config = Column(JSON)
    user_id = Column(Integer, ForeignKey("users.id"))
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self):
        return f"<ETLJob(id={self.id}, name='{self.name}', status='{self.status}')>"


class ForecastData(Base):
    """ML forecast data storage"""
    __tablename__ = "forecast_data"
    
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    forecast_date = Column(DateTime, nullable=False)
    predicted_demand = Column(Float, nullable=False)
    confidence_interval = Column(Float)
    model_version = Column(String(50))
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    item = relationship("Item")
    
    # Indexes
    __table_args__ = (
        Index('idx_forecast_item_date', 'item_id', 'forecast_date'),
        UniqueConstraint('item_id', 'forecast_date', name='uq_forecast_item_date'),
    )
    
    def __repr__(self):
        return f"<ForecastData(item_id={self.item_id}, date='{self.forecast_date}', demand={self.predicted_demand})>"