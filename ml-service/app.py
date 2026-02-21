import os
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from utils.plagiarism import calculate_plagiarism_risk
from utils.feedback import generate_feedback

load_dotenv()

app = Flask(__name__)
CORS(app)

# Load ML models
MODEL_PATH = 'saved_models/tfidf_vectorizer.pkl'

try:
    vectorizer = joblib.load(MODEL_PATH)
    print(f"✅ TF-IDF vectorizer loaded from {MODEL_PATH}")
except FileNotFoundError:
    print("⚠ Model not found. Running train.py first...")
    import subprocess
    subprocess.run(['python', 'train.py'])
    vectorizer = joblib.load(MODEL_PATH)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'ML Evaluation Service'})


@app.route('/evaluate', methods=['POST'])
def evaluate():
    """
    Main evaluation endpoint.
    
    Expected JSON body:
    {
        "submission_id": "string",
        "text": "submission text content",
        "corpus": ["other submission texts..."],
        "keywords": ["keyword1", "keyword2"],
        "max_score": 100
    }
    
    Returns:
    {
        "submission_id": "string",
        "plagiarism_risk": 22.5,
        "score": 68,
        "feedback_summary": "...",
        "details": {...}
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON body provided'}), 400

    submission_id = data.get('submission_id', 'unknown')
    text = data.get('text', '')
    corpus = data.get('corpus', [])
    keywords = data.get('keywords', [])
    max_score = data.get('max_score', 100)

    if not text:
        return jsonify({
            'submission_id': submission_id,
            'plagiarism_risk': 0,
            'score': 0,
            'feedback_summary': 'No text content provided for evaluation.',
            'details': {}
        })

    # Fit vectorizer on current corpus + submission for better accuracy
    all_texts = [text] + [c for c in corpus if c]
    if len(all_texts) > 1:
        try:
            vectorizer.fit(all_texts)
        except Exception:
            pass  # Use existing vectorizer if refitting fails

    # Run plagiarism check
    plagiarism_result = calculate_plagiarism_risk(text, corpus, vectorizer)

    # Run feedback generation
    feedback_result = generate_feedback(text, keywords, max_score)

    response = {
        'submission_id': submission_id,
        'plagiarism_risk': f"{plagiarism_result['plagiarism_risk']}%",
        'plagiarism_risk_numeric': plagiarism_result['plagiarism_risk'],
        'score': feedback_result['score'],
        'grade': feedback_result.get('grade', 'N/A'),
        'feedback_summary': feedback_result['feedback_summary'],
        'details': {
            'plagiarism': plagiarism_result,
            'feedback': feedback_result,
        }
    }

    return jsonify(response)


@app.route('/plagiarism-check', methods=['POST'])
def plagiarism_check_only():
    """Standalone plagiarism check endpoint."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON body'}), 400

    text = data.get('text', '')
    corpus = data.get('corpus', [])

    result = calculate_plagiarism_risk(text, corpus, vectorizer)
    return jsonify(result)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    debug = os.environ.get('FLASK_ENV', 'production') == 'development'
    print(f"🚀 ML Service starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)