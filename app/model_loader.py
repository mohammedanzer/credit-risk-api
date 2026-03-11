"""
model_loader.py
---------------
Responsible for locating and loading the pickled model artefact.

The model is loaded ONCE at application startup and stored in a
module-level container so every request reuses the same objects
without paying the I/O + deserialisation cost again.
"""

import pickle
import logging
from pathlib import Path
from typing import Any, Dict

logger = logging.getLogger(__name__)

# Resolve the model path relative to this file's location so the app
# works regardless of the working directory.
_MODEL_PATH = Path(__file__).parent.parent / "model" / "model.pkl"


class ModelContainer:
    """Holds the loaded pipeline and label encoder as a singleton."""

    def __init__(self) -> None:
        self.pipeline: Any = None
        self.label_encoder: Any = None
        self.is_loaded: bool = False


# Module-level singleton – imported by other modules
model_container = ModelContainer()


def load_model(path: Path = _MODEL_PATH) -> None:
    """
    Load the pickled artefact from *path* into ``model_container``.

    The saved file is expected to be a dict with two keys:
        - "Pipeline"        : sklearn Pipeline (preprocessor → PCA → classifier)
        - "Label_Encoder_y" : fitted LabelEncoder for the target variable

    Raises
    ------
    FileNotFoundError
        If the .pkl file is not found at the given path.
    KeyError
        If the expected keys are missing from the pickle dict.
    """

    if not path.exists():
        raise FileNotFoundError(
            f"Model file not found at '{path}'. "
            "Make sure 'model/model.pkl' exists in the project root."
        )

    logger.info("Loading model from '%s' …", path)

    with open(path, "rb") as fh:
        artefact: Dict[str, Any] = pickle.load(fh)

    # Validate keys
    required_keys = {"Pipeline", "Label_Encoder_y"}
    missing = required_keys - artefact.keys()
    if missing:
        raise KeyError(
            f"Pickle file is missing expected keys: {missing}. "
            f"Found keys: {list(artefact.keys())}"
        )

    model_container.pipeline      = artefact["Pipeline"]
    model_container.label_encoder = artefact["Label_Encoder_y"]
    model_container.is_loaded     = True

    logger.info(
        "Model loaded successfully. Label classes: %s",
        model_container.label_encoder.classes_,
    )
