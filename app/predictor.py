"""
predictor.py
------------
Contains the prediction logic.

Takes a validated CreditRiskRequest, builds the DataFrame that the
pipeline expects, runs inference, and returns a CreditRiskResponse.
"""

import logging
import pandas as pd
from typing import Any

from .model_loader import model_container
from .schemas import CreditRiskRequest, CreditRiskResponse

logger = logging.getLogger(__name__)


def _build_dataframe(request: CreditRiskRequest) -> pd.DataFrame:
    """
    Convert the Pydantic request object into a single-row DataFrame
    whose column names and dtypes match those used during training.

    Column mapping (training dataset → API field):
        Age              → age
        Sex              → sex
        Job              → job
        Housing          → housing
        Saving accounts  → saving_accounts (alias "Saving accounts")
        Checking account → checking_account (alias "Checking account")
        Credit amount    → credit_amount   (alias "Credit amount")
        Duration         → duration
        Purpose          → purpose
    """

    row = {
        "Age":              request.age,
        "Sex":              request.sex.value,
        "Job":              request.job,
        "Housing":          request.housing.value,
        "Saving accounts":  request.saving_accounts.value,
        "Checking account": request.checking_account.value,
        "Credit amount":    request.credit_amount,
        "Duration":         request.duration,
        "Purpose":          request.purpose.value,
    }

    return pd.DataFrame([row])


def predict(request: CreditRiskRequest) -> CreditRiskResponse:
    """
    Run inference and return the prediction with probabilities.

    Parameters
    ----------
    request : CreditRiskRequest
        Validated input from the API endpoint.

    Returns
    -------
    CreditRiskResponse
        Prediction label, confidence, and per-class probabilities.

    Raises
    ------
    RuntimeError
        If the model has not been loaded yet.
    """

    if not model_container.is_loaded:
        raise RuntimeError(
            "Model is not loaded. The application may still be starting up."
        )

    pipeline: Any      = model_container.pipeline
    le: Any            = model_container.label_encoder

    # ── 1. Build input DataFrame ──────────────────────────────────────────
    input_df = _build_dataframe(request)
    logger.debug("Input DataFrame:\n%s", input_df.to_dict(orient="records"))

    # ── 2. Predict class + probabilities ──────────────────────────────────
    encoded_pred   = pipeline.predict(input_df)[0]           # int (0 or 1)
    probabilities  = pipeline.predict_proba(input_df)[0]     # [p_bad, p_good]

    # ── 3. Decode numeric label → "good" / "bad" ─────────────────────────
    label: str = le.inverse_transform([encoded_pred])[0]

    # ── 4. Map class names to probability values ──────────────────────────
    classes = list(le.classes_)                              # e.g. ["bad", "good"]
    good_prob: float = float(probabilities[classes.index("good")])
    bad_prob:  float = float(probabilities[classes.index("bad")])

    # Confidence = probability of the predicted class
    confidence: float = good_prob if label == "good" else bad_prob

    logger.info(
        "Prediction: %s | confidence: %.4f | good: %.4f | bad: %.4f",
        label, confidence, good_prob, bad_prob,
    )

    return CreditRiskResponse(
        prediction       = label,
        confidence       = round(confidence, 4),
        good_probability = round(good_prob,  4),
        bad_probability  = round(bad_prob,   4),
    )
