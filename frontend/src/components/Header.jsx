import { Activity } from "lucide-react";
import PulseMonitor from "./PulseMonitor.jsx";

export default function Header({ spikeRef, eventCount, mode }) {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "linear-gradient(180deg, rgba(16,20,28,0.9), rgba(10,13,18,0.9))",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 28px 8px",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "var(--surface-3)",
              border: "1px solid var(--border)",
              display: "grid",
              placeItems: "center",
              color: "var(--pulse)",
            }}
          >
            <Activity size={18} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, letterSpacing: "-0.01em" }}>
              Pulse <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>/ Economic Nervous System</span>
            </div>
            <div className="mono" style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
              Meridian Bank · Risk &amp; Treasury Intelligence
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <StatusPill label={mode === "mock" ? "Simulated feed" : "Live feed"} dotColor="var(--pulse)" />
          <div className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {eventCount.toString().padStart(4, "0")} signals processed today
          </div>
        </div>
      </div>

      <div style={{ height: 64, padding: "0 28px 10px" }}>
        <PulseMonitor spikeRef={spikeRef} />
      </div>
    </header>
  );
}

function StatusPill({ label, dotColor }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "5px 11px",
        borderRadius: 999,
        border: "1px solid var(--border)",
        background: "var(--surface-2)",
      }}
    >
      <span className="dot live-dot" style={{ background: dotColor }} />
      <span className="mono" style={{ fontSize: 11, color: "var(--text-secondary)" }}>
        {label}
      </span>
    </div>
  );
}
