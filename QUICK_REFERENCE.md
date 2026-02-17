# Quick Reference - Refund Engine with LLM

## 🚀 Quick Start

```bash
# 1. Install
pip install -r requirements.txt

# 2. (Optional) Set API Key
$env:OPENAI_API_KEY = "sk-..."

# 3. Run
python main.py
```

Server: `http://localhost:8000`  
Docs: `http://localhost:8000/docs`

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Get All Cases
```bash
GET /cases
GET /cases?demo_only=true
```

### Get Single Case
```bash
GET /cases/{case_id}
```

### Extract Text Features (NEW)
```bash
POST /nlp/extract
Body: {"text": "complaint text..."}
```

## 🧠 LLM Integration

### Key Points
- ✅ LLM extracts signals, NOT makes decisions
- ✅ Works without API key (fallback mode)
- ✅ Cached for performance
- ✅ 4-second timeout
- ✅ Never crashes the engine

### Extracted Features
```json
{
  "food_quality_issue": bool,
  "missing_item": bool,
  "wrong_item": bool,
  "temperature_problem": bool,
  "packaging_problem": bool,
  "delivery_spill": bool,
  "vague_complaint": bool,
  "customer_aggression": 0.0-1.0,
  "evidence_strength": 0.0-1.0,
  "confidence": 0.0-1.0
}
```

### Text Scoring Rules
| Signal | Impact |
|--------|--------|
| Missing/Wrong Item | +12 |
| Delivery Spill | +10 |
| Temperature Problem | +8 |
| Evidence Strength > 0.6 | +8 |
| Food Quality Issue | +7 |
| Packaging Problem | +6 |
| Vague Complaint | -8 |
| High Aggression > 0.7 | -5 |

## 📊 Decision Thresholds

| Score | Action |
|-------|--------|
| ≥ 70 | REFUND |
| 65-69 | MANUAL_REVIEW |
| 40-64 | PARTIAL |
| 35-39 | MANUAL_REVIEW |
| < 35 | REJECT |

## 🧪 Testing

```bash
# Test NLP endpoint
curl -X POST http://localhost:8000/nlp/extract \
  -H "Content-Type: application/json" \
  -d '{"text": "Pizza was cold"}'

# Test case with text
# Add complaint_text to CSV or API request
```

## 📁 Project Structure

```
RefundAssistant/
├── main.py              # FastAPI app
├── app/
│   ├── schemas.py       # Data models
│   ├── data.py          # CSV loader
│   ├── engine.py        # Rule engine
│   └── nlp.py          # LLM integration (NEW)
└── data/
    └── cases.csv        # Dataset
```

## 📚 Documentation

- **README.md** - Full documentation
- **NLP_INTEGRATION.md** - LLM details
- **DEMO_CASES.md** - Demo scenarios
- **QUICKSTART.md** - Getting started
- **IMPLEMENTATION_SUMMARY.md** - Technical details

## 🔧 Configuration

### Environment Variables
```bash
OPENAI_API_KEY=sk-...  # Optional, for LLM features
```

### Model Settings (in app/nlp.py)
- Model: `gpt-3.5-turbo`
- Temperature: `0.0`
- Timeout: `4 seconds`
- Max Tokens: `300`

## ⚠️ Important Notes

1. **LLM is NOT the decision maker** - it only extracts signals
2. **System works without API key** - returns neutral features
3. **Text features are cached** - reduces API costs
4. **Backward compatible** - existing cases work unchanged
5. **Explainable decisions** - all TEXT_SIGNAL_* reasons included

## 🎯 Use Cases

### Without LLM (Traditional)
- Structured data only
- Fast, no API calls
- Deterministic scoring

### With LLM (Enhanced)
- Structured + text data
- Better interpretation
- More context-aware

## 💡 Examples

### PowerShell
```powershell
# Extract features
$body = @{ text = "Food was cold!" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8000/nlp/extract" `
    -Method POST -Body $body -ContentType "application/json"

# Get demo cases
Invoke-WebRequest -Uri "http://localhost:8000/cases?demo_only=true"
```

### Python
```python
import requests

# Extract features
response = requests.post(
    "http://localhost:8000/nlp/extract",
    json={"text": "Pizza was cold"}
)
features = response.json()

# Get cases
cases = requests.get("http://localhost:8000/cases").json()
```

## 🔍 Troubleshooting

**Port in use?**
```bash
uvicorn main:app --port 8001
```

**No API key?**
- System works fine, LLM features return neutral values

**Slow responses?**
- First call to LLM takes ~1-2s
- Subsequent calls cached (instant)

**Want to clear cache?**
```python
from app.nlp import clear_cache
clear_cache()
```

## 📈 Performance

- **Without LLM**: ~1ms per case
- **With LLM (first call)**: ~1-2s per unique text
- **With LLM (cached)**: ~1ms per case
- **Caching**: In-memory by text hash

## 🎓 Learning Path

1. Start: Read **QUICKSTART.md**
2. Understand: Read **README.md**
3. Demo: Check **DEMO_CASES.md**
4. LLM: Read **NLP_INTEGRATION.md**
5. Deep Dive: Read **IMPLEMENTATION_SUMMARY.md**

---

**Version**: 2.0 (with LLM Text Intelligence)  
**Status**: Production Ready ✅

