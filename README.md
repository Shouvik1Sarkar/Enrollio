# Enrollio — Coaching Center Management System

A production-ready REST API backend for managing a coaching center — handling students, teachers, batches, courses, fees, salaries, exams, marks, and consultations.

Built with **Node.js + Express + MongoDB + Redis**.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Role System](#role-system)
- [API Reference](#api-reference)
- [Future Improvements](#future-improvements)

---

## Features

- **Multi-role auth** — Super Admin, Admin, Teacher, Student with JWT + refresh tokens
- **OTP email verification** via Nodemailer + Mailgen
- **Student management** — profile setup, board/stream/standard tracking, enrollment
- **Batch & course management** — multi-subject batches with scheduling and capacity
- **Fee management** — per-batch monthly fees, embedded fee history, paid/pending/overdue tracking
- **Salary management** — fixed monthly salary for teachers and admins, full history
- **Exam & marks** — per-batch class tests with auto pass/fail calculation
- **Consultation booking** — public (no auth) guest inquiry system
- **Redis caching** — read-through cache with cache invalidation on writes
- **Rate limiting & bot protection** — via Arcjet
- **Security** — Helmet, CORS whitelist, bcrypt, httpOnly cookies
- **Structured logging** — via Pino

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Database | MongoDB + Mongoose |
| Cache | Redis |
| Auth | JWT (access + refresh tokens) |
| Email | Nodemailer + Mailgen |
| Security | Helmet, Arcjet, bcrypt |
| Logging | Pino + pino-pretty |
| File uploads | Multer + Cloudinary |

---

## Architecture

```
src/
├── controller/       # Business logic per module
├── middleware/        # auth, roles, rate limiting, error handler
├── models/            # Mongoose schemas
├── routes/            # Express routers
└── utils/             # ApiError, ApiResponse, asyncHandler, logger
config/                # DB, Redis, Arcjet, env
index.js               # Entry point
```

### Key design decisions

- **Embedded fee history** inside Student document — fees are per-student per-batch per-month, queried only per student so embedding is appropriate
- **Separate Salary collection** — salary is queried across all staff at once (dashboard view), so a separate collection is needed
- **Role-based middleware** — `authorizeRoles()` on routes, controllers stay clean
- **Redis cache-aside pattern** — read from cache, fall back to DB, invalidate on write

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or Upstash)

### Installation

```bash
git clone https://github.com/yourusername/enrollio.git
cd enrollio
npm install
```

### Create `.env` file

```bash
cp .env.example .env
# fill in your values
```

### Seed the first superadmin

```bash
node scripts/seedOwner.js
```

### Run the server

```bash
# development
npm run dev

# production
npm start
```

Server runs on `http://localhost:8000`

---

## Environment Variables

```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/enrollio

JWT_SECRET=your_jwt_secret
JWT_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=7d

REDIS_URL=redis://localhost:6379

MAILTRAP_SMTP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_SMTP_PORT=587
MAILTRAP_SMTP_USER=your_user
MAILTRAP_SMTP_PASS=your_pass

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ARCJET_KEY=your_arcjet_key

BASE_URL=http://localhost:8000
```

---

## Role System

| Role | Description |
|---|---|
| `super_admin` | Owner — full access, manages admins |
| `admin` | Staff — manages students, fees, batches |
| `teacher` | Manages own batches, marks attendance, enters marks |
| `student` | Read-only — views own profile, fees, marks |

---

## API Reference

Base URL: `http://localhost:8000/api/v1`

### Auth — `/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/first-user` | None | Create the first superadmin (one-time) |
| POST | `/verify` | None | Verify email with OTP |
| POST | `/verification-token` | None | Resend OTP |
| POST | `/log-in` | None | Login — returns access + refresh token |
| POST | `/log-out` | Required | Logout |
| POST | `/create-user` | Admin+ | Create a new user account |
| POST | `/forgot-password` | None | Send password reset OTP |
| POST | `/set-forget-password` | None | Reset password with OTP |
| POST | `/change-password` | Required | Change own password |
| POST | `/refresh-token` | None | Get new access token |

---

### Users — `/user`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/me` | Admin, Teacher | Get own profile |
| PATCH | `/update` | Admin, Teacher | Update own profile |
| GET | `/all-users` | Admin+ | List all users |
| GET | `/username` | Admin+ | Find user by username |
| GET | `/:user_id` | Admin+ | Get user by ID |
| PATCH | `/role/:user_id` | Admin+ | Update user role |
| DELETE | `/delete/:user_id` | Super Admin | Delete a user |

---

### Students — `/student`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/getme` | Student | Get own student profile |
| GET | `/my-fees` | Student | View own fee history |
| GET | `/my-marks` | Student | View own marks |
| POST | `/setup/:userId` | Admin+ | Create student profile for a user |
| GET | `/all` | Admin+ | List all students |
| GET | `/:student_id` | Required | Get student by ID |
| PATCH | `/:student_id` | Admin+ | Update student profile |
| POST | `/:student_id/enroll` | Admin+ | Enroll student in a batch |
| DELETE | `/:student_id/remove/:batch_id` | Admin+ | Remove student from batch |

---

### Teachers — `/teacher`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/setup/:userId` | Required | Create teacher profile |
| POST | `/update/:userId` | Admin+ | Update teacher profile |
| PATCH | `/update/salary/:teacher_id` | Admin+ | Set teacher base salary |
| GET | `/my-batches` | Required | Teacher sees own batches |
| GET | `/:teacher_id` | Required | Get teacher by ID |
| PATCH | `/:teacher_id/assign-batch` | Admin+ | Assign teacher to batch |
| DELETE | `/delete/:teacher_id` | Admin+ | Delete teacher profile |

---

### Courses — `/course`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/create-course` | Super Admin | Create a course |
| GET | `/all` | Admin+ | List all courses |
| GET | `/:course_id` | Required | Get course by ID |
| PATCH | `/:course_id` | Super Admin | Update course |
| DELETE | `/delete/:course_id` | Super Admin | Delete course |

---

### Batches — `/batch`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/create` | Admin+ | Create a batch |
| GET | `/all` | Admin+ | List all batches |
| GET | `/:batch_id` | Required | Get batch by ID |
| PATCH | `/:batch_id` | Admin+ | Update batch |
| DELETE | `/:batch_id` | Admin+ | Delete batch |
| GET | `/all/:batch_id` | Admin+ | Get all students in a batch |
| DELETE | `/:batch_id/remove/:student_id` | Admin+ | Remove student from batch |
| DELETE | `/teacher/:batch_id/remove/:teacher_id` | Admin+ | Remove teacher from batch |

---

### Fees — `/fees`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/:student_id/fees/add` | Admin+ | Generate fee records for all batches |
| POST | `/:student_id/fees/add/:batch_id` | Admin+ | Generate fee for one batch |
| GET | `/:student_id/fees` | Admin+ | Get full fee history |
| GET | `/:student_id/fees/:fee_id` | Admin+ | Get one fee record |
| GET | `/balance/:student_id` | Admin+ | Get paid/pending/overdue summary |
| PATCH | `/:student_id/pay` | Admin+ | Mark ALL fees as paid |
| PATCH | `/:student_id/fees/:fee_id/pay` | Admin+ | Mark one fee as paid |
| DELETE | `/delete/:student_id/fees/:fee_id` | Admin+ | Delete a fee record |

**Fee record object:**
```json
{
  "batch": "batch_id",
  "amount": 1500,
  "month": "2026-05",
  "dueDate": "2026-05-10",
  "status": "pending | paid | overdue",
  "paidAt": null,
  "collectedBy": null,
  "note": null
}
```

---

### Salary — `/salary`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/create-salary/:user_id` | Admin+ | Generate monthly salary record |
| POST | `/paid/:user_id` | Admin+ | Mark salary as paid |
| GET | `/paid/:user_id` | Admin+ | Get salary history for a user |
| GET | `/all` | Admin+ | Get all salary records |
| GET | `/my-salary` | Required | Get own salary (teacher/admin) |
| DELETE | `/:salary_id` | Super Admin | Delete a salary record |

---

### Exams — `/exam`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/create` | Admin+ | Create an exam for a batch |
| GET | `/get/:exam_id` | Admin+ | Get exam by ID (cached) |
| GET | `/batch/:batch_id` | Admin+ | Get all exams for a batch |
| PATCH | `/update/:exam_id` | Admin+ | Update exam details |
| DELETE | `/delete/:exam_id` | Admin+ | Delete exam + all its marks |

**Request body for create:**
```json
{
  "batch": "Batch Name",
  "title": "Class Test 1",
  "date": "2026-05-25",
  "totalMarks": 50,
  "passingMarks": 20
}
```

---

### Marks — `/marks`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/create/:exam_id/:batch_id` | Admin+ | Enter marks for a student |
| GET | `/all/:exam_id` | Admin+ | Get all results for an exam |
| GET | `/student/:student_id` | Admin+ | Get all marks for a student |
| GET | `/me` | Student | Get own marks |
| GET | `/:marks_id` | Admin+ | Get one mark record |
| PATCH | `/update/:marks_id/:student_id` | Admin+ | Update a mark |
| DELETE | `/delete/:marks_id` | Admin+ | Delete a mark |

---

### Consultation — `/consultation`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/book-consultation` | **None** | Guest books a consultation |
| GET | `/all-consultation` | Admin+ | List all consultations |
| GET | `/get/:consultation_id` | Admin+ | Get one consultation |
| POST | `/mark-consultation/:consultation_id` | Admin+ | Update consultation status |
| DELETE | `/delete-consultation/:consultation_id` | Admin+ | Delete consultation |

**Request body for booking (public):**
```json
{
  "name": "Rahul Sharma",
  "phone": "9876543210",
  "email": "rahul@gmail.com",
  "message": "Interested in Class 11 Physics"
}
```

---

## Future Improvements

### In progress
- [ ] Attendance system — mark present/absent/late per student per session
- [ ] Cron jobs — auto-generate monthly fee records and salary records on 1st of every month

### Planned
- [ ] Input validation — express-validator on all routes
- [ ] Pagination — `?page=1&limit=10` on all list endpoints
- [ ] Search & filters — filter students by board, stream, standard
- [ ] Remarks system — teacher adds remarks per student per month
- [ ] Notification system — email alerts for fee due, new batch, exam results
- [ ] Guest subscriber — email signup for course/batch updates
- [ ] Soft delete — deactivate users instead of hard delete
- [ ] Student self-service — request batch change, view timetable
- [ ] Salary by month filter — `GET /salary/month/:month`

### Performance
- [ ] Index optimization on heavily queried fields
- [ ] Aggregate pipelines for dashboard analytics
- [ ] Response compression (compression middleware)

### Testing
- [ ] Unit tests — Jest
- [ ] Integration tests — Supertest
- [ ] Test coverage for auth flow, role guards, fee calculations

### DevOps
- [ ] Dockerize the application
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Deploy to Railway / Render
- [ ] Environment-based config (dev / staging / prod)

---

## License

ISC