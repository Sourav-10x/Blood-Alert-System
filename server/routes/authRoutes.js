// server/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Donor = require('../models/Donor');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Register
router.post('/register', async (req, res) => {
  try {
    const { role, orgName, name, email, password, bloodGroup, area, state, phone } = req.body;
    if (!role || !email || !password) return res.status(400).json({ error: 'Missing required fields' });

    const existing = await User.findOne({ email, role });
    if (existing) return res.status(409).json({ error: 'Email already registered for this role' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      role,
      orgName: ['hospital','bloodbank'].includes(role) ? orgName : undefined,
      name: role === 'donor' ? name : undefined,
      email,
      passwordHash
    });

    if (role === 'donor') {
      await Donor.create({ user: user._id, name, email, phone, bloodGroup, area, state });
    }

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ error: 'Missing credentials' });

    const user = await User.findOne({ email, role });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;