import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const METRICS = [
  { key: "defaultRiskUpliftPct", label: "Loan default risk", unit: "%", invert: true },
  { key: "cardSpendChangePct", label: "Card spend change", unit: "%", invert: false },
  { key: "depositWithdrawalRiskScore", label: "Deposit withdrawal risk", unit: "/100", invert: true },
  { key: "branchTrafficChangePct", label: "Branch traffic", unit: "%", invert: false, neutral: true },
  { key: "mortgageDemandChangePct", label: "Mortgage demand", unit: "%", invert: false },
  { key: "businessLoanDemandChangePct", label: "Business loan demand", unit: "%", invert: false },
];

export default function ImpactDashboard({ impact, event }) {
  const chartData = METRICS.filter((m) => m.key !== "depositWithdrawalRiskScore").map((m) => ({
    name: m.label,
    value: impact[m.key],
  }));

  return (
    <div className="panel" style={{ padding: 16, height: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div className="panel-title">Predicted portfolio impact</div>
        <div className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>
          confidence {Math.round(impact.confidence * 100)}%
        </div>
      </div>

      {event && (
        <div
          style={{
            fontSize: 12.5,
            color: "var(--text-secondary)",
            padding: "8px 10px",
            background: "var(--surface-2)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-soft)",
          }}
        >
          Driven by: <strong style={{ color: "var(--text-primary)" }}>{event.event}</strong>{" "}
          <span className={`severity-${event.severity}`} style={{ fontWeight: 600 }}>
            ({event.severity})
          </span>{" "}
          in {event.industry} · {event.location}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {METRICS.map((m) => (
          <MetricCard key={m.key} metric={m} value={impact[m.key]} />
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" horizontal={false} />
            <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="var(--text-muted)"
              fontSize={11}
              width={150}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <Tooltip
              contentStyle={{ background: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "var(--text-primary)" }}
              formatter={(v) => [`${v}%`, "Change"]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.value >= 0 ? "var(--pulse)" : "var(--critical)"} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MetricCard({ metric, value }) {
  const isBad = metric.invert ? value > 0 : value < 0;
  const isGood = metric.invert ? value < 0 : value > 0;
  let color = "var(--text-secondary)";
  if (!metric.neutral) {
    if (isBad) color = "var(--critical)";
    else if (isGood) color = "var(--positive)";
  }
  const Icon = value >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border-soft)",
        borderRadius: "var(--radius-sm)",
        padding: "10px 12px",
      }}
    >
      <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginBottom: 6, lineHeight: 1.3 }}>{metric.label}</div>
      <div className="mono" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 18, fontWeight: 600, color }}>
        <Icon size={15} />
        {Math.abs(value)}
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>{metric.unit}</span>
      </div>
    </div>
  );
}
