from datetime import datetime
from typing import Dict, List

import numpy as np
import pandas as pd

from ..config import THRESHOLDS


def map_feature_names(request_keys: List[str], model_feature_names: List[str]) -> Dict[str, str]:
    """Map canonical request keys (e.g., 'air_temperature') to model feature names.

    Mapping strategy: for each expected key, find the first model feature name that contains the key.
    """
    mapping = {}
    lower_model = [m.lower() for m in model_feature_names]
    for rk in request_keys:
        key_norm = rk.replace("_", " ").lower()
        found = None
        for im, mv in enumerate(lower_model):
            if key_norm in mv:
                found = model_feature_names[im]
                break
        if found is None:
            raise ValueError(f"Could not map request feature '{rk}' to model features {model_feature_names}")
        mapping[rk] = found
    return mapping


def normalize_importances(importances: List[float]) -> List[float]:
    arr = np.array(importances, dtype=float)
    total = arr.sum()
    if total <= 0:
        return [0.0 for _ in arr]
    return (arr / total).tolist()


def predict_from_pipeline(pipeline, meta, reading: Dict[str, float]) -> Dict:
    # determine model feature names: prefer raw names saved in metadata, else try introspection
    model_features: List[str] = []
    if meta.get("feature_names_raw"):
        model_features = meta.get("feature_names_raw")
    else:
        # try to introspect pipeline
        rf = pipeline.named_steps.get("model")
        if rf is not None and hasattr(rf, "feature_names_in_"):
            model_features = list(rf.feature_names_in_)
        elif hasattr(pipeline, "feature_names_in_"):
            model_features = list(pipeline.feature_names_in_)
        else:
            model_features = meta.get("feature_names", [])

    # expected request keys
    expected = [
        "air_temperature",
        "process_temperature",
        "rotational_speed",
        "torque",
        "tool_wear",
    ]

    mapping = map_feature_names(expected, model_features)

    # build DataFrame in model feature order
    row = {}
    for mf in model_features:
        # find which request key maps to this mf
        rk = None
        for k, v in mapping.items():
            if v == mf:
                rk = k
                break
        if rk is None:
            # fallback 0
            row[mf] = 0.0
        else:
            row[mf] = float(reading[rk])

    X = pd.DataFrame([row], columns=model_features)

    proba = pipeline.predict_proba(X)
    # assume class 1 is failure
    prob_failure = float(proba[:, 1][0])

    # risk level
    if prob_failure < THRESHOLDS["healthy"]:
        risk = "healthy"
    elif prob_failure < THRESHOLDS["warning"]:
        risk = "warning"
    else:
        risk = "critical"

    # feature importances
    rf = pipeline.named_steps.get("model")
    importances = []
    if rf is not None and hasattr(rf, "feature_importances_"):
        importances = rf.feature_importances_.tolist()
    else:
        importances = [0.0 for _ in model_features]

    norm = normalize_importances(importances)

    # map normalized importances back to friendly keys (expected names)
    fi_map = {}
    for k, v in mapping.items():
        idx = model_features.index(v)
        fi_map[k] = round(norm[idx], 4)

    result = {
        "prob_failure": prob_failure,
        "risk_level": risk,
        "feature_importances": fi_map,
        "model_version": meta.get("model_version", "unknown"),
        "timestamp": datetime.utcnow(),
    }

    return result
