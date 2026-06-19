import { Router } from "express";
import { authRateLimiter } from "../middlewares/rateLimiter";
import { validate } from "../middlewares/validate";
import { loginSchema, registerSchema } from "../validators/auth.validators";
import * as authController from "../controllers/auth.controller";

const router = Router();

router.post("/register", authRateLimiter, validate(registerSchema), authController.register);
router.post("/login", authRateLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authRateLimiter, authController.refresh);
router.post("/logout", authController.logout);

export default router;
