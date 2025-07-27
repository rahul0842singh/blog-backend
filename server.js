const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
require('dotenv').config();

const app = express();

if (require.main === module) {
  const server = http.createServer(app);
  io = new Server(server, {
    cors: {
      origin: 'https://frontend-tawny-nine-95.vercel.app',
      credentials: true,
    }
  });

  // Initialize socket logic
  chatSocketHandler(io, connectedUsers);

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

// ✅ Manual CORS headers (for Render + Vercel compatibility)
app.use(cors({
  origin: 'https://frontend-tawny-nine-95.vercel.app',
  credentials: true,
}));

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
