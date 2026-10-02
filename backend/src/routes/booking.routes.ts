import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as bookingController from "../controllers/booking.controller.js";

const router = Router();

// All booking routes require authentication
router.use(authenticate);

// CRUD
router.post("/", bookingController.createBooking);
router.get("/", bookingController.listBookings);
router.get("/:id", bookingController.getBooking);

// Companion actions
router.patch("/:id/accept", bookingController.acceptBooking);
router.patch("/:id/reject", bookingController.rejectBooking);
router.post("/:id/verify-otp", bookingController.verifyOTP);
router.patch("/:id/end", bookingController.endMeeting);

// Client actions
router.patch("/:id/cancel", bookingController.cancelBooking);

export const bookingRoutes = router;
