"""
Authentication Service for Enterprise Inventory Management System
Handles JWT token validation and user authentication
"""
import jwt
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from ..models import User
from ..database import get_db

logger = logging.getLogger(__name__)

class AuthService:
    """Authentication service for JWT token validation"""
    
    def __init__(self, db: Session):
        self.db = db
        self.secret_key = "your-secret-key-here"  # In production, use environment variable
        self.algorithm = "HS256"
        self.expiration_hours = 24

    def create_access_token(self, user_id: int, email: str) -> str:
        """Create JWT access token for user"""
        try:
            payload = {
                "sub": str(user_id),
                "email": email,
                "iat": datetime.utcnow(),
                "exp": datetime.utcnow() + timedelta(hours=self.expiration_hours)
            }
            
            token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
            logger.info(f"Created access token for user {user_id}")
            return token
            
        except Exception as e:
            logger.error(f"Token creation failed: {str(e)}")
            raise

    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token and return payload"""
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith("Bearer "):
                token = token[7:]
            
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # Check if token is expired
            exp = payload.get("exp")
            if exp and datetime.utcnow().timestamp() > exp:
                logger.warning("Token expired")
                return None
            
            return payload
            
        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Invalid token")
            return None
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            return None

    def get_user_from_token(self, token: str) -> Optional[User]:
        """Get user from JWT token"""
        try:
            payload = self.verify_token(token)
            if not payload:
                return None
            
            user_id = payload.get("sub")
            if not user_id:
                return None
            
            user = self.db.query(User).filter(User.id == int(user_id)).first()
            if not user:
                logger.warning(f"User not found for token: {user_id}")
                return None
            
            return user
            
        except Exception as e:
            logger.error(f"User retrieval from token failed: {str(e)}")
            return None

    def authenticate_user(self, email: str, password: str, two_factor_token: Optional[str] = None) -> Optional[User]:
        """Authenticate user with email, password, and optional 2FA token"""
        try:
            user = self.db.query(User).filter(User.email == email).first()
            if not user:
                return None
            
            # Check password using bcrypt
            if not self.verify_password(password, user.password_hash):
                return None
            
            # If 2FA is enabled, verify token
            if user.two_factor_enabled:
                if not two_factor_token:
                    # Return special marker to indicate 2FA required
                    return None
                
                # Verify 2FA token
                from .two_factor_service import TwoFactorService
                two_factor_service = TwoFactorService(self.db)
                
                if not two_factor_service.verify_user_2fa(user.id, two_factor_token):
                    return None
            
            # Update last login
            user.last_login = datetime.utcnow()
            self.db.commit()
            
            return user
            
        except Exception as e:
            logger.error(f"User authentication failed: {str(e)}")
            return None
    
    def check_2fa_required(self, email: str, password: str) -> bool:
        """Check if 2FA is required for user login"""
        try:
            user = self.db.query(User).filter(User.email == email).first()
            if not user:
                return False
            
            # Check password first
            if not self.verify_password(password, user.password_hash):
                return False
            
            return user.two_factor_enabled or False
            
        except Exception as e:
            logger.error(f"2FA check failed: {str(e)}")
            return False

    def create_demo_token(self) -> str:
        """Create a demo token for testing"""
        try:
            # Find or create admin user
            admin_user = self.db.query(User).filter(User.email == "admin@demo.com").first()
            if not admin_user:
                from ..models import UserRole
                admin_user = User(
                    email="admin@demo.com",
                    name="Admin User",
                    role=UserRole.ADMIN,
                    password_hash=self.hash_password("admin123"),
                    is_active=True,
                    is_verified=True
                )
                self.db.add(admin_user)
                self.db.commit()
                self.db.refresh(admin_user)
            
            return self.create_access_token(admin_user.id, admin_user.email)
            
        except Exception as e:
            logger.error(f"Demo token creation failed: {str(e)}")
            raise

    def validate_token_format(self, token: str) -> bool:
        """Validate basic token format"""
        try:
            # Check if token has valid JWT structure (header.payload.signature)
            parts = token.split('.')
            if len(parts) != 3:
                return False
            
            # Check if each part is base64 encoded
            import base64
            for part in parts:
                try:
                    # Add padding if needed
                    padded = part + '=' * (4 - len(part) % 4)
                    base64.urlsafe_b64decode(padded)
                except Exception:
                    return False
            
            return True
            
        except Exception:
            return False

    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        import bcrypt
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        import bcrypt
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        try:
            return self.db.query(User).filter(User.email == email).first()
        except Exception as e:
            logger.error(f"Get user by email failed: {str(e)}")
            return None

    def is_token_blacklisted(self, token: str) -> bool:
        """Check if token is blacklisted (for logout functionality)"""
        # In production, implement token blacklisting
        # For demo, all tokens are valid
        return False