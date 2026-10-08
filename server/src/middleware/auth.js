import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_kh_pc_market_2026';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const userRole = req.user.role;
    const allowed = Array.isArray(roles) ? roles.includes(userRole) : roles === userRole;
    if (!allowed) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: Access restricted to [${Array.isArray(roles) ? roles.join(', ') : roles}] roles` 
      });
    }
    next();
  };
};
