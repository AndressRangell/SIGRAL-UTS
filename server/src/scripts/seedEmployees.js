require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('../models/Employee');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/proyecto';

async function run() {
  await mongoose.connect(MONGO_URI);
  const items = [
    { fullName: 'Juan Pérez', documentId: 'CC123456', email: 'juan.perez@uts.edu.co', area: 'Planta A', position: 'Operario' },
    { fullName: 'Ana Gómez', documentId: 'CC987654', email: 'ana.gomez@uts.edu.co', area: 'Planta B', position: 'Supervisora' },
    { fullName: 'Carlos Ruiz', documentId: 'CC555222', email: 'carlos.ruiz@uts.edu.co', area: 'Almacén', position: 'Auxiliar' },
  ];
  for (const e of items) {
    await Employee.updateOne({ documentId: e.documentId }, { $set: e }, { upsert: true });
  }
  console.log('Seeded employees:', items.length);
  await mongoose.disconnect();
}

run().catch(async (e) => { console.error(e); try { await mongoose.disconnect(); } catch {} process.exit(1); });




