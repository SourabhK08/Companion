import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { updateMeSchema } from "../schemas/user.schema.js";
import { updateMe } from "../services/user.service.js";

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const validatedData = updateMeSchema.parse(req.body);

    const updatedUser = await updateMe(userId, validatedData);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: JSON.parse(error.message),
      });
    }
    const message = error instanceof Error ? error.message : "Failed to update profile";
    const status = (error as any).statusCode || 500;
    res.status(status).json({
      success: false,
      message,
    });
  }
}
