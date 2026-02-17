"""
Main FastAPI application for the refund decision system.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List
import os

from app.schemas import HealthResponse, CaseWithSuggestion, TextFeaturesRequest, TextFeaturesResponse
from app.data import load_cases_from_csv
from app.engine import RefundDecisionEngine
from app.nlp import extract_text_features
from pydantic import BaseModel


# Initialize FastAPI app
app = FastAPI(
    title="Refund Decision Engine",
    description="A rule-based system for evaluating food delivery refund requests",
    version="1.0.0"
)

# Add CORS middleware to allow cross-origin requests
# Get allowed origins from environment variable or use defaults
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "")

# Default allowed origins for common deployment platforms
default_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://refundassistant.mindportal.cloud",
    "https://*.vercel.app",
    "https://*.netlify.app",
    "https://*.onrender.com",
]

if allowed_origins_str:
    allowed_origins = allowed_origins_str.split(",")
else:
    allowed_origins = ["*"]  # Allow all origins in development

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,  # Must be False when using allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engine
engine = RefundDecisionEngine()

# Data file path
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "cases.csv")

# Policy management - in-memory store (in production, use database)
policy_rules = {
    "COMPLAINT_SEVERITY": {"enabled": True, "weight": 1.0, "description": "Severity of complaint type"},
    "HIGH_DELAY": {"enabled": True, "weight": 1.0, "description": "High delivery delay penalty"},
    "RESTAURANT_ERROR": {"enabled": True, "weight": 1.0, "description": "Restaurant reliability score"},
    "CUSTOMER_RISK": {"enabled": True, "weight": 1.0, "description": "Customer refund history risk"},
    "PHOTO_EVIDENCE": {"enabled": True, "weight": 1.0, "description": "Photo evidence bonus"},
    "ORDER_VALUE": {"enabled": True, "weight": 1.0, "description": "Order monetary value impact"},
    "VAGUE_COMPLAINT": {"enabled": True, "weight": 1.0, "description": "Vague complaint penalty"},
    "TEXT_SIGNALS": {"enabled": True, "weight": 1.0, "description": "LLM text intelligence signals"},
}

# Pydantic models for policy requests
class PolicyToggleRequest(BaseModel):
    rule_code: str

class PolicyWeightRequest(BaseModel):
    rule_code: str
    weight: float

class PolicyPresetRequest(BaseModel):
    preset: str


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        Status indicating the service is running
    """
    return HealthResponse(
        status="ok",
        service="refund-engine"
    )


@app.get("/cases", response_model=List[CaseWithSuggestion])
async def get_cases_with_suggestions(demo_only: bool = False):
    """
    Get all cases with computed refund suggestions.
    
    This endpoint:
    1. Loads all cases from the CSV dataset
    2. Evaluates each case using the rule-based engine
    3. Returns cases with their computed suggestions
    
    Args:
        demo_only: If True, return only demo cases (is_demo=True)
    
    Returns:
        List of cases with refund suggestions
    """
    try:
        # Load cases from CSV
        cases = load_cases_from_csv(DATA_PATH)
        
        if not cases:
            return []
        
        # Filter by demo_only if requested
        if demo_only:
            cases = [case for case in cases if case.is_demo]
        
        # Compute suggestions for each case
        results = []
        for case in cases:
            # Extract text features if complaint_text is available
            text_features = None
            if case.complaint_text:
                text_features = extract_text_features(case.complaint_text)
            
            suggestion = engine.evaluate_case(case, text_features)
            results.append(CaseWithSuggestion(
                case=case,
                suggestion=suggestion
            ))
        
        return results
    
    except FileNotFoundError:
        raise HTTPException(
            status_code=500,
            detail=f"Cases file not found at {DATA_PATH}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing cases: {str(e)}"
        )


