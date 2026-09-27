import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";

const PRIORITY_STYLE = {
  High: { color: "var(--critical)", Icon: ShieldAlert },
  Medium: { color: "var(--warning)", Icon: ShieldQuestion },
  Low: { color: "var(--positive)", Icon: ShieldCheck },
};

export default function RecommendationsPanel({ recommendations }) {
  return (
    <div className="panel" style={{ padding: 16, height: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="panel-title">Autonomous recommendations</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
        {recommendations.map((r, i) => {
          const style = PRIORITY_STYLE[r.priority] || PRIORITY_STYLE.Low;
          const Icon = style.Icon;
          return (
            <div
              key={i}
              className="slide-in"
              style={{
                display: "flex",
                gap: 10,
                padding: "10px 12px",
                background: "var(--surface-2)",
                border: "1px solid var(--border-soft)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <Icon size={16} style={{ color: style.color, flexShrink: 0, marginTop: 1 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{r.action}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 3, lineHeight: 1.4 }}>{r.rationale}</div>
              </div>
              <div
                className="mono"
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  color: style.color,
                  fontWeight: 600,
                  flexShrink: 0,
                  alignSelf: "flex-start",
                }}
              >
                {r.priority.toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
