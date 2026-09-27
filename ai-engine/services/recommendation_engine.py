"""
Autonomous Recommendation Engine
---------------------------------
Turns a predicted impact into concrete, ranked actions a risk/ops team
can take. Pure rule-based policy layer on top of the prediction output
(this is the kind of layer that's typically kept rule-based/explainable
even in production, since it drives real financial decisions).
"""


def recommend_actions(impact: dict) -> list:
    actions = []

    if impact["default_risk_uplift_pct"] >= 10:
        actions.append({
            "action": "Increase loan-loss provisioning",
            "priority": "High",
            "rationale": f"Projected default risk uplift of {impact['default_risk_uplift_pct']}% exceeds threshold.",
        })
    if impact["default_risk_uplift_pct"] >= 5:
        actions.append({
            "action": "Offer proactive EMI restructuring to affected segments",
            "priority": "Medium",
            "rationale": "Early restructuring reduces hard-default probability.",
        })
    if impact["card_spend_change_pct"] <= -10:
        actions.append({
            "action": "Launch targeted retention / cashback campaign",
            "priority": "Medium",
            "rationale": f"Card spend projected to fall {abs(impact['card_spend_change_pct'])}%.",
        })
    if impact["deposit_withdrawal_risk_score"] >= 50:
        actions.append({
            "action": "Increase liquidity buffer / reduce new lending exposure",
            "priority": "High",
            "rationale": f"Deposit withdrawal risk score is {impact['deposit_withdrawal_risk_score']}/100.",
        })
    if impact["branch_traffic_change_pct"] >= 15:
        actions.append({
            "action": "Temporarily reallocate staff to high-impact branches",
            "priority": "Low",
            "rationale": f"Branch traffic projected to rise {impact['branch_traffic_change_pct']}%.",
        })
    if impact["mortgage_demand_change_pct"] >= 15:
        actions.append({
            "action": "Increase mortgage underwriting capacity",
            "priority": "Medium",
            "rationale": f"Mortgage demand projected to rise {impact['mortgage_demand_change_pct']}%.",
        })
    if impact["business_loan_demand_change_pct"] <= -10:
        actions.append({
            "action": "Review SME credit lines proactively before renewal cycle",
            "priority": "Medium",
            "rationale": f"Business loan demand projected to fall {abs(impact['business_loan_demand_change_pct'])}%.",
        })

    if not actions:
        actions.append({
            "action": "Continue routine monitoring",
            "priority": "Low",
            "rationale": "Predicted impact is within normal operating range.",
        })

    return actions