@app.get("/cases/{case_id}", response_model=CaseWithSuggestion)
async def get_case_by_id(case_id: str):
    """
    Get a single case with computed refund suggestion by case ID.
    
    Args:
        case_id: The unique case identifier
    
    Returns:
        Case with refund suggestion
    
    Raises:
        404: If case not found
    """
    try:
        # Load all cases from CSV
        cases = load_cases_from_csv(DATA_PATH)
        
        # Find the specific case
        target_case = None
        for case in cases:
            if case.case_id == case_id:
                target_case = case
                break
        
        if target_case is None:
            raise HTTPException(
                status_code=404,
                detail=f"Case {case_id} not found"
            )
        
        # Extract text features if complaint_text is available
        text_features = None
        if target_case.complaint_text:
            text_features = extract_text_features(target_case.complaint_text)
        
        # Compute suggestion for the case
        suggestion = engine.evaluate_case(target_case, text_features)
        
        return CaseWithSuggestion(
            case=target_case,
            suggestion=suggestion
        )
    
    except HTTPException:
        raise
    except FileNotFoundError:
        raise HTTPException(
            status_code=500,
            detail=f"Cases file not found at {DATA_PATH}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing case: {str(e)}"
        )


@app.post("/nlp/extract", response_model=TextFeaturesResponse)
async def extract_features_from_text(request: TextFeaturesRequest):
    """
    Extract structured features from complaint text using LLM.
    
    The LLM acts as a classification extractor, NOT a decision maker.
    It only identifies signals that the rule engine will use.
    
    Args:
        request: Text features request with complaint text
    
    Returns:
        Extracted structured features
    """
    try:
        # Validate text is not empty
        if not request.text or not request.text.strip():
            raise HTTPException(
                status_code=400,
                detail="Text cannot be empty"
            )
        
        # Extract features
        features = extract_text_features(request.text.strip())
        
        return TextFeaturesResponse(**features)
    
    except HTTPException:
        raise
    except Exception as e:
        # If extraction fails, return fallback
        return TextFeaturesResponse(
            food_quality_issue=False,
            missing_item=False,
            wrong_item=False,
            temperature_problem=False,
            packaging_problem=False,
            delivery_spill=False,
            vague_complaint=False,
            customer_aggression=0.0,
            evidence_strength=0.0,
            confidence=0.0
        )


@app.get("/impact")
async def get_impact(
    orders_per_day: float = 1000,
    complaint_rate: float = 0.05,
    avg_order_value: float = 30,
    current_refund_rate: float = 0.6,
    improvement_pct: float = 0.1
):
    """
    Calculate business impact of refund optimization.
    
    Args:
        orders_per_day: Average orders per day
        complaint_rate: Rate of complaints (0-1)
        avg_order_value: Average order value in dollars
        current_refund_rate: Current refund rate for complaints (0-1)
        improvement_pct: Target improvement percentage (0-1)
    
    Returns:
        Impact data with current costs and improvement scenarios
    """
    try:
        # Calculate current metrics
        complaints_per_day = orders_per_day * complaint_rate
        complaints_per_year = complaints_per_day * 365
        
        refunds_per_year = complaints_per_year * current_refund_rate
        current_annual_cost = refunds_per_year * avg_order_value
        
        # Assume 15 minutes per case
        minutes_per_case = 15
        current_hours_per_year = (complaints_per_year * minutes_per_case) / 60
        
        # Generate improvement scenarios
        improvement_levels = [0.05, 0.10, 0.15, 0.20]
        scenarios = []
        
        for improvement in improvement_levels:
            # Calculate savings
            cases_prevented = complaints_per_year * improvement
            refunds_prevented = cases_prevented * current_refund_rate
            annual_savings = refunds_prevented * avg_order_value
            time_saved_hours = (cases_prevented * minutes_per_case) / 60
            
            scenarios.append({
                "improvement_pct": improvement,
                "annual_savings": round(annual_savings, 2),
                "cases_prevented": round(cases_prevented),
                "time_saved_hours": round(time_saved_hours)
            })
        
        return {
            "current_annual_cost": round(current_annual_cost, 2),
            "current_cases_per_year": round(complaints_per_year),
            "current_hours_per_year": round(current_hours_per_year),
            "scenarios": scenarios
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error calculating impact: {str(e)}"
        )


@app.get("/policy")
async def get_policy():
    """
    Get current policy configuration.
    
    Returns:
        Policy rules with enabled status and weights
    """
    rules = [
        {
            "rule_code": code,
            "enabled": data["enabled"],
            "weight": data["weight"],
            "description": data["description"]
        }
        for code, data in policy_rules.items()
    ]
    return {"rules": rules}


