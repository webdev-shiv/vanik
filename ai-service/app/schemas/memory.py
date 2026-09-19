"""
Pydantic Schemas for Cognee VANIK Memory Engine.
Handles merchant memory ingestion, episodic event streaming, recall reasoning,
knowledge-graph topologies, and memory health statistics.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class MemoryIngestRequest(BaseModel):
    merchant_id: Optional[str] = Field("m-001", description="Target merchant ID")
    force_refresh: bool = Field(False, description="Whether to recompute and re-cognify from scratch")


class MemoryIngestResponse(BaseModel):
    status: str = "SUCCESS"
    merchant_id: str
    documents_ingested: int
    nodes_created: int
    edges_created: int
    message: str


class MemoryEventRequest(BaseModel):
    merchant_id: Optional[str] = Field("m-001", description="Target merchant ID")
    event_type: str = Field(..., description="Event type, e.g. TRANSACTION_RECORDED, CAMPAIGN_LAUNCHED, CAMPAIGN_RESULT, INSIGHT_GENERATED, COPILOT_CHAT")
    payload: Dict[str, Any] = Field(default_factory=dict, description="Event payload data")
    timestamp: Optional[str] = None


class MemoryRecallRequest(BaseModel):
    merchant_id: Optional[str] = Field("m-001", description="Target merchant ID")
    query: str = Field(..., description="Natural language reasoning or context recall query")
    mode: Optional[str] = Field("graph", description="Search mode: 'graph' (completion reasoning) or 'lookup'")


class MemoryRecallResponse(BaseModel):
    query: str
    answer: str
    sources: List[str] = Field(default_factory=list, description="Documents or nodes justifying this answer")
    related_nodes: List[str] = Field(default_factory=list, description="Graph node IDs connected to this query context")
    confidence: float = 0.92


class MemoryGraphNode(BaseModel):
    id: str
    label: str
    type: str = Field(..., description="Entity type: Product, Time Slot, Customer Segment, Campaign, Insight, Merchant")
    weight: float = 1.0
    details: Optional[Dict[str, Any]] = None


class MemoryGraphEdge(BaseModel):
    source: str
    target: str
    relationship: str
    weight: float = 1.0


class MemoryGraphResponse(BaseModel):
    merchant_id: str
    nodes: List[MemoryGraphNode] = Field(default_factory=list)
    edges: List[MemoryGraphEdge] = Field(default_factory=list)
    total_nodes: int = 0
    total_edges: int = 0


class MemoryStatsResponse(BaseModel):
    merchant_id: str
    node_count: int
    edge_count: int
    document_count: int
    last_updated: str
    top_entity_types: Dict[str, int]
    engine_status: str = "ACTIVE"
