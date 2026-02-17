# Demo Cases Documentation

This document describes the 5 crafted demo cases designed to showcase the refund decision engine's capabilities.

## Demo Case Scenarios

### DEMO_001: Legit Complaint with Strong Evidence
**Scenario**: A legitimate complaint with good supporting evidence from a trustworthy customer.

**Case Details**:
- Order Value: $55.00
- Delivery Delay: 18 minutes (moderate)
- Restaurant Error Rate: 8% (low)
- Customer Refund Rate: 2% (excellent history)
- Complaint Type: MISSING_ITEMS
- Photo Provided: Yes

**Expected Outcome**: 
- Action: **PARTIAL**
- Confidence: Medium-High (~0.70-0.80)
- Score: ~46 points

**Key Reasoning**:
- Strong evidence (photo provided) +10
- Excellent customer history +5
- Legitimate complaint type (missing items) +18
- Moderate delay adds some points +5


---

### DEMO_002: Fraud-like Pattern
**Scenario**: A case with red flags suggesting potential refund abuse.

**Case Details**:
- Order Value: $89.99
- Delivery Delay: 5 minutes (minimal)
- Restaurant Error Rate: 2% (excellent)
- Customer Refund Rate: 45% (very high - abuse pattern)
- Complaint Type: QUALITY_ISSUE (vague)
- Photo Provided: No

**Expected Outcome**:
- Action: **REJECT**
- Confidence: High (~0.85-0.95)
- Score: ~5 points

**Key Reasoning**:
- High customer refund rate -15 (major red flag)
- No supporting evidence -5
- Vague complaint type +15
- No delivery issues (delay minimal) +0
- Excellent restaurant record suggests customer issue +0


---

### DEMO_003: Clear Restaurant Fault
**Scenario**: Restaurant clearly at fault with high error rate and wrong order delivered.

**Case Details**:
- Order Value: $110.00 (high value)
- Delivery Delay: 35 minutes (moderate)
- Restaurant Error Rate: 35% (very high)
- Customer Refund Rate: 2% (excellent history)
- Complaint Type: WRONG_ORDER
- Photo Provided: Yes

**Expected Outcome**:
- Action: **REFUND**
- Confidence: High (~0.85-0.90)
- Score: ~72 points

**Key Reasoning**:
- Very high restaurant error rate +15 (pattern of mistakes)
- Wrong order with photo evidence +20 + 10
- Trustworthy customer +5
- High order value +10
- Restaurant reliability is the primary negative factor


---

### DEMO_004: Clear Courier Fault
**Scenario**: Delivery service clearly at fault with extreme delay, restaurant has good record.

**Case Details**:
- Order Value: $75.00
- Delivery Delay: 95 minutes (severe)
- Restaurant Error Rate: 2% (excellent)
- Customer Refund Rate: 5% (good history)
- Complaint Type: LATE_DELIVERY
- Photo Provided: Yes

**Expected Outcome**:
- Action: **PARTIAL** (could be REFUND in adjusted version)
- Confidence: Medium-High (~0.75-0.85)
- Score: ~55 points

**Key Reasoning**:
- Severe delivery delay +20 (primary issue)
- Restaurant has excellent record +0 (not restaurant's fault)
- Good customer history +5
- Photo evidence provided +10
- Reasons should clearly indicate courier/delivery issue, not restaurant


---

### DEMO_005: Grey Area
**Scenario**: Mixed signals - some positive, some negative factors, requiring careful review.

**Case Details**:
- Order Value: $65.00
- Delivery Delay: 35 minutes (moderate)
- Restaurant Error Rate: 20% (moderate-high)
- Customer Refund Rate: 18% (elevated concern)
- Complaint Type: MISSING_ITEMS
- Photo Provided: No

**Expected Outcome**:
- Action: **PARTIAL** (borderline, exactly at threshold)
- Confidence: Medium (~0.60-0.70)
- Score: ~40 points (at threshold)

**Key Reasoning**:
- Moderate restaurant issues +8
- Elevated customer refund rate -3 (some concern)
- No photo evidence -5 (claim unverified)
- Legitimate complaint type +18
- Mixed signals create uncertainty
- Borderline score suggests either PARTIAL or MANUAL_REVIEW


---

## Score Calculation Summary

| Case | Severity | Delay | Restaurant | Customer | Evidence | Value | **Total** | **Action** |
|------|----------|-------|------------|----------|----------|-------|-----------|------------|
| DEMO_001 | +18 | +5 | +3 | +5 | +10 | +5 | **46** | PARTIAL |
| DEMO_002 | +15 | +0 | +0 | -15 | -5 | +10 | **5** | REJECT |
| DEMO_003 | +20 | +12 | +15 | +5 | +10 | +10 | **72** | REFUND |
| DEMO_004 | +10 | +20 | +0 | +5 | +10 | +10 | **55** | PARTIAL |
| DEMO_005 | +18 | +12 | +8 | -3 | -5 | +10 | **40** | PARTIAL |

## Decision Thresholds

- **Score ≥ 70**: REFUND (Full refund approved)
- **Score 65-69**: MANUAL_REVIEW (Borderline high - needs human review)
- **Score 40-64**: PARTIAL (Partial refund recommended)
- **Score < 40**: REJECT (No refund) or MANUAL_REVIEW (borderline low 35-39)

## Testing the Demo Cases

```bash
# Get all demo cases only
curl "http://localhost:8000/cases?demo_only=true"

# Get a specific demo case
curl "http://localhost:8000/cases/DEMO_001"
curl "http://localhost:8000/cases/DEMO_002"
curl "http://localhost:8000/cases/DEMO_003"
curl "http://localhost:8000/cases/DEMO_004"
curl "http://localhost:8000/cases/DEMO_005"

# Get all cases (including non-demo)
curl "http://localhost:8000/cases"
```

## API Documentation

Access the interactive Swagger UI at:
```
http://localhost:8000/docs
```

The Swagger UI will show:
- The new `demo_only` query parameter on GET /cases
- The new GET /cases/{case_id} endpoint
- All request/response schemas including the `is_demo` field

