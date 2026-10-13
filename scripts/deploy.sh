#!/usr/bin/env bash

# ==============================================================================
# LabOS - Automated Production VPS Deployment Script
# Tested on Ubuntu 20.04 / 22.04 / 24.04 LTS
# ==============================================================================

set -e

echo "======================================================================"
echo " Starting LabOS Production Deployment"
echo "======================================================================"

# 1. Check & Install Docker / Docker Compose if missing
if ! command -v docker &> /dev/null; then
    echo "[1/6] Docker not found. Installing Docker Engine..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
else
    echo "[1/6] Docker is already installed."
fi

# 2. Pre-pull Execution Sandbox Images
echo "[2/6] Pre-pulling execution sandbox container images..."
docker pull python:3.10-slim
docker pull gcc:latest
docker pull node:18-alpine

# 3. Ensure Environment File Exists
if [ ! -f .env ]; then
    echo "[3/6] No .env found. Creating from .env.example..."
    cp .env.example .env
    # Generate random JWT Secret
    RANDOM_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "labos_secret_jwt_$(date +%s)")
    sed -i "s|generate-a-strong-secret-key-for-production-jwt-auth|$RANDOM_SECRET|g" .env
fi

# 4. Switch Prisma to PostgreSQL
echo "[4/6] Ensuring Prisma schema is configured for PostgreSQL..."
node scripts/switch-db.js postgresql || true

# 5. Build and Launch Containers
echo "[5/6] Building and starting LabOS production containers..."
docker compose down || true
docker compose up -d --build

# Wait for PostgreSQL to become fully healthy
echo "Waiting for PostgreSQL database to initialize..."
sleep 8

# 6. Push Database Schema & Seed Data
echo "[6/6] Running Prisma database migration inside container..."
docker compose exec -T labos-app npx prisma db push

# If backup exists, restore data, otherwise run default seed
if [ -f prisma/data-backup.json ]; then
    echo "Restoring existing academic data from backup..."
    docker compose exec -T labos-app npm run db:import || true
else
    echo "Seeding initial default structure..."
    docker compose exec -T labos-app npm run db:seed || true
fi

echo "======================================================================"
echo "  LabOS is Successfully Deployed and Running!"
echo "  Access the platform at: http://<your-server-ip>:3000"
echo "======================================================================"
