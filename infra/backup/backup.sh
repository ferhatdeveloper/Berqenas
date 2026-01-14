#!/bin/bash
# Berqenas Backup Script
# Automated PostgreSQL backup to Backblaze B2 or S3

set -e

# Configuration
TENANT_NAME=$1
BACKUP_DESTINATION=${2:-"b2"}  # b2 or s3
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/berqenas/backups"
SCHEMA_NAME="tenant_${TENANT_NAME}"

# Database connection
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"berqenas"}
DB_USER=${DB_USER:-"postgres"}

# B2 Configuration
B2_BUCKET=${B2_BUCKET:-"berqenas-backups"}
B2_PREFIX="tenants/${TENANT_NAME}"

# S3 Configuration
S3_BUCKET=${S3_BUCKET:-"berqenas-backups"}
S3_PREFIX="tenants/${TENANT_NAME}"

# Validate inputs
if [ -z "$TENANT_NAME" ]; then
    echo "Usage: $0 <tenant_name> [b2|s3]"
    echo "Example: $0 acme b2"
    exit 1
fi

echo "🔄 Starting backup for tenant: $TENANT_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create backup directory
mkdir -p "$BACKUP_DIR/$TENANT_NAME"

# Backup filename
BACKUP_FILE="$BACKUP_DIR/$TENANT_NAME/${TENANT_NAME}_${TIMESTAMP}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

# Dump schema
echo "📦 Dumping schema: $SCHEMA_NAME..."
pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -n "$SCHEMA_NAME" \
    --clean \
    --if-exists \
    --create \
    -F p \
    -f "$BACKUP_FILE"

# Compress backup
echo "🗜️  Compressing backup..."
gzip "$BACKUP_FILE"

# Get file size
BACKUP_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
echo "📊 Backup size: $BACKUP_SIZE"

# Upload to cloud storage
if [ "$BACKUP_DESTINATION" == "b2" ]; then
    echo "☁️  Uploading to Backblaze B2..."
    
    # Check if b2 CLI is installed
    if ! command -v b2 &> /dev/null; then
        echo "❌ b2 CLI not found. Install: pip install b2"
        exit 1
    fi
    
    # Upload to B2
    b2 upload-file \
        "$B2_BUCKET" \
        "$COMPRESSED_FILE" \
        "${B2_PREFIX}/${TENANT_NAME}_${TIMESTAMP}.sql.gz"
    
    echo "✅ Uploaded to B2: b2://${B2_BUCKET}/${B2_PREFIX}/${TENANT_NAME}_${TIMESTAMP}.sql.gz"

elif [ "$BACKUP_DESTINATION" == "s3" ]; then
    echo "☁️  Uploading to AWS S3..."
    
    # Check if aws CLI is installed
    if ! command -v aws &> /dev/null; then
        echo "❌ aws CLI not found. Install: pip install awscli"
        exit 1
    fi
    
    # Upload to S3
    aws s3 cp \
        "$COMPRESSED_FILE" \
        "s3://${S3_BUCKET}/${S3_PREFIX}/${TENANT_NAME}_${TIMESTAMP}.sql.gz" \
        --storage-class STANDARD_IA
    
    echo "✅ Uploaded to S3: s3://${S3_BUCKET}/${S3_PREFIX}/${TENANT_NAME}_${TIMESTAMP}.sql.gz"
else
    echo "❌ Invalid backup destination: $BACKUP_DESTINATION (use 'b2' or 's3')"
    exit 1
fi

# Create metadata file
METADATA_FILE="$BACKUP_DIR/$TENANT_NAME/${TENANT_NAME}_${TIMESTAMP}.json"
cat > "$METADATA_FILE" <<EOF
{
  "tenant": "$TENANT_NAME",
  "schema": "$SCHEMA_NAME",
  "timestamp": "$TIMESTAMP",
  "backup_file": "${TENANT_NAME}_${TIMESTAMP}.sql.gz",
  "size": "$BACKUP_SIZE",
  "destination": "$BACKUP_DESTINATION",
  "db_host": "$DB_HOST",
  "db_port": "$DB_PORT",
  "db_name": "$DB_NAME"
}
EOF

# Upload metadata
if [ "$BACKUP_DESTINATION" == "b2" ]; then
    b2 upload-file "$B2_BUCKET" "$METADATA_FILE" "${B2_PREFIX}/${TENANT_NAME}_${TIMESTAMP}.json"
elif [ "$BACKUP_DESTINATION" == "s3" ]; then
    aws s3 cp "$METADATA_FILE" "s3://${S3_BUCKET}/${S3_PREFIX}/${TENANT_NAME}_${TIMESTAMP}.json"
fi

# Log to database
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<SQL
INSERT INTO public.backup_log (
  tenant,
  backup_file,
  backup_size,
  destination,
  status
) VALUES (
  '$TENANT_NAME',
  '${TENANT_NAME}_${TIMESTAMP}.sql.gz',
  '$BACKUP_SIZE',
  '$BACKUP_DESTINATION',
  'completed'
);
SQL

# Cleanup old local backups (keep last 7 days)
echo "🧹 Cleaning up old local backups..."
find "$BACKUP_DIR/$TENANT_NAME" -name "*.sql.gz" -mtime +7 -delete
find "$BACKUP_DIR/$TENANT_NAME" -name "*.json" -mtime +7 -delete

echo ""
echo "✅ Backup completed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Tenant: $TENANT_NAME"
echo "File: ${TENANT_NAME}_${TIMESTAMP}.sql.gz"
echo "Size: $BACKUP_SIZE"
echo "Destination: $BACKUP_DESTINATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
