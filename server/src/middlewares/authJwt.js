const { verifyJwt } = require('../utils/crypto');

function authJwt(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (!token) {
      if (required) return res.status(401).json({ message: 'Missing token' });
      return next();
    }
    if (scheme !== 'Bearer') return res.status(401).json({ message: 'Invalid auth scheme' });
    try {
      const secret = process.env.JWT_SECRET || 'dev-secret';
      const payload = verifyJwt(token, secret);
      req.userId = payload.sub;
      req.userRole = payload.role;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.userRole !== role) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

module.exports = { authJwt, requireRole };





