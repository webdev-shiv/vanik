"""
Merchant Growth AI - Python FastAPI Machine Learning Microservice.
Provides RFM customer segmentation, sales forecasting, anomaly detection,
growth recommendations, and What-If microeconomic simulations.
"""
import time
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from app.utils.logger import logger
from app.utils.model_registry import model_registry
from app.api.routes import router

app = FastAPI(
    title="Merchant Growth AI - ML Microservice",
    description="Production ML engine delivering customer segmentation, sales forecasting, anomaly detection, recommendations, and simulations.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

import os

# CORS Middleware with strict origin whitelisting
cors_env = os.getenv("CORS_ALLOWED_ORIGINS", "")
if cors_env.strip():
    allowed_origins = [orig.strip() for orig in cors_env.split(",") if orig.strip()]
else:
    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5678",
        "http://127.0.0.1:5678",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start_time) * 1000.0
    logger.info(f"{request.method} {request.url.path} -> Status {response.status_code} [{duration_ms:.1f}ms]")
    return response


from fastapi.encoders import jsonable_encoder


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": "The request payload failed schema validation.",
            "details": jsonable_encoder(exc.errors())
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected internal server error occurred. Please contact system support.",
            "path": request.url.path
        }
    )


@app.get("/health", tags=["Health"])
def health_check():
    meta = model_registry.get_metadata()
    return {
        "status": "UP",
        "service": "Merchant Growth AI Engine",
        "version": "1.0.0",
        "python_runtime": "3.14",
        "models_loaded": list(meta.get("models", {}).keys())
    }


@app.get("/models/metadata", tags=["Model Registry"])
def get_model_metadata():
    return model_registry.get_metadata()


# Mount all /ai/* and /ml/* routes
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
