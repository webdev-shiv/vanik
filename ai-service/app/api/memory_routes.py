"""
FastAPI REST Routes for Cognee VANIK Memory (Merchant Memory Graph).
Exposes /memory/* and /ai/memory/* endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List

from app.utils.logger import logger
from app.schemas.memory import (
    MemoryIngestRequest,
    MemoryIngestResponse,
    MemoryEventRequest,
    MemoryRecallRequest,
    MemoryRecallResponse,
    MemoryGraphResponse,
    MemoryStatsResponse,
)
from app.memory.cognee_memory import merchant_memory

router = APIRouter(tags=["VANIK Memory (Cognee)"])


@router.post("/memory/ingest", response_model=MemoryIngestResponse, summary="Ingest merchant snapshot into memory graph")
@router.post("/ai/memory/ingest", response_model=MemoryIngestResponse, include_in_schema=False)
async def api_memory_ingest(req: MemoryIngestRequest):
    try:
        res = await merchant_memory.ingest_merchant_snapshot(req.merchant_id or "m-001", req.force_refresh)
        return MemoryIngestResponse(**res)
    except Exception as e:
        logger.error(f"Error in memory ingest: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/memory/event", summary="Record episodic memory event")
@router.post("/ai/memory/event", include_in_schema=False)
async def api_memory_event(req: MemoryEventRequest):
    try:
        return await merchant_memory.ingest_event(
            merchant_id=req.merchant_id or "m-001",
            event_type=req.event_type,
            payload=req.payload,
            timestamp=req.timestamp
        )
    except Exception as e:
        logger.error(f"Error in memory event ingest: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/memory/recall", response_model=MemoryRecallResponse, summary="Recall facts & provenance from memory graph")
@router.post("/ai/memory/recall", response_model=MemoryRecallResponse, include_in_schema=False)
async def api_memory_recall(req: MemoryRecallRequest):
    try:
        res = await merchant_memory.recall(
            merchant_id=req.merchant_id or "m-001",
            query=req.query,
            mode=req.mode or "graph"
        )
        return MemoryRecallResponse(**res)
    except Exception as e:
        logger.error(f"Error in memory recall: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/memory/graph/{merchant_id}", response_model=MemoryGraphResponse, summary="Get merchant knowledge graph topology")
@router.get("/ai/memory/graph/{merchant_id}", response_model=MemoryGraphResponse, include_in_schema=False)
def api_memory_graph(merchant_id: str):
    try:
        return merchant_memory.graph_snapshot(merchant_id)
    except Exception as e:
        logger.error(f"Error fetching memory graph for {merchant_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/memory/stats/{merchant_id}", response_model=MemoryStatsResponse, summary="Get memory stats & node counts")
@router.get("/ai/memory/stats/{merchant_id}", response_model=MemoryStatsResponse, include_in_schema=False)
def api_memory_stats(merchant_id: str):
    try:
        return merchant_memory.memory_stats(merchant_id)
    except Exception as e:
        logger.error(f"Error fetching memory stats for {merchant_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/memory/{merchant_id}", summary="Reset merchant memory dataset")
@router.delete("/ai/memory/{merchant_id}", include_in_schema=False)
def api_memory_reset(merchant_id: str):
    try:
        return merchant_memory.reset(merchant_id)
    except Exception as e:
        logger.error(f"Error resetting memory for {merchant_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
