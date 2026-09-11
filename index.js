// Se elige "index.js" como archivo principal (en vez de "app.js") porque es
// el punto de entrada por convención en el campo "main" de package.json y
// npm/node lo reconocen automáticamente al ejecutar "node ." — mantiene
// coherencia con la configuración del proyecto sin pasos adicionales.

require('dotenv').config();
const express = require('express');
const path = require('path');

const connectDB = require('./config/db');
const requestLogger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const mainRoutes = require('./routes/mainRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares globales ---
app.use(express.json()); // parseo de JSON en el body de los requests
app.use(requestLogger); // registro de cada visita en logs/log.txt

// Servir contenido estático desde /public (CSS, imágenes, HTML simples)
app.use(express.static(path.join(__dirname, 'public')));

// --- Rutas ---
app.use('/', mainRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// --- Manejo de rutas no encontradas ---
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada',
    data: null,
  });
});

// --- Manejo centralizado de errores (siempre al final) ---
app.use(errorHandler);

// Primero se conecta a la base de datos y recién después se levanta el
// servidor, para evitar aceptar requests sin tener acceso a los datos.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('Servidor iniciado');
    console.log(`Escuchando en http://localhost:${PORT}`);
  });
});
