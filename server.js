const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// ✅ Manual CORS headers (for Render + Vercel compatibility)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://frontend-tawny-nine-95.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // Preflight OK
  }

  next();
});

// ✅ JSON middleware
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB error:', err.message));

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));

// ✅ Start server
const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
