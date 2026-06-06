# VendorBridge ERP

Hackathon procurement workflow demo — React + Express + PostgreSQL (Supabase) + Prisma.

## Project Structure

```text
VendorBridge/
├── frontend/     # React + Vite + TypeScript + Tailwind + shadcn/ui
├── backend/      # Express + TypeScript + Prisma
└── README.md
```

## Quick Start

### Backend

```bash
cd backend
cp .env.example .env
# Set DATABASE_URL to your Supabase PostgreSQL connection string
npm install
npm run db:generate
npm run db:push
npm run dev
```

API runs at `http://localhost:3001`

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Demo Flow

1. Login as **Procurement Officer**
2. Create Vendor → Create RFQ → Assign Vendor
3. Login as **Vendor** → Submit Quotation
4. Login as **Procurement Officer** → Compare & Select Winner
5. Login as **Manager** → Approve
6. Generate PO → Generate Invoice
7. View Dashboard Analytics

## Hackathon Auth

No JWT. Select role on login page. Role stored in `localStorage`. Backend uses `mockAuth` middleware with `x-user-role` header.

## Team Split

| Developer | Area |
|-----------|------|
| Dev 1 | Dashboard + Analytics |
| Dev 2 | Vendors + RFQs |
| Dev 3 | Vendor Portal + Quotations |
| Dev 4 | Approval + PO + Invoice |

## API Endpoints (Placeholder)

| Method | Path |
|--------|------|
| GET | `/dashboard` |
| GET/POST/PUT/DELETE | `/vendors` |
| GET/POST | `/rfqs` |
| POST/GET | `/quotations` |
| POST | `/approvals/:id/approve` |
| POST | `/approvals/:id/reject` |
| GET/POST | `/purchase-orders` |
| GET/POST | `/invoices` |
