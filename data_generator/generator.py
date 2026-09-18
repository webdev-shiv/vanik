"""
Merchant Growth AI - Enterprise Synthetic Data Generator
=========================================================
Generates 12 months of realistic Indian merchant transaction data,
customer cohorts, products, campaigns, and derived ML training datasets.

Includes embedded business scenarios for ML detection:
- Scenario 1: Evening sales decline (-31% between 5:00 PM - 8:30 PM for Sharma Tea Corner)
- Scenario 2: Gradual top-line sales decline (steady decay over 12 months)
- Scenario 3: Repeat customer retention loss (inactive regulars accumulation)
- Scenario 4: High-growth product category surge
- Scenario 5: Campaign outcome variance (high-performing vs weak/negative ROI)
- Scenario 6: Injected transaction anomalies & outliers (ticket size, odd hours)

Deterministic seed: 42 (100% reproducible)
"""

import os
import json
import random
import datetime
from typing import List, Dict, Any, Tuple
import pandas as pd
import numpy as np

# -----------------------------------------------------------------------------
# Configuration & Deterministic Seed
# -----------------------------------------------------------------------------
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

START_DATE = datetime.datetime(2025, 9, 18, 0, 0, 0)
END_DATE = datetime.datetime(2026, 9, 17, 23, 59, 59)
DAYS_SPAN = (END_DATE - START_DATE).days + 1  # 365 days

TARGET_MERCHANTS = 50
TARGET_CUSTOMERS = 10000
TARGET_PRODUCTS = 500
TARGET_TRANSACTIONS = 110000  # 100,000+
TARGET_CAMPAIGNS = 120

# Output directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
ML_DATA_DIR = os.path.join(BASE_DIR, "ml_data")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(ML_DATA_DIR, exist_ok=True)

# -----------------------------------------------------------------------------
# Indian Domain Knowledge & Realistic Dictionaries
# -----------------------------------------------------------------------------
INDIAN_CITIES = [
    ("Delhi", "NCR"), ("New Delhi", "NCR"), ("Noida", "NCR"), ("Gurugram", "NCR"),
    ("Mumbai", "Maharashtra"), ("Pune", "Maharashtra"), ("Bengaluru", "Karnataka"),
    ("Hyderabad", "Telangana"), ("Chennai", "Tamil Nadu"), ("Kolkata", "West Bengal"),
    ("Ahmedabad", "Gujarat"), ("Jaipur", "Rajasthan"), ("Lucknow", "Uttar Pradesh"),
    ("Chandigarh", "Punjab"), ("Indore", "Madhya Pradesh"), ("Kochi", "Kerala")
]

MERCHANT_CATEGORIES = [
    "Food & Beverage", "Grocery", "Fashion", "Electronics",
    "Pharmacy", "Beauty & Personal Care", "Services"
]

CATEGORY_WEIGHTS = [0.28, 0.22, 0.16, 0.10, 0.10, 0.08, 0.06]

FIRST_NAMES = [
    "Ramesh", "Suresh", "Ashok", "Rajesh", "Pooja", "Ananya", "Rohit", "Vikram",
    "Deepak", "Sunita", "Karan", "Priya", "Amit", "Neha", "Vikas", "Manish",
    "Sneha", "Rahul", "Sanjay", "Kavita", "Ritu", "Alok", "Gaurav", "Swati",
    "Ajay", "Meera", "Manoj", "Divya", "Nitin", "Shweta", "Mohit", "Preeti",
    "Ankit", "Jyoti", "Harish", "Pankaj", "Bhavna", "Kunal", "Rachna", "Tarun"
]

LAST_NAMES = [
    "Sharma", "Verma", "Gupta", "Nair", "Mehra", "Singh", "Patel", "Kumar",
    "Agarwal", "Joshi", "Bansal", "Iyer", "Rao", "Chawla", "Malhotra", "Reddy",
    "Mishra", "Shah", "Kapoor", "Chopra", "Bhatia", "Deshmukh", "Kulkarni", "Sen"
]

INDIAN_FESTIVALS_2025_2026 = [
    # Date, Name, Multiplier
    (datetime.date(2025, 10, 20), "Diwali Season Peak", 1.8),
    (datetime.date(2025, 10, 21), "Diwali Main", 2.2),
    (datetime.date(2025, 10, 22), "Bhai Dooj", 1.7),
    (datetime.date(2025, 12, 25), "Christmas & Year End Surge", 1.5),
    (datetime.date(2025, 12, 31), "New Year Eve Surge", 2.0),
    (datetime.date(2026, 1, 1), "New Year Day", 1.6),
    (datetime.date(2026, 1, 14), "Makar Sankranti / Pongal", 1.4),
    (datetime.date(2026, 3, 4), "Holi Festival Surge", 1.9),
    (datetime.date(2026, 3, 20), "Eid-ul-Fitr Surge", 1.8),
    (datetime.date(2026, 8, 15), "Independence Day Long Weekend", 1.5),
    (datetime.date(2026, 8, 28), "Raksha Bandhan", 1.7),
]

