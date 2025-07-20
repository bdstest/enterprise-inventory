# Enterprise Inventory Security Guide

## Security Overview

Comprehensive security implementation for Enterprise Inventory System covering authentication, authorization, data protection, and compliance requirements.

## Authentication & Authorization

### Multi-Factor Authentication (MFA)
```javascript
// auth/mfa.js
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class MFAManager {
    generateSecret(user_email) {
        const secret = speakeasy.generateSecret({
            name: `Enterprise Inventory (${user_email})`,
            issuer: 'Company Name',
            length: 32
        });
        
        return {
            secret: secret.base32,
            qr_code_url: secret.otpauth_url,
            backup_codes: this.generateBackupCodes()
        };
    }
    
    verifyToken(secret, token) {
        return speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: 2 // Allow 2 time steps of variance
        });
    }
    
    generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < 10; i++) {
            codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
        }
        return codes;
    }
}

// Middleware for MFA verification
function requireMFA(req, res, next) {
    if (!req.user.mfa_enabled) {
        return res.status(403).json({
            error: 'MFA_REQUIRED',
            message: 'Multi-factor authentication must be enabled'
        });
    }
    
    if (!req.user.mfa_verified) {
        return res.status(403).json({
            error: 'MFA_VERIFICATION_REQUIRED',
            message: 'Please verify your MFA token'
        });
    }
    
    next();
}
```

### Role-Based Access Control (RBAC)
```javascript
// auth/rbac.js
const permissions = {
    // Asset management permissions
    'assets:read': 'View assets',
    'assets:create': 'Create new assets',
    'assets:update': 'Update asset information',
    'assets:delete': 'Delete assets',
    'assets:assign': 'Assign assets to users',
    
    // Location management permissions
    'locations:read': 'View locations',
    'locations:create': 'Create new locations',
    'locations:update': 'Update location information',
    'locations:delete': 'Delete locations',
    
    // User management permissions
    'users:read': 'View user information',
    'users:create': 'Create new users',
    'users:update': 'Update user information',
    'users:delete': 'Delete users',
    
    // Reporting permissions
    'reports:read': 'View reports',
    'reports:create': 'Create custom reports',
    'reports:export': 'Export report data',
    
    // Administrative permissions
    'admin:system': 'System administration',
    'admin:security': 'Security administration',
    'admin:audit': 'Audit log access'
};

const roles = {
    'employee': [
        'assets:read',
        'locations:read',
        'reports:read'
    ],
    'manager': [
        'assets:read',
        'assets:create',
        'assets:update',
        'assets:assign',
        'locations:read',
        'users:read',
        'reports:read',
        'reports:create'
    ],
    'admin': [
        'assets:read',
        'assets:create',
        'assets:update',
        'assets:delete',
        'assets:assign',
        'locations:read',
        'locations:create',
        'locations:update',
        'locations:delete',
        'users:read',
        'users:create',
        'users:update',
        'reports:read',
        'reports:create',
        'reports:export'
    ],
    'super_admin': Object.keys(permissions)
};

function hasPermission(user_roles, required_permission) {
    return user_roles.some(role => 
        roles[role] && roles[role].includes(required_permission)
    );
}

function requirePermission(permission) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        if (!hasPermission(req.user.roles, permission)) {
            return res.status(403).json({ 
                error: 'Insufficient permissions',
                required: permission
            });
        }
        
        next();
    };
}
```

