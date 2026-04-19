// middleware/authMiddleware.js
import { verifyToken } from '../helper/authHelper.js';
import { handle401 } from '../helper/errorHandler.js';

/**
 * Authentication Middleware
 * Checks for JWT token in Authorization header
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return handle401(res, "No token provided");
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return handle401(res, "No token provided, access denied");
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return handle401(res, "Invalid or expired token");
  }

  // Attach user data to request object
  req.user = decoded;
  next();
};
