import { useEffect, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import EventFeed from "./components/EventFeed.jsx";
import ImpactDashboard from "./components/ImpactDashboard.jsx";
import ScenarioSimulator from "./components/ScenarioSimulator.jsx";
import RecommendationsPanel from "./components/RecommendationsPanel.jsx";
import KnowledgeGraph from "./components/KnowledgeGraph.jsx";
import { generateInitialFeed, generateRandomEvent } from "./mockData.js";
import { predictImpact, recommendActions } from "./engine.js";

const SEVERITY_STRENGTH = { Low: 4, Medium: 9, High: 16, Critical: 24 };

export default function App() {
  const [events, setEvents] = useState(() => generateInitialFeed(7));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [scenarioOverride, setScenarioOverride] = useState(null); // {event, impact}
  const spikeRef = useRef(null);

  // pick the latest real event as the default "selected" one
  useEffect(() => {
    if (!selectedEvent && events.length) setSelectedEvent(events[0]);
  }, [events, selectedEvent]);

  // live feed simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent = generateRandomEvent();
      setEvents((prev) => [newEvent, ...prev].slice(0, 30));
      spikeRef.current = { strength: SEVERITY_STRENGTH[newEvent.severity] || 5 };
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeEvent = scenarioOverride ? scenarioOverride.event : selectedEvent;
  const activeImpact = scenarioOverride ? scenarioOverride.impact : selectedEvent ? predictImpact(selectedEvent) : null;
  const recommendations = activeImpact ? recommendActions(activeImpact) : [];

  function handleSelectEvent(e) {
    setScenarioOverride(null);
    setSelectedEvent(e);
  }

  function handleSimulate(event, impact) {
    setScenarioOverride({ event, impact });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <Header spikeRef={spikeRef} eventCount={1280 + events.length} mode="mock" />

      <main
        style={{
          flex: 1,
          padding: 20,
          display: "grid",
          gridTemplateColumns: "300px 1fr 320px",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        <div style={{ minHeight: 0 }}>
          <EventFeed events={events} selectedId={selectedEvent?.id} onSelect={handleSelectEvent} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {activeImpact && <ImpactDashboard impact={activeImpact} event={activeEvent} />}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <ScenarioSimulator onSimulate={handleSimulate} />
          <div style={{ height: 240 }}>
            <KnowledgeGraph event={activeEvent} />
          </div>
        </div>
      </main>

      <section style={{ padding: "0 20px 20px" }}>
        <div style={{ height: 200 }}>
          <RecommendationsPanel recommendations={recommendations} />
        </div>
      </section>

      <footer
        style={{
          padding: "10px 28px",
          borderTop: "1px solid var(--border-soft)",
          fontSize: 11,
          color: "var(--text-muted)",
          display: "flex",
          justifyContent: "space-between",
        }}
        className="mono"
      >
        <span>Pulse v1.0 — demo mode (simulated data, no real customer or market data connected)</span>
        <span>Event Collector · Kafka · AI Engine · Neo4j · Prediction Engine</span>
      </footer>
    </div>
  );
}
