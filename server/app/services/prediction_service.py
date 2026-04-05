import numpy as np
import pandas as pd
import joblib
import os
from sklearn.tree import DecisionTreeClassifier
from ..core.config import settings
from ..services.clustering_service import get_kmeans, get_scaler, train_kmeans
from ..utils.preprocessing import load_dataset, normalize_features, FEATURES, get_cluster_label

_dt_cache = {}
_prediction_cache = {}

def _get_dt_path(n_clusters: int) -> str:
    os.makedirs(settings.MODEL_DIR, exist_ok=True)
    return os.path.join(settings.MODEL_DIR, f"decision_tree_{n_clusters}.pkl")


def _prepare_prediction_cache(n_clusters: int):
    """Cache dataset, scaled features, and KMeans labels for fast prediction."""
    if n_clusters in _prediction_cache:
        return _prediction_cache[n_clusters]

    df = load_dataset(settings.DATASET_PATH)
    scaler = get_scaler()
    X_all = scaler.transform(df[FEATURES])
    kmeans = get_kmeans(n_clusters)
    labels = kmeans.predict(X_all)

    df_cached = df.copy()
    df_cached["cluster"] = labels

    cache_entry = {
        "df": df_cached,
        "X_all": X_all,
        "labels": labels,
    }
    _prediction_cache[n_clusters] = cache_entry
    return cache_entry


def clear_prediction_cache():
    """Clear cached prediction data when dataset or models are retrained."""
    _prediction_cache.clear()

def train_decision_tree(n_clusters: int = 3) -> DecisionTreeClassifier:
    """Train Decision Tree on cluster labels from KMeans."""
    df = load_dataset(settings.DATASET_PATH)
    kmeans, scaler = train_kmeans(df, n_clusters)
    
    X_scaled = scaler.transform(df[FEATURES])
    labels = kmeans.predict(X_scaled)
    
    dt = DecisionTreeClassifier(max_depth=5, random_state=42)
    dt.fit(X_scaled, labels)
    
    joblib.dump(dt, _get_dt_path(n_clusters))
    _dt_cache[f"dt_{n_clusters}"] = dt
    return dt

def get_decision_tree(n_clusters: int = 3) -> DecisionTreeClassifier:
    key = f"dt_{n_clusters}"
    if key not in _dt_cache:
        path = _get_dt_path(n_clusters)
        if os.path.exists(path):
            _dt_cache[key] = joblib.load(path)
        else:
            train_decision_tree(n_clusters)
    return _dt_cache[key]

def predict_student(study_hours: float, attendance: float, exam_score: float, n_clusters: int = 3) -> dict:
    """Predict cluster for a new student and find similar students."""
    scaler = get_scaler()
    dt = get_decision_tree(n_clusters)
    prediction_cache = _prepare_prediction_cache(n_clusters)
    df = prediction_cache["df"]

    # Prepare input as DataFrame to preserve feature names
    X_input = pd.DataFrame([[study_hours, attendance, exam_score]], columns=FEATURES)
    X_scaled = scaler.transform(X_input)

    predicted_cluster = int(dt.predict(X_scaled)[0])
    proba = dt.predict_proba(X_scaled)[0]
    confidence = round(float(proba[predicted_cluster]) * 100, 1)

    similar = df[df["cluster"] == predicted_cluster].head(5)
    
    # Cluster stats for label
    group = df[df["cluster"] == predicted_cluster]
    stats = {
        "avg_exam_score": group["exam_score"].mean(),
        "avg_attendance": group["attendance"].mean(),
        "avg_study_hours": group["study_hours"].mean(),
    }
    cluster_label = get_cluster_label(predicted_cluster, stats)
    
    return {
        "predicted_cluster": predicted_cluster,
        "cluster_label": cluster_label,
        "confidence": confidence,
        "cluster_stats": {
            "size": len(group),
            "avg_study_hours": round(stats["avg_study_hours"], 2),
            "avg_attendance": round(stats["avg_attendance"], 2),
            "avg_exam_score": round(stats["avg_exam_score"], 2),
        },
        "similar_students": similar[["student_id", "study_hours", "attendance", "exam_score"]].to_dict(orient="records"),
    }
