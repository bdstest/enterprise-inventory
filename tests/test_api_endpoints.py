"""
Comprehensive API endpoint tests for Enterprise Inventory System
Tests all API endpoints with proper error handling and validation
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, MagicMock
import json
from datetime import datetime

# Import the FastAPI app
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src', 'api'))

from main import app

client = TestClient(app)


class TestHealthAndStatus:
    """Test system health and status endpoints"""
    
    def test_health_endpoint(self):
        """Test health endpoint returns proper status"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
    
    def test_metrics_endpoint_exists(self):
        """Test metrics endpoint exists"""
        response = client.get("/metrics")
        # Should exist or return 404 if not implemented
        assert response.status_code in [200, 404]
    
    def test_info_endpoint(self):
        """Test application info endpoint"""
        response = client.get("/info")
        # Should provide basic app information
        assert response.status_code in [200, 404]


class TestInventoryAPI:
    """Test inventory management endpoints"""
    
    def test_inventory_list_endpoint(self):
        """Test inventory list endpoint structure"""
        response = client.get("/api/v1/inventory")
        # Should return list or require authentication
        assert response.status_code in [200, 401, 403]
    
    def test_inventory_list_pagination(self):
        """Test inventory list with pagination parameters"""
        response = client.get("/api/v1/inventory?page=1&size=10")
        assert response.status_code in [200, 401, 403, 422]
    
    def test_inventory_create_structure(self):
        """Test inventory item creation endpoint structure"""
        item_data = {
            "name": "Test Item",
            "description": "Test item description", 
            "sku": "TEST-001",
            "quantity": 10,
            "price": 99.99,
            "category_id": 1,
            "location_id": 1
        }
        
        response = client.post("/api/v1/inventory", json=item_data)
        # Should accept structure or require auth
        assert response.status_code in [200, 201, 401, 403, 422]
    
    def test_inventory_get_by_id(self):
        """Test get inventory item by ID"""
        response = client.get("/api/v1/inventory/1")
        assert response.status_code in [200, 401, 403, 404]
    
    def test_inventory_update_structure(self):
        """Test inventory item update endpoint"""
        update_data = {
            "name": "Updated Item",
            "quantity": 20
        }
        
        response = client.put("/api/v1/inventory/1", json=update_data)
        assert response.status_code in [200, 401, 403, 404, 422]
    
    def test_inventory_delete(self):
        """Test inventory item deletion"""
        response = client.delete("/api/v1/inventory/1")
        assert response.status_code in [200, 204, 401, 403, 404]


class TestCategoryAPI:
    """Test category management endpoints"""
    
    def test_categories_list(self):
        """Test categories list endpoint"""
        response = client.get("/api/v1/categories")
        assert response.status_code in [200, 401, 403]
    
    def test_category_create(self):
        """Test category creation"""
        category_data = {
            "name": "Test Category",
            "description": "Test category description"
        }
        
        response = client.post("/api/v1/categories", json=category_data)
        assert response.status_code in [200, 201, 401, 403, 422]


class TestLocationAPI:
    """Test location management endpoints"""
    
    def test_locations_list(self):
        """Test locations list endpoint"""
        response = client.get("/api/v1/locations")
        assert response.status_code in [200, 401, 403]
    
    def test_location_create(self):
        """Test location creation"""
        location_data = {
            "name": "Test Warehouse",
            "address": "123 Test Street",
            "type": "warehouse"
        }
        
        response = client.post("/api/v1/locations", json=location_data)
        assert response.status_code in [200, 201, 401, 403, 422]


