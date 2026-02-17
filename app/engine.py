"""
Rule-based refund decision engine with explainable scoring.
"""
from typing import List, Optional

from app.schemas import (
    CaseData,
    RefundSuggestion,
    RefundAction,
    DecisionReason,
    ComplaintType
)


class RefundDecisionEngine:
    """
    Rule-based scoring engine that evaluates refund cases.
    
    The engine applies business rules to compute a score,
    then converts it to a decision with explanations.
    """
    
    # Score thresholds for decisions
    REFUND_THRESHOLD = 70
    PARTIAL_THRESHOLD = 40
    MANUAL_REVIEW_THRESHOLD_HIGH = 65
    MANUAL_REVIEW_THRESHOLD_LOW = 45
    
    def evaluate_case(self, case: CaseData, text_features: Optional[dict] = None) -> RefundSuggestion:
        """
        Evaluate a case and return a refund suggestion.
        
        Args:
            case: The case data to evaluate
            text_features: Optional text features extracted from complaint text
            
        Returns:
            RefundSuggestion with action, confidence, score, and reasons
        """
        reasons = []
        score = 0.0
        
        # Rule 1: Complaint Severity
        severity_score, severity_reason = self._evaluate_complaint_severity(case)
        score += severity_score
        reasons.append(severity_reason)
        
        # Rule 2: Delivery Delay
        delay_score, delay_reason = self._evaluate_delivery_delay(case)
        score += delay_score
        reasons.append(delay_reason)
        
        # Rule 3: Restaurant Reliability
        restaurant_score, restaurant_reason = self._evaluate_restaurant_error_rate(case)
        score += restaurant_score
        reasons.append(restaurant_reason)
        
        # Rule 4: Customer History
        customer_score, customer_reason = self._evaluate_customer_history(case)
        score += customer_score
        reasons.append(customer_reason)
        
        # Rule 5: Evidence Quality
        evidence_score, evidence_reason = self._evaluate_evidence(case)
        score += evidence_score
        reasons.append(evidence_reason)
        
        # Rule 6: Order Value
        value_score, value_reason = self._evaluate_order_value(case)
        score += value_score
        reasons.append(value_reason)
        
        # Rule 7-13: Text Intelligence Features (if available)
        if text_features and text_features.get("confidence", 0) > 0:
            text_score, text_reasons = self._evaluate_text_features(text_features)
            score += text_score
            reasons.extend(text_reasons)
        
        # Determine action and confidence
        action, confidence = self._score_to_action(score, case)
        
        return RefundSuggestion(
            action=action,
            confidence=confidence,
            score=round(score, 2),
            reasons=reasons
        )
    
    def _evaluate_complaint_severity(self, case: CaseData) -> tuple[float, DecisionReason]:
        """Evaluate complaint type severity."""
        severity_map = {
            ComplaintType.NEVER_ARRIVED: 35,
            ComplaintType.DAMAGED_FOOD: 25,
            ComplaintType.WRONG_ORDER: 20,
            ComplaintType.MISSING_ITEMS: 18,
            ComplaintType.QUALITY_ISSUE: 15,
            ComplaintType.LATE_DELIVERY: 10,
        }
        
        score = severity_map.get(case.complaint_type, 10)
        
        explanations = {
            ComplaintType.NEVER_ARRIVED: "Order never arrived - critical issue",
            ComplaintType.DAMAGED_FOOD: "Food damaged - health and safety concern",
            ComplaintType.WRONG_ORDER: "Wrong order delivered - clear mistake",
            ComplaintType.MISSING_ITEMS: "Items missing from order",
            ComplaintType.QUALITY_ISSUE: "Quality concern reported",
            ComplaintType.LATE_DELIVERY: "Delivery was late",
        }
        
        return score, DecisionReason(
            factor="Complaint Severity",
            explanation=explanations.get(case.complaint_type, "Unknown complaint"),
            impact=score
        )
    
    def _evaluate_delivery_delay(self, case: CaseData) -> tuple[float, DecisionReason]:
        """Evaluate delivery delay impact."""
        delay = case.delivery_delay_min
        
        if delay >= 60:
            score = 20
            explanation = f"Severe delay ({delay} min) - highly unacceptable"
        elif delay >= 30:
            score = 12
            explanation = f"Significant delay ({delay} min) - customer inconvenienced"
        elif delay >= 15:
            score = 5
            explanation = f"Moderate delay ({delay} min) - minor inconvenience"
        else:
            score = 0
            explanation = f"Minimal delay ({delay} min) - within acceptable range"
        
        return score, DecisionReason(
            factor="Delivery Delay",
            explanation=explanation,
            impact=score
        )
    
    def _evaluate_restaurant_error_rate(self, case: CaseData) -> tuple[float, DecisionReason]:
        """Evaluate restaurant's error rate."""
        rate = case.restaurant_error_rate
        
        if rate >= 0.3:
            score = 15
            explanation = f"High restaurant error rate ({rate:.0%}) - pattern of issues"
        elif rate >= 0.15:
            score = 8
            explanation = f"Moderate restaurant error rate ({rate:.0%})"
        elif rate >= 0.05:
            score = 3
            explanation = f"Low restaurant error rate ({rate:.0%})"
        else:
            score = 0
            explanation = f"Excellent restaurant record ({rate:.0%})"
        
        return score, DecisionReason(
            factor="Restaurant Reliability",
            explanation=explanation,
            impact=score
        )
    
    def _evaluate_customer_history(self, case: CaseData) -> tuple[float, DecisionReason]:
        """Evaluate customer's refund history."""
        rate = case.customer_refund_rate
        
        if rate >= 0.4:
            score = -15
            explanation = f"High customer refund rate ({rate:.0%}) - possible abuse pattern"
        elif rate >= 0.2:
            score = -8
            explanation = f"Elevated customer refund rate ({rate:.0%}) - requires scrutiny"
        elif rate >= 0.1:
            score = -3
            explanation = f"Moderate customer refund rate ({rate:.0%})"
        else:
            score = 5
            explanation = f"Excellent customer history ({rate:.0%}) - trustworthy"
        
        return score, DecisionReason(
            factor="Customer History",
            explanation=explanation,
            impact=score
        )
    
    def _evaluate_evidence(self, case: CaseData) -> tuple[float, DecisionReason]:
        """Evaluate quality of evidence provided."""
        if case.photo_provided:
            score = 10
            explanation = "Photo evidence provided - claim substantiated"
        else:
            score = -5
            explanation = "No photo evidence - claim unverified"
        
        return score, DecisionReason(
            factor="Evidence Quality",
            explanation=explanation,
            impact=score
        )
    
    def _evaluate_order_value(self, case: CaseData) -> tuple[float, DecisionReason]:
        """Evaluate order value impact."""
        value = case.order_value
        
        if value >= 100:
            score = 10
            explanation = f"High-value order (${value:.2f}) - important customer"
        elif value >= 50:
            score = 5
            explanation = f"Medium-value order (${value:.2f})"
        elif value >= 20:
            score = 2
            explanation = f"Standard order value (${value:.2f})"
        else:
            score = 0
            explanation = f"Low-value order (${value:.2f})"
        
        return score, DecisionReason(
            factor="Order Value",
            explanation=explanation,
            impact=score
        )
    
    def _evaluate_text_features(self, features: dict) -> tuple[float, List[DecisionReason]]:
        """
        Evaluate text intelligence features extracted by LLM.
        
        Args:
            features: Dictionary of text features from NLP extraction
            
        Returns:
            Tuple of (total_score, list_of_reasons)
        """
        reasons = []
        total_score = 0.0
        
        # Temperature problem - increases validity
        if features.get("temperature_problem", False):
            score = 8
            total_score += score
            reasons.append(DecisionReason(
                factor="TEXT_SIGNAL_Temperature",
                explanation="Complaint mentions temperature issues - food quality concern",
                impact=score
            ))
        
        # Missing or wrong item - strong validity
        if features.get("missing_item", False) or features.get("wrong_item", False):
            score = 12
            total_score += score
            item_type = "missing" if features.get("missing_item") else "wrong"
            reasons.append(DecisionReason(
                factor="TEXT_SIGNAL_ItemIssue",
                explanation=f"Complaint clearly describes {item_type} item - strong validity",
                impact=score
            ))
        
        # Delivery spill - courier fault
        if features.get("delivery_spill", False):
            score = 10
            total_score += score
            reasons.append(DecisionReason(
                factor="TEXT_SIGNAL_DeliverySpill",
                explanation="Delivery spill mentioned - courier fault, not restaurant",
                impact=score
            ))
        
        # Food quality issue
        if features.get("food_quality_issue", False):
            score = 7
            total_score += score
            reasons.append(DecisionReason(
                factor="TEXT_SIGNAL_FoodQuality",
                explanation="Food quality issue described in complaint",
                impact=score
            ))
        
        # Packaging problem
        if features.get("packaging_problem", False):
            score = 6
            total_score += score
            reasons.append(DecisionReason(
                factor="TEXT_SIGNAL_Packaging",
                explanation="Packaging problem mentioned - preparation issue",
                impact=score
            ))
        
        # Vague complaint - decreases validity
        if features.get("vague_complaint", False):
            score = -8
            total_score += score
            reasons.append(DecisionReason(
                factor="TEXT_SIGNAL_VagueComplaint",
                explanation="Complaint is vague or lacks specifics - reduces credibility",
                impact=score
            ))
        
        # High customer aggression - slightly decrease
        aggression = features.get("customer_aggression", 0.0)
        if aggression > 0.7:
            score = -5
            total_score += score
            reasons.append(DecisionReason(
                factor="TEXT_SIGNAL_Aggression",
                explanation=f"High aggression level ({aggression:.1%}) - may indicate unreasonable expectations",
                impact=score
            ))
        
        # High evidence strength - increase validity
        evidence_strength = features.get("evidence_strength", 0.0)
        if evidence_strength > 0.6:
            score = 8
            total_score += score
            reasons.append(DecisionReason(
                factor="TEXT_SIGNAL_EvidenceStrength",
                explanation=f"Strong evidence in complaint text ({evidence_strength:.1%}) - detailed description",
                impact=score
            ))
        
        return total_score, reasons
    
    def _score_to_action(self, score: float, case: CaseData) -> tuple[RefundAction, float]:
        """
        Convert score to action and confidence.
        
        Args:
            score: Computed score
            case: Case data for context
            
        Returns:
            Tuple of (action, confidence)
        """
        # Normalize score to 0-100 range for confidence calculation
        # Maximum possible score is around 115, minimum around -25
        normalized_score = max(0, min(100, (score + 25) / 1.4))
        
        if score >= self.REFUND_THRESHOLD:
            # Full refund
            confidence = min(0.95, normalized_score / 100)
            return RefundAction.REFUND, confidence
        
        elif score >= self.MANUAL_REVIEW_THRESHOLD_HIGH:
            # Borderline high - needs manual review
            confidence = 0.6
            return RefundAction.MANUAL_REVIEW, confidence
        
        elif score >= self.PARTIAL_THRESHOLD:
            # Partial refund
            confidence = min(0.85, normalized_score / 100)
            return RefundAction.PARTIAL, confidence
        
        elif score >= self.MANUAL_REVIEW_THRESHOLD_LOW:
            # Borderline low - needs manual review
            confidence = 0.6
            return RefundAction.MANUAL_REVIEW, confidence
        
        else:
            # Reject
            confidence = min(0.90, (100 - normalized_score) / 100)
            return RefundAction.REJECT, confidence

