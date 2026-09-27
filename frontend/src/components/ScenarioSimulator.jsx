import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { predictImpact } from "../engine.js";

const SCENARIOS = [
  {
    key: "fuel_price_rise",
    label: "Fuel price rise",
    unit: "%",
    min: 0,
    max: 30,
    step: 1,
    default: 15,
    build: (v) => ({ event: "Fuel Price Change", industry: "Energy", severity: v >= 15 ? "High" : "Medium" }),
  },
  {
    key: "rbi_rate_cut",
    label: "RBI rate cut",
    unit: "%",
    min: 0,
    max: 2,
    step: 0.25,
    default: 0.5,
    build: (v) => ({ event: "RBI Rate Cut", industry: "Banking/Finance", severity: v < 1 ? "Medium" : "High" }),
  },
  {
    key: "rbi_rate_hike",
    label: "RBI rate hike",
    unit: "%",
    min: 0,
    max: 2,
    step: 0.25,
    default: 0.5,
    build: (v) => ({ event: "RBI Rate Hike", industry: "Banking/Finance", severity: v < 1 ? "Medium" : "High" }),
  },
  {
    key: "recession",
    label: "Recession severity",
    unit: "/10",
    min: 0,
    max: 10,
    step: 1,
    default: 6,
    build: (v) => ({ event: "Mass Layoffs", industry: "IT", severity: v >= 7 ? "Critical" : v >= 4 ? "High" : "Medium" }),
  },
];

export default function ScenarioSimulator({ onSimulate }) {
  const [activeKey, setActiveKey] = useState(SCENARIOS[0].key);
  const [values, setValues] = useState(Object.fromEntries(SCENARIOS.map((s) => [s.key, s.default])));

  const active = SCENARIOS.find((s) => s.key === activeKey);

  function run(key, val) {
    const scenario = SCENARIOS.find((s) => s.key === key);
    const eventStub = scenario.build(val);
    const event = {
      event: eventStub.event,
      industry: eventStub.industry,
      severity: eventStub.severity,
      location: "Pan-India",
      text: `Simulated: ${scenario.label} of ${val}${scenario.unit}`,
      source: "Scenario",
    };
    const impact = predictImpact(event);
    onSimulate(event, impact);
  }

  function handleChange(key, val) {
    setValues((v) => ({ ...v, [key]: val }));
    run(key, val);
  }

  return (
    <div className="panel" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="panel-title">
        <SlidersHorizontal size={13} />
        What-if scenario simulator
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {SCENARIOS.map((s) => (
          <button
            key={s.key}
            onClick={() => {
              setActiveKey(s.key);
              run(s.key, values[s.key]);
            }}
            style={{
              fontSize: 11.5,
              padding: "6px 10px",
              borderRadius: 999,
              border: `1px solid ${activeKey === s.key ? "var(--pulse)" : "var(--border)"}`,
              background: activeKey === s.key ? "rgba(31,231,201,0.1)" : "var(--surface-2)",
              color: activeKey === s.key ? "var(--pulse)" : "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{active.label}</span>
          <span className="mono" style={{ fontSize: 13, color: "var(--pulse)", fontWeight: 600 }}>
            {values[active.key]}
            {active.unit}
          </span>
        </div>
        <input
          type="range"
          min={active.min}
          max={active.max}
          step={active.step}
          value={values[active.key]}
          onChange={(e) => handleChange(active.key, parseFloat(e.target.value))}
          style={{ width: "100%", accentColor: "var(--pulse)" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>
            {active.min}
            {active.unit}
          </span>
          <span className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>
            {active.max}
            {active.unit}
          </span>
        </div>
      </div>

      <p style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
        Drag the slider to instantly re-run the impact model and see projected effects on defaults, spend, deposits, and
        demand update on the left.
      </p>
    </div>
  );
}
