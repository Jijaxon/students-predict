"""
DBSCAN clustering implementation for comparison with KMeans.

DBSCAN (Density-Based Spatial Clustering of Applications with Noise):
- Density-based clustering algorithm
- Finds clusters of arbitrary shape
- Can detect outliers/noise points
- No need to specify number of clusters in advance
- Main parameters: eps (neighborhood radius) and min_samples (min points in neighborhood)
"""

import numpy as np
import pandas as pd
import joblib
import os
from sklearn.cluster import DBSCAN
from sklearn.neighbors import NearestNeighbors
from sklearn.decomposition import PCA
from ..core.config import settings
from ..utils.preprocessing import load_dataset, normalize_features, get_cluster_label, detect_at_risk_students, FEATURES

# In-memory cache
_dbscan_cache = {}


def _get_dbscan_path() -> str:
    """Get path for saved DBSCAN model."""
    os.makedirs(settings.MODEL_DIR, exist_ok=True)
    return os.path.join(settings.MODEL_DIR, "dbscan.pkl")


def _get_eps_path() -> str:
    """Get path for optimal eps value."""
    os.makedirs(settings.MODEL_DIR, exist_ok=True)
    return os.path.join(settings.MODEL_DIR, "dbscan_eps.pkl")


def find_optimal_eps(X, k=4):
    """
    Use k-distance graph to find optimal eps for DBSCAN.
    
    The k-NN distance graph helps identify the "elbow" point where
    density starts to significantly decrease.
    
    Args:
        X: Normalized feature matrix
        k: Number of neighbors to consider (typically 4 for 2D data)
        
    Returns:
        float: Optimal eps value
    """
    neighbors = NearestNeighbors(n_neighbors=k)
    neighbors_fit = neighbors.fit(X)
    distances, indices = neighbors_fit.kneighbors(X)
    
    # Sort distances
    distances = np.sort(distances[:, k - 1], axis=0)
    
    # Find elbow point using second derivative
    diffs = np.diff(distances)
    diffs2 = np.diff(diffs)
    
    # The elbow is where the second derivative is maximum
    elbow_idx = np.argmax(diffs2)
    optimal_eps = distances[elbow_idx]
    
    return round(optimal_eps, 3)


def train_dbscan(df: pd.DataFrame, eps=None, min_samples=5):
    """
    Train DBSCAN and cache the model.
    
    Args:
        df: Input dataframe
        eps: Neighborhood radius (auto-detected if None)
        min_samples: Minimum points in neighborhood
        
    Returns:
        tuple: (dbscan_model, scaler, X_scaled)
    """
    X, scaler = normalize_features(df, FEATURES)
    
    # Auto-detect eps if not provided
    if eps is None:
        eps = find_optimal_eps(X)
    
    dbscan = DBSCAN(eps=eps, min_samples=min_samples)
    labels = dbscan.fit_predict(X)
    
    # Save models
    joblib.dump(dbscan, _get_dbscan_path())
    joblib.dump({'eps': eps, 'min_samples': min_samples}, _get_eps_path())
    
    # Cache
    _dbscan_cache["dbscan"] = dbscan
    _dbscan_cache["eps"] = eps
    _dbscan_cache["min_samples"] = min_samples
    
    return dbscan, scaler, X


def get_dbscan(eps=None, min_samples=5):
    """
    Load DBSCAN from cache or disk.
    
    Args:
        eps: Neighborhood radius (loaded from cache if available)
        min_samples: Minimum points in neighborhood
        
    Returns:
        tuple: (dbscan_model, eps, min_samples)
    """
    # Try to load from cache first
    if "dbscan" in _dbscan_cache:
        return _dbscan_cache["dbscan"], _dbscan_cache.get("eps", eps), _dbscan_cache.get("min_samples", min_samples)
    
    # Try to load from disk
    dbscan_path = _get_dbscan_path()
    eps_path = _get_eps_path()
    
    if os.path.exists(dbscan_path) and os.path.exists(eps_path):
        dbscan = joblib.load(dbscan_path)
        params = joblib.load(eps_path)
        _dbscan_cache["dbscan"] = dbscan
        _dbscan_cache["eps"] = params.get('eps', eps)
        _dbscan_cache["min_samples"] = params.get('min_samples', min_samples)
        return dbscan, params.get('eps', eps), params.get('min_samples', min_samples)
    
    # Train if not found
    df = load_dataset(settings.DATASET_PATH)
    dbscan, _, _ = train_dbscan(df, eps, min_samples)
    
    return dbscan, _dbscan_cache.get("eps", eps), _dbscan_cache.get("min_samples", min_samples)


def get_dbscan_clusters(eps=None, min_samples=5) -> dict:
    """
    Return all students with DBSCAN cluster assignments and statistics.
    
    Args:
        eps: Neighborhood radius
        min_samples: Minimum points in neighborhood
        
    Returns:
        dict with students, stats, cluster info
    """
    df = load_dataset(settings.DATASET_PATH)
    dbscan, scaler, X_scaled = train_dbscan(df, eps, min_samples)
    
    labels = dbscan.labels_
    df["cluster"] = labels
    
    # Count clusters and noise points
    n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
    n_noise = list(labels).count(-1)
    
    # PCA for 2D visualization
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X_scaled)
    df["pca_x"] = X_pca[:, 0]
    df["pca_y"] = X_pca[:, 1]
    
    # Cluster stats (excluding noise)
    cluster_stats = []
    for cid in sorted(set(labels)):
        if cid == -1:  # Skip noise
            continue
        
        group = df[df["cluster"] == cid]
        stats = {
            "cluster_id": cid,
            "avg_study_hours": round(group["study_hours"].mean(), 2),
            "avg_attendance": round(group["attendance"].mean(), 2),
            "avg_assignment_score": round(group["assignment_score"].mean(), 2),
            "avg_exam_score": round(group["exam_score"].mean(), 2),
            "size": len(group),
        }
        stats["label"] = get_cluster_label(cid, stats)
        cluster_stats.append(stats)
    
    # Add noise cluster if present
    if n_noise > 0:
        noise_group = df[df["cluster"] == -1]
        cluster_stats.append({
            "cluster_id": -1,
            "label": "Noise/Outliers",
            "avg_study_hours": round(noise_group["study_hours"].mean(), 2),
            "avg_attendance": round(noise_group["attendance"].mean(), 2),
            "avg_assignment_score": round(noise_group["assignment_score"].mean(), 2),
            "avg_exam_score": round(noise_group["exam_score"].mean(), 2),
            "size": n_noise,
        })
    
    at_risk = detect_at_risk_students(df)
    
    return {
        "students": df.to_dict(orient="records"),
        "cluster_stats": cluster_stats,
        "n_clusters": n_clusters,
        "n_noise": n_noise,
        "eps": eps if eps is not None else _dbscan_cache.get("eps"),
        "min_samples": min_samples,
        "at_risk_students": at_risk,
        "explained_variance": [round(v, 4) for v in pca.explained_variance_ratio_],
        "dbscan_info": f"Found {n_clusters} clusters with {n_noise} noise points",
    }


def clear_dbscan_cache():
    """Clear DBSCAN cache."""
    _dbscan_cache.clear()
