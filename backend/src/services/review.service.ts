import { prisma } from "../lib/prisma.js";
import { AppError } from "./auth.service.js";
import { resolveAvatars } from "./cloudinary.service.js";
import type { CreateReviewInput, CreateAppReviewInput } from "../schemas/review.schema.js";

// ─── Recalculate CompanionProfile rating ──────────────────
// Aggregates all reviews received by the user to compute
// their public rating and reviewCount.

export async function recalculateCompanionRating(companionUserId: string) {
  const stats = await prisma.review.aggregate({
    where: {
      revieweeId: companionUserId,
    },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const newRating = stats._avg.rating ?? 5.0;
  const newCount = stats._count.rating ?? 0;

  // Only update if the user actually has a companion profile
  const cp = await prisma.companionProfile.findUnique({
    where: { userId: companionUserId },
  });

  if (cp) {
    await prisma.companionProfile.update({
      where: { userId: companionUserId },
      data: {
        rating: Math.round(newRating * 10) / 10, // Round to 1 decimal
        reviewCount: newCount,
      },
    });
  }
}

// ─── Review select for serialization ──────────────────────

const reviewSelect = {
  id: true,
  bookingId: true,
  reviewerId: true,
  revieweeId: true,
  rating: true,
  comment: true,
  reviewerRole: true,
  createdAt: true,
  reviewer: {
    select: {
      id: true,
      fullName: true,
      avatar: true,
      city: true,
    },
  },
  reviewee: {
    select: {
      id: true,
      fullName: true,
      avatar: true,
    },
  },
};

// ─── Submit Booking Review ────────────────────────────────

export async function submitReview(reviewerId: string, input: CreateReviewInput) {
  const { bookingId, rating, comment } = input;

  // 1. Get the booking with participants
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      companionProfile: {
        select: { userId: true },
      },
    },
  });

  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  // 2. Only COMPLETED bookings can be reviewed
  if (booking.status !== "COMPLETED") {
    throw new AppError(400, "Only completed bookings can be reviewed");
  }

  // 3. Determine reviewer's role and the reviewee
  const isClient = booking.clientId === reviewerId;
  const isCompanion = booking.companionProfile.userId === reviewerId;

  if (!isClient && !isCompanion) {
    throw new AppError(403, "You are not a participant of this booking");
  }

  const reviewerRole = isClient ? "CLIENT" : "COMPANION";
  const revieweeId = isClient
    ? booking.companionProfile.userId
    : booking.clientId;

  // 4. Check for duplicate review
  const existing = await prisma.review.findUnique({
    where: {
      bookingId_reviewerId: {
        bookingId,
        reviewerId,
      },
    },
  });

  if (existing) {
    throw new AppError(409, "You have already reviewed this booking");
  }

  // 5. Create the review
  const review = await prisma.review.create({
    data: {
      bookingId,
      reviewerId,
      revieweeId,
      rating,
      comment: comment || null,
      reviewerRole,
    },
    select: reviewSelect,
  });

  // 6. Recalculate reviewee rating and review count
  await recalculateCompanionRating(revieweeId);

  // 7. Get the updated companion stats for the response
  let updatedRating: number | null = null;
  let updatedReviewCount: number | null = null;

  const cp = await prisma.companionProfile.findUnique({
    where: { userId: revieweeId },
    select: { rating: true, reviewCount: true },
  });
  if (cp) {
    updatedRating = cp.rating;
    updatedReviewCount = cp.reviewCount;
  }

  return {
    review: resolveAvatars(review),
    updatedRating,
    updatedReviewCount,
  };
}

// ─── Get Reviews for a User (profile page) ────────────────

export async function getReviewsForUser(
  userId: string,
  page: number = 1,
  limit: number = 10
) {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { revieweeId: userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: reviewSelect,
    }),
    prisma.review.count({ where: { revieweeId: userId } }),
  ]);

  return {
    reviews: resolveAvatars(reviews),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Get Reviews for a Booking ────────────────────────────

export async function getReviewsForBooking(bookingId: string) {
  const reviews = await prisma.review.findMany({
    where: { bookingId },
    orderBy: { createdAt: "asc" },
    select: reviewSelect,
  });

  return resolveAvatars(reviews);
}

// ─── Get Review Stats for a User ──────────────────────────

export async function getReviewStats(userId: string) {
  const [aggregate, breakdown] = await Promise.all([
    prisma.review.aggregate({
      where: { revieweeId: userId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.review.groupBy({
      by: ["rating"],
      where: { revieweeId: userId },
      _count: { rating: true },
    }),
  ]);

  // Build breakdown map { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  const breakdownMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of breakdown) {
    breakdownMap[row.rating] = row._count.rating;
  }

  return {
    averageRating: aggregate._avg.rating
      ? Math.round(aggregate._avg.rating * 10) / 10
      : 0,
    totalCount: aggregate._count.rating,
    breakdown: breakdownMap,
  };
}

// ─── Can the User Review This Booking? ────────────────────

export async function canReview(userId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      companionProfile: { select: { userId: true } },
    },
  });

  if (!booking) {
    return { canReview: false, reason: "Booking not found" };
  }

  if (booking.status !== "COMPLETED") {
    return { canReview: false, reason: "Booking is not completed yet" };
  }

  const isParticipant =
    booking.clientId === userId ||
    booking.companionProfile.userId === userId;

  if (!isParticipant) {
    return { canReview: false, reason: "You are not a participant of this booking" };
  }

  const existing = await prisma.review.findUnique({
    where: {
      bookingId_reviewerId: {
        bookingId,
        reviewerId: userId,
      },
    },
  });

  if (existing) {
    return { canReview: false, reason: "You have already reviewed this booking" };
  }

  return { canReview: true };
}

// ═══════════════════════════════════════════════════════════
// App / Platform Reviews
// ═══════════════════════════════════════════════════════════

// ─── Submit or Update App Review ──────────────────────────

export async function submitAppReview(userId: string, input: CreateAppReviewInput) {
  const { rating, comment } = input;

  const review = await prisma.appReview.upsert({
    where: { userId },
    create: {
      userId,
      rating,
      comment,
      isApproved: false, // Requires admin approval
    },
    update: {
      rating,
      comment,
      isApproved: false, // Re-submit clears approval
    },
    select: {
      id: true,
      userId: true,
      rating: true,
      comment: true,
      isApproved: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return review;
}

// ─── List Approved App Reviews (Public) ───────────────────

export async function listApprovedAppReviews(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.appReview.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            city: true,
          },
        },
      },
    }),
    prisma.appReview.count({ where: { isApproved: true } }),
  ]);

  return {
    reviews: resolveAvatars(reviews),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Get Own App Review ───────────────────────────────────

export async function getMyAppReview(userId: string) {
  const review = await prisma.appReview.findUnique({
    where: { userId },
    select: {
      id: true,
      rating: true,
      comment: true,
      isApproved: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return review; // Can be null if user hasn't written one
}
