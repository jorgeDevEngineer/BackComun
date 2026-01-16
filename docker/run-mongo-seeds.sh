#!/bin/bash
# ============================================
# Script para ejecutar seeds de MongoDB usando mongosh
# Estructura: docker/seed-data-mongo/{database}/{collection}.json
# ============================================

set -e

SEED_DIR="/seed-data-mongo"
MARKER_FILE="/seed-data-mongo/.seeded"
WAIT_TIME="${WAIT_TIME:-30}"

# Variables de conexión MongoDB
MONGO_HOST="${MONGO_HOST:-mongo-db}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_USER="${MONGO_USER:-admin}"
MONGO_PASSWORD="${MONGO_PASSWORD:-password123}"

echo "============================================"
echo "🍃 Iniciando proceso de seeding MongoDB..."
echo "============================================"

# Verificar si ya se ejecutó el seeding anteriormente
if [ -f "$MARKER_FILE" ]; then
    echo "✅ El seeding de MongoDB ya fue ejecutado anteriormente."
    echo "   Si deseas ejecutarlo de nuevo, elimina el archivo:"
    echo "   docker/seed-data-mongo/.seeded"
    exit 0
fi

# Verificar si hay carpetas (bases de datos) para procesar
DB_DIRS=$(find "$SEED_DIR" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort)

if [ -z "$DB_DIRS" ]; then
    echo "⚠️  No se encontraron carpetas de bases de datos en $SEED_DIR"
    echo "   Estructura esperada:"
    echo "   docker/seed-data-mongo/"
    echo "   ├── kahoot/           <- Base de datos"
    echo "   │   ├── quizzes.json  <- Colección"
    echo "   │   └── users.json"
    echo "   └── media/"
    echo "       └── files.json"
    exit 0
fi

echo "📁 Bases de datos encontradas:"
for db_dir in $DB_DIRS; do
    db_name=$(basename "$db_dir")
    json_count=$(find "$db_dir" -name "*.json" -type f 2>/dev/null | wc -l)
    echo "   - $db_name ($json_count colecciones)"
done
echo ""

# ============================================
# Esperar a que la aplicación esté lista
# ============================================
echo "⏳ Esperando ${WAIT_TIME} segundos para que la aplicación sincronice con MongoDB..."
sleep $WAIT_TIME
echo "✅ Tiempo de espera completado"
echo ""

# ============================================
# Ejecutar los seeds de MongoDB usando mongosh
# ============================================
echo "🚀 Ejecutando seeds de MongoDB..."
echo ""

# Contador de éxitos y errores
success_count=0
error_count=0

MONGO_URI="mongodb://$MONGO_USER:$MONGO_PASSWORD@$MONGO_HOST:$MONGO_PORT/?authSource=admin"

echo "MONGO_URI: $MONGO_URI"

for db_dir in $DB_DIRS; do
    db_name=$(basename "$db_dir")
    echo "📦 Procesando base de datos: $db_name"
    
    # Buscar archivos JSON en la carpeta de la base de datos
    JSON_FILES=$(find "$db_dir" -maxdepth 1 -name "*.json" -type f 2>/dev/null | sort)
    
    if [ -z "$JSON_FILES" ]; then
        echo "   ⚠️  No se encontraron archivos JSON en $db_dir"
        continue
    fi
    
    for json_file in $JSON_FILES; do
        filename=$(basename "$json_file")
        collection_name="${filename%.json}"  # Quitar extensión .json
        
        echo "   📄 Importando: $collection_name"
        
        # Usar mongosh para importar los datos
        if mongosh "$MONGO_URI" --quiet --norc --eval "
            use('$db_name');
            
            // Leer el archivo JSON
            const fs = require('fs');
            const data = JSON.parse(fs.readFileSync('$json_file', 'utf8'));
            
            if (!Array.isArray(data)) {
                print('ERROR: El archivo debe contener un array de documentos');
                quit(1);
            }
            
            // Eliminar la colección existente
            db.getCollection('$collection_name').drop();
            
            // Insertar los documentos
            if (data.length > 0) {
                const result = db.getCollection('$collection_name').insertMany(data);
                print('      Insertados: ' + result.insertedCount + ' documentos');
            } else {
                print('      Array vacío, colección creada sin documentos');
            }
        " 2>&1; then
            echo "      ✅ $collection_name importado correctamente"
            ((success_count++)) || true
        else
            echo "      ❌ Error importando $collection_name"
            ((error_count++)) || true
        fi
    done
    echo ""
done

echo "============================================"
if [ $error_count -eq 0 ]; then
    echo "✅ Seeding de MongoDB completado exitosamente!"
    echo "   Colecciones importadas: $success_count"
else
    echo "⚠️  Seeding de MongoDB completado con errores"
    echo "   Exitosos: $success_count"
    echo "   Errores: $error_count"
fi
echo "============================================"

# Crear archivo marcador para evitar re-ejecución
echo "Seeding MongoDB ejecutado: $(date)" > "$MARKER_FILE"
echo "📝 Archivo marcador creado: .seeded"
