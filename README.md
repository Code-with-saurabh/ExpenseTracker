# ExpenseTracker

A full-stack MERN personal finance tracker — record income & expenses, set monthly budgets, track savings goals, automate recurring payments, and understand spending with interactive analytics and month-over-month reports.

## Tech Stack

- **Frontend:** React 18 (Vite), Redux Toolkit, Tailwind CSS, Recharts, React Router v6, Axios
- **Backend:** Node.js, Express.js, Mongoose (MongoDB), JWT + bcryptjs, Multer, helmet
- **Design:** Option 8 — Warm White + Espresso + Sage, JetBrains Mono UI, light/dark mode, 8 selectable themes

## Features

- Auth (register / login / profile) with JWT — strict per-user data
- Transactions with search, filters (date, category, type, payment method, amount, favorites), tags & pagination
- Categories, monthly budgets with progress status, savings goals with contributions
- Recurring expenses with automatic posting when due
- Analytics with switchable charts (Bar / Line / Area / Pie / Donut)
- Monthly reports with month-over-month insight & category change %
- Smart de-duplicated notifications (budget warnings, goal milestones, recurring due)
- CSV export, receipt uploads (≤2 MB), favorites
- Amount sanitization on client **and** server, empty/loading states, micro-interactions

## Getting Started

Prerequisites: Node.js ≥ 18, MongoDB running locally (port 27017).

```bash
# Backend
cd server
npm install
cp .env.example .env
npm run seed
npm run dev          # http://localhost:5000

# Frontend (new terminal)
cd client
npm install
npm run dev          # http://localhost:5173
```

## Demo Logins

| Email | Password |
|---|---|
| `demo@example.com` | `password123` |
| `saurabh@gmail.com` | `saurabh123` |

## Project Structure

```
ExpenseTracker/
├── server/     # Express REST API (models, controllers, routes, seed)
├── client/     # React SPA (pages, Redux slices, themes, layout)
└── doc/        # Final project report (HTML/PDF) & screenshots
```

## Report

See `doc/ExpenseTracker-Final-Report.html` / `.pdf` for the full project report.
