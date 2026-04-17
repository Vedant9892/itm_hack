from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class ActivityLevel(str, Enum):
    low = "low"
    moderate = "moderate"
    high = "high"
    intense = "intense"

class HealthReading(BaseModel):
    heart_rate: float
    resting_heart_rate: float
    steps: int
    sleep_duration: float = Field(..., description="Duration in minutes")
    activity_level: ActivityLevel
    timestamp: datetime = Field(..., description="ISO 8601 Timestamp, timezone-aware")

class HealthDataInput(BaseModel):
    user_id: str
    readings: List[HealthReading]

class TargetStressResponse(BaseModel):
    stress_score: int = Field(..., ge=0, le=100)
    stress_level: str
    recommendation: str

class CalculationResponse(BaseModel):
    status: str
    message: Optional[str] = None
    data: Optional[TargetStressResponse] = None
