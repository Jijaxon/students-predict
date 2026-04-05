from fastapi import APIRouter, HTTPException, Query
from ...services.clustering_service import get_clusters, get_elbow_data
from ...services.comparison_service import compare_clustering_algorithms

router = APIRouter(prefix="/clusters", tags=["clustering"])

@router.get("/")
async def get_clustering_results(n_clusters: int = Query(default=3, ge=2, le=10)):
    """Return KMeans clustering results."""
    try:
        return get_clusters(n_clusters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/elbow")
async def get_elbow(max_k: int = Query(default=10, ge=3, le=15)):
    """Return elbow method data for optimal cluster selection."""
    try:
        return get_elbow_data(max_k)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/compare")
async def compare_algorithms(
    n_clusters: int = Query(default=3, ge=2, le=10),
    eps: float = Query(default=None),
    min_samples: int = Query(default=5, ge=2, le=20),
):
    """
    Compare KMeans and DBSCAN clustering algorithms on the same dataset.
    
    Returns metrics, comparison results, and visualization data for both algorithms.
    """
    try:
        result = compare_clustering_algorithms(
            n_clusters=n_clusters,
            eps=eps,
            min_samples=min_samples,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
