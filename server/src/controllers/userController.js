const User = require('../models/User');
const { hashPassword } = require('../utils/crypto');
const { isInstitutionalEmail } = require('../utils/validation');

async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!isInstitutionalEmail(email)) return res.status(400).json({ message: 'Invalid institutional email domain' });
    const passwordHash = password ? hashPassword(password) : undefined;
    const user = await User.create({ name, email, passwordHash, role });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, password, role, active } = req.body;
    if (email && !isInstitutionalEmail(email)) return res.status(400).json({ message: 'Invalid institutional email domain' });
    const update = { name, email, role, active };
    if (password) update.passwordHash = hashPassword(password);
    const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};


