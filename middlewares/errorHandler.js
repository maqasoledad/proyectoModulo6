/**
 * Middleware centralizado de errores. Traduce errores comunes de Mongoose
 * a respuestas HTTP claras, manteniendo siempre el formato
 * { status, message, data }.
 */
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // Validaciones de Mongoose (campos requeridos, minlength, match, etc.)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // ID con formato inválido (no es un ObjectId válido)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `ID inválido: ${err.value}`;
  }

  // Clave duplicada (unique: true) — username, email o tag repetidos
  if (err.code === 11000) {
    statusCode = 409;
    const campo = Object.keys(err.keyValue)[0];
    message = `Ya existe un registro con ese valor de "${campo}"`;
  }

  console.error(`[ERROR] ${req.method} ${req.originalUrl} ->`, message);

  res.status(statusCode).json({
    status: 'error',
    message,
    data: null,
  });
}

module.exports = errorHandler;
