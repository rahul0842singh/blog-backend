const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const multer     = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer + Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads', // Folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    public_id: (req, file) =>
      Date.now() + '-' + Math.round(Math.random() * 1e9),
  },
});
const upload = multer({ storage });

// ✅ Express app
const app = express();

// ✅ CORS setup
const corsOptions = {
  origin: 'https://frontend-tawny-nine-95.vercel.app', // ✅ Your frontend domain
  credentials: true, // ✅ Allow sending cookies/auth headers if needed
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ Handle preflight requests

app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser:    true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB error:', err.message));

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', upload.single('image'), require('./routes/posts'));

// ✅ Start server
const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
