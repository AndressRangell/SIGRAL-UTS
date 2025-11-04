require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/proyecto';

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log('Server running on http://localhost:' + PORT);
    });
  } catch (err) {
    console.error('Startup error', err);
    process.exit(1);
  }
}

start();
