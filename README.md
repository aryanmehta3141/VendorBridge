# VendorBridge — Enterprise Procurement ERP

A full-stack procurement management platform built for hackathon demo. Covers the complete procure-to-pay workflow: vendor onboarding → RFQ creation → quotation comparison → manager approval → purchase orders → invoicing.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| UI | shadcn/ui, Lucide React, Recharts |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| HTTP | Axios |
| Routing | React Router v7 |

---

## Project Structure

```
VendorBridge/
├── backend/
│   ├── src/
│   │   ├── constants/        # Status enums shared across the app
│   │   ├── controllers/      # Route handlers (vendor, rfq, quotation, approval, po, invoice, dashboard)
│   │   ├── middleware/       # mockAuth — injects demo user on every request
│   │   ├── prisma/           # schema.prisma + migrations
│   │   ├── routes/           # Express routers
│   │   ├── services/         # Business logic layer
│   │   ├── types/            # Express request augmentation
│   │   └── server.ts         # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/       # PageHeader, Loading
    │   │   ├── layout/       # Navbar, Sidebar
    │   │   ├── quotation/    # QuotationTable, QuotationForm
    │   │   └── ui/           # Button (shadcn base)
    │   ├── context/          # AuthContext (mock role system)
    │   ├── pages/            # Dashboard, Vendors, RFQs, Quotations, Approval, PurchaseOrders, Invoices, VendorPortal, Login
    │   ├── routes/           # AppRoutes + RoleRoute guard
    │   ├── services/         # api.ts (axios), quotation.service.ts
    │   ├── types/            # Domain types (Vendor, Rfq, Quotation, PurchaseOrder, Invoice)
    │   └── utils/            # constants.ts, roleConfig.ts
    ├── .env.example
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud)

### 1. Clone the repo

```bash
git clone <repo-url>
cd VendorBridge
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set your database URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/vendorbridge?schema=public"
PORT=3001
```

Install dependencies and run migrations:

```bash
npm install
npm run db:generate
npm run db:push
npm run dev
```

The API will start at **http://localhost:3001**.

### 3. Set up the frontend

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:3001
```

Install and start:

```bash
npm install
npm run dev
```

The app will start at **http://localhost:5173**.

---

## Demo Workflow

The app runs in **Hackathon Mode** — no passwords, role is selected on the login screen and persisted in localStorage.

### Full Procure-to-Pay Flow

| Step | Role | Action |
|---|---|---|
| 1 | Procurement Officer | Create vendor (Vendors page) |
| 2 | Procurement Officer | Create RFQ (RFQs page) |
| 3 | Procurement Officer | Assign vendor to RFQ |
| 4 | Vendor | Open Vendor Portal → Submit quotation |
| 5 | Procurement Officer | Compare quotations → Select winner (Quotations page) |
| 6 | Manager | Review pending approval → Approve or Reject |
| 7 | Procurement Officer | Generate Purchase Order (Purchase Orders page) |
| 8 | Procurement Officer | Generate Invoice (Invoices page) |
| 9 | All | View live KPIs on Dashboard |

---

## Roles & Permissions

| Role | Pages | Capabilities |
|---|---|---|
| **Admin** | All pages | Full read/write access everywhere |
| **Procurement Officer** | Dashboard, Vendors, RFQs, Quotations, Purchase Orders, Invoices | Full procure-to-pay workflow |
| **Vendor** | Vendor Portal | View assigned RFQs, submit quotations, view own quotation status and issued POs |
| **Manager** | Dashboard, Approval | Review pending quotations, approve or reject with remarks |

Unauthorized route access shows a **403 page** and redirects to the role's home.

---

## API Endpoints

All routes are prefixed with `http://localhost:3001`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/vendors` | List all vendors |
| POST | `/vendors` | Create vendor |
| PUT | `/vendors/:id` | Update vendor |
| DELETE | `/vendors/:id` | Delete vendor |
| GET | `/rfqs` | List all RFQs |
| POST | `/rfqs` | Create RFQ |
| GET | `/rfqs/:id` | Get single RFQ |
| PUT | `/rfqs/:id` | Update RFQ / assign vendor |
| POST | `/quotations` | Submit quotation (vendor only) |
| GET | `/quotations/:rfqId` | Get quotations for an RFQ |
| GET | `/quotations/vendor/:vendorId` | Get all quotations for a vendor |
| POST | `/quotations/:id/select-winner` | Select winning quotation |
| POST | `/approvals/:id/approve` | Approve quotation |
| POST | `/approvals/:id/reject` | Reject quotation |
| GET | `/purchase-orders` | List POs (supports `?vendorId=` filter) |
| POST | `/purchase-orders` | Create purchase order |
| GET | `/invoices` | List all invoices |
| POST | `/invoices` | Create invoice (18% GST auto-calculated) |
| GET | `/dashboard` | KPI stats |

---

## Data Model

```
User ──< Rfq (createdBy)
Vendor ──< Rfq (assignedVendor)
Vendor ──< Quotation
Rfq ──< Quotation
Quotation ──1 PurchaseOrder
Vendor ──< PurchaseOrder
PurchaseOrder ──1 Invoice
```

**Status flows:**

- RFQ: `RFQ_CREATED` → `VENDOR_ASSIGNED` → `QUOTATION_RECEIVED` → `WINNER_SELECTED` → `APPROVED/REJECTED` → `PO_CREATED` → `INVOICE_CREATED`
- Quotation: `QUOTATION_SUBMITTED` → `PENDING_APPROVAL` → `APPROVED/REJECTED`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `PORT` | API server port | `3001` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend base URL | `/api` |

---

## Scripts

### Backend

```bash
npm run dev          # Start with hot reload (tsx watch)
npm run build        # Compile TypeScript
npm run start        # Run compiled output
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
```

### Frontend

```bash
npm run dev      # Start Vite dev server
npm run build    # TypeScript check + production build
npm run preview  # Preview production build
npm run lint     # ESLint
```

---

## Key Design Decisions

- **No authentication** — role is mocked via localStorage and injected into every API request as `x-user-role` header. The backend `mockAuth` middleware reads this header.
- **Auto demo user** — if `createdById` on RFQ creation doesn't match a DB user, the backend automatically resolves or creates a demo `PROCUREMENT_OFFICER` user.
- **Vendor data scoping** — the Vendor Portal derives the DB vendor ID from assigned RFQ data, not from the mock auth user ID, keeping the demo flow reliable.
- **Relation includes** — PO and Invoice endpoints return nested vendor and RFQ data so the frontend never displays raw cuid strings.

---

*Built for hackathon · VendorBridge v1.0*
