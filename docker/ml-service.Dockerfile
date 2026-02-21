FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for caching)
COPY requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy all ml-service files
COPY . .

# Create saved_models folder
RUN mkdir -p saved_models

# Train the model
RUN python train.py

EXPOSE 8000

# ✅ CORRECT syntax - each word is separate
CMD ["python", "app.py"]