### JWT Token Management
```javascript
// auth/jwt.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JWTManager {
    constructor(secret, options = {}) {
        this.secret = secret;
        this.options = {
            expiresIn: options.expiresIn || '24h',
            issuer: options.issuer || 'enterprise-inventory',
            audience: options.audience || 'inventory-users'
        };
        this.refreshTokens = new Map(); // In production, use Redis
    }
    
    generateTokenPair(user) {
        const payload = {
            user_id: user.id,
            email: user.email,
            roles: user.roles,
            permissions: this.getUserPermissions(user.roles),
            mfa_verified: user.mfa_verified || false
        };
        
        const access_token = jwt.sign(payload, this.secret, {
            expiresIn: '15m',
            issuer: this.options.issuer,
            audience: this.options.audience
        });
        
        const refresh_token = this.generateRefreshToken();
        this.refreshTokens.set(refresh_token, {
            user_id: user.id,
            created_at: new Date(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
        
        return { access_token, refresh_token };
    }
    
    verifyToken(token) {
        try {
            return jwt.verify(token, this.secret, {
                issuer: this.options.issuer,
                audience: this.options.audience
            });
        } catch (error) {
            throw new Error(`Invalid token: ${error.message}`);
        }
    }
    
    refreshAccessToken(refresh_token) {
        const token_data = this.refreshTokens.get(refresh_token);
        
        if (!token_data || token_data.expires_at < new Date()) {
            throw new Error('Invalid or expired refresh token');
        }
        
        // Generate new access token
        const user = this.getUserById(token_data.user_id);
        return this.generateTokenPair(user);
    }
    
    generateRefreshToken() {
        return crypto.randomBytes(64).toString('hex');
    }
    
    revokeRefreshToken(refresh_token) {
        this.refreshTokens.delete(refresh_token);
    }
    
    getUserPermissions(roles) {
        const user_permissions = new Set();
        roles.forEach(role => {
            if (roles[role]) {
                roles[role].forEach(permission => user_permissions.add(permission));
            }
        });
        return Array.from(user_permissions);
    }
}
```

## Data Protection

### Encryption at Rest
```javascript
// security/encryption.js
const crypto = require('crypto');

class DataEncryption {
    constructor(encryption_key) {
        this.algorithm = 'aes-256-gcm';
        this.key = crypto.scryptSync(encryption_key, 'salt', 32);
    }
    
    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher(this.algorithm, this.key, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const auth_tag = cipher.getAuthTag();
        
        return {
            encrypted: encrypted,
            iv: iv.toString('hex'),
            auth_tag: auth_tag.toString('hex')
        };
    }
    
    decrypt(encrypted_data) {
        const decipher = crypto.createDecipher(
            this.algorithm, 
            this.key, 
            Buffer.from(encrypted_data.iv, 'hex')
        );
        
        decipher.setAuthTag(Buffer.from(encrypted_data.auth_tag, 'hex'));
        
        let decrypted = decipher.update(encrypted_data.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
}

// Database field encryption middleware
function encryptSensitiveFields(model) {
    const encryption = new DataEncryption(process.env.FIELD_ENCRYPTION_KEY);
    
    model.addHook('beforeCreate', (instance) => {
        if (instance.ssn) {
            instance.ssn = encryption.encrypt(instance.ssn);
        }
        if (instance.credit_card) {
            instance.credit_card = encryption.encrypt(instance.credit_card);
        }
    });
    
    model.addHook('afterFind', (instances) => {
        const process_instance = (instance) => {
            if (instance.ssn) {
                instance.ssn = encryption.decrypt(instance.ssn);
            }
            if (instance.credit_card) {
                instance.credit_card = encryption.decrypt(instance.credit_card);
            }
        };
        
        if (Array.isArray(instances)) {
            instances.forEach(process_instance);
        } else if (instances) {
            process_instance(instances);
        }
    });
}
```

### Data Masking and Anonymization
```javascript
// security/data_masking.js
class DataMasking {
    static maskEmail(email) {
        const [username, domain] = email.split('@');
        const masked_username = username.substring(0, 2) + '*'.repeat(username.length - 2);
        return `${masked_username}@${domain}`;
    }
    
    static maskPhone(phone) {
        return phone.replace(/\d(?=\d{4})/g, '*');
    }
    
    static maskSSN(ssn) {
        return ssn.replace(/\d(?=\d{4})/g, '*');
    }
    
    static maskCreditCard(card_number) {
        return card_number.replace(/\d(?=\d{4})/g, '*');
    }
    
    static anonymizeUser(user) {
        return {
            id: user.id,
            email: this.maskEmail(user.email),
            phone: user.phone ? this.maskPhone(user.phone) : null,
            department: user.department,
            location: user.location,
            created_at: user.created_at
        };
    }
}

// API endpoint with data masking
app.get('/api/v1/users/:id', requirePermission('users:read'), async (req, res) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Only show full data to users with admin permissions
    if (!hasPermission(req.user.roles, 'admin:security')) {
        user = DataMasking.anonymizeUser(user);
    }
    
    res.json(user);
});
```

