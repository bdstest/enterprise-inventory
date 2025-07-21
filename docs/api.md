# Enterprise Inventory API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
```bash
# Bearer Token Authentication
curl -H "Authorization: Bearer JWT_TOKEN" \
     http://localhost:3000/api/v1/inventory/items
```

## Inventory Management Endpoints

### Get Inventory Items
```http
GET /api/v1/inventory/items
```
**Parameters:**
- `category` (string): Filter by category
- `location` (string): Filter by location
- `status` (string): `active`, `maintenance`, `retired`
- `search` (string): Search in name, description, SKU
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50)

**Response:**
```json
{
  "items": [
    {
      "id": "item_001",
      "sku": "LAP-DEL-001",
      "name": "Dell Latitude 7420",
      "description": "Business laptop with 16GB RAM, 512GB SSD",
      "category": "laptops",
      "location": "New York Office",
      "status": "active",
      "purchase_date": "2024-03-15",
      "purchase_price": 1299.99,
      "current_value": 899.99,
      "depreciation_rate": 0.2,
      "warranty_expires": "2027-03-15",
      "assigned_to": "john.doe@company.com",
      "last_audit": "2024-07-01",
      "specifications": {
        "processor": "Intel i7-1185G7",
        "memory": "16GB DDR4",
        "storage": "512GB NVMe SSD",
        "display": "14\" FHD"
      },
      "custom_fields": {
        "asset_tag": "NYC-LAP-001",
        "department": "Engineering"
      }
    }
  ],
  "pagination": {
    "total": 1247,
    "page": 1,
    "pages": 25,
    "limit": 50
  }
}
```

### Create Inventory Item
```http
POST /api/v1/inventory/items
```
**Request Body:**
```json
{
  "sku": "MON-LG-001",
  "name": "LG UltraWide Monitor 34WN80C",
  "description": "34-inch curved ultrawide monitor",
  "category": "monitors",
  "location": "San Francisco Office",
  "purchase_date": "2024-07-20",
  "purchase_price": 449.99,
  "supplier": "supplier_123",
  "specifications": {
    "size": "34 inches",
    "resolution": "3440 x 1440",
    "panel_type": "IPS",
    "refresh_rate": "60Hz"
  }
}
```

### Update Inventory Item
```http
PUT /api/v1/inventory/items/{item_id}
```
**Request Body:**
```json
{
  "status": "maintenance",
  "location": "IT Storage Room",
  "notes": "Display flickering, sent for repair",
  "assigned_to": null
}
```

### Delete Inventory Item
```http
DELETE /api/v1/inventory/items/{item_id}
```

### Bulk Operations
```http
POST /api/v1/inventory/items/bulk
```
**Request Body:**
```json
{
  "action": "update",
  "filter": {
    "category": "laptops",
    "location": "New York Office"
  },
  "updates": {
    "status": "audit_required",
    "last_audit": "2024-07-20"
  }
}
```

## Asset Management Endpoints

### Asset Assignment
```http
POST /api/v1/assets/{item_id}/assign
```
**Request Body:**
```json
{
  "assigned_to": "jane.smith@company.com",
  "assignment_date": "2024-07-20",
  "expected_return_date": "2025-07-20",
  "assignment_type": "permanent",
  "notes": "Laptop assignment for new employee"
}
```

### Asset Return
```http
POST /api/v1/assets/{item_id}/return
```
**Request Body:**
```json
{
  "return_date": "2024-07-20",
  "condition": "good",
  "notes": "Employee departure, laptop returned in good condition",
  "next_action": "reassign"
}
```

### Asset History
```http
GET /api/v1/assets/{item_id}/history
```
**Response:**
```json
{
  "item_id": "item_001",
  "history": [
    {
      "date": "2024-07-20T10:00:00Z",
      "action": "assigned",
      "user": "jane.smith@company.com",
      "details": "Laptop assignment for new employee",
      "performed_by": "admin@company.com"
    },
    {
      "date": "2024-07-15T14:30:00Z",
      "action": "maintenance",
      "details": "Routine cleaning and software updates",
      "performed_by": "it.support@company.com"
    }
  ]
}
```

## Location Management

