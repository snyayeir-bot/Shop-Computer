import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../shop_database.sqlite');

const db = new sqlite3.Database(dbPath);

// Promisified query helpers
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const execute = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const initDb = async () => {
  return new Promise(async (resolve, reject) => {
    db.serialize(async () => {
      try {
        // 1. Users Table
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'buyer',
            phone TEXT,
            avatar TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // 2. Shops Table
        db.run(`
          CREATE TABLE IF NOT EXISTS shops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            seller_id INTEGER NOT NULL UNIQUE,
            shop_name TEXT NOT NULL,
            description TEXT,
            logo TEXT,
            banner TEXT,
            contact_email TEXT,
            contact_phone TEXT,
            is_approved INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);

        // 3. Categories Table
        db.run(`
          CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            icon TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // 4. Products Table
        db.run(`
          CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shop_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            brand TEXT DEFAULT 'Generic',
            description TEXT,
            specifications TEXT NOT NULL DEFAULT '{}',
            price REAL NOT NULL,
            cost_price REAL DEFAULT 0.00,
            stock_quantity INTEGER DEFAULT 0,
            image_url TEXT,
            is_featured INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (shop_id) REFERENCES shops(id),
            FOREIGN KEY (category_id) REFERENCES categories(id)
          )
        `);

        // 5. Orders Table
        db.run(`
          CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT NOT NULL UNIQUE,
            buyer_id INTEGER NOT NULL,
            total_amount REAL NOT NULL,
            tax_amount REAL DEFAULT 0.00,
            shipping_fee REAL DEFAULT 0.00,
            payment_method TEXT DEFAULT 'KHQR',
            payment_status TEXT DEFAULT 'pending',
            order_status TEXT DEFAULT 'pending',
            shipping_address TEXT NOT NULL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (buyer_id) REFERENCES users(id)
          )
        `);

        // 6. Order Items Table
        db.run(`
          CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            shop_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            price_each REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id),
            FOREIGN KEY (shop_id) REFERENCES shops(id)
          )
        `);

        // 7. Site Analytics Table
        db.run(`
          CREATE TABLE IF NOT EXISTS site_analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visit_date TEXT NOT NULL UNIQUE,
            unique_visitors INTEGER DEFAULT 0,
            page_views INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Seed ONLY Essential Hardware Categories (Zero mock products, zero mock orders, zero mock shops)
        db.get("SELECT COUNT(*) as count FROM categories", async (err, row) => {
          if (err) return reject(err);
          if (row.count === 0) {
            console.log("Seeding base categories...");
            await execute(`
              INSERT INTO categories (id, name, slug, icon, description) VALUES
              (1, 'Graphics Cards (GPU)', 'gpu', 'Cpu', 'NVIDIA RTX & AMD Radeon Series'),
              (2, 'Processors (CPU)', 'cpu', 'Microchip', 'Intel Core & AMD Ryzen Processors'),
              (3, 'Laptops & Workstations', 'laptop', 'Laptop', 'High performance gaming & ultrabook laptops'),
              (4, 'Memory (RAM)', 'ram', 'Layers', 'DDR5 and DDR4 memory modules'),
              (5, 'Motherboards', 'motherboard', 'Server', 'AM5, LGA1700 Sockets motherboards'),
              (6, 'Power Supplies (PSU)', 'psu', 'Zap', '80 PLUS Modular Power Supplies'),
              (7, 'Storage & SSDs', 'storage', 'HardDrive', 'PCIe 4.0/5.0 NVMe M.2 SSDs'),
              (8, 'PC Cases & Cooling', 'cases', 'Box', 'Chassis & liquid coolers')
            `);
          }

          // Ensure 1 default admin account exists so admin can log in
          db.get("SELECT id FROM users WHERE role = 'admin'", async (adminErr, adminRow) => {
            if (!adminRow) {
              const hash = await bcrypt.hash("admin123", 10);
              await execute(
                `INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, 'admin', ?)`,
                ['Super Admin', 'admin@cybertech.com', hash, '+855 12 345 678']
              );
              console.log("Default Admin Account initialized: admin@cybertech.com / admin123");
            }
            resolve(true);
          });
        });
      } catch (e) {
        reject(e);
      }
    });
  });
};
