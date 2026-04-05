import numpy as np
import pandas as pd
import joblib
import os
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from ..core.config import settings
from ..utils.preprocessing import load_dataset, normalize_features, compute_correlation_matrix, get_cluster_label, detect_at_risk_students, FEATURES

# In-memory cache
_cache = {}

def _get_model_path(n_clusters: int) -> str:
    os.makedirs(settings.MODEL_DIR, exist_ok=True)
    return os.path.join(settings.MODEL_DIR, f"kmeans_{n_clusters}.pkl")

def _get_scaler_path() -> str:
    os.makedirs(settings.MODEL_DIR, exist_ok=True)
    return os.path.join(settings.MODEL_DIR, "scaler.pkl")

def train_kmeans(df: pd.DataFrame, n_clusters: int = 3):
    """Train KMeans and cache the model."""
    X, scaler = normalize_features(df, FEATURES)
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    kmeans.fit(X)
    
    # Save models
    joblib.dump(kmeans, _get_model_path(n_clusters))
    joblib.dump(scaler, _get_scaler_path())
    
    # Cache
    _cache[f"kmeans_{n_clusters}"] = kmeans
    _cache["scaler"] = scaler
    
    return kmeans, scaler

def get_kmeans(n_clusters: int = 3):
    """Load from cache or disk."""
    key = f"kmeans_{n_clusters}"
    if key not in _cache:
        path = _get_model_path(n_clusters)
        if os.path.exists(path):
            _cache[key] = joblib.load(path)
        else:
            df = load_dataset(settings.DATASET_PATH)
            train_kmeans(df, n_clusters)
    return _cache[key]

def get_scaler():
    if "scaler" not in _cache:
        path = _get_scaler_path()
        if os.path.exists(path):
            _cache["scaler"] = joblib.load(path)
        else:
            df = load_dataset(settings.DATASET_PATH)
            train_kmeans(df, settings.DEFAULT_N_CLUSTERS)
    return _cache["scaler"]

def get_clusters(n_clusters: int = 3) -> dict:
    """Return all students with cluster assignments and statistics."""
    df = load_dataset(settings.DATASET_PATH)
    kmeans, scaler = train_kmeans(df, n_clusters)
    
    X_scaled, _ = normalize_features(df, FEATURES)
    # Re-use already-fitted scaler
    X_scaled = scaler.transform(df[FEATURES])
    labels = kmeans.predict(X_scaled)
    df["cluster"] = labels
    
    # PCA for 2D visualization
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X_scaled)
    df["pca_x"] = X_pca[:, 0]
    df["pca_y"] = X_pca[:, 1]
    
    # Cluster stats
    cluster_stats = []
    for cid in range(n_clusters):
        group = df[df["cluster"] == cid]
        stats = {
            "cluster_id": cid,
            "avg_study_hours": round(group["study_hours"].mean(), 2),
            "avg_attendance": round(group["attendance"].mean(), 2),
            "avg_assignment_score": round(group["assignment_score"].mean(), 2),
            "avg_exam_score": round(group["exam_score"].mean(), 2),
        }
        stats["label"] = get_cluster_label(cid, stats)
        stats["size"] = len(group)
        cluster_stats.append(stats)
    
    at_risk = detect_at_risk_students(df)
    
    return {
        "students": df.to_dict(orient="records"),
        "cluster_stats": cluster_stats,
        "n_clusters": n_clusters,
        "inertia": round(kmeans.inertia_, 2),
        "at_risk_students": at_risk,
        "explained_variance": [round(v, 4) for v in pca.explained_variance_ratio_],
    }

def get_elbow_data(max_k: int = 10) -> dict:
    """Compute inertia for k=2..max_k to find optimal clusters."""
    df = load_dataset(settings.DATASET_PATH)
    X, scaler = normalize_features(df, FEATURES)
    
    k_values = list(range(2, max_k + 1))
    inertias = []
    for k in k_values:
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        km.fit(X)
        inertias.append(round(km.inertia_, 2))
    
    # Find elbow using second derivative
    diffs = np.diff(inertias)
    diffs2 = np.diff(diffs)
    optimal_idx = np.argmax(diffs2) + 2  # offset for k starting at 2
    optimal_k = k_values[optimal_idx]
    
    return {
        "k_values": k_values,
        "inertia_values": inertias,
        "optimal_k": optimal_k,
    }

def retrain_models() -> dict:
    """Clear cache and retrain all models (KMeans and DBSCAN)."""
    _cache.clear()
    df = load_dataset(settings.DATASET_PATH)
    for k in [2, 3, 4, 5]:
        train_kmeans(df, k)
    
    # Also retrain DBSCAN
    try:
        from .dbscan_service import train_dbscan, clear_dbscan_cache
        clear_dbscan_cache()
        train_dbscan(df)
    except Exception as e:
        print(f"DBSCAN retrain warning: {e}")
    
    return {"status": "retrained", "n_students": len(df)}

def get_correlation_data() -> dict:
    df = load_dataset(settings.DATASET_PATH)
    return compute_correlation_matrix(df)