## Security Headers and Middleware

### Comprehensive Security Headers
```javascript
// middleware/security_headers.js
const helmet = require('helmet');

const securityHeaders = helmet({
    // Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'strict-dynamic'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.company.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    },
    
    // HTTP Strict Transport Security
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    
    // X-Frame-Options
    frameguard: { action: 'deny' },
    
    // X-Content-Type-Options
    noSniff: true,
    
    // X-XSS-Protection
    xssFilter: true,
    
    // Referrer Policy
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    
    // Permissions Policy
    permissionsPolicy: {
        features: {
            camera: ["'none'"],
            microphone: ["'none'"],
            geolocation: ["'self'"],
            payment: ["'none'"]
        }
    }
});

module.exports = securityHeaders;
```

### Rate Limiting and DDoS Protection
```javascript
// middleware/rate_limiting.js
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const redis_client = redis.createClient(process.env.REDIS_URL);

// General rate limiting
const generalLimiter = rateLimit({
    store: new RedisStore({
        client: redis_client,
        prefix: 'rl:general:'
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
        error: 'Too many requests',
        retry_after: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
    store: new RedisStore({
        client: redis_client,
        prefix: 'rl:auth:'
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 auth attempts per windowMs
    message: {
        error: 'Too many authentication attempts',
        retry_after: '15 minutes'
    },
    skipSuccessfulRequests: true
});

// Progressive delay for suspicious activity
const speedLimiter = slowDown({
    store: new RedisStore({
        client: redis_client,
        prefix: 'sd:'
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 100, // Allow 100 requests per windowMs without delay
    delayMs: 500, // Add 500ms delay per request after delayAfter
    maxDelayMs: 20000 // Maximum delay of 20 seconds
});

module.exports = {
    generalLimiter,
    authLimiter,
    speedLimiter
};
```

## Input Validation and Sanitization

### Comprehensive Input Validation
```javascript
// validation/schemas.js
const Joi = require('joi');
const sanitizeHtml = require('sanitize-html');

// Custom validation rules
const customJoi = Joi.extend({
    type: 'string',
    base: Joi.string(),
    messages: {
        'string.sanitize': '{{#label}} contains potentially dangerous content'
    },
    rules: {
        sanitize: {
            method() {
                return this.$_addRule({ name: 'sanitize' });
            },
            validate(value, helpers) {
                const sanitized = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {}
                });
                
                if (sanitized !== value) {
                    return helpers.error('string.sanitize');
                }
                
                return sanitized;
            }
        }
    }
});

// Validation schemas
const schemas = {
    createAsset: Joi.object({
        sku: Joi.string().alphanum().min(3).max(50).required(),
        name: customJoi.string().sanitize().min(1).max(255).required(),
        description: customJoi.string().sanitize().max(1000).optional(),
        category_id: Joi.number().integer().positive().required(),
        location_id: Joi.number().integer().positive().required(),
        purchase_price: Joi.number().precision(2).positive().max(1000000).required(),
        purchase_date: Joi.date().iso().max('now').required(),
        specifications: Joi.object().optional(),
        custom_fields: Joi.object().optional()
    }),
    
    updateAsset: Joi.object({
        name: customJoi.string().sanitize().min(1).max(255).optional(),
        description: customJoi.string().sanitize().max(1000).optional(),
        status: Joi.string().valid('active', 'maintenance', 'retired').optional(),
        location_id: Joi.number().integer().positive().optional(),
        assigned_to: Joi.string().email().optional().allow(null),
        specifications: Joi.object().optional(),
        custom_fields: Joi.object().optional()
    }),
    
    userRegistration: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required(),
        name: customJoi.string().sanitize().min(1).max(100).required(),
        department: customJoi.string().sanitize().max(100).optional(),
        location: customJoi.string().sanitize().max(100).optional()
    })
};

// Validation middleware
function validateRequest(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        
        if (error) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }))
            });
        }
        
        req.body = value;
        next();
    };
}

module.exports = { schemas, validateRequest };
```

