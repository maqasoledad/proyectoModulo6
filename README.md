# Gestión de Usuarios — Backend (Node.js + Express)

Proyecto integrador de los módulos 6, 7 y 8.

- ✅ **Parte 1 – Módulo 6**: estructura inicial del servidor, rutas, vistas y persistencia básica.
- ✅ **Parte 2 – Módulo 7**: conexión a MongoDB, modelado con Mongoose, relaciones y CRUD completo.

## 📌 Requisitos del sistema

- Node.js **v18 o superior**
- npm (incluido con Node.js)
- Una instancia de **MongoDB** corriendo (local o en la nube, ej. MongoDB Atlas)

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
├── config/
│   └── db.js                 # Conexión a MongoDB (Mongoose)
├── models/                   # Esquemas de Mongoose y sus relaciones
│   ├── User.js
│   ├── Profile.js
│   ├── Post.js
│   └── Tag.js
├── controllers/               # Lógica de negocio de cada ruta
│   ├── mainController.js
│   ├── userController.js
│   └── postController.js
├── middlewares/                # Middlewares propios
│   ├── logger.js               # Logging en archivo plano
│   └── errorHandler.js         # Manejo centralizado de errores
├── routes/                     # Definición de rutas, montadas en index.js
│   ├── mainRoutes.js
│   ├── userRoutes.js
│   └── postRoutes.js
├── public/                     # Contenido estático servido con express.static()
│   ├── index.html
│   └── style.css
├── logs/                        # Persistencia en archivo plano de accesos
│   └── log.txt
├── services/                    # Reservado para lógica de negocio compleja
├── utils/
│   └── asyncHandler.js          # Wrapper para controladores async
├── index.js                     # Punto de entrada del servidor
├── .env.example                 # Plantilla de variables de entorno
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

---

## 🗄️ Parte 2 – Módulo 7: Base de datos, ORM y CRUD

### Configuración

Además de instalar dependencias y copiar `.env.example` a `.env` (ver arriba),
tenés que definir `MONGO_URI`:

```bash
# Local (necesitás MongoDB instalado y corriendo en tu PC)
MONGO_URI=mongodb://localhost:27017/gestion-usuarios

# O en la nube con MongoDB Atlas (capa gratuita)
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/gestion-usuarios
```

> 💡 Si no tenés MongoDB instalado localmente, la forma más rápida es crear un
> cluster gratuito en [MongoDB Atlas](https://www.mongodb.com/atlas) y copiar
> la connection string que te da ahí.

### Modelo de datos y relaciones

| Entidad   | Relación                        | Tipo |
|-----------|----------------------------------|------|
| User ↔ Profile | Cada usuario tiene un único perfil | **1:1** |
| User ↔ Post    | Un usuario puede tener muchos posts | **1:N** |
| Post ↔ Tag     | Un post puede tener varias etiquetas, y una etiqueta puede estar en varios posts | **N:M** |

### Endpoints disponibles

**Usuarios** (`/api/users`)

| Método | Ruta            | Descripción                                  |
|--------|-----------------|-----------------------------------------------|
| POST   | `/api/users`    | Crea un usuario (y su perfil 1:1 asociado)    |
| GET    | `/api/users`    | Lista usuarios (`?search=&page=&limit=`)      |
| GET    | `/api/users/:id`| Trae un usuario con su perfil                 |
| PUT    | `/api/users/:id`| Actualiza usuario y/o su perfil               |
| DELETE | `/api/users/:id`| Elimina usuario y su perfil en cascada        |

**Posts** (`/api/posts`)

| Método | Ruta            | Descripción                                            |
|--------|-----------------|----------------------------------------------------------|
| POST   | `/api/posts`    | Crea un post (autor + tags, crea tags nuevas si no existen) |
| GET    | `/api/posts`    | Lista posts (`?search=&author=&tag=&page=&limit=`)        |
| GET    | `/api/posts/:id`| Trae un post con autor y tags poblados                    |
| PUT    | `/api/posts/:id`| Actualiza un post                                          |
| DELETE | `/api/posts/:id`| Elimina un post                                            |

### Ejemplo de uso (con `curl`)

```bash
# 1. Crear un usuario
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"maqui","email":"maqui@test.com","password":"123456","bio":"Backend dev"}'

# 2. Crear un post (usar el _id del usuario creado arriba)
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Mi primer post","content":"Contenido de prueba","author":"<ID_DEL_USUARIO>","tags":["nodejs","mongodb"]}'

# 3. Buscar posts por etiqueta
curl "http://localhost:3000/api/posts?tag=nodejs"

# 4. Buscar posts por texto
curl "http://localhost:3000/api/posts?search=primer"
```

### 🧠 Decisiones técnicas y justificación (Módulo 7)

- **MongoDB + Mongoose** en lugar de PostgreSQL/Sequelize: se adapta mejor a
  un modelo con documentos flexibles (perfiles con campos opcionales) y
  simplifica el uso de `populate()` para simular relaciones tipo JOIN.
- **Relaciones con `ObjectId` + `populate()`**: aunque MongoDB es una base
  documental sin relaciones nativas como SQL, Mongoose permite modelar 1:1,
  1:N y N:M mediante referencias, cumpliendo el requisito sin forzar un
  modelo relacional que no es natural en Mongo.
- **Hash de contraseña con `bcryptjs` en un hook `pre('save')`**: se protege
  la contraseña desde el modelo, sin depender de que cada controlador se
  acuerde de hashearla. La verificación (login) se integrará en el módulo 8
  junto con JWT.
- **`asyncHandler` + middleware de errores centralizado**: evita repetir
  `try/catch` en cada controlador y traduce errores típicos de Mongoose
  (`ValidationError`, `CastError`, clave duplicada `11000`) a respuestas HTTP
  claras, manteniendo siempre el formato `{ status, message, data }`.
- **Búsqueda de texto con índice `text`**: se usa `$text` sobre título y
  contenido de `Post` para las búsquedas dinámicas (`?search=`), más
  eficiente que un `$regex` sobre grandes volúmenes de datos.
- **Creación automática de tags inexistentes**: al crear/editar un post, si
  una etiqueta no existe todavía se crea sola (`findOne` + `create`), para
  que el front no tenga que gestionar un CRUD de tags aparte en esta etapa.

### ✅ Estado de cumplimiento (Parte 2 – Módulo 7)

- [x] Conexión a base de datos real (MongoDB)
- [x] Modelado y relación de entidades con ORM (1:1, 1:N y N:M)
- [x] CRUD completo sobre dos entidades clave (User y Post)
- [x] Consultas filtradas y búsquedas dinámicas (`search`, `author`, `tag`)
- [x] Manejo de errores y validaciones centralizado

## 🔜 Próximos pasos

- **Módulo 8:** autenticación con JWT (login/registro), rutas protegidas,
  subida de archivos (imágenes de usuario) con validación de tipo/tamaño, y
  formalización de la API RESTful completa.
