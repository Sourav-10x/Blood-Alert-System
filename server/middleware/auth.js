// server/middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

module.exports = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const hdr = req.headers.authorization || '';
      const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
      if (!token) return res.status(401).json({ error: 'No token' });

      const payload = jwt.verify(token, JWT_SECRET);
      req.user = { id: payload.id, role: payload.role, email: payload.email };

      if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};