# TruthLens AI

TruthLens AI is a production-oriented demo for analyzing submitted news articles and estimating whether they look likely real, likely fake, or inconclusive. The platform includes a FastAPI backend, a React + Vite + TypeScript frontend, secure document upload handling, and a real scikit-learn training pipeline.

## Project structure

- `frontend/` – React + Vite + TypeScript app
- `backend/` – FastAPI API, security configuration, validation, model loading, and tests
- `ml/` – training and evaluation scripts
- `docs/` – model card, dataset notes, and security documentation

## Quick start

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

## Model training

```bash
cd ml
python train.py
```

The training flow uses scikit-learn's `fetch_20newsgroups` as a legitimate labeled English news corpus for demonstration purposes, then builds a TF-IDF + Logistic Regression or Linear SVM pipeline. The code documents the source, limitations, and the need for a production fake-news dataset before real-world deployment.

## Default environment

The app is designed to run locally with the backend at `http://localhost:8000` and the frontend at `http://localhost:5173`.

## Important note

This is a research-oriented demo and should not be treated as a definitive fact-checking system. Predictions are estimates only and may be inconclusive when the input is short, out of domain, or unsupported.
