# NLP Text Intelligence Layer

## Overview

The refund-engine now includes an **LLM-powered text intelligence layer** that extracts structured features from unstructured complaint text. This layer enhances the rule-based decision engine without letting the LLM make refund decisions.

### Key Principle

**The LLM does NOT make refund decisions.** It only converts complaint text → structured signals that the rule engine uses alongside other factors.

## Architecture

```
Customer Complaint Text
         ↓
    [OpenAI GPT]  ← Classification Extractor (NOT Decision Maker)
         ↓
  Structured Features
         ↓
  [Rule-Based Engine] ← Makes the actual decision
         ↓
   Refund Decision
```

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

This installs `openai==1.12.0` along with other dependencies.

### 2. Configure API Key

Set the OpenAI API key as an environment variable:

```bash
# Windows (PowerShell)
$env:OPENAI_API_KEY = "sk-..."

# Windows (CMD)
set OPENAI_API_KEY=sk-...

# Linux/Mac
export OPENAI_API_KEY=sk-...
```

**IMPORTANT**: Never hardcode the API key in code.

### 3. Fallback Behavior

If `OPENAI_API_KEY` is not set:
- The system continues to work normally
- Text features return all `False`/`0.0` values
- No errors are raised
- The rule engine works with traditional features only

## API Endpoints

### POST /nlp/extract

Extract structured features from complaint text.

**Request:**
```json
{
  "text": "The pizza arrived cold and was missing the extra cheese I paid for."
}
```

**Response:**
```json
{
  "food_quality_issue": true,
  "missing_item": true,
  "wrong_item": false,
  "temperature_problem": true,
  "packaging_problem": false,
  "delivery_spill": false,
  "vague_complaint": false,
  "customer_aggression": 0.2,
  "evidence_strength": 0.8,
  "confidence": 0.95
}
```

**Validation:**
- Empty text → 400 Bad Request
- LLM failure → Returns fallback features (all False/0.0)

**Performance:**
- Results are cached in memory (by text hash)
- Timeout: 4 seconds maximum
- Never crashes the scoring engine

## Extracted Features

| Feature | Type | Description |
|---------|------|-------------|
| `food_quality_issue` | bool | Food quality problem mentioned |
| `missing_item` | bool | Item missing from order |
| `wrong_item` | bool | Wrong item delivered |
| `temperature_problem` | bool | Temperature issue (cold/hot) |
| `packaging_problem` | bool | Packaging damaged or poor |
| `delivery_spill` | bool | Spill during delivery |
| `vague_complaint` | bool | Complaint lacks specifics |
| `customer_aggression` | float (0-1) | Aggression level in text |
| `evidence_strength` | float (0-1) | How detailed/specific the complaint is |
| `confidence` | float (0-1) | LLM's confidence in extraction |

## Integration with Rule Engine

When a case includes `complaint_text`, the engine:

1. Extracts text features using OpenAI
2. Applies text-based scoring rules
3. Adds TEXT_SIGNAL_* reasons to the decision

### Text-Based Scoring Rules

| Signal | Impact | Explanation |
|--------|--------|-------------|
| `temperature_problem` | +8 | Food quality concern |
| `missing_item` OR `wrong_item` | +12 | Strong validity indicator |
| `delivery_spill` | +10 | Courier fault (not restaurant) |
| `food_quality_issue` | +7 | Quality problem described |
| `packaging_problem` | +6 | Preparation issue |
| `vague_complaint` | -8 | Reduces credibility |
| `customer_aggression > 0.7` | -5 | Unreasonable expectations |
| `evidence_strength > 0.6` | +8 | Detailed description |

### Example Decision with Text Features

**Input Case:**
```json
{
  "case_id": "CASE_TEXT_001",
  "order_value": 45.00,
  "delivery_delay_min": 20,
  "complaint_type": "QUALITY_ISSUE",
  "complaint_text": "The pizza was ice cold and missing the pepperoni I ordered."
}
```

**Extracted Features:**
```json
{
  "temperature_problem": true,
  "missing_item": true,
  "evidence_strength": 0.85,
  "confidence": 0.92
}
```

**Decision Reasons Include:**
```json
[
  {
    "factor": "Complaint Severity",
    "explanation": "Quality concern reported",
    "impact": 15.0
  },
  {
    "factor": "TEXT_SIGNAL_Temperature",
    "explanation": "Complaint mentions temperature issues - food quality concern",
    "impact": 8.0
  },
  {
    "factor": "TEXT_SIGNAL_ItemIssue",
    "explanation": "Complaint clearly describes missing item - strong validity",
    "impact": 12.0
  },
  {
    "factor": "TEXT_SIGNAL_EvidenceStrength",
    "explanation": "Strong evidence in complaint text (85%) - detailed description",
    "impact": 8.0
  }
]
```

