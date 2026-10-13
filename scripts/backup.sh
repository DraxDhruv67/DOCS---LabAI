#!/usr/bin/env bash

# ==============================================================================
# LabOS - Automated Production Database & Uploads Backup Utility
# ==============================================================================

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

echo "[Backup] Starting LabOS backup for $TIMESTAMP..."

# 1. Backup PostgreSQL Database
docker compose exec -T labos-postgres pg_dump -U labos labos > "$BACKUP_DIR/labos_db_$TIMESTAMP.sql"
gzip "$BACKUP_DIR/labos_db_$TIMESTAMP.sql"
echo "[Backup] Database dumped and compressed to $BACKUP_DIR/labos_db_$TIMESTAMP.sql.gz"

# 2. Backup Uploaded Files
if [ -d "storage/uploads" ]; then
    tar -czf "$BACKUP_DIR/labos_uploads_$TIMESTAMP.tar.gz" storage/uploads
    echo "[Backup] Uploads compressed to $BACKUP_DIR/labos_uploads_$TIMESTAMP.tar.gz"
fi

# 3. Clean up backups older than 14 days
find "$BACKUP_DIR" -type f -mtime +14 -delete
echo "[Backup] Completed successfully. Retention policy: 14 days."