## Security Monitoring and Logging

### Comprehensive Audit Logging
```javascript
// security/audit_logger.js
class AuditLogger {
    constructor(logger) {
        this.logger = logger;
    }
    
    logSecurityEvent(event_type, details, req) {
        const audit_entry = {
            timestamp: new Date().toISOString(),
            event_type: event_type,
            user_id: req.user?.id || 'anonymous',
            user_email: req.user?.email || 'anonymous',
            ip_address: this.getClientIP(req),
            user_agent: req.get('User-Agent'),
            session_id: req.sessionID,
            request_id: req.id,
            details: details,
            severity: this.getSeverity(event_type)
        };
        
        this.logger.info('SECURITY_EVENT', audit_entry);
        
        // Send critical events to SIEM
        if (audit_entry.severity === 'critical') {
            this.sendToSIEM(audit_entry);
        }
    }
    
    logDataAccess(action, resource, resource_id, req) {
        this.logSecurityEvent('DATA_ACCESS', {
            action: action,
            resource: resource,
            resource_id: resource_id,
            success: true
        }, req);
    }
    
    logAuthEvent(event_type, success, details, req) {
        this.logSecurityEvent('AUTHENTICATION', {
            auth_event: event_type,
            success: success,
            details: details
        }, req);
    }
    
    logPrivilegeEscalation(attempted_action, req) {
        this.logSecurityEvent('PRIVILEGE_ESCALATION', {
            attempted_action: attempted_action,
            current_roles: req.user?.roles || [],
            required_permission: attempted_action
        }, req);
    }
    
    getClientIP(req) {
        return req.ip || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               (req.connection.socket ? req.connection.socket.remoteAddress : null);
    }
    
    getSeverity(event_type) {
        const severity_map = {
            'LOGIN_SUCCESS': 'info',
            'LOGIN_FAILURE': 'warning',
            'PASSWORD_CHANGE': 'info',
            'PRIVILEGE_ESCALATION': 'critical',
            'DATA_EXPORT': 'high',
            'ADMIN_ACTION': 'medium',
            'MFA_DISABLED': 'high'
        };
        
        return severity_map[event_type] || 'medium';
    }
    
    sendToSIEM(audit_entry) {
        // Integration with SIEM system (Splunk, ELK, etc.)
        console.log('CRITICAL SECURITY EVENT:', audit_entry);
    }
}

// Audit middleware
function auditMiddleware(audit_logger) {
    return (req, res, next) => {
        // Log all API requests
        const original_send = res.send;
        res.send = function(body) {
            if (req.method !== 'GET') { // Don't log GET requests to reduce noise
                audit_logger.logDataAccess(
                    req.method,
                    req.route?.path || req.path,
                    req.params.id,
                    req
                );
            }
            original_send.call(this, body);
        };
        
        next();
    };
}
```

