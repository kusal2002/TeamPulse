# TeamPulse - Weekly Report Generator & Team Dashboard

TeamPulse is a full-stack web application designed for software engineering teams to streamline weekly work reporting, manager review cycles, team analytics, and AI-assisted insights.

---

## ✨ Key Features

### 1. User Authentication & Role-Based Access Control (RBAC)

- **Role-Based Access**:
  - `TEAM_MEMBER`: Create, edit, and submit weekly reports; view own submission history and report review comments.
  - `MANAGER`: Access executive team dashboard, review/approve/request changes on submitted reports, inspect team member profiles, and interact with the AI assistant.
- **Security & Authorization**: JWT token authentication, bcrypt password hashing, NestJS `RolesGuard` middleware, and 100% automated RBAC test coverage.

### 2. Fixed-Structure Personal Weekly Reports

- **Weekly Date Range**: Monday-aligned report week selection.
- **Project Tagging**: Attach reports to active managed projects.
- **Tasks Completed Table**: Task name, priority (High/Medium/Low), planned % vs actual %, status (Done/In Progress/Blocked), time planned vs time spent, and output/deliverable links.
- **Tasks Planned Next Week**: Commitments for upcoming sprint weeks.
- **Blockers & Issues**: Ability to flag key issues per week.
- **Achievements & Highlights**: Ability to flag key sprint highlights.
- **Hours Worked Breakdown**: Track time spent across Development, Testing, Meetings, Code Review, and Documentation.

### 3. Report Review & Correction Workflow

- **Status Lifecycle**: `DRAFT` ➔ `SUBMITTED` ➔ `NEEDS_CORRECTION` ➔ `APPROVED`.
- **Review Actions**: Managers can **Approve** or **Request Changes** with detailed review comments.
- **Report Version History (Section 3 Requirement)**: Preserves previous report versions (`v1`, `v2`, `v3`) alongside submission timestamps and manager review comments during correction cycles.

### 4. Executive Team Dashboard & Visual Insights

- **Summary Metrics**: Total Reports Submitted, Submission Compliance Rate, Open Blockers Count, Needs Correction Count.
- **Recharts Visualizations**:
  - Tasks Completed Trend over time
  - Report Submission Status per team member
  - Workload / Task Distribution by Project
  - Time Spent by Task Type (Development vs Testing vs Meetings)

### 5. 🤖 AI Chat Assistant (OpenRouter / Laguna-S 2.1)

- Powered by OpenRouter (`poolside/laguna-s-2.1:free`).
- Executive team report Q&A assistant with live database context synthesis.
- Rich text markdown rendering support for bold text, headers, lists, code, and tables.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Shadcn UI, Lucide Icons, Recharts, TanStack React Query, React Markdown (Remark GFM).
- **Backend**: Node.js, NestJS, TypeScript, Prisma ORM 7, PostgreSQL (Neon DB Cloud), Passport JWT, Bcrypt, Vitest.
- **Database**: PostgreSQL (Neon Cloud DB with `@prisma/adapter-pg` connection pooling).

---

## 🔑 Pre-Configured Seed Credentials

| Role                   | Email                   | Password       | Description                                                      |
| :--------------------- | :---------------------- | :------------- | :--------------------------------------------------------------- |
| **👑 Manager / Admin** | `manager@teampulse.com` | `Password123!` | Full executive dashboard, report reviews, and team analytics     |
| **🧑‍💻 Team Member**     | `alex@teampulse.com`    | `Password123!` | Client A Portal lead (includes version correction cycle history) |
| **🧑‍💻 Team Member**     | `elena@teampulse.com`   | `Password123!` | Client A Portal developer                                        |
| **🧑‍💻 Team Member**     | `david@teampulse.com`   | `Password123!` | Internal Tooling developer                                       |
| **🧑‍💻 Team Member**     | `maya@teampulse.com`    | `Password123!` | Mobile App R&D developer                                         |

---

## 📋 Setup & Installation Instructions

### 1️⃣ Installing Dependencies

Clone the repository and install Node dependencies for both the backend and frontend services:

```bash
# Clone repository
git clone https://github.com/teampulse/TeamPulse.git
cd TeamPulse

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

---

### 2️⃣ Running the Database & Seeding

TeamPulse connects to **PostgreSQL** (Neon Cloud DB) via **Prisma 7 ORM**.

#### Environment Setup

Verify or create `backend/.env` with your database credentials:

```env
DATABASE_URL="Enter your DATABASE_URL"
JWT_SECRET="Enter your JWT_SECRET"
OPENROUTER_API_KEY="Enter your OPENROUTER_API_KEY"
```

#### Run Database Migration & Seed Dataset

Run the following commands inside the `backend` folder:

```bash
cd backend

# 1. Sync Prisma schema with database tables
npx prisma db push

# 2. Seed database with 5 users, 4 projects, and 16 reports across 4 weeks
npm run db:seed
```

---

### 3️⃣ Running the Backend

Start the NestJS backend server in development mode:

```bash
cd backend
npm run start:dev
```

The NestJS server will start listening at **`http://localhost:3000`**.

#### Running Backend Tests (Automated RBAC Tests)

```bash
# Run Vitest test suite (11 test files, 33 tests)
npm run test
```

---

### 4️⃣ Running the Frontend

Start the Vite React frontend development server:

```bash
cd frontend
npm run dev
```

The frontend web application will start at **`http://localhost:5173`**.

---

## 🌐 Production Deployment

- **Frontend Deployment (Netlify)**:
  - Build command: `npm run build`
  - Publish directory: `frontend/dist`
  - Base directory: `frontend`
  - Environment variable: `VITE_API_URL=https://<your-backend-domain>`
  - Included Netlify SPA routing configs: [`public/_redirects`](file:///d:/Projects/teampulse/frontend/public/_redirects) and [`netlify.toml`](file:///d:/Projects/teampulse/frontend/netlify.toml).

- **Backend Deployment (Wasmer / Cloud)**:
  - Included Wasmer package manifest: [`wasmer.toml`](file:///d:/Projects/teampulse/backend/wasmer.toml).
