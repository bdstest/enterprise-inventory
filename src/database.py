"""
Database configuration and session management - PostgreSQL with Async Support
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
import os
import logging

logger = logging.getLogger(__name__)

# Database URL configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://inventory_user:yNM5f1wSpSPltwlH5XXp7h5oq@localhost:5432/inventory_local"
)

# Fallback to SQLite for development if PostgreSQL not available
SYNC_DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://") if DATABASE_URL.startswith("postgresql+asyncpg://") else DATABASE_URL

logger.info(f"Database URL configured: {DATABASE_URL}")

# Create async engine for main application
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL debugging
    future=True,
    poolclass=NullPool,  # Use NullPool for better container compatibility
    connect_args={"server_settings": {"jit": "off"}},  # Disable JIT for better compatibility
)

# Create sync engine for migrations and utilities
sync_engine = create_engine(
    SYNC_DATABASE_URL,
    echo=False,
    future=True,
    poolclass=NullPool,
    connect_args={"sslmode": "disable"},  # Disable SSL for local development
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Create sync session factory for migrations
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=sync_engine
)

# Create base class for models
Base = declarative_base()

async def get_db():
    """Async dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session error: {str(e)}")
            raise
        finally:
            await session.close()

def get_sync_db():
    """Sync dependency to get database session (for migrations)"""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        logger.error(f"Sync database session error: {str(e)}")
        raise
    finally:
        db.close()

async def create_all_tables():
    """Create all tables using async engine"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        logger.info("All database tables created successfully")

def create_all_tables_sync():
    """Create all tables using sync engine (for migrations)"""
    Base.metadata.create_all(bind=sync_engine)
    logger.info("All database tables created successfully (sync)")

async def check_database_connection():
    """Check if database connection is working"""
    try:
        from sqlalchemy import text
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT 1"))
            logger.info("Database connection successful")
            return True
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        return False