"""
Merchant Growth AI - Synthetic Indian Merchant Data Generator
Generates realistic, explainable synthetic Indian merchant data
adhering strictly to Indian merchant categories, Rupee metrics, and
temporal demand slump patterns (e.g. 5:00 PM - 8:30 PM drop).

Note: This prototype does NOT use private Paytm merchant data.
Synthetic data is generated for hackathon benchmarking.
"""

import json
import random
import datetime
import os

random.seed(42)  # For reproducible ML experiments

MERCHANTS = [
    {
        "id": "merch-sharma-tea",
        "name": "Sharma Tea Corner",
        "owner_name": "Ramesh Sharma",
        "category": "QSR / Cafe & Snacks",
        "location": "Connaught Place, New Delhi",
        "size": "Micro (1-5 staff)",
        "paytm_merchant_id": "PAYTM-MERCH-98214-DL",
        "soundbox_id": "SB-4G-99218",
        "qr_code_id": "QR-CP-8841",
        "connection_status": "CONNECTED_DEMO",
        "last_synced_at": "Just now (Realtime Webhook Stream)",
        "monthly_revenue": 284500.00
    },
    {
        "id": "merch-verma-sweets",
        "name": "Verma Sweets & Bakery",
        "owner_name": "Ashok Verma",
        "category": "Bakery & Confectionery",
        "location": "Karol Bagh, New Delhi",
        "size": "Small (6-15 staff)",
        "paytm_merchant_id": "PAYTM-MERCH-77412-DL",
        "soundbox_id": "SB-4G-44102",
        "qr_code_id": "QR-KB-3329",
        "connection_status": "CONNECTED_DEMO",
        "last_synced_at": "3 minutes ago",
        "monthly_revenue": 492000.00
    },
    {
        "id": "merch-quickbite-cafe",
        "name": "QuickBite Fast Food",
        "owner_name": "Pooja Nair",
        "category": "Casual Dining",
        "location": "Sector 62, Noida",
        "size": "Small (6-15 staff)",
        "paytm_merchant_id": "PAYTM-MERCH-66129-UP",
        "soundbox_id": "SB-4G-10934",
        "qr_code_id": "QR-NOIDA-5541",
        "connection_status": "CONNECTED_DEMO",
        "last_synced_at": "12 minutes ago",
        "monthly_revenue": 340000.00
    }
]

