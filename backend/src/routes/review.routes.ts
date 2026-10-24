import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createReviewSchema, createAppReviewSchema } from "../schemas/review.schema.js";
import * as reviewController from "../controllers/review.controller.js";

const router = Router();

// ═══════════════════════════════════════════════════════════
// Booking Reviews
// ═══════════════════════════════════════════════════════════

// POST /api/reviews — Submit a booking review
router.post("/", authenticate, validate(createReviewSchema), reviewController.submitReview);

// GET /api/reviews/user/:userId — Get reviews received by a user
router.get("/user/:userId", authenticate, reviewController.getReviewsForUser);

// GET /api/reviews/booking/:bookingId — Get reviews for a booking
router.get("/booking/:bookingId", authenticate, reviewController.getReviewsForBooking);

// GET /api/reviews/stats/:userId — Get review stats/breakdown for a user
router.get("/stats/:userId", authenticate, reviewController.getReviewStats);

// GET /api/reviews/can-review/:bookingId — Check if user can review a booking
router.get("/can-review/:bookingId", authenticate, reviewController.canReview);

// ═══════════════════════════════════════════════════════════
// App / Platform Reviews
// ═══════════════════════════════════════════════════════════

// POST /api/reviews/app — Submit/update app review (auth required)
router.post("/app", authenticate, validate(createAppReviewSchema), reviewController.submitAppReview);

// GET /api/reviews/app — List approved app reviews (public, NO auth)
router.get("/app", reviewController.listAppReviews);

// GET /api/reviews/app/me — Get own app review (auth required)
router.get("/app/me", authenticate, reviewController.getMyAppReview);

export const reviewRoutes = router;
