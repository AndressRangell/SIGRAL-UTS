const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    incidentId: { type: String, trim: true, index: true },
    dateTime: { type: Date, required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    eventType: { type: String, required: true, trim: true },
    eventClassification: { type: String, required: true, trim: true },
    causativeAgent: { type: String, required: true, trim: true },
    bodyPartAffected: { type: String, required: true, trim: true },
    consequence: { type: String, required: true, trim: true },
    shift: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    witnesses: [{ type: String, trim: true }],
    preventiveAction: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Incident', incidentSchema);



