"""
Event Intelligence Engine
-------------------------
Takes a raw piece of text (news headline, RBI circular, social post) and
extracts structured banking-relevant event data: event type, location,
industry, severity, and affected customer segments.

In `mock` mode (default, no API key required) it uses a deterministic
rule-based extractor so the whole platform is runnable offline/out of the box.
In `openai` mode it calls a real LLM via LangChain.
"""
import os
import json
import re
from typing import Optional

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "mock")

EVENT_PROMPT = """You are a banking risk analyst AI. Read the news/event text and
extract a structured JSON object with exactly these fields:
event, location, industry, severity (Low|Medium|High|Critical),
affected_segments (list of customer segment strings),
summary (one sentence).

Text: {text}

Respond with JSON only, no prose, no markdown fences.
"""

# very small keyword model used for offline/mock mode so the system
# works end-to-end without any external API key
_SEVERITY_KEYWORDS = {
    "Critical": ["recession", "crash", "default wave", "bank run", "collapse"],
    "High": ["layoffs", "layoff", "job cuts", "rate hike", "natural disaster", "flood", "earthquake", "strike"],
    "Medium": ["inflation", "fuel price", "rate cut", "policy change", "election"],
}

_INDUSTRY_KEYWORDS = {
    "IT": ["it company", "tech", "software", "it sector", "it companies"],
    "Manufacturing": ["factory", "manufacturing", "auto", "automobile"],
    "Real Estate": ["real estate", "housing", "property", "mortgage"],
    "Agriculture": ["farmer", "agriculture", "crop", "monsoon"],
    "Energy": ["fuel", "oil", "petrol", "diesel", "energy"],
    "Banking/Finance": ["rbi", "interest rate", "repo rate", "bank"],
}

_LOCATION_HINTS = [
    "bengaluru", "mumbai", "delhi", "chennai", "hyderabad", "pune", "kolkata",
    "india", "pan-india", "gujarat", "maharashtra", "karnataka",
]


def _mock_extract(text: str) -> dict:
    lower = text.lower()

    severity = "Low"
    for level, kws in _SEVERITY_KEYWORDS.items():
        if any(kw in lower for kw in kws):
            severity = level
            break

    industry = "General"
    for ind, kws in _INDUSTRY_KEYWORDS.items():
        if any(kw in lower for kw in kws):
            industry = ind
            break

    location = "Pan-India"
    for loc in _LOCATION_HINTS:
        if loc in lower:
            location = loc.title()
            break

    if "layoff" in lower or "job cut" in lower:
        event = "Mass Layoffs"
        segments = ["Salaried - Tech", "Personal Loan Holders", "Credit Card Customers"]
    elif "rate cut" in lower:
        event = "RBI Rate Cut"
        segments = ["Home Loan Customers", "Business Loan Customers"]
    elif "rate hike" in lower or "repo rate" in lower:
        event = "RBI Rate Hike"
        segments = ["Home Loan Customers", "Business Loan Customers", "EMI Customers"]
    elif "fuel" in lower or "petrol" in lower or "diesel" in lower:
        event = "Fuel Price Change"
        segments = ["Transport/Logistics SMEs", "Retail Customers"]
    elif "flood" in lower or "earthquake" in lower or "disaster" in lower:
        event = "Natural Disaster"
        segments = ["Regional Branch Customers", "Crop Loan Holders", "MSME Loan Holders"]
    elif "election" in lower:
        event = "Election / Policy Uncertainty"
        segments = ["Business Loan Customers", "Investment Account Holders"]
    elif "inflation" in lower:
        event = "Inflation Spike"
        segments = ["Credit Card Customers", "Low-Income Segment"]
    else:
        event = "General Economic Update"
        segments = ["General Customer Base"]

    return {
        "event": event,
        "location": location,
        "industry": industry,
        "severity": severity,
        "affected_segments": segments,
        "summary": text.strip()[:160],
    }


def _openai_extract(text: str) -> dict:
    from langchain_openai import ChatOpenAI

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    prompt = EVENT_PROMPT.format(text=text)
    response = llm.invoke(prompt)
    content = response.content.strip()
    # strip accidental code fences
    content = re.sub(r"^```(json)?|```$", "", content, flags=re.MULTILINE).strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        # fall back to mock extractor if the LLM returns malformed JSON
        return _mock_extract(text)


def extract_event(text: str) -> dict:
    if LLM_PROVIDER == "openai" and os.getenv("OPENAI_API_KEY"):
        return _openai_extract(text)
    return _mock_extract(text)
