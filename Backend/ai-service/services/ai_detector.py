import re
import math
from typing import Dict, Any, List

class AIDetector:
    """
    Self-contained, statistical and linguistic AI content detector.
    Analyzes text burstiness, perplexity heuristics, lexical diversity,
    discourse marker density, and repetitive syntactic structures.
    """

    LLM_MARKER_PATTERNS = [
        # Common LLM words/phrases
        r"\bdelve\b", r"\btestament\b", r"\bpivotal\b", r"\bfurthermore\b", r"\bmoreover\b",
        r"\bin conclusion\b", r"\bit is important to note\b", r"\bdemystify\b", r"\bbeacon\b",
        r"\bmulti-faceted\b", r"\bholistic\b", r"\btapestry\b", r"\bunderscores\b",
        r"\bin summary\b", r"\bfostering\b", r"\bseamlessly\b", r"\bharnessing\b",
        r"\bcrucial aspect\b", r"\bin today's world\b", r"\bdynamic landscape\b",
        r"\bembark\b", r"\brealm\b", r"\bparamount\b", r"\bleverage\b", r"\bplethora\b",
        r"\bintegral role\b", r"\bspearheaded\b", r"\bpoised to\b", r"\bgame-changer\b",
        r"\bnot only\b.*?\bbut also\b", r"\bdelving into\b", r"\bit is worth noting\b",
        r"\bsignificant milestone\b", r"\bplays a crucial role\b", r"\bnavigating the complexities\b"
    ]

    AI_CONFESSION_PATTERNS = [
        r"as an ai (language )?model",
        r"as of my (last )?knowledge cutoff",
        r"i hope this (report|summary|helps)",
        r"certainly,? here is",
        r"let me know if you need (any )?(more|additional|further) details",
        r"based on the provided instructions",
        r"i am programmed to"
    ]

    @classmethod
    def detect(cls, text: str) -> Dict[str, Any]:
        if not text or not text.strip():
            return {
                "score": 0.0,
                "classification": "HUMAN",
                "burstiness": 0.0,
                "lexical_diversity": 0.0,
                "marker_count": 0,
                "matched_markers": [],
                "details": "Empty text provided"
            }

        text_lower = text.lower().strip()
        words = re.findall(r"\b[a-zA-Z0-9']+\b", text_lower)
        total_words = len(words)

        if total_words < 5:
            return {
                "score": 5.0,
                "classification": "HUMAN",
                "burstiness": 0.0,
                "lexical_diversity": 1.0,
                "marker_count": 0,
                "matched_markers": [],
                "details": "Text too short for conclusive analysis"
            }

        # 1. Direct AI confession / boilerplate checks
        for pattern in cls.AI_CONFESSION_PATTERNS:
            if re.search(pattern, text_lower):
                return {
                    "score": 98.5,
                    "classification": "AI_GENERATED",
                    "burstiness": 0.0,
                    "lexical_diversity": 0.5,
                    "marker_count": 10,
                    "matched_markers": [pattern],
                    "details": "Direct AI assistant signature / confession detected"
                }

        # 2. Transition Marker and Vocabulary Density
        matched_markers = []
        for pattern in cls.LLM_MARKER_PATTERNS:
            matches = re.findall(pattern, text_lower)
            if matches:
                matched_markers.extend(matches)

        marker_count = len(matched_markers)
        marker_density = (marker_count / max(total_words / 100.0, 1.0))
        # Marker score component: 0 to 45
        marker_score = min(marker_density * 18.0, 45.0)

        # 3. Burstiness / Sentence Length Variance Heuristic
        # LLMs generate uniform sentence lengths; humans generate bursty variations.
        sentences = [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]
        sentence_lengths = [len(re.findall(r"\b[a-zA-Z0-9']+\b", s)) for s in sentences if len(s.split()) > 0]

        burstiness_score = 0.0
        sentence_variance = 0.0
        if len(sentence_lengths) >= 2:
            mean_len = sum(sentence_lengths) / len(sentence_lengths)
            sentence_variance = sum((l - mean_len) ** 2 for l in sentence_lengths) / len(sentence_lengths)
            std_dev = math.sqrt(sentence_variance)
            # Low std_dev -> High uniformity (AI-like); High std_dev -> High burstiness (Human-like)
            if std_dev < 4.0:
                burstiness_score = max(0.0, 35.0 - (std_dev * 5.0))
            elif std_dev > 10.0:
                burstiness_score = -15.0 # Strong human indicator
            else:
                burstiness_score = 10.0

        # 4. Lexical Diversity (Type-Token Ratio)
        unique_words = len(set(words))
        ttr = unique_words / total_words
        # Normal human writing in short reports has moderate to high TTR
        # LLM text often maintains an artificially smooth, moderate-low lexical diversity for technical texts
        ttr_score = 0.0
        if ttr < 0.45 and total_words > 40:
            ttr_score = 15.0
        elif ttr > 0.85:
            ttr_score = -5.0 # Diverse vocabulary

        # 5. Repetitive Structural Openings
        opening_words = [re.split(r"\s+", s)[0].lower() for s in sentences if len(s.split()) > 0]
        repetitive_openings = 0
        for ow in ["furthermore", "additionally", "moreover", "in", "the", "by", "overall"]:
            if opening_words.count(ow) >= 2:
                repetitive_openings += 1
        opening_score = min(repetitive_openings * 6.0, 15.0)

        # Calculate Combined Base Score (0 to 100)
        base_score = 15.0 + marker_score + burstiness_score + ttr_score + opening_score

        # Clamp between 2.0 and 99.0
        final_score = max(2.0, min(99.0, base_score))
        final_score = round(final_score, 1)

        classification = "HUMAN"
        if final_score >= 60.0:
            classification = "AI_GENERATED"
        elif final_score >= 40.0:
            classification = "SUSPICIOUS"

        return {
            "score": final_score,
            "classification": classification,
            "burstiness_variance": round(sentence_variance, 2),
            "lexical_diversity_ttr": round(ttr, 3),
            "marker_count": marker_count,
            "matched_markers": list(set(matched_markers)),
            "details": f"Analyzed {total_words} words across {len(sentences)} sentences."
        }
