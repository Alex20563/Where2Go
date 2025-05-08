FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN mkdir -p /var/log/django

COPY backend/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY backend/ .
