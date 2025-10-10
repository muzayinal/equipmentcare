# Industrial Maintenance System

A web-based system for managing industrial machine maintenance, tracking issues, and assigning tasks to technicians and staff.

---

## 🚀 System Features

1. **User Management**
   - Role-based access: Admin, Staff, Technician
   - Add, update, and view user profiles (Admin only)
   - Login/logout with JWT authentication

2. **Machine Management**
   - Add, edit, delete, and view machines (Admin only)
   - View machine details

3. **Issue Management**
   - Create, update, delete, and view machine issues
   - Assign issues to technicians
   - Track issue status (open, in_progress, closed, pending_part)
   - View issue history

4. **Frontend**
   - Responsive tables for users, machines, and issues
   - Role-specific actions and permissions

5. **Backend**
   - REST API using Express.js
   - MySQL database for storing users, profiles, machines, and issues
   - JWT authentication for protected routes

---

## ⚙️ Installation & Setup

### 1. Clone Repository

git clone <your-repo-url>
cd equipmentcare

### 2. Backend Setup
enter to folder backend

if you from equipmentcare
cd backend

lets install express js, mysql and dependency optional
1. npm install express
2. npm install mysql2
3. npm install cors bcryptjs jsonwebtoken cookie-parser

Configure MySQL Database

Create database: industrial_db

Import tables: users, machines, issues, profiles

Update database credentials in db.js if needed.

### 3. Frontend Setup
enter to folder frontend

if you from equipmentcare
cd frontend

if you from backend
1. cd ..
2. cd frontend

lets install next.js
1. npm install
2. npm run dev

Default url http://localhost:3000


dependency optional
1. npm install axios
2. npm install -D tailwindcss postcss autoprefixer
3. npx tailwindcss init -p



## API Documentation

## 🔑 Authentication

---


## 1️⃣ Auth Routes

### Login
| Method | URL        | Body                     | Success Response                   | Error Response      |
|--------|-----------|--------------------------|----------------------------------|-------------------|
| POST   | /api/login | { username, password }  | { message: "Login success", token } | 401 / 404 / 500 |

**Example Request:**
RAw -> json
POST /api/login
{
  "username": "admin01",
  "password": "password123"
}

Example Response:
{
  "message": "Login success",
  "token": "<JWT_TOKEN>"
}

## Log out
| Method | URL         | Body | Response                      |
| ------ | ----------- | ---- | ----------------------------- |
| POST   | /api/logout | -    | { message: "Logout success" } |


## User Routes

Get All Users (Admin Only)
| Method | URL        | Auth Required | Response              |
| ------ | ---------- | ------------- | --------------------- |
| GET    | /api/users | ✅             | Array of user objects |

Get User by Email (Admin Only)
| Method | URL              | Auth Required | Response    |
| ------ | ---------------- | ------------- | ----------- |
| GET    | /api/user/:email | ✅ (Admin)     | User object |

## Machine Routes
Get All Machines
| Method | URL           | Auth Required | Response          |
| ------ | ------------- | ------------- | ----------------- |
| GET    | /api/machines | ✅             | Array of machines |


Add Machine (Admin Only)
| Method | URL           | Auth Required | Body               | Response       |
| ------ | ------------- | ------------- | ------------------ | -------------- |
| POST   | /api/machines | ✅             | { name, location } | Machine object |

Update Machine (Admin Only)
| Method | URL               | Auth Required | Body               | Response       |
| ------ | ----------------- | ------------- | ------------------ | -------------- |
| PUT    | /api/machines/:id | ✅             | { name, location } | Machine object |

Delete Machine (Admin Only)
| Method | URL               | Auth Required | Body | Response    |
| ------ | ----------------- | ------------- | ---- | ----------- |
| DELETE | /api/machines/:id | ✅             | -    | { message } |

## Issues Routes
Get All Issues
| Method | URL         | Auth Required | Response        |
| ------ | ----------- | ------------- | --------------- |
| GET    | /api/issues | ✅             | Array of issues |

Get Issue by ID
| Method | URL             | Auth Required | Response     |
| ------ | --------------- | ------------- | ------------ |
| GET    | /api/issues/:id | ✅             | Issue object |

Add Issue
| Method | URL         | Auth Required | Body                                             | Response     |
| ------ | ----------- | ------------- | ------------------------------------------------ | ------------ |
| POST   | /api/issues | ✅             | { machine_id, reported_by, description, status } | Issue object |

Update Issue
| Method | URL             | Auth Required | Body                                       | Response     |
| ------ | --------------- | ------------- | ------------------------------------------ | ------------ |
| PUT    | /api/issues/:id | ✅             | { machine_id, title, description, status } | Issue object |

Delete Issue
| Method | URL             | Auth Required | Body | Response    |
| ------ | --------------- | ------------- | ---- | ----------- |
| DELETE | /api/issues/:id | ✅             | -    | { message } |


5️⃣ Notes

Roles & Permissions:

Admin → Full access (users, machines, issues)

Staff → View machines, create/update issues

Technician → Update issues

Issue Status Options: open, in_progress, closed, pending_part

JWT token required for all protected endpoints.

