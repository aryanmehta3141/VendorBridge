import { Router } from "express";
import {
  approveQuotation,
  rejectQuotation,
} from "../controllers/approval.controller";

const router = Router();

router.post("/:id/approve", approveQuotation);
router.post("/:id/reject", rejectQuotation);

export default router;