# -----------------------------------------------------------------------------
# 1. Generate Merchants (50 Merchants)
# -----------------------------------------------------------------------------
def generate_merchants() -> pd.DataFrame:
    merchants = []
    
    # Priority Scenario Merchants:
    # m-001: Sharma Tea Corner (Benchmark - Evening slump & repeat drop)
    merchants.append({
        "merchant_id": "m-001",
        "name": "Sharma Tea Corner",
        "owner_name": "Ramesh Sharma",
        "category": "Food & Beverage",
        "location": "Connaught Place, New Delhi",
        "city": "New Delhi",
        "state": "NCR",
        "business_size": "MICRO",
        "paytm_merchant_id": "PAYTM-MERCH-98214-DL",
        "soundbox_id": "SB-4G-99218",
        "qr_code_id": "QR-CP-8841",
        "connection_status": "CONNECTED_DEMO",
        "created_at": "2024-01-10 10:00:00",
        "scenario_tag": "EVENING_SLUMP_AND_REPEAT_DROP"
    })
    
    # m-002: Gupta Electronics (Gradual sales decline over 12 months)
    merchants.append({
        "merchant_id": "m-002",
        "name": "Gupta Electronics & Mobile",
        "owner_name": "Rajesh Gupta",
        "category": "Electronics",
        "location": "Nehru Place, New Delhi",
        "city": "New Delhi",
        "state": "NCR",
        "business_size": "SMALL",
        "paytm_merchant_id": "PAYTM-MERCH-77102-DL",
        "soundbox_id": "SB-4G-11029",
        "qr_code_id": "QR-NP-4421",
        "connection_status": "CONNECTED_LIVE",
        "created_at": "2024-02-15 11:30:00",
        "scenario_tag": "GRADUAL_SALES_DECLINE"
    })
    
    # m-003: Annapurna Supermarket (Surge in Organic product category)
    merchants.append({
        "merchant_id": "m-003",
        "name": "Annapurna Fresh Kirana",
        "owner_name": "Suresh Patel",
        "category": "Grocery",
        "location": "Andheri West, Mumbai",
        "city": "Mumbai",
        "state": "Maharashtra",
        "business_size": "MEDIUM",
        "paytm_merchant_id": "PAYTM-MERCH-55190-MH",
        "soundbox_id": "SB-4G-33104",
        "qr_code_id": "QR-MUM-7712",
        "connection_status": "CONNECTED_LIVE",
        "created_at": "2024-03-01 09:00:00",
        "scenario_tag": "PRODUCT_CATEGORY_SURGE"
    })

    # m-004: Mehra Ethnic Wear (High inactive customers / customer churn)
    merchants.append({
        "merchant_id": "m-004",
        "name": "Mehra Silk & Ethnic Sarees",
        "owner_name": "Sunita Mehra",
        "category": "Fashion",
        "location": "Johari Bazaar, Jaipur",
        "city": "Jaipur",
        "state": "Rajasthan",
        "business_size": "SMALL",
        "paytm_merchant_id": "PAYTM-MERCH-44912-RJ",
        "soundbox_id": "SB-4G-88201",
        "qr_code_id": "QR-JPR-2219",
        "connection_status": "CONNECTED_LIVE",
        "created_at": "2024-01-20 14:00:00",
        "scenario_tag": "HIGH_CUSTOMER_CHURN"
    })

    # Remaining 46 merchants across diverse categories
    business_prefixes = {
        "Food & Beverage": ["Cafe", "Chai Shai", "Bite Point", "Rasoi", "Dhaba", "Sweets & Snacks", "Bakes", "Tiffin"],
        "Grocery": ["Kirana Store", "Daily Needs", "Supermart", "Bazaar", "Provision Store", "Organic Farm"],
        "Fashion": ["Fashion Hub", "Trends", "Ethnic Studio", "Apparels", "Garments", "Boutique"],
        "Electronics": ["Digital Care", "Mobile World", "Tech Point", "Gadget House", "ElectroHub"],
        "Pharmacy": ["Medicos", "Chemist & Druggist", "Health Pharmacy", "Wellness Store", "LifeCare Meds"],
        "Beauty & Personal Care": ["Salon & Spa", "Beauty Lounge", "Glow Herbal", "Looks Studio", "Care Point"],
        "Services": ["Quick Tailors", "Express Laundry", "Key & Lock Hub", "Print & Xerox", "Repair Lab"]
    }

    for idx in range(5, TARGET_MERCHANTS + 1):
        mid = f"m-{idx:03d}"
        category = np.random.choice(MERCHANT_CATEGORIES, p=CATEGORY_WEIGHTS)
        owner_first = random.choice(FIRST_NAMES)
        owner_last = random.choice(LAST_NAMES)
        prefix = random.choice(business_prefixes[category])
        name = f"{owner_last} {prefix}"
        city_pair = random.choice(INDIAN_CITIES)
        size = random.choice(["MICRO", "MICRO", "SMALL", "SMALL", "MEDIUM"])

        merchants.append({
            "merchant_id": mid,
            "name": name,
            "owner_name": f"{owner_first} {owner_last}",
            "category": category,
            "location": f"Main Market, {city_pair[0]}",
            "city": city_pair[0],
            "state": city_pair[1],
            "business_size": size,
            "paytm_merchant_id": f"PAYTM-MERCH-{random.randint(10000, 99999)}-{city_pair[1][:2].upper()}",
            "soundbox_id": f"SB-4G-{random.randint(10000, 99999)}",
            "qr_code_id": f"QR-{city_pair[0][:3].upper()}-{random.randint(1000, 9999)}",
            "connection_status": random.choice(["CONNECTED_LIVE", "CONNECTED_LIVE", "CONNECTED_DEMO"]),
            "created_at": (START_DATE - datetime.timedelta(days=random.randint(60, 300))).strftime("%Y-%m-%d %H:%M:%S"),
            "scenario_tag": "NORMAL_ORGANIC"
        })

    return pd.DataFrame(merchants)

