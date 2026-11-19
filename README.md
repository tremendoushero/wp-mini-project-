# 🎓 Students Info — Student Management Portal (BCA Mini Project)

> A modern, responsive, and secure full-stack web application built using the **MERN Stack** (MongoDB Atlas, Express.js, React.js with Vite, and Node.js). Features a professional College ERP architecture with **secure JWT-based Admin Authentication stored in HttpOnly cookies**.

---

## 📌 1. Project Overview & Branding
**Students Info** (STUDENT MANAGEMENT PORTAL) is designed for academic colleges to manage student records, daily attendance tracking, degree courses, academic calendars, examination schedules, and analytics reports.

To protect sensitive student data from unauthorized access or modification, the application includes a **role-based Admin Login System**. Only authenticated college administrators can access the dashboard and perform student operations.

---

## 💻 2. Technology Stack

| Layer | Technology | Role & Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React.js 18 + Vite** | Single Page Application with dynamic state, protected routes, and instant UI updates. |
| **Styling** | **Pure CSS3** | Custom design variables, dark navy (`#1C1A3D`) and purple theme (`#5549E8`), rounded cards, responsive grid. |
| **Backend** | **Node.js & Express.js** | High-performance RESTful API framework. |
| **Database** | **MongoDB Atlas** | Cloud NoSQL database storing persistent student documents and admin credentials. |
| **Security & Auth** | **bcryptjs + jsonwebtoken + cookie-parser** | Salted password hashing, signed JWT tokens, and secure HttpOnly cookie transmission. |
| **API Client** | **Native JavaScript Fetch API** | Asynchronous HTTP requests with `credentials: 'include'` for cookie handling. |

---

## 🔐 3. Authentication & Security Architecture

### A. How Admin Login Works
1. The administrator visits `http://localhost:5173`.
2. If unauthenticated, the application automatically displays the **Admin Login Screen**.
3. The administrator enters their email and password.
4. Express receives the credentials (`POST /api/auth/login`), finds the admin document in MongoDB Atlas, and compares the entered password against the hashed password using `bcrypt.compare()`.
5. Upon successful verification:
   - A signed **JWT (JSON Web Token)** is generated containing the admin's unique ID.
   - The token is placed inside an **HttpOnly, SameSite cookie** named `token`.
   - The cookie is returned in the HTTP response headers (`Set-Cookie`).
6. The React frontend receives the admin profile data and transitions to the **Admin Dashboard**.
7. Subsequent requests to protected APIs automatically send the cookie.

---

### B. What Password Hashing Means (Bcrypt)
> **Plaintext passwords are NEVER stored in the database.** Storing raw passwords poses a severe security risk if the database is ever compromised.

- **Salting:** Bcrypt generates a random string of characters (a "salt") for every password.
- **One-Way Hashing:** Bcrypt hashes the plaintext password combined with the salt using repeated cryptographic rounds (e.g. `10` rounds).
- Even if two admins use the exact same password, their hashed values in MongoDB will look completely different (e.g. `$2a$10$vY9z1u8...`).
- When logging in, bcrypt hashes the incoming password with the stored salt and compares the hashes. It is mathematically impossible to reverse-engineer the original password from the hash.

---

### C. What is a JWT (JSON Web Token)?
A **JWT** is a compact, URL-safe standard (RFC 7519) for securely transmitting information between client and server as a JSON object.
It consists of three parts separated by dots (`.`):
1. **Header:** Defines token type (`JWT`) and signing algorithm (`HS256`).
2. **Payload:** Stores user claims (e.g. `admin._id`, issue date, expiration date).
3. **Signature:** Created by hashing the Header and Payload with a secret key (`JWT_SECRET`) known only to the backend server.
If an attacker tampers with the token payload, the signature becomes invalid, and Express rejects the request.

---

### D. Why Use HttpOnly Cookies? (XSS Protection)
Many beginner tutorials store JWTs in browser `localStorage`. However, `localStorage` is vulnerable to **Cross-Site Scripting (XSS)** attacks—any malicious script running on the page can steal the token.

- **HttpOnly Flag:** When a cookie has `httpOnly: true`, client-side JavaScript (`document.cookie`) **cannot read or access it**.
- The browser automatically attaches the cookie to outgoing HTTP requests (`credentials: 'include'`).
- This protects administrator sessions from being hijacked.

---

### E. How Protected Routes Work
1. **Frontend Protection:**
   - On page load, `App.jsx` executes `checkAuthAPI()` (`GET /api/auth/me`).
   - If a valid session cookie exists, the dashboard opens.
   - If not, the application renders the `<Login />` component.
