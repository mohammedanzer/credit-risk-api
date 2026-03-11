"""
schemas.py
----------
Pydantic models for request validation and response serialization.
All fields mirror the German Credit Risk dataset features exactly.
"""

from pydantic import BaseModel, Field
from typing import Literal
from enum import Enum


# ---------------------------------------------------------------------------
# Enumerations – restrict inputs to valid categorical values
# ---------------------------------------------------------------------------

class SexEnum(str, Enum):
    male   = "male"
    female = "female"


class HousingEnum(str, Enum):
    free = "free"
    own  = "own"
    rent = "rent"


class SavingAccountEnum(str, Enum):
    unknown    = "Unknown"
    little     = "little"
    moderate   = "moderate"
    quite_rich = "quite rich"
    rich       = "rich"


class CheckingAccountEnum(str, Enum):
    little   = "little"
    moderate = "moderate"
    rich     = "rich"
    no_data  = "no data"


class PurposeEnum(str, Enum):
    car_new              = "car (new)"
    car_used             = "car (used)"
    furniture_equipment  = "furniture/equipment"
    radio_tv             = "radio/TV"
    domestic_appliances  = "domestic appliances"
    repairs              = "repairs"
    education            = "education"
    vacation_others      = "vacation/others"
    retraining           = "retraining"
    business             = "business"


# ---------------------------------------------------------------------------
# Request Schema
# ---------------------------------------------------------------------------

class CreditRiskRequest(BaseModel):
    """
    Input payload for the /predict endpoint.
    Covers all 9 features the trained pipeline expects.
    """

    age: int = Field(
        ...,
        ge=18,
        le=100,
        description="Borrower's age in years (18–100)",
        example=35,
    )
    sex: SexEnum = Field(
        ...,
        description="Borrower's gender",
        example="male",
    )
    job: int = Field(
        ...,
        ge=0,
        le=3,
        description=(
            "Job skill level: 0 = unskilled & non-resident, "
            "1 = unskilled & resident, 2 = skilled, 3 = highly skilled"
        ),
        example=2,
    )
    housing: HousingEnum = Field(
        ...,
        description="Housing status of the borrower",
        example="own",
    )
    saving_accounts: SavingAccountEnum = Field(
        ...,
        alias="Saving accounts",
        description="Balance in saving accounts",
        example="little",
    )
    checking_account: CheckingAccountEnum = Field(
        ...,
        alias="Checking account",
        description="Balance in checking account",
        example="moderate",
    )
    credit_amount: float = Field(
        ...,
        alias="Credit amount",
        ge=250,
        le=20000,
        description="Loan amount in Deutsche Mark (250–20 000)",
        example=5000,
    )
    duration: int = Field(
        ...,
        ge=1,
        le=72,
        description="Loan duration in months (1–72)",
        example=24,
    )
    purpose: PurposeEnum = Field(
        ...,
        description="Purpose of the loan",
        example="car (new)",
    )

    model_config = {
        # Allow both the alias and the Python field name in JSON
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "age": 35,
                "sex": "male",
                "job": 2,
                "housing": "own",
                "Saving accounts": "little",
                "Checking account": "moderate",
                "Credit amount": 5000,
                "duration": 24,
                "purpose": "car (new)",
            }
        },
    }


# ---------------------------------------------------------------------------
# Response Schema
# ---------------------------------------------------------------------------

class CreditRiskResponse(BaseModel):
    """
    Prediction result returned by the /predict endpoint.
    """

    prediction: Literal["good", "bad"] = Field(
        ...,
        description="Predicted credit risk label",
        example="good",
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Model confidence for the predicted class (0–1)",
        example=0.87,
    )
    good_probability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Probability that credit risk is 'good'",
        example=0.87,
    )
    bad_probability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Probability that credit risk is 'bad'",
        example=0.13,
    )


# ---------------------------------------------------------------------------
# Health-check schema
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str = Field(..., example="ok")
    model_loaded: bool = Field(..., example=True)
