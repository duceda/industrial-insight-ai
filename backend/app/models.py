from datetime import datetime
from typing import Dict, Literal, Optional

from pydantic import BaseModel, Field, confloat, conint, validator


class SensorReading(BaseModel):
    air_temperature: confloat(ge=0, le=2000) = Field(..., description="Air temperature (K)")
    process_temperature: confloat(ge=0, le=3000) = Field(..., description="Process temperature (K)")
    rotational_speed: confloat(ge=0, le=20000) = Field(..., description="Rotational speed (rpm)")
    torque: confloat(ge=0, le=5000) = Field(..., description="Torque (Nm)")
    tool_wear: confloat(ge=0, le=100000) = Field(..., description="Tool wear (minutes)")
    timestamp: Optional[datetime] = None


class PredictRequest(BaseModel):
    machine_id: Optional[str] = Field(None, description="Machine identifier")
    reading: SensorReading


class PredictResponse(BaseModel):
    prob_failure: confloat(ge=0.0, le=1.0)
    risk_level: Literal["healthy", "warning", "critical"]
    feature_importances: Dict[str, float]
    model_version: str
    timestamp: datetime


class ModelMetadata(BaseModel):
    model_version: str
    trained_at: str
    metrics: Dict[str, float]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_version: Optional[str] = None
