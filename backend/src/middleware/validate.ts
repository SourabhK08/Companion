import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

/**
 * Middleware factory that validates request body against a Zod schema.
 *
 * Usage:
 *   router.post("/register", validate(registerSchema), controller.register);
 *
 * On validation failure, responds with 400 and structured error messages.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.flatten();
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.fieldErrors,
      });
      return;
    }

    // Replace body with parsed (cleaned/transformed) data
    req.body = result.data;
    next();
  };
}
