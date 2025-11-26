#!/bin/bash

# Script simple de despliegue para jaha-api
# Baja, limpia y sube el contenedor Docker

echo "Bajando contenedores..."
docker-compose down

echo "Limpiando imágenes antiguas..."
docker image prune -f

echo "Construyendo imagen..."
docker-compose build --no-cache

echo "Levantando contenedor..."
docker-compose up -d

echo "Estado del contenedor:"
docker-compose ps

echo ""
echo "Despliegue completado!"
echo "Ver logs: docker-compose logs -f api"
