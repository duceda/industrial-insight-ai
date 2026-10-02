Training scripts for Industrial Insight AI

How to run

1. Place the AI4I dataset CSV or ZIP in the repository root.
2. From this folder run:

```bash
python train.py --input ../ai4i+2020+predictive+maintenance+dataset.zip
```

This will produce a joblib artifact and a metadata JSON in `../artifacts/models/`.

Notes
- The preprocessing is embedded in the sklearn Pipeline (SimpleImputer + RandomForest).
- The script auto-detects the target column containing the word "failure" and attempts
  to match the five required features by keyword.
