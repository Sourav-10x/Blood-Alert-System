// server/routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Donor = require('../models/Donor');
const auth = require('../middleware/auth');

// Add new blood donation entry to inventory
router.post('/', auth('hospital'), async (req, res) => {
    try {
        const { donorId, bloodGroup, qtyMl } = req.body;

        if (!donorId || !bloodGroup || !qtyMl) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const donor = await Donor.findById(donorId);
        if (!donor) {
            return res.status(404).json({ error: "Donor not found" });
        }

        const newEntry = await Inventory.create({
            donorName: donor.name,
            donorEmail: donor.email,
            bloodGroup,
            qtyMl: parseInt(qtyMl),
            timestamp: new Date()
        });

        res.status(201).json(newEntry);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Get inventory list
router.get('/', auth(), async (req, res) => {
    try {
        const inventory = await Inventory.find().sort({ timestamp: -1 });
        res.json(inventory);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;