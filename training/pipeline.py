from typing import List

from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier


DEFAULT_FEATURES = [
    "air_temperature",
    "process_temperature",
    "rotational_speed",
    "torque",
    "tool_wear",
]


def build_pipeline(random_state: int = 42) -> Pipeline:
    """Build an sklearn Pipeline that encapsulates preprocessing and the model.

    The pipeline contains a SimpleImputer (median) and a RandomForestClassifier.
    We keep the pipeline simple so it can be loaded unchanged in production.
    """
    imputer = SimpleImputer(strategy="median")
    rf = RandomForestClassifier(n_estimators=200, random_state=random_state, n_jobs=-1)

    pipeline = Pipeline(
        [
            ("imputer", imputer),
            ("model", rf),
        ]
    )

    return pipeline


def canonicalize_feature_names(cols: List[str]) -> List[str]:
    """Map arbitrary column names to a canonical set used in the pipeline.

    This helper is minimal: it lowercases names and replaces spaces with underscores.
    """
    return [c.strip().lower().replace(" ", "_") for c in cols]
