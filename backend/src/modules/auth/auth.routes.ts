/**
 * Route definitions for the authentication module.
 */
import { Router } from "express";
import * as authController from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { authLimiter } from "../../middleware/rateLimit.middleware";
import { registerSchema, loginSchema } from "./auth.dto";

const router = Router();

//       description: User registered successfully

router.post("/register", authLimiter, validate(registerSchema), authController.register);

//       description: Login successful

router.post("/login", authLimiter, validate(loginSchema), authController.login);

//        description: Token refreshed successfully

router.post("/refresh", authController.refresh);

//        description: Logout successful

router.post("/logout", authenticate, authController.logout);

//   description: User profile retrieved

router.get("/me", authenticate, authController.getMe);

export default router;
