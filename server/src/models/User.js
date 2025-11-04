const mongoose = require('mongoose');

const ROLES = ['admin', 'user'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Password is stored using scrypt: format "scrypt$<saltBase64>$<hashBase64>"
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, default: 'user', required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);


