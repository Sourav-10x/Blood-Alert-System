// server/models/Inventory.js
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodGroup: { type: String, enum: ['A+','A-','B+','B-','O+','O-','AB+','AB-'], required: true },
  qty: { type: Number, required: true }, // ml
  type: { type: String, enum: ['IN','OUT'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);