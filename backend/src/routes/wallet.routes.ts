import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as walletController from "../controllers/wallet.controller.js";

const router = Router();

// All wallet routes require authentication
router.use(authenticate);

router.get("/", walletController.getWallet);
router.post("/add-money", walletController.addMoney);
router.get("/transactions", walletController.getTransactions);

export const walletRoutes = router;
