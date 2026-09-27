// Mirrors ai-engine/services/banking_impact_predictor.py so the dashboard
// is fully interactive standalone (no backend required for the demo).
// In production, replace `predictImpact()` calls with a fetch to
// VITE_API_BASE_URL + "/api/predictions/analyze" (the real Spring Boot ->
// FastAPI pipeline).

export const SEVERITY_WEIGHT = { Low: 0.15, Medium: 0.35, High: 0.65, Critical: 0.9 };

export const INDUSTRY_SENSITIVITY = {
  IT: 0.7,
  Manufacturing: 0.6,
  "Real Estate": 0.55,
  Agriculture: 0.5,
  Energy: 0.45,
  "Banking/Finance": 0.4,
  General: 0.3,
};

const DIRECTION = {
  "Mass Layoffs": { default: 18, spend: -22, withdraw: 0.8, branch: 10, mortgage: -15, biz: -8 },
  "RBI Rate Hike": { default: 10, spend: -12, withdraw: 0.5, branch: 4, mortgage: -25, biz: -18 },
  "RBI Rate Cut": { default: -5, spend: 10, withdraw: -0.3, branch: -2, mortgage: 28, biz: 20 },
  "Fuel Price Change": { default: 6, spend: -8, withdraw: 0.3, branch: 2, mortgage: -4, biz: -10 },
  "Natural Disaster": { default: 22, spend: -18, withdraw: 1.2, branch: 25, mortgage: -10, biz: -15 },
  "Election / Policy Uncertainty": { default: 4, spend: -5, withdraw: 0.4, branch: 1, mortgage: -12, biz: -20 },
  "Inflation Spike": { default: 12, spend: -15, withdraw: 0.6, branch: 3, mortgage: -8, biz: -6 },
  "General Economic Update": { default: 3, spend: -3, withdraw: 0.2, branch: 1, mortgage: -2, biz: -2 },
};

export function predictImpact(event) {
  const severity = SEVERITY_WEIGHT[event.severity] ?? 0.2;
  const sensitivity = INDUSTRY_SENSITIVITY[event.industry] ?? 0.3;
  const base = severity * sensitivity;
  const d = DIRECTION[event.event] ?? DIRECTION["General Economic Update"];

  return {
    defaultRiskUpliftPct: round2(base * d.default),
    cardSpendChangePct: round2(base * d.spend),
    depositWithdrawalRiskScore: round1(clamp01(base * d.withdraw) * 100),
    branchTrafficChangePct: round2(base * d.branch),
    mortgageDemandChangePct: round2(base * d.mortgage),
    businessLoanDemandChangePct: round2(base * d.biz),
    confidence: round2(0.55 + severity * 0.35),
  };
}

export function recommendActions(impact) {
  const actions = [];
  if (impact.defaultRiskUpliftPct >= 10)
    actions.push({ action: "Increase loan-loss provisioning", priority: "High", rationale: `Default risk uplift of ${impact.defaultRiskUpliftPct}% exceeds threshold.` });
  if (impact.defaultRiskUpliftPct >= 5)
    actions.push({ action: "Offer proactive EMI restructuring", priority: "Medium", rationale: "Early restructuring reduces hard-default probability." });
  if (impact.cardSpendChangePct <= -10)
    actions.push({ action: "Launch retention / cashback campaign", priority: "Medium", rationale: `Card spend projected to fall ${Math.abs(impact.cardSpendChangePct)}%.` });
  if (impact.depositWithdrawalRiskScore >= 50)
    actions.push({ action: "Increase liquidity buffer", priority: "High", rationale: `Withdrawal risk score is ${impact.depositWithdrawalRiskScore}/100.` });
  if (impact.branchTrafficChangePct >= 15)
    actions.push({ action: "Reallocate staff to high-traffic branches", priority: "Low", rationale: `Branch traffic projected up ${impact.branchTrafficChangePct}%.` });
  if (impact.mortgageDemandChangePct >= 15)
    actions.push({ action: "Increase mortgage underwriting capacity", priority: "Medium", rationale: `Mortgage demand projected up ${impact.mortgageDemandChangePct}%.` });
  if (impact.businessLoanDemandChangePct <= -10)
    actions.push({ action: "Review SME credit lines before renewal", priority: "Medium", rationale: `Business loan demand projected down ${Math.abs(impact.businessLoanDemandChangePct)}%.` });
  if (actions.length === 0)
    actions.push({ action: "Continue routine monitoring", priority: "Low", rationale: "Predicted impact is within normal range." });
  return actions;
}

function clamp01(n) {
  return Math.min(Math.max(n, 0), 1);
}
function round2(n) {
  return Math.round(n * 100) / 100;
}
function round1(n) {
  return Math.round(n * 10) / 10;
}
