# 💻 CYBERTECH — Multi-Vendor Computer Hardware E-Commerce Platform

[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-Flask%20%7C%20AI%20Vision-3776AB?logo=python&logoColor=white)](https://python.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Dark--Tech-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

> **វេទិកាពាណិជ្ជកម្មអេឡិចត្រូនិចលក់គ្រឿងបន្លាស់កុំព្យូទ័រ និង Laptop ពហុអ្នកលក់ (Multi-Vendor)**
> រួមបញ្ចូលប្រព័ន្ធ **Bakong KHQR**, **កាបូបលុយ Wallet (Credits)**, និង **AI ស្គែនវិក្កយបត្រធនាគារស្វ័យប្រវត្តិ (Bank Slip Scanner with Gemini AI)**។

---

## 🌟 លក្ខណៈពិសេសចម្បង (Key Features)

### 1. 🛍️ Buyer Portal (ផ្នែកអ្នកទិញ)
- **កាតាឡុកផលិតផលទំនើប (Dark-Tech Cyber UI):** ស្វែងរក និងចម្រាញ់ផលិតផលតាម Category (GPU, CPU, RAM, Laptop, Motherboard, PSU, Case, Storage) និង Spec បច្ចេកទេស (Socket AM5/LGA1700, VRAM, DDR5/DDR4, Brand, Price Range)។
- **កន្ត្រកទំនិញ (Smart Cart Drawer):** បែងចែកទំនិញតាមហាងនីមួយៗ (Vendor-grouped cart), គណនាពន្ធ VAT និងថ្លៃដឹកជញ្ជូនស្វ័យប្រវត្តិ។
- **ប្រព័ន្ធកាបូបលុយ & បញ្ចូលទឹកប្រាក់ (Wallet & Top-up):**
  - បង្ហាញសមតុល្យ Credit ផ្ទាល់លើ Navigation Bar។
  - បញ្ចូលលុយតាមរយៈ **Bakong KHQR (ACLEDA, ABA, Bakong...)**។
  - **ស្គែនបង្កាន់ដៃផ្ទេរប្រាក់ (Slip Scanner with AI):** គ្រាន់តែ Upload រូប Slip ធនាគារ ប្រព័ន្ធ AI Vision នឹងស្រង់ទិន្នន័យ (TxID, ចំនួនទឹកប្រាក់, ឈ្មោះ) ហើយបញ្ចូល Credit ដោយស្វ័យប្រវត្តិ ($1 = 1 Credit, 4,000៛ = 1 Credit)។
- **Checkout សុវត្ថិភាពខ្ពស់:** គាំទ្រការទូទាត់តាម Wallet Credits, Bakong KHQR, និងកាតធនាគារ ដោយមាន ACID Transaction Rollback ការពារបញ្ហាកាត់លុយ ឬស្តុកមិនត្រឹមត្រូវ។

### 2. 🏬 Seller Portal (ផ្នែកអ្នកលក់)
- ចុះឈ្មោះ និងបង្កើតហាងផ្ទាល់ខ្លួន (Store Profile, Logo, Hotline)។
- គ្រប់គ្រងទំនិញ និងស្តុក (Inventory & Spec Management) ជាមួយការដាស់តឿន Low Stock Alert (< 5 គ្រឿង)។
- Dashboard វិភាគទិន្នន័យលក់៖ ចំណូលសរុប (Revenue), ចំនួនលក់បាន, អតិថិជន និងស្ថានភាពការបញ្ជាទិញ។

### 3. 🛡️ Super Admin Portal (ផ្នែកគ្រប់គ្រងប្រព័ន្ធ)
- ពិនិត្យមើល និងអនុម័តហាងរបស់អ្នកលក់ថ្មី (Vendor Approval Workflow)។
- តាមដានស្ថិតិទូទៅនៃវេទិកា៖ GMV សរុប, កម្រៃជើងសារវេទិកា (Platform Commission 5%), ចំណេញសុទ្ធ។

---

## 🛠️ រចនាសម្ព័ន្ធបច្ចេកវិទ្យា (Tech Stack)

| ផ្នែក | បច្ចេកវិទ្យាដែលប្រើប្រាស់ |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS (Dark Cyberpunk Theme), Lucide Icons, Axios |
| **Backend API** | Node.js (ESM), Express.js, JWT Authentication, SQLite / MySQL Engine |
| **AI / Slip Service** | Python 3, Flask, Google Gemini AI Vision (`google-genai`), OpenCV, Pyzbar |
| **Payment Gateway** | Bakong KHQR EMVCo Standard, QR Generator |

---

## 📁 រចនាសម្ព័ន្ធ Folder (Project Structure)

```text
Shop-computer/
├── client/              # Frontend React + Vite
│   ├── src/
│   │   ├── components/  # Navbar, CartDrawer, TopUpModal, BakongKHQRModal, etc.
│   │   ├── context/     # AuthContext, CartContext, WalletContext
│   │   └── pages/       # CatalogPage, CheckoutPage, ProfilePage, SellerPortalPage, AdminDashboardPage
│   └── package.json
├── server/              # Backend Express REST API (Port 5000)
│   ├── database/        # schema.sql
│   ├── src/             # routes (auth, products, orders, wallet, payment, admin)
│   └── package.json
├── playemt/             # Python Bank Slip Scanner Microservice (Port 5005)
│   ├── server.py        # Flask API + Gemini Vision + KHQR Decoder
│   └── .env.example
├── strat.py             # Python All-in-One Startup Script (Client + Server + AI)
├── package.json         # Root scripts (concurrently runner)
└── README.md
```

---

## 🚀 របៀបតម្លើង និងដំណើរការ (Installation & Setup)

### ១. តម្រូវការជាមុន (Prerequisites)
- [Node.js](https://nodejs.org/) (កំណែ v18.0 ឬថ្មីជាង)
- [Python](https://www.python.org/) (កំណែ v3.10 ឬថ្មីជាង)
- Git

### ២. ទាញយកគម្រោង (Clone Repository)
```bash
git clone https://github.com/snyayeir-bot/Shop-Computer.git
cd Shop-Computer
```

### ៣. តម្លើង Dependencies

**Root & Frontend & Backend:**
```bash
# 1. Root dependencies
npm install

# 2. Server dependencies
cd server
npm install
cd ..

# 3. Client dependencies
cd client
npm install
cd ..
```

**Python AI Slip Scanner (`playemt`):**
```bash
cd playemt
pip install flask flask-cors pillow opencv-python pyzbar python-dotenv google-genai
cd ..
```

### ៤. កំណត់ Environment Variables

1. ចម្លង `server/.env.example` ទៅជា `server/.env`៖
   ```bash
   cp server/.env.example server/.env
   ```
2. ចម្លង `playemt/.env.example` ទៅជា `playemt/.env` និងដាក់ **Gemini API Key** របស់អ្នក៖
   ```bash
   cp playemt/.env.example playemt/.env
   ```
   *(ដាក់លេខកូដ `GEMINI_API_KEY=your_key` នៅក្នុងឯកសារ `playemt/.env`)*

---

## ⚡ របៀបដំណើរការប្រព័ន្ធ (Running the Project)

អ្នកអាចជ្រើសរើសវិធីណាមួយខាងក្រោមដើម្បីដំណើរការ៖

### វិធីទី ១៖ ប្រើប្រាស់ Python Startup Script (ណែនាំ ✨)
ដំណើរការសេវាកម្មទាំង ៣ ព្រមគ្នា (Client + Server + AI Scanner) ក្នុងផ្ទាំងតែមួយ៖
```powershell
python strat.py
```
*(ចុច `Ctrl + C` ដើម្បីបិទសេវាកម្មទាំងអស់រួមគ្នា)*

### វិធីទី ២៖ ប្រើប្រាស់ `npm start`
```powershell
npm start
```

### វិធីទី ៣៖ បើកដំណើរការដោយឡែកពីគ្នា (Manual Terminals)
- **Terminal 1 (Backend API):**
  ```bash
  cd server && npm run dev
  # ដំណើរការលើ: http://localhost:5000
  ```
- **Terminal 2 (AI Slip Scanner):**
  ```bash
  cd playemt && python server.py
  # ដំណើរការលើ: http://localhost:5005
  ```
- **Terminal 3 (Frontend Client):**
  ```bash
  cd client && npm run dev
  # ដំណើរការលើ: http://localhost:3000
  ```

---

## 🔑 គណនីសាកល្បង (Demo Credentials)

អ្នកអាចប្រើប្រាស់គណនីខាងក្រោម ឬចុចប៊ូតុង **Demo Switch** នៅលើ Navigation Bar ខាងលើដើម្បីសាកល្បង៖

| តួនាទី (Role) | អ៊ីមែល (Email) | ពាក្យសម្ងាត់ (Password) | សិទ្ធិប្រើប្រាស់ |
| :--- | :--- | :--- | :--- |
| **Buyer** | `buyer@demo.com` | `password123` | ទិញទំនិញ, បញ្ចូលលុយ Wallet, ស្គែន Slip |
| **Seller** | `seller@demo.com` | `password123` | បង្កើតហាង, គ្រប់គ្រងទំនិញ, មើលចំណូល |
| **Super Admin** | `admin@demo.com` | `password123` | អនុម័តហាង, ពិនិត្យមើលរបាយការណ៍ហិរញ្ញវត្ថុ |

---

## 📄 អាជ្ញាប័ណ្ណ (License)
គម្រោងនេះស្ថិតនៅក្រោម [MIT License](LICENSE)។
