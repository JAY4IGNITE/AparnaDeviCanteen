# Aparnadevi Canteen (FoodNest) — Hostel Canteen Management System

Aparnadevi Canteen (FoodNest) is a full-stack web application designed to streamline the ordering, billing, menu management, and announcement flows for a hostel canteen. It provides distinct portals for students (Customers) and canteen administrators.

---

## 🛠️ Technology Stack

- **Frontend:**
  - **React 19** (built with **Vite**)
  - **React Router 7** for single-page routing
  - **Axios** for API communication
  - **Lucide React** for modern UI iconography
  - **Vanilla CSS** with clean grid and flexbox layouts
- **Backend:**
  - **Node.js** & **Express**
  - **JWT (jsonwebtoken)** for secure session-based authentication
  - **BcryptJS** for secure password hashing
  - **ExcelJS** for generating downloadable sales and order reports
  - **Cookie-Parser** for cookie-based authentication token handling
- **Database:**
  - **Supabase** (PostgreSQL) managed database instance
  - **PG (node-postgres)** client for raw query performance

---

## 📋 System Features & Specifications

### 🔑 Authentication & Authorization
- **JWT-Based Sessions:** Secure authentication tokens stored in client cookies/authorization headers.
- **Role-Based Access Control (RBAC):** Restricts access to student and admin interfaces.
- **User Registrations:** Clean signup/login workflows for students with password requirements.

### 🧑‍🎓 Student (Customer) Features
- **Notice Board:** View active canteen announcements posted by administrators.
- **Digital Menu:** Browse food items, check real-time availability, add items to the cart, and place orders.
- **Order Tracking:** Monitor order status (Pending, Preparing, Completed, Cancelled) and cancel pending orders.
- **Profile Manager:** Update personal details and change account passwords securely.
- **Support Portal:** Access canteen support information and contacts.

### 👑 Canteen Admin Features
- **Admin Dashboard:** Overview of active orders and total canteen revenue.
- **Menu Management:** Complete CRUD interface (Create, Read, Update, Delete) for menu items, with options to toggle availability in real-time.
- **Order Management:** View all active orders, update status (Preparing, Completed, Cancelled), wipe outdated logs, and export order history to **Excel spreadsheets** by date range.
- **Customer Directory:** Track student registrations, view contact details, block/unblock users, and delete accounts.
- **Announcements Portal:** Create, update, toggle visibility of, and delete banner announcements for the student homepage.
- **Counter Sales:** Quick register billing interface for walk-in canteen sales.
- **Analytical Metrics:** Dynamic charts showing revenue data, item statistics, and order volumes over custom date ranges.

---

## 📦 Deployment Architecture

The application is structured as a **monorepo** and is optimized to run under a single server instance on **Render**:
1. **Frontend Compilation:** Built into static web assets (`dist/`).
2. **Static Asset Serving:** The backend Express server serves the frontend static assets from `frontend/dist` on any non-API request (`/*`).
3. **Database Integration:** Both the local environment and production servers communicate directly with the Supabase database instance.

---

## 🚀 Local Development Setup

### 1. Database Setup
Ensure PostgreSQL or Supabase credentials are configured in your backend environment. Run the seed script to set up tables and create the default admin account:
```bash
cd backend
# Run migration schema and seeds
DATABASE_URL="your-supabase-connection-string" node setup-db.js
```

### 2. Run the App Locally
From the project root:
```bash
# Install dependencies in both folders
npm run install-all

developed by pavanputra

# Start both backend and frontend development servers concurrently
npm start
```
- **Frontend URL:** `http://localhost:5173`
- **Backend URL:** `http://localhost:5000`

hi everyone
