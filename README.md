# Gestión de Usuarios — Backend (Node.js + Express)

Proyecto integrador de los módulos 6, 7 y 8. Esta primera entrega corresponde a la
**Parte 1 – Módulo 6**: estructura inicial del servidor, rutas, vistas y persistencia básica.

## 📌 Requisitos del sistema

- Node.js **v18 o superior**
- npm (incluido con Node.js)

## ⚙️ Instalación

```bash
# 1. Clonar el repositorio
git clone <URL-del-repositorio>
cd gestion-usuarios-backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# (opcional: editar PORT en .env si 3000 está ocupado)
```

## ▶️ Ejecución

```bash
# Modo desarrollo (con recarga automática via nodemon)
npm run dev

# Modo producción / ejecución simple
npm start
```

El servidor queda disponible en `http://localhost:3000` (o el puerto definido en `.env`).

## 🧪 Ejemplos de uso

| Método | Ruta       | Tipo de respuesta | Descripción                                  |
|--------|------------|--------------------|-----------------------------------------------|
| GET    | `/`        | HTML (estático)    | Página de inicio servida desde `/public`      |
| GET    | `/status`  | JSON               | Estado del servidor (uptime, entorno, fecha)  |
| GET    | `/*`       | JSON               | Cualquier ruta no definida devuelve 404       |

```bash
curl http://localhost:3000/status
# {"status":"success","message":"Servidor operativo","data":{...}}
```

Cada request queda registrado automáticamente en `logs/log.txt` con el formato:
```
[YYYY-MM-DD HH:MM:SS] MÉTODO /ruta
```

## 🗂️ Estructura del proyecto

```
├── controllers/       # Lógica de negocio de cada ruta
│   └── mainController.js
├── middlewares/        # Middlewares propios (logging, futuro: auth JWT)
│   └── logger.js
├── routes/             # Definición de rutas, montadas en index.js
│   └── mainRoutes.js
├── public/             # Contenido estático servido con express.static()
│   ├── index.html
│   └── style.css
├── logs/               # Persistencia en archivo plano de accesos
│   └── log.txt
├── services/           # Reservado para lógica de acceso a datos (módulo 7)
├── utils/              # Funciones auxiliares reutilizables
├── index.js            # Punto de entrada del servidor
├── .env.example        # Plantilla de variables de entorno
└── package.json
```

Se agregaron `services/` y `utils/` además de las carpetas mínimas pedidas
(`routes`, `controllers`, `middlewares`, `public`, `logs`) para dejar preparada
la arquitectura modular que se necesitará en el módulo 7 (conexión a base de
datos y ORM), evitando tener que reestructurar el proyecto más adelante.

## 🧠 Decisiones técnicas y justificación

- **Archivo principal `index.js` (no `app.js`):** coincide con el campo `main`
  de `package.json` y es el nombre que Node reconoce por convención al usar
  `node .`, evitando configuración extra.
- **`express.static()` sobre `/public`:** se optó por servir un archivo HTML
  estático en `/` en lugar de un motor de plantillas, ya que en esta etapa no
  hay datos dinámicos que renderizar; la vista con motor de plantillas (EJS)
  queda como posible mejora para cuando se integren datos reales en el
  módulo 7.
- **Logging con `fs.appendFile()` en cada request:** se decidió registrar
  *todas* las peticiones (no solo errores) porque en una app de gestión de
  usuarios interesa tener trazabilidad de accesos desde el primer día, y es
  la base sobre la que luego se podrá filtrar por tipo de evento.
- **`router.js` externo (`routes/mainRoutes.js`):** las rutas se agrupan en
  un router de Express y se conectan con `app.use('/', mainRoutes)`, en vez
  de definirlas todas directamente en `index.js`, para mantener el archivo
  principal limpio y escalable a medida que se agreguen más recursos (users,
  auth, uploads, etc. en los módulos siguientes).
- **`dotenv` para el puerto:** el puerto se lee desde `.env` (con fallback a
  `3000`) para no hardcodear configuración de entorno en el código.

## ✅ Estado de cumplimiento (Parte 1 – Módulo 6)

- [x] Servidor Node.js (v18+) con Express
- [x] `package.json` completo con scripts `start` y `dev`
- [x] Dependencias: `express`, `dotenv`, `nodemon` (dev)
- [x] Al menos 2 rutas públicas (`/` y `/status`) con HTML y JSON
- [x] Contenido estático servido desde `/public`
- [x] Persistencia en archivo plano (`logs/log.txt`) con `fs.appendFile()`
- [x] Estructura modular en carpetas (routes, controllers, middlewares, public, logs)
- [x] Router externo conectado con `app.use()` (tarea PLUS)
- [ ] Variables de entorno con `dotenv` para el puerto (tarea PLUS) — ✅ implementado
- [ ] Vista dinámica con motor de plantillas (tarea PLUS opcional) — pendiente, no requerido en esta etapa

## 🔜 Próximos pasos

- **Módulo 7:** conexión a base de datos (PostgreSQL/MongoDB), modelado de
  entidades con ORM (Sequelize/Mongoose) y CRUD completo.
- **Módulo 8:** autenticación con JWT, subida de archivos y API RESTful con
  formato de respuesta `{ status, message, data }`.
