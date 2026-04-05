"""
Comparison service for clustering algorithms.

Runs both KMeans and DBSCAN on the same dataset and compares their performance
using evaluation metrics.
"""

import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from ..core.config import settings
from ..utils.preprocessing import load_dataset, normalize_features, FEATURES
from .clustering_service import get_kmeans, get_scaler
from .dbscan_service import get_dbscan
from .evaluation_service import evaluate_clustering, compare_algorithms_metrics


def compare_clustering_algorithms(n_clusters=3, eps=None, min_samples=5):
    """
    Run both KMeans and DBSCAN and compare performance.
    
    Args:
        n_clusters: Number of clusters for KMeans
        eps: DBSCAN neighborhood radius (auto-detected if None)
        min_samples: DBSCAN minimum samples parameter
        
    Returns:
        dict with comparison results including metrics and visualizations
    """
    # Load and prepare data
    df = load_dataset(settings.DATASET_PATH)
    X, scaler = normalize_features(df, FEATURES)
    
    # Run KMeans
    kmeans = get_kmeans(n_clusters)
    kmeans_labels = kmeans.predict(X)
    
    # Run DBSCAN
    dbscan, eps_used, min_samples_used = get_dbscan(eps, min_samples)
    dbscan_labels = dbscan.fit_predict(X)
    
    # Evaluate both algorithms
    kmeans_metrics = evaluate_clustering(X, kmeans_labels)
    dbscan_metrics = evaluate_clustering(X, dbscan_labels)
    
    # Count clusters for DBSCAN
    n_dbscan_clusters = len(set(dbscan_labels)) - (1 if -1 in dbscan_labels else 0)
    n_dbscan_noise = list(dbscan_labels).count(-1)
    
    # Try to use exam_score as pseudo-labels if available
    try:
        true_labels = pd.cut(df['exam_score'], bins=3, labels=[0, 1, 2])
        true_labels = true_labels.fillna(0).astype(int).values
    except:
        true_labels = None
    
    # PCA for visualization
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X)
    
    # Prepare cluster data for visualization
    kmeans_viz_data = []
    for i, (px, py) in enumerate(X_pca):
        kmeans_viz_data.append({
            "x": round(float(px), 4),
            "y": round(float(py), 4),
            "cluster": int(kmeans_labels[i]),
            "student_id": df.iloc[i]["student_id"],
        })
    
    dbscan_viz_data = []
    for i, (px, py) in enumerate(X_pca):
        dbscan_viz_data.append({
            "x": round(float(px), 4),
            "y": round(float(py), 4),
            "cluster": int(dbscan_labels[i]),
            "student_id": df.iloc[i]["student_id"],
            "is_noise": int(dbscan_labels[i]) == -1,
        })
    
    # Calculate performance comparison
    # For each metric, determine which algorithm is better
    comparison_summary = {
        "silhouette": {
            "kmeans": kmeans_metrics["silhouette_score"],
            "dbscan": dbscan_metrics["silhouette_score"],
            "winner": "KMeans" if kmeans_metrics["silhouette_score"] > dbscan_metrics["silhouette_score"] else "DBSCAN",
            "interpretation": "Measures how similar points are to their own cluster vs others (-1 to 1, higher is better)",
        },
        "davies_bouldin": {
            "kmeans": kmeans_metrics["davies_bouldin_index"],
            "dbscan": dbscan_metrics["davies_bouldin_index"],
            "winner": "KMeans" if kmeans_metrics["davies_bouldin_index"] < dbscan_metrics["davies_bouldin_index"] else "DBSCAN",
            "interpretation": "Ratio of within to between-cluster distances (lower is better)",
        },
        "calinski_harabasz": {
            "kmeans": kmeans_metrics["calinski_harabasz_index"],
            "dbscan": dbscan_metrics["calinski_harabasz_index"],
            "winner": "KMeans" if kmeans_metrics["calinski_harabasz_index"] > dbscan_metrics["calinski_harabasz_index"] else "DBSCAN",
            "interpretation": "Ratio of between to within-cluster variance (higher is better)",
        },
    }
    
    # Overall winner
    kmeans_wins = sum(1 for v in comparison_summary.values() if v["winner"] == "KMeans")
    dbscan_wins = sum(1 for v in comparison_summary.values() if v["winner"] == "DBSCAN")
    overall_winner = "KMeans" if kmeans_wins > dbscan_wins else ("DBSCAN" if dbscan_wins > kmeans_wins else "Tie")
    
    return {
        "algorithms": {
            "kmeans": {
                "name": "KMeans",
                "description": "Centroid-based clustering. Partitions data into k clusters.",
                "n_clusters": n_clusters,
                "inertia": round(float(kmeans.inertia_), 2),
                "cluster_count": n_clusters,
            },
            "dbscan": {
                "name": "DBSCAN",
                "description": "Density-based clustering. Finds clusters of arbitrary shape and detects outliers.",
                "eps": round(eps_used, 3),
                "min_samples": min_samples_used,
                "cluster_count": n_dbscan_clusters,
                "noise_count": n_dbscan_noise,
            }
        },
        "metrics": {
            "kmeans": kmeans_metrics,
            "dbscan": dbscan_metrics,
        },
        "comparison": comparison_summary,
        "overall_winner": overall_winner,
        "kmeans_wins": kmeans_wins,
        "dbscan_wins": dbscan_wins,
        "visualization": {
            "kmeans": kmeans_viz_data,
            "dbscan": dbscan_viz_data,
            "explained_variance": [round(v, 4) for v in pca.explained_variance_ratio_],
        },
        "summary": {
            "total_students": len(df),
            "features_used": FEATURES,
            "note": "KMeans tries to create k balanced clusters, while DBSCAN finds natural clusters density-based.",
        }
    }
