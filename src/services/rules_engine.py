"""
AI-Powered Rules Engine for Enterprise Inventory Management System
Provides intelligent business logic automation, validation, and decision making
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Union, Callable
from datetime import datetime, timedelta
import json
import logging
from enum import Enum
from dataclasses import dataclass
import re
from sqlalchemy.orm import Session
from ..models import Item, Category, Supplier, Location, InventoryRule, Alert

logger = logging.getLogger(__name__)

class RuleType(Enum):
    VALIDATION = "validation"
    TRANSFORMATION = "transformation"
    BUSINESS_LOGIC = "business_logic"
    ALERT = "alert"
    AUTOMATION = "automation"

class RulePriority(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4

@dataclass
class RuleResult:
    rule_id: str
    rule_name: str
    status: str
    message: str
    data: Any = None
    timestamp: datetime = None

class RulesEngine:
    """AI-powered rules engine with advanced business logic"""
    
    def __init__(self, db_session: Session = None):
        self.db_session = db_session
        self.rules_registry = {}
        self.ml_models = {}
        self._initialize_default_rules()
    
    def _initialize_default_rules(self):
        """Initialize default business rules"""
        
        # Stock level rules
        self.register_rule(
            rule_id="low_stock_alert",
            rule_type=RuleType.ALERT,
            priority=RulePriority.HIGH,
            condition=lambda item: item.get('quantity', 0) < item.get('reorder_point', 10),
            action=self._trigger_low_stock_alert,
            description="Alert when stock levels are below reorder point"
        )
        
        self.register_rule(
            rule_id="overstocking_alert",
            rule_type=RuleType.ALERT,
            priority=RulePriority.MEDIUM,
            condition=lambda item: item.get('quantity', 0) > item.get('max_stock', 1000),
            action=self._trigger_overstocking_alert,
            description="Alert when stock levels exceed maximum threshold"
        )
        
        # Price validation rules
        self.register_rule(
            rule_id="price_validation",
            rule_type=RuleType.VALIDATION,
            priority=RulePriority.HIGH,
            condition=lambda item: item.get('unit_price', 0) > 0,
            action=self._validate_price,
            description="Validate that item prices are positive"
        )
        
        # SKU format validation
        self.register_rule(
            rule_id="sku_format_validation",
            rule_type=RuleType.VALIDATION,
            priority=RulePriority.HIGH,
            condition=lambda item: self._validate_sku_format(item.get('sku', '')),
            action=self._format_sku,
            description="Validate and format SKU codes"
        )
        
        # Automatic categorization
        self.register_rule(
            rule_id="auto_categorization",
            rule_type=RuleType.TRANSFORMATION,
            priority=RulePriority.MEDIUM,
            condition=lambda item: not item.get('category_id'),
            action=self._auto_categorize_item,
            description="Automatically categorize items based on name and description"
        )
        
        # Demand forecasting
        self.register_rule(
            rule_id="demand_forecast",
            rule_type=RuleType.BUSINESS_LOGIC,
            priority=RulePriority.MEDIUM,
            condition=lambda item: True,
            action=self._calculate_demand_forecast,
            description="Calculate demand forecast for inventory planning"
        )
        
        # Supplier performance monitoring
        self.register_rule(
            rule_id="supplier_performance",
            rule_type=RuleType.BUSINESS_LOGIC,
            priority=RulePriority.LOW,
            condition=lambda item: item.get('supplier_id'),
            action=self._evaluate_supplier_performance,
            description="Evaluate supplier performance metrics"
        )
    
    def register_rule(self, rule_id: str, rule_type: RuleType, priority: RulePriority,
                     condition: Callable, action: Callable, description: str = ""):
        """Register a new business rule"""
        self.rules_registry[rule_id] = {
            'type': rule_type,
            'priority': priority,
            'condition': condition,
            'action': action,
            'description': description,
            'created_at': datetime.now(),
            'active': True
        }
        logger.info(f"Rule registered: {rule_id}")
    
    def remove_rule(self, rule_id: str):
        """Remove a business rule"""
        if rule_id in self.rules_registry:
            del self.rules_registry[rule_id]
            logger.info(f"Rule removed: {rule_id}")
    
    def activate_rule(self, rule_id: str):
        """Activate a business rule"""
        if rule_id in self.rules_registry:
            self.rules_registry[rule_id]['active'] = True
            logger.info(f"Rule activated: {rule_id}")
    
    def deactivate_rule(self, rule_id: str):
        """Deactivate a business rule"""
        if rule_id in self.rules_registry:
            self.rules_registry[rule_id]['active'] = False
            logger.info(f"Rule deactivated: {rule_id}")
    
    async def apply_transformation_rules(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply transformation rules to data"""
        try:
            transformed_data = data.copy()
            
            for rule_id, rule in self.rules_registry.items():
                if rule['type'] == RuleType.TRANSFORMATION and rule['active']:
                    logger.info(f"Applying transformation rule: {rule_id}")
                    
                    for index, row in transformed_data.iterrows():
                        try:
                            if rule['condition'](row.to_dict()):
                                result = await rule['action'](row.to_dict())
                                if result:
                                    for key, value in result.items():
                                        transformed_data.at[index, key] = value
                        except Exception as e:
                            logger.error(f"Rule {rule_id} failed on row {index}: {str(e)}")
            
            return transformed_data
            
        except Exception as e:
            logger.error(f"Transformation rules failed: {str(e)}")
            raise
    
    async def validate_data(self, data: pd.DataFrame, 
                          custom_rules: List[str] = None) -> pd.DataFrame:
        """Validate data using validation rules"""
        try:
            validated_data = data.copy()
            validation_errors = []
            
            # Apply built-in validation rules
            for rule_id, rule in self.rules_registry.items():
                if rule['type'] == RuleType.VALIDATION and rule['active']:
                    logger.info(f"Applying validation rule: {rule_id}")
                    
                    for index, row in validated_data.iterrows():
                        try:
                            if not rule['condition'](row.to_dict()):
                                error_msg = f"Row {index}: {rule['description']}"
                                validation_errors.append(error_msg)
                                logger.warning(error_msg)
                        except Exception as e:
                            logger.error(f"Validation rule {rule_id} failed on row {index}: {str(e)}")
            
            # Apply custom validation rules
            if custom_rules:
                for rule_expr in custom_rules:
                    try:
                        # This is a simplified custom rule evaluation
                        # In production, use a proper rule engine like drools or implement a DSL
                        if not validated_data.eval(rule_expr).all():
                            validation_errors.append(f"Custom rule failed: {rule_expr}")
                    except Exception as e:
                        logger.error(f"Custom rule failed: {rule_expr} - {str(e)}")
            
            if validation_errors:
                logger.warning(f"Validation completed with {len(validation_errors)} errors")
            else:
                logger.info("Data validation completed successfully")
            
            return validated_data
            
        except Exception as e:
            logger.error(f"Data validation failed: {str(e)}")
            raise
    
    async def apply_business_logic(self, items: List[Dict[str, Any]]) -> List[RuleResult]:
        """Apply business logic rules to items"""
        try:
            results = []
            
            for rule_id, rule in self.rules_registry.items():
                if rule['type'] == RuleType.BUSINESS_LOGIC and rule['active']:
                    logger.info(f"Applying business logic rule: {rule_id}")
                    
                    for item in items:
                        try:
                            if rule['condition'](item):
                                result = await rule['action'](item)
                                if result:
                                    rule_result = RuleResult(
                                        rule_id=rule_id,
                                        rule_name=rule['description'],
                                        status='success',
                                        message=f"Rule applied successfully",
                                        data=result,
                                        timestamp=datetime.now()
                                    )
                                    results.append(rule_result)
                        except Exception as e:
                            error_result = RuleResult(
                                rule_id=rule_id,
                                rule_name=rule['description'],
                                status='error',
                                message=str(e),
                                timestamp=datetime.now()
                            )
                            results.append(error_result)
                            logger.error(f"Business logic rule {rule_id} failed: {str(e)}")
            
            return results
            
        except Exception as e:
            logger.error(f"Business logic application failed: {str(e)}")
            raise
    
    async def process_alerts(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process alert rules and generate alerts"""
        try:
            alerts = []
            
            for rule_id, rule in self.rules_registry.items():
                if rule['type'] == RuleType.ALERT and rule['active']:
                    logger.info(f"Processing alert rule: {rule_id}")
                    
                    for item in items:
                        try:
                            if rule['condition'](item):
                                alert = await rule['action'](item)
                                if alert:
                                    alert['rule_id'] = rule_id
                                    alert['timestamp'] = datetime.now()
                                    alerts.append(alert)
                        except Exception as e:
                            logger.error(f"Alert rule {rule_id} failed: {str(e)}")
            
            return alerts
            
        except Exception as e:
            logger.error(f"Alert processing failed: {str(e)}")
            raise
    
    # Rule action implementations
    async def _trigger_low_stock_alert(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Trigger low stock alert"""
        return {
            'type': 'low_stock',
            'severity': 'high',
            'message': f"Low stock alert for {item.get('name', 'Unknown Item')}",
            'item_id': item.get('id'),
            'current_quantity': item.get('quantity', 0),
            'reorder_point': item.get('reorder_point', 10),
            'suggested_action': 'Reorder inventory'
        }
    
    async def _trigger_overstocking_alert(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Trigger overstocking alert"""
        return {
            'type': 'overstocking',
            'severity': 'medium',
            'message': f"Overstocking alert for {item.get('name', 'Unknown Item')}",
            'item_id': item.get('id'),
            'current_quantity': item.get('quantity', 0),
            'max_stock': item.get('max_stock', 1000),
            'suggested_action': 'Consider promotional pricing or redistribution'
        }
    
    async def _validate_price(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Validate item price"""
        price = item.get('unit_price', 0)
        if price <= 0:
            return {'unit_price': 0.01}  # Set minimum price
        return None
    
    def _validate_sku_format(self, sku: str) -> bool:
        """Validate SKU format"""
        # Basic SKU validation - alphanumeric with dashes/underscores
        pattern = r'^[A-Z0-9_-]{3,20}$'
        return bool(re.match(pattern, sku.upper()))
    
    async def _format_sku(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Format SKU to standard format"""
        sku = item.get('sku', '')
        if not sku:
            # Generate SKU from name
            name = item.get('name', 'ITEM')
            sku = name.upper().replace(' ', '_')[:10]
            sku = f"{sku}_{datetime.now().strftime('%Y%m%d')}"
        
        formatted_sku = sku.upper().replace(' ', '_')
        return {'sku': formatted_sku}
    
    async def _auto_categorize_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Automatically categorize item based on name and description"""
        name = item.get('name', '').lower()
        description = item.get('description', '').lower()
        text = f"{name} {description}"
        
        # Simple keyword-based categorization
        category_keywords = {
            1: ['electronics', 'computer', 'phone', 'tablet', 'tech'],
            2: ['clothing', 'apparel', 'shirt', 'pants', 'dress'],
            3: ['food', 'beverage', 'snack', 'drink', 'meal'],
            4: ['office', 'supplies', 'paper', 'pen', 'desk'],
            5: ['tool', 'hardware', 'screw', 'bolt', 'wrench']
        }
        
        for category_id, keywords in category_keywords.items():
            if any(keyword in text for keyword in keywords):
                return {'category_id': category_id}
        
        return {'category_id': 1}  # Default category
    
    async def _calculate_demand_forecast(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate demand forecast for item"""
        # Simplified demand forecasting
        # In production, use proper ML models
        
        current_quantity = item.get('quantity', 0)
        historical_sales = item.get('historical_sales', [])
        
        if not historical_sales:
            # No historical data, use conservative estimate
            monthly_forecast = current_quantity * 0.1
        else:
            # Simple moving average
            monthly_forecast = sum(historical_sales[-3:]) / len(historical_sales[-3:])
        
        return {
            'demand_forecast': {
                'monthly': monthly_forecast,
                'weekly': monthly_forecast / 4,
                'daily': monthly_forecast / 30,
                'suggested_reorder_point': monthly_forecast * 0.5,
                'suggested_max_stock': monthly_forecast * 3
            }
        }
    
    async def _evaluate_supplier_performance(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate supplier performance"""
        # Simplified supplier evaluation
        # In production, use comprehensive metrics
        
        supplier_id = item.get('supplier_id')
        if not supplier_id:
            return None
        
        # Mock performance metrics
        performance_score = np.random.uniform(0.7, 1.0)  # Random score for demo
        
        return {
            'supplier_performance': {
                'supplier_id': supplier_id,
                'performance_score': performance_score,
                'rating': 'excellent' if performance_score > 0.9 else 'good' if performance_score > 0.8 else 'average',
                'last_evaluation': datetime.now(),
                'metrics': {
                    'on_time_delivery': performance_score * 0.9,
                    'quality_score': performance_score * 0.95,
                    'cost_effectiveness': performance_score * 0.85
                }
            }
        }
    
    async def create_custom_rule(self, rule_config: Dict[str, Any]) -> str:
        """Create a custom business rule"""
        try:
            rule_id = rule_config.get('id', f"custom_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
            
            # This is a simplified custom rule creation
            # In production, implement a proper rule DSL or use a rule engine
            
            if rule_id in self.rules_registry:
                raise ValueError(f"Rule {rule_id} already exists")
            
            # Basic rule structure validation
            required_fields = ['type', 'priority', 'condition', 'action']
            for field in required_fields:
                if field not in rule_config:
                    raise ValueError(f"Missing required field: {field}")
            
            # Register the rule
            self.register_rule(
                rule_id=rule_id,
                rule_type=RuleType(rule_config['type']),
                priority=RulePriority(rule_config['priority']),
                condition=self._create_condition_function(rule_config['condition']),
                action=self._create_action_function(rule_config['action']),
                description=rule_config.get('description', f"Custom rule {rule_id}")
            )
            
            return rule_id
            
        except Exception as e:
            logger.error(f"Custom rule creation failed: {str(e)}")
            raise
    
    def _create_condition_function(self, condition_config: Dict[str, Any]) -> Callable:
        """Create condition function from configuration"""
        def condition_func(item: Dict[str, Any]) -> bool:
            # Simplified condition evaluation
            # In production, implement proper expression evaluation
            field = condition_config.get('field')
            operator = condition_config.get('operator')
            value = condition_config.get('value')
            
            if not all([field, operator, value]):
                return False
            
            item_value = item.get(field)
            
            if operator == 'equals':
                return item_value == value
            elif operator == 'greater_than':
                return item_value > value
            elif operator == 'less_than':
                return item_value < value
            elif operator == 'contains':
                return value in str(item_value)
            else:
                return False
        
        return condition_func
    
    def _create_action_function(self, action_config: Dict[str, Any]) -> Callable:
        """Create action function from configuration"""
        async def action_func(item: Dict[str, Any]) -> Dict[str, Any]:
            # Simplified action execution
            # In production, implement proper action framework
            action_type = action_config.get('type')
            
            if action_type == 'set_field':
                field = action_config.get('field')
                value = action_config.get('value')
                return {field: value}
            elif action_type == 'calculate':
                # Implement calculation logic
                return {}
            else:
                return {}
        
        return action_func
    
    async def get_rules_summary(self) -> Dict[str, Any]:
        """Get summary of all rules"""
        try:
            summary = {
                'total_rules': len(self.rules_registry),
                'active_rules': sum(1 for rule in self.rules_registry.values() if rule['active']),
                'inactive_rules': sum(1 for rule in self.rules_registry.values() if not rule['active']),
                'rules_by_type': {},
                'rules_by_priority': {},
                'rules_list': []
            }
            
            for rule_id, rule in self.rules_registry.items():
                rule_type = rule['type'].value
                rule_priority = rule['priority'].value
                
                # Count by type
                if rule_type not in summary['rules_by_type']:
                    summary['rules_by_type'][rule_type] = 0
                summary['rules_by_type'][rule_type] += 1
                
                # Count by priority
                if rule_priority not in summary['rules_by_priority']:
                    summary['rules_by_priority'][rule_priority] = 0
                summary['rules_by_priority'][rule_priority] += 1
                
                # Add to rules list
                summary['rules_list'].append({
                    'id': rule_id,
                    'type': rule_type,
                    'priority': rule_priority,
                    'active': rule['active'],
                    'description': rule['description'],
                    'created_at': rule['created_at'].isoformat()
                })
            
            return summary
            
        except Exception as e:
            logger.error(f"Rules summary generation failed: {str(e)}")
            raise
    
    async def execute_rule_by_id(self, rule_id: str, item: Dict[str, Any]) -> RuleResult:
        """Execute a specific rule by ID"""
        try:
            if rule_id not in self.rules_registry:
                raise ValueError(f"Rule {rule_id} not found")
            
            rule = self.rules_registry[rule_id]
            
            if not rule['active']:
                return RuleResult(
                    rule_id=rule_id,
                    rule_name=rule['description'],
                    status='inactive',
                    message="Rule is inactive",
                    timestamp=datetime.now()
                )
            
            if rule['condition'](item):
                result = await rule['action'](item)
                return RuleResult(
                    rule_id=rule_id,
                    rule_name=rule['description'],
                    status='success',
                    message="Rule executed successfully",
                    data=result,
                    timestamp=datetime.now()
                )
            else:
                return RuleResult(
                    rule_id=rule_id,
                    rule_name=rule['description'],
                    status='not_applicable',
                    message="Rule condition not met",
                    timestamp=datetime.now()
                )
                
        except Exception as e:
            logger.error(f"Rule execution failed: {str(e)}")
            return RuleResult(
                rule_id=rule_id,
                rule_name=rule.get('description', 'Unknown Rule'),
                status='error',
                message=str(e),
                timestamp=datetime.now()
            )