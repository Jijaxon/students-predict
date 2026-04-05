from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api.routes import students, clustering, prediction
from .services.clustering_service import retrain_models
import uvicorn

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Student Academic Performance Clustering API using KMeans + Decision Tree",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(students.router)
app.include_router(clustering.router)
app.include_router(prediction.router)

@app.on_event("startup")
async def startup_event():
    """Pre-train models on startup."""
    try:
        retrain_models()
        print("✅ Models trained and ready")
    except Exception as e:
        print(f"⚠️ Startup training failed: {e}")

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "endpoints": ["/students", "/clusters", "/predict", "/docs"],
    }

@app.get("/health")
async def health():
    return {"status": "ok", "version": settings.VERSION}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
