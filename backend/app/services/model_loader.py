import joblib
from pathlib import Path
from typing import Any


class ModelLoadError(RuntimeError):
    pass


def load_model(path: str | Path) -> dict[str, Any]:
    p = Path(path)
    if not p.exists():
        raise ModelLoadError(f"Model artifact not found at {p}")
    try:
        obj = joblib.load(str(p))
    except Exception as e:
        raise ModelLoadError(f"Failed to load model artifact: {e}") from e

    if not isinstance(obj, dict) or "pipeline" not in obj or "meta" not in obj:
        raise ModelLoadError("Model artifact format invalid: expected dict with 'pipeline' and 'meta' keys")

    return obj
