const User = require('../models/User');
const { verifyPassword, signJwt } = require('../utils/crypto');

const allowedDomains = [
  'uts.edu.co',
  'correo.uts.edu.co',
];

function isInstitutionalEmail(email) {
  const lower = String(email || '').toLowerCase().trim();
  const at = lower.lastIndexOf('@');
  if (at === -1) return false;
  const domain = lower.slice(at + 1);
  return allowedDomains.includes(domain);
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    if (!isInstitutionalEmail(email)) return res.status(400).json({ message: 'Invalid institutional email domain' });

    const user = await User.findOne({ email: email.toLowerCase(), active: true });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = verifyPassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const secret = process.env.JWT_SECRET || 'dev-secret';
    const token = signJwt({ sub: user._id.toString(), role: user.role }, secret, 60 * 60 * 8);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, me, isInstitutionalEmail };