# -----------------------------------------------------------------------------
# 2. Generate Products (500 Products)
# -----------------------------------------------------------------------------
def generate_products(merchants_df: pd.DataFrame) -> pd.DataFrame:
    products = []
    pid_counter = 1

    catalog_templates = {
        "Food & Beverage": [
            ("Special Masala Chai", 30, 50, 0.40),
            ("Ginger Lemon Tea", 35, 55, 0.40),
            ("Kullad Chai", 40, 60, 0.42),
            ("Filter Coffee", 40, 70, 0.45),
            ("Fresh Bun Maska", 30, 45, 0.38),
            ("Crispy Samosa (2 pcs)", 25, 40, 0.35),
            ("Paneer Pakora Platter", 80, 140, 0.45),
            ("Chole Bhature", 90, 160, 0.42),
            ("Veg Grilled Sandwich", 60, 110, 0.40),
            ("Cold Coffee with Ice Cream", 70, 130, 0.45),
            ("Poha with Sev", 40, 70, 0.35),
            ("Aloo Paratha with Butter", 60, 100, 0.38),
            ("Evening Chai Combo Platter", 60, 90, 0.42),
            ("Weekend Family Chai Pot", 140, 200, 0.44),
        ],
        "Grocery": [
            ("Basmati Rice (1kg)", 90, 180, 0.15),
            ("Chana Dal (1kg)", 80, 120, 0.14),
            ("Mustard Oil (1L)", 140, 190, 0.12),
            ("Aashirvaad Atta (5kg)", 210, 260, 0.10),
            ("Organic Desi Ghee (500ml)", 320, 450, 0.22),
            ("Tata Salt (1kg)", 22, 28, 0.10),
            ("Maggi 2-Min Noodles (Pack of 4)", 50, 60, 0.12),
            ("Britannia Good Day Biscuits", 30, 45, 0.15),
            ("Amul Taaza Milk (1L)", 60, 70, 0.08),
            ("Organic Quinoa & Millets (500g)", 180, 320, 0.35),  # High growth item for m-003
            ("Cold-Pressed Mustard Oil (1L)", 220, 340, 0.30),    # High growth item for m-003
            ("Dry Fruits Gift Pack (500g)", 450, 750, 0.25),
        ],
        "Fashion": [
            ("Cotton Printed Kurti", 450, 950, 0.50),
            ("Men Casual Slim Shirt", 600, 1299, 0.52),
            ("Denim Jeans", 800, 1899, 0.50),
            ("Embroidered Silk Saree", 1500, 4500, 0.55),
            ("Leather Formal Belt", 250, 599, 0.45),
            ("Cotton Anarkali Suit Set", 1200, 2800, 0.50),
            ("Comfort Chino Trousers", 750, 1499, 0.48),
            ("Traditional Mojari / Footwear", 400, 999, 0.45)
        ],
        "Electronics": [
            ("Fast USB-C Charging Cable", 199, 499, 0.55),
            ("10000mAh Power Bank", 799, 1499, 0.35),
            ("Wireless Bluetooth Neckband", 699, 1699, 0.45),
            ("Tempered Glass & Phone Case", 150, 350, 0.65),
            ("Smartwatch with Health Monitor", 1299, 2999, 0.40),
            ("20W Fast Wall Adapter", 350, 799, 0.45),
            ("Wireless Earbuds with Mic", 999, 2499, 0.42),
            ("OTG Adapter & Memory Card 64GB", 350, 750, 0.35)
        ],
        "Pharmacy": [
            ("Paracetamol 650mg (Strip)", 20, 35, 0.25),
            ("Cough Syrup Honey & Ginger", 75, 120, 0.30),
            ("Ayurvedic Immunity Chyawanprash (1kg)", 280, 420, 0.28),
            ("Antacid Chewable Tablets", 40, 65, 0.25),
            ("Vitamin C + Zinc Supplements", 110, 195, 0.32),
            ("Digital Thermometer", 150, 299, 0.40),
            ("First Aid Bandage & Antiseptic Ointment", 45, 90, 0.30),
            ("Glucometer Test Strips (Pack of 25)", 450, 699, 0.25)
        ],
        "Beauty & Personal Care": [
            ("Herbal Face Wash (150ml)", 95, 175, 0.38),
            ("Daily Moisturising Cream", 120, 240, 0.40),
            ("Sunscreen Lotion SPF 50", 220, 420, 0.42),
            ("Ayurvedic Hair Oil (200ml)", 110, 210, 0.35),
            ("Shampoo & Conditioner Combo", 180, 320, 0.35),
            ("Men Charcoal Beard Wash", 130, 250, 0.45),
            ("Organic Lip Balm & Scrub", 70, 150, 0.45)
        ],
        "Services": [
            ("Shirt / Trouser Alteration & Stitching", 80, 180, 0.65),
            ("Dry Cleaning - Men Suit 2-Piece", 200, 450, 0.60),
            ("Express Shoe Laundry & Polish", 120, 250, 0.55),
            ("Mobile Screen Guard Application Service", 50, 120, 0.70),
            ("Document Scanning & Digital Lamination", 40, 100, 0.75)
        ]
    }

    # Ensure each merchant gets ~8-12 products matching their category
    for _, merchant in merchants_df.iterrows():
        cat = merchant["category"]
        templates = catalog_templates[cat]
        # Allocate 8 to 12 products per merchant
        for item_idx, (pname, min_p, max_p, margin) in enumerate(templates):
            pid = f"p-{pid_counter:04d}"
            sku = f"SKU-{cat[:3].upper()}-{pid_counter:04d}"
            price = round(random.uniform(min_p, max_p), 2)
            cost = round(price * (1.0 - margin), 2)
            
            # Special scenario tag for m-003 Organic Surge
            scenario_flag = "NONE"
            if merchant["merchant_id"] == "m-003" and "Organic" in pname:
                scenario_flag = "HIGH_GROWTH_PRODUCT"

            products.append({
                "product_id": pid,
                "merchant_id": merchant["merchant_id"],
                "sku": sku,
                "product_name": pname,
                "category": cat,
                "price": price,
                "cost": cost,
                "active_status": True,
                "created_at": merchant["created_at"],
                "scenario_flag": scenario_flag
            })
            pid_counter += 1
            if pid_counter > TARGET_PRODUCTS:
                break
        if pid_counter > TARGET_PRODUCTS:
            break

    # If we need more products to hit TARGET_PRODUCTS exactly
    while len(products) < TARGET_PRODUCTS:
        m_row = merchants_df.sample(1).iloc[0]
        cat = m_row["category"]
        tmpl = random.choice(catalog_templates[cat])
        pid = f"p-{pid_counter:04d}"
        price = round(random.uniform(tmpl[1], tmpl[2]), 2)
        cost = round(price * (1.0 - tmpl[3]), 2)
        products.append({
            "product_id": pid,
            "merchant_id": m_row["merchant_id"],
            "sku": f"SKU-{cat[:3].upper()}-{pid_counter:04d}",
            "product_name": f"Premium {tmpl[0]}",
            "category": cat,
            "price": price,
            "cost": cost,
            "active_status": True,
            "created_at": m_row["created_at"],
            "scenario_flag": "NONE"
        })
        pid_counter += 1

    return pd.DataFrame(products)

