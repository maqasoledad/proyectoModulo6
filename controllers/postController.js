const Post = require('../models/Post');
const Tag = require('../models/Tag');

/**
 * Convierte un array de nombres de tags en sus ObjectId,
 * creando la tag si todavía no existe (evita duplicados por nombre).
 */
async function resolveTagIds(tagNames = []) {
  const ids = [];
  for (const nombre of tagNames) {
    const nombreNormalizado = nombre.trim().toLowerCase();
    let tag = await Tag.findOne({ name: nombreNormalizado });
    if (!tag) {
      tag = await Tag.create({ name: nombreNormalizado });
    }
    ids.push(tag._id);
  }
  return ids;
}

/**
 * POST /api/posts
 * Crea un post asociado a un autor (User) y a una lista de tags (N:M).
 */
async function createPost(req, res) {
  const { title, content, author, tags, publicado } = req.body;

  const tagIds = await resolveTagIds(tags);

  const post = await Post.create({
    title,
    content,
    author,
    tags: tagIds,
    publicado,
  });

  const postCompleto = await Post.findById(post._id)
    .populate('author', 'username email')
    .populate('tags', 'name');

  res.status(201).json({
    status: 'success',
    message: 'Post creado correctamente',
    data: { post: postCompleto },
  });
}

/**
 * GET /api/posts
 * Lista posts con filtros dinámicos combinables:
 *  - ?search=palabra   -> búsqueda de texto en título/contenido
 *  - ?author=<id>      -> posts de un autor puntual
 *  - ?tag=nombre       -> posts que tengan esa etiqueta
 *  - ?page= &limit=    -> paginación
 */
async function getPosts(req, res) {
  const { search, author, tag, page = 1, limit = 10 } = req.query;

  const filtro = {};

  if (search) {
    filtro.$text = { $search: search };
  }
  if (author) {
    filtro.author = author;
  }
  if (tag) {
    const tagDoc = await Tag.findOne({ name: tag.toLowerCase() });
    // Si la tag no existe, se fuerza un filtro que no matchea nada
    filtro.tags = tagDoc ? tagDoc._id : null;
  }

  const posts = await Post.find(filtro)
    .populate('author', 'username email')
    .populate('tags', 'name')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Post.countDocuments(filtro);

  res.status(200).json({
    status: 'success',
    message: 'Posts obtenidos correctamente',
    data: { posts, total, page: Number(page), limit: Number(limit) },
  });
}

/**
 * GET /api/posts/:id
 */
async function getPostById(req, res) {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username email')
    .populate('tags', 'name');

  if (!post) {
    return res.status(404).json({
      status: 'error',
      message: 'Post no encontrado',
      data: null,
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Post encontrado',
    data: { post },
  });
}

/**
 * PUT /api/posts/:id
 */
async function updatePost(req, res) {
  const { title, content, tags, publicado } = req.body;

  const camposActualizar = { title, content, publicado };

  if (tags) {
    camposActualizar.tags = await resolveTagIds(tags);
  }

  const post = await Post.findByIdAndUpdate(req.params.id, camposActualizar, {
    new: true,
    runValidators: true,
  })
    .populate('author', 'username email')
    .populate('tags', 'name');

  if (!post) {
    return res.status(404).json({
      status: 'error',
      message: 'Post no encontrado',
      data: null,
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Post actualizado correctamente',
    data: { post },
  });
}

/**
 * DELETE /api/posts/:id
 */
async function deletePost(req, res) {
  const post = await Post.findByIdAndDelete(req.params.id);

  if (!post) {
    return res.status(404).json({
      status: 'error',
      message: 'Post no encontrado',
      data: null,
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Post eliminado correctamente',
    data: null,
  });
}

module.exports = { createPost, getPosts, getPostById, updatePost, deletePost };
