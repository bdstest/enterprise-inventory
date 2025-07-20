"""
Multi-format ETL Engine for Enterprise Inventory Management System
Supports 9 formats: CSV, Excel, JSON, XML, YAML, TSV, Parquet, JSONL, PDF
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Union
from pathlib import Path
import json
import yaml
import xml.etree.ElementTree as ET
import PyPDF2
import openpyxl
from sqlalchemy.orm import Session
from datetime import datetime
import logging
from ..models import Item, Category, Supplier, Location, User
from ..database import get_db
from ..services.rules_engine import RulesEngine
import asyncio
from concurrent.futures import ThreadPoolExecutor
import aiofiles

logger = logging.getLogger(__name__)

class ETLEngine:
    """Advanced ETL Engine with AI-powered data processing"""
    
    def __init__(self, db_session: Session):
        self.db_session = db_session
        self.rules_engine = RulesEngine()
        self.supported_formats = {
            'csv': self._process_csv,
            'excel': self._process_excel,
            'json': self._process_json,
            'xml': self._process_xml,
            'yaml': self._process_yaml,
            'tsv': self._process_tsv,
            'parquet': self._process_parquet,
            'jsonl': self._process_jsonl,
            'pdf': self._process_pdf
        }
        
    async def import_data(self, file_path: str, format_type: str, 
                         mapping_config: Dict[str, Any] = None,
                         validation_rules: List[str] = None) -> Dict[str, Any]:
        """
        Import data from file with AI-powered validation and transformation
        
        Args:
            file_path: Path to the source file
            format_type: Format type (csv, excel, json, etc.)
            mapping_config: Field mapping configuration
            validation_rules: Custom validation rules
            
        Returns:
            Import result summary with statistics
        """
        try:
            logger.info(f"Starting import from {file_path} with format {format_type}")
            
            # Validate format support
            if format_type not in self.supported_formats:
                raise ValueError(f"Unsupported format: {format_type}")
            
            # Process file based on format
            processor = self.supported_formats[format_type]
            raw_data = await processor(file_path)
            
            # Apply AI-powered data transformation
            transformed_data = await self._apply_ai_transformation(raw_data, mapping_config)
            
            # Validate data using rules engine
            validated_data = await self._validate_data(transformed_data, validation_rules)
            
            # Import to database
            import_result = await self._import_to_database(validated_data)
            
            logger.info(f"Import completed successfully: {import_result}")
            return import_result
            
        except Exception as e:
            logger.error(f"Import failed: {str(e)}")
            raise
    
    async def export_data(self, format_type: str, filters: Dict[str, Any] = None,
                         output_path: str = None) -> str:
        """
        Export data to specified format with advanced filtering
        
        Args:
            format_type: Target format (csv, excel, json, etc.)
            filters: Data filtering criteria
            output_path: Output file path
            
        Returns:
            Path to exported file
        """
        try:
            logger.info(f"Starting export to format {format_type}")
            
            # Extract data from database
            data = await self._extract_data(filters)
            
            # Generate output path if not provided
            if not output_path:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                output_path = f"/tmp/inventory_export_{timestamp}.{format_type}"
            
            # Export based on format
            if format_type == 'csv':
                await self._export_csv(data, output_path)
            elif format_type == 'excel':
                await self._export_excel(data, output_path)
            elif format_type == 'json':
                await self._export_json(data, output_path)
            elif format_type == 'xml':
                await self._export_xml(data, output_path)
            elif format_type == 'yaml':
                await self._export_yaml(data, output_path)
            elif format_type == 'tsv':
                await self._export_tsv(data, output_path)
            elif format_type == 'parquet':
                await self._export_parquet(data, output_path)
            elif format_type == 'jsonl':
                await self._export_jsonl(data, output_path)
            elif format_type == 'pdf':
                await self._export_pdf(data, output_path)
            else:
                raise ValueError(f"Unsupported export format: {format_type}")
            
            logger.info(f"Export completed: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Export failed: {str(e)}")
            raise
    
    # Format-specific processors
    async def _process_csv(self, file_path: str) -> pd.DataFrame:
        """Process CSV files with intelligent delimiter detection"""
        try:
            # Try common delimiters
            delimiters = [',', ';', '|', '\t']
            for delimiter in delimiters:
                try:
                    df = pd.read_csv(file_path, delimiter=delimiter, encoding='utf-8')
                    if len(df.columns) > 1:
                        return df
                except:
                    continue
            
            # Fallback to default
            return pd.read_csv(file_path, encoding='utf-8')
        except Exception as e:
            logger.error(f"CSV processing failed: {str(e)}")
            raise
    
    async def _process_excel(self, file_path: str) -> pd.DataFrame:
        """Process Excel files with multi-sheet support"""
        try:
            # Read all sheets and combine
            excel_file = pd.ExcelFile(file_path)
            sheets_data = []
            
            for sheet_name in excel_file.sheet_names:
                df = pd.read_excel(file_path, sheet_name=sheet_name)
                df['source_sheet'] = sheet_name
                sheets_data.append(df)
            
            if len(sheets_data) == 1:
                return sheets_data[0]
            else:
                return pd.concat(sheets_data, ignore_index=True)
        except Exception as e:
            logger.error(f"Excel processing failed: {str(e)}")
            raise
    
    async def _process_json(self, file_path: str) -> pd.DataFrame:
        """Process JSON files with nested structure handling"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if isinstance(data, list):
                return pd.json_normalize(data)
            elif isinstance(data, dict):
                if 'data' in data:
                    return pd.json_normalize(data['data'])
                else:
                    return pd.json_normalize([data])
            else:
                raise ValueError("Invalid JSON structure")
        except Exception as e:
            logger.error(f"JSON processing failed: {str(e)}")
            raise
    
    async def _process_xml(self, file_path: str) -> pd.DataFrame:
        """Process XML files with intelligent structure detection"""
        try:
            tree = ET.parse(file_path)
            root = tree.getroot()
            
            # Extract data from XML structure
            data = []
            for item in root.findall('.//item') or root.findall('.//record') or root:
                record = {}
                for child in item:
                    record[child.tag] = child.text
                data.append(record)
            
            return pd.DataFrame(data)
        except Exception as e:
            logger.error(f"XML processing failed: {str(e)}")
            raise
    
    async def _process_yaml(self, file_path: str) -> pd.DataFrame:
        """Process YAML files"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
            
            if isinstance(data, list):
                return pd.DataFrame(data)
            elif isinstance(data, dict):
                if 'data' in data:
                    return pd.DataFrame(data['data'])
                else:
                    return pd.DataFrame([data])
            else:
                raise ValueError("Invalid YAML structure")
        except Exception as e:
            logger.error(f"YAML processing failed: {str(e)}")
            raise
    
    async def _process_tsv(self, file_path: str) -> pd.DataFrame:
        """Process TSV files"""
        try:
            return pd.read_csv(file_path, delimiter='\t', encoding='utf-8')
        except Exception as e:
            logger.error(f"TSV processing failed: {str(e)}")
            raise
    
    async def _process_parquet(self, file_path: str) -> pd.DataFrame:
        """Process Parquet files"""
        try:
            return pd.read_parquet(file_path)
        except Exception as e:
            logger.error(f"Parquet processing failed: {str(e)}")
            raise
    
    async def _process_jsonl(self, file_path: str) -> pd.DataFrame:
        """Process JSONL files"""
        try:
            data = []
            with open(file_path, 'r', encoding='utf-8') as f:
                for line in f:
                    data.append(json.loads(line.strip()))
            
            return pd.DataFrame(data)
        except Exception as e:
            logger.error(f"JSONL processing failed: {str(e)}")
            raise
    
    async def _process_pdf(self, file_path: str) -> pd.DataFrame:
        """Process PDF files with table extraction"""
        try:
            # This is a basic PDF text extraction
            # For production, consider using libraries like tabula-py or pdfplumber
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                text = ""
                for page in reader.pages:
                    text += page.extract_text()
            
            # Basic table detection (this is simplified)
            lines = text.split('\n')
            data = []
            for line in lines:
                if line.strip():
                    # Simple heuristic for table data
                    parts = line.split()
                    if len(parts) >= 2:
                        data.append(parts)
            
            if data:
                return pd.DataFrame(data[1:], columns=data[0] if data else [])
            else:
                return pd.DataFrame()
        except Exception as e:
            logger.error(f"PDF processing failed: {str(e)}")
            raise
    
    async def _apply_ai_transformation(self, data: pd.DataFrame, 
                                     mapping_config: Dict[str, Any] = None) -> pd.DataFrame:
        """Apply AI-powered data transformation and mapping"""
        try:
            transformed_data = data.copy()
            
            # Apply column mapping if provided
            if mapping_config and 'column_mapping' in mapping_config:
                transformed_data = transformed_data.rename(columns=mapping_config['column_mapping'])
            
            # AI-powered data cleaning
            transformed_data = await self._clean_data(transformed_data)
            
            # Apply business rules
            transformed_data = await self.rules_engine.apply_transformation_rules(transformed_data)
            
            return transformed_data
        except Exception as e:
            logger.error(f"AI transformation failed: {str(e)}")
            raise
    
    async def _clean_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """AI-powered data cleaning"""
        try:
            cleaned_data = data.copy()
            
            # Remove duplicates
            cleaned_data = cleaned_data.drop_duplicates()
            
            # Clean string columns
            string_columns = cleaned_data.select_dtypes(include=['object']).columns
            for col in string_columns:
                cleaned_data[col] = cleaned_data[col].astype(str).str.strip()
                cleaned_data[col] = cleaned_data[col].replace('nan', np.nan)
            
            # Handle missing values intelligently
            for col in cleaned_data.columns:
                if cleaned_data[col].dtype in ['int64', 'float64']:
                    cleaned_data[col] = cleaned_data[col].fillna(0)
                else:
                    cleaned_data[col] = cleaned_data[col].fillna('')
            
            return cleaned_data
        except Exception as e:
            logger.error(f"Data cleaning failed: {str(e)}")
            raise
    
    async def _validate_data(self, data: pd.DataFrame, 
                           validation_rules: List[str] = None) -> pd.DataFrame:
        """Validate data using rules engine"""
        try:
            # Apply validation rules
            validated_data = await self.rules_engine.validate_data(data, validation_rules)
            return validated_data
        except Exception as e:
            logger.error(f"Data validation failed: {str(e)}")
            raise
    
    async def _import_to_database(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Import validated data to database"""
        try:
            import_stats = {
                'total_records': len(data),
                'successful_imports': 0,
                'failed_imports': 0,
                'errors': []
            }
            
            for index, row in data.iterrows():
                try:
                    # Create item record
                    item = Item(
                        sku=row.get('sku', f'AUTO-{index}'),
                        name=row.get('name', ''),
                        description=row.get('description', ''),
                        quantity=int(row.get('quantity', 0)),
                        price=float(row.get('price', row.get('unit_price', 0.0))),
                        cost=float(row.get('cost', row.get('cost_price', 0.0))),
                        category_id=int(row.get('category_id', 1)) if row.get('category_id') else 1,
                        supplier_id=int(row.get('supplier_id')) if row.get('supplier_id') else None,
                        location_id=int(row.get('location_id')) if row.get('location_id') else None,
                        reorder_point=int(row.get('reorder_point', 10)),
                        max_stock=int(row.get('max_stock', 1000))
                    )
                    
                    self.db_session.add(item)
                    import_stats['successful_imports'] += 1
                    
                except Exception as e:
                    import_stats['failed_imports'] += 1
                    import_stats['errors'].append(f"Row {index}: {str(e)}")
            
            self.db_session.commit()
            return import_stats
            
        except Exception as e:
            self.db_session.rollback()
            logger.error(f"Database import failed: {str(e)}")
            raise
    
    async def _extract_data(self, filters: Dict[str, Any] = None) -> pd.DataFrame:
        """Extract data from database with filtering"""
        try:
            query = self.db_session.query(Item)
            
            # Apply filters
            if filters:
                if 'category_id' in filters:
                    query = query.filter(Item.category_id == filters['category_id'])
                if 'supplier_id' in filters:
                    query = query.filter(Item.supplier_id == filters['supplier_id'])
                if 'location_id' in filters:
                    query = query.filter(Item.location_id == filters['location_id'])
                if 'min_quantity' in filters:
                    query = query.filter(Item.quantity >= filters['min_quantity'])
                if 'max_quantity' in filters:
                    query = query.filter(Item.quantity <= filters['max_quantity'])
            
            items = query.all()
            
            # Convert to DataFrame
            data = []
            for item in items:
                data.append({
                    'id': item.id,
                    'sku': item.sku,
                    'name': item.name,
                    'description': item.description,
                    'quantity': item.quantity,
                    'price': item.price,
                    'category_id': item.category_id,
                    'supplier_id': item.supplier_id,
                    'location_id': item.location_id,
                    'created_at': item.created_at,
                    'updated_at': item.updated_at
                })
            
            return pd.DataFrame(data)
            
        except Exception as e:
            logger.error(f"Data extraction failed: {str(e)}")
            raise
    
    # Export methods
    async def _export_csv(self, data: pd.DataFrame, output_path: str):
        """Export to CSV format"""
        data.to_csv(output_path, index=False, encoding='utf-8')
    
    async def _export_excel(self, data: pd.DataFrame, output_path: str):
        """Export to Excel format with multiple sheets"""
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            data.to_excel(writer, sheet_name='Inventory', index=False)
            
            # Add summary sheet
            summary = pd.DataFrame({
                'Total Items': [len(data)],
                'Total Value': [data['unit_price'].sum() if 'unit_price' in data.columns else 0],
                'Export Date': [datetime.now().strftime("%Y-%m-%d %H:%M:%S")]
            })
            summary.to_excel(writer, sheet_name='Summary', index=False)
    
    async def _export_json(self, data: pd.DataFrame, output_path: str):
        """Export to JSON format"""
        data.to_json(output_path, orient='records', indent=2, date_format='iso')
    
    async def _export_xml(self, data: pd.DataFrame, output_path: str):
        """Export to XML format"""
        root = ET.Element('inventory')
        
        for _, row in data.iterrows():
            item = ET.SubElement(root, 'item')
            for col, value in row.items():
                elem = ET.SubElement(item, col)
                elem.text = str(value)
        
        tree = ET.ElementTree(root)
        tree.write(output_path, encoding='utf-8', xml_declaration=True)
    
    async def _export_yaml(self, data: pd.DataFrame, output_path: str):
        """Export to YAML format"""
        data_dict = data.to_dict('records')
        with open(output_path, 'w', encoding='utf-8') as f:
            yaml.dump(data_dict, f, default_flow_style=False)
    
    async def _export_tsv(self, data: pd.DataFrame, output_path: str):
        """Export to TSV format"""
        data.to_csv(output_path, sep='\t', index=False, encoding='utf-8')
    
    async def _export_parquet(self, data: pd.DataFrame, output_path: str):
        """Export to Parquet format"""
        data.to_parquet(output_path, index=False)
    
    async def _export_jsonl(self, data: pd.DataFrame, output_path: str):
        """Export to JSONL format"""
        with open(output_path, 'w', encoding='utf-8') as f:
            for _, row in data.iterrows():
                f.write(json.dumps(row.to_dict()) + '\n')
    
    async def _export_pdf(self, data: pd.DataFrame, output_path: str):
        """Export to PDF format (basic table)"""
        # This is a simplified PDF export
        # For production, consider using libraries like reportlab or matplotlib
        import matplotlib.pyplot as plt
        
        fig, ax = plt.subplots(figsize=(12, 8))
        ax.axis('tight')
        ax.axis('off')
        
        # Create table
        table_data = [data.columns.tolist()] + data.values.tolist()
        table = ax.table(cellText=table_data, loc='center', cellLoc='center')
        table.auto_set_font_size(False)
        table.set_fontsize(8)
        table.scale(1.2, 1.5)
        
        plt.title('Inventory Report', fontsize=16, fontweight='bold')
        plt.savefig(output_path, format='pdf', bbox_inches='tight')
        plt.close()
    
    async def get_import_template(self, format_type: str) -> str:
        """Generate import template for specified format"""
        try:
            template_data = pd.DataFrame({
                'sku': ['ITEM001', 'ITEM002'],
                'name': ['Sample Item 1', 'Sample Item 2'],
                'description': ['Description 1', 'Description 2'],
                'quantity': [100, 50],
                'unit_price': [10.99, 25.50],
                'category_id': [1, 2],
                'supplier_id': [1, 1],
                'location_id': [1, 2]
            })
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            template_path = f"/tmp/import_template_{timestamp}.{format_type}"
            
            # Export template
            await self.export_data(format_type, output_path=template_path)
            
            return template_path
            
        except Exception as e:
            logger.error(f"Template generation failed: {str(e)}")
            raise
    
    async def get_etl_statistics(self) -> Dict[str, Any]:
        """Get ETL processing statistics"""
        try:
            stats = {
                'supported_formats': list(self.supported_formats.keys()),
                'total_imports': 0,  # This would be tracked in a real system
                'total_exports': 0,  # This would be tracked in a real system
                'last_import': None,
                'last_export': None,
                'processing_status': 'ready'
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"Statistics generation failed: {str(e)}")
            raise