# Quick Start Guide - Refund Engine Demo

## Installation & Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the server
python main.py
```

Server will start at: `http://localhost:8000`

## Quick Demo

### 1. Check Server Health
```bash
curl http://localhost:8000/health
```

Expected: `{"status":"ok","service":"refund-engine"}`

### 2. View All Demo Cases
```bash
curl "http://localhost:8000/cases?demo_only=true"
```

Returns 5 carefully crafted demo cases with computed suggestions.

### 3. Inspect Individual Demo Cases

#### Demo 001: Legit Complaint
```bash
curl http://localhost:8000/cases/DEMO_001
```
**Scenario**: Customer with excellent history, photo evidence, missing items  
**Result**: PARTIAL refund (score: 46)

#### Demo 002: Fraud Pattern
```bash
curl http://localhost:8000/cases/DEMO_002
```
**Scenario**: High refund rate (45%), no evidence, vague complaint  
**Result**: REJECT (score: 0)

#### Demo 003: Restaurant Fault
```bash
curl http://localhost:8000/cases/DEMO_003
```
**Scenario**: High restaurant error rate (35%), wrong order, photo proof  
**Result**: REFUND (score: 72)

#### Demo 004: Courier Fault
```bash
curl http://localhost:8000/cases/DEMO_004
```
**Scenario**: Extreme delay (95 min), excellent restaurant record  
**Result**: PARTIAL refund (score: 50)

#### Demo 005: Grey Area
```bash
curl http://localhost:8000/cases/DEMO_005
```
**Scenario**: Mixed signals - moderate issues but no evidence  
**Result**: REJECT (score: 35, borderline)

## Interactive API Documentation

Open in browser: `http://localhost:8000/docs`

The Swagger UI provides:
- Interactive API testing
- Complete schema documentation
- Try-it-out functionality for all endpoints

## Understanding the Response

Each case returns a structured response:

```json
{
  "case": {
    "case_id": "DEMO_003",
    "order_value": 110.0,
    "delivery_delay_min": 35,
    "restaurant_error_rate": 0.35,
    "customer_refund_rate": 0.02,
    "complaint_type": "WRONG_ORDER",
    "photo_provided": true,
    "is_demo": true
  },
  "suggestion": {
    "action": "REFUND",
    "confidence": 0.69,
    "score": 72.0,
    "reasons": [
      {
        "factor": "Complaint Severity",
        "explanation": "Wrong order delivered - clear mistake",
        "impact": 20.0
      },
      {
        "factor": "Restaurant Reliability",
        "explanation": "High restaurant error rate (35%) - pattern of issues",
        "impact": 15.0
      }
      // ... more reasons
    ]
  }
}
```

### Key Fields

- **action**: Decision (REFUND, PARTIAL, REJECT, MANUAL_REVIEW)
- **confidence**: Probability score (0-1)
- **score**: Raw score from business rules
- **reasons**: Explainable factors with impact values

## Decision Logic

The engine evaluates 6 factors:

1. **Complaint Severity** (0-35 pts)
   - NEVER_ARRIVED: 35 pts
   - DAMAGED_FOOD: 25 pts
   - WRONG_ORDER: 20 pts
   - MISSING_ITEMS: 18 pts
   - QUALITY_ISSUE: 15 pts
   - LATE_DELIVERY: 10 pts

2. **Delivery Delay** (0-20 pts)
   - ≥60 min: 20 pts
   - ≥30 min: 12 pts
   - ≥15 min: 5 pts
   - <15 min: 0 pts

3. **Restaurant Reliability** (0-15 pts)
   - Error rate ≥30%: 15 pts
   - Error rate ≥15%: 8 pts
   - Error rate ≥5%: 3 pts
   - Error rate <5%: 0 pts

4. **Customer History** (-15 to +5 pts)
   - Refund rate ≥40%: -15 pts (fraud flag)
   - Refund rate ≥20%: -8 pts
   - Refund rate ≥10%: -3 pts
   - Refund rate <10%: +5 pts (trustworthy)

5. **Evidence Quality** (-5 to +10 pts)
   - Photo provided: +10 pts
   - No photo: -5 pts

6. **Order Value** (0-10 pts)
   - ≥$100: 10 pts
   - ≥$50: 5 pts
   - ≥$20: 2 pts
   - <$20: 0 pts

### Score Thresholds

- **≥70**: REFUND (full refund)
- **65-69**: MANUAL_REVIEW (borderline high)
- **40-64**: PARTIAL (partial refund)
- **35-39**: MANUAL_REVIEW (borderline low)
- **<35**: REJECT (no refund)

## PowerShell Examples (Windows)

```powershell
# Get demo cases
Invoke-WebRequest -Uri "http://localhost:8000/cases?demo_only=true" -UseBasicParsing | Select-Object -ExpandProperty Content

# Get specific case
Invoke-WebRequest -Uri "http://localhost:8000/cases/DEMO_001" -UseBasicParsing | Select-Object -ExpandProperty Content

# Count demo cases
$response = Invoke-WebRequest -Uri "http://localhost:8000/cases?demo_only=true" -UseBasicParsing
($response.Content | ConvertFrom-Json).Count
```

## Next Steps

1. Review [DEMO_CASES.md](DEMO_CASES.md) for detailed scenario analysis
2. Check [VERIFICATION_SUMMARY.md](VERIFICATION_SUMMARY.md) for test results
3. Explore the full [README.md](README.md) for architecture details
4. Modify `data/cases.csv` to add your own test cases

## Troubleshooting

**Port already in use?**
```bash
# Change port in main.py or run with:
uvicorn main:app --port 8001
```

**Missing dependencies?**
```bash
pip install -r requirements.txt
```

**CSV not found?**
The system auto-generates `data/cases.csv` if missing.

## Support

For issues or questions, review the detailed documentation:
- [README.md](README.md) - Full documentation
- [DEMO_CASES.md](DEMO_CASES.md) - Demo case details
- [VERIFICATION_SUMMARY.md](VERIFICATION_SUMMARY.md) - Test results

