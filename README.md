# Innovatech Backend

Backend en Node.js/Express para la EP3 (ISY1101 — Introducción a Herramientas DevOps).

## Qué hace

Expone una API REST simple:

- `GET /health` → chequeo de salud (usado por el Target Group del ALB y por ECS).
- `GET /api/status` → estado del servicio, hostname del contenedor y timestamp (consumido por el frontend).
- `GET /api/carga` → endpoint que consume CPU artificialmente, útil para probar el autoscaling.

## Cómo correrlo localmente

```bash
npm install
npm start
# o con Docker:
docker build -t backend-local .
docker run -p 3000:3000 -e APP_ENV=local backend-local
curl http://localhost:3000/api/status
```

## Variables de entorno

| Variable   | Descripción                                  | Origen en AWS                  |
|------------|-----------------------------------------------|---------------------------------|
| `PORT`     | Puerto de escucha (default 3000)              | Variable de entorno fija        |
| `APP_ENV`  | Nombre del ambiente (dev/production)          | Variable de entorno fija        |
| `API_KEY`  | Clave de ejemplo, simula un secreto           | AWS SSM Parameter Store (SecureString), inyectada vía el bloque `secrets` de la Task Definition |

## Arquitectura de despliegue

```
Internet → ALB (puerto 80, regla /api/*) → ECS Fargate Service (backend-service)
                                              → Task Definition (imagen desde ECR)
                                              → CloudWatch Logs (/ecs/innovatech-backend)
```

## Pipeline CI/CD

Definido en `.github/workflows/deploy.yml`. Se dispara con cada `push` a `main`:
1. Build de la imagen Docker.
2. Push a Amazon ECR (tag = SHA del commit + `latest`).
3. Actualización de la Task Definition de ECS con la nueva imagen.
4. Deploy al servicio ECS y espera a que quede estable.

## Autoscaling

Target Tracking sobre CPU al 50% (ver `application-autoscaling` en la guía de despliegue). Se eligió ese umbral porque da margen de reacción antes de saturar las tareas sin sobre-aprovisionar recursos.

## Problemas encontrados

_(Completar durante el desarrollo, ejemplo: rotación de credenciales del AWS Academy Learner Lab obliga a actualizar los GitHub Secrets cada pocas horas.)_
