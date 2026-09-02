# ResolveIT - Enterprise Service Desk & Ticket Management Portal

A full-stack, enterprise service desk and ticket lifecycle management application built with React, Vite, Tailwind CSS, Node.js (Express), and relational SQLite database architecture.

---

## System Overview

ResolveIT streamlines internal workplace requests across 5 core corporate departments:
- **IT Support** (Hardware, Network, VPN, Software Licenses)
- **Human Resources** (Leave Policies, Benefits, Payroll, Taxes)
- **Facilities & Workplace** (Climate Control, Badges, Seating)
- **Finance & Accounts** (Expense Reimbursements, Invoicing)
- **Access Management** (IAM, Cloud Permissions, SSO Privileges)

---

## 3-Role Operational Architecture

The platform operates on a strict 3-role permission and workflow matrix:

### 1. Employee
- Submits support requests to any corporate department.
- Tracks ticket lifecycle progression in real time (Open -> Assigned -> In Progress -> Resolved -> Closed).
- Views official resolution notes and handling technician details.

### 2. Support Staff / Administrator (Dispatcher & Approver)
- Central operations dashboard with cross-department ticket queue inspection.
- Department staff availability view (identifying personnel with 0 active tickets vs busy workloads).
- Assigns tickets to available specialists or self-assigns for direct resolution.
- Receives instant notifications when department staff submit stage transition requests.
- Approves or rejects stage change requests (with optional rejection notes).
- Direct resolve and close capabilities.

### 3. Department Staff Specialist
- Dedicated workspace filtered to tickets in their assigned department.
- Submits stage change requests to Support Staff:
  - `Request In Progress` (Work initiated)
  - `Request Pending` (Waiting for parts or employee response)
  - `Request Resolved` (Fix completed with technical notes)
  - `Request Closed` (Final closure request)
- Posts progress notes and activity history.

---

## Seed Accounts & Test Credentials

| Role Category | Name | Corporate Email | Password | Department |
|---|---|---|---|---|
| **Support Staff / Admin** | Support Admin Lead | `admin@gmail.com` | `admin123` | Executive / Operations |
| **Department Staff** | Alex Turner | `alex.turner@company.com` | `password123` | IT Support |
| **Department Staff** | David Miller | `david.miller@company.com` | `password123` | IT Support |
| **Department Staff** | Jessica Taylor | `jessica.taylor@company.com` | `password123` | HR |
| **Department Staff** | Robert Wilson | `robert.wilson@company.com` | `password123` | Facilities |
| **Department Staff** | Elena Martinez | `elena.martinez@company.com` | `password123` | Finance |
| **Department Staff** | Marcus Vance | `marcus.vance@company.com` | `password123` | Access Management |
| **Employee** | Anushka | `anushka@company.com` | `password123` | Engineering |
| **Employee** | Sarah Williams | `sarah.williams@company.com` | `password123` | Marketing |
| **Employee** | Michael Brown | `michael.brown@company.com` | `password123` | Sales |

---

## Project Structure

```
Servicedesk/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PriorityBadge.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── TicketDetailModal.jsx
│   │   │   ├── TicketForm.jsx
│   │   │   └── TicketResults.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── dashboardController.js
│   │   ├── notificationController.js
│   │   ├── ticketController.js
│   │   └── userController.js
│   ├── database/
│   │   ├── db.js
│   │   ├── manage_db.js
│   │   └── servicedesk.db
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Category.js
│   │   ├── Comment.js
│   │   ├── Notification.js
│   │   ├── SmartClassifier.js
│   │   ├── Ticket.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── ticketRoutes.js
│   │   └── userRoutes.js
│   ├── package.json
│   ├── server.js
│   └── test_end_to_end_flow.js
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18, v20, v22, or v24)
- npm

### 1. Backend Setup & Startup
```bash
cd server
npm install
npm start
```
The backend API starts on `http://localhost:5000`.

### 2. Frontend Setup & Startup
In a separate terminal window:
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` in your web browser.

---

## CLI Utilities & Testing

### Run Automated 7-Step Lifecycle Simulation
Simulates Employee ticket creation -> Support Staff dispatch -> Department Staff stage requests -> Support Staff approval -> Employee resolution verification:
```bash
cd server
npm run test:e2e
```

### Inspect Database Tables via CLI
```bash
cd server
npm run db:view
```

### Reset & Reseed Database
```bash
cd server
npm run db:reset
```

### Build Client for Production
```bash
cd client
npm run build
```

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Authenticate user credentials and role.
- `GET /api/auth/me` - Retrieve authenticated user session details.

### Tickets
- `GET /api/tickets` - Retrieve tickets with optional query filters (`department`, `status`, `priority`, `search`).
- `GET /api/tickets/:id` - Retrieve ticket details along with full activity/comment history.
- `POST /api/tickets` - Create a new support ticket.
- `PUT /api/tickets/:id` - Update status, priority, category, or assigned technician.
- `PUT /api/tickets/:id/request-status` - Department staff submits a stage change request.
- `PUT /api/tickets/:id/approve-status` - Support staff approves the pending stage change.
- `PUT /api/tickets/:id/reject-status` - Support staff rejects the pending stage change.
- `PUT /api/tickets/:id/close` - Resolve and close ticket with official resolution notes.
- `POST /api/tickets/:id/comments` - Append an activity comment or resolution note.

### Personnel & Triage
- `GET /api/tickets/staff/availability` - Retrieve department staff with live workload and active ticket counts.
- `GET /api/categories` - List categories by department.
- `GET /api/users` - List registered users.

### Operations & Metrics
- `GET /api/dashboard/stats` - Cross-department metrics, SLA breakdowns, category distributions, and recent tickets.
- `GET /api/notifications` - Retrieve stage request alerts for Support Staff.
- `PUT /api/notifications/:id/read` - Mark notification as read.
