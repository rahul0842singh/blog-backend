const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const multer   = require('multer');
const fs       = require('fs');
const path     = require('path');
require('dotenv').config();

// 1️⃣ Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2️⃣ Multer setup (writes into our absolute uploadDir)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext    = file.originalname.split('.').pop();
    cb(null, `${unique}.${ext}`);
  }
});
const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());

// 3️⃣ Serve images from the absolute path
app.use('/uploads', express.static(uploadDir));

// 4️⃣ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser:    true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB error:', err.message));

// 5️⃣ Route mounting
app.use('/api/auth',  require('./routes/auth'));
app.use('/api/posts', upload.single('image'), require('./routes/posts'));

// 6️⃣ Start server
const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
