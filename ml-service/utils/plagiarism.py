import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


def calculate_plagiarism_risk(text: str, corpus: list, vectorizer) -> dict:
    """
    Calculate plagiarism risk using TF-IDF cosine similarity.
    
    Args:
        text: The submission text to check
        corpus: List of existing submission texts
        vectorizer: Fitted TF-IDF vectorizer
    
    Returns:
        dict with plagiarism_risk (0-100) and details
    """
    if not text or not text.strip():
        return {"plagiarism_risk": 0, "max_similarity": 0, "details": {}}

    if not corpus:
        return {
            "plagiarism_risk": 0,
            "max_similarity": 0,
            "details": {"note": "No other submissions to compare"}
        }

    # Filter empty corpus entries
    corpus = [c for c in corpus if c and c.strip()]
    if not corpus:
        return {"plagiarism_risk": 0, "max_similarity": 0, "details": {}}

    try:
        all_texts = [text] + corpus
        tfidf_matrix = vectorizer.transform(all_texts)
        
        # Calculate cosine similarity between submission and all corpus texts
        submission_vector = tfidf_matrix[0:1]
        corpus_matrix = tfidf_matrix[1:]
        
        similarities = cosine_similarity(submission_vector, corpus_matrix)[0]
        
        max_similarity = float(np.max(similarities)) if len(similarities) > 0 else 0
        avg_similarity = float(np.mean(similarities)) if len(similarities) > 0 else 0
        
        # Convert to risk percentage
        # High similarity = high risk
        plagiarism_risk = round(max_similarity * 100, 2)
        
        return {
            "plagiarism_risk": plagiarism_risk,
            "max_similarity": round(max_similarity, 4),
            "avg_similarity": round(avg_similarity, 4),
            "compared_against": len(corpus),
            "details": {
                "interpretation": (
                    "Low risk" if plagiarism_risk < 20 else
                    "Moderate risk" if plagiarism_risk < 50 else
                    "High risk - manual review recommended"
                )
            }
        }
    except Exception as e:
        return {
            "plagiarism_risk": 0,
            "max_similarity": 0,
            "details": {"error": str(e)}
        }