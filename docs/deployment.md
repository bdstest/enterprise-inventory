# Enterprise Inventory Deployment Guide

## Overview

Complete deployment guide for Enterprise Inventory System supporting Docker, Kubernetes, and cloud-native architectures with automated CI/CD pipelines.

## System Requirements

### Minimum Production Requirements
- **CPU**: 8 cores
- **RAM**: 16 GB
- **Storage**: 200 GB SSD
- **Network**: 1 Gbps
- **OS**: Ubuntu 20.04 LTS, CentOS 8, or RHEL 8

### Recommended Production Requirements
- **CPU**: 16+ cores
- **RAM**: 32+ GB
- **Storage**: 500+ GB NVMe SSD
- **Network**: 10 Gbps
- **OS**: Ubuntu 22.04 LTS with latest security patches

### Database Requirements
- **PostgreSQL**: 13+ with 8 GB dedicated RAM
- **Redis**: 6+ with 4 GB dedicated RAM
- **Elasticsearch**: 7.10+ with 8 GB dedicated RAM

## Quick Start Deployment

### Docker Compose Deployment
```bash
# Clone repository
git clone https://github.com/bdstest/enterprise-inventory
cd enterprise-inventory

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and settings

# Start all services
docker-compose up -d

# Verify deployment
docker-compose ps
curl http://localhost:3000/api/v1/health
```

### Environment Configuration
```bash
# .env file
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=enterprise_inventory
POSTGRES_USER=inventory_user
POSTGRES_PASSWORD=SecurePassword123
DATABASE_URL=postgresql://inventory_user:SecurePassword123@localhost:5432/enterprise_inventory

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=RedisSecurePassword123
REDIS_URL=redis://:RedisSecurePassword123@localhost:6379

# Elasticsearch Configuration
ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=ElasticSecurePassword123

# JWT Configuration
JWT_SECRET=your-256-bit-secret-key-here
JWT_EXPIRES_IN=24h

# File Upload Configuration
UPLOAD_MAX_SIZE=10485760  # 10MB
UPLOAD_ALLOWED_TYPES=pdf,doc,docx,xls,xlsx,jpg,jpeg,png

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@company.com
SMTP_PASSWORD=EmailPassword123
SMTP_FROM=Enterprise Inventory <notifications@company.com>

# External Integrations
ERP_API_URL=https://erp.company.com/api
ERP_API_KEY=your-erp-api-key
LDAP_URL=ldap://ldap.company.com:389
LDAP_BIND_DN=cn=admin,dc=company,dc=com
LDAP_BIND_PASSWORD=LDAPPassword123
```

## Production Deployment

### Kubernetes Deployment

#### Namespace and ConfigMap
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: enterprise-inventory
  labels:
    name: asset-management
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: enterprise-inventory
data:
  NODE_ENV: "production"
  PORT: "3000"
  API_VERSION: "v1"
  POSTGRES_HOST: "postgresql"
  POSTGRES_PORT: "5432"
  POSTGRES_DB: "enterprise_inventory"
  REDIS_HOST: "redis"
  REDIS_PORT: "6379"
  ELASTICSEARCH_HOST: "elasticsearch"
  ELASTICSEARCH_PORT: "9200"
```

#### Database Deployment
```yaml
# k8s/postgresql.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgresql
  namespace: enterprise-inventory
spec:
  serviceName: postgresql
  replicas: 1
  selector:
    matchLabels:
      app: postgresql
  template:
    metadata:
      labels:
        app: postgresql
    spec:
      containers:
      - name: postgresql
        image: postgres:15
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: "enterprise_inventory"
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
        - name: PGDATA
          value: "/var/lib/postgresql/data/pgdata"
        volumeMounts:
        - name: postgresql-data
          mountPath: /var/lib/postgresql/data
        resources:
          limits:
            memory: 4Gi
            cpu: 2
          requests:
            memory: 2Gi
            cpu: 1
        livenessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - $(POSTGRES_USER)
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - $(POSTGRES_USER)
          initialDelaySeconds: 5
          periodSeconds: 5
  volumeClaimTemplates:
  - metadata:
      name: postgresql-data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 100Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgresql
  namespace: enterprise-inventory
spec:
  selector:
    app: postgresql
  ports:
  - port: 5432
    targetPort: 5432
  type: ClusterIP
```

#### Application Deployment
```yaml
# k8s/application.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: enterprise-inventory
  namespace: enterprise-inventory
spec:
  replicas: 3
  selector:
    matchLabels:
      app: enterprise-inventory
  template:
    metadata:
      labels:
        app: enterprise-inventory
    spec:
      containers:
      - name: api
        image: enterprise-inventory:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: app-config
        env:
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: password
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        resources:
          limits:
            memory: 2Gi
            cpu: 1
          requests:
            memory: 1Gi
            cpu: 500m
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 3000
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/v1/ready
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        volumeMounts:
        - name: uploads
          mountPath: /app/uploads
      volumes:
      - name: uploads
        persistentVolumeClaim:
          claimName: uploads-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: enterprise-inventory
  namespace: enterprise-inventory
