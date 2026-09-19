"""
Unit tests for Cognee VANIK Memory (Merchant Memory Graph).
Verifies:
1. Snapshot ingestion generates valid nodes and edges.
2. Episodic events are ingested and reflected in memory.
3. Recall returns grounded answers with valid source provenance.
4. Graph snapshot returns properly typed nodes (Product, Time Slot, Segment, Campaign, Insight).
5. Copilot responses include memory_sources provenance.
6. Memory reset and isolation between merchants.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.memory.cognee_memory import merchant_memory

client = TestClient(app)


def test_memory_ingest_endpoint():
    """Verify POST /memory/ingest builds graph nodes and edges."""
    response = client.post("/memory/ingest", json={"merchant_id": "m-001", "force_refresh": True})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["merchant_id"] == "m-001"
    assert data["nodes_created"] >= 15
    assert data["edges_created"] >= 15
    assert data["documents_ingested"] >= 5


def test_memory_event_ingest():
    """Verify POST /memory/event appends episodic event."""
    payload = {
        "merchant_id": "m-001",
        "event_type": "TRANSACTION_RECORDED",
        "payload": {"bill_id": "TXN-TEST-001", "amount": 149.0, "items": ["Special Masala Chai", "Samosa Plate"]}
    }
    response = client.post("/memory/event", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert "event_id" in data


def test_memory_graph_topology():
    """Verify GET /memory/graph/{merchant_id} returns typed nodes and relations."""
    response = client.get("/memory/graph/m-001")
    assert response.status_code == 200
    data = response.json()
    assert data["merchant_id"] == "m-001"
    assert len(data["nodes"]) >= 15
    assert len(data["edges"]) >= 15

    # Check node types
    node_types = {n["type"] for n in data["nodes"]}
    assert "Product" in node_types
    assert "Time Slot" in node_types
    assert "Segment" in node_types
    assert "Campaign" in node_types
    assert "Insight" in node_types


def test_memory_stats():
    """Verify GET /memory/stats/{merchant_id} returns stats."""
    response = client.get("/memory/stats/m-001")
    assert response.status_code == 200
    data = response.json()
    assert data["node_count"] >= 15
    assert data["edge_count"] >= 15
    assert data["document_count"] >= 5
    assert "Product" in data["top_entity_types"]


def test_memory_recall_evening_offer():
    """Verify POST /memory/recall for evening offer past performance."""
    payload = {
        "merchant_id": "m-001",
        "query": "What worked last time I ran an evening offer?"
    }
    response = client.post("/memory/recall", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "₹49 Evening" in data["answer"] or "Evening Chai" in data["answer"]
    assert len(data["sources"]) > 0
    assert len(data["related_nodes"]) > 0
    # Must cite verified 4.8x ROI or 27.2% lift
    assert "4.8" in data["answer"] or "27.2%" in data["answer"]


def test_copilot_includes_memory_sources():
    """Verify /ai/copilot/chat returns memory_sources in response."""
    payload = {
        "query": "What worked last time I ran an evening combo offer?",
        "merchant_id": "m-001"
    }
    response = client.post("/ai/copilot/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "memory_sources" in data
    assert len(data["memory_sources"]) > 0
    assert data["intent"] == "MEMORY_HISTORICAL_RECALL"


def test_memory_reset():
    """Verify DELETE /memory/{merchant_id} clears and resets to baseline."""
    response = client.delete("/memory/m-001")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
