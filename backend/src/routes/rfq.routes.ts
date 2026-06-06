import { Router } from "express";
import {
  getRfqs,
  createRfq,
  getRfqById,
  updateRfq,
} from "../controllers/rfq.controller";

const router = Router();

router.get("/", getRfqs);
router.post("/", createRfq);
router.get("/:id", getRfqById);
router.put("/:id", updateRfq);

export default router;