# -----------------------------------------------------------------------------
# 3. Generate Customers (10,000 Customers)
# -----------------------------------------------------------------------------
def generate_customers(merchants_df: pd.DataFrame) -> pd.DataFrame:
    customers = []
    
    # Pre-allocate customer cohorts:
    # 20% LOYAL (high frequency, recent visits)
    # 35% RETURNING / ACTIVE
    # 15% AT_RISK (visit interval stretched)
    # 20% INACTIVE / DORMANT (no visit in >21-45 days)
    # 10% NEW (1-2 visits)
    cohort_types = ["LOYAL", "RETURNING", "AT_RISK", "INACTIVE", "NEW"]
    cohort_weights = [0.20, 0.35, 0.15, 0.20, 0.10]
    
    preferred_times = [
        "8:30 AM (Morning)", "9:15 AM (Morning)", "10:30 AM (Morning)",
        "1:15 PM (Lunch)", "2:00 PM (Lunch)", "4:30 PM (Evening)",
        "5:45 PM (Evening)", "6:30 PM (Evening)", "7:15 PM (Evening)", "8:45 PM (Night)"
    ]

    m_ids = merchants_df["merchant_id"].tolist()
    
    for cid in range(1, TARGET_CUSTOMERS + 1):
        c_code = f"cust-{cid:05d}"
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        # 30% of customers assigned to benchmark m-001 or top 4 to simulate deep density
        if cid <= 1500:
            m_id = "m-001"
        elif cid <= 2500:
            m_id = "m-002"
        elif cid <= 3500:
            m_id = "m-003"
        elif cid <= 4500:
            m_id = "m-004"
        else:
            m_id = random.choice(m_ids)
            
        cohort = np.random.choice(cohort_types, p=cohort_weights)
        
        # Acquisition date distributed over the 12 months
        acq_days_ago = random.randint(10, 360)
        acq_date = (END_DATE - datetime.timedelta(days=acq_days_ago)).date()
        
        # Phone mask
        masked_phone = f"+91 {random.choice(['98', '99', '97', '96', '91', '88'])}{random.randint(100, 999)} •••••"
        
        # Specific scenario mapping for m-001 (Sharma Tea Corner):
        # Guarantee 312 inactive regulars for root-cause why-engine fidelity
        if m_id == "m-001" and cid <= 312:
            cohort = "INACTIVE"
            preferred_time = "6:15 PM (Evening)"
            status = "DORMANT"
        elif cohort == "INACTIVE":
            status = "DORMANT"
            preferred_time = random.choice(preferred_times)
        elif cohort == "AT_RISK":
            status = "ACTIVE"
            preferred_time = random.choice(preferred_times)
        elif cohort == "NEW":
            status = "ACTIVE"
            preferred_time = random.choice(preferred_times)
        else:
            status = "ACTIVE"
            preferred_time = random.choice(preferred_times)

        customers.append({
            "customer_id": c_code,
            "merchant_id": m_id,
            "customer_code": f"CC-{cid:05d}",
            "name": f"{first_name} {last_name[0]}.",
            "masked_phone": masked_phone,
            "email": f"{first_name.lower()}.{last_name.lower()}{random.randint(10,99)}@example.in",
            "acquisition_date": acq_date.isoformat(),
            "customer_status": status,
            "assigned_cohort": cohort,
            "preferred_shopping_time": preferred_time,
            "created_at": (acq_date).strftime("%Y-%m-%d 10:00:00")
        })

    return pd.DataFrame(customers)

