import { Router } from "express";
import {
  createQuotation,
  getQuotationsByRfq,
  getQuotationsByVendor,
  selectWinner,
} from "../controllers/quotation.controller";

const router = Router();

router.post("/", createQuotation);
router.post("/:id/select-winner", selectWinner);
router.get("/vendor/:vendorId", getQuotationsByVendor);
router.get("/:rfqId", getQuotationsByRfq);

export default router;
