const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    documentId: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true },
    area: { type: String, trim: true },
    position: { type: String, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);




