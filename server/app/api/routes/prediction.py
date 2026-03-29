from fastapi import APIRouter, HTTPException
from app.models.student_model import PredictRequest
from app.services.prediction_service import predict_student

router = APIRouter(prefix="/predict", tags=["prediction"])

@router.post("/")
async def predict(request: PredictRequest):
    """Predict student cluster using Decision Tree."""
    try:
        result = predict_student(
            study_hours=request.study_hours,
            attendance=request.attendance,
            exam_score=request.exam_score,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
