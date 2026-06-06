import { Router } from "express";
import {
  createQuotation,
  getQuotationsByRfq,
} from "../controllers/quotation.controller";

const router = Router();

router.post("/", createQuotation);
router.get("/:rfqId", getQuotationsByRfq);

export default router;
