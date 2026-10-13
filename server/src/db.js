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

        // 7. User Wallets Table (Credits balance)
        db.run(`
          CREATE TABLE IF NOT EXISTS user_wallets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            balance REAL NOT NULL DEFAULT 0.00,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);

        // 8. Shop Wallets Table (Seller earnings & withdrawals)
        db.run(`
          CREATE TABLE IF NOT EXISTS shop_wallets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shop_id INTEGER NOT NULL UNIQUE,
            available_balance REAL NOT NULL DEFAULT 0.00,
            pending_balance REAL NOT NULL DEFAULT 0.00,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
          )
        `);

        // 9. Top-Up Transactions (ACLEDA KHQR YAI SORNYA)
        db.run(`
          CREATE TABLE IF NOT EXISTS topup_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            credits_issued REAL NOT NULL,
            recipient_account TEXT DEFAULT '85515650751@aclb',
            merchant_name TEXT DEFAULT 'YAI SORNYA',
            slip_image_url TEXT,
            qr_string TEXT,
            md5_hash TEXT,
            status TEXT DEFAULT 'pending',
            reviewed_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (reviewed_by) REFERENCES users(id)
          )
        `);

        // 10. Withdrawal Requests (Sellers withdrawing credits to ACLEDA/Bank)
        db.run(`
          CREATE TABLE IF NOT EXISTS withdrawal_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shop_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            bank_name TEXT NOT NULL,
            bank_account_name TEXT NOT NULL,
            bank_account_number TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            admin_proof_url TEXT,
            admin_notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
          )
        `);

        // 11. Site Analytics Table
        db.run(`
          CREATE TABLE IF NOT EXISTS site_analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visit_date TEXT NOT NULL UNIQUE,
            unique_visitors INTEGER DEFAULT 0,
            page_views INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Apply automatic column migrations for existing tables
        const migrateColumns = async () => {
          try {
            const topupCols = await query('PRAGMA table_info(topup_transactions)');
            const topupColNames = topupCols.map(c => c.name);

            if (!topupColNames.includes('merchant_name')) {
              await execute("ALTER TABLE topup_transactions ADD COLUMN merchant_name TEXT DEFAULT 'YAI SORNYA'");
            }
            if (!topupColNames.includes('bank_name')) {
              await execute("ALTER TABLE topup_transactions ADD COLUMN bank_name TEXT DEFAULT 'ACLEDA Bank'");
            }
            if (!topupColNames.includes('transaction_ref')) {
              await execute("ALTER TABLE topup_transactions ADD COLUMN transaction_ref TEXT");
            }
            if (!topupColNames.includes('sender_name')) {
              await execute("ALTER TABLE topup_transactions ADD COLUMN sender_name TEXT");
            }
            if (!topupColNames.includes('slip_details')) {
              await execute("ALTER TABLE topup_transactions ADD COLUMN slip_details TEXT");
            }
            if (!topupColNames.includes('qr_string')) {
              await execute("ALTER TABLE topup_transactions ADD COLUMN qr_string TEXT");
            }
            if (!topupColNames.includes('md5_hash')) {
              await execute("ALTER TABLE topup_transactions ADD COLUMN md5_hash TEXT");
            }
            if (!topupColNames.includes('updated_at')) {
              await execute("ALTER TABLE topup_transactions ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP");
            }

            const wrCols = await query('PRAGMA table_info(withdrawal_requests)');
            const wrColNames = wrCols.map(c => c.name);

            if (!wrColNames.includes('admin_notes')) {
              await execute("ALTER TABLE withdrawal_requests ADD COLUMN admin_notes TEXT");
            }
            if (!wrColNames.includes('seller_qr_image')) {
              await execute("ALTER TABLE withdrawal_requests ADD COLUMN seller_qr_image TEXT");
            }
            if (!wrColNames.includes('updated_at')) {
              await execute("ALTER TABLE withdrawal_requests ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP");
            }
          } catch (mErr) {
            console.warn('Migration warning:', mErr.message);
          }
        };

        await migrateColumns();

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

            // Ensure demo account exists: demo@demo.com / demo123
            db.get("SELECT id FROM users WHERE email = 'demo@demo.com'", async (demoErr, demoRow) => {
              if (!demoRow) {
                const demoHash = await bcrypt.hash("demo123", 10);
                const demoRes = await execute(
                  `INSERT INTO users (name, email, password, role, phone, avatar) VALUES (?, ?, ?, 'seller', ?, ?)`,
                  ['demo', 'demo@demo.com', demoHash, '+855 12 345 678', 'https://api.dicebear.com/7.x/bottts/svg?seed=demo']
                );
                // Create Demo Shop
                const shopRes = await execute(
                  `INSERT OR IGNORE INTO shops (seller_id, shop_name, description, is_approved) VALUES (?, ?, ?, 1)`,
                  [demoRes.lastID, 'Demo PC Store', 'Official Demo Hardware & PC Store']
                );
                // Create user wallet with 1,000 Credits
                await execute(
                  `INSERT OR IGNORE INTO user_wallets (user_id, balance) VALUES (?, 1000.00)`,
                  [demoRes.lastID]
                );
                // Create shop wallet with 500 Credits
                const shopRow = await getOne('SELECT id FROM shops WHERE seller_id = ?', [demoRes.lastID]);
                if (shopRow) {
                  await execute(
                    `INSERT OR IGNORE INTO shop_wallets (shop_id, available_balance, pending_balance) VALUES (?, 500.00, 0.00)`,
                    [shopRow.id]
                  );
                }
                console.log("Default Demo Account initialized: demo@demo.com / demo123");
              }
              resolve(true);
            });
          });
        });
      } catch (e) {
        reject(e);
      }
    });
  });
};
