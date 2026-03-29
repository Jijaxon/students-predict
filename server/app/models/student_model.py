from pydantic import BaseModel, Field
from typing import Optional

class StudentBase(BaseModel):
    study_hours: float = Field(..., ge=0, le=24, description="Daily study hours")
    attendance: float = Field(..., ge=0, le=100, description="Attendance percentage")
    assignment_score: float = Field(..., ge=0, le=100, description="Assignment score")
    exam_score: float = Field(..., ge=0, le=100, description="Exam score")

class StudentRecord(StudentBase):
    student_id: str
    cluster: Optional[int] = None

class PredictRequest(BaseModel):
    study_hours: float = Field(..., ge=0, le=24)
    attendance: float = Field(..., ge=0, le=100)
    exam_score: float = Field(..., ge=0, le=100)

class PredictResponse(BaseModel):
    predicted_cluster: int
    cluster_label: str
    confidence: float
    similar_students: list

class ClusterStats(BaseModel):
    cluster_id: int
    label: str
    size: int
    avg_study_hours: float
    avg_attendance: float
    avg_assignment_score: float
    avg_exam_score: float

class ClusteringResponse(BaseModel):
    students: list
    cluster_stats: list[ClusterStats]
    n_clusters: int
    inertia: float

class ElbowData(BaseModel):
    k_values: list[int]
    inertia_values: list[float]
    optimal_k: int
