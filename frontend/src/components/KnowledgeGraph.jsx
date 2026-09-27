import { GitFork } from "lucide-react";

const SEGMENT_MAP = {
  "Mass Layoffs": ["Salaried - Tech", "Personal Loans", "Credit Cards"],
  "RBI Rate Hike": ["Home Loans", "Business Loans", "EMI Customers"],
  "RBI Rate Cut": ["Home Loans", "Business Loans"],
  "Fuel Price Change": ["Logistics SMEs", "Retail Customers"],
  "Natural Disaster": ["Branch Customers", "Crop Loans", "MSME Loans"],
  "Election / Policy Uncertainty": ["Business Loans", "Investment Accounts"],
  "Inflation Spike": ["Credit Cards", "Low-Income Segment"],
  "General Economic Update": ["General Customer Base"],
};

export default function KnowledgeGraph({ event }) {
  const segments = SEGMENT_MAP[event?.event] || SEGMENT_MAP["General Economic Update"];
  const cx = 140;
  const cy = 100;

  const industryAngle = -130;
  const locationAngle = -50;
  const segAngles = segments.map((_, i) => {
    const spread = 70;
    const start = 110;
    return start + (spread / Math.max(segments.length - 1, 1)) * i;
  });

  function point(angleDeg, r) {
    const rad = (angleDeg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }

  const [ix, iy] = point(industryAngle, 75);
  const [lx, ly] = point(locationAngle, 75);

  return (
    <div className="panel" style={{ padding: 16, height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="panel-title">
        <GitFork size={13} />
        Impact propagation graph
      </div>
      <svg viewBox="0 0 280 200" style={{ width: "100%", flex: 1 }}>
        {/* edges */}
        <line x1={cx} y1={cy} x2={ix} y2={iy} stroke="var(--border)" strokeWidth="1.5" />
        <line x1={cx} y1={cy} x2={lx} y2={ly} stroke="var(--border)" strokeWidth="1.5" />
        {segments.map((s, i) => {
          const [sx, sy] = point(segAngles[i], 95);
          return <line key={s} x1={cx} y1={cy} x2={sx} y2={sy} stroke="var(--border)" strokeWidth="1.5" />;
        })}

        {/* event node */}
        <circle cx={cx} cy={cy} r="22" fill="var(--surface-3)" stroke="var(--pulse)" strokeWidth="1.5" />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="8.5" fill="var(--text-primary)" fontFamily="var(--font-mono)">
          {wrap(event?.event || "Event", 11)}
        </text>

        {/* industry node */}
        <circle cx={ix} cy={iy} r="16" fill="var(--surface-2)" stroke="var(--info)" strokeWidth="1.2" />
        <text x={ix} y={iy + 3} textAnchor="middle" fontSize="7" fill="var(--text-secondary)" fontFamily="var(--font-mono)">
          {wrap(event?.industry || "Industry", 9)}
        </text>

        {/* location node */}
        <circle cx={lx} cy={ly} r="16" fill="var(--surface-2)" stroke="var(--info)" strokeWidth="1.2" />
        <text x={lx} y={ly + 3} textAnchor="middle" fontSize="7" fill="var(--text-secondary)" fontFamily="var(--font-mono)">
          {wrap(event?.location || "Location", 9)}
        </text>

        {/* segment nodes */}
        {segments.map((s, i) => {
          const [sx, sy] = point(segAngles[i], 95);
          return (
            <g key={s}>
              <circle cx={sx} cy={sy} r="13" fill="var(--surface-2)" stroke="var(--warning)" strokeWidth="1.2" />
              <text x={sx} y={sy + 22} textAnchor="middle" fontSize="7" fill="var(--text-muted)" fontFamily="var(--font-mono)">
                {wrap(s, 10)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function wrap(text, max) {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}
