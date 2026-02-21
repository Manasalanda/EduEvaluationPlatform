"""
Train and save ML models for plagiarism detection and scoring.
Run once before starting the Flask server.
"""
import os
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Sample corpus for initial TF-IDF fit
sample_texts = [
    "Machine learning is a subset of artificial intelligence that focuses on algorithms.",
    "Neural networks are inspired by the biological neural networks in the human brain.",
    "Deep learning uses multiple layers of neural networks to learn representations.",
    "Supervised learning requires labeled training data to build predictive models.",
    "Unsupervised learning finds hidden patterns in data without labeled examples.",
    "Reinforcement learning trains agents through reward and punishment mechanisms.",
    "Natural language processing enables computers to understand human language.",
    "Computer vision allows machines to interpret and understand visual information.",
    "Big data refers to extremely large datasets that require special processing.",
    "Cloud computing provides on-demand access to computing resources over the internet.",
]

print("Training TF-IDF vectorizer...")
vectorizer = TfidfVectorizer(
    max_features=10000,
    ngram_range=(1, 2),
    stop_words='english',
    min_df=1
)
vectorizer.fit(sample_texts)

# Save models
os.makedirs('saved_models', exist_ok=True)
joblib.dump(vectorizer, 'saved_models/tfidf_vectorizer.pkl')
print("✅ TF-IDF vectorizer saved to saved_models/tfidf_vectorizer.pkl")
print("✅ Training complete!")