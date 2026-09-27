# Pulse — AI-Powered Banking Economic Digital Nervous System

A real-time AI platform that continuously ingests external (RBI, news,
inflation, social) and internal (transactions, complaints, branch activity)
signals, predicts how upcoming economic events will affect loan defaults,
card spend, deposits, branch traffic, mortgage demand, and business loan
demand — and recommends concrete actions, before the impact shows up in
quarter-end reports.

> **Honesty note on what's real vs. simulated:** this repo is a complete,
> structurally-correct scaffold of the full architecture described in the
> brief (Spring Boot + Kafka + Neo4j + Postgres + Python/LangChain AI engine
> + React dashboard + OpenTelemetry/Grafana). The **frontend dashboard runs
> fully interactive out of the box** using a built-in simulated data feed and
> a JS port of the prediction model, so you can see and use the whole
> experience immediately with zero setup. The **backend/AI services** are
> real, runnable code (not pseudocode) but default to a deterministic
> **mock LLM mode** instead of calling a paid OpenAI key, and the live
> RBI/news/social ingestion connectors are stubbed for you to wire up your
> own API keys. Swapping mock → live is a config change, documented below.

---

## 1. What's in the box

```
banking-ai-nervous-system/
├── docker-compose.yml          # one command to run the entire stack
├── .env.example                 # copy to .env and fill in real API keys
├── backend/
│   ├── event-collector/         # Spring Boot — ingests signals, publishes to Kafka
│   └── prediction-engine/         # Spring Boot — public API for the dashboard, calls AI engine
├── ai-engine/                   # Python (FastAPI + LangChain) — the actual AI brain
│   └── services/
│       ├── event_intelligence.py        # LLM event extraction (mock + OpenAI modes)
│       ├── banking_impact_predictor.py  # XGBoost/LightGBM/LSTM-ready impact scorer
│       ├── scenario_generator.py        # "what if" simulation engine
│       └── recommendation_engine.py     # rule-based action recommendations
├── frontend/                    # React + Vite — the live interactive dashboard ("Pulse")
├── database/
│   ├── postgres/init.sql        # relational schema (signals, events, impacts, recs)
│   └── neo4j/init.cypher        # knowledge graph schema (event → industry/segment/location)
├── infra/
│   ├── otel/                    # OpenTelemetry Collector config
│   └── grafana/dashboards/      # Grafana provisioning folder
└── docs/architecture.md
```

## 2. Architecture

```
News APIs / RBI Data / Economic Data / Social Media
                    |
                    v
        Spring Boot Event Collector  ──────►  Kafka (raw.signals)
                    |
                    v
        AI Intelligence Engine (Python + LangChain)
          1. Event Intelligence Engine   (LLM extraction)
          2. Banking Impact Predictor    (XGBoost/LightGBM/LSTM)
          3. Scenario Generator          (what-if simulation)
          4. Autonomous Recommendations  (rule engine)
                    |
                    v
        Neo4j Knowledge Graph  +  Postgres (events/impacts/recs)
                    |
                    v
        Prediction Engine (Spring Boot public API)
                    |
                    v
        React Dashboard ("Pulse") — live feed, impact charts,
        scenario simulator, recommendations, impact graph
```

## 3. Quickest way to see it — just the dashboard (no Docker, no backend)

The dashboard works completely standalone with a simulated live feed.

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. You'll see:

- A live **pulse monitor** (the animated line at the top) that spikes when a
  new simulated event lands, colored by severity.
- A **live signal feed** on the left, auto-updating every 5 seconds.
- The **predicted portfolio impact** panel (defaults, card spend, deposit
  withdrawal risk, branch traffic, mortgage & business loan demand) that
  updates whenever you click an event.
- An interactive **what-if scenario simulator** — drag the sliders for fuel
  price rise, RBI rate cut/hike, or recession severity and watch every metric
  recompute instantly.
- **Autonomous recommendations** that change based on the active event/scenario.
- A small **impact propagation graph** showing event → industry/location → affected customer segments.

## 4. Running the full stack (Kafka, Neo4j, AI engine, both Spring Boot services)

Requires Docker + Docker Compose.

```bash
cp .env.example .env
# (optional) edit .env and set LLM_PROVIDER=openai and OPENAI_API_KEY=sk-... for real LLM extraction
docker compose up --build
```

