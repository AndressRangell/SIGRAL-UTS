require('dotenv').config();
const mongoose = require('mongoose');
const Incident = require('../models/Incident');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/proyecto';

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[randInt(0, arr.length - 1)]; }

async function run() {
  await mongoose.connect(MONGO_URI);

  const admin = await User.findOne({ role: 'admin' });

  const eventTypes = ['Caída', 'Golpe', 'Corte', 'Quemadura', 'Sobreesfuerzo'];
  const classifications = ['Leve', 'Moderada', 'Grave'];
  const agents = ['Herramienta', 'Superficie', 'Máquina', 'Químico', 'Vehículo'];
  const bodyParts = ['Mano', 'Brazo', 'Cabeza', 'Pierna', 'Espalda', 'Tobillo'];
  const consequences = ['Sin incapacidad', 'Incapacidad 2 días', 'Incapacidad 5 días', 'Hospitalización'];
  const shifts = ['Mañana', 'Tarde', 'Noche'];
  const locations = ['Planta A', 'Planta B', 'Almacén', 'Oficina', 'Patio'];

  const count = Number(process.env.SEED_INCIDENTS_COUNT || 120);
  const daysBack = Number(process.env.SEED_INCIDENTS_DAYS || 90);

  const docs = [];
  for (let i = 0; i < count; i++) {
    const daysAgo = randInt(0, daysBack);
    const hours = randInt(6, 20);
    const minutes = randInt(0, 59);
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hours, minutes, 0, 0);

    const eventType = pick(eventTypes);
    const incidentId = `INC-${d.toISOString().slice(0,10).replace(/-/g,'')}-${String(i+1).padStart(4,'0')}`;

    docs.push({
      incidentId,
      dateTime: d,
      eventType,
      eventClassification: pick(classifications),
      causativeAgent: pick(agents),
      bodyPartAffected: pick(bodyParts),
      consequence: pick(consequences),
      shift: pick(shifts),
      location: pick(locations),
      witnesses: Math.random() < 0.4 ? ['Testigo A', 'Testigo B'].slice(0, randInt(0,2)) : [],
      preventiveAction: Math.random() < 0.6 ? 'Capacitación y señalización' : 'Inspección y mantenimiento',
      createdBy: admin?._id,
    });
  }

  await Incident.insertMany(docs);
  console.log(`Seeded ${docs.length} incidents`);
  await mongoose.disconnect();
}

run().catch(async (e) => { console.error(e); try { await mongoose.disconnect(); } catch {} process.exit(1); });





