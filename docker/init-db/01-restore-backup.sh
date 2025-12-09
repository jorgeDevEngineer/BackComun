#!/bin/bash
# ============================================
# Script de restauración de backup PostgreSQL
# ============================================
# Este script se ejecuta automáticamente cuando se crea
# el contenedor de PostgreSQL por primera vez.
#
# INSTRUCCIONES:
# 1. Coloca tu archivo de backup en esta carpeta (docker/init-db/)
# 2. Renómbralo a "backup.sql" o "backup.dump"
# 3. El script detectará automáticamente el formato y lo restaurará
# ============================================

set -e

BACKUP_SQL="/docker-entrypoint-initdb.d/backup.sql"
BACKUP_DUMP="/docker-entrypoint-initdb.d/backup.dump"

echo "=== Iniciando proceso de restauración de backup ==="

# Verificar si existe backup en formato SQL plano
if [ -f "$BACKUP_SQL" ]; then
    echo "Detectado backup SQL plano: $BACKUP_SQL"
    echo "Restaurando base de datos desde backup SQL..."
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$BACKUP_SQL"
    echo "✅ Restauración de backup SQL completada exitosamente"

# Verificar si existe backup en formato custom (pg_dump -Fc)
elif [ -f "$BACKUP_DUMP" ]; then
    echo "Detectado backup en formato custom: $BACKUP_DUMP"
    echo "Restaurando base de datos desde backup dump..."
    pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges "$BACKUP_DUMP" || true
    echo "✅ Restauración de backup dump completada"

else
    echo "⚠️  No se encontró archivo de backup"
    echo "    Para restaurar un backup, coloca uno de estos archivos:"
    echo "    - docker/init-db/backup.sql (formato SQL plano)"
    echo "    - docker/init-db/backup.dump (formato custom de pg_dump)"
    echo "    La base de datos se iniciará vacía"
fi

echo "=== Proceso de inicialización finalizado ==="