## LLM Prompt Design

### System Prompt
```
You are a structured information extractor for food delivery complaints.
Return ONLY valid JSON.
Do not explain anything.
Do not add text outside JSON.
You are not allowed to decide refund outcomes.
```

### User Prompt Template
```
Complaint text:
"""
{complaint_text}
"""

Extract structured signals for operational decision support.

Respond with JSON fields:
food_quality_issue (boolean)
missing_item (boolean)
wrong_item (boolean)
temperature_problem (boolean)
packaging_problem (boolean)
delivery_spill (boolean)
vague_complaint (boolean)
customer_aggression (0-1 float)
evidence_strength (0-1 float)
confidence (0-1 float)
```

### Model Configuration
- Model: `gpt-3.5-turbo`
- Temperature: `0.0` (deterministic)
- Max Tokens: `300`
- Timeout: `4 seconds`

## Usage Examples

### Example 1: Extract Features Only

```bash
curl -X POST http://localhost:8000/nlp/extract \
  -H "Content-Type: application/json" \
  -d '{"text": "Food was cold and delivery guy spilled the drink"}'
```

### Example 2: Case with Complaint Text

Add `complaint_text` field to CSV or API request:

```csv
case_id,order_value,delivery_delay_min,...,complaint_text
CASE001,45.00,20,...,"Pizza arrived cold with missing toppings"
```

The engine automatically extracts features and includes them in scoring.

### Example 3: PowerShell Test

```powershell
$body = @{
    text = "The burger was undercooked and the fries were soggy. Very disappointed!"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/nlp/extract" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing | Select-Object -ExpandProperty Content
```

## Safety & Performance

### Error Handling
- **OpenAI API failure**: Returns fallback features, no crash
- **Timeout (>4s)**: Returns fallback features
- **Invalid JSON**: Returns fallback features
- **Missing API key**: Returns fallback features
- **Network error**: Returns fallback features

### Caching
- Features are cached by text hash (MD5)
- Cache is in-memory (cleared on restart)
- Reduces API calls for repeated text
- Use `clear_cache()` function to reset

### Cost Optimization
- Uses `gpt-3.5-turbo` (cheaper than GPT-4)
- Temperature 0.0 for consistency
- Max 300 tokens per request
- Caching reduces duplicate calls

## Testing

### Run Test Suite

```bash
python test_nlp.py
```

This tests:
- Feature structure validation
- Fallback behavior (no API key)
- OpenAI integration (if API key present)

### Manual Testing

```bash
# Test with no API key (fallback)
python test_nlp.py

# Test with API key
export OPENAI_API_KEY=sk-...
python test_nlp.py
```

## Decision Pipeline

The complete decision pipeline is now:

```
1. Load Case Data (CSV/API)
   ↓
2. Extract Traditional Features
   - Complaint type severity
   - Delivery delay
   - Restaurant error rate
   - Customer refund history
   - Photo evidence
   - Order value
   ↓
3. Extract Text Features (if complaint_text present)
   - Call OpenAI API
   - Parse structured features
   - Cache results
   ↓
4. Apply Rule-Based Scoring
   - Traditional rules (6 factors)
   - Text intelligence rules (8 signals)
   - Compute total score
   ↓
5. Determine Action
   - REFUND (score ≥ 70)
   - PARTIAL (score 40-69)
   - REJECT (score < 40)
   - MANUAL_REVIEW (borderline)
   ↓
6. Return Decision with Reasons
   - Action + confidence
   - All contributing factors
   - TEXT_SIGNAL_* reasons included
```

## Backward Compatibility

✅ **Fully backward compatible**
- Cases without `complaint_text` work exactly as before
- No breaking changes to existing endpoints
- Optional feature that enhances (not replaces) rules

## Swagger Documentation

The `/nlp/extract` endpoint is automatically documented in Swagger UI:

```
http://localhost:8000/docs
```

Try it out interactively with the "Try it out" button.

## Best Practices

1. **Always set OPENAI_API_KEY** in production
2. **Monitor API costs** - cache helps but watch usage
3. **Don't rely solely on LLM** - it's one of many signals
4. **Review TEXT_SIGNAL reasons** - they explain LLM impact
5. **Test fallback behavior** - ensure system works without API
6. **Use structured fields first** - LLM is supplementary

## Limitations

- LLM can make mistakes in classification
- Requires internet connection to OpenAI
- Adds latency (~1-2 seconds per unique text)
- Costs money per API call
- Not suitable for real-time high-volume scenarios without caching

## Future Enhancements

Possible improvements:
- Use fine-tuned model for better accuracy
- Add persistent cache (Redis/database)
- Support multiple languages
- Extract more granular features
- Add sentiment analysis
- Detect fraud patterns in text