This starts:

| Service            | URL                          | Notes |
|---------------------|-------------------------------|-------|
| Frontend            | http://localhost:5173         | React dashboard |
| Event Collector      | http://localhost:8081/api/signals | POST raw signals |
| Prediction Engine    | http://localhost:8082/api/predictions | Public API the dashboard calls |
| AI Engine (FastAPI)  | http://localhost:8500/docs    | Swagger UI for the AI brain |
| Kafka UI             | http://localhost:8089         | Inspect topics/messages |
| Neo4j Browser        | http://localhost:7474         | user: `neo4j` / pass: `nervous_system_pw` |
| Postgres             | localhost:5432                | db: `nervous_system` |
| Grafana              | http://localhost:3001         | user: `admin` / pass: `admin` |

First boot takes a few minutes (Maven + npm + pip installs inside containers).

### Try the pipeline end to end

```bash
curl -X POST http://localhost:8081/api/signals \
  -H "Content-Type: application/json" \
  -d '{"sourceType":"News","content":"IT companies announce 20,000 layoffs in Bengaluru"}'
```

Or hit the AI engine directly:

```bash
curl -X POST http://localhost:8500/pipeline/full \
  -H "Content-Type: application/json" \
  -d '{"text":"RBI raises repo rate by 50 basis points"}'
```

Response:

```json
{
  "event": {
    "event": "RBI Rate Hike",
    "location": "Pan-India",
    "industry": "Banking/Finance",
    "severity": "High",
    "affected_segments": ["Home Loan Customers", "Business Loan Customers", "EMI Customers"],
    "summary": "RBI raises repo rate by 50 basis points"
  },
  "predicted_impact": { "default_risk_uplift_pct": 26.0, "...": "..." },
  "recommendations": [ { "action": "Increase loan-loss provisioning", "priority": "High", "...": "..." } ]
}
```

## 5. Running services individually (without Docker)

**AI Engine (Python 3.11+)**
```bash
cd ai-engine
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8500
```

**Event Collector (Java 21 + Maven)**
```bash
cd backend/event-collector
mvn spring-boot:run
```
Requires a running Postgres + Kafka — easiest to just start those two via
`docker compose up postgres kafka zookeeper`.

**Prediction Engine (Java 21 + Maven)**
```bash
cd backend/prediction-engine
mvn spring-boot:run
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## 6. Going from mock → live

| What | Where | How |
|---|---|---|
| Real LLM event extraction | `.env` | `LLM_PROVIDER=openai`, `OPENAI_API_KEY=sk-...` |
| Real news ingestion | `ai-engine` / `event-collector` | Add a scheduled job that pulls from a news API and POSTs to `/api/signals` |
| Real RBI data | same | Add an RBI data connector (RBI publishes structured releases) |
| Trained ML models | `ai-engine/services/banking_impact_predictor.py` | Replace `_heuristic_score()` with `xgboost.Booster.predict()` / LightGBM / a trained LSTM loaded from `ai-engine/models/` |
| Real portfolio data | Postgres | Replace the demo schema's empty tables with your actual loan/card/deposit feeds (this is sensitive customer data — keep it behind your existing data-governance controls, this scaffold does not implement auth/encryption) |

## 7. Tech stack

- **Backend:** Java 21, Spring Boot, Spring Kafka, Spring WebFlux
- **Messaging:** Apache Kafka
- **AI:** Python, FastAPI, LangChain, OpenAI (optional) — mock mode needs no key
- **ML (ready to plug in):** XGBoost, LightGBM, TensorFlow/LSTM
- **Databases:** PostgreSQL (transactional), Neo4j (knowledge graph)
- **Observability:** OpenTelemetry Collector, Grafana
- **Frontend:** React 18, Vite, Recharts, Lucide icons

## 8. Important caveats

- This is a **demo/scaffold**, not a production banking system. There is no
  authentication, encryption-at-rest, audit logging, or data governance
  layer — all of which are mandatory before this would touch real customer
  or transaction data.
- The "ML models" are a clearly-documented heuristic stand-in. Training real
  XGBoost/LightGBM/LSTM models requires historical labeled data (past events
  → actual default/spend/withdrawal outcomes) that only the bank itself has.
- Treat the prediction numbers as illustrative, not financial advice.
