require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { hashPassword } = require('../utils/crypto');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/proyecto';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@uts.edu.co';
    const name = process.env.SEED_ADMIN_NAME || 'Admin UTS';
    const password = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
    const passwordHash = hashPassword(password);

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, passwordHash, role: 'admin', active: true });
      console.log('Admin created:', { email, password });
    } else {
      user.passwordHash = passwordHash;
      user.role = 'admin';
      user.active = true;
      await user.save();
      console.log('Admin updated password:', { email, password });
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();





