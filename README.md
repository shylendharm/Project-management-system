# Project Management System

A full-stack project management application built with **React**, **Node.js**, **Express**, and **PostgreSQL** (using **Prisma ORM**). This system is designed to help teams and individuals efficiently manage their projects and tasks, track progress, and monitor activity through comprehensive dashboards.

## Features

- **Authentication:** Secure JWT-based registration and login, including Role-Based Access Control (RBAC).
- **Project Management:** Create, view, update, and track projects with varying statuses (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`).
- **Task Management:** Assign tasks to specific projects, set due dates, prioritize (`LOW`, `MEDIUM`, `HIGH`), and track statuses.
- **Smart Dashboards:** Real-time metrics tracking the number of tasks completed, projects in progress, and upcoming deadlines.
- **Notification System:** In-app notifications to keep users updated on important system events or deadlines.
- **Admin Control Panel:** Dedicated admin views to monitor system usage, manage users, and review global audit logs.
- **Automated Testing & CI/CD:** Fully covered backend unit and integration tests (Jest + Supertest) and frontend unit tests (Vitest + React Testing Library). GitHub Actions CI automatically tests and builds the application on every push.

## Tech Stack

### Frontend
- **React 18** (Vite)
- **React Router v6** for client-side routing
- **React Hook Form** + **Zod** for form validation
- **Vanilla CSS** with a robust custom minimalist design system (Variables, Flexbox/Grid)
- **Lucide React** for icons
- **Vitest** & **React Testing Library** for testing

### Backend
- **Node.js** & **Express**
- **Prisma ORM** for database interaction
- **PostgreSQL** as the primary relational database
- **JWT (JSON Web Tokens)** for authentication
- **Express Rate Limit** and **Helmet** for security and stability
- **Jest** & **Supertest** for unit and integration testing

## Getting Started

### Prerequisites
- Node.js (v20+)
- PostgreSQL (v14+)
- npm or yarn

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shylendharm/Project-management-system.git
   cd Project-management-system
   ```

2. **Install Root Dependencies:**
   ```bash
   npm install
   ```

3. **Install Frontend & Backend Dependencies:**
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

4. **Environment Variables:**
   - In the `backend` directory, duplicate `.env.example` as `.env` and fill in your variables:
     ```env
     PORT=5000
     DATABASE_URL="postgresql://user:password@localhost:5432/project_management"
     JWT_SECRET="your_super_secret_jwt_key"
     JWT_EXPIRES_IN="1d"
     NODE_ENV="development"
     ```
   - In the `frontend` directory, ensure your `.env` points to your backend URL:
     ```env
     VITE_API_URL=http://localhost:5000/api
     ```

5. **Database Migration:**
   Ensure PostgreSQL is running, then apply the Prisma schema:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma generate
   ```

6. **Start the Application Locally:**
   - **Backend:** `npm run dev` (from `backend/` directory)
   - **Frontend:** `npm run dev` (from `frontend/` directory)

   The frontend will run at `http://localhost:3000` and the backend at `http://localhost:5000`.

## Testing

The project includes a robust test suite that runs automatically via GitHub Actions CI pipeline on every push to the `main` branch.

To run tests locally:
- **Backend:** `cd backend && npm test`
- **Frontend:** `cd frontend && npm test`

## Documentation

Detailed technical documentation can be found in the `docs/` folder:

- [API Documentation](docs/api-documentation.md)
- [Database Schema](docs/database-schema.md)
- [ER Diagram](docs/er-diagram.md)

## License
ISC
