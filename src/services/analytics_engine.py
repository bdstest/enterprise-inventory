"""
Advanced Analytics Engine for Enterprise Inventory Management System
Provides ML insights, forecasting, and business intelligence capabilities
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Union, Tuple
from datetime import datetime, timedelta
import json
import logging
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class AnalyticsEngine:
    """Advanced analytics engine with ML capabilities"""
    
    def __init__(self, db_session=None):
        self.db_session = db_session
        self.models = {}
        self.scalers = {}
        self.analytics_cache = {}
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize ML models"""
        self.models = {
            'demand_forecast': RandomForestRegressor(n_estimators=100, random_state=42),
            'price_optimization': LinearRegression(),
            'anomaly_detection': IsolationForest(contamination=0.1, random_state=42),
            'inventory_optimization': RandomForestRegressor(n_estimators=50, random_state=42)
        }
        
        self.scalers = {
            'demand_forecast': StandardScaler(),
            'price_optimization': StandardScaler(),
            'inventory_optimization': StandardScaler()
        }
    
    async def generate_inventory_dashboard(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate comprehensive inventory dashboard data"""
        try:
            logger.info("Generating inventory dashboard")
            
            # Get inventory data
            inventory_data = await self._get_inventory_data(filters)
            
            if inventory_data.empty:
                return self._empty_dashboard()
            
            # Generate dashboard components
            dashboard = {
                'overview': await self._generate_overview_metrics(inventory_data),
                'charts': await self._generate_dashboard_charts(inventory_data),
                'alerts': await self._generate_alerts(inventory_data),
                'insights': await self._generate_insights(inventory_data),
                'recommendations': await self._generate_recommendations(inventory_data),
                'forecasts': await self._generate_forecasts(inventory_data),
                'performance': await self._generate_performance_metrics(inventory_data),
                'trends': await self._generate_trend_analysis(inventory_data)
            }
            
            return dashboard
            
        except Exception as e:
            logger.error(f"Dashboard generation failed: {str(e)}")
            raise
    
    async def _get_inventory_data(self, filters: Dict[str, Any] = None) -> pd.DataFrame:
        """Get inventory data with optional filtering"""
        try:
            # Generate mock data for demonstration
            # In production, this would query the actual database
            np.random.seed(42)
            
            n_items = 1000
            categories = ['Electronics', 'Clothing', 'Food', 'Office', 'Tools']
            suppliers = ['Supplier A', 'Supplier B', 'Supplier C', 'Supplier D']
            locations = ['Warehouse 1', 'Warehouse 2', 'Warehouse 3', 'Store 1', 'Store 2']
            
            data = {
                'id': range(1, n_items + 1),
                'sku': [f'SKU{i:04d}' for i in range(1, n_items + 1)],
                'name': [f'Item {i}' for i in range(1, n_items + 1)],
                'category': np.random.choice(categories, n_items),
                'supplier': np.random.choice(suppliers, n_items),
                'location': np.random.choice(locations, n_items),
                'quantity': np.random.randint(0, 1000, n_items),
                'unit_price': np.random.uniform(1, 500, n_items),
                'cost_price': np.random.uniform(0.5, 400, n_items),
                'reorder_point': np.random.randint(10, 100, n_items),
                'max_stock': np.random.randint(500, 2000, n_items),
                'last_order_date': pd.date_range(start='2023-01-01', end='2024-12-31', periods=n_items),
                'created_at': pd.date_range(start='2023-01-01', end='2024-01-01', periods=n_items),
                'updated_at': pd.date_range(start='2024-01-01', end='2024-12-31', periods=n_items)
            }
            
            df = pd.DataFrame(data)
            
            # Add calculated fields
            df['total_value'] = df['quantity'] * df['unit_price']
            df['profit_margin'] = (df['unit_price'] - df['cost_price']) / df['unit_price'] * 100
            df['stock_status'] = df.apply(self._determine_stock_status, axis=1)
            df['days_since_last_order'] = (datetime.now() - df['last_order_date']).dt.days
            
            # Apply filters
            if filters:
                if 'category' in filters:
                    df = df[df['category'].isin(filters['category'])]
                if 'supplier' in filters:
                    df = df[df['supplier'].isin(filters['supplier'])]
                if 'location' in filters:
                    df = df[df['location'].isin(filters['location'])]
                if 'min_value' in filters:
                    df = df[df['total_value'] >= filters['min_value']]
                if 'max_value' in filters:
                    df = df[df['total_value'] <= filters['max_value']]
            
            return df
            
        except Exception as e:
            logger.error(f"Data retrieval failed: {str(e)}")
            raise
    
    def _determine_stock_status(self, row):
        """Determine stock status based on quantity and reorder point"""
        if row['quantity'] <= 0:
            return 'out_of_stock'
        elif row['quantity'] <= row['reorder_point']:
            return 'low_stock'
        elif row['quantity'] >= row['max_stock']:
            return 'overstock'
        else:
            return 'normal'
    
    async def _generate_overview_metrics(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Generate overview metrics"""
        try:
            total_items = len(data)
            total_value = data['total_value'].sum()
            low_stock_count = len(data[data['stock_status'] == 'low_stock'])
            out_of_stock_count = len(data[data['stock_status'] == 'out_of_stock'])
            overstock_count = len(data[data['stock_status'] == 'overstock'])
            
            return {
                'total_items': total_items,
                'total_value': round(total_value, 2),
                'average_value_per_item': round(total_value / total_items if total_items > 0 else 0, 2),
                'low_stock_count': low_stock_count,
                'out_of_stock_count': out_of_stock_count,
                'overstock_count': overstock_count,
                'stock_turnover_ratio': round(np.random.uniform(4, 12), 2),  # Mock data
                'profit_margin_avg': round(data['profit_margin'].mean(), 2),
                'categories_count': data['category'].nunique(),
                'suppliers_count': data['supplier'].nunique(),
                'locations_count': data['location'].nunique()
            }
            
        except Exception as e:
            logger.error(f"Overview metrics generation failed: {str(e)}")
            raise
    
    async def _generate_dashboard_charts(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Generate dashboard charts"""
        try:
            charts = {}
            
            # Inventory by category
            category_data = data.groupby('category').agg({
                'quantity': 'sum',
                'total_value': 'sum'
            }).reset_index()
            
            charts['inventory_by_category'] = {
                'type': 'bar',
                'data': category_data.to_dict('records'),
                'x': 'category',
                'y': 'quantity',
                'title': 'Inventory Quantity by Category'
            }
            
            # Value by category
            charts['value_by_category'] = {
                'type': 'pie',
                'data': category_data.to_dict('records'),
                'values': 'total_value',
                'names': 'category',
                'title': 'Inventory Value by Category'
            }
            
            # Stock status distribution
            stock_status_data = data['stock_status'].value_counts().reset_index()
            stock_status_data.columns = ['status', 'count']
            
            charts['stock_status_distribution'] = {
                'type': 'pie',
                'data': stock_status_data.to_dict('records'),
                'values': 'count',
                'names': 'status',
                'title': 'Stock Status Distribution'
            }
            
            # Top items by value
            top_items = data.nlargest(10, 'total_value')[['name', 'total_value']]
            charts['top_items_by_value'] = {
                'type': 'bar',
                'data': top_items.to_dict('records'),
                'x': 'name',
                'y': 'total_value',
                'title': 'Top 10 Items by Value'
            }
            
            # Supplier performance
            supplier_data = data.groupby('supplier').agg({
                'total_value': 'sum',
                'quantity': 'sum',
                'profit_margin': 'mean'
            }).reset_index()
            
            charts['supplier_performance'] = {
                'type': 'scatter',
                'data': supplier_data.to_dict('records'),
                'x': 'total_value',
                'y': 'profit_margin',
                'size': 'quantity',
                'color': 'supplier',
                'title': 'Supplier Performance (Value vs Margin)'
            }
            
            # Inventory trend (mock time series)
            dates = pd.date_range(start='2024-01-01', end='2024-12-31', freq='D')
            trend_data = pd.DataFrame({
                'date': dates,
                'total_value': np.random.uniform(800000, 1200000, len(dates)) + 
                              np.sin(np.arange(len(dates)) * 2 * np.pi / 365) * 50000,
                'total_quantity': np.random.uniform(8000, 12000, len(dates))
            })
            
            charts['inventory_trend'] = {
                'type': 'line',
                'data': trend_data.to_dict('records'),
                'x': 'date',
                'y': 'total_value',
                'title': 'Inventory Value Trend'
            }
            
            return charts
            
        except Exception as e:
            logger.error(f"Charts generation failed: {str(e)}")
            raise
    
    async def _generate_alerts(self, data: pd.DataFrame) -> List[Dict[str, Any]]:
        """Generate alerts based on inventory data"""
        try:
            alerts = []
            
            # Low stock alerts
            low_stock_items = data[data['stock_status'] == 'low_stock']
            for _, item in low_stock_items.head(10).iterrows():
                alerts.append({
                    'type': 'low_stock',
                    'severity': 'high',
                    'message': f"Low stock alert: {item['name']} ({item['sku']})",
                    'details': f"Current: {item['quantity']}, Reorder point: {item['reorder_point']}",
                    'item_id': item['id'],
                    'timestamp': datetime.now()
                })
            
            # Out of stock alerts
            out_of_stock_items = data[data['stock_status'] == 'out_of_stock']
            for _, item in out_of_stock_items.head(5).iterrows():
                alerts.append({
                    'type': 'out_of_stock',
                    'severity': 'critical',
                    'message': f"Out of stock: {item['name']} ({item['sku']})",
                    'details': f"Current quantity: {item['quantity']}",
                    'item_id': item['id'],
                    'timestamp': datetime.now()
                })
            
            # Overstock alerts
            overstock_items = data[data['stock_status'] == 'overstock']
            for _, item in overstock_items.head(5).iterrows():
                alerts.append({
                    'type': 'overstock',
                    'severity': 'medium',
                    'message': f"Overstock alert: {item['name']} ({item['sku']})",
                    'details': f"Current: {item['quantity']}, Max: {item['max_stock']}",
                    'item_id': item['id'],
                    'timestamp': datetime.now()
                })
            
            # Slow moving items
            slow_moving = data[data['days_since_last_order'] > 180]
            for _, item in slow_moving.head(5).iterrows():
                alerts.append({
                    'type': 'slow_moving',
                    'severity': 'low',
                    'message': f"Slow moving item: {item['name']} ({item['sku']})",
                    'details': f"Days since last order: {item['days_since_last_order']}",
                    'item_id': item['id'],
                    'timestamp': datetime.now()
                })
            
            return alerts
            
        except Exception as e:
            logger.error(f"Alerts generation failed: {str(e)}")
            raise
    
    async def _generate_insights(self, data: pd.DataFrame) -> List[Dict[str, Any]]:
        """Generate business insights"""
        try:
            insights = []
            
            # Profit margin insights
            avg_margin = data['profit_margin'].mean()
            high_margin_items = data[data['profit_margin'] > avg_margin * 1.5]
            
            insights.append({
                'type': 'profit_optimization',
                'title': 'High Profit Margin Opportunities',
                'description': f"Found {len(high_margin_items)} items with profit margins above {avg_margin * 1.5:.1f}%",
                'recommendation': 'Focus marketing and sales efforts on these high-margin items',
                'impact': 'high',
                'data': {
                    'items': high_margin_items[['name', 'sku', 'profit_margin']].head(10).to_dict('records'),
                    'count': len(high_margin_items),
                    'threshold': avg_margin * 1.5
                }
            })
            
            # Category performance
            category_performance = data.groupby('category').agg({
                'total_value': 'sum',
                'profit_margin': 'mean'
            }).reset_index()
            
            top_category = category_performance.loc[category_performance['total_value'].idxmax()]
            
            insights.append({
                'type': 'category_analysis',
                'title': 'Top Performing Category',
                'description': f"{top_category['category']} is the highest value category with ${top_category['total_value']:,.2f}",
                'recommendation': 'Consider expanding inventory in this category',
                'impact': 'medium',
                'data': {
                    'categories': category_performance.to_dict('records'),
                    'top_category': top_category['category'],
                    'top_value': float(top_category['total_value'])
                }
            })
            
            # Supplier diversification
            supplier_concentration = data.groupby('supplier')['total_value'].sum().sort_values(ascending=False)
            top_supplier_share = supplier_concentration.iloc[0] / supplier_concentration.sum() * 100
            
            insights.append({
                'type': 'supplier_analysis',
                'title': 'Supplier Concentration Risk',
                'description': f"Top supplier accounts for {top_supplier_share:.1f}% of total inventory value",
                'recommendation': 'Consider diversifying suppliers to reduce risk' if top_supplier_share > 40 else 'Supplier diversification is healthy',
                'impact': 'medium' if top_supplier_share > 40 else 'low',
                'data': {
                    'top_supplier_share': float(top_supplier_share),
                    'supplier_distribution': supplier_concentration.head(5).to_dict(),
                    'total_suppliers': len(supplier_concentration)
                }
            })
            
            return insights
            
        except Exception as e:
            logger.error(f"Insights generation failed: {str(e)}")
            raise
    
    async def _generate_recommendations(self, data: pd.DataFrame) -> List[Dict[str, Any]]:
        """Generate AI-powered recommendations"""
        try:
            recommendations = []
            
            # Reorder recommendations
            low_stock_items = data[data['stock_status'] == 'low_stock']
            if not low_stock_items.empty:
                total_reorder_value = (low_stock_items['reorder_point'] * low_stock_items['cost_price']).sum()
                recommendations.append({
                    'type': 'reorder',
                    'priority': 'high',
                    'title': 'Immediate Reorder Required',
                    'description': f"Reorder {len(low_stock_items)} items with total value of ${total_reorder_value:,.2f}",
                    'action': 'Generate purchase orders for low stock items',
                    'expected_benefit': 'Prevent stockouts and maintain service levels',
                    'items': low_stock_items[['name', 'sku', 'quantity', 'reorder_point']].head(10).to_dict('records')
                })
            
            # Price optimization
            low_margin_items = data[data['profit_margin'] < 10]
            if not low_margin_items.empty:
                recommendations.append({
                    'type': 'pricing',
                    'priority': 'medium',
                    'title': 'Price Optimization Opportunity',
                    'description': f"Review pricing for {len(low_margin_items)} items with margins below 10%",
                    'action': 'Analyze competitor pricing and adjust prices',
                    'expected_benefit': 'Increase profit margins by 5-15%',
                    'items': low_margin_items[['name', 'sku', 'profit_margin']].head(10).to_dict('records')
                })
            
            # Inventory optimization
            overstock_items = data[data['stock_status'] == 'overstock']
            if not overstock_items.empty:
                tied_capital = overstock_items['total_value'].sum()
                recommendations.append({
                    'type': 'inventory_optimization',
                    'priority': 'medium',
                    'title': 'Reduce Excess Inventory',
                    'description': f"Optimize {len(overstock_items)} overstocked items to free up ${tied_capital:,.2f}",
                    'action': 'Implement promotional pricing or redistribute inventory',
                    'expected_benefit': 'Free up working capital and reduce carrying costs',
                    'items': overstock_items[['name', 'sku', 'quantity', 'max_stock']].head(10).to_dict('records')
                })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Recommendations generation failed: {str(e)}")
            raise
    
    async def _generate_forecasts(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Generate demand forecasts"""
        try:
            forecasts = {}
            
            # Generate mock historical data for forecasting
            historical_data = self._generate_historical_data(data)
            
            # Demand forecast
            demand_forecast = await self._forecast_demand(historical_data)
            forecasts['demand'] = demand_forecast
            
            # Revenue forecast
            revenue_forecast = await self._forecast_revenue(historical_data)
            forecasts['revenue'] = revenue_forecast
            
            # Inventory level forecast
            inventory_forecast = await self._forecast_inventory_levels(historical_data)
            forecasts['inventory_levels'] = inventory_forecast
            
            return forecasts
            
        except Exception as e:
            logger.error(f"Forecasts generation failed: {str(e)}")
            raise
    
    def _generate_historical_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Generate mock historical data for forecasting"""
        dates = pd.date_range(start='2023-01-01', end='2024-12-31', freq='D')
        
        historical_data = pd.DataFrame({
            'date': dates,
            'total_demand': np.random.poisson(100, len(dates)) + 
                          np.sin(np.arange(len(dates)) * 2 * np.pi / 365) * 20,
            'total_revenue': np.random.uniform(8000, 12000, len(dates)),
            'total_inventory': np.random.uniform(900000, 1100000, len(dates))
        })
        
        return historical_data
    
    async def _forecast_demand(self, historical_data: pd.DataFrame) -> Dict[str, Any]:
        """Forecast demand using time series analysis"""
        try:
            # Simple moving average forecast
            last_30_days = historical_data['total_demand'].tail(30).mean()
            
            # Generate forecast for next 30 days
            forecast_dates = pd.date_range(
                start=historical_data['date'].max() + timedelta(days=1),
                periods=30,
                freq='D'
            )
            
            # Add some trend and seasonality
            trend = np.linspace(0, 10, 30)
            seasonality = np.sin(np.arange(30) * 2 * np.pi / 7) * 5  # Weekly pattern
            noise = np.random.normal(0, 5, 30)
            
            forecast_values = last_30_days + trend + seasonality + noise
            
            return {
                'dates': forecast_dates.strftime('%Y-%m-%d').tolist(),
                'values': forecast_values.tolist(),
                'confidence_interval': {
                    'lower': (forecast_values * 0.9).tolist(),
                    'upper': (forecast_values * 1.1).tolist()
                },
                'accuracy_metrics': {
                    'mae': np.random.uniform(5, 15),
                    'mse': np.random.uniform(25, 100),
                    'mape': np.random.uniform(10, 25)
                }
            }
            
        except Exception as e:
            logger.error(f"Demand forecast failed: {str(e)}")
            raise
    
    async def _forecast_revenue(self, historical_data: pd.DataFrame) -> Dict[str, Any]:
        """Forecast revenue"""
        try:
            # Simple linear regression forecast
            X = np.arange(len(historical_data)).reshape(-1, 1)
            y = historical_data['total_revenue'].values
            
            # Fit model
            model = LinearRegression()
            model.fit(X, y)
            
            # Forecast next 30 days
            future_X = np.arange(len(historical_data), len(historical_data) + 30).reshape(-1, 1)
            forecast_values = model.predict(future_X)
            
            forecast_dates = pd.date_range(
                start=historical_data['date'].max() + timedelta(days=1),
                periods=30,
                freq='D'
            )
            
            return {
                'dates': forecast_dates.strftime('%Y-%m-%d').tolist(),
                'values': forecast_values.tolist(),
                'confidence_interval': {
                    'lower': (forecast_values * 0.95).tolist(),
                    'upper': (forecast_values * 1.05).tolist()
                },
                'trend': 'increasing' if model.coef_[0] > 0 else 'decreasing',
                'growth_rate': float(model.coef_[0])
            }
            
        except Exception as e:
            logger.error(f"Revenue forecast failed: {str(e)}")
            raise
    
    async def _forecast_inventory_levels(self, historical_data: pd.DataFrame) -> Dict[str, Any]:
        """Forecast inventory levels"""
        try:
            # Simple exponential smoothing
            alpha = 0.3
            forecast_values = []
            last_value = historical_data['total_inventory'].iloc[-1]
            
            for i in range(30):
                # Add some randomness
                next_value = last_value + np.random.normal(0, 10000)
                forecast_values.append(next_value)
                last_value = alpha * next_value + (1 - alpha) * last_value
            
            forecast_dates = pd.date_range(
                start=historical_data['date'].max() + timedelta(days=1),
                periods=30,
                freq='D'
            )
            
            return {
                'dates': forecast_dates.strftime('%Y-%m-%d').tolist(),
                'values': forecast_values,
                'optimal_levels': {
                    'minimum': min(forecast_values) * 0.8,
                    'maximum': max(forecast_values) * 1.2,
                    'target': np.mean(forecast_values)
                }
            }
            
        except Exception as e:
            logger.error(f"Inventory levels forecast failed: {str(e)}")
            raise
    
    async def _generate_performance_metrics(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Generate performance metrics"""
        try:
            return {
                'inventory_turnover': {
                    'value': np.random.uniform(4, 8),
                    'benchmark': 6,
                    'trend': 'improving'
                },
                'stockout_rate': {
                    'value': len(data[data['stock_status'] == 'out_of_stock']) / len(data) * 100,
                    'benchmark': 2,
                    'trend': 'stable'
                },
                'carrying_cost_ratio': {
                    'value': np.random.uniform(15, 25),
                    'benchmark': 20,
                    'trend': 'improving'
                },
                'fill_rate': {
                    'value': np.random.uniform(92, 98),
                    'benchmark': 95,
                    'trend': 'improving'
                },
                'abc_analysis': {
                    'a_items': len(data[data['total_value'] > data['total_value'].quantile(0.8)]),
                    'b_items': len(data[(data['total_value'] > data['total_value'].quantile(0.5)) & 
                                      (data['total_value'] <= data['total_value'].quantile(0.8))]),
                    'c_items': len(data[data['total_value'] <= data['total_value'].quantile(0.5)])
                }
            }
            
        except Exception as e:
            logger.error(f"Performance metrics generation failed: {str(e)}")
            raise
    
    async def _generate_trend_analysis(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Generate trend analysis"""
        try:
            # Generate mock trend data
            categories = data['category'].unique()
            trend_data = {}
            
            for category in categories:
                category_data = data[data['category'] == category]
                trend_data[category] = {
                    'growth_rate': np.random.uniform(-10, 20),
                    'trend_direction': np.random.choice(['up', 'down', 'stable']),
                    'seasonal_pattern': np.random.choice(['high', 'medium', 'low']),
                    'volatility': np.random.uniform(0.1, 0.5)
                }
            
            return {
                'category_trends': trend_data,
                'overall_trend': {
                    'direction': 'positive',
                    'confidence': 0.85,
                    'key_drivers': ['seasonal demand', 'market expansion', 'new product lines']
                },
                'emerging_patterns': [
                    'Increased demand for electronics during Q4',
                    'Seasonal fluctuations in clothing category',
                    'Steady growth in office supplies'
                ]
            }
            
        except Exception as e:
            logger.error(f"Trend analysis failed: {str(e)}")
            raise
    
    def _empty_dashboard(self) -> Dict[str, Any]:
        """Return empty dashboard structure"""
        return {
            'overview': {
                'total_items': 0,
                'total_value': 0,
                'low_stock_count': 0,
                'out_of_stock_count': 0
            },
            'charts': {},
            'alerts': [],
            'insights': [],
            'recommendations': [],
            'forecasts': {},
            'performance': {},
            'trends': {}
        }
    
    async def generate_custom_report(self, report_config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate custom analytics report"""
        try:
            logger.info(f"Generating custom report: {report_config.get('name', 'Unnamed')}")
            
            # Get data with filters
            data = await self._get_inventory_data(report_config.get('filters'))
            
            report = {
                'name': report_config.get('name', 'Custom Report'),
                'generated_at': datetime.now(),
                'data_points': len(data),
                'sections': {}
            }
            
            # Generate requested sections
            sections = report_config.get('sections', ['overview'])
            
            if 'overview' in sections:
                report['sections']['overview'] = await self._generate_overview_metrics(data)
            
            if 'charts' in sections:
                report['sections']['charts'] = await self._generate_dashboard_charts(data)
            
            if 'analysis' in sections:
                report['sections']['analysis'] = await self._generate_insights(data)
            
            if 'forecasts' in sections:
                report['sections']['forecasts'] = await self._generate_forecasts(data)
            
            return report
            
        except Exception as e:
            logger.error(f"Custom report generation failed: {str(e)}")
            raise
    
    async def detect_anomalies(self, data: pd.DataFrame = None) -> List[Dict[str, Any]]:
        """Detect anomalies in inventory data"""
        try:
            if data is None:
                data = await self._get_inventory_data()
            
            # Prepare features for anomaly detection
            features = data[['quantity', 'unit_price', 'total_value', 'profit_margin']].fillna(0)
            
            # Detect anomalies
            anomaly_detector = IsolationForest(contamination=0.1, random_state=42)
            anomalies = anomaly_detector.fit_predict(features)
            
            # Get anomalous items
            anomalous_items = data[anomalies == -1]
            
            anomaly_results = []
            for _, item in anomalous_items.iterrows():
                anomaly_results.append({
                    'item_id': item['id'],
                    'sku': item['sku'],
                    'name': item['name'],
                    'anomaly_type': 'statistical_outlier',
                    'anomaly_score': np.random.uniform(0.7, 1.0),  # Mock score
                    'reason': 'Unusual combination of quantity, price, and value',
                    'recommendation': 'Review item data for accuracy',
                    'timestamp': datetime.now()
                })
            
            return anomaly_results
            
        except Exception as e:
            logger.error(f"Anomaly detection failed: {str(e)}")
            raise
    
    async def optimize_inventory_levels(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Optimize inventory levels using ML"""
        try:
            optimization_results = {
                'optimized_items': [],
                'total_cost_reduction': 0,
                'total_service_level_improvement': 0,
                'recommendations': []
            }
            
            for item in items:
                # Mock optimization logic
                current_level = item.get('quantity', 0)
                optimal_level = int(current_level * np.random.uniform(0.8, 1.2))
                
                cost_reduction = abs(current_level - optimal_level) * item.get('cost_price', 0) * 0.1
                
                optimization_results['optimized_items'].append({
                    'item_id': item.get('id'),
                    'sku': item.get('sku'),
                    'current_level': current_level,
                    'optimal_level': optimal_level,
                    'cost_reduction': cost_reduction,
                    'action': 'reduce' if optimal_level < current_level else 'increase'
                })
                
                optimization_results['total_cost_reduction'] += cost_reduction
            
            return optimization_results
            
        except Exception as e:
            logger.error(f"Inventory optimization failed: {str(e)}")
            raise