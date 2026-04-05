from fastapi import APIRouter, HTTPException, UploadFile, File
from ...core.config import settings
from ...utils.preprocessing import load_dataset, compute_correlation_matrix
from ...services.clustering_service import retrain_models, get_correlation_data
import pandas as pd
import io

router = APIRouter(prefix="/students", tags=["students"])

@router.get("/")
async def get_students():
    """Return all student records."""
    try:
        df = load_dataset(settings.DATASET_PATH)
        return {
            "students": df.to_dict(orient="records"),
            "total": len(df),
            "summary": {
                "avg_study_hours": round(df["study_hours"].mean(), 2),
                "avg_attendance": round(df["attendance"].mean(), 2),
                "avg_assignment_score": round(df["assignment_score"].mean(), 2),
                "avg_exam_score": round(df["exam_score"].mean(), 2),
                "study_hours_distribution": {
                    "min": round(df["study_hours"].min(), 1),
                    "max": round(df["study_hours"].max(), 1),
                    "std": round(df["study_hours"].std(), 2),
                },
                "score_distribution": {
                    "below_50": int((df["exam_score"] < 50).sum()),
                    "50_to_75": int(((df["exam_score"] >= 50) & (df["exam_score"] < 75)).sum()),
                    "above_75": int((df["exam_score"] >= 75).sum()),
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/correlation")
async def get_correlation():
    """Return correlation matrix for heatmap."""
    try:
        return get_correlation_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Upload a new CSV dataset and retrain models."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        
        required = ["student_id", "study_hours", "attendance", "assignment_score", "exam_score"]
        missing = [c for c in required if c not in df.columns]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing columns: {missing}")
        
        df.to_csv(settings.DATASET_PATH, index=False)
        result = retrain_models()
        return {"message": "Dataset uploaded and models retrained", **result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/retrain")
async def retrain():
    """Retrain all ML models."""
    try:
        result = retrain_models()
        return {"message": "Models retrained successfully", **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
