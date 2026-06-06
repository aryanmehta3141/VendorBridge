import { Router } from "express";
import { getRfqs, createRfq, getRfqById } from "../controllers/rfq.controller";

const router = Router();

router.get("/", getRfqs);
router.post("/", createRfq);
router.get("/:id", getRfqById);

export default router;