2. **Backend API Protection (`authMiddleware.js`):**
   - The `protect` middleware intercepts incoming requests to `/api/students/*`.
   - It reads `req.cookies.token`, decodes the JWT using `process.env.JWT_SECRET`, and fetches the Admin record from MongoDB.
   - If the token is missing or expired, it immediately halts the request and returns **`401 Unauthorized`**.

---

## 🚀 4. How to Run and Test the Project

### Initial Admin Credentials
The database has been pre-seeded with the default administrator account:
- **Email:** `admin@studentsinfo.com`
- **Password:** `Admin@12345`

*(You can also use the convenient **"Fill Credentials"** button on the login screen during demonstrations).*

---

### Step 1: Start the Backend Server
Open your terminal in VS Code:
```bash
cd backend
npm start
```
You will see:
```text
⏳ Connecting to MongoDB Atlas...
✅ [MongoDB Event] Successfully connected to database: "student_db"
📡 [MongoDB Event] Host: ac-pfx5mcw-shard-00-00.cucnrmy.mongodb.net

🚀 Server is running on port 5000
🌐 Health check URL: http://localhost:5000
🔐 Auth Endpoint:     http://localhost:5000/api/auth/login
📚 Student Endpoint:  http://localhost:5000/api/students
```

---

### Step 2: Start the React Frontend
Open a **second terminal** in VS Code:
```bash
cd frontend
npm run dev
```
You will see:
```text
  VITE v5.4.11  ready in 250 ms

  ➜  Local:   http://localhost:5173/
```

---

### Step 3: Open in Browser
Visit **`http://localhost:5173`** in your browser:
1. **Login Test:** Try typing incorrect credentials to see the shake animation and error alert.
2. **Quick Fill:** Click "Fill Credentials" and click **Sign In to Dashboard**.
3. **Dashboard:** You will enter the full Students Info ERP portal.
4. **Refresh:** Press `F5` in your browser. The app remembers your login session via the HttpOnly cookie.
5. **Logout:** Click **Logout** in the top navigation bar or sidebar to securely end the session.

---

### (Optional) How to Create / Re-seed Admin Account
To create an admin account or re-run the seed script:
```bash
cd backend
npm run seed:admin
```
*(The script checks if the account already exists and prevents duplicate entries).*

---

## 🌐 5. Complete API Reference

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Validates admin credentials & issues HttpOnly JWT cookie |
| `GET` | `/api/auth/me` | Protected | Returns profile of currently logged-in admin |
| `POST` | `/api/auth/logout` | Public/Protected | Clears the session cookie |

### Student Management Endpoints (`/api/students`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/students` | **Protected (Admin)** | Retrieve all students (with search) |
| `GET` | `/api/students/stats` | **Protected (Admin)** | Get total count and course statistics |
| `POST` | `/api/students` | **Protected (Admin)** | Register a new student record |
| `GET` | `/api/students/:id` | **Protected (Admin)** | Retrieve a single student by ID |
| `PUT` | `/api/students/:id` | **Protected (Admin)** | Update student details |
| `DELETE`| `/api/students/:id` | **Protected (Admin)** | Delete student record from MongoDB Atlas |

---

## 🎓 6. College Viva Preparation Cheat Sheet

### Q1. What is the difference between Authentication and Authorization?
> **Answer:** 
> - **Authentication (Who are you?):** Verifies the identity of the user using their email and password.
> - **Authorization (What can you do?):** Determines what permissions the authenticated user has (e.g. only administrators can delete or modify student records).

### Q2. Why is storing JWT in an HttpOnly cookie better than LocalStorage?
> **Answer:** LocalStorage is accessible to any JavaScript running on the page. If the application has a Cross-Site Scripting (XSS) vulnerability, an attacker can steal the token. An `HttpOnly` cookie cannot be accessed via JavaScript, providing strong protection against token theft.

### Q3. How does password hashing with salt work?
> **Answer:** A salt is random cryptographic data added to the password before hashing. This ensures that even if two users have the same password, their hashes will be completely unique. It also protects against pre-computed Rainbow Table attacks.

### Q4. What happens when the browser refreshes after logging in?
> **Answer:** In `App.jsx`, a `useEffect` hook triggers `checkAuthAPI()` (`GET /api/auth/me`). The browser automatically sends the stored HttpOnly cookie. The Express backend validates the token and responds with the admin's profile, restoring the session smoothly without requiring the user to re-type their password.
