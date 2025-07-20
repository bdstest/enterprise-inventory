"""
Two-Factor Authentication (2FA) Service for Enterprise Inventory Management System
Provides TOTP-based 2FA, backup codes, and QR code generation
"""
import pyotp
import qrcode
import io
import base64
import secrets
import logging
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from ..models import User
from ..database import get_db

logger = logging.getLogger(__name__)

class TwoFactorService:
    """Two-Factor Authentication service for TOTP-based 2FA"""
    
    def __init__(self, db: Session):
        self.db = db
        self.issuer_name = "Enterprise Inventory System"
        self.backup_codes_count = 8
        
    def generate_secret(self) -> str:
        """Generate a new TOTP secret for a user"""
        try:
            secret = pyotp.random_base32()
            logger.info("Generated new TOTP secret")
            return secret
        except Exception as e:
            logger.error(f"Secret generation failed: {str(e)}")
            raise
    
    def generate_qr_code(self, user_email: str, secret: str) -> str:
        """Generate QR code as base64 encoded image for TOTP setup"""
        try:
            # Create TOTP URI
            totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
                name=user_email,
                issuer_name=self.issuer_name
            )
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(totp_uri)
            qr.make(fit=True)
            
            # Create QR code image
            qr_image = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            buffer = io.BytesIO()
            qr_image.save(buffer, format='PNG')
            qr_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            logger.info(f"Generated QR code for user: {user_email}")
            return qr_base64
            
        except Exception as e:
            logger.error(f"QR code generation failed: {str(e)}")
            raise
    
    def generate_backup_codes(self) -> List[str]:
        """Generate backup codes for 2FA recovery"""
        try:
            backup_codes = []
            for _ in range(self.backup_codes_count):
                # Generate 8-character backup code
                code = secrets.token_hex(4).upper()
                backup_codes.append(code)
            
            logger.info(f"Generated {len(backup_codes)} backup codes")
            return backup_codes
            
        except Exception as e:
            logger.error(f"Backup codes generation failed: {str(e)}")
            raise
    
    def verify_totp_token(self, secret: str, token: str) -> bool:
        """Verify TOTP token against secret"""
        try:
            if not secret or not token:
                return False
            
            totp = pyotp.TOTP(secret)
            is_valid = totp.verify(token, valid_window=1)  # Allow 30-second window
            
            logger.info(f"TOTP verification result: {is_valid}")
            return is_valid
            
        except Exception as e:
            logger.error(f"TOTP verification failed: {str(e)}")
            return False
    
    def verify_backup_code(self, user_id: int, backup_code: str) -> bool:
        """Verify and consume backup code"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user or not user.backup_codes:
                return False
            
            backup_codes = user.backup_codes
            backup_code_upper = backup_code.upper()
            
            if backup_code_upper in backup_codes:
                # Remove used backup code
                backup_codes.remove(backup_code_upper)
                user.backup_codes = backup_codes
                self.db.commit()
                
                logger.info(f"Backup code used for user {user_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Backup code verification failed: {str(e)}")
            return False
    
    def setup_2fa_for_user(self, user_id: int) -> Dict[str, Any]:
        """Initialize 2FA setup for a user"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("User not found")
            
            # Generate new secret and backup codes
            secret = self.generate_secret()
            backup_codes = self.generate_backup_codes()
            qr_code = self.generate_qr_code(user.email, secret)
            
            # Store secret and backup codes (but don't enable 2FA yet)
            user.two_factor_secret = secret
            user.backup_codes = backup_codes
            user.two_factor_setup_complete = False
            user.two_factor_enabled = False
            
            self.db.commit()
            
            logger.info(f"2FA setup initiated for user {user_id}")
            
            return {
                "secret": secret,
                "qr_code": qr_code,
                "backup_codes": backup_codes,
                "manual_entry_key": secret
            }
            
        except Exception as e:
            logger.error(f"2FA setup failed for user {user_id}: {str(e)}")
            raise
    
    def enable_2fa_for_user(self, user_id: int, verification_token: str) -> bool:
        """Enable 2FA after user verifies their setup"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user or not user.two_factor_secret:
                return False
            
            # Verify the setup token
            if self.verify_totp_token(user.two_factor_secret, verification_token):
                user.two_factor_enabled = True
                user.two_factor_setup_complete = True
                self.db.commit()
                
                logger.info(f"2FA enabled for user {user_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"2FA enable failed for user {user_id}: {str(e)}")
            return False
    
    def disable_2fa_for_user(self, user_id: int, verification_token: str) -> bool:
        """Disable 2FA for a user (requires TOTP or backup code)"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return False
            
            # Verify with TOTP or backup code
            totp_valid = False
            backup_valid = False
            
            if user.two_factor_secret:
                totp_valid = self.verify_totp_token(user.two_factor_secret, verification_token)
            
            if not totp_valid:
                backup_valid = self.verify_backup_code(user_id, verification_token)
            
            if totp_valid or backup_valid:
                user.two_factor_enabled = False
                user.two_factor_setup_complete = False
                user.two_factor_secret = None
                user.backup_codes = None
                self.db.commit()
                
                logger.info(f"2FA disabled for user {user_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"2FA disable failed for user {user_id}: {str(e)}")
            return False
    
    def verify_user_2fa(self, user_id: int, token: str) -> bool:
        """Verify 2FA token for user login"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user or not user.two_factor_enabled:
                return False
            
            # Try TOTP first
            if user.two_factor_secret:
                if self.verify_totp_token(user.two_factor_secret, token):
                    return True
            
            # Try backup code if TOTP fails
            return self.verify_backup_code(user_id, token)
            
        except Exception as e:
            logger.error(f"2FA verification failed for user {user_id}: {str(e)}")
            return False
    
    def get_2fa_status(self, user_id: int) -> Dict[str, Any]:
        """Get 2FA status for a user"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return {"error": "User not found"}
            
            remaining_backup_codes = 0
            if user.backup_codes:
                remaining_backup_codes = len(user.backup_codes)
            
            return {
                "enabled": user.two_factor_enabled or False,
                "setup_complete": user.two_factor_setup_complete or False,
                "has_secret": bool(user.two_factor_secret),
                "remaining_backup_codes": remaining_backup_codes
            }
            
        except Exception as e:
            logger.error(f"Get 2FA status failed for user {user_id}: {str(e)}")
            return {"error": str(e)}
    
    def regenerate_backup_codes(self, user_id: int, verification_token: str) -> Optional[List[str]]:
        """Regenerate backup codes for a user"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user or not user.two_factor_enabled:
                return None
            
            # Verify current TOTP or backup code
            if not self.verify_user_2fa(user_id, verification_token):
                return None
            
            # Generate new backup codes
            new_backup_codes = self.generate_backup_codes()
            user.backup_codes = new_backup_codes
            self.db.commit()
            
            logger.info(f"Backup codes regenerated for user {user_id}")
            return new_backup_codes
            
        except Exception as e:
            logger.error(f"Backup codes regeneration failed for user {user_id}: {str(e)}")
            return None
    
    def validate_setup_requirements(self, user_id: int) -> Dict[str, Any]:
        """Validate if user can set up 2FA"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return {"valid": False, "error": "User not found"}
            
            if not user.is_active:
                return {"valid": False, "error": "User account is not active"}
            
            if not user.is_verified:
                return {"valid": False, "error": "User email is not verified"}
            
            return {"valid": True}
            
        except Exception as e:
            logger.error(f"2FA setup validation failed for user {user_id}: {str(e)}")
            return {"valid": False, "error": str(e)}