CUSTOMERS = [
    {
        "id": "cust-01",
        "merchant_id": "merch-sharma-tea",
        "masked_phone": "+91 98110 •••••",
        "name": "Rohit K. (IT Park Desk)",
        "segment": "INACTIVE",
        "total_spend": 2450.00,
        "visit_count": 18,
        "average_spend": 136.00,
        "last_visit": "22 days ago",
        "preferred_time": "6:15 PM (Evening)",
        "favorite_item": "Special Masala Chai + Bun Maska",
        "retention_risk": "HIGH"
    },
    {
        "id": "cust-02",
        "merchant_id": "merch-sharma-tea",
        "masked_phone": "+91 98712 •••••",
        "name": "Ananya S. (Fintech Associate)",
        "segment": "INACTIVE",
        "total_spend": 3120.00,
        "visit_count": 24,
        "average_spend": 130.00,
        "last_visit": "25 days ago",
        "preferred_time": "5:45 PM (Evening)",
        "favorite_item": "Ginger Lemon Tea + Samosa",
        "retention_risk": "HIGH"
    },
    {
        "id": "cust-03",
        "merchant_id": "merch-sharma-tea",
        "masked_phone": "+91 99104 •••••",
        "name": "Vikram M. (Legal Consultant)",
        "segment": "AT_RISK",
        "total_spend": 4800.00,
        "visit_count": 31,
        "average_spend": 155.00,
        "last_visit": "11 days ago",
        "preferred_time": "1:30 PM (Lunch)",
        "favorite_item": "Kullad Chai + Paneer Pakora",
        "retention_risk": "MEDIUM"
    },
    {
        "id": "cust-04",
        "merchant_id": "merch-sharma-tea",
        "masked_phone": "+91 98290 •••••",
        "name": "Deepak T. (Retail Store Mgr)",
        "segment": "LOYAL",
        "total_spend": 8400.00,
        "visit_count": 52,
        "average_spend": 161.00,
        "last_visit": "Yesterday",
        "preferred_time": "9:15 AM (Morning)",
        "favorite_item": "Elaichi Chai + Poha",
        "retention_risk": "LOW"
    },
    {
        "id": "cust-05",
        "merchant_id": "merch-sharma-tea",
        "masked_phone": "+91 97188 •••••",
        "name": "Pooja R. (Banking Officer)",
        "segment": "RETURNING",
        "total_spend": 1950.00,
        "visit_count": 12,
        "average_spend": 162.00,
        "last_visit": "3 days ago",
        "preferred_time": "4:30 PM (Evening)",
        "favorite_item": "Filter Coffee + Biscuit Platter",
        "retention_risk": "LOW"
    },
    {
        "id": "cust-06",
        "merchant_id": "merch-sharma-tea",
        "masked_phone": "+91 96541 •••••",
        "name": "Arjun V. (Freelance Designer)",
        "segment": "NEW",
        "total_spend": 420.00,
        "visit_count": 2,
        "average_spend": 210.00,
        "last_visit": "2 days ago",
        "preferred_time": "7:00 PM (Evening)",
        "favorite_item": "Hot Chocolate + Brownie Bun",
        "retention_risk": "LOW"
    },
    {
        "id": "cust-07",
        "merchant_id": "merch-sharma-tea",
        "masked_phone": "+91 99991 •••••",
        "name": "Sunita G. (Government Office)",
        "segment": "INACTIVE",
        "total_spend": 3600.00,
        "visit_count": 27,
        "average_spend": 133.00,
        "last_visit": "28 days ago",
        "preferred_time": "5:30 PM (Evening)",
        "favorite_item": "Special Masala Chai + Kachori",
        "retention_risk": "HIGH"
    },
    {
        "id": "cust-08",
        "merchant_id": "merch-sharma-tea",
        "masked_phone": "+91 98109 •••••",
        "name": "Karan B. (Agency Exec)",
        "segment": "LOYAL",
        "total_spend": 6200.00,
        "visit_count": 40,
        "average_spend": 155.00,
        "last_visit": "Today",
        "preferred_time": "10:00 AM (Morning)",
        "favorite_item": "Kadak Chai + Toast",
        "retention_risk": "LOW"
    }
]

def generate_synthetic_transactions(target_count=1248, target_revenue=284500):
    """
    Generates realistic 30-day transaction logs for Sharma Tea Corner.
    Reflects Indian tea/snack price distribution (₹20 to ₹500),
    healthy morning & lunch peaks, and evening slump (5 PM - 8:30 PM).
    """
    transactions = []
    base_date = datetime.datetime(2026, 9, 17, 18, 0, 0)
    customer_ids = [c["id"] for c in CUSTOMERS]

    # Hourly distribution weights (reflecting the 31% slump between 17:00 and 20:30)
    hour_weights = {
        7: 24, 8: 78, 9: 165, 10: 142, 11: 95, 12: 88,
        13: 145, 14: 120, 15: 65, 16: 82,
        17: 52, 18: 44, 19: 58, 20: 61, 21: 38, 22: 15
    }
    
    current_revenue = 0
    tx_id = 1
    
    # Generate across 30 days
    for day_offset in range(30):
        day_date = base_date - datetime.timedelta(days=day_offset)
        # Weekday vs Weekend flag
        is_weekend = day_date.weekday() >= 5
        
        for hour, base_tx in hour_weights.items():
            # Daily count with slight variance
            tx_count = max(1, int(round(base_tx / 30.0 + random.uniform(-0.8, 0.8))))
            for _ in range(tx_count):
                if len(transactions) >= target_count:
                    break
                minute = random.randint(0, 59)
                second = random.randint(0, 59)
                tx_time = day_date.replace(hour=hour, minute=minute, second=second)
                
                # Ticket size: Average ₹228, distribution skewed towards snacks/chai
                price_choices = [30, 45, 60, 90, 120, 150, 180, 220, 260, 310, 420, 550]
                amount = float(random.choice(price_choices))
                current_revenue += amount
                
                cust_id = random.choice(customer_ids) if random.random() < 0.35 else None
                payment_method = random.choices(
                    ["SOUNDBOX_QR", "SOUNDBOX_CARD", "PAYTM_WALLET", "UPI"],
                    weights=[0.60, 0.15, 0.15, 0.10]
                )[0]
                
                transactions.append({
                    "id": f"tx-202609-{tx_id:05d}",
                    "merchant_id": "merch-sharma-tea",
                    "customer_id": cust_id,
                    "amount": amount,
                    "timestamp": tx_time.isoformat(),
                    "payment_method": payment_method,
                    "category": "Food & Beverage",
                    "status": "SUCCESS",
                    "soundbox_announcement_done": True
                })
                tx_id += 1

    # Adjust last transactions so aggregate closely aligns with target
    diff = target_revenue - current_revenue
    if transactions and abs(diff) > 0:
        transactions[-1]["amount"] = max(20.0, transactions[-1]["amount"] + diff)
        
    return transactions