### Intrusion Detection
```javascript
// security/intrusion_detection.js
class IntrusionDetectionSystem {
    constructor(redis_client) {
        this.redis = redis_client;
        this.thresholds = {
            failed_logins: { count: 5, window: 900 }, // 5 failures in 15 minutes
            rapid_requests: { count: 100, window: 60 }, // 100 requests in 1 minute
            privilege_escalation: { count: 3, window: 3600 }, // 3 attempts in 1 hour
            suspicious_downloads: { count: 10, window: 3600 } // 10 downloads in 1 hour
        };
    }
    
    async checkFailedLogins(ip_address) {
        const key = `failed_logins:${ip_address}`;
        const current_count = await this.redis.incr(key);
        
        if (current_count === 1) {
            await this.redis.expire(key, this.thresholds.failed_logins.window);
        }
        
        if (current_count >= this.thresholds.failed_logins.count) {
            await this.triggerAlert('BRUTE_FORCE_ATTACK', {
                ip_address: ip_address,
                failed_attempts: current_count,
                time_window: this.thresholds.failed_logins.window
            });
            
            return { blocked: true, reason: 'Too many failed login attempts' };
        }
        
        return { blocked: false };
    }
    
    async checkRapidRequests(ip_address) {
        const key = `rapid_requests:${ip_address}`;
        const current_count = await this.redis.incr(key);
        
        if (current_count === 1) {
            await this.redis.expire(key, this.thresholds.rapid_requests.window);
        }
        
        if (current_count >= this.thresholds.rapid_requests.count) {
            await this.triggerAlert('DDOS_ATTEMPT', {
                ip_address: ip_address,
                request_count: current_count,
                time_window: this.thresholds.rapid_requests.window
            });
            
            return { blocked: true, reason: 'Rate limit exceeded' };
        }
        
        return { blocked: false };
    }
    
    async detectAnomalousAccess(user_id, access_pattern) {
        // Machine learning-based anomaly detection would go here
        // For now, implement simple heuristics
        
        const unusual_patterns = [];
        
        // Check for unusual time access
        const hour = new Date().getHours();
        if (hour < 6 || hour > 22) {
            unusual_patterns.push('OFF_HOURS_ACCESS');
        }
        
        // Check for unusual location access
        const user_location_history = await this.getUserLocationHistory(user_id);
        if (access_pattern.location && !user_location_history.includes(access_pattern.location)) {
            unusual_patterns.push('NEW_LOCATION_ACCESS');
        }
        
        // Check for privilege escalation attempts
        if (access_pattern.attempted_privilege_escalation) {
            unusual_patterns.push('PRIVILEGE_ESCALATION');
        }
        
        if (unusual_patterns.length > 0) {
            await this.triggerAlert('ANOMALOUS_ACCESS', {
                user_id: user_id,
                patterns: unusual_patterns,
                access_details: access_pattern
            });
        }
        
        return unusual_patterns;
    }
    
    async triggerAlert(alert_type, details) {
        const alert = {
            timestamp: new Date().toISOString(),
            type: alert_type,
            severity: this.getAlertSeverity(alert_type),
            details: details,
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        
        // Store alert
        await this.redis.lpush('security_alerts', JSON.stringify(alert));
        
        // Send notifications
        await this.sendSecurityNotification(alert);
        
        return alert;
    }
    
    getAlertSeverity(alert_type) {
        const severity_map = {
            'BRUTE_FORCE_ATTACK': 'high',
            'DDOS_ATTEMPT': 'critical',
            'ANOMALOUS_ACCESS': 'medium',
            'PRIVILEGE_ESCALATION': 'high',
            'DATA_EXFILTRATION': 'critical'
        };
        
        return severity_map[alert_type] || 'medium';
    }
    
    async sendSecurityNotification(alert) {
        // Integration with notification systems
        console.log('SECURITY ALERT:', alert);
        
        // Send to security team via Slack, email, etc.
        if (alert.severity === 'critical') {
            // Immediate notification for critical alerts
            await this.sendImmediateNotification(alert);
        }
    }
}
```

## Compliance and Regulatory Requirements

