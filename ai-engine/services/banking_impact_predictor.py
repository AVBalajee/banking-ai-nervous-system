"""
Banking Impact Predictor
-------------------------
Given a structured event (from the Event Intelligence Engine) and a
portfolio snapshot, predicts:
  - probability uplift in loan default risk
  - expected change in card spend (%)
  - deposit withdrawal risk score
  - branch traffic delta

This module is written so that swapping the heuristic scorer for trained
XGBoost / LightGBM / LSTM models is a drop-in change: replace `_heuristic_score`
with calls to `self.xgb_model.predict(...)` etc. Model artifacts would be
loaded from /app/models/*.joblib or *.h5 at startup once trained on real
historical portfolio + event data.
"""
from dataclasses import dataclass

SEVERITY_WEIGHT = {"Low": 0.15, "Medium": 0.35, "High": 0.65, "Critical": 0.9}

INDUSTRY_DEFAULT_SENSITIVITY = {
    "IT": 0.7,
    "Manufacturing": 0.6,
    "Real Estate": 0.55,
    "Agriculture": 0.5,
    "Energy": 0.45,
    "Banking/Finance": 0.4,
    "General": 0.3,
}


@dataclass
class ImpactPrediction:
    default_risk_uplift_pct: float
    card_spend_change_pct: float
    deposit_withdrawal_risk_score: float
    branch_traffic_change_pct: float
    mortgage_demand_change_pct: float
    business_loan_demand_change_pct: float
    confidence: float


def _heuristic_score(event: dict) -> ImpactPrediction:
    severity = SEVERITY_WEIGHT.get(event.get("severity", "Low"), 0.2)
    industry_sensitivity = INDUSTRY_DEFAULT_SENSITIVITY.get(event.get("industry", "General"), 0.3)
    base = severity * industry_sensitivity

    event_type = event.get("event", "")

    # event-specific directionality, in real system this is what
    # XGBoost/LightGBM would learn from historical labeled outcomes
    if event_type == "Mass Layoffs":
        default_uplift = base * 18      # %
        spend_change = -base * 22       # %
        withdrawal_risk = base * 0.8
        branch_traffic = base * 10
        mortgage = -base * 15
        biz_loan = -base * 8
    elif event_type == "RBI Rate Hike":
        default_uplift = base * 10
        spend_change = -base * 12
        withdrawal_risk = base * 0.5
        branch_traffic = base * 4
        mortgage = -base * 25
        biz_loan = -base * 18
    elif event_type == "RBI Rate Cut":
        default_uplift = -base * 5
        spend_change = base * 10
        withdrawal_risk = -base * 0.3
        branch_traffic = -base * 2
        mortgage = base * 28
        biz_loan = base * 20
    elif event_type == "Fuel Price Change":
        default_uplift = base * 6
        spend_change = -base * 8
        withdrawal_risk = base * 0.3
        branch_traffic = base * 2
        mortgage = -base * 4
        biz_loan = -base * 10
    elif event_type == "Natural Disaster":
        default_uplift = base * 22
        spend_change = -base * 18
        withdrawal_risk = base * 1.2
        branch_traffic = base * 25
        mortgage = -base * 10
        biz_loan = -base * 15
    elif event_type == "Election / Policy Uncertainty":
        default_uplift = base * 4
        spend_change = -base * 5
        withdrawal_risk = base * 0.4
        branch_traffic = base * 1
        mortgage = -base * 12
        biz_loan = -base * 20
    elif event_type == "Inflation Spike":
        default_uplift = base * 12
        spend_change = -base * 15
        withdrawal_risk = base * 0.6
        branch_traffic = base * 3
        mortgage = -base * 8
        biz_loan = -base * 6
    else:
        default_uplift = base * 3
        spend_change = -base * 3
        withdrawal_risk = base * 0.2
        branch_traffic = base * 1
        mortgage = -base * 2
        biz_loan = -base * 2

    return ImpactPrediction(
        default_risk_uplift_pct=round(default_uplift, 2),
        card_spend_change_pct=round(spend_change, 2),
        deposit_withdrawal_risk_score=round(min(max(withdrawal_risk, 0), 1) * 100, 1),
        branch_traffic_change_pct=round(branch_traffic, 2),
        mortgage_demand_change_pct=round(mortgage, 2),
        business_loan_demand_change_pct=round(biz_loan, 2),
        confidence=round(0.55 + severity * 0.35, 2),
    )


class BankingImpactPredictor:
    """
    Wraps the scoring logic. In production this class would load:
      self.default_risk_model = xgboost.Booster(model_file="models/default_risk.json")
      self.spend_model = lightgbm.Booster(model_file="models/spend_lgbm.txt")
      self.deposit_lstm = tf.keras.models.load_model("models/deposit_lstm.h5")
    and blend their outputs. The heuristic fallback below keeps the API
    contract identical so the rest of the platform doesn't need to change
    once real models are trained.
    """

    def predict(self, event: dict) -> dict:
        prediction = _heuristic_score(event)
        return prediction.__dict__
