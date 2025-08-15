// server/models/BloodRequest.js
const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodGroup: { type: String, enum: ['A+','A-','B+','B-','O+','O-','AB+','AB-'], required: true },
  unitsRequired: { type: Number, required: true },
  area: String,
  state: String,
  status: { type: String, enum: ['pending','notified','fulfilled'], default: 'pending' },
  notifiedDonors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donor' }]
}, { timestamps: true });

bloodRequestSchema.index({ bloodGroup: 1, area: 1, state: 1 });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);