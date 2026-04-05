"""
Clustering evaluation metrics module.

Provides comprehensive evaluation metrics for clustering algorithms:
- Silhouette Score: Measures how similar objects are to their own cluster vs other clusters (-1 to 1)
- Davies-Bouldin Index: Ratio of within-cluster to between-cluster distances (lower is better)
- Calinski-Harabasz Index: Ratio of between-cluster to within-cluster variance (higher is better)
- Accuracy: If true labels are available, percentage of correct cluster assignments
"""

import numpy as np
import pandas as pd
from sklearn.metrics import (
    silhouette_score,
    davies_bouldin_score,
    calinski_harabasz_score,
    accuracy_score,
    adjusted_rand_score,
    fowlkes_mallows_score,
)


def evaluate_clustering(X, labels, true_labels=None):
    """
    Evaluate clustering results using multiple metrics.
    
    Args:
        X: Feature matrix (n_samples, n_features) - normalized/scaled
        labels: Cluster labels from algorithm (n_samples,)
        true_labels: Optional true cluster labels for accuracy calculation
        
    Returns:
        dict with evaluation metrics
    """
    if len(np.unique(labels)) == 1:
        # If only one cluster, some metrics fail
        return {
            "silhouette_score": 0.0,
            "davies_bouldin_index": 999.99,
            "calinski_harabasz_index": 0.0,
            "accuracy": 0.0 if true_labels is not None else None,
            "adjusted_rand_index": 0.0 if true_labels is not None else None,
        }
    
    metrics = {}
    
    # Silhouette Score ([-1, 1], closer to 1 is better)
    try:
        metrics["silhouette_score"] = round(silhouette_score(X, labels), 4)
    except Exception as e:
        print(f"Silhouette score error: {e}")
        metrics["silhouette_score"] = 0.0
    
    # Davies-Bouldin Index (lower is better)
    try:
        metrics["davies_bouldin_index"] = round(davies_bouldin_score(X, labels), 4)
    except Exception as e:
        print(f"Davies-Bouldin error: {e}")
        metrics["davies_bouldin_index"] = 999.99
    
    # Calinski-Harabasz Index (higher is better)
    try:
        metrics["calinski_harabasz_index"] = round(calinski_harabasz_score(X, labels), 4)
    except Exception as e:
        print(f"Calinski-Harabasz error: {e}")
        metrics["calinski_harabasz_index"] = 0.0
    
    # Accuracy if true labels available
    if true_labels is not None:
        try:
            # Adjusted Rand Index (normalized similarity between two labelings)
            metrics["adjusted_rand_index"] = round(adjusted_rand_score(true_labels, labels), 4)
            # Fowlkes-Mallows Index (geometric mean of precision and recall)
            metrics["fowlkes_mallows_index"] = round(fowlkes_mallows_score(true_labels, labels), 4)
        except Exception as e:
            print(f"Label comparison error: {e}")
            metrics["adjusted_rand_index"] = 0.0
            metrics["fowlkes_mallows_index"] = 0.0
    else:
        metrics["adjusted_rand_index"] = None
        metrics["fowlkes_mallows_index"] = None
    
    return metrics


def calculate_accuracy(true_labels, predicted_labels):
    """
    Calculate accuracy between true and predicted labels.
    Uses a mapping strategy to find best label alignment.
    
    Args:
        true_labels: True cluster assignments
        predicted_labels: Predicted cluster assignments
        
    Returns:
        float: Accuracy percentage (0-100)
    """
    if len(true_labels) != len(predicted_labels):
        return 0.0
    
    # Try to find best mapping between predicted and true labels
    unique_predicted = np.unique(predicted_labels)
    unique_true = np.unique(true_labels)
    
    best_accuracy = 0.0
    
    # For each possible mapping, calculate accuracy
    from itertools import permutations
    
    if len(unique_predicted) <= len(unique_true):
        # Try all permutations of predicted labels mapped to true labels
        for perm in permutations(unique_true, len(unique_predicted)):
            mapping = {pred: true_label for pred, true_label in zip(unique_predicted, perm)}
            mapped_labels = np.array([mapping.get(p, -1) for p in predicted_labels])
            accuracy = np.mean(mapped_labels == true_labels)
            best_accuracy = max(best_accuracy, accuracy)
    else:
        # If more predicted clusters than true, use direct comparison
        best_accuracy = 0.0
    
    return round(best_accuracy * 100, 2)


def compare_algorithms_metrics(X, labels_algo1, labels_algo2, true_labels=None):
    """
    Compare two clustering algorithms using all metrics.
    
    Args:
        X: Feature matrix
        labels_algo1: Labels from first algorithm
        labels_algo2: Labels from second algorithm
        true_labels: Optional true labels
        
    Returns:
        dict with comparison results
    """
    metrics1 = evaluate_clustering(X, labels_algo1, true_labels)
    metrics2 = evaluate_clustering(X, labels_algo2, true_labels)
    
    # Determine winner for each metric
    # Higher is better for: silhouette_score, calinski_harabasz_index, adjusted_rand_index, fowlkes_mallows_index
    # Lower is better for: davies_bouldin_index
    
    winners = {}
    
    # Silhouette Score (higher is better)
    if metrics1["silhouette_score"] > metrics2["silhouette_score"]:
        winners["silhouette_score"] = "algo1"
    elif metrics2["silhouette_score"] > metrics1["silhouette_score"]:
        winners["silhouette_score"] = "algo2"
    else:
        winners["silhouette_score"] = "tie"
    
    # Davies-Bouldin Index (lower is better)
    if metrics1["davies_bouldin_index"] < metrics2["davies_bouldin_index"]:
        winners["davies_bouldin_index"] = "algo1"
    elif metrics2["davies_bouldin_index"] < metrics1["davies_bouldin_index"]:
        winners["davies_bouldin_index"] = "algo2"
    else:
        winners["davies_bouldin_index"] = "tie"
    
    # Calinski-Harabasz Index (higher is better)
    if metrics1["calinski_harabasz_index"] > metrics2["calinski_harabasz_index"]:
        winners["calinski_harabasz_index"] = "algo1"
    elif metrics2["calinski_harabasz_index"] > metrics1["calinski_harabasz_index"]:
        winners["calinski_harabasz_index"] = "algo2"
    else:
        winners["calinski_harabasz_index"] = "tie"
    
    # Count wins
    algo1_wins = sum(1 for v in winners.values() if v == "algo1")
    algo2_wins = sum(1 for v in winners.values() if v == "algo2")
    
    return {
        "algorithm_1": {
            "name": "KMeans",
            "metrics": metrics1,
        },
        "algorithm_2": {
            "name": "DBSCAN",
            "metrics": metrics2,
        },
        "comparison": {
            "algo1_wins": algo1_wins,
            "algo2_wins": algo2_wins,
            "winner": "algo1" if algo1_wins > algo2_wins else ("algo2" if algo2_wins > algo1_wins else "tie"),
            "metric_winners": winners,
        }
    }