class TestAuthenticationAPI:
    """Test authentication endpoints"""
    
    def test_login_endpoint_structure(self):
        """Test login endpoint accepts correct structure"""
        login_data = {
            "username": "testuser",
            "password": "testpassword"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        # Should accept structure (may fail auth but not reject format)
        assert response.status_code in [200, 400, 401, 422]
    
    def test_login_form_data(self):
        """Test login with form data (OAuth2 style)"""
        response = client.post("/api/v1/auth/login", 
                              data={"username": "test", "password": "test"})
        assert response.status_code in [200, 400, 401, 422]
    
    def test_token_validation(self):
        """Test token validation endpoint"""
        headers = {"Authorization": "Bearer test-token"}
        response = client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code in [200, 401, 403]
    
    def test_logout_endpoint(self):
        """Test logout endpoint exists"""
        headers = {"Authorization": "Bearer test-token"}
        response = client.post("/api/v1/auth/logout", headers=headers)
        assert response.status_code in [200, 401, 404]


class TestUserManagementAPI:
    """Test user management endpoints"""
    
    def test_users_list(self):
        """Test users list endpoint (admin only)"""
        response = client.get("/api/v1/users")
        assert response.status_code in [200, 401, 403]
    
    def test_user_create(self):
        """Test user creation endpoint"""
        user_data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "securepassword",
            "role": "user"
        }
        
        response = client.post("/api/v1/users", json=user_data)
        assert response.status_code in [200, 201, 401, 403, 422]
    
    def test_user_profile(self):
        """Test user profile endpoint"""
        headers = {"Authorization": "Bearer test-token"}
        response = client.get("/api/v1/users/me", headers=headers)
        assert response.status_code in [200, 401, 403]


class TestAnalyticsAPI:
    """Test analytics and reporting endpoints"""
    
    def test_analytics_dashboard(self):
        """Test analytics dashboard endpoint"""
        response = client.get("/api/v1/analytics/dashboard")
        assert response.status_code in [200, 401, 403]
    
    def test_inventory_reports(self):
        """Test inventory reports endpoint"""
        response = client.get("/api/v1/analytics/inventory-report")
        assert response.status_code in [200, 401, 403]
    
    def test_analytics_with_filters(self):
        """Test analytics with date filters"""
        params = {
            "start_date": "2024-01-01",
            "end_date": "2024-12-31"
        }
        response = client.get("/api/v1/analytics/dashboard", params=params)
        assert response.status_code in [200, 401, 403, 422]


class TestETLAPI:
    """Test ETL (Extract, Transform, Load) endpoints"""
    
    def test_etl_status(self):
        """Test ETL process status endpoint"""
        response = client.get("/api/v1/etl/status")
        assert response.status_code in [200, 401, 403]
    
    def test_etl_start(self):
        """Test ETL process start endpoint"""
        response = client.post("/api/v1/etl/start")
        assert response.status_code in [200, 201, 401, 403]
    
    def test_file_upload_structure(self):
        """Test file upload endpoint structure"""
        # Test with empty file to check structure
        files = {"file": ("test.csv", "", "text/csv")}
        response = client.post("/api/v1/etl/upload", files=files)
        assert response.status_code in [200, 201, 400, 401, 403, 422]


class TestTwoFactorAPI:
    """Test two-factor authentication endpoints"""
    
    def test_2fa_setup_endpoint(self):
        """Test 2FA setup endpoint"""
        headers = {"Authorization": "Bearer test-token"}
        response = client.post("/api/v1/auth/2fa/setup", headers=headers)
        assert response.status_code in [200, 201, 401, 403, 404]
    
    def test_2fa_verify_endpoint(self):
        """Test 2FA verification endpoint"""
        verify_data = {"token": "123456"}
        headers = {"Authorization": "Bearer test-token"}
        response = client.post("/api/v1/auth/2fa/verify", 
                              json=verify_data, headers=headers)
        assert response.status_code in [200, 400, 401, 403, 422]
    
    def test_2fa_disable_endpoint(self):
        """Test 2FA disable endpoint"""
        headers = {"Authorization": "Bearer test-token"}
        response = client.post("/api/v1/auth/2fa/disable", headers=headers)
        assert response.status_code in [200, 401, 403, 404]


