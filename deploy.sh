#!/bin/bash

# Script de despliegue para jaha-api
# Baja, limpia y sube el contenedor Docker

set -e  # Detener el script si hay algún error

echo "========================================="
echo "  JAHA API - Script de Despliegue"
echo "========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Paso 1: Bajar contenedores
echo -e "${YELLOW}[1/5] Bajando contenedores...${NC}"
docker compose down
echo -e "${GREEN}✓ Contenedores detenidos${NC}"
echo ""

# Paso 2: Limpiar imágenes antiguas (opcional, comentar si no quieres limpiar)
echo -e "${YELLOW}[2/5] Limpiando imágenes antiguas...${NC}"
docker image prune -a -f
echo -e "${GREEN}✓ Imágenes antiguas eliminadas${NC}"
echo ""

# Paso 3: Construir imagen
echo -e "${YELLOW}[3/5] Construyendo nueva imagen...${NC}"
docker compose build --no-cache
echo -e "${GREEN}✓ Imagen construida${NC}"
echo ""

# Paso 4: Levantar contenedor
echo -e "${YELLOW}[4/6] Levantando contenedor...${NC}"
docker compose up -d
echo -e "${GREEN}✓ Contenedor levantado${NC}"
echo ""

# Paso 5: Ejecutar migraciones
echo -e "${YELLOW}[5/6] Ejecutando migraciones de base de datos...${NC}"
sleep 5  # Esperar a que la base de datos esté lista
docker compose exec -T api npm run migration:run
echo -e "${GREEN}✓ Migraciones ejecutadas${NC}"
echo ""

# Paso 6: Verificar estado
echo -e "${YELLOW}[6/6] Verificando estado...${NC}"
sleep 3  # Esperar a que el contenedor inicie
echo ""
docker compose ps
echo ""

# Health check
echo -e "${YELLOW}Verificando health check...${NC}"
sleep 2
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API está respondiendo correctamente${NC}"
else
    echo -e "${RED}✗ API no está respondiendo. Verifica los logs:${NC}"
    echo "  docker-compose logs -f api"
fi

echo ""
echo "========================================="
echo -e "${GREEN}  Despliegue completado${NC}"
echo "========================================="
echo ""
echo "Comandos útiles:"
echo "  Ver logs:       docker-compose logs -f api"
echo "  Detener:        docker-compose down"
echo "  Reiniciar:      docker-compose restart api"
echo "  Migraciones:    docker-compose exec api npm run migration:run"
echo "  Revertir migr.: docker-compose exec api npm run migration:revert"
echo ""
