"""
Train symptom prediction model using Kaggle Disease Prediction dataset.
Run: cd apps/api && .venv/bin/python scripts/train_model.py
"""

import os
import sys
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")

TRAIN_CSV = os.path.join(DATA_DIR, "Training.csv")
TEST_CSV = os.path.join(DATA_DIR, "Testing.csv")
MODEL_PATH = os.path.join(MODELS_DIR, "symptom_model.joblib")

# Normalize disease names (Kaggle dataset has typos and trailing spaces)
DISEASE_NAME_FIXES = {
    "Diabetes ": "Diabetes",
    "Hypertension ": "Hypertension",
    "Osteoarthristis": "Osteoarthritis",
    "Peptic ulcer diseae": "Peptic ulcer disease",
    "(vertigo) Paroymsal  Positional Vertigo": "(vertigo) Paroxysmal Positional Vertigo",
}


def normalize_disease_name(name: str) -> str:
    name = name.strip()
    return DISEASE_NAME_FIXES.get(name, DISEASE_NAME_FIXES.get(name + " ", name))


def main():
    print("=" * 60)
    print("Training Symptom Prediction Model")
    print("=" * 60)

    # 1. Load data
    if not os.path.exists(TRAIN_CSV):
        print(f"ERROR: Training data not found at {TRAIN_CSV}")
        print("Download from: https://www.kaggle.com/datasets/kaushil268/disease-prediction-using-machine-learning")
        sys.exit(1)

    train_df = pd.read_csv(TRAIN_CSV)
    test_df = pd.read_csv(TEST_CSV)

    print(f"Training samples: {len(train_df)}")
    print(f"Testing samples: {len(test_df)}")

    # 2. Clean data
    # Drop unnamed trailing column
    train_df = train_df.loc[:, ~train_df.columns.str.contains("^Unnamed")]
    test_df = test_df.loc[:, ~test_df.columns.str.contains("^Unnamed")]

    # Normalize disease names
    train_df["prognosis"] = train_df["prognosis"].apply(normalize_disease_name)
    test_df["prognosis"] = test_df["prognosis"].apply(normalize_disease_name)

    # 3. Prepare features and labels
    feature_cols = [c for c in train_df.columns if c != "prognosis"]
    X_train = train_df[feature_cols].values
    y_train = train_df["prognosis"].values
    X_test = test_df[feature_cols].values
    y_test = test_df["prognosis"].values

    # Clean column names (strip spaces)
    feature_cols = [c.strip().replace(" ", "_") for c in feature_cols]

    print(f"Features: {len(feature_cols)}")
    print(f"Disease classes: {len(set(y_train))}")

    # 4. Encode labels
    label_encoder = LabelEncoder()
    label_encoder.fit(np.concatenate([y_train, y_test]))
    y_train_enc = label_encoder.transform(y_train)
    y_test_enc = label_encoder.transform(y_test)

    print(f"\nDiseases: {list(label_encoder.classes_)}\n")

    # 5. Train model — optimized for maximum precision
    print("Training Random Forest (500 trees, no depth limit)...")
    model = RandomForestClassifier(
        n_estimators=500,
        max_depth=None,        # Let trees grow fully for maximum precision
        min_samples_split=3,   # Require at least 3 samples to split
        min_samples_leaf=1,
        max_features="sqrt",   # Standard for classification
        class_weight="balanced",  # Handle imbalanced disease classes
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train_enc)

    # 6. Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test_enc, y_pred)
    print(f"\nTest Accuracy: {accuracy:.4f} ({accuracy * 100:.1f}%)")
    print("\nClassification Report:")
    print(classification_report(y_test_enc, y_pred, target_names=label_encoder.classes_))

    # 7. Save model
    os.makedirs(MODELS_DIR, exist_ok=True)
    model_data = {
        "model": model,
        "label_encoder": label_encoder,
        "feature_names": feature_cols,
        "version": "1.0.0",
        "accuracy": accuracy,
        "n_diseases": len(label_encoder.classes_),
        "n_features": len(feature_cols),
    }
    joblib.dump(model_data, MODEL_PATH)
    model_size_mb = os.path.getsize(MODEL_PATH) / (1024 * 1024)
    print(f"\nModel saved to: {MODEL_PATH} ({model_size_mb:.1f} MB)")

    # 8. Quick sanity check
    print("\n--- Sanity Check ---")
    # Simulate: fever + cough + headache
    test_input = np.zeros(len(feature_cols), dtype=int)
    for symptom in ["high_fever", "cough", "headache", "fatigue"]:
        if symptom in feature_cols:
            test_input[feature_cols.index(symptom)] = 1
    probas = model.predict_proba(test_input.reshape(1, -1))[0]
    top3 = np.argsort(probas)[::-1][:3]
    print(f"Input: fever + cough + headache + fatigue")
    for idx in top3:
        disease = label_encoder.inverse_transform([idx])[0]
        print(f"  {disease}: {probas[idx]:.2%}")

    print("\nDone!")


if __name__ == "__main__":
    main()
