import express from 'express';
import { query, getOne } from '../db.js';

const router = express.Router();

// GET /api/products/categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await query('SELECT * FROM categories ORDER BY id ASC');
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
});

// GET /api/products
// Supports: category, brand, minPrice, maxPrice, socket, vram, ddr, search, page, limit, sort
router.get('/', async (req, res, next) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      socket,
      vram,
      ddr,
      search,
      sort = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    let sql = `
      SELECT 
        p.*, 
        c.name as category_name, 
        c.slug as category_slug, 
        s.shop_name, 
        s.logo as shop_logo, 
        s.is_approved as shop_approved
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN shops s ON p.shop_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'all') {
      sql += ` AND (c.slug = ? OR c.id = ?)`;
      params.push(category, category);
    }

    if (brand && brand !== 'all') {
      sql += ` AND LOWER(p.brand) = ?`;
      params.push(brand.toLowerCase());
    }

    if (minPrice) {
      sql += ` AND p.price >= ?`;
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      sql += ` AND p.price <= ?`;
      params.push(Number(maxPrice));
    }

    if (search) {
      sql += ` AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(p.brand) LIKE ?)`;
      const term = `%${search.toLowerCase().trim()}%`;
      params.push(term, term, term);
    }

    // JSON Spec filtering (matching inside JSON specifications string)
    if (socket) {
      sql += ` AND (LOWER(p.specifications) LIKE ?)`;
      params.push(`%"socket":"${socket.toLowerCase()}%`);
    }

    if (vram) {
      sql += ` AND (LOWER(p.specifications) LIKE ?)`;
      params.push(`%"vram":"%${vram.toLowerCase()}%`);
    }

    if (ddr) {
      sql += ` AND (LOWER(p.specifications) LIKE ?)`;
      params.push(`%${ddr.toLowerCase()}%`);
    }

    // Sorting
    if (sort === 'price-low') {
      sql += ` ORDER BY p.price ASC`;
    } else if (sort === 'price-high') {
      sql += ` ORDER BY p.price DESC`;
    } else if (sort === 'stock') {
      sql += ` ORDER BY p.stock_quantity DESC`;
    } else {
      sql += ` ORDER BY p.is_featured DESC, p.id DESC`;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 20);
    const offset = (pageNum - 1) * limitNum;

    sql += ` LIMIT ? OFFSET ?`;
    params.push(limitNum, offset);

    const rows = await query(sql, params);

    // Format products with parsed JSON specifications
    const products = rows.map((item) => {
      let parsedSpecs = {};
      try {
        parsedSpecs = typeof item.specifications === 'string' 
          ? JSON.parse(item.specifications) 
          : (item.specifications || {});
      } catch (e) {
        parsedSpecs = {};
      }
      return {
        ...item,
        specifications: parsedSpecs
      };
    });

    res.json({
      success: true,
      count: products.length,
      page: pageNum,
      products
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await getOne(
      `SELECT 
        p.*, 
        c.name as category_name, 
        c.slug as category_slug, 
        s.shop_name, 
        s.description as shop_description,
        s.logo as shop_logo,
        s.contact_email as shop_email,
        s.contact_phone as shop_phone,
        s.is_approved as shop_approved
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN shops s ON p.shop_id = s.id
      WHERE p.id = ?`,
      [req.params.id]
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let parsedSpecs = {};
    try {
      parsedSpecs = typeof product.specifications === 'string' 
        ? JSON.parse(product.specifications) 
        : (product.specifications || {});
    } catch (e) {
      parsedSpecs = {};
    }

    res.json({
      success: true,
      product: {
        ...product,
        specifications: parsedSpecs
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
