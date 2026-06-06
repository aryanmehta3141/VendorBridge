import "dotenv/config";
import express from "express";
import cors from "cors";
import { mockAuth } from "./middleware/mockAuth";
import vendorRoutes from "./routes/vendor.routes";
import rfqRoutes from "./routes/rfq.routes";
import quotationRoutes from "./routes/quotation.routes";
import approvalRoutes from "./routes/approval.routes";
import poRoutes from "./routes/po.routes";
import invoiceRoutes from "./routes/invoice.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(mockAuth);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "VendorBridge API" });
});

app.use("/vendors", vendorRoutes);
app.use("/rfqs", rfqRoutes);
app.use("/quotations", quotationRoutes);
app.use("/approvals", approvalRoutes);
app.use("/purchase-orders", poRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/dashboard", dashboardRoutes);

app.listen(PORT, () => {
  console.log(`VendorBridge API running on http://localhost:${PORT}`);
});

export default app;
