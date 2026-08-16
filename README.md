# Society Management System (MERN Stack)

A modern, production-grade Society Management System built with MongoDB, Express.js, React (Vite), and Node.js with role-based access control for Residents, Administrators, and Security Staff.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on v22)
- **MongoDB**: Running locally at `mongodb://127.0.0.1:27017`

### 2. Seed Demo Data
To populate the database with Wings (A, B, C), 10 sample flats, and demo accounts:
```bash
cd server
npm run seed
```

### 3. Run Backend Server
```bash
cd server
npm start
# Runs on http://localhost:5000
```

### 4. Run Frontend App
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Assigned Scope / Flat |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@society.com` | `admin123` | Full Society Management & Statistics |
| **Resident** | `resident@society.com` | `resident123` | Resident Portal (Wing A • Flat 101) |
| **Resident** | `sarah@society.com` | `resident123` | Resident Portal (Wing B • Flat 201) |
| **Security** | `security@society.com` | `security123` | Main Gate Checkpoint |

*Tip: The login page includes convenient 1-click demo buttons for testing.*

---

## 🛡️ Role-Based Access Matrix

| Endpoint / Page | Resident | Admin | Security | Unauthenticated |
| :--- | :---: | :---: | :---: | :---: |
| `POST /api/auth/login` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/auth/register` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/auth/me` | ✅ | ✅ | ✅ | ❌ (401) |
| `GET /api/dashboard/resident` | ✅ | ✅ | ❌ (403) | ❌ (401) |
| `GET /api/dashboard/admin` | ❌ (403) | ✅ | ❌ (403) | ❌ (401) |
| `GET /api/dashboard/security` | ❌ (403) | ✅ | ✅ | ❌ (401) |

---

## 🧪 Automated Verification Suite
To re-run the Phase 1 backend verification test suite at any time:
```bash
cd server
node test-auth.js
```
