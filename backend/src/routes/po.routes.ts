import { Router } from "express";
import {
  createPurchaseOrder,
  getPurchaseOrders,
} from "../controllers/po.controller";

const router = Router();

router.post("/", createPurchaseOrder);
router.get("/", getPurchaseOrders);

export default router;
