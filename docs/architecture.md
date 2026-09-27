# Architecture Deep Dive

## Data flow

1. **Ingestion** — `event-collector` exposes `POST /api/signals` to accept any
   raw external or internal signal (news text, RBI circular, social post, or
   an internal transaction/complaint summary). It persists the raw signal to
   Postgres and publishes it to the Kafka topic `raw.signals`.

2. **Event Intelligence** — the AI engine's `event_intelligence.py` consumes
   raw text and extracts a structured event: `{event, location, industry,
   severity, affected_segments, summary}`. In mock mode this is a fast
   deterministic keyword model so the whole pipeline runs offline; in
   `openai` mode it's a LangChain `ChatOpenAI` call with a JSON-only prompt.

3. **Impact Prediction** — `banking_impact_predictor.py` turns a structured
   event into a portfolio impact vector: default risk uplift, card spend
   change, deposit withdrawal risk, branch traffic change, mortgage demand
   change, business loan demand change, plus a confidence score. The class
   is intentionally structured so the heuristic scorer can be swapped for
   real trained XGBoost / LightGBM / LSTM models without changing the API
   contract — see the docstring in that file.

4. **Scenario Generation** — `scenario_generator.py` lets a risk officer ask
   "what if fuel rises 15%" and reuses the exact same impact predictor by
   constructing a synthetic event from the scenario parameters.

5. **Recommendations** — `recommendation_engine.py` is a transparent,
   explainable rules layer (deliberately not a black-box model, since it
   drives real financial decisions) that turns impact numbers into ranked
   actions: increase provisioning, restructure EMIs, launch retention
   campaigns, etc.

6. **Knowledge graph** — Neo4j stores `Event -[:OCCURRED_IN]-> Location`,
   `Event -[:AFFECTS_INDUSTRY]-> Industry`, `Event -[:IMPACTS_SEGMENT]->
   CustomerSegment` relationships, so you can later ask graph questions like
   "show me every event in the last 90 days that touched our Home Loan
   segment" or trace second-order effects (an IT layoffs event → affects
   Salaried-Tech segment → who also hold Home Loans → mortgage risk).

7. **Prediction Engine** — the Spring Boot service the dashboard actually
   talks to. It owns the public API contract, persistence of
   events/impacts/recommendations, and proxies the AI work to the Python
   service via `AiEngineClient` (a thin reactive `WebClient` wrapper) so the
   Java side stays free of ML dependencies.

8. **Dashboard** — React app ("Pulse") that visualizes the live feed, the
   predicted impact, the scenario simulator, recommendations, and the
   impact-propagation graph. Ships with a self-contained JS port of the
   impact model (`frontend/src/engine.js`) so the UI is fully interactive
   without requiring the backend to be running — swap the calls in
   `App.jsx` for `fetch(VITE_API_BASE_URL + "/api/predictions/analyze")`
   to use the real backend instead.

## Why a heuristic model instead of "real" XGBoost out of the box

Training real XGBoost/LightGBM/LSTM models requires historical labeled
outcomes — i.e., for past economic events, what actually happened to default
rates, spend, and withdrawals at *this specific bank's* portfolio. That data
only exists inside the bank. The scaffold therefore ships a heuristic scorer
with the exact same output shape the trained models would produce, so:

- the rest of the platform (API contracts, dashboard, knowledge graph,
  recommendations) is fully built and testable today, and
- swapping in trained models later is a one-file change in
  `ai-engine/services/banking_impact_predictor.py`.
