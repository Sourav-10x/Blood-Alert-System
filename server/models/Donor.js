// server/models/Donor.js
const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  email: String,
  phone: String,
  bloodGroup: { type: String, enum: ['A+','A-','B+','B-','O+','O-','AB+','AB-'] },
  area: String,
  state: String,
  lastDonationDate: Date
}, { timestamps: true });

donorSchema.index({ bloodGroup: 1, area: 1, state: 1 });

module.exports = mongoose.model('Donor', donorSchema);