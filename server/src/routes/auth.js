import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getOne, execute, query } from '../db.js';
import { JWT_SECRET, verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register (Create Buyer, Seller, or Admin)
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role = 'buyer', phone, shopName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const assignedRole = ['buyer', 'seller', 'admin'].includes(role) ? role : 'buyer';

    const existing = await getOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await execute(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashedPassword, assignedRole, phone || null]
    );

    const user = await getOne('SELECT id, name, email, role, phone, avatar FROM users WHERE id = ?', [result.lastID]);
    
    // If seller, auto-create their shop profile
    if (assignedRole === 'seller') {
      const storeTitle = shopName?.trim() || `${user.name}'s Hardware Store`;
      await execute(
        'INSERT INTO shops (seller_id, shop_name, description, is_approved) VALUES (?, ?, ?, 1)',
        [user.id, storeTitle, 'Official computer hardware and laptop vendor storefront']
      );
    }

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await getOne('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/wipe-test-data (Wipe all mock/test data cleanly)
router.post('/wipe-test-data', async (req, res, next) => {
  try {
    await execute('DELETE FROM order_items');
    await execute('DELETE FROM orders');
    await execute('DELETE FROM products');
    await execute('DELETE FROM shops');
    await execute("DELETE FROM users WHERE email != 'admin@cybertech.com'");
    await execute('DELETE FROM site_analytics');

    // Ensure clean admin exists
    const adminExists = await getOne("SELECT id FROM users WHERE email = 'admin@cybertech.com'");
    if (!adminExists) {
      const hash = await bcrypt.hash("admin123", 10);
      await execute(
        `INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, 'admin', ?)`,
        ['Super Admin', 'admin@cybertech.com', hash, '+855 12 345 678']
      );
    }

    res.json({
      success: true,
      message: 'All test data wiped successfully. The database is now fresh and clean.'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const user = await getOne(
      'SELECT id, name, email, role, phone, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let shop = null;
    if (user.role === 'seller') {
      shop = await getOne('SELECT * FROM shops WHERE seller_id = ?', [user.id]);
    }

    res.json({
      success: true,
      user,
      shop
    });
  } catch (error) {
    next(error);
  }
});

export default router;
