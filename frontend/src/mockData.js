// Simulates the live stream of external + internal signals that, in
// production, would arrive via Kafka from the Event Collector service.

const TEMPLATES = [
  { event: "Mass Layoffs", location: "Bengaluru", industry: "IT", severity: "High", text: "IT firms in Bengaluru announce 18,000 layoffs amid slowdown", source: "News" },
  { event: "RBI Rate Hike", location: "Pan-India", industry: "Banking/Finance", severity: "Medium", text: "RBI raises repo rate by 25 bps to curb inflation", source: "RBI" },
  { event: "RBI Rate Cut", location: "Pan-India", industry: "Banking/Finance", severity: "Medium", text: "RBI cuts repo rate by 25 bps to boost growth", source: "RBI" },
  { event: "Fuel Price Change", location: "Pan-India", industry: "Energy", severity: "Medium", text: "Petrol prices rise ₹3/litre after global crude spike", source: "News" },
  { event: "Natural Disaster", location: "Chennai", industry: "Agriculture", severity: "Critical", text: "Severe flooding reported across Chennai districts", source: "News" },
  { event: "Inflation Spike", location: "Pan-India", industry: "General", severity: "Medium", text: "CPI inflation rises to 6.8% in latest print", source: "Economic Data" },
  { event: "Election / Policy Uncertainty", location: "Mumbai", industry: "Banking/Finance", severity: "Low", text: "State election dates announced, markets cautious", source: "News" },
  { event: "General Economic Update", location: "Delhi", industry: "General", severity: "Low", text: "Manufacturing PMI holds steady at 57.2", source: "Economic Data" },
  { event: "Mass Layoffs", location: "Hyderabad", industry: "IT", severity: "Medium", text: "Mid-size IT services firm cuts 1,200 roles", source: "Social Media" },
  { event: "Fuel Price Change", location: "Pan-India", industry: "Energy", severity: "Low", text: "Diesel prices dip slightly on softer crude", source: "News" },
];

let idCounter = 1;

export function generateRandomEvent() {
  const t = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  return {
    id: idCounter++,
    ...t,
    timestamp: new Date(),
  };
}

export function generateInitialFeed(n = 6) {
  return Array.from({ length: n }, () => generateRandomEvent());
}
