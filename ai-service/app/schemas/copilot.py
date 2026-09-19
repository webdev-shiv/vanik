"""
Pydantic Schemas for AI Growth Copilot.
Handles structured user inquiries, pre-calculated analytical context,
explicit metric citations, and conversational responses.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class QuickAction(BaseModel):
    label: str
    action: str  # 'navigate', 'simulate', 'recommend', 'launch'
    target: str
    payload: Optional[Dict[str, Any]] = None


class CopilotChatRequest(BaseModel):
    query: str = Field(..., description="Natural language question from merchant")
    merchant_id: Optional[str] = Field("m-001", description="Target merchant ID")
    merchantId: Optional[str] = None  # camelCase alias
    context_data: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Verified pre-calculated business analytics passed from backend"
    )

    def get_merchant_id(self) -> str:
        return self.merchant_id or self.merchantId or "m-001"


class CopilotChatResponse(BaseModel):
    id: str
    sender: str = "ai"
    timestamp: str
    content: str
    cited_metrics: List[str] = Field(
        default_factory=list,
        description="Explicit list of verified business metrics quoted in the response"
    )
    intent: Optional[str] = Field(None, description="Identified question intent")
    quickActions: List[QuickAction] = Field(default_factory=list)
    memory_sources: List[str] = Field(
        default_factory=list,
        description="Cognee memory provenance sources and graph nodes"
    )
