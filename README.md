# 🏦 German Credit Risk Prediction API

A production-ready **FastAPI** backend that loads a trained **Logistic Regression** pipeline and exposes it as a REST API for predicting credit risk (`good` / `bad`) on loan applicants.

---

## 📁 Project Structure

```
credit-risk-api/
│
├── app/
│   ├── __init__.py        # Package marker
│   ├── main.py            # FastAPI app, lifespan, routes
│   ├── model_loader.py    # Loads model.pkl once at startup
│   ├── predictor.py       # Prediction logic
│   └── schemas.py         # Pydantic request / response schemas
│
├── model/
│   └── model.pkl          # Trained sklearn pipeline + LabelEncoder
│
├── requirements.txt       # All Python dependencies (pinned)
├── render.yaml            # Render.com deployment config
└── README.md              # This file
```

---

## 🤖 Model Details

| Item              | Value                                           |
|-------------------|-------------------------------------------------|
| Dataset           | German Credit Risk                              |
| Target            | `Risk` → `good` / `bad`                        |
| Pipeline steps    | `ColumnTransformer` → `PCA(5)` → `LogisticRegression` |
| Serialisation     | `pickle`                                        |
| Training library  | `scikit-learn 1.7.2`                            |

**Input features**

| Feature           | Type    | Description                                      |
|-------------------|---------|--------------------------------------------------|
| `age`             | int     | Borrower age in years (18–100)                   |
| `sex`             | string  | `male` \| `female`                               |
| `job`             | int     | 0 = unskilled non-resident … 3 = highly skilled  |
| `housing`         | string  | `free` \| `own` \| `rent`                        |
| `Saving accounts` | string  | `little` \| `moderate` \| `quite rich` \| `rich` \| `Unknown` |
| `Checking account`| string  | `little` \| `moderate` \| `rich` \| `no data`   |
| `Credit amount`   | float   | Loan amount in Deutsche Mark (250–20 000)        |
| `duration`        | int     | Loan duration in months (1–72)                   |
| `purpose`         | string  | See enum in `schemas.py`                         |

---

## 🚀 Running Locally

### 1 · Clone / download

```bash
git clone https://github.com/<your-username>/credit-risk-api.git
cd credit-risk-api
```

### 2 · Create a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
```

### 3 · Install dependencies

```bash
pip install -r requirements.txt
```

### 4 · Start the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API is now available at **http://localhost:8000**

---

## 📡 API Endpoints

| Method | Path       | Description                   |
|--------|------------|-------------------------------|
| GET    | `/`        | Welcome message               |
| GET    | `/health`  | Liveness / readiness probe    |
| POST   | `/predict` | Run a credit-risk prediction  |
| GET    | `/docs`    | Interactive Swagger UI        |
| GET    | `/redoc`   | ReDoc documentation           |

---

## 🧪 Testing the API

### Option 1 — Swagger UI (recommended for exploration)

Open **http://localhost:8000/docs** in your browser. Click **POST /predict → Try it out**, fill in the example payload, and hit **Execute**.

---

### Option 2 — `curl`

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "sex": "male",
    "job": 2,
    "housing": "own",
    "Saving accounts": "little",
    "Checking account": "moderate",
    "Credit amount": 5000,
    "duration": 24,
    "purpose": "car (new)"
  }'
```

**Expected response:**

```json
{
  "prediction": "good",
  "confidence": 0.8712,
  "good_probability": 0.8712,
  "bad_probability": 0.1288
}
```

---

### Option 3 — Python `requests`

```python
import requests

url = "http://localhost:8000/predict"

payload = {
    "age": 35,
    "sex": "male",
    "job": 2,
    "housing": "own",
    "Saving accounts": "little",
    "Checking account": "moderate",
    "Credit amount": 5000,
    "duration": 24,
    "purpose": "car (new)"
}

response = requests.post(url, json=payload)
print(response.status_code)
print(response.json())
```

---

## ☁️ Deploying on Render

### Step-by-step guide

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit: Credit Risk FastAPI"
   git remote add origin https://github.com/<your-username>/credit-risk-api.git
   git push -u origin main
   ```

2. **Go to [render.com](https://render.com)** and log in (or create a free account).

3. **Create a new Web Service**
   - Click **New → Web Service**
   - Choose **"Build and deploy from a Git repository"**

4. **Connect your GitHub repository**
   - Authorise Render to access your GitHub account
   - Select the `credit-risk-api` repository

5. **Render auto-detects `render.yaml`**
   - The build command, start command, health check path and Python version are all read from `render.yaml` automatically

6. **Click "Create Web Service"**
   - Render will install dependencies and start the server
   - Wait for the deploy log to show `✅ Model ready.`

7. **Your API is live!**
   - Render provides a URL like `https://credit-risk-api.onrender.com`
   - Visit `/docs` on that URL to test via Swagger UI

> **Free tier note:** Render free services spin down after 15 minutes of inactivity. The first request after a cold start may take ~30 seconds. Upgrade to the Starter plan ($7/month) to avoid this.

---

## 🔒 Production Checklist

- [ ] Pin `PYTHON_VERSION` in `render.yaml` to match your training environment
- [ ] Restrict `allow_origins` in `main.py` CORS middleware to your frontend domain
- [ ] Add API-key authentication (e.g. `fastapi.security.APIKeyHeader`)
- [ ] Enable HTTPS (automatic on Render)
- [ ] Set up log aggregation / alerting
- [ ] Store `model.pkl` in cloud storage (S3 / GCS) for large models

---

## 📄 License

MIT — feel free to use and adapt for your projects.
