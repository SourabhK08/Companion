import { Router } from "express";
import { authenticateAdmin } from "../middleware/auth.js";
import {
  login,
  getMe,
  getReviews,
  approveReview,
  rejectReview,
  deleteReview,
} from "../controllers/admin.controller.js";

const router = Router();

// Public login endpoint for admin portal
router.post("/login", login);

// All routes below require Admin authentication
router.use(authenticateAdmin);

router.get("/me", getMe);
router.get("/reviews", getReviews);
router.patch("/reviews/:id/approve", approveReview);
router.patch("/reviews/:id/reject", rejectReview);
router.delete("/reviews/:id", deleteReview);

export { router as adminRoutes };
