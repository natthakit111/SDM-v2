/**
 * middlewares/auth.middleware.js
 * Verifies the JWT in the Authorization header.
 * Attaches decoded payload to req.user.
 */

const jwt = require('jsonwebtoken');
const { sendUnauthorized, sendForbidden } = require('../utils/response');

/**
 * authenticate
 * Middleware that validates the Bearer JWT token.
 * Usage: router.get('/protected', authenticate, controller)
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendUnauthorized(res, 'No token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { user_id, username, role }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Token has expired');
    }
    return sendUnauthorized(res, 'Invalid token');
  }
};

/**
 * authorizeRoles
 * Role-based access control middleware factory.
 * Usage: router.post('/admin-only', authenticate, authorizeRoles('admin'), controller)
 *
 * @param {...string} roles - Allowed roles e.g. 'admin', 'tenant'
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendUnauthorized(res);
    }
    if (!roles.includes(req.user.role)) {
      return sendForbidden(
        res,
        `Role '${req.user.role}' is not allowed to access this resource`
      );
    }
    next();
  };
};

module.exports = { authenticate, authorizeRoles };
