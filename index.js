// Se elige "index.js" como archivo principal (en vez de "app.js") porque es
// el punto de entrada por convención en el campo "main" de package.json y
// npm/node lo reconocen automáticamente al ejecutar "node ." — mantiene
// coherencia con la configuración del proyecto sin pasos adicionales.

require('dotenv').config();
const express = require('express');
const path = require('path');

const requestLogger = require('./middlewares/logger');
const mainRoutes = require('./routes/mainRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares globales ---
app.use(express.json()); // parseo de JSON en el body de los requests
app.use(requestLogger); // registro de cada visita en logs/log.txt

// Servir contenido estático desde /public (CSS, imágenes, HTML simples)
app.use(express.static(path.join(__dirname, 'public')));

// --- Rutas ---
app.use('/', mainRoutes);

// --- Manejo de rutas no encontradas ---
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada',
    data: null,
  });
});

app.listen(PORT, () => {
  console.log('Servidor iniciado');
  console.log(`Escuchando en http://localhost:${PORT}`);
});
