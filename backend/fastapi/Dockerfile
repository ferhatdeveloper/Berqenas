# Build stage
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies (ODBC for MSSQL, libpq for Postgres)
RUN apt-get update && apt-get install -y \
    build-essential \
    libffi-dev \
    curl \
    gnupg2 \
    unixodbc-dev \
    libpq-dev \
    wireguard-tools \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Expose port
EXPOSE 8000

# Run with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