### GDPR Compliance
```javascript
// compliance/gdpr.js
class GDPRCompliance {
    constructor(db) {
        this.db = db;
        this.personal_data_fields = [
            'email', 'name', 'phone', 'address', 'ssn', 'date_of_birth'
        ];
    }
    
    async handleDataSubjectRequest(request) {
        const { type, user_email, details } = request;
        
        switch (type) {
            case 'access':
                return await this.exportPersonalData(user_email);
            
            case 'rectification':
                return await this.updatePersonalData(user_email, details.updates);
            
            case 'erasure':
                return await this.deletePersonalData(user_email, details.reason);
            
            case 'portability':
                return await this.exportPortableData(user_email);
            
            case 'restriction':
                return await this.restrictProcessing(user_email, details.reason);
            
            default:
                throw new Error(`Unknown request type: ${type}`);
        }
    }
    
    async exportPersonalData(user_email) {
        const user = await this.db.User.findOne({ where: { email: user_email } });
        if (!user) {
            throw new Error('User not found');
        }
        
        // Collect all personal data across all tables
        const personal_data = {
            user_profile: this.extractPersonalData(user),
            asset_assignments: await this.getAssetAssignments(user.id),
            activity_logs: await this.getActivityLogs(user.id),
            preferences: await this.getUserPreferences(user.id)
        };
        
        // Log the data export
        await this.logDataExport(user.id, 'GDPR_ACCESS_REQUEST');
        
        return {
            request_id: `GDPR_${Date.now()}`,
            user_email: user_email,
            export_date: new Date().toISOString(),
            data: personal_data
        };
    }
    
    async deletePersonalData(user_email, reason) {
        const user = await this.db.User.findOne({ where: { email: user_email } });
        if (!user) {
            throw new Error('User not found');
        }
        
        // Check if deletion is legally possible
        if (await this.hasLegalBasisForRetention(user.id)) {
            throw new Error('Cannot delete data due to legal retention requirements');
        }
        
        // Anonymize instead of delete to maintain referential integrity
        const anonymized_data = {
            email: `deleted_user_${user.id}@example.com`,
            name: 'Deleted User',
            phone: null,
            address: null,
            deleted_at: new Date(),
            deletion_reason: reason
        };
        
        await user.update(anonymized_data);
        
        // Log the deletion
        await this.logDataDeletion(user.id, reason);
        
        return {
            request_id: `GDPR_DEL_${Date.now()}`,
            user_id: user.id,
            deletion_date: new Date().toISOString(),
            status: 'anonymized'
        };
    }
    
    extractPersonalData(record) {
        const personal_data = {};
        this.personal_data_fields.forEach(field => {
            if (record[field] !== undefined) {
                personal_data[field] = record[field];
            }
        });
        return personal_data;
    }
    
    async logDataExport(user_id, request_type) {
        await this.db.DataProcessingLog.create({
            user_id: user_id,
            action: request_type,
            timestamp: new Date(),
            legal_basis: 'Data subject rights (GDPR Article 15)',
            purpose: 'Compliance with data subject access request'
        });
    }
}
```

## Security Testing and Vulnerability Management

