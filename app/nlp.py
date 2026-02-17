"""
Text intelligence layer for extracting structured features from complaint text.
Uses OpenAI to convert unstructured text into structured signals for the rule engine.
"""
import os
import json
import hashlib
from typing import Dict, Optional
from openai import OpenAI, OpenAIError
import time


# In-memory cache for extracted features
_feature_cache: Dict[str, dict] = {}

# OpenAI client (initialized lazily)
_client: Optional[OpenAI] = None


def _get_client() -> Optional[OpenAI]:
    """Get or create OpenAI client."""
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            _client = OpenAI(api_key=api_key)
    return _client


def _get_cache_key(text: str) -> str:
    """Generate cache key from text."""
    return hashlib.md5(text.encode('utf-8')).hexdigest()


def _get_fallback_features() -> dict:
    """Return fallback features when LLM fails."""
    return {
        "food_quality_issue": False,
        "missing_item": False,
        "wrong_item": False,
        "temperature_problem": False,
        "packaging_problem": False,
        "delivery_spill": False,
        "vague_complaint": False,
        "customer_aggression": 0.0,
        "evidence_strength": 0.0,
        "confidence": 0.0
    }


def extract_text_features(text: str) -> dict:
    """
    Extract structured features from complaint text using OpenAI.
    
    The LLM acts as a classification extractor, NOT a decision maker.
    It only identifies signals that the rule engine will use.
    
    Args:
        text: Customer complaint text
        
    Returns:
        Dictionary with extracted features:
        - food_quality_issue: bool
        - missing_item: bool
        - wrong_item: bool
        - temperature_problem: bool
        - packaging_problem: bool
        - delivery_spill: bool
        - vague_complaint: bool
        - customer_aggression: float (0-1)
        - evidence_strength: float (0-1)
        - confidence: float (0-1)
    """
    # Check cache first
    cache_key = _get_cache_key(text)
    if cache_key in _feature_cache:
        return _feature_cache[cache_key]
    
    # Get OpenAI client
    client = _get_client()
    if not client:
        # No API key configured - return fallback
        return _get_fallback_features()
    
    # Prepare prompts
    system_prompt = """You are a structured information extractor for food delivery complaints.
Return ONLY valid JSON.
Do not explain anything.
Do not add text outside JSON.
You are not allowed to decide refund outcomes."""

    user_prompt = f"""Complaint text:
\"\"\"
{text}
\"\"\"

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
confidence (0-1 float)"""

    try:
        # Call OpenAI with timeout
        start_time = time.time()
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.0,
            max_tokens=300,
            timeout=4.0
        )
        
        # Parse response
        content = response.choices[0].message.content
        features = json.loads(content)
        
        # Validate structure
        required_fields = [
            "food_quality_issue", "missing_item", "wrong_item",
            "temperature_problem", "packaging_problem", "delivery_spill",
            "vague_complaint", "customer_aggression", "evidence_strength",
            "confidence"
        ]
        
        for field in required_fields:
            if field not in features:
                raise ValueError(f"Missing field: {field}")
        
        # Ensure floats are in 0-1 range
        for field in ["customer_aggression", "evidence_strength", "confidence"]:
            features[field] = max(0.0, min(1.0, float(features[field])))
        
        # Cache the result
        _feature_cache[cache_key] = features
        
        return features
    
    except (OpenAIError, json.JSONDecodeError, ValueError, KeyError, Exception) as e:
        # Any error - return fallback
        print(f"LLM extraction failed: {e}")
        return _get_fallback_features()


def clear_cache():
    """Clear the feature cache (useful for testing)."""
    global _feature_cache
    _feature_cache = {}

