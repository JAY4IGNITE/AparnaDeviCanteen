# Aparnadevi Canteen (FoodNest) — Smart Hostel Canteen Platform

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_4-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://aparnadevicanteen.onrender.com)

**Aparnadevi Canteen (FoodNest)** is an end-to-end full-stack canteen management and digital ordering ecosystem built for campus and hostel environments. It eliminates paper tokens, long queues, and manual tallying by providing real-time ordering for students, a live POS counter sale register for canteen staff, real-time stock and order management for administrators, and live automated analytics.

🌐 **Live Production URL:** [https://aparnadevicanteen.onrender.com](https://aparnadevicanteen.onrender.com)

---

## 🌟 Key Highlights & Modern Architecture

- **High-Performance Frontend (React 19 + Vite 8):** Ultra-fast compilation and routing powered by React 19, Vite, and React Router 7.
- **Rich Visual Aesthetics & Micro-Interactions:**
  - **WebGL Shader Effects:** 3D interactive color-bend shader background powered by Three.js on the landing page.
  - **Fluid Animations:** Butter-smooth animations via GSAP and Framer Motion (`motion/react`).
  - **Smooth Inertia Scrolling:** Integrated Lenis smooth scroll for a native, polished feel.
  - **Interactive Particles:** Custom `ClickSpark` physics-driven particle bursts on click events.
  - **Theme System:** Full Dark and Light theme support with seamless transitions.
- **Real-Time Live Database Statistics:** Landing page displays authentic, live counts (`/api/menu/public-stats`) directly from Supabase (Registered Students, Active Dishes, Total Orders Placed).
- **Digital Token & Order Pipeline:** Students receive digital order tokens upon checkout and track order states in real-time (Pending → Preparing → Ready / Completed).
- **POS Counter Sales System:** A dedicated point-of-sale interface for canteen operators to rapidly bill walk-in customers with instant receipt generation.
- **Automated Spreadsheet & PDF Generation:**
  - Order histories and sales reports exportable to Microsoft Excel (`.xlsx`) via **ExcelJS**.
  - Client-side digital receipt and invoice downloads using **html2canvas** and **jsPDF**.
- **Enterprise-Grade Auth & Email System:** Secure JWT authentication, Bcrypt password hashing, role-based route guards, and automated transactional emails (verification & password resets) via **Nodemailer**.

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
| :--- | :--- |
| **React 19** | Modern declarative UI layer with concurrent rendering & suspense |
| **Vite 8** | Next-generation frontend build tooling and HMR dev server |
| **Tailwind CSS 4** | High-performance CSS framework with modern color palettes and responsive utilities |
| **React Router 7** | Client-side routing with role-based access control (RBAC) |
| **Three.js** | Custom WebGL background shader (ColorBends) on landing page |
| **GSAP (GreenSock)** | High-performance scroll-driven and marquee animations |
| **Motion (Framer Motion 13)** | Component entry/exit animations, modal transitions, layout springs |
| **Lenis** | Smooth momentum scrolling engine |
| **Lucide React** | Consistent, modern vector iconography |
| **Axios** | HTTP client with automatic cookie and token handling |
| **html2canvas & jsPDF** | In-browser PDF generation for digital invoices and receipts |
| **Radix UI Dialog** | Accessible, unstyled modal dialog primitives |

### Backend & Database
| Technology | Purpose |
| :--- | :--- |
| **Node.js & Express 4** | Scalable REST API with compression middleware and static fallback |
| **Supabase (PostgreSQL)** | Managed PostgreSQL database storing users, orders, menu items, announcements, and feedbacks |
| **JSON Web Tokens (JWT)** | Secure, stateless authentication via HTTP cookies & authorization headers |
| **BcryptJS** | Salted password hashing for student and admin accounts |
| **Nodemailer** | SMTP email delivery service for email verification and password recovery |
| **ExcelJS** | Dynamic server-side generation of Excel (`.xlsx`) revenue and sales reports |
| **QRCode** | Dynamic QR code generation for payments, tokens, and community invites |
| **Web-Push** | Push notification service integration |
| **Compression** | Gzip/Brotli compression middleware for low-latency asset delivery |

---

## 🏛️ System Features & Portals

```
Aparnadevi Canteen
├── 🌐 Public Landing Page & Auth Flow
├── 🧑‍🎓 Student (Customer) Portal
└── 👑 Canteen Administration Portal
```

### 1. 🌐 Public & Landing Experience
- **Interactive Hero Section:** Fluid typography, call-to-action triggers, and an interactive 3D WebGL background shader.
- **Live Database Counter:** Displays actual database statistics (registered student count, active menu offerings, total completed orders).
- **Interactive Menu Showcase:** Visual preview of current dishes with price tags and categories.
- **WhatsApp Community Hub:** Direct QR code and one-click join button to connect students directly with the official canteen group.
- **Operational Details:** Full-screen responsive card highlighting open timings, service points, and digital token instructions.
- **Secure Authentication Flow:**
  - Student registration with instant email verification link sent via Nodemailer.
  - Forgot password and reset password flow with secure, time-limited cryptographic tokens.
  - Role-based automatic redirect to customer or admin dashboards.

---

### 2. 🧑‍🎓 Student (Customer) Portal
- **Dashboard & Notice Board:** Real-time carousel of urgent announcements, meal-time specials, and canteen updates posted by administration.
- **Interactive Food Menu:**
  - Categorized browsing (Breakfast, Lunch, Snacks, Beverages, Meals).
  - Live stock indicators (Instantly updates when items run out).
  - Add to cart with dynamic quantity adjustments and pricing totals.
- **Checkout & Digital Token System:**
  - Order placement with instant generation of a unique digital token ID.
  - Live order tracking pipeline: `Pending` ➔ `Preparing` ➔ `Completed` / `Cancelled`.
  - Self-service cancellation for pending orders.
- **PDF Invoices & Receipts:** One-click generation of printable, formatted receipts containing order items, token number, and timestamps.
- **Customer Feedback & Ratings:** Star ratings and textual reviews submitted directly to the administration.
- **Profile Management:** Update personal information, phone number, and change account passwords.
- **Help Desk & Support:** Quick contacts, canteen manager helpline, and FAQ guidance.

---

### 3. 👑 Canteen Administration Portal
- **Executive Analytics Dashboard:**
  - High-level KPIs: Today's revenue, active pending orders, total menu items, registered student count.
  - Quick-action shortcuts for fast order processing and menu updates.
- **Menu Management (CRUD):**
  - Add new dishes with image, price, category, and description.
  - Instant one-click toggle for dish availability (`In Stock` / `Out of Stock`).
  - Edit pricing, names, and descriptions or delete outdated items.
- **Order Dispatcher & Order Management:**
  - Live view of incoming student orders with clear status badges.
  - Update status in real-time (`Preparing`, `Completed`, `Cancelled`).
  - Filter orders by date range, status, or search by student name/token.
  - **Export to Excel:** Download complete order history spreadsheets (`.xlsx`) filtered by custom date ranges.
  - Purge outdated or cancelled order logs.
- **Point of Sale (POS) Counter Sales:**
  - Rapid cashier interface designed for walk-in students and cash/UPI counter sales.
  - Add items with simple click counters, compute change, and instantly generate an order token.
- **Financial Revenue & Statistics Reports:**
  - Daily, weekly, and monthly revenue breakdowns.
  - Top-selling food items and volume distribution metrics.
- **Customer Directory & Security:**
  - View all registered campus students with contact info and account status.
  - One-click account suspension (block/unblock) and account deletion.
- **Announcements Portal:**
  - Publish rich announcement banners directly to the student portal notice board.
  - Toggle announcement visibility on/off or delete expired announcements.
- **Feedback Moderation:**
  - View submitted student feedback, satisfaction ratings, and constructive reviews.
- **Canteen Settings:**
  - Manage operational timings, contact numbers, and general canteen configurations.

---

## 📁 Monorepo Project Structure

```
AparnaDeviCanteen/
├── package.json                 # Monorepo root scripts (concurrent dev, prod runner)
├── render.yaml                  # Infrastructure-as-code for Render deployment
├── README.md                    # Project documentation
│
├── backend/                     # Node.js & Express API Service
│   ├── server.js                # Express entry point, static asset serving, compression
│   ├── db.js                    # Supabase client connection initialization
│   ├── setup-db.js              # Database migration & schema setup runner
│   ├── seed.js                  # Initial database seeder (admin account, sample menu)
│   ├── package.json             # Backend dependencies
│   ├── middleware/              # Auth verification & role validation middleware
│   ├── routes/                  # Modular REST API route handlers
│   │   ├── adminRoutes.js       # Admin statistics, order management, Excel export
│   │   ├── announcementRoutes.js# Public and admin notice board endpoints
│   │   ├── authRoutes.js        # Registration, login, verification, password recovery
│   │   ├── feedbackRoutes.js    # Student reviews and ratings endpoints
│   │   ├── menuRoutes.js        # Dish catalogue & public statistics API
│   │   └── orderRoutes.js       # Cart checkout, token tracking, cancellation
│   └── services/
│       └── emailService.js      # Nodemailer SMTP transporter and email templates
│
└── frontend/                    # React 19 + Vite 8 Single-Page Application
    ├── index.html               # Web application entry template
    ├── vite.config.js           # Vite build config with Tailwind CSS plugin
    ├── package.json             # Frontend dependencies
    └── src/
        ├── App.jsx              # React Router 7 route declarations & suspense boundaries
        ├── main.jsx             # React DOM root render
        ├── components/          # Reusable UI elements (Buttons, Inputs, Modals, Effects)
        │   ├── ClickSpark.jsx   # Interactive canvas particle burst component
        │   ├── ColorBends.jsx   # Three.js WebGL shader background
        │   └── ProtectedRoute.jsx# Auth and role-based route guard
        ├── context/             # Global React Context providers
        │   ├── AuthContext.jsx  # User session, JWT tokens, login/logout state
        │   ├── CartContext.jsx  # Shopping cart state & quantity calculations
        │   └── ThemeContext.jsx # Light / Dark mode state management
        ├── layouts/             # Wrapper layouts with navbars and sidebars
        │   ├── AdminLayout.jsx  # Admin portal sidebar and navigation header
        │   └── CustomerLayout.jsx# Student navbar, cart drawer, and mobile menu
        └── pages/               # Application page views
            ├── LandingPage.jsx  # Hero, live stats, menu wall, WhatsApp community
            ├── Login.jsx        # User login
            ├── Register.jsx     # Student registration
            ├── VerifyEmail.jsx  # Email token confirmation
            ├── ForgotPassword.jsx# Password recovery initiation
            ├── ResetPassword.jsx # Password reset submission
            ├── admin/           # Admin pages (Home, Menu, Orders, POS, Analytics, etc.)
            └── customer/        # Student pages (Home, Menu, Orders, Invoices, Feedback)
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher (Recommended: `v20+` or `v22+`)
- **npm**: `v9.0.0` or higher
- **Supabase Account**: Free PostgreSQL database instance from [Supabase](https://supabase.com)

### 2. Clone the Repository
```bash
git clone https://github.com/JAY4IGNITE/AparnaDeviCanteen.git
cd AparnaDeviCanteen
```

### 3. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```bash
# backend/.env
PORT=5000
NODE_ENV=development

# Supabase Credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Nodemailer SMTP Configuration (Optional for local testing, required for emails)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
FRONTEND_URL=http://localhost:5173
```

### 4. Install Dependencies
Run the install command from the root directory to install packages for both `backend` and `frontend`:
```bash
npm run install-all
```

### 5. Seed the Database
Run the seed script to create initial tables, the default admin account, and starter menu items:
```bash
npm run seed
```

> **Default Admin Credentials:**
> - **Email:** `admin@foodnest.com`
> - **Password:** `admin123`

### 6. Start the Development Servers
Run both the Express backend API (`http://localhost:5000`) and the Vite frontend dev server (`http://localhost:5173`) concurrently:
```bash
npm start
```

Open your browser and navigate to:
- **Application:** `http://localhost:5173`
- **Backend API Health Check:** `http://localhost:5000/api/health`

---

## 🚢 Production Deployment (Render)

This repository is pre-configured with a `render.yaml` blueprint for zero-downtime deployment on Render as a unified service.

### Deployment Workflow
1. Push your repository to **GitHub**.
2. Log into [Render Dashboard](https://dashboard.render.com) and click **New > Blueprint**.
3. Connect your repository. Render automatically reads `render.yaml`:
   - **Build Command:** `npm install && npm run install-all && npm run build --prefix frontend`
   - **Start Command:** `npm run start-prod`
4. Set the following required environment variables in Render:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role secret key
   - `JWT_SECRET`: A strong random secret string (auto-generated by Render)
   - `EMAIL_USER` & `EMAIL_PASS`: (Optional) SMTP credentials for email delivery
5. The backend Express server serves the optimized production bundle from `frontend/dist` with 1-year immutable caching and Gzip/Brotli compression, providing optimal performance.

---

## 📡 Core API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new student account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT token |
| `GET` | `/api/auth/verify-email/:token` | Public | Verify student email address |
| `POST` | `/api/auth/forgot-password` | Public | Request password reset link |
| `POST` | `/api/auth/reset-password/:token` | Public | Reset password with token |
| `GET` | `/api/menu` | Public | Fetch all currently active menu dishes |
| `GET` | `/api/menu/public-stats` | Public | Get live counts (registered students, active dishes, total orders) |
| `POST` | `/api/orders` | Customer | Place a new order and receive a digital token |
| `GET` | `/api/orders/my-orders` | Customer | Get order history for the authenticated student |
| `PUT` | `/api/orders/:id/cancel` | Customer | Cancel an existing pending order |
| `POST` | `/api/feedback` | Customer | Submit rating and feedback review |
| `GET` | `/api/admin/orders` | Admin | Retrieve all customer orders with filtering |
| `PUT` | `/api/admin/orders/:id/status` | Admin | Update order status (`Preparing`, `Completed`, etc.) |
| `GET` | `/api/admin/orders/export` | Admin | Export order logs to an Excel spreadsheet (`.xlsx`) |
| `POST` | `/api/admin/counter-sale` | Admin | Process walk-in counter sale |
| `GET` | `/api/admin/revenue` | Admin | Retrieve financial analytics & revenue breakdowns |
| `GET` | `/api/admin/customers` | Admin | List all registered students |
| `PUT` | `/api/admin/customers/:id/toggle-block` | Admin | Block or unblock a student account |
| `POST` | `/api/announcements` | Admin | Create and publish notice board announcement |

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License. Designed and developed with ❤️ for the Aparnadevi Hostel & Campus Community.
