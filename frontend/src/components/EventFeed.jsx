import { Newspaper, Landmark, TrendingUp, MessageCircle } from "lucide-react";

const SOURCE_ICON = {
  News: Newspaper,
  RBI: Landmark,
  "Economic Data": TrendingUp,
  "Social Media": MessageCircle,
};

export default function EventFeed({ events, selectedId, onSelect }) {
  return (
    <div className="panel" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border-soft)" }}>
        <div className="panel-title">
          <span className="dot live-dot" style={{ background: "var(--pulse)" }} />
          Live signal feed
        </div>
      </div>
      <div style={{ overflowY: "auto", flex: 1, padding: 8 }}>
        {events.map((e) => {
          const Icon = SOURCE_ICON[e.source] || Newspaper;
          const active = e.id === selectedId;
          return (
            <button
              key={e.id}
              onClick={() => onSelect(e)}
              className="slide-in"
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: active ? "var(--surface-3)" : "transparent",
                border: `1px solid ${active ? "var(--border)" : "transparent"}`,
                borderRadius: "var(--radius-sm)",
                padding: "10px 10px",
                marginBottom: 4,
                cursor: "pointer",
                color: "inherit",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                <Icon size={14} style={{ marginTop: 3, color: "var(--text-muted)", flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, lineHeight: 1.4, color: "var(--text-primary)" }}>{e.text}</div>
                  <div className="mono" style={{ fontSize: 10.5, marginTop: 5, display: "flex", gap: 8, color: "var(--text-muted)" }}>
                    <span className={`severity-${e.severity}`} style={{ fontWeight: 600 }}>
                      {e.severity.toUpperCase()}
                    </span>
                    <span>{e.location}</span>
                    <span>{e.industry}</span>
                    <span style={{ marginLeft: "auto" }}>{formatTime(e.timestamp)}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatTime(d) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
