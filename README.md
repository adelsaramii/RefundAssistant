# Refund Decision Engine

A rule-based FastAPI backend that simulates a food delivery refund decision system with explainable AI.

## Project Structure

```
RefundAssistant/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── app/
│   ├── __init__.py
│   ├── schemas.py         # Pydantic data models
│   ├── data.py            # CSV data loading & generation
│   └── engine.py          # Rule-based scoring engine
└── data/
    └── cases.csv          # Case dataset (auto-generated if missing)
```

## Features

### ✅ Rule-Based Scoring Engine
- **Complaint Severity**: Evaluates the type of complaint (Never Arrived, Damaged Food, etc.)
- **Delivery Delay**: Considers how late the delivery was
- **Restaurant Reliability**: Factors in the restaurant's error rate
- **Customer History**: Checks customer's past refund patterns
- **Evidence Quality**: Whether photo evidence was provided
- **Order Value**: Considers the monetary value of the order

### 🤖 LLM Text Intelligence Layer (NEW)
- **OpenAI Integration**: Extracts structured features from complaint text
- **8 Text Signals**: Temperature issues, missing items, delivery spills, vagueness, etc.
- **Smart Caching**: In-memory cache reduces API calls
- **Fallback Safety**: Works without API key (returns neutral features)
- **Non-Decisive**: LLM only extracts signals; rule engine makes decisions
- See [NLP_INTEGRATION.md](NLP_INTEGRATION.md) for details

### ✅ Explainable Decisions
Each decision includes:
- **Action**: REFUND, PARTIAL, REJECT, or MANUAL_REVIEW
- **Confidence Score**: 0-1 probability of the decision
- **Total Score**: Raw score from business rules
- **Reasons List**: Each factor with explanation and impact value

### ✅ Automatic Dataset Generation
If `data/cases.csv` doesn't exist, the system automatically generates 50 realistic sample cases.

## Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Optional: Set OpenAI API key for text intelligence
# Windows PowerShell:
$env:OPENAI_API_KEY = "sk-..."
# Linux/Mac:
export OPENAI_API_KEY=sk-...
```

**Note**: The system works without an API key (LLM features disabled).

## Running the Server

```bash
# Run with Python
python main.py

# Or with uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

## API Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "refund-engine"
}
```

### GET /cases
Get all cases with computed refund suggestions.

**Query Parameters:**
- `demo_only` (boolean, optional): If `true`, returns only demo cases. Default: `false`

**Response Example:**
```json
[
  {
    "case": {
      "case_id": "CASE0001",
      "order_value": 45.99,
      "delivery_delay_min": 65,
      "restaurant_error_rate": 0.15,
      "customer_refund_rate": 0.05,
      "complaint_type": "LATE_DELIVERY",
      "photo_provided": true
    },
    "suggestion": {
      "action": "REFUND",
      "confidence": 0.85,
      "score": 62.0,
      "reasons": [
        {
          "factor": "Complaint Severity",
          "explanation": "Delivery was late",
          "impact": 10.0
        },
        {
          "factor": "Delivery Delay",
          "explanation": "Severe delay (65 min) - highly unacceptable",
          "impact": 20.0
        },
        {
          "factor": "Restaurant Reliability",
          "explanation": "Moderate restaurant error rate (15%)",
          "impact": 8.0
        },
        {
          "factor": "Customer History",
          "explanation": "Excellent customer history (5%) - trustworthy",
          "impact": 5.0
        },
        {
          "factor": "Evidence Quality",
          "explanation": "Photo evidence provided - claim substantiated",
          "impact": 10.0
        },
        {
          "factor": "Order Value",
          "explanation": "Medium-value order ($45.99)",
          "impact": 5.0
        }
      ]
    }
  }
]
```

### GET /cases/{case_id}
Get a single case with computed refund suggestion by case ID.

**Path Parameters:**
- `case_id` (string): The unique case identifier

**Response:**
Returns a single case with suggestion, or 404 if not found.

### POST /nlp/extract
Extract structured features from complaint text using LLM.

**Request Body:**
```json
{
  "text": "The pizza was cold and missing toppings"
}
```

**Response:**
```json
{
  "food_quality_issue": true,
  "missing_item": true,
  "temperature_problem": true,
  "vague_complaint": false,
  "customer_aggression": 0.1,
  "evidence_strength": 0.8,
  "confidence": 0.95,
  ...
}
```

## Dataset Fields

| Field | Type | Description |
|-------|------|-------------|
| `case_id` | string | Unique identifier for the case |
| `order_value` | float | Order value in dollars |
| `delivery_delay_min` | int | Delivery delay in minutes |
| `restaurant_error_rate` | float | Restaurant's historical error rate (0-1) |
| `customer_refund_rate` | float | Customer's historical refund rate (0-1) |
| `complaint_type` | enum | Type of complaint (see below) |
| `photo_provided` | bool | Whether photo evidence was provided |
| `is_demo` | bool | Whether this is a demo case (default: false) |
| `complaint_text` | string (optional) | Customer complaint text for LLM analysis |

### Complaint Types
- `LATE_DELIVERY`: Delivery was late
- `WRONG_ORDER`: Wrong order delivered
- `MISSING_ITEMS`: Items missing from order
- `QUALITY_ISSUE`: Quality concern
- `DAMAGED_FOOD`: Food was damaged
- `NEVER_ARRIVED`: Order never arrived

## Decision Logic

The engine uses score thresholds to determine actions:

- **Score ≥ 70**: REFUND (Full refund)
- **Score 65-69**: MANUAL_REVIEW (Borderline high)
- **Score 40-64**: PARTIAL (Partial refund)
- **Score 45-39**: MANUAL_REVIEW (Borderline low)
- **Score < 40**: REJECT (No refund)

## Demo Cases

The system includes 5 carefully crafted demo cases designed to showcase different scenarios:

1. **DEMO_001**: Legit complaint with strong evidence → PARTIAL refund
2. **DEMO_002**: Fraud-like pattern (high refund rate, no evidence) → REJECT
3. **DEMO_003**: Clear restaurant fault (high error rate) → REFUND
4. **DEMO_004**: Clear courier fault (extreme delay) → PARTIAL refund
5. **DEMO_005**: Grey area with mixed signals → REJECT (borderline)

See [DEMO_CASES.md](DEMO_CASES.md) for detailed analysis of each demo case.

## Testing the API

```bash
# Health check
curl http://localhost:8000/health

# Get all cases with suggestions
curl http://localhost:8000/cases

# Get only demo cases
curl "http://localhost:8000/cases?demo_only=true"

# Get a specific case by ID
curl http://localhost:8000/cases/DEMO_001
curl http://localhost:8000/cases/CASE0001

# Or open in browser
http://localhost:8000/docs  # Interactive API documentation
```

## Example Use Cases

1. **High Priority Refund**: Never arrived order with photo evidence from trusted customer
2. **Partial Refund**: Moderate delay with some issues but no strong evidence
3. **Manual Review**: Borderline cases where automatic decision is uncertain
4. **Reject**: Minor complaint from customer with high refund abuse pattern

## Development

The system is designed with clean architecture:
- **Schemas**: Type-safe data models using Pydantic
- **Data Layer**: Separate CSV loading and generation logic
- **Engine**: Isolated business logic with clear rules
- **API**: Thin FastAPI layer that orchestrates components

## Notes

- The engine is **rule-based**, not ML-based, making all decisions fully explainable
- Each decision includes the specific factors and their impact values
- The system automatically generates sample data if the CSV is missing
- All rules use interpretable business logic with clear thresholds

