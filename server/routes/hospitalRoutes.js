// server/routes/hospitalRoutes.js
const express = require('express');
const router = express.Router();
const Hospital = require('../models/User'); // assuming Hospital is stored in User model
const BloodRequest = require('../models/BloodRequest');
const auth = require('../middleware/auth');

// Create emergency blood request
router.post('/requests', auth('hospital'), async (req, res) => {
    try {
        const { bloodGroup, units, area, state } = req.body;

        if (!bloodGroup || !units || !area || !state) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const hospital = await Hospital.findById(req.user.id);
        if (!hospital) {
            return res.status(404).json({ error: "Hospital not found" });
        }

        const newRequest = await BloodRequest.create({
            hospitalName: hospital.name,
            bloodGroup,
            units,
            area,
            state,
            status: "pending", // ✅ Default status
            createdAt: new Date()
        });

        res.status(201).json(newRequest);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Get all requests
router.get('/requests', auth(), async (req, res) => {
    try {
        const requests = await BloodRequest.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Update request status
router.put('/requests/:id/status', auth('hospital'), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'fulfilled', 'notified'].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const updated = await BloodRequest.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;