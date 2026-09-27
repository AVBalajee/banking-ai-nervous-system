"""
AI Intelligence Engine — FastAPI service
Exposes:
  POST /events/analyze        -> Event Intelligence Engine
  POST /predict/impact        -> Banking Impact Predictor
  POST /scenario/simulate     -> Scenario Generator
  POST /recommendations       -> Autonomous Recommendations
  POST /pipeline/full         -> runs all four steps for one input text
  GET  /health
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.event_intelligence import extract_event
from services.banking_impact_predictor import BankingImpactPredictor
from services.scenario_generator import run_scenario, SCENARIO_TEMPLATES
from services.recommendation_engine import recommend_actions

app = FastAPI(title="Banking Economic Nervous System - AI Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = BankingImpactPredictor()


class TextInput(BaseModel):
    text: str


class EventInput(BaseModel):
    event: str
    location: str
    industry: str
    severity: str
    affected_segments: list[str] = []
    summary: str = ""


class ScenarioInput(BaseModel):
    scenario_key: str
    magnitude: float = 1.0


class ImpactInput(BaseModel):
    default_risk_uplift_pct: float
    card_spend_change_pct: float
    deposit_withdrawal_risk_score: float
    branch_traffic_change_pct: float
    mortgage_demand_change_pct: float
    business_loan_demand_change_pct: float
    confidence: float


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-engine"}


@app.post("/events/analyze")
def analyze_event(payload: TextInput):
    return extract_event(payload.text)


@app.post("/predict/impact")
def predict_impact(payload: EventInput):
    return predictor.predict(payload.model_dump())


@app.post("/scenario/simulate")
def simulate_scenario(payload: ScenarioInput):
    try:
        return run_scenario(payload.scenario_key, payload.magnitude)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/scenario/templates")
def list_scenarios():
    return {"available_scenarios": list(SCENARIO_TEMPLATES.keys())}


@app.post("/recommendations")
def get_recommendations(payload: ImpactInput):
    return recommend_actions(payload.model_dump())


@app.post("/pipeline/full")
def full_pipeline(payload: TextInput):
    """One-shot: raw text -> event -> impact -> recommendations."""
    event = extract_event(payload.text)
    impact = predictor.predict(event)
    actions = recommend_actions(impact)
    return {"event": event, "predicted_impact": impact, "recommendations": actions}
