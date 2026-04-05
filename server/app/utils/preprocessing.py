import pandas as pd
from sklearn.preprocessing import StandardScaler

FEATURES = ["study_hours", "attendance", "exam_score"]
ALL_FEATURES = ["study_hours", "attendance", "assignment_score", "exam_score"]

def load_dataset(path: str) -> pd.DataFrame:
    """Load and validate dataset from CSV."""
    df = pd.read_csv(path)
    required = ["student_id", "study_hours", "attendance", "assignment_score", "exam_score"]
    for col in required:
        if col not in df.columns:
            raise ValueError(f"Missing column: {col}")
    # Drop rows with nulls in feature columns
    df = df.dropna(subset=ALL_FEATURES)
    return df

def normalize_features(df: pd.DataFrame, features: list = FEATURES):
    """Normalize features using StandardScaler. Returns scaled array + scaler."""
    scaler = StandardScaler()
    X = scaler.fit_transform(df[features])
    return X, scaler

def compute_correlation_matrix(df: pd.DataFrame) -> dict:
    """Return correlation matrix as dict for frontend heatmap."""
    corr = df[ALL_FEATURES].corr()
    return {
        "labels": ALL_FEATURES,
        "matrix": corr.values.tolist()
    }

def get_cluster_label(cluster_id: int, stats: dict) -> str:
    """Assign human-readable label to cluster based on avg exam score."""
    score = stats.get("avg_exam_score", 0)
    if score >= 75:
        return "High Performers"
    elif score >= 50:
        return "Average Students"
    else:
        return "Needs Support"

def detect_at_risk_students(df: pd.DataFrame) -> list:
    """Identify students at risk based on low attendance and exam score."""
    at_risk = df[
        (df["attendance"] < 60) | 
        (df["exam_score"] < 40) |
        (df["study_hours"] < 2)
    ].copy()
    return at_risk["student_id"].tolist() if not at_risk.empty else []
