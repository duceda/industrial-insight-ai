import argparse
import json
import os
import pathlib
import time
from datetime import datetime
from io import BytesIO
from typing import List

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    roc_auc_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split

from pipeline import build_pipeline, canonicalize_feature_names


DEFAULT_FEATURES_KEYWORDS = [
    "air",
    "process",
    "rotational",
    "torque",
    "tool",
]


def load_data(path: str) -> pd.DataFrame:
    path = pathlib.Path(path)
    if not path.exists():
        raise FileNotFoundError(f"CSV file not found: {path}")
    return pd.read_csv(path)


def detect_target(df: pd.DataFrame) -> str:
    # find a column containing 'failure'
    for c in df.columns:
        if "failure" in c.lower():
            return c
    raise ValueError("Could not detect target column containing 'failure' in the dataset")


def select_features(df: pd.DataFrame) -> List[str]:
    cols = []
    lowcols = {c: c.lower() for c in df.columns}
    for kw in DEFAULT_FEATURES_KEYWORDS:
        # find column containing keyword
        found = None
        for orig, low in lowcols.items():
            if kw in low:
                found = orig
                break
        if found is None:
            raise ValueError(f"Could not find a column matching keyword '{kw}' in dataset columns")
        cols.append(found)
    return cols


def evaluate_and_report(pipeline, X_test: pd.DataFrame, y_test: pd.Series) -> dict:
    prob = pipeline.predict_proba(X_test)[:, 1]
    preds = (prob >= 0.5).astype(int)

    metrics = {
        "roc_auc": float(roc_auc_score(y_test, prob)),
        "precision": float(precision_score(y_test, preds, zero_division=0)),
        "recall": float(recall_score(y_test, preds, zero_division=0)),
        "f1": float(f1_score(y_test, preds, zero_division=0)),
        "confusion_matrix": [int(x) for x in confusion_matrix(y_test, preds).ravel()],
    }
    return metrics


def save_artifact(pipeline, features_raw: List[str], features_display: List[str], metrics: dict, outdir: str, random_state: int):
    os.makedirs(outdir, exist_ok=True)
    timestamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    model_version = f"v{timestamp}"
    model_fname = os.path.join(outdir, f"model_{model_version}.joblib")
    meta = {
        "model_version": model_version,
        "trained_at": timestamp,
        # feature_names: canonicalized for human display; feature_names_raw: actual column names used to fit
        "feature_names": features_display,
        "feature_names_raw": features_raw,
        "metrics": metrics,
        "random_state": random_state,
    }

    joblib.dump({"pipeline": pipeline, "meta": meta}, model_fname)
    with open(os.path.join(outdir, f"metadata_{model_version}.json"), "w", encoding="utf8") as f:
        json.dump(meta, f, indent=2)

    return model_fname, meta


def main():
    parser = argparse.ArgumentParser(description="Train RandomForest pipeline on AI4I dataset")
    parser.add_argument("--input", required=True, help="Path to AI4I CSV file")
    parser.add_argument("--outdir", default="../artifacts/models", help="Output directory for model and metadata")
    parser.add_argument("--random-state", type=int, default=42)
    parser.add_argument("--test-size", type=float, default=0.2)
    parser.add_argument("--val-size", type=float, default=0.1)

    args = parser.parse_args()

    print("Loading data from", args.input)
    df = load_data(args.input)
    print("Data shape:", df.shape)

    target_col = detect_target(df)
    print("Detected target column:", target_col)

    feature_cols = select_features(df)
    print("Selected features:", feature_cols)

    X = df[feature_cols].copy()
    y = df[target_col].copy().astype(int)

    # reproducible splits: first train+val vs test, then train vs val
    X_temp, X_test, y_temp, y_test = train_test_split(
        X, y, test_size=args.test_size, random_state=args.random_state, stratify=y
    )

    # compute val_size relative to original train+val
    val_rel = args.val_size / (1.0 - args.test_size)
    X_train, X_val, y_train, y_val = train_test_split(
        X_temp, y_temp, test_size=val_rel, random_state=args.random_state, stratify=y_temp
    )

    print("Train shape:", X_train.shape, "Val shape:", X_val.shape, "Test shape:", X_test.shape)

    pipeline = build_pipeline(random_state=args.random_state)
    print("Training pipeline...")
    pipeline.fit(X_train, y_train)

    print("Evaluating on test set...")
    metrics = evaluate_and_report(pipeline, X_test, y_test)

    outdir = os.path.abspath(os.path.join(os.path.dirname(__file__), args.outdir))
    model_path, meta = save_artifact(
        pipeline,
        features_raw=feature_cols,
        features_display=canonicalize_feature_names(feature_cols),
        metrics=metrics,
        outdir=outdir,
        random_state=args.random_state,
    )

    print("Saved model to:", model_path)
    print("Metadata:")
    print(json.dumps(meta, indent=2))


if __name__ == "__main__":
    main()
