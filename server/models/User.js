// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  orgName: String,
  name: String,
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['hospital','bloodbank','donor','admin'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);