

def generate_feedback(text: str, keywords: list, max_score: int = 100) -> dict:
    """
    Generate automated feedback and score for a submission.
    """
    if not text or not text.strip():
        return {
            "score": 0,
            "feedback_summary": "No content submitted.",
            "breakdown": {}
        }

    # Count words, sentences, paragraphs
    words = text.split()
    word_count = len(words)
    sentences = [s.strip() for s in text.replace('!', '.').replace('?', '.').split('.') if s.strip()]
    sentence_count = len(sentences)
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    paragraph_count = len(paragraphs)

    scores = {}
    feedback_points = []

    # ── Length Score (25 points) ──────────────────
    if word_count >= 500:
        scores['length'] = 25
        feedback_points.append("✓ Excellent length and depth of coverage.")
    elif word_count >= 300:
        scores['length'] = 18
        feedback_points.append("Good length but could be expanded further.")
    elif word_count >= 150:
        scores['length'] = 10
        feedback_points.append("⚠ Response is short. Aim for at least 300 words.")
    else:
        scores['length'] = 4
        feedback_points.append("✗ Response is too brief. Add more detail.")

    # ── Structure Score (20 points) ───────────────
    structure_score = 0
    if paragraph_count >= 3:
        structure_score += 10
        feedback_points.append("✓ Good paragraph structure.")
    elif paragraph_count >= 2:
        structure_score += 6
        feedback_points.append("Consider using more paragraphs.")
    else:
        feedback_points.append("✗ Use multiple paragraphs for better structure.")

    avg_sentence_length = word_count / max(sentence_count, 1)
    if 10 <= avg_sentence_length <= 25:
        structure_score += 10
        feedback_points.append("✓ Good sentence length balance.")
    else:
        structure_score += 5
        feedback_points.append("Try to vary your sentence lengths.")

    scores['structure'] = structure_score

    # ── Keyword Score (35 points) ─────────────────
    if keywords:
        text_lower = text.lower()
        matched = [kw for kw in keywords if kw.lower() in text_lower]
        ratio = len(matched) / len(keywords)
        scores['keywords'] = round(ratio * 35)

        if ratio >= 0.8:
            feedback_points.append(f"✓ Excellent keyword coverage ({len(matched)}/{len(keywords)}).")
        elif ratio >= 0.5:
            missed = [kw for kw in keywords if kw.lower() not in text_lower]
            feedback_points.append(f"Good coverage. Also consider: {', '.join(missed[:3])}.")
        else:
            missed = [kw for kw in keywords if kw.lower() not in text_lower]
            feedback_points.append(f"⚠ Missing key topics: {', '.join(missed[:5])}.")
    else:
        scores['keywords'] = 20

    # ── Vocabulary Score (20 points) ──────────────
    unique_words = set(w.lower().strip('.,!?;:') for w in words)
    vocab_ratio = len(unique_words) / max(word_count, 1)

    if vocab_ratio >= 0.6:
        scores['vocabulary'] = 20
        feedback_points.append("✓ Excellent vocabulary diversity.")
    elif vocab_ratio >= 0.4:
        scores['vocabulary'] = 13
        feedback_points.append("Good vocabulary. Try more varied word choices.")
    else:
        scores['vocabulary'] = 7
        feedback_points.append("Response shows repetitive vocabulary.")

    # ── Final Score ───────────────────────────────
    raw_score = sum(scores.values())
    final_score = round((raw_score / 100) * max_score)
    final_score = max(0, min(final_score, max_score))

    # ── Grade ─────────────────────────────────────
    if final_score >= 80:
        grade = "Excellent"
        summary = f"Strong submission! {feedback_points[-1]}"
    elif final_score >= 65:
        grade = "Good"
        summary = f"Good effort. {feedback_points[-1]}"
    elif final_score >= 50:
        grade = "Satisfactory"
        summary = f"Satisfactory work. {feedback_points[-1]}"
    else:
        grade = "Needs Improvement"
        summary = f"Needs improvement. {feedback_points[-1]}"

    return {
        "score": final_score,
        "grade": grade,
        "feedback_summary": summary,
        "feedback_points": feedback_points,
        "breakdown": {
            "length_score": scores.get('length', 0),
            "structure_score": scores.get('structure', 0),
            "keyword_score": scores.get('keywords', 0),
            "vocabulary_score": scores.get('vocabulary', 0),
            "word_count": word_count,
            "sentence_count": sentence_count,
            "paragraph_count": paragraph_count
        }
    }