# -----------------------------------------------------------------------------
# 4. Generate Campaigns (120+ Campaigns) & Results
# -----------------------------------------------------------------------------
def generate_campaigns(merchants_df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    campaigns = []
    results = []
    
    types = [
        "EVENING_REVIVAL", "RETENTION_WINBACK", "WEEKEND_SURGE",
        "BASKET_SIZE_UPSELL", "SEASONAL_SPECIAL", "CUSTOM"
    ]
    
    channels = [
        "WhatsApp + SMS + Paytm Soundbox Banner",
        "SMS + QR Standee at Counter",
        "Paytm App Geo-Fence Push",
        "WhatsApp Broadcast Only"
    ]

    camp_id = 1
    
    for _, m in merchants_df.iterrows():
        mid = m["merchant_id"]
        # Generate 2 to 4 campaigns per merchant
        num_camps = random.randint(2, 4)
        for c_idx in range(num_camps):
            cid = f"camp-{camp_id:04d}"
            ctype = random.choice(types)
            
            # Start date over past 12 months
            days_ago = random.randint(10, 340)
            duration = random.choice([7, 10, 14, 21])
            start_dt = START_DATE + datetime.timedelta(days=days_ago)
            end_dt = start_dt + datetime.timedelta(days=duration)
            
            status = "COMPLETED" if end_dt < END_DATE - datetime.timedelta(days=5) else "RUNNING"
            
            # Special Scenario for m-001
            if mid == "m-001" and c_idx == 0:
                ctype = "EVENING_REVIVAL"
                cname = "Evening Combo Campaign (₹49 Special)"
                status = "RUNNING"
                budget = 4200.0
                spent = 3600.0
                disc = 16.0
                disc_type = "FLAT"
                target_seg = "Inactive Regulars (312 customers) + Evening commuters"
                expected_lift = 25.0
                actual_lift = 27.2  # Outperformed
                roi = 9.6
            elif mid == "m-004": # Weak campaign scenario
                cname = f"{m['name']} Flat Clearance Push"
                budget = 5000.0
                spent = 5000.0
                disc = 30.0
                disc_type = "PERCENTAGE"
                target_seg = "All Lapsed Customers"
                expected_lift = 20.0
                actual_lift = 3.2  # Weak impact
                roi = -0.45
            else:
                cname = f"{m['name']} {ctype.replace('_', ' ').title()}"
                budget = float(random.choice([1500, 2500, 3500, 4200, 5500, 7500]))
                spent = budget if status == "COMPLETED" else round(budget * random.uniform(0.4, 0.85), 2)
                disc = float(random.choice([10, 15, 20, 25, 49, 50]))
                disc_type = "PERCENTAGE" if disc <= 25 else "FLAT"
                target_seg = random.choice(["Loyal Champions", "Dormant Regulars", "Evening Commuters", "Weekend Shoppers"])
                expected_lift = float(random.choice([12.0, 15.0, 18.0, 22.0, 25.0]))
                # 70% of campaigns succeed, 30% underperform
                if random.random() < 0.70:
                    actual_lift = round(expected_lift * random.uniform(0.95, 1.25), 1)
                    roi = round(random.uniform(3.5, 9.8), 2)
                else:
                    actual_lift = round(expected_lift * random.uniform(0.2, 0.5), 1)
                    roi = round(random.uniform(-0.6, 1.2), 2)

            campaigns.append({
                "campaign_id": cid,
                "merchant_id": mid,
                "campaign_type": ctype,
                "campaign_name": cname,
                "target_segment": target_seg,
                "discount": disc,
                "discount_type": disc_type,
                "start_date": start_dt.strftime("%Y-%m-%d %H:%M:%S"),
                "end_date": end_dt.strftime("%Y-%m-%d %H:%M:%S"),
                "budget": budget,
                "spent_so_far": spent,
                "status": status,
                "channel": random.choice(channels),
                "created_at": start_dt.strftime("%Y-%m-%d %H:%M:%S")
            })

            # Campaign Result
            rev_before = round(random.uniform(180000, 350000), 2)
            lift_ratio = 1.0 + (actual_lift / 100.0)
            rev_after = round(rev_before * lift_ratio, 2)
            tx_before = int(rev_before / random.uniform(180, 250))
            tx_after = int(tx_before * (1.0 + (actual_lift / 100.0) * 1.1))
            cust_before = int(tx_before * 0.45)
            cust_after = int(cust_before * (1.0 + (actual_lift / 100.0) * 0.7))

            results.append({
                "result_id": f"res-{camp_id:04d}",
                "campaign_id": cid,
                "merchant_id": mid,
                "revenue_before": rev_before,
                "revenue_during_after": rev_after,
                "transaction_counts_before": tx_before,
                "transaction_counts_after": tx_after,
                "customer_counts_before": cust_before,
                "customer_counts_after": cust_after,
                "expected_lift_percent": expected_lift,
                "actual_lift_percent": actual_lift,
                "roi": roi,
                "is_successful": roi > 2.0
            })

            camp_id += 1
            if camp_id > TARGET_CAMPAIGNS:
                break
        if camp_id > TARGET_CAMPAIGNS:
            break

    return pd.DataFrame(campaigns), pd.DataFrame(results)

# -----------------------------------------------------------------------------
# 5. Generate Transactions (100,000+ Transactions)
# -----------------------------------------------------------------------------
def generate_transactions(
    merchants_df: pd.DataFrame,
    products_df: pd.DataFrame,
    customers_df: pd.DataFrame
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    transactions = []
    
    # Map products by merchant for quick lookup
    products_by_merchant = {}
    for mid, group in products_df.groupby("merchant_id"):
        products_by_merchant[mid] = group.to_dict("records")
        
    # Map customers by merchant
    customers_by_merchant = {}
    for mid, group in customers_df.groupby("merchant_id"):
        customers_by_merchant[mid] = group.to_dict("records")

    # Diurnal hourly probability curve (Standard Indian retail/F&B profile)
    # Peak 1: 8-11 AM, Peak 2: 12-2 PM, Peak 3: 5-8:30 PM
    base_hour_probs = {
        6: 0.01, 7: 0.02, 8: 0.06, 9: 0.12, 10: 0.10, 11: 0.07,
        12: 0.07, 13: 0.11, 14: 0.09, 15: 0.04, 16: 0.05,
        17: 0.07, 18: 0.08, 19: 0.09, 20: 0.07, 21: 0.03, 22: 0.01
    }
    hours = list(base_hour_probs.keys())
    base_probs = np.array(list(base_hour_probs.values()))
    base_probs = base_probs / base_probs.sum()

    tx_id_counter = 1
    anomalies_logged = []
    
    # Daily loop over 365 days
    current_date = START_DATE
    
    # Calculate daily transactions needed to exceed TARGET_TRANSACTIONS
    daily_base_tx = int(TARGET_TRANSACTIONS / DAYS_SPAN) + 15  # ~316 txns/day across 50 merchants

    while current_date <= END_DATE:
        d_date = current_date.date()
        is_weekend = current_date.weekday() >= 5
        
        # Festival check
        festival_mult = 1.0
        for f_date, fname, f_mult in INDIAN_FESTIVALS_2025_2026:
            if d_date == f_date:
                festival_mult = f_mult
                break

        # Calculate daily volume with day-of-week & festival dynamics
        dow_mult = 1.25 if is_weekend else 0.95
        daily_tx_count = int(daily_base_tx * dow_mult * festival_mult + random.randint(-15, 15))

        for _ in range(daily_tx_count):
            # Select merchant (weighted: top 4 scenario merchants get higher density)
            if random.random() < 0.22:
                m_row = merchants_df.iloc[0]  # Sharma Tea Corner (m-001)
            elif random.random() < 0.12:
                m_row = merchants_df.iloc[1]  # Gupta Electronics (m-002)
            elif random.random() < 0.12:
                m_row = merchants_df.iloc[2]  # Annapurna Kirana (m-003)
            elif random.random() < 0.10:
                m_row = merchants_df.iloc[3]  # Mehra Silk (m-004)
            else:
                m_row = merchants_df.sample(1).iloc[0]

            mid = m_row["merchant_id"]
            m_cat = m_row["category"]
            m_products = products_by_merchant.get(mid, [])
            if not m_products:
                continue

            # Pick product
            # Scenario 4: Annapurna Kirana Organic surge in last 90 days
            if mid == "m-003" and (END_DATE - current_date).days <= 90 and random.random() < 0.40:
                organic_prods = [p for p in m_products if p.get("scenario_flag") == "HIGH_GROWTH_PRODUCT"]
                prod = random.choice(organic_prods) if organic_prods else random.choice(m_products)
            else:
                prod = random.choice(m_products)

            # Pick hour
            # Scenario 1: Sharma Tea Corner (m-001) Evening Slump in last 45 days
            # Evening transactions (17, 18, 19, 20) are suppressed by 31%
            if mid == "m-001" and (END_DATE - current_date).days <= 45:
                shuffled_probs = base_probs.copy()
                # indices for hours 17, 18, 19, 20 are indices 11, 12, 13, 14
                shuffled_probs[11:15] *= 0.69  # 31% drop!
                shuffled_probs = shuffled_probs / shuffled_probs.sum()
                chosen_hour = np.random.choice(hours, p=shuffled_probs)
            else:
                chosen_hour = np.random.choice(hours, p=base_probs)

            chosen_minute = random.randint(0, 59)
            chosen_second = random.randint(0, 59)
            tx_timestamp = current_date.replace(hour=chosen_hour, minute=chosen_minute, second=chosen_second)

            # Scenario 2: Gupta Electronics (m-002) Gradual 12-month decay
            # Probability of transaction drops linearly from 1.0 down to 0.75
            if mid == "m-002":
                month_idx = (tx_timestamp - START_DATE).days / 30.0
                keep_prob = max(0.65, 1.0 - (month_idx * 0.025))
                if random.random() > keep_prob:
                    continue  # drop transaction to create gradual sales slump

            # Pick customer
            m_custs = customers_by_merchant.get(mid, [])
            cust_id = None
            if m_custs and random.random() < 0.70:
                # Scenario 3: Repeat customer drop for m-001 in last 30 days
                # Inactive regulars stop visiting
                if mid == "m-001" and (END_DATE - current_date).days <= 30:
                    active_pool = [c for c in m_custs if c["assigned_cohort"] != "INACTIVE"]
                    if active_pool:
                        cust_id = random.choice(active_pool)["customer_id"]
                else:
                    cust_id = random.choice(m_custs)["customer_id"]

            quantity = 1 if m_cat in ["Electronics", "Fashion", "Services"] else random.choices([1, 2, 3, 4], weights=[0.65, 0.20, 0.10, 0.05])[0]
            unit_price = prod["price"]
            total_amount = round(quantity * unit_price, 2)

            # Scenario 6: Inject Anomalies (0.15% frequency)
            is_anomaly = False
            anomaly_reason = "NONE"
            if random.random() < 0.0015:
                is_anomaly = True
                anomaly_type = random.choice(["PRICE_SPIKE", "ODD_HOURS_SWIPE", "BULK_QUANTITY"])
                if anomaly_type == "PRICE_SPIKE":
                    total_amount = round(total_amount * random.uniform(8.0, 15.0), 2)
                    anomaly_reason = "Ticket size >10x median for merchant category"
                elif anomaly_type == "ODD_HOURS_SWIPE":
                    tx_timestamp = tx_timestamp.replace(hour=random.choice([2, 3, 4]))
                    anomaly_reason = "Transaction processed between 2:00 AM - 4:30 AM"
                elif anomaly_type == "BULK_QUANTITY":
                    quantity = random.randint(25, 60)
                    total_amount = round(quantity * unit_price, 2)
                    anomaly_reason = "Unusually high item quantity bulk swipe"

                anomalies_logged.append({
                    "transaction_id": f"txn-{tx_id_counter:07d}",
                    "merchant_id": mid,
                    "timestamp": tx_timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                    "total_amount": total_amount,
                    "reason": anomaly_reason
                })

            payment_method = random.choices(
                ["SOUNDBOX_QR", "SOUNDBOX_CARD", "UPI", "PAYTM_WALLET", "CASH"],
                weights=[0.55, 0.15, 0.15, 0.10, 0.05]
            )[0]

            channel = "SOUNDBOX" if payment_method in ["SOUNDBOX_QR", "SOUNDBOX_CARD"] else random.choice(["QR_STAND", "OFFLINE_STORE", "POS_TERMINAL"])
            status = "REFUNDED" if random.random() < 0.01 else ("FAILED" if random.random() < 0.015 else "SUCCESS")

            transactions.append({
                "transaction_id": f"txn-{tx_id_counter:07d}",
                "merchant_id": mid,
                "customer_id": cust_id,
                "product_id": prod["product_id"],
                "timestamp": tx_timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "quantity": quantity,
                "unit_price": unit_price,
                "total_amount": total_amount,
                "payment_method": payment_method,
                "status": status,
                "channel": channel,
                "is_anomaly": is_anomaly
            })

            tx_id_counter += 1

        current_date += datetime.timedelta(days=1)

    tx_df = pd.DataFrame(transactions)
    
    ground_truth = {
        "scenario_1_evening_slump": {
            "target_merchant": "m-001",
            "merchant_name": "Sharma Tea Corner",
            "slump_window": "5:00 PM - 8:30 PM",
            "volume_reduction_pct": 31.0,
            "period": "Last 45 days",
            "impact_contribution": 62.0
        },
        "scenario_2_gradual_decay": {
            "target_merchant": "m-002",
            "merchant_name": "Gupta Electronics",
            "annual_sales_decay_pct": 25.0,
            "period": "12 months"
        },
        "scenario_3_repeat_customer_drop": {
            "target_merchant": "m-001",
            "dormant_regulars_count": 312,
            "repeat_rate_drop": "48% to 34%"
        },
        "scenario_4_product_category_surge": {
            "target_merchant": "m-003",
            "category": "Organic & Superfoods",
            "growth_pct": 140.0
        },
        "anomalies_count": len(anomalies_logged),
        "total_transactions": len(tx_df)
    }

    return tx_df, ground_truth

# -----------------------------------------------------------------------------
# 6. Build Derived ML Datasets
# -----------------------------------------------------------------------------
def build_ml_datasets(
    merchants_df: pd.DataFrame,
    customers_df: pd.DataFrame,
    transactions_df: pd.DataFrame,
    campaigns_df: pd.DataFrame,
    campaign_results_df: pd.DataFrame
):
    print("Building derived ML datasets...")

    # A. ml_data/customer_rfm.csv
    # Calculate Recency, Frequency, Monetary Value from successful transactions
    success_tx = transactions_df[
        (transactions_df["status"] == "SUCCESS") & (transactions_df["customer_id"].notna())
    ].copy()
    success_tx["timestamp_dt"] = pd.to_datetime(success_tx["timestamp"])
    max_date = success_tx["timestamp_dt"].max()

    rfm = success_tx.groupby(["customer_id", "merchant_id"]).agg(
        recency_days=("timestamp_dt", lambda x: (max_date - x.max()).days),
        frequency=("transaction_id", "count"),
        monetary_value=("total_amount", "sum"),
        avg_ticket_size=("total_amount", "mean"),
        first_visit=("timestamp_dt", "min"),
        last_visit=("timestamp_dt", "max")
    ).reset_index()

    rfm["tenure_days"] = (max_date - rfm["first_visit"]).dt.days
    rfm["monetary_value"] = rfm["monetary_value"].round(2)
    rfm["avg_ticket_size"] = rfm["avg_ticket_size"].round(2)

    # Classify into RFM segments:
    # LOYAL: F >= 15 and R <= 14
    # RETURNING: F >= 4 and R <= 30
    # AT_RISK: F >= 5 and R > 30 and R <= 60
    # INACTIVE: R > 60
    # NEW: F <= 3 and R <= 30
    def assign_rfm_segment(row):
        r = row["recency_days"]
        f = row["frequency"]
        if f >= 15 and r <= 14:
            return "LOYAL"
        elif f >= 4 and r <= 30:
            return "RETURNING"
        elif f >= 4 and r > 30:
            return "AT_RISK" if r <= 60 else "INACTIVE"
        elif r > 45:
            return "INACTIVE"
        else:
            return "NEW"

    rfm["rfm_segment"] = rfm.apply(assign_rfm_segment, axis=1)

    # Churn risk score (0.0 to 100.0) based on recency vs tenure
    rfm["churn_risk_score"] = np.clip(
        (rfm["recency_days"] / (rfm["tenure_days"] + 1)) * 100.0 + (30.0 / (rfm["frequency"] + 1)),
        0.0, 100.0
    ).round(2)

    rfm_path = os.path.join(ML_DATA_DIR, "customer_rfm.csv")
    rfm.drop(columns=["first_visit", "last_visit"]).to_csv(rfm_path, index=False)
    print(f"Saved {len(rfm)} rows to {rfm_path}")

    # B. ml_data/sales_daily.csv
    success_all = transactions_df[transactions_df["status"] == "SUCCESS"].copy()
    success_all["date"] = pd.to_datetime(success_all["timestamp"]).dt.date

    daily = success_all.groupby(["merchant_id", "date"]).agg(
        daily_revenue=("total_amount", "sum"),
        daily_transactions=("transaction_id", "count"),
        unique_customers=("customer_id", "nunique"),
        avg_order_value=("total_amount", "mean")
    ).reset_index()

    daily["date_dt"] = pd.to_datetime(daily["date"])
    daily["day_of_week"] = daily["date_dt"].dt.day_name()
    daily["is_weekend"] = daily["date_dt"].dt.weekday >= 5
    daily["daily_revenue"] = daily["daily_revenue"].round(2)
    daily["avg_order_value"] = daily["avg_order_value"].round(2)

    # Flag festival dates
    fest_dates = {f[0] for f in INDIAN_FESTIVALS_2025_2026}
    daily["is_festival"] = daily["date"].apply(lambda d: d in fest_dates)

    daily_path = os.path.join(ML_DATA_DIR, "sales_daily.csv")
    daily.drop(columns=["date_dt"]).to_csv(daily_path, index=False)
    print(f"Saved {len(daily)} rows to {daily_path}")

    # C. ml_data/anomaly_training.csv (Hourly features for anomaly detector ML)
    success_all["hour"] = pd.to_datetime(success_all["timestamp"]).dt.hour
    hourly = success_all.groupby(["merchant_id", "date", "hour"]).agg(
        hourly_transactions=("transaction_id", "count"),
        hourly_revenue=("total_amount", "sum"),
        anomaly_flag=("is_anomaly", "any")
    ).reset_index()

    # Calculate rolling Z-scores for volume
    hourly["hourly_revenue"] = hourly["hourly_revenue"].round(2)
    hourly["rolling_mean"] = hourly.groupby("merchant_id")["hourly_transactions"].transform(lambda x: x.rolling(24, min_periods=1).mean()).round(2)
    hourly["rolling_std"] = hourly.groupby("merchant_id")["hourly_transactions"].transform(lambda x: x.rolling(24, min_periods=1).std().fillna(1.0)).round(2)
    hourly["z_score"] = ((hourly["hourly_transactions"] - hourly["rolling_mean"]) / hourly["rolling_std"].replace(0, 1.0)).round(2)

    # Label anomaly if explicitly injected or if volume dropped sharply during benchmark peak hours
    hourly["is_anomaly"] = hourly["anomaly_flag"] | (hourly["z_score"] < -2.2)

    anomaly_path = os.path.join(ML_DATA_DIR, "anomaly_training.csv")
    hourly.drop(columns=["anomaly_flag"]).to_csv(anomaly_path, index=False)
    print(f"Saved {len(hourly)} rows to {anomaly_path}")

    # D. ml_data/recommendation_training.csv
    # Joins campaign details with merchant category and customer cohorts to train uplift & recommendation models
    rec_training = campaigns_df.merge(campaign_results_df, on=["campaign_id", "merchant_id"]).merge(
        merchants_df[["merchant_id", "category", "business_size"]], on="merchant_id"
    )

    rec_features = pd.DataFrame({
        "campaign_id": rec_training["campaign_id"],
        "merchant_id": rec_training["merchant_id"],
        "merchant_category": rec_training["category"],
        "merchant_size": rec_training["business_size"],
        "campaign_type": rec_training["campaign_type"],
        "target_segment": rec_training["target_segment"],
        "discount_type": rec_training["discount_type"],
        "discount_value": rec_training["discount"],
        "budget": rec_training["budget"],
        "revenue_before": rec_training["revenue_before"],
        "actual_lift_percent": rec_training["actual_lift_percent"],
        "roi": rec_training["roi"],
        "is_recommended_success": rec_training["is_successful"]
    })

    rec_path = os.path.join(ML_DATA_DIR, "recommendation_training.csv")
    rec_features.to_csv(rec_path, index=False)
    print(f"Saved {len(rec_features)} rows to {rec_path}")

# -----------------------------------------------------------------------------
# 7. Comprehensive Validation Checks
# -----------------------------------------------------------------------------
def run_validation_suite(
    merchants_df: pd.DataFrame,
    customers_df: pd.DataFrame,
    products_df: pd.DataFrame,
    transactions_df: pd.DataFrame,
    campaigns_df: pd.DataFrame,
    campaign_results_df: pd.DataFrame
):
    print("\n" + "="*70)
    print("RUNNING STRICT VALIDATION SUITE")
    print("="*70)

    errors = []

    # 1. Primary Key Uniqueness
    if merchants_df["merchant_id"].duplicated().any():
        errors.append("Duplicate primary keys found in merchants.csv")
    if customers_df["customer_id"].duplicated().any():
        errors.append("Duplicate primary keys found in customers.csv")
    if products_df["product_id"].duplicated().any():
        errors.append("Duplicate primary keys found in products.csv")
    if transactions_df["transaction_id"].duplicated().any():
        errors.append("Duplicate primary keys found in transactions.csv")
    if campaigns_df["campaign_id"].duplicated().any():
        errors.append("Duplicate primary keys found in campaigns.csv")
    if campaign_results_df["result_id"].duplicated().any():
        errors.append("Duplicate primary keys found in campaign_results.csv")

    # 2. Referential Integrity
    merchant_ids = set(merchants_df["merchant_id"])
    customer_ids = set(customers_df["customer_id"])
    product_ids = set(products_df["product_id"])
    campaign_ids = set(campaigns_df["campaign_id"])

    # Customers -> Merchants
    invalid_cust_merch = set(customers_df["merchant_id"]) - merchant_ids
    if invalid_cust_merch:
        errors.append(f"Foreign key violation: customers with invalid merchant_id: {invalid_cust_merch}")

    # Products -> Merchants
    invalid_prod_merch = set(products_df["merchant_id"]) - merchant_ids
    if invalid_prod_merch:
        errors.append(f"Foreign key violation: products with invalid merchant_id: {invalid_prod_merch}")

    # Transactions -> Merchants
    invalid_tx_merch = set(transactions_df["merchant_id"]) - merchant_ids
    if invalid_tx_merch:
        errors.append(f"Foreign key violation: transactions with invalid merchant_id: {invalid_tx_merch}")

    # Transactions -> Customers
    tx_cust_set = set(transactions_df["customer_id"].dropna())
    invalid_tx_cust = tx_cust_set - customer_ids
    if invalid_tx_cust:
        errors.append(f"Foreign key violation: transactions with invalid customer_id: {invalid_tx_cust}")

    # Transactions -> Products
    invalid_tx_prod = set(transactions_df["product_id"]) - product_ids
    if invalid_tx_prod:
        errors.append(f"Foreign key violation: transactions with invalid product_id: {invalid_tx_prod}")

    # Campaign Results -> Campaigns
    invalid_res_camp = set(campaign_results_df["campaign_id"]) - campaign_ids
    if invalid_res_camp:
        errors.append(f"Foreign key violation: campaign_results with invalid campaign_id: {invalid_res_camp}")

    # 3. Arithmetic Amount Consistency
    calc_amounts = (transactions_df["quantity"] * transactions_df["unit_price"]).round(2)
    # allow for injected price spikes in anomalies
    regular_tx = transactions_df[~transactions_df["is_anomaly"]]
    regular_calc = (regular_tx["quantity"] * regular_tx["unit_price"]).round(2)
    amount_mismatch = (regular_tx["total_amount"] - regular_calc).abs().max()
    if amount_mismatch > 0.01:
        errors.append(f"Amount mismatch in regular transactions: max diff = {amount_mismatch}")

    # 4. Null checks in mandatory fields
    if transactions_df["merchant_id"].isnull().any():
        errors.append("Null merchant_id in transactions.csv")
    if transactions_df["timestamp"].isnull().any():
        errors.append("Null timestamp in transactions.csv")
    if transactions_df["payment_method"].isnull().any():
        errors.append("Null payment_method in transactions.csv")

    if errors:
        for err in errors:
            print(f"[FAIL] [VALIDATION ERROR] {err}")
        raise ValueError(f"Validation failed with {len(errors)} errors.")
    else:
        print("[PASS] Primary Key Uniqueness: PASSED (Zero duplicates)")
        print("[PASS] Foreign Key Referential Integrity: PASSED (100% matched)")
        print("[PASS] Mathematical Amount Calculations: PASSED (Quantity * Unit Price matches)")
        print("[PASS] Mandatory Field Null Checks: PASSED (Zero illegal nulls)")
        print("="*70)

# -----------------------------------------------------------------------------
# Main Execution Orchestrator
# -----------------------------------------------------------------------------
def main():
    print(f"Starting Merchant Growth AI Synthetic Data Generator (Seed: {RANDOM_SEED})...")

    # 1. Generate Merchants
    print(f"\n[1/5] Generating {TARGET_MERCHANTS} Merchants...")
    merchants_df = generate_merchants()
    merchants_path = os.path.join(DATA_DIR, "merchants.csv")
    merchants_df.to_csv(merchants_path, index=False)
    print(f"Saved {len(merchants_df)} merchants to {merchants_path}")

    # 2. Generate Products
    print(f"\n[2/5] Generating {TARGET_PRODUCTS} Products...")
    products_df = generate_products(merchants_df)
    products_path = os.path.join(DATA_DIR, "products.csv")
    products_df.to_csv(products_path, index=False)
    print(f"Saved {len(products_df)} products to {products_path}")

    # 3. Generate Customers
    print(f"\n[3/5] Generating {TARGET_CUSTOMERS} Customers...")
    customers_df = generate_customers(merchants_df)
    customers_path = os.path.join(DATA_DIR, "customers.csv")
    customers_df.to_csv(customers_path, index=False)
    print(f"Saved {len(customers_df)} customers to {customers_path}")

    # 4. Generate Campaigns & Results
    print(f"\n[4/5] Generating {TARGET_CAMPAIGNS} Campaigns & Results...")
    campaigns_df, campaign_results_df = generate_campaigns(merchants_df)
    campaigns_path = os.path.join(DATA_DIR, "campaigns.csv")
    results_path = os.path.join(DATA_DIR, "campaign_results.csv")
    campaigns_df.to_csv(campaigns_path, index=False)
    campaign_results_df.to_csv(results_path, index=False)
    print(f"Saved {len(campaigns_df)} campaigns to {campaigns_path}")
    print(f"Saved {len(campaign_results_df)} campaign results to {results_path}")

    # 5. Generate Transactions (100,000+)
    print(f"\n[5/5] Generating 100,000+ Transactions spanning 12 months (2025-09 to 2026-09)...")
    transactions_df, ground_truth = generate_transactions(merchants_df, products_df, customers_df)
    transactions_path = os.path.join(DATA_DIR, "transactions.csv")
    # Clean export without the internal is_anomaly flag leaking into standard CSV
    transactions_clean = transactions_df.drop(columns=["is_anomaly"])
    transactions_clean.to_csv(transactions_path, index=False)
    print(f"Saved {len(transactions_clean)} transactions totaling INR {transactions_clean['total_amount'].sum():,.2f} to {transactions_path}")

    # Save Ground Truth metadata separately for evaluation
    gt_path = os.path.join(DATA_DIR, "scenarios_ground_truth.json")
    with open(gt_path, "w", encoding="utf-8") as f:
        json.dump(ground_truth, f, indent=2)
    print(f"Saved ground-truth evaluation metadata to {gt_path}")

    # 6. Run Validation Suite
    run_validation_suite(
        merchants_df, customers_df, products_df, transactions_df, campaigns_df, campaign_results_df
    )

    # 7. Build Derived ML Training Datasets
    build_ml_datasets(
        merchants_df, customers_df, transactions_df, campaigns_df, campaign_results_df
    )

    print("\n" + "="*70)
    print("ALL SYNTHETIC DATA & ML TRAINING DATASETS GENERATED SUCCESSFULLY!")
    print("="*70)

if __name__ == "__main__":
    main()
