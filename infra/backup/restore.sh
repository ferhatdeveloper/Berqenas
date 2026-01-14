#!/bin/bash
# Berqenas Restore Script
# Restore tenant data from Backblaze B2 or S3 backup

set -e

# Configuration
TENANT_NAME=$1
BACKUP_TIMESTAMP=$2
RESTORE_MODE=${3:-"clone"}  # clone or overwrite
SOURCE=${4:-"b2"}  # b2 or s3

# Database connection
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"berqenas"}
DB_USER=${DB_USER:-"postgres"}

# Paths
RESTORE_DIR="/var/berqenas/restores"
SCHEMA_NAME="tenant_${TENANT_NAME}"

# B2/S3 Configuration
B2_BUCKET=${B2_BUCKET:-"berqenas-backups"}
B2_PREFIX="tenants/${TENANT_NAME}"
S3_BUCKET=${S3_BUCKET:-"berqenas-backups"}
S3_PREFIX="tenants/${TENANT_NAME}"

# Validate inputs
if [ -z "$TENANT_NAME" ] || [ -z "$BACKUP_TIMESTAMP" ]; then
    echo "Usage: $0 <tenant_name> <backup_timestamp> [clone|overwrite] [b2|s3]"
    echo "Example: $0 acme 20260114_143000 clone b2"
    echo ""
    echo "Available backups:"
    if [ "$SOURCE" == "b2" ]; then
        b2 ls "$B2_BUCKET" "$B2_PREFIX/" | grep ".sql.gz"
    else
        aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | grep ".sql.gz"
    fi
    exit 1
fi

echo "🔄 Starting restore for tenant: $TENANT_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Timestamp: $BACKUP_TIMESTAMP"
echo "Mode: $RESTORE_MODE"
echo "Source: $SOURCE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create restore directory
mkdir -p "$RESTORE_DIR/$TENANT_NAME"

# Download backup file
BACKUP_FILE="${TENANT_NAME}_${BACKUP_TIMESTAMP}.sql.gz"
LOCAL_FILE="$RESTORE_DIR/$TENANT_NAME/$BACKUP_FILE"

if [ "$SOURCE" == "b2" ]; then
    echo "📥 Downloading from Backblaze B2..."
    b2 download-file-by-name \
        "$B2_BUCKET" \
        "${B2_PREFIX}/${BACKUP_FILE}" \
        "$LOCAL_FILE"
elif [ "$SOURCE" == "s3" ]; then
    echo "📥 Downloading from AWS S3..."
    aws s3 cp \
        "s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_FILE}" \
        "$LOCAL_FILE"
else
    echo "❌ Invalid source: $SOURCE"
    exit 1
fi

# Decompress
echo "🗜️  Decompressing backup..."
gunzip -c "$LOCAL_FILE" > "${LOCAL_FILE%.gz}"
SQL_FILE="${LOCAL_FILE%.gz}"

# Restore based on mode
if [ "$RESTORE_MODE" == "overwrite" ]; then
    echo "⚠️  OVERWRITE MODE: Dropping existing schema..."
    read -p "Are you sure you want to OVERWRITE tenant $TENANT_NAME? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo "❌ Restore cancelled"
        exit 1
    fi
    
    # Drop existing schema
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<SQL
DROP SCHEMA IF EXISTS $SCHEMA_NAME CASCADE;
SQL
    
    # Restore from backup
    echo "📦 Restoring schema..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < "$SQL_FILE"
    
    echo "✅ Schema restored (overwrite mode)"

elif [ "$RESTORE_MODE" == "clone" ]; then
    # Create clone with timestamp suffix
    CLONE_SCHEMA="${SCHEMA_NAME}_restore_${BACKUP_TIMESTAMP}"
    
    echo "📦 Creating clone schema: $CLONE_SCHEMA..."
    
    # Restore to clone schema
    sed "s/$SCHEMA_NAME/$CLONE_SCHEMA/g" "$SQL_FILE" | \
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"
    
    echo "✅ Schema cloned to: $CLONE_SCHEMA"
    echo ""
    echo "To switch to restored data:"
    echo "  1. Rename current: ALTER SCHEMA $SCHEMA_NAME RENAME TO ${SCHEMA_NAME}_old;"
    echo "  2. Rename clone: ALTER SCHEMA $CLONE_SCHEMA RENAME TO $SCHEMA_NAME;"
    echo "  3. Drop old: DROP SCHEMA ${SCHEMA_NAME}_old CASCADE;"
else
    echo "❌ Invalid restore mode: $RESTORE_MODE"
    exit 1
fi

# Log restore operation
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<SQL
INSERT INTO public.restore_log (
  tenant,
  backup_file,
  restore_mode,
  source,
  status
) VALUES (
  '$TENANT_NAME',
  '$BACKUP_FILE',
  '$RESTORE_MODE',
  '$SOURCE',
  'completed'
);
SQL

# Cleanup
echo "🧹 Cleaning up temporary files..."
rm -f "$SQL_FILE" "$LOCAL_FILE"

echo ""
echo "✅ Restore completed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Tenant: $TENANT_NAME"
echo "Backup: $BACKUP_FILE"
echo "Mode: $RESTORE_MODE"
if [ "$RESTORE_MODE" == "clone" ]; then
    echo "Clone Schema: $CLONE_SCHEMA"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