### Get Locations
```http
GET /api/v1/locations
```
**Response:**
```json
{
  "locations": [
    {
      "id": "loc_001",
      "name": "New York Office",
      "address": "123 Broadway, New York, NY 10001",
      "type": "office",
      "capacity": 200,
      "contact_person": "facility.ny@company.com",
      "item_count": 156,
      "coordinates": {
        "latitude": 40.7506,
        "longitude": -73.9876
      }
    }
  ]
}
```

### Create Location
```http
POST /api/v1/locations
```
**Request Body:**
```json
{
  "name": "Austin Warehouse",
  "address": "456 Tech Boulevard, Austin, TX 78701",
  "type": "warehouse",
  "capacity": 5000,
  "contact_person": "warehouse.austin@company.com"
}
```

## Category Management

### Get Categories
```http
GET /api/v1/categories
```
**Response:**
```json
{
  "categories": [
    {
      "id": "cat_001",
      "name": "Laptops",
      "description": "Portable computers for employees",
      "parent_category": "computers",
      "item_count": 245,
      "attributes": [
        {
          "name": "processor",
          "type": "string",
          "required": true
        },
        {
          "name": "memory",
          "type": "string",
          "required": true
        },
        {
          "name": "storage",
          "type": "string",
          "required": true
        }
      ]
    }
  ]
}
```

## Supplier Management

### Get Suppliers
```http
GET /api/v1/suppliers
```
**Response:**
```json
{
  "suppliers": [
    {
      "id": "sup_001",
      "name": "Dell Technologies",
      "contact_email": "sales@dell.com",
      "contact_phone": "+1-800-DELL",
      "address": "One Dell Way, Round Rock, TX 78682",
      "payment_terms": "Net 30",
      "preferred_vendor": true,
      "item_count": 89,
      "total_value": 125420.50
    }
  ]
}
```

### Create Supplier
```http
POST /api/v1/suppliers
```
**Request Body:**
```json
{
  "name": "Lenovo",
  "contact_email": "enterprise@lenovo.com",
  "contact_phone": "+1-855-LENOVO",
  "address": "1009 Think Place, Morrisville, NC 27560",
  "payment_terms": "Net 45",
  "preferred_vendor": false
}
```

## Reporting and Analytics

### Financial Reports
```http
GET /api/v1/reports/financial
```
**Parameters:**
- `period` (string): `month`, `quarter`, `year`
- `start_date` (string): ISO date format
- `end_date` (string): ISO date format
- `group_by` (string): `category`, `location`, `supplier`

**Response:**
```json
{
  "report_type": "financial_summary",
  "period": "2024-Q2",
  "summary": {
    "total_value": 2847650.75,
    "depreciated_value": 2104523.50,
    "new_purchases": 145236.80,
    "disposed_assets": 23145.20
  },
  "breakdown": [
    {
      "category": "laptops",
      "original_value": 425630.50,
      "current_value": 298441.35,
      "depreciation_rate": 0.25,
      "item_count": 245
    }
  ]
}
```

### Utilization Reports
```http
GET /api/v1/reports/utilization
```
**Response:**
```json
{
  "utilization_metrics": {
    "overall_utilization": 87.5,
    "by_category": {
      "laptops": {
        "total": 245,
        "assigned": 220,
        "utilization": 89.8
      },
      "monitors": {
        "total": 156,
        "assigned": 134,
        "utilization": 85.9
      }
    },
    "by_location": {
      "New York Office": {
        "capacity": 200,
        "assigned": 186,
        "utilization": 93.0
      }
    }
  }
}
```

### Audit Reports
```http
GET /api/v1/reports/audit
```
**Parameters:**
- `audit_date` (string): Specific audit date
- `overdue_only` (boolean): Show only overdue audits

**Response:**
```json
{
  "audit_summary": {
    "total_items": 1247,
    "audited_items": 1156,
    "overdue_audits": 91,
    "last_audit_cycle": "2024-Q1",
    "next_audit_cycle": "2024-Q3"
  },
  "overdue_items": [
    {
      "item_id": "item_001",
      "sku": "LAP-DEL-001",
      "last_audit": "2023-12-15",
      "days_overdue": 45,
      "location": "New York Office",
      "assigned_to": "john.doe@company.com"
    }
  ]
}
```

## Maintenance Management

