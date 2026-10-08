# 🚀 Multi-Vendor Computer Hardware & Laptop E-Commerce Platform
*(CYBERTECH Platform - Full-Stack Application)*

A complete, production-ready Multi-Vendor Computer Hardware & Laptop E-Commerce Platform built with **React.js + Vite + Tailwind CSS (Dark-Tech Cyber Aesthetic)** on the frontend, and **Node.js + Express.js + JWT RBAC + ACID SQL Database Engine** on the backend.

---

## 🛠️ Tech Stack & Architecture

### 1. Frontend (`/client`)
- **Framework:** React.js 18 with Vite
- **Styling:** Tailwind CSS (Dark-Tech aesthetic: `#070c18` background, Slate-900 glass cards, Cyan & Indigo accents, glowing highlights)
- **Icons:** Lucide React (`lucide-react`)
- **Routing & State:** React Router Dom v6, React Context (AuthContext & CartContext)
- **HTTP Client:** Axios with JWT Bearer Interceptors

### 2. Backend API (`/server`)
- **Runtime:** Node.js (ES Modules) + Express.js
- **Authentication & Security:** JWT (JSON Web Tokens) with role checks (`buyer`, `seller`, `admin`), `bcryptjs`, CORS, Helmet
- **Database & Transactions:** SQL Relational Schema (`server/database/schema.sql`) + SQLite / MySQL 8.0 auto-boot engine with ACID transaction rollback for atomic order checkouts and stock decrements.

---

## 💻 Portals & Capabilities

### 🛍️ A. Buyer Portal
1. **Catalog & Multi-Spec Filters (`/products`):**
   - Filter by Category (GPU, CPU, RAM, Laptop, Motherboard, PSU, Case, Storage).
   - Multi-spec hardware filtering (Socket type: AM5/LGA1700, VRAM: 24GB/16GB/12GB/8GB, DDR: DDR5/DDR4, Brand, Price range slider).
   - Responsive Product Grid with stock indicators (`In Stock`, `Low Stock < 5 units`, `Out of Stock`).
2. **Interactive Cart Drawer & Checkout (`/checkout`):**
   - Slide-in cart drawer grouped by Vendor/Shop.
   - Real-time calculations: Subtotal, Shipping fee ($15 or FREE over $1500), Tax (VAT 10%), and Grand Total.
   - Checkout with delivery address and Bakong KHQR dynamic QR / Card payment simulator.
3. **Buyer Profile & Spending Dashboard (`/profile`):**
   - Total spent metric card and completed order counter.
   - Order history timeline with live status tracking (`pending`, `processing`, `shipped`, `delivered`).

### 🏬 B. Seller Portal (`/seller`)
1. **Shop Registration & Profile Setup:**
   - Store name, description, logo URL, and contact hotline form.
2. **Product & Inventory Manager:**
   - Add/Edit product modal with dynamic JSON key-value input for hardware specs (e.g. Socket, VRAM, TDP, Interface).
   - Stock controls and "Low Stock Alert" warnings (`< 5 units`).
3. **Vendor Analytics Dashboard:**
   - 4 Metric cards: **Total Revenue ($)**, **Total Items Sold**, **Low Stock Alert**, **Unique Customers**.
   - Customer purchase table: Buyer name, items bought, total spent, order status.

### 🛡️ C. Super Admin Dashboard (`/admin`)
1. **Platform Analytics:**
   - Daily Active Users (DAU) metric, 7-day traffic chart overview.
   - Financial breakdown: Total marketplace GMV, platform commission (5%), server expenses ($45), net profit.
2. **Moderation Queue:**
   - Vendor store approval table with Approve / Reject action buttons.

---

## ⚡ Demo Quick Logins (1-Click Switch in Top Navigation)
- 👤 **Buyer Demo:** `buyer@demo.com` (Password: `password123`)
- 🏬 **Seller Demo:** `seller@demo.com` (Password: `password123`)
- 🛡️ **Super Admin Demo:** `admin@demo.com` (Password: `password123`)

---

## 🚀 How to Run the Application

### Method 1: Run Both Client & Server Concurrently
```bash
npm start
```

### Method 2: Run Separately in 2 Terminals
**Terminal 1 (Backend API):**
```bash
cd server
npm start
# API runs on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:3000
```