@app.post("/policy/toggle")
async def toggle_policy_rule(request: PolicyToggleRequest):
    """
    Toggle a policy rule on/off.
    
    Args:
        request: Contains rule_code to toggle
    
    Returns:
        Success message
    """
    rule_code = request.rule_code
    
    if rule_code not in policy_rules:
        raise HTTPException(
            status_code=404,
            detail=f"Rule {rule_code} not found"
        )
    
    policy_rules[rule_code]["enabled"] = not policy_rules[rule_code]["enabled"]
    
    return {
        "message": f"Rule {rule_code} toggled",
        "enabled": policy_rules[rule_code]["enabled"]
    }


@app.post("/policy/weight")
async def update_policy_weight(request: PolicyWeightRequest):
    """
    Update a policy rule's weight.
    
    Args:
        request: Contains rule_code and new weight
    
    Returns:
        Success message
    """
    rule_code = request.rule_code
    weight = request.weight
    
    if rule_code not in policy_rules:
        raise HTTPException(
            status_code=404,
            detail=f"Rule {rule_code} not found"
        )
    
    if weight < 0 or weight > 2:
        raise HTTPException(
            status_code=400,
            detail="Weight must be between 0 and 2"
        )
    
    policy_rules[rule_code]["weight"] = weight
    
    return {
        "message": f"Rule {rule_code} weight updated",
        "weight": weight
    }


@app.post("/policy/preset")
async def apply_policy_preset(request: PolicyPresetRequest):
    """
    Apply a preset policy configuration.
    
    Args:
        request: Contains preset name (strict, friendly, delay-tolerant)
    
    Returns:
        Success message with applied changes
    """
    preset = request.preset.lower()
    
    if preset == "strict":
        # Strict mode: Increase fraud detection
        policy_rules["CUSTOMER_RISK"]["weight"] = 1.5
        policy_rules["CUSTOMER_RISK"]["enabled"] = True
        policy_rules["VAGUE_COMPLAINT"]["weight"] = 1.3
        policy_rules["VAGUE_COMPLAINT"]["enabled"] = True
        policy_rules["PHOTO_EVIDENCE"]["weight"] = 1.2
        return {
            "message": "Strict mode applied",
            "changes": [
                "CUSTOMER_RISK weight increased to 1.5",
                "VAGUE_COMPLAINT weight increased to 1.3",
                "PHOTO_EVIDENCE weight increased to 1.2"
            ]
        }
    
    elif preset == "friendly":
        # Customer-friendly: More lenient
        policy_rules["CUSTOMER_RISK"]["weight"] = 0.5
        policy_rules["CUSTOMER_RISK"]["enabled"] = True
        policy_rules["PHOTO_EVIDENCE"]["weight"] = 1.5
        policy_rules["PHOTO_EVIDENCE"]["enabled"] = True
        policy_rules["VAGUE_COMPLAINT"]["weight"] = 0.5
        return {
            "message": "Customer-friendly mode applied",
            "changes": [
                "CUSTOMER_RISK weight decreased to 0.5",
                "PHOTO_EVIDENCE weight increased to 1.5",
                "VAGUE_COMPLAINT weight decreased to 0.5"
            ]
        }
    
    elif preset == "delay-tolerant":
        # Delay tolerant: Less penalty for delays
        policy_rules["HIGH_DELAY"]["weight"] = 0.5
        policy_rules["HIGH_DELAY"]["enabled"] = True
        policy_rules["COMPLAINT_SEVERITY"]["weight"] = 1.2
        return {
            "message": "Delay-tolerant mode applied",
            "changes": [
                "HIGH_DELAY weight decreased to 0.5",
                "COMPLAINT_SEVERITY weight increased to 1.2"
            ]
        }
    
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown preset: {preset}. Use 'strict', 'friendly', or 'delay-tolerant'"
        )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unexpected errors."""
    return JSONResponse(
        status_code=500,
        content={
            "detail": f"Internal server error: {str(exc)}"
        }
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)