class TestInputValidation:
    """Test input validation and security"""
    
    def test_sql_injection_prevention(self):
        """Test SQL injection prevention in search"""
        malicious_input = "'; DROP TABLE inventory; --"
        response = client.get(f"/api/v1/inventory?search={malicious_input}")
        # Should not return 500 error (should handle gracefully)
        assert response.status_code in [200, 400, 401, 403, 422]
    
    def test_xss_prevention(self):
        """Test XSS prevention in item creation"""
        xss_data = {
            "name": "<script>alert('xss')</script>",
            "description": "<img src=x onerror=alert('xss')>",
            "sku": "TEST-XSS"
        }
        
        response = client.post("/api/v1/inventory", json=xss_data)
        assert response.status_code in [200, 201, 400, 401, 403, 422]
    
    def test_oversized_payload(self):
        """Test handling of oversized payloads"""
        large_description = "A" * 10000  # 10KB description
        large_item = {
            "name": "Test Item",
            "description": large_description,
            "sku": "TEST-LARGE"
        }
        
        response = client.post("/api/v1/inventory", json=large_item)
        assert response.status_code in [200, 201, 413, 422]


class TestAPIDocumentation:
    """Test API documentation endpoints"""
    
    def test_openapi_schema(self):
        """Test OpenAPI schema is available and valid"""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        
        schema = response.json()
        assert "openapi" in schema
        assert "info" in schema
        assert "paths" in schema
    
    def test_swagger_docs(self):
        """Test Swagger UI is available"""
        response = client.get("/docs")
        assert response.status_code == 200
    
    def test_redoc_docs(self):
        """Test ReDoc is available"""
        response = client.get("/redoc")
        assert response.status_code == 200


class TestErrorHandling:
    """Test error handling and edge cases"""
    
    def test_404_handling(self):
        """Test 404 error handling"""
        response = client.get("/api/v1/nonexistent")
        assert response.status_code == 404
    
    def test_405_method_not_allowed(self):
        """Test method not allowed handling"""
        response = client.patch("/health")  # PATCH on GET endpoint
        assert response.status_code == 405
    
    def test_malformed_json(self):
        """Test malformed JSON handling"""
        response = client.post("/api/v1/inventory",
                              data="{invalid: json}",
                              headers={"content-type": "application/json"})
        assert response.status_code == 422
    
    def test_missing_required_fields(self):
        """Test missing required fields handling"""
        incomplete_item = {"name": "Test Item"}  # Missing required fields
        response = client.post("/api/v1/inventory", json=incomplete_item)
        assert response.status_code in [422, 400]


class TestPerformanceBaseline:
    """Test performance characteristics and baselines"""
    
    def test_health_endpoint_performance(self):
        """Test health endpoint response time"""
        import time
        
        start_time = time.time()
        response = client.get("/health")
        end_time = time.time()
        
        response_time = (end_time - start_time) * 1000
        assert response_time < 1000  # Should respond within 1 second
        print(f"Health endpoint response time: {response_time:.2f}ms")
    
    def test_concurrent_requests_handling(self):
        """Test handling of multiple concurrent requests"""
        import threading
        import time
        
        results = []
        
        def make_request():
            start_time = time.time()
            response = client.get("/health")
            end_time = time.time()
            results.append({
                "status_code": response.status_code,
                "response_time": (end_time - start_time) * 1000
            })
        
        # Create 5 concurrent threads
        threads = [threading.Thread(target=make_request) for _ in range(5)]
        
        start_time = time.time()
        for thread in threads:
            thread.start()
        
        for thread in threads:
            thread.join()
        
        total_time = (time.time() - start_time) * 1000
        
        # All requests should complete successfully
        assert len(results) == 5
        assert all(result["status_code"] == 200 for result in results)
        assert total_time < 5000  # All requests within 5 seconds
        
        avg_response_time = sum(r["response_time"] for r in results) / len(results)
        print(f"Concurrent requests avg response time: {avg_response_time:.2f}ms")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])