### Schedule Maintenance
```http
POST /api/v1/maintenance/schedule
```
**Request Body:**
```json
{
  "item_id": "item_001",
  "maintenance_type": "preventive",
  "scheduled_date": "2024-08-15",
  "estimated_duration": "2 hours",
  "description": "Quarterly laptop maintenance and updates",
  "assigned_technician": "tech.support@company.com",
  "priority": "medium"
}
```

### Get Maintenance Schedule
```http
GET /api/v1/maintenance/schedule
```
**Parameters:**
- `start_date` (string): Schedule start date
- `end_date` (string): Schedule end date
- `status` (string): `scheduled`, `in_progress`, `completed`

**Response:**
```json
{
  "maintenance_items": [
    {
      "id": "maint_001",
      "item_id": "item_001",
      "type": "preventive",
      "status": "scheduled",
      "scheduled_date": "2024-08-15T09:00:00Z",
      "estimated_duration": "2 hours",
      "assigned_technician": "tech.support@company.com",
      "description": "Quarterly laptop maintenance and updates"
    }
  ]
}
```

## User Management

### Get Users
```http
GET /api/v1/users
```
**Response:**
```json
{
  "users": [
    {
      "id": "user_001",
      "email": "john.doe@company.com",
      "name": "John Doe",
      "department": "Engineering",
      "location": "New York Office",
      "role": "employee",
      "assigned_assets": 3,
      "total_asset_value": 3250.75,
      "active": true
    }
  ]
}
```

### Create User
```http
POST /api/v1/users
```
**Request Body:**
```json
{
  "email": "jane.smith@company.com",
  "name": "Jane Smith",
  "department": "Marketing",
  "location": "San Francisco Office",
  "role": "manager",
  "manager_email": "director@company.com"
}
```

## Search and Filtering

### Advanced Search
```http
POST /api/v1/search
```
**Request Body:**
```json
{
  "query": "Dell laptop",
  "filters": {
    "category": ["laptops", "computers"],
    "status": ["active", "maintenance"],
    "price_range": {
      "min": 500,
      "max": 2000
    },
    "purchase_date": {
      "start": "2024-01-01",
      "end": "2024-12-31"
    }
  },
  "sort_by": "purchase_date",
  "sort_order": "desc"
}
```

### Auto-complete Suggestions
```http
GET /api/v1/search/suggestions
```
**Parameters:**
- `q` (string): Partial search query
- `type` (string): `items`, `categories`, `suppliers`, `users`

**Response:**
```json
{
  "suggestions": [
    {
      "type": "item",
      "value": "Dell Latitude 7420",
      "id": "item_001"
    },
    {
      "type": "category",
      "value": "Dell Products",
      "id": "cat_dell"
    }
  ]
}
```

## Export and Import

### Export Data
```http
POST /api/v1/export
```
**Request Body:**
```json
{
  "format": "csv",
  "data_type": "inventory",
  "filters": {
    "category": "laptops",
    "location": "New York Office"
  },
  "fields": ["sku", "name", "status", "assigned_to", "purchase_date"]
}
```

### Import Data
```http
POST /api/v1/import
```
**Request Body (multipart/form-data):**
- `file`: CSV/Excel file
- `mapping`: Field mapping configuration
- `validation`: Validation rules

## Webhooks

### Asset Status Change
```http
POST /api/v1/webhooks/asset-status
```
**Webhook Payload:**
```json
{
  "event": "asset_status_changed",
  "timestamp": "2024-07-20T15:30:00Z",
  "item_id": "item_001",
  "old_status": "active",
  "new_status": "maintenance",
  "changed_by": "admin@company.com",
  "reason": "Scheduled maintenance"
}
```

## Error Handling
```json
{
  "error": {
    "code": "ITEM_NOT_FOUND",
    "message": "Item with ID 'item_999' not found",
    "timestamp": "2024-07-20T15:30:00Z",
    "request_id": "req_12345"
  }
}
```

## Rate Limiting
- **Community**: 1000 requests per hour
- **Standard**: 5000 requests per hour
- **Enterprise**: 10000 requests per hour

## SDK Examples

### Python SDK
```python
from enterprise_inventory import InventoryClient

client = InventoryClient(api_key="your_api_key")
items = client.inventory.list(category="laptops", status="active")
```

### JavaScript SDK
```javascript
const { InventoryAPI } = require('enterprise-inventory');
const client = new InventoryAPI({ apiKey: 'your_api_key' });
const items = await client.inventory.list({ category: 'laptops' });
```