"""
Alembic Environment Configuration for Enterprise Inventory Management System
Handles database migrations with PostgreSQL support
"""

import asyncio
import os
import sys
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context

# Add project path to allow imports
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Import models
from src.models import Base

# this is the Alembic Config object, which provides access to values within the .ini file
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Target metadata for 'autogenerate' support
target_metadata = Base.metadata

def get_database_url() -> str:
    """Get database URL from environment or configuration"""
    # Try environment variable first (for Docker)
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        # Convert psycopg2 URL to asyncpg for async operations
        if database_url.startswith("postgresql://"):
            database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return database_url
    
    # Fallback to config file
    url = config.get_main_option("sqlalchemy.url")
    if url and url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.
    """
    url = get_database_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    """Run migrations with database connection"""
    context.configure(
        connection=connection, 
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
        # Include these options for better migration detection
        include_object=include_object,
        render_as_batch=False,  # PostgreSQL supports DDL transactions
    )

    with context.begin_transaction():
        context.run_migrations()

def include_object(object, name, type_, reflected, compare_to):
    """Filter objects to include in migrations"""
    # Include all inventory-related tables
    if type_ == "table":
        # Include all tables by default
        return True
    
    # Include all indexes, constraints, etc.
    return True

async def run_async_migrations() -> None:
    """Run migrations in async mode using async engine"""
    database_url = get_database_url()
    
    # Create async engine for migrations
    connectable = create_async_engine(
        database_url,
        poolclass=pool.NullPool,
        echo=False,  # Set to True for SQL debugging
        future=True,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.
    """
    # Use async migrations for better PostgreSQL support
    asyncio.run(run_async_migrations())

# Determine migration mode
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()