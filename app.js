const express = require('express');
const cors = require('cors');
const os = require('os');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const ENV_NAME = process.env.APP_ENV || 'dev';
// Ejemplo de secreto inyectado vía SSM Parameter Store / Secrets Manager
const API_KEY = process.env.API_KEY || 'no-configurado';

// Health check: usado por el Target Group del ALB y por ECS
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', env: ENV_NAME, hostname: os.hostname() });
});

// Endpoint principal consumido por el frontend
app.get('/api/status', (req, res) => {
  res.status(200).json({
    message: 'Backend Innovatech Chile operativo - v2 (CI/CD test)',
    hostname: os.hostname(),
    environment: ENV_NAME,
    apiKeyConfigured: API_KEY !== 'no-configurado',
    timestamp: new Date().toISOString()
  });
});

// Endpoint extra para probar autoscaling con algo de carga de CPU
app.get('/api/carga', (req, res) => {
  let x = 0;
  for (let i = 0; i < 5_000_000; i++) x += Math.sqrt(i);
  res.status(200).json({ resultado: x, hostname: os.hostname() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend escuchando en puerto ${PORT} (env=${ENV_NAME})`);
});
