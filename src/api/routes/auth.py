"""
Authentication API Routes
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """Login endpoint - simplified for PostgreSQL migration phase"""
    # For now, return a mock token for development
    # This will be replaced with proper JWT authentication
    
    if login_data.username == "admin" and login_data.password == "admin":
        return LoginResponse(
            access_token="mock_token_for_postgresql_migration",
            token_type="bearer",
            user_id=1,
            username="admin"
        )
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )

@router.post("/logout")
async def logout():
    """Logout endpoint"""
    return {"message": "Logged out successfully"}

@router.get("/me")
async def get_current_user():
    """Get current user information"""
    # Mock user for development
    return {
        "id": 1,
        "username": "admin",
        "email": "admin@inventory.local",
        "role": "admin",
        "is_active": True
    }