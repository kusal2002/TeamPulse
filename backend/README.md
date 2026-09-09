# TeamPulse Backend API (NestJS + Prisma 7 + PostgreSQL)

The backend service for **TeamPulse** - Weekly Report Generator & Team Dashboard.

---

## 🛠 Tech Stack

- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL (Neon DB Cloud)
- **ORM**: Prisma 7 (`@prisma/adapter-pg` connection pooling)
- **Auth**: Passport JWT, Bcrypt
- **LLM AI**: OpenRouter (`poolside/laguna-s-2.1:free`)
- **Testing**: Vitest (11 test files, 33 unit/integration tests)

---

## 📋 Quick Setup Instructions

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Environment Variables (`.env`)

Create or verify `.env` file in `backend/`:

```env
DATABASE_URL="Enter your DATABASE_URL"
JWT_SECRET="Enter your JWT_SECRET"
OPENROUTER_API_KEY="Enter your OPENROUTER_API_KEY"
```

### 3️⃣ Run Database Setup & Seeding

```bash
# Push schema tables to Neon PostgreSQL
npx prisma db push

# Seed 5 users, 4 projects, and 16 reports across 4 weeks
npm run db:seed
```

### 4️⃣ Start Backend Server

```bash
npm run start:dev
```

Server runs at: `http://localhost:3000`

### 5️⃣ Run Test Suite

```bash
# Run Vitest test suite
npm run test
```
