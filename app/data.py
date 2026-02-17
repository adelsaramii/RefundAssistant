"""
Data loading and management for refund cases.
"""
import csv
import os
from pathlib import Path
from typing import List
import random

from app.schemas import CaseData, ComplaintType


def generate_sample_dataset(filepath: str, num_cases: int = 50) -> None:
    """
    Generate a realistic sample dataset if CSV doesn't exist.
    
    Args:
        filepath: Path to save the CSV file
        num_cases: Number of sample cases to generate
    """
    # Ensure directory exists
    Path(filepath).parent.mkdir(parents=True, exist_ok=True)
    
    complaint_types = list(ComplaintType)
    
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            'case_id',
            'order_value',
            'delivery_delay_min',
            'restaurant_error_rate',
            'customer_refund_rate',
            'complaint_type',
            'photo_provided',
            'is_demo'
        ])
        
        for i in range(num_cases):
            case_id = f"CASE{i+1:04d}"
            order_value = round(random.uniform(10.0, 150.0), 2)
            delivery_delay_min = random.choice([
                random.randint(0, 15),      # On time or slightly late
                random.randint(15, 45),     # Moderately late
                random.randint(45, 120)     # Very late
            ])
            restaurant_error_rate = round(random.uniform(0.0, 0.5), 2)
            customer_refund_rate = round(random.uniform(0.0, 0.6), 2)
            complaint_type = random.choice(complaint_types).value
            photo_provided = random.choice([True, False])
            
            writer.writerow([
                case_id,
                order_value,
                delivery_delay_min,
                restaurant_error_rate,
                customer_refund_rate,
                complaint_type,
                photo_provided,
                False  # is_demo
            ])


def load_cases_from_csv(filepath: str) -> List[CaseData]:
    """
    Load cases from CSV file.
    
    Args:
        filepath: Path to the CSV file
        
    Returns:
        List of CaseData objects
    """
    if not os.path.exists(filepath):
        print(f"CSV not found at {filepath}. Generating sample dataset...")
        generate_sample_dataset(filepath)
    
    cases = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Handle is_demo field gracefully - default to False if not present
            is_demo = False
            if 'is_demo' in row:
                is_demo = row['is_demo'].lower() in ('true', '1', 'yes')
            
            # Handle complaint_text field gracefully - default to None if not present
            complaint_text = None
            if 'complaint_text' in row and row['complaint_text']:
                complaint_text = row['complaint_text']
            
            case = CaseData(
                case_id=row['case_id'],
                order_value=float(row['order_value']),
                delivery_delay_min=int(row['delivery_delay_min']),
                restaurant_error_rate=float(row['restaurant_error_rate']),
                customer_refund_rate=float(row['customer_refund_rate']),
                complaint_type=ComplaintType(row['complaint_type']),
                photo_provided=row['photo_provided'].lower() in ('true', '1', 'yes'),
                is_demo=is_demo,
                complaint_text=complaint_text
            )
            cases.append(case)
    
    return cases