def main():
    output_dir = os.path.dirname(os.path.abspath(__file__))
    txns = generate_synthetic_transactions()
    
    data_bundle = {
        "metadata": {
            "source": "REALISTIC_SYNTHETIC_DATA_ENGINE",
            "prototype": "Merchant Growth AI",
            "currency": "INR",
            "is_private_paytm_data": False,
            "generated_at": datetime.datetime.now().isoformat()
        },
        "merchants": MERCHANTS,
        "customers": CUSTOMERS,
        "transactions_sample": txns[:50],
        "total_transactions_generated": len(txns),
        "total_volume": sum(t["amount"] for t in txns)
    }
    
    json_path = os.path.join(output_dir, "seed_data.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data_bundle, f, indent=2)
        
    # Generate seed SQL for Supabase / PostgreSQL
    sql_path = os.path.join(output_dir, "seed_data.sql")
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write("-- Synthetic Seed Data for Merchant Growth AI\n\n")
        # Merchants
        for m in MERCHANTS:
            f.write(f"INSERT INTO merchants (id, name, owner_name, category, location, size, paytm_merchant_id, soundbox_id, qr_code_id, connection_status, last_synced_at, monthly_revenue) VALUES ('{m['id']}', '{m['name']}', '{m['owner_name']}', '{m['category']}', '{m['location']}', '{m['size']}', '{m['paytm_merchant_id']}', '{m['soundbox_id']}', '{m['qr_code_id']}', '{m['connection_status']}', '{m['last_synced_at']}', {m['monthly_revenue']}) ON CONFLICT (id) DO NOTHING;\n")
        f.write("\n")
        # Customers
        for c in CUSTOMERS:
            f.write(f"INSERT INTO customers (id, merchant_id, masked_phone, name, segment, total_spend, visit_count, average_spend, last_visit, preferred_time, favorite_item, retention_risk) VALUES ('{c['id']}', '{c['merchant_id']}', '{c['masked_phone']}', '{c['name']}', '{c['segment']}', {c['total_spend']}, {c['visit_count']}, {c['average_spend']}, '{c['last_visit']}', '{c['preferred_time']}', '{c['favorite_item']}', '{c['retention_risk']}') ON CONFLICT (id) DO NOTHING;\n")
        f.write("\n")
        # Transactions sample
        for t in txns[:200]:
            cust_val = f"'{t['customer_id']}'" if t['customer_id'] else "NULL"
            f.write(f"INSERT INTO transactions (id, merchant_id, customer_id, amount, timestamp, payment_method, category, status, soundbox_announcement_done) VALUES ('{t['id']}', '{t['merchant_id']}', {cust_val}, {t['amount']}, '{t['timestamp']}', '{t['payment_method']}', '{t['category']}', '{t['status']}', {str(t['soundbox_announcement_done']).upper()}) ON CONFLICT (id) DO NOTHING;\n")

    print(f"Successfully generated synthetic dataset:")
    print(f" - {len(MERCHANTS)} merchants")
    print(f" - {len(CUSTOMERS)} customers")
    print(f" - {len(txns)} transactions totaling INR {sum(t['amount'] for t in txns):,.2f}")
    print(f" - Saved to {json_path} and {sql_path}")

if __name__ == "__main__":
    main()
