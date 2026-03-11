"""
main.py
-------
FastAPI application entry point.

Responsibilities:
  - Initialise the FastAPI app with metadata (title, version, docs URLs)
  - Load the model ONCE during startup via the lifespan context manager
  - Register all API routes
  - Provide structured error handling
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from .model_loader import load_model, model_container
from .predictor    import predict
from .schemas      import CreditRiskRequest, CreditRiskResponse, HealthResponse

# ---------------------------------------------------------------------------
# Logging configuration
# ---------------------------------------------------------------------------
logging.basicConfig(
    level   = logging.INFO,
    format  = "%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt = "%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan – runs startup / shutdown logic without deprecated @app.on_event
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the ML model when the server starts; clean up on shutdown."""
    logger.info("═══ Application startup ═══")
    try:
        load_model()
        logger.info("✅  Model ready.")
    except Exception as exc:
        logger.exception("❌  Failed to load model: %s", exc)
        # Let the server start anyway so /health returns 503 rather than crashing
    yield
    # ── Shutdown ──────────────────────────────────────────────────────────
    logger.info("═══ Application shutdown ═══")


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(
    title       = "German Credit Risk Prediction API",
    description = (
        "Production-ready REST API that predicts credit risk (good / bad) "
        "for loan applicants using a Logistic Regression pipeline trained on "
        "the German Credit Risk dataset."
    ),
    version     = "1.0.0",
    docs_url    = "/docs",
    redoc_url   = "/redoc",
    lifespan    = lifespan,
)

# CORS – allow all origins in dev; tighten for production
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get(
    "/",
    tags     = ["Root"],
    summary  = "API root – welcome message",
)
async def root():
    return {
        "message": "German Credit Risk Prediction API",
        "version": "1.0.0",
        "docs":    "/docs",
    }


@app.get(
    "/health",
    response_model = HealthResponse,
    tags           = ["Health"],
    summary        = "Liveness / readiness check",
)
async def health():
    """
    Returns HTTP 200 when the service is alive and the model is loaded.
    Returns HTTP 503 when the model failed to load at startup.
    """
    if not model_container.is_loaded:
        raise HTTPException(
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE,
            detail      = "Model is not loaded yet.",
        )
    return HealthResponse(status="ok", model_loaded=True)


@app.post(
    "/predict",
    response_model = CreditRiskResponse,
    tags           = ["Prediction"],
    summary        = "Predict credit risk for a loan applicant",
    status_code    = status.HTTP_200_OK,
)
async def predict_credit_risk(request: CreditRiskRequest):
    """
    Accepts borrower details and returns a credit-risk prediction.

    **Request body** — all fields are required:

    | Field             | Type    | Description                             |
    |-------------------|---------|-----------------------------------------|
    | age               | int     | Borrower age (18–100)                   |
    | sex               | string  | `male` or `female`                      |
    | job               | int     | Skill level 0–3                         |
    | housing           | string  | `free`, `own`, or `rent`                |
    | Saving accounts   | string  | `little`, `moderate`, `quite rich`, `rich`, `Unknown` |
    | Checking account  | string  | `little`, `moderate`, `rich`, `no data` |
    | Credit amount     | float   | Loan amount in DM (250–20 000)          |
    | duration          | int     | Loan duration in months (1–72)          |
    | purpose           | string  | Loan purpose (see enum)                 |

    **Response** — prediction with probabilities:

    | Field            | Type   | Description                             |
    |------------------|--------|-----------------------------------------|
    | prediction       | string | `good` or `bad`                         |
    | confidence       | float  | Probability of the predicted class      |
    | good_probability | float  | P(credit = good)                        |
    | bad_probability  | float  | P(credit = bad)                         |
    """
    try:
        result = predict(request)
    except RuntimeError as exc:
        raise HTTPException(
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE,
            detail      = str(exc),
        )
    except Exception as exc:
        logger.exception("Unexpected error during prediction: %s", exc)
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail      = "An unexpected error occurred. Please check server logs.",
        )
    return result