spec:
  selector:
    app: enterprise-inventory
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

#### Ingress Configuration
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: enterprise-inventory-ingress
  namespace: enterprise-inventory
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - inventory.company.com
    secretName: inventory-tls
  rules:
  - host: inventory.company.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: enterprise-inventory
            port:
              number: 80
```

### Secrets Management
```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
  namespace: enterprise-inventory
type: Opaque
data:
  username: aW52ZW50b3J5X3VzZXI=  # base64 encoded
  password: U2VjdXJlUGFzc3dvcmQxMjM=  # base64 encoded
---
apiVersion: v1
kind: Secret
metadata:
  name: redis-credentials
  namespace: enterprise-inventory
type: Opaque
data:
  password: UmVkaXNTZWN1cmVQYXNzd29yZDEyMw==  # base64 encoded
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: enterprise-inventory
type: Opaque
data:
  jwt-secret: eW91ci0yNTYtYml0LXNlY3JldC1rZXktaGVyZQ==  # base64 encoded
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy Enterprise Inventory

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: npm test
      env:
        NODE_ENV: test
        DATABASE_URL: postgresql://postgres:test_password@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379
    
    - name: Run integration tests
      run: npm run test:integration

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: |
          ghcr.io/${{ github.repository }}:latest
          ghcr.io/${{ github.repository }}:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure kubectl
      uses: azure/k8s-set-context@v3
      with:
        method: kubeconfig
        kubeconfig: ${{ secrets.KUBE_CONFIG }}
    
    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/enterprise-inventory \
          api=ghcr.io/${{ github.repository }}:${{ github.sha }} \
          -n enterprise-inventory
        kubectl rollout status deployment/enterprise-inventory -n enterprise-inventory
    
    - name: Run post-deployment tests
      run: |
        kubectl wait --for=condition=ready pod -l app=enterprise-inventory -n enterprise-inventory --timeout=300s
        # Run smoke tests against deployed application
```

## Database Migration

### Migration Scripts
```sql
-- migrations/001_initial_schema.sql
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    type VARCHAR(50),
    capacity INTEGER,
    coordinates POINT,
    contact_person VARCHAR(255),
    parent_location_id INTEGER REFERENCES locations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_category_id INTEGER REFERENCES categories(id),
    depreciation_rate DECIMAL(5,4) DEFAULT 0.2000,
    warranty_period INTERVAL DEFAULT INTERVAL '1 year',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    payment_terms VARCHAR(100) DEFAULT 'Net 30',
    preferred_vendor BOOLEAN DEFAULT FALSE,
    tax_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_locations_parent ON locations(parent_location_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_preferred ON suppliers(preferred_vendor);
```

### Migration Automation
```javascript
// scripts/migrate.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

class DatabaseMigrator {
    constructor(database_url) {
        this.pool = new Pool({ connectionString: database_url });
    }
    
    async runMigrations() {
        await this.createMigrationsTable();
        
        const migration_files = fs.readdirSync('./migrations')
            .filter(file => file.endsWith('.sql'))
            .sort();
        
        for (const file of migration_files) {
            await this.runMigration(file);
        }
        
        console.log('All migrations completed successfully');
    }
    
    async createMigrationsTable() {
        await this.pool.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(255) PRIMARY KEY,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }
    
    async runMigration(filename) {
        const version = path.basename(filename, '.sql');
        
        // Check if migration already executed
        const result = await this.pool.query(
            'SELECT version FROM schema_migrations WHERE version = $1',
            [version]
        );
        
        if (result.rows.length > 0) {
            console.log(`Migration ${version} already executed, skipping`);
            return;
        }
        
        // Execute migration
        const migration_sql = fs.readFileSync(`./migrations/${filename}`, 'utf8');
        
        try {
            await this.pool.query('BEGIN');
            await this.pool.query(migration_sql);
            await this.pool.query(
                'INSERT INTO schema_migrations (version) VALUES ($1)',
                [version]
            );
            await this.pool.query('COMMIT');
            
            console.log(`Migration ${version} executed successfully`);
        } catch (error) {
            await this.pool.query('ROLLBACK');
            throw new Error(`Migration ${version} failed: ${error.message}`);
        }
    }
}

// Run migrations
if (require.main === module) {
    const migrator = new DatabaseMigrator(process.env.DATABASE_URL);
    migrator.runMigrations().catch(console.error);
}
```

## Monitoring and Health Checks

### Application Health Endpoints
```javascript
// routes/health.js
const express = require('express');
const router = express.Router();

router.get('/health', async (req, res) => {
    const health_checks = await Promise.allSettled([
        checkDatabase(),
        checkRedis(),
        checkElasticsearch(),
        checkDiskSpace(),
        checkMemoryUsage()
    ]);
    
    const overall_status = health_checks.every(check => 
        check.status === 'fulfilled' && check.value.status === 'healthy'
    ) ? 'healthy' : 'unhealthy';
    
    res.status(overall_status === 'healthy' ? 200 : 503).json({
        status: overall_status,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version,
        checks: health_checks.map(check => check.value || { 
            status: 'error', 
            error: check.reason.message 
        })
    });
});

router.get('/ready', async (req, res) => {
    // Readiness check - can the service handle requests?
    try {
        await checkDatabase();
        await checkRedis();
        res.status(200).json({ status: 'ready' });
    } catch (error) {
        res.status(503).json({ status: 'not ready', error: error.message });
    }
});

async function checkDatabase() {
    const start = Date.now();
    try {
        await pool.query('SELECT 1');
        return {
            component: 'database',
            status: 'healthy',
            response_time: `${Date.now() - start}ms`
        };
    } catch (error) {
        return {
            component: 'database',
            status: 'unhealthy',
            error: error.message
        };
    }
}
```

### Prometheus Metrics
```javascript
// middleware/metrics.js
const prometheus = require('prom-client');

// Create custom metrics
const http_requests_total = new prometheus.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

const http_request_duration = new prometheus.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5]
});

