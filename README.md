# Backend Project – Users & Cards API

## 🚀 Installation & Setup
```bash
git clone <repo-url>
cd backend-project
npm install
npm run dev
```

Create a `.env` file:
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/business_cards
JWT_SECRET=your_secret_here
```

---

## 📌 Tech Stack
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Joi Validation
- CORS, Morgan, dotenv

---

## 🗄 Database
- MongoDB (mongoose)
- Two main collections:
  - `users`
  - `cards`

---

## ⚙️ Middlewares
- **auth** – בדיקת JWT Token
- **validate** – בדיקת Joi Schema
- **requestLogger** – לוג לכל בקשה

---

## 🧑‍💻 Users API

| Method | Endpoint        | Auth       | Description |
|--------|-----------------|-----------|-------------|
| POST   | `/api/users`    | Public    | Register new user |
| POST   | `/api/users/login` | Public | Login, get JWT |
| GET    | `/api/users`    | Admin     | Get all users |
| GET    | `/api/users/:id`| Self/Admin| Get user by id |
| PUT    | `/api/users/:id`| Self/Admin| Update user |
| PATCH  | `/api/users/:id`| Self/Admin| Toggle isBusiness |
| DELETE | `/api/users/:id`| Self/Admin| Delete user |

---

## 💳 Cards API

| Method | Endpoint            | Auth        | Description |
|--------|---------------------|-------------|-------------|
| GET    | `/api/cards`        | Public      | Get all cards |
| GET    | `/api/cards/:id`    | Public      | Get card by id |
| GET    | `/api/cards/my-cards` | User (login) | Get logged-in user’s cards |
| POST   | `/api/cards`        | Business/Admin | Create new card |
| PUT    | `/api/cards/:id`    | Owner/Admin | Update card |
| DELETE | `/api/cards/:id`    | Owner/Admin | Delete card |
| PATCH  | `/api/cards/:id`    | User        | Like/Unlike card |

---

## 🔑 Auth & Roles
- **Public**: כל משתמש אנונימי
- **User**: חייב JWT תקף
- **Business**: משתמש עם `isBusiness: true`
- **Admin**: משתמש עם `isAdmin: true`

---

## 🛠 Development Notes
- All protected routes require **JWT Token** in `Authorization` header.
- Passwords are hashed with **bcryptjs**.
- Input validation is done via **Joi**.

---

## 👨‍🎓 Author
Project developed as part of the **HackerU Full Stack Development** course.
