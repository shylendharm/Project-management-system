# Deployment Guide

Deploying a modern full-stack application involves three main steps: setting up your database, deploying the backend API, and deploying the frontend client. 

This guide outlines the easiest and most popular platforms (often free or very cheap) for deploying a React + Node.js + PostgreSQL stack.

---

## 1. Database Deployment (PostgreSQL)
*Recommended Platforms: [Supabase](https://supabase.com/), [Render](https://render.com/), or [Neon](https://neon.tech/)*

Instead of hosting a database yourself, it is highly recommended to use a managed service.

**Steps using Supabase (Free Tier):**
1. Create an account on Supabase and start a new Project.
2. Provide a secure database password and wait for the database to provision.
3. Once ready, go to **Project Settings -> Database**.
4. Scroll down to **Connection string** -> **URI** mode.
5. Copy your connection string. It will look like this:
   `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

---

## 2. Backend Deployment (Node.js + Express)
*Recommended Platforms: [Render](https://render.com/), [Railway](https://railway.app/), or [Heroku](https://heroku.com/)*

Render is highly recommended because it offers a free tier for web services and integrates seamlessly with GitHub.

**Steps using Render:**
1. Create an account on Render and click **New + -> Web Service**.
2. Connect your GitHub account and select your repository (`Project-management-system`).
3. Fill in the following deployment settings:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
     *(This installs dependencies, builds the Prisma client, and applies your database schema to the live database).*
   - **Start Command:** `npm start` (or `node src/server.js`)
4. Expand the **Advanced** section and add your **Environment Variables**:
   - `DATABASE_URL` : Paste the connection string from Supabase (Step 1).
   - `JWT_SECRET` : Create a strong, random string (e.g., `my_super_secret_jwt_key_in_production`).
   - `JWT_EXPIRES_IN` : `1d` (or whatever you prefer).
   - `NODE_ENV` : `production`
5. Click **Create Web Service**. 
6. Wait for the build to finish. Once live, Render will give you a public URL (e.g., `https://pms-backend.onrender.com`). **Save this URL.**

---

## 3. Frontend Deployment (React + Vite)
*Recommended Platforms: [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/)*

Vercel is the creator of Next.js and has best-in-class support for Vite/React applications.

**Steps using Vercel:**
1. Create a free account on Vercel and click **Add New -> Project**.
2. Import your GitHub repository.
3. Configure the project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Edit this and select `frontend`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Expand the **Environment Variables** section and add:
   - `VITE_API_URL` : Paste your deployed backend URL from Step 2 (e.g., `https://pms-backend.onrender.com/api`).
5. Click **Deploy**.
6. Once completed, Vercel will give you a live public URL for your frontend application.

---

## Post-Deployment Checklist

- **Test Authentication:** Go to your new Vercel URL, register a new account, and log in.
- **Test Database:** Create a new project and task to verify that the frontend communicates with the backend, and the backend writes to your live PostgreSQL database successfully.
- **Update CORS (If necessary):** If your frontend gets blocked by CORS errors, ensure your backend's `cors` configuration in `server.js` allows your exact Vercel URL.