const active_connections = new prometheus.Gauge({
    name: 'active_database_connections',
    help: 'Number of active database connections'
});

// Middleware to collect metrics
function collectMetrics(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        
        http_requests_total
            .labels(req.method, req.route?.path || req.path, res.statusCode)
            .inc();
        
        http_request_duration
            .labels(req.method, req.route?.path || req.path, res.statusCode)
            .observe(duration);
    });
    
    next();
}

module.exports = { collectMetrics, prometheus };
```

## Backup and Recovery

### Automated Backup Script
```bash
#!/bin/bash
# scripts/backup.sh

set -e

BACKUP_DIR="/backup/$(date +%Y%m%d)"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

echo "Starting backup at $(date)"

# PostgreSQL backup
echo "Backing up PostgreSQL..."
pg_dump $DATABASE_URL > $BACKUP_DIR/postgres_backup_$DATE.sql
gzip $BACKUP_DIR/postgres_backup_$DATE.sql

# Redis backup
echo "Backing up Redis..."
redis-cli --rdb $BACKUP_DIR/redis_backup_$DATE.rdb

# File uploads backup
echo "Backing up uploaded files..."
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz /app/uploads/

# Configuration backup
echo "Backing up configuration..."
tar -czf $BACKUP_DIR/config_backup_$DATE.tar.gz \
    /app/.env \
    /app/k8s/ \
    /app/docker-compose.yml

# Upload to cloud storage
echo "Uploading to cloud storage..."
aws s3 sync $BACKUP_DIR s3://company-backups/enterprise-inventory/

# Clean up old backups
echo "Cleaning up old backups..."
find /backup -type d -mtime +$RETENTION_DAYS -exec rm -rf {} +

echo "Backup completed successfully at $(date)"
```

## Security Configuration

### SSL/TLS Setup
```bash
# Generate SSL certificates for development
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
    -subj "/C=US/ST=CA/L=San Francisco/O=Company/OU=IT/CN=inventory.company.com"

# For production, use Let's Encrypt
certbot certonly --nginx -d inventory.company.com
```

### Security Headers Middleware
```javascript
// middleware/security.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security headers
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    }
});

// Rate limiting
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

module.exports = { securityHeaders, rateLimiter };
```

## Troubleshooting

### Common Issues and Solutions

#### Database Connection Issues
```bash
# Check PostgreSQL status
kubectl exec -it postgresql-0 -n enterprise-inventory -- pg_isready

# Check connection from application pod
kubectl exec -it enterprise-inventory-xxx -n enterprise-inventory -- \
    psql $DATABASE_URL -c "SELECT version();"

# View PostgreSQL logs
kubectl logs postgresql-0 -n enterprise-inventory
```

#### Performance Issues
```bash
# Check resource usage
kubectl top pods -n enterprise-inventory

# Scale application horizontally
kubectl scale deployment enterprise-inventory --replicas=5 -n enterprise-inventory

# Check slow queries
kubectl exec -it postgresql-0 -n enterprise-inventory -- \
    psql $DATABASE_URL -c "
    SELECT query, mean_time, calls 
    FROM pg_stat_statements 
    ORDER BY mean_time DESC 
    LIMIT 10;"
```

#### Storage Issues
```bash
# Check disk usage
df -h

# Clean up old logs
docker system prune -f
kubectl delete pods --field-selector=status.phase=Succeeded -n enterprise-inventory

# Resize persistent volume
kubectl patch pvc postgresql-data-postgresql-0 -n enterprise-inventory \
    -p '{"spec":{"resources":{"requests":{"storage":"200Gi"}}}}'
```

## Production Readiness Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations tested
- [ ] Backup procedures verified
- [ ] Monitoring alerts configured
- [ ] Load testing completed
- [ ] Security scan passed

### Post-deployment
- [ ] Health checks responding
- [ ] Metrics collection working
- [ ] Log aggregation functioning
- [ ] Backup jobs scheduled
- [ ] Alert notifications tested
- [ ] Documentation updated
- [ ] Team training completed