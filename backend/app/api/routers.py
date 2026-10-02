from fastapi import APIRouter, HTTPException, Request

from ..models import (
    HealthResponse,
    ModelMetadata,
    PredictRequest,
    PredictResponse,
)

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health(request: Request):
    model_loaded = getattr(request.app.state, "model", None) is not None
    model_version = None
    if model_loaded:
        model_version = request.app.state.meta.get("model_version")
    return HealthResponse(status="ok", model_loaded=model_loaded, model_version=model_version)


@router.get("/model", response_model=ModelMetadata)
async def get_model(request: Request):
    model = getattr(request.app.state, "model", None)
    meta = getattr(request.app.state, "meta", None)
    if model is None or meta is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    # return a subset of metadata
    metrics = meta.get("metrics", {})
    filtered = {k: metrics[k] for k in ("roc_auc", "precision", "recall", "f1") if k in metrics}
    return ModelMetadata(
        model_version=meta.get("model_version"),
        trained_at=meta.get("trained_at"),
        metrics=filtered,
    )


@router.post("/predict", response_model=PredictResponse)
async def predict(payload: PredictRequest, request: Request):
    model = getattr(request.app.state, "model", None)
    meta = getattr(request.app.state, "meta", None)
    store = getattr(request.app.state, "store", None)
    if model is None or meta is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    # prepare reading dict with expected keys
    r = payload.reading.dict()

    try:
        from ..services.predictor import predict_from_pipeline

        result = predict_from_pipeline(model, meta, r)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # store
    if payload.machine_id and store is not None:
        store.add(payload.machine_id, {"reading": r, "prediction": result})

    # convert timestamp string to actual datetime in response model handled by pydantic
    return result
