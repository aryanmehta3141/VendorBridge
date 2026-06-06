import { Router } from "express";
import {
  createQuotation,
  getQuotationsByRfq,
  selectWinner,
} from "../controllers/quotation.controller";

const router = Router();

router.post("/", createQuotation);
router.post("/:id/select-winner", selectWinner);
router.get("/:rfqId", getQuotationsByRfq);

export default router;
