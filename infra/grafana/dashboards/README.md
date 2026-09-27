# Grafana dashboards

Drop dashboard JSON exports here and they'll be auto-provisioned when
mounted into the Grafana container via docker-compose.

Suggested panels once OpenTelemetry metrics are flowing from the
Spring Boot services and AI engine:
- Event ingestion rate (events/min) by source type
- AI engine p95 latency for /pipeline/full
- Prediction confidence distribution
- Recommendation priority breakdown over time
