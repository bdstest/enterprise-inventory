"""Initial schema with aligned SQLAlchemy models and Pydantic schemas

Revision ID: 001
Revises: 
Create Date: 2025-07-08 23:55:00.000000

This migration creates the complete enterprise inventory management schema
with all 34 fields properly aligned between database models and API schemas.
All critical schema misalignments have been resolved.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Upgrade database schema - Create all aligned tables"""
    
    # Create categories table
    op.create_table('categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['parent_id'], ['categories.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_categories_name'), 'categories', ['name'], unique=False)

    # Create suppliers table
    op.create_table('suppliers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('contact_person', sa.String(length=100), nullable=True),
        sa.Column('email', sa.String(length=100), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('tax_id', sa.String(length=50), nullable=True),
        sa.Column('payment_terms', sa.String(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_suppliers_name'), 'suppliers', ['name'], unique=False)

    # Create locations table
    op.create_table('locations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('capacity', sa.Integer(), nullable=True),
        sa.Column('manager_name', sa.String(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_locations_name'), 'locations', ['name'], unique=False)

    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=100), nullable=True),
        sa.Column('role', sa.String(length=50), nullable=False, default='user'),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=False)

    # Create items table with ALL 34 fields properly aligned
    op.create_table('items',
        sa.Column('id', sa.Integer(), nullable=False),
        # Basic information (ALIGNED)
        sa.Column('sku', sa.String(length=100), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('barcode', sa.String(length=100), nullable=True),
        
        # Foreign key relationships (ALIGNED)
        sa.Column('category_id', sa.Integer(), nullable=False),  # REQUIRED as per schema alignment
        sa.Column('supplier_id', sa.Integer(), nullable=True),
        sa.Column('location_id', sa.Integer(), nullable=True),
        
        # Inventory tracking (ALIGNED)
        sa.Column('quantity', sa.Integer(), nullable=False, default=0),
        sa.Column('reserved_quantity', sa.Integer(), nullable=False, default=0),
        sa.Column('available_quantity', sa.Integer(), nullable=False, default=0),
        
        # Stock levels (ALIGNED)
        sa.Column('min_stock', sa.Integer(), nullable=False, default=0),
        sa.Column('max_stock', sa.Integer(), nullable=False, default=1000),
        sa.Column('reorder_point', sa.Integer(), nullable=False, default=10),
        sa.Column('reorder_quantity', sa.Integer(), nullable=False, default=100),
        
        # Pricing (ALIGNED - field names match Pydantic schemas)
        sa.Column('price', sa.Numeric(precision=10, scale=2), nullable=True),  # NOT unit_price
        sa.Column('cost', sa.Numeric(precision=10, scale=2), nullable=True),   # NOT cost_price
        sa.Column('last_cost', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('average_cost', sa.Numeric(precision=10, scale=2), nullable=True),
        
        # Physical attributes (ALIGNED)
        sa.Column('weight', sa.Float(), nullable=True),
        sa.Column('dimensions', sa.String(length=100), nullable=True),
        sa.Column('unit', sa.String(length=20), nullable=False, default='pcs'),
        
        # Tracking options (ALIGNED)
        sa.Column('batch_tracking', sa.Boolean(), nullable=False, default=False),
        sa.Column('serial_tracking', sa.Boolean(), nullable=False, default=False),
        sa.Column('expiry_tracking', sa.Boolean(), nullable=False, default=False),
        
        # Status flags (ALIGNED)
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('is_sellable', sa.Boolean(), nullable=False, default=True),
        sa.Column('is_purchasable', sa.Boolean(), nullable=False, default=True),
        
        # Timestamps (ALIGNED)
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('last_counted', sa.DateTime(), nullable=True),
        sa.Column('last_movement', sa.DateTime(), nullable=True),
        
        # Additional metadata (ALIGNED)
        sa.Column('tags', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('custom_fields', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        
        # Constraints
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ),
        sa.ForeignKeyConstraint(['supplier_id'], ['suppliers.id'], ),
        sa.ForeignKeyConstraint(['location_id'], ['locations.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('sku')
    )
    
    # Create indexes for items table
    op.create_index(op.f('ix_items_sku'), 'items', ['sku'], unique=True)
    op.create_index(op.f('ix_items_name'), 'items', ['name'], unique=False)
    op.create_index(op.f('ix_items_barcode'), 'items', ['barcode'], unique=False)
    op.create_index(op.f('ix_items_category_id'), 'items', ['category_id'], unique=False)
    op.create_index(op.f('ix_items_supplier_id'), 'items', ['supplier_id'], unique=False)
    op.create_index(op.f('ix_items_location_id'), 'items', ['location_id'], unique=False)
    op.create_index(op.f('ix_items_quantity'), 'items', ['quantity'], unique=False)
    op.create_index(op.f('ix_items_is_active'), 'items', ['is_active'], unique=False)

    # Create inventory_movements table
    op.create_table('inventory_movements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('item_id', sa.Integer(), nullable=False),
        sa.Column('movement_type', sa.Enum('INBOUND', 'OUTBOUND', 'TRANSFER', 'ADJUSTMENT', 'RETURN', 'DAMAGED', 'LOST', name='movementtype'), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('quantity_before', sa.Integer(), nullable=False),
        sa.Column('quantity_after', sa.Integer(), nullable=False),
        sa.Column('reference_number', sa.String(length=100), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['item_id'], ['items.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_inventory_movements_item_id'), 'inventory_movements', ['item_id'], unique=False)
    op.create_index(op.f('ix_inventory_movements_movement_type'), 'inventory_movements', ['movement_type'], unique=False)
    op.create_index(op.f('ix_inventory_movements_created_at'), 'inventory_movements', ['created_at'], unique=False)

    # Create alerts table
    op.create_table('alerts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('severity', sa.Enum('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', name='alertseverity'), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('item_id', sa.Integer(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['item_id'], ['items.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_alerts_type'), 'alerts', ['type'], unique=False)
    op.create_index(op.f('ix_alerts_severity'), 'alerts', ['severity'], unique=False)
    op.create_index(op.f('ix_alerts_is_read'), 'alerts', ['is_read'], unique=False)
    op.create_index(op.f('ix_alerts_created_at'), 'alerts', ['created_at'], unique=False)

    # Create triggers for updating timestamps
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    """)

    # Apply triggers to tables with updated_at columns
    for table in ['categories', 'suppliers', 'locations', 'users', 'items']:
        op.execute(f"""
            CREATE TRIGGER update_{table}_updated_at 
            BEFORE UPDATE ON {table}
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        """)

    # Insert default category (required for items)
    op.execute("""
        INSERT INTO categories (name, description, is_active) 
        VALUES ('General', 'Default category for items', true);
    """)

    # Insert default user for system operations
    op.execute("""
        INSERT INTO users (username, email, password_hash, full_name, role, is_active) 
        VALUES ('system', 'system@inventory.local', '$2b$12$LQv3c1yqBo2SqHQzKXdVl.5a.rXPVBo7XQQ7WwS7yP9ZI3nJ9mW4e', 'System User', 'admin', true);
    """)


def downgrade() -> None:
    """Downgrade database schema - Drop all tables"""
    
    # Drop triggers first
    for table in ['categories', 'suppliers', 'locations', 'users', 'items']:
        op.execute(f"DROP TRIGGER IF EXISTS update_{table}_updated_at ON {table};")
    
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column();")
    
    # Drop tables in reverse order to respect foreign keys
    op.drop_table('alerts')
    op.drop_table('inventory_movements')
    op.drop_table('items')
    op.drop_table('users')
    op.drop_table('locations')
    op.drop_table('suppliers')
    op.drop_table('categories')
    
    # Drop enums
    op.execute("DROP TYPE IF EXISTS alertseverity;")
    op.execute("DROP TYPE IF EXISTS movementtype;")