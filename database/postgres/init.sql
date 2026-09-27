-- Postgres schema for the Banking Economic Nervous System

CREATE TABLE IF NOT EXISTS raw_signals (
    id BIGSERIAL PRIMARY KEY,
    source_type VARCHAR(64) NOT NULL,
    content TEXT NOT NULL,
    received_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    raw_signal_id BIGINT REFERENCES raw_signals(id),
    event_type VARCHAR(128) NOT NULL,
    location VARCHAR(128),
    industry VARCHAR(128),
    severity VARCHAR(32),
    summary TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS predicted_impacts (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id),
    default_risk_uplift_pct NUMERIC,
    card_spend_change_pct NUMERIC,
    deposit_withdrawal_risk_score NUMERIC,
    branch_traffic_change_pct NUMERIC,
    mortgage_demand_change_pct NUMERIC,
    business_loan_demand_change_pct NUMERIC,
    confidence NUMERIC,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recommendations (
    id BIGSERIAL PRIMARY KEY,
    predicted_impact_id BIGINT REFERENCES predicted_impacts(id),
    action TEXT NOT NULL,
    priority VARCHAR(16),
    rationale TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_signals_received_at ON raw_signals(received_at);
