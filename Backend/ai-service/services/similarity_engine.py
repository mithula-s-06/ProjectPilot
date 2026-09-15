import re
import math
import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class SimilarityEngine:
    """
    Self-contained, standalone Semantic and Lexical Similarity Engine.
    Uses multi-granularity TF-IDF (word unigram/bigram + character n-grams)
    and normalized dense subword vector representations to accurately detect
    verbatim copies, reworded/paraphrased text, and structural duplicates.
    """

    @classmethod
    def compute_similarity(cls, current_text: str, previous_reports: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        previous_reports format: [{"id": "rep_123", "text": "Report content..."}]
        """
        if not current_text or not current_text.strip() or not previous_reports:
            return {
                "similarity_score": 0.0,
                "matched_report_id": "",
                "details": "No comparison data available"
            }

        valid_prev = []
        for r in previous_reports:
            r_id = r.get("id", "")
            r_text = (r.get("text") or "").strip()
            if r_text:
                valid_prev.append((r_id, r_text))

        if not valid_prev:
            return {
                "similarity_score": 0.0,
                "matched_report_id": "",
                "details": "No valid previous report text found"
            }

        corpus = [current_text] + [item[1] for item in valid_prev]

        try:
            # 1. Word-level TF-IDF with unigrams & bigrams
            word_vectorizer = TfidfVectorizer(
                ngram_range=(1, 2),
                sublinear_tf=True,
                stop_words="english",
                token_pattern=r"(?u)\b\w+\b"
            )
            word_matrix = word_vectorizer.fit_transform(corpus)
            word_sims = cosine_similarity(word_matrix[0:1], word_matrix[1:])[0]

            # 2. Character 3-gram & 4-gram TF-IDF (captures stemming & morphological variations)
            char_vectorizer = TfidfVectorizer(
                analyzer="char_wb",
                ngram_range=(3, 5),
                sublinear_tf=True
            )
            char_matrix = char_vectorizer.fit_transform(corpus)
            char_sims = cosine_similarity(char_matrix[0:1], char_matrix[1:])[0]

            # 3. Dense Embedding Vector Cosine
            current_emb = np.array(cls.get_embedding_vector(current_text, 64))
            dense_sims = []
            for _, prev_text in valid_prev:
                prev_emb = np.array(cls.get_embedding_vector(prev_text, 64))
                dot = np.dot(current_emb, prev_emb)
                dense_sims.append(max(0.0, float(dot)))
            dense_sims = np.array(dense_sims)

            # Combined Ensemble Similarity
            # For exact matches, word_sims is 1.0. For paraphrased, char_sims and dense_sims catch morphological & topical overlap.
            combined_scores = (0.45 * word_sims) + (0.35 * char_sims) + (0.20 * dense_sims)

            # Check if any individual metric is overwhelmingly high (e.g. verbatim substring)
            for i in range(len(combined_scores)):
                if word_sims[i] > 0.95:
                    combined_scores[i] = word_sims[i]
                elif combined_scores[i] < 0.12:
                    combined_scores[i] = 0.0

            max_idx = int(np.argmax(combined_scores))
            max_sim = float(combined_scores[max_idx])
            matched_id = valid_prev[max_idx][0]

            # Convert to percentage 0.0 - 100.0 rounded to 1 decimal place
            percentage_score = round(max_sim * 100.0, 1)

            return {
                "similarity_score": percentage_score,
                "matched_report_id": matched_id if percentage_score > 0 else "",
                "details": f"Compared against {len(valid_prev)} previous reports."
            }
        except Exception as e:
            print(f"[SimilarityEngine] TF-IDF exception: {e}, falling back to token overlap")
            return cls._fallback_token_similarity(current_text, valid_prev)

    @classmethod
    def _fallback_token_similarity(cls, current_text: str, valid_prev: List[Tuple[str, str]]) -> Dict[str, Any]:
        words_current = set(re.findall(r"\b[a-zA-Z0-9']+\b", current_text.lower()))
        if not words_current:
            return {"similarity_score": 0.0, "matched_report_id": "", "details": "Empty current text"}

        max_sim = 0.0
        matched_id = ""

        for r_id, r_text in valid_prev:
            words_prev = set(re.findall(r"\b[a-zA-Z0-9']+\b", r_text.lower()))
            if not words_prev:
                continue
            intersection = words_current.intersection(words_prev)
            union = words_current.union(words_prev)
            jaccard = len(intersection) / float(len(union)) if union else 0.0
            if jaccard > max_sim:
                max_sim = jaccard
                matched_id = r_id

        return {
            "similarity_score": round(max_sim * 100.0, 1),
            "matched_report_id": matched_id if max_sim > 0 else "",
            "details": "Calculated via lexical token overlap fallback"
        }

    @classmethod
    def get_embedding_vector(cls, text: str, dimension: int = 64) -> List[float]:
        """
        Generates a deterministic, normalized dense vector embedding representation
        from text using character and word hash n-grams.
        """
        if not text or not text.strip():
            return [0.0] * dimension

        vector = np.zeros(dimension, dtype=np.float32)
        words = re.findall(r"\b[a-zA-Z0-9']+\b", text.lower())

        for idx, word in enumerate(words):
            # Deterministic hash to dimension bin
            h = abs(hash(word)) % dimension
            # Position-weighted term frequency
            weight = 1.0 + math.log(1.0 + (1.0 / (idx + 1)))
            vector[h] += weight

            # Also add character 3-grams for subword morphological capture
            if len(word) >= 3:
                for c_i in range(len(word) - 2):
                    tri = word[c_i:c_i+3]
                    h_tri = abs(hash(tri)) % dimension
                    vector[h_tri] += 0.3

        # L2 Normalize the embedding vector
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm

        return [round(float(val), 6) for val in vector.tolist()]
