// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Routes
const donorRoutes = require('./routes/donorRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/InventoryRoutes'); // <— fix case

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// --- Serve frontend ---
// If your frontend is in ../public relative to server/
// (common layout: project/public + project/server)
app.use(express.static(path.join(__dirname, '../public')));

// --- API Routes ---
app.use('/api/donor', donorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);

// Fallback to index.html for non-API routes (so / opens UI)
app.get('*', (req, res) => {
  // Avoid hijacking API routes
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// --- MongoDB ---
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ Missing MONGO_URI in .env');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const port = process.env.PORT || 5000;
    app.listen(port, () =>
      console.log(`🚀 Server running on http://localhost:${port}`)
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });