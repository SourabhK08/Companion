import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

// ─── POST /api/users/me/saved/:companionProfileId ─────────

export async function saveCompanion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const companionProfileId = req.params.companionProfileId as string;

    if (!userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (!companionProfileId) {
      res.status(400).json({ success: false, message: "Companion profile ID is required" });
      return;
    }

    // Check if companion profile exists
    const companion = await prisma.companionProfile.findUnique({
      where: { id: companionProfileId }
    });

    if (!companion) {
      res.status(404).json({ success: false, message: "Companion not found" });
      return;
    }

    // Check if already saved
    const existing = await prisma.savedCompanion.findUnique({
      where: {
        userId_companionProfileId: {
          userId,
          companionProfileId
        }
      }
    });

    if (existing) {
      res.status(200).json({ success: true, message: "Companion already saved" });
      return;
    }

    await prisma.savedCompanion.create({
      data: {
        userId,
        companionProfileId
      }
    });

    res.status(201).json({ success: true, message: "Companion saved successfully" });
  } catch (error) {
    console.error("Save companion error:", error);
    res.status(500).json({ success: false, message: "Failed to save companion" });
  }
}

// ─── DELETE /api/users/me/saved/:companionProfileId ───────

export async function unsaveCompanion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const companionProfileId = req.params.companionProfileId as string;

    if (!userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    // Delete the record if it exists
    await prisma.savedCompanion.deleteMany({
      where: {
        userId,
        companionProfileId
      }
    });

    res.status(200).json({ success: true, message: "Companion removed from saved list" });
  } catch (error) {
    console.error("Unsave companion error:", error);
    res.status(500).json({ success: false, message: "Failed to unsave companion" });
  }
}

// ─── GET /api/users/me/saved ──────────────────────────────

export async function getSavedCompanions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const saved = await prisma.savedCompanion.findMany({
      where: { userId },
      include: {
        companionProfile: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                gender: true,
                city: true,
                avatar: true,
                bio: true,
                interests: true,
                languages: true,
                dateOfBirth: true,
                isVerified: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const companions = saved.map(s => s.companionProfile);

    res.status(200).json({ success: true, data: { companions } });
  } catch (error) {
    console.error("Get saved companions error:", error);
    res.status(500).json({ success: false, message: "Failed to get saved companions" });
  }
}
