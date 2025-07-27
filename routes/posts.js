const router = require('express').Router();
const Post   = require('../models/Post');
const jwt    = require('jsonwebtoken');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    public_id: (req, file) => Date.now() + '-' + Math.round(Math.random() * 1e9),
  },
});
const upload = multer({ storage });

// ✅ Helper: extract user ID
const getUserId = header => {
  if (!header) return null;
  try {
    const token = header.split(' ')[1];
    return jwt.verify(token, process.env.JWT_SECRET).id;
  } catch {
    return null;
  }
};

// ✅ Auth middleware
const requireAuth = (req, res, next) => {
  const userId = getUserId(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  req.userId = userId;
  next();
};

// ✅ GET posts
router.get('/', async (req, res) => {
  const userId = getUserId(req.headers.authorization);
  const filter = userId
    ? { author: userId }
    : { status: 'published' };

  try {
    const posts = await Post.find(filter).populate('author', 'name email');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ CREATE post
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category, status } = req.body;
    const imagePath = req.file ? req.file.path : null;

    const post = await Post.create({
      title,
      content,
      category,
      status,
      imagePath,
      author: req.userId,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ UPDATE post
router.put('/:id', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    if (post.author.toString() !== req.userId)
      return res.status(403).json({ error: 'Forbidden' });

    const { title, content, category, status } = req.body;
    post.title = title;
    post.content = content;
    post.category = category;
    post.status = status;

    if (req.file) {
      post.imagePath = req.file.path;
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ DELETE post
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    if (post.author.toString() !== req.userId)
      return res.status(403).json({ error: 'Forbidden' });

    await post.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
