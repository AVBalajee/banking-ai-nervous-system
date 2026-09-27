"""
Scenario Generator
-------------------
Lets a risk officer ask "what if" questions (fuel +15%, RBI -1%, recession)
and instantly see simulated portfolio impact, by translating the scenario
into a synthetic event and running it through the same impact predictor
used for real-time events.
"""
from services.banking_impact_predictor import BankingImpactPredictor

predictor = BankingImpactPredictor()

SCENARIO_TEMPLATES = {
    "fuel_price_rise": lambda pct: {
        "event": "Fuel Price Change",
        "location": "Pan-India",
        "industry": "Energy",
        "severity": "High" if pct >= 15 else "Medium",
        "affected_segments": ["Transport/Logistics SMEs", "Retail Customers"],
        "summary": f"Simulated fuel price rise of {pct}%",
    },
    "rbi_rate_cut": lambda pct: {
        "event": "RBI Rate Cut",
        "location": "Pan-India",
        "industry": "Banking/Finance",
        "severity": "Medium" if pct < 1 else "High",
        "affected_segments": ["Home Loan Customers", "Business Loan Customers"],
        "summary": f"Simulated RBI rate cut of {pct}%",
    },
    "rbi_rate_hike": lambda pct: {
        "event": "RBI Rate Hike",
        "location": "Pan-India",
        "industry": "Banking/Finance",
        "severity": "Medium" if pct < 1 else "High",
        "affected_segments": ["Home Loan Customers", "EMI Customers"],
        "summary": f"Simulated RBI rate hike of {pct}%",
    },
    "recession": lambda pct: {
        "event": "Mass Layoffs",
        "location": "Pan-India",
        "industry": "IT",
        "severity": "Critical",
        "affected_segments": ["Salaried - Tech", "Personal Loan Holders", "Credit Card Customers"],
        "summary": "Simulated broad-based recession scenario",
    },
    "natural_disaster": lambda pct: {
        "event": "Natural Disaster",
        "location": "Regional",
        "industry": "Agriculture",
        "severity": "Critical" if pct >= 7 else "High",
        "affected_segments": ["Regional Branch Customers", "Crop Loan Holders"],
        "summary": "Simulated natural disaster scenario",
    },
}


def run_scenario(scenario_key: str, magnitude: float) -> dict:
    if scenario_key not in SCENARIO_TEMPLATES:
        raise ValueError(f"Unknown scenario '{scenario_key}'. Available: {list(SCENARIO_TEMPLATES)}")
    synthetic_event = SCENARIO_TEMPLATES[scenario_key](magnitude)
    impact = predictor.predict(synthetic_event)
    return {"event": synthetic_event, "predicted_impact": impact}