### Automated Security Testing
```javascript
// security/vulnerability_scanner.js
const { spawn } = require('child_process');

class VulnerabilityScanner {
    constructor() {
        this.scan_tools = {
            npm_audit: this.runNPMAudit,
            dependency_check: this.runDependencyCheck,
            sast: this.runStaticAnalysis,
            container_scan: this.runContainerScan
        };
    }
    
    async runFullSecurityScan() {
        const results = {};
        
        for (const [tool_name, scan_function] of Object.entries(this.scan_tools)) {
            try {
                console.log(`Running ${tool_name}...`);
                results[tool_name] = await scan_function.call(this);
            } catch (error) {
                results[tool_name] = {
                    error: error.message,
                    status: 'failed'
                };
            }
        }
        
        return this.generateSecurityReport(results);
    }
    
    async runNPMAudit() {
        return new Promise((resolve, reject) => {
            const audit = spawn('npm', ['audit', '--json']);
            let output = '';
            
            audit.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            audit.on('close', (code) => {
                try {
                    const audit_results = JSON.parse(output);
                    resolve({
                        status: 'completed',
                        vulnerabilities: audit_results.vulnerabilities || {},
                        summary: audit_results.metadata?.vulnerabilities || {}
                    });
                } catch (error) {
                    reject(new Error(`Failed to parse npm audit results: ${error.message}`));
                }
            });
        });
    }
    
    async runStaticAnalysis() {
        // Integration with tools like ESLint Security, Semgrep, or SonarQube
        return new Promise((resolve, reject) => {
            const semgrep = spawn('semgrep', [
                '--config=auto',
                '--json',
                '--severity=ERROR',
                '--severity=WARNING',
                '.'
            ]);
            
            let output = '';
            
            semgrep.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            semgrep.on('close', (code) => {
                try {
                    const results = JSON.parse(output);
                    resolve({
                        status: 'completed',
                        findings: results.results || [],
                        errors: results.errors || []
                    });
                } catch (error) {
                    reject(new Error(`Failed to parse semgrep results: ${error.message}`));
                }
            });
        });
    }
    
    generateSecurityReport(scan_results) {
        const high_severity_issues = [];
        const medium_severity_issues = [];
        const low_severity_issues = [];
        
        // Process npm audit results
        if (scan_results.npm_audit?.vulnerabilities) {
            Object.values(scan_results.npm_audit.vulnerabilities).forEach(vuln => {
                const issue = {
                    tool: 'npm_audit',
                    severity: vuln.severity,
                    title: vuln.title,
                    package: vuln.module_name,
                    version: vuln.findings?.[0]?.version,
                    cwe: vuln.cwe,
                    recommendation: vuln.recommendation
                };
                
                if (vuln.severity === 'critical' || vuln.severity === 'high') {
                    high_severity_issues.push(issue);
                } else if (vuln.severity === 'moderate') {
                    medium_severity_issues.push(issue);
                } else {
                    low_severity_issues.push(issue);
                }
            });
        }
        
        // Process SAST results
        if (scan_results.sast?.findings) {
            scan_results.sast.findings.forEach(finding => {
                const issue = {
                    tool: 'sast',
                    severity: this.mapSeverity(finding.extra?.severity),
                    title: finding.check_id,
                    file: finding.path,
                    line: finding.start?.line,
                    message: finding.extra?.message
                };
                
                if (issue.severity === 'high') {
                    high_severity_issues.push(issue);
                } else if (issue.severity === 'medium') {
                    medium_severity_issues.push(issue);
                } else {
                    low_severity_issues.push(issue);
                }
            });
        }
        
        return {
            scan_date: new Date().toISOString(),
            summary: {
                high_severity: high_severity_issues.length,
                medium_severity: medium_severity_issues.length,
                low_severity: low_severity_issues.length,
                total_issues: high_severity_issues.length + medium_severity_issues.length + low_severity_issues.length
            },
            details: {
                high_severity: high_severity_issues,
                medium_severity: medium_severity_issues,
                low_severity: low_severity_issues
            },
            recommendations: this.generateRecommendations(high_severity_issues, medium_severity_issues)
        };
    }
    
    mapSeverity(tool_severity) {
        const severity_map = {
            'ERROR': 'high',
            'WARNING': 'medium',
            'INFO': 'low',
            'critical': 'high',
            'high': 'high',
            'moderate': 'medium',
            'low': 'low'
        };
        
        return severity_map[tool_severity] || 'medium';
    }
    
    generateRecommendations(high_issues, medium_issues) {
        const recommendations = [];
        
        if (high_issues.length > 0) {
            recommendations.push({
                priority: 'immediate',
                action: 'Address all high severity vulnerabilities immediately',
                count: high_issues.length
            });
        }
        
        if (medium_issues.length > 0) {
            recommendations.push({
                priority: 'high',
                action: 'Plan remediation for medium severity issues within 30 days',
                count: medium_issues.length
            });
        }
        
        return recommendations;
    }
}
```

## Incident Response and Forensics

