"""
2FA API Routes for Enterprise Inventory Management System
Handles TOTP setup, verification, and backup codes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from pydantic import BaseModel, Field
import logging

from ...database import get_db, get_sync_db
from ...services.auth_service import AuthService
from ...services.two_factor_service import TwoFactorService
from ...models import User

logger = logging.getLogger(__name__)
security = HTTPBearer()

router = APIRouter(prefix="/api/2fa", tags=["Two-Factor Authentication"])

# Pydantic models for request/response
class TwoFactorSetupResponse(BaseModel):
    secret: str = Field(..., description="TOTP secret key")
    qr_code: str = Field(..., description="Base64 encoded QR code image")
    backup_codes: List[str] = Field(..., description="List of backup codes")
    manual_entry_key: str = Field(..., description="Manual entry key for authenticator apps")

class TwoFactorVerifyRequest(BaseModel):
    token: str = Field(..., description="6-digit TOTP token or 8-character backup code", min_length=6, max_length=8)

class TwoFactorStatusResponse(BaseModel):
    enabled: bool = Field(..., description="Whether 2FA is enabled")
    setup_complete: bool = Field(..., description="Whether 2FA setup is complete")
    has_secret: bool = Field(..., description="Whether user has a TOTP secret")
    remaining_backup_codes: int = Field(..., description="Number of remaining backup codes")

class BackupCodesResponse(BaseModel):
    backup_codes: List[str] = Field(..., description="List of new backup codes")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_sync_db)) -> User:
    """Get current authenticated user from JWT token"""
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
        
        user = auth_service.get_user_from_token(token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"}
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

@router.get("/status", response_model=TwoFactorStatusResponse)
def get_2fa_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_sync_db)
):
    """Get 2FA status for current user"""
    try:
        two_factor_service = TwoFactorService(db)
        status_result = two_factor_service.get_2fa_status(current_user.id)
        
        if "error" in status_result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=status_result["error"]
            )
        
        return TwoFactorStatusResponse(**status_result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get 2FA status failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get 2FA status"
        )

@router.post("/setup", response_model=TwoFactorSetupResponse)
def setup_2fa(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_sync_db)
):
    """Initialize 2FA setup for current user"""
    try:
        two_factor_service = TwoFactorService(db)
        
        # Validate setup requirements
        validation = two_factor_service.validate_setup_requirements(current_user.id)
        if not validation["valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=validation["error"]
            )
        
        # Check if 2FA is already enabled
        status_result = two_factor_service.get_2fa_status(current_user.id)
        if status_result.get("enabled"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="2FA is already enabled for this user"
            )
        
        # Setup 2FA
        setup_result = two_factor_service.setup_2fa_for_user(current_user.id)
        
        logger.info(f"2FA setup initiated for user {current_user.id}")
        return TwoFactorSetupResponse(**setup_result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"2FA setup failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to setup 2FA"
        )

@router.post("/enable")
def enable_2fa(
    request: TwoFactorVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_sync_db)
):
    """Enable 2FA after verifying setup token"""
    try:
        two_factor_service = TwoFactorService(db)
        
        success = two_factor_service.enable_2fa_for_user(current_user.id, request.token)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification token or 2FA not setup"
            )
        
        logger.info(f"2FA enabled for user {current_user.id}")
        return {"message": "2FA enabled successfully", "enabled": True}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"2FA enable failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to enable 2FA"
        )

@router.post("/verify")
def verify_2fa(
    request: TwoFactorVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_sync_db)
):
    """Verify 2FA token for current user"""
    try:
        two_factor_service = TwoFactorService(db)
        
        is_valid = two_factor_service.verify_user_2fa(current_user.id, request.token)
        
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid 2FA token"
            )
        
        return {"message": "2FA token verified successfully", "valid": True}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"2FA verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify 2FA token"
        )

@router.post("/disable")
def disable_2fa(
    request: TwoFactorVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_sync_db)
):
    """Disable 2FA for current user (requires verification)"""
    try:
        two_factor_service = TwoFactorService(db)
        
        success = two_factor_service.disable_2fa_for_user(current_user.id, request.token)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification token or 2FA not enabled"
            )
        
        logger.info(f"2FA disabled for user {current_user.id}")
        return {"message": "2FA disabled successfully", "enabled": False}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"2FA disable failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to disable 2FA"
        )

@router.post("/backup-codes/regenerate", response_model=BackupCodesResponse)
def regenerate_backup_codes(
    request: TwoFactorVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_sync_db)
):
    """Regenerate backup codes for current user"""
    try:
        two_factor_service = TwoFactorService(db)
        
        new_codes = two_factor_service.regenerate_backup_codes(current_user.id, request.token)
        
        if not new_codes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification token or 2FA not enabled"
            )
        
        logger.info(f"Backup codes regenerated for user {current_user.id}")
        return BackupCodesResponse(backup_codes=new_codes)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Backup codes regeneration failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to regenerate backup codes"
        )

@router.get("/qr-code")
def get_qr_code(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_sync_db)
):
    """Get QR code for 2FA setup (only if setup not complete)"""
    try:
        two_factor_service = TwoFactorService(db)
        
        # Check if user has a secret and setup is not complete
        status_result = two_factor_service.get_2fa_status(current_user.id)
        
        if status_result.get("enabled") or not status_result.get("has_secret"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="2FA already enabled or setup not initiated"
            )
        
        # Get user's secret and generate QR code
        user = db.query(User).filter(User.id == current_user.id).first()
        if not user or not user.two_factor_secret:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="2FA setup not initiated"
            )
        
        qr_code = two_factor_service.generate_qr_code(user.email, user.two_factor_secret)
        
        return {
            "qr_code": qr_code,
            "manual_entry_key": user.two_factor_secret
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"QR code generation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate QR code"
        )