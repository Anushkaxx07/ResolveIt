# Smart Employee Service Desk & Ticket Management Portal

Full-stack enterprise Service Desk and Ticket Management Portal built with React, Node.js (Express), and relational database architecture.

---

## Role-Based Access Control Architecture

The platform provides a 3-role operational model:

1. **Employee**:
   - Submits support requests to IT, HR, Facilities, Finance, and Access Management.
   - Monitors ticket status in real time (Open, Assigned, In Progress, Resolved, Closed).
   - Views official resolution notes upon completion.

2. **Support Staff / Administrator**:
   - Central triage and dispatch authority.
   - Inspects department staff availability (identifying active workloads vs available personnel).
   - Assigns tickets to available specialists or handles tickets directly.
   - Reviews and approves or rejects stage transition requests submitted by department staff.

3. **Department Staff Specialist**:
   - Manages assigned department tickets.
   - Requests stage transitions (In Progress, Pending, Resolved, Closed) with progress notes.
   - Automatically notifies Support Staff for stage change approval.

---

## Accounts for Testing

| Role Category | Email | Password |
|---|---|---|
| **Support Staff / Admin** | `admin@gmail.com` | `admin123` |
| **Department Staff (IT)** | `alex.turner@company.com` | `password123` |
| **Department Staff (IT)** | `david.miller@company.com` | `password123` |
| **Employee** | `anushka@company.com` | `password123` |

---

## Getting Started

### 1. Start the Backend Server
```bash
cd server
npm start
```
The server runs on `http://localhost:5000`.

### 2. Start the Frontend Client
```bash
cd client
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Run the End-to-End Simulation Test
```bash
cd server
npm run test:e2e
```