### Security Incident Response
```javascript
// security/incident_response.js
class SecurityIncidentResponse {
    constructor(notification_service, audit_logger) {
        this.notification_service = notification_service;
        this.audit_logger = audit_logger;
        this.incident_types = {
            'DATA_BREACH': { severity: 'critical', response_time: 15 },
            'UNAUTHORIZED_ACCESS': { severity: 'high', response_time: 60 },
            'MALWARE_DETECTION': { severity: 'high', response_time: 30 },
            'DDOS_ATTACK': { severity: 'medium', response_time: 30 },
            'PRIVILEGE_ESCALATION': { severity: 'high', response_time: 30 }
        };
    }
    
    async createIncident(incident_type, details, detected_by) {
        const incident = {
            id: `INC_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            type: incident_type,
            severity: this.incident_types[incident_type]?.severity || 'medium',
            status: 'open',
            created_at: new Date(),
            detected_by: detected_by,
            details: details,
            response_actions: [],
            timeline: [{
                timestamp: new Date(),
                action: 'incident_created',
                details: 'Security incident automatically created',
                performed_by: 'system'
            }]
        };
        
        // Store incident
        await this.storeIncident(incident);
        
        // Trigger immediate response
        await this.triggerImmediateResponse(incident);
        
        // Notify security team
        await this.notifySecurityTeam(incident);
        
        return incident;
    }
    
    async triggerImmediateResponse(incident) {
        const automated_actions = [];
        
        switch (incident.type) {
            case 'DATA_BREACH':
                automated_actions.push(
                    this.isolateAffectedSystems(incident.details.affected_systems),
                    this.enableAdditionalLogging(),
                    this.notifyLegalTeam(incident)
                );
                break;
                
            case 'UNAUTHORIZED_ACCESS':
                automated_actions.push(
                    this.revokeUserSessions(incident.details.user_id),
                    this.requireMFAReauth(incident.details.user_id),
                    this.increaseMonitoring(incident.details.user_id)
                );
                break;
                
            case 'DDOS_ATTACK':
                automated_actions.push(
                    this.enableDDOSProtection(),
                    this.blockSuspiciousIPs(incident.details.source_ips)
                );
                break;
        }
        
        const results = await Promise.allSettled(automated_actions);
        
        // Log response actions
        results.forEach((result, index) => {
            incident.response_actions.push({
                action: automated_actions[index].name,
                status: result.status,
                timestamp: new Date(),
                result: result.value || result.reason
            });
        });
        
        return incident;
    }
    
    async isolateAffectedSystems(systems) {
        // Implementation would integrate with infrastructure management
        console.log(`Isolating systems: ${systems.join(', ')}`);
        
        // Block network access
        // Disable user accounts
        // Preserve evidence
        
        return { action: 'isolate_systems', status: 'completed', systems: systems };
    }
    
    async revokeUserSessions(user_id) {
        // Revoke all active sessions for the user
        await this.redis.del(`user_sessions:${user_id}`);
        
        // Force password reset
        await this.db.User.update(
            { force_password_reset: true, sessions_revoked_at: new Date() },
            { where: { id: user_id } }
        );
        
        return { action: 'revoke_sessions', status: 'completed', user_id: user_id };
    }
    
    async generateForensicReport(incident_id) {
        const incident = await this.getIncident(incident_id);
        
        const forensic_data = {
            incident_summary: incident,
            timeline: await this.buildDetailedTimeline(incident),
            affected_data: await this.identifyAffectedData(incident),
            attack_vectors: await this.analyzeAttackVectors(incident),
            system_state: await this.captureSystemState(incident),
            evidence_collection: await this.collectEvidence(incident),
            impact_assessment: await this.assessImpact(incident),
            recommendations: await this.generateRecommendations(incident)
        };
        
        return forensic_data;
    }
}
```

This comprehensive security guide covers all major aspects of security for the Enterprise Inventory System, including authentication, authorization, data protection, monitoring, compliance, and incident response. The implementation provides enterprise-grade security features necessary for protecting sensitive asset and user data.