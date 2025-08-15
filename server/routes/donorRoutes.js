// server/routes/donorRoutes.js
const express = require('express');
const Donor = require('../models/Donor');
const auth = require('../middleware/auth');

const router = express.Router();

// ✅ New: Get all donors (for your loadDonors function)
router.get('/', async (req, res) => {
  try {
    const donors = await Donor.find().sort('-updatedAt');
    res.json(donors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create donor (hospital/bloodbank/admin)
router.post('/', auth(['hospital','bloodbank','admin']), async (req, res) => {
  try {
    const { name, email, phone, bloodGroup, area, state, lastDonationDate } = req.body;
    if (!name || !email || !bloodGroup || !area || !state) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const donor = await Donor.create({
      name, email, phone, bloodGroup, area, state,
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : undefined
    });
    res.json({ message: 'Donor created', donor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public search for matching donors
router.get('/search', async (req, res) => {
  try {
    const { bloodGroup, area, state, q } = req.query;
    const filter = {};
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (area) filter.area = area;
    if (state) filter.state = state;
    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') },
        { area: new RegExp(q, 'i') },
        { state: new RegExp(q, 'i') },
        { bloodGroup: new RegExp(q, 'i') },
      ];
    }
    const donors = await Donor.find(filter).limit(500).sort('-updatedAt');
    res.json(donors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Donor marks donated -> update lastDonationDate
router.post('/me/donated', auth(['donor']), async (req, res) => {
  try {
    await Donor.findOneAndUpdate({ user: req.user.id }, { lastDonationDate: new Date() });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;