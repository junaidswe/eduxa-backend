import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { listUsersSchema, updateProfileSchema } from "../validators/user.validators";
import * as userController from "../controllers/user.controller";

const router = Router();

router.get("/me", requireAuth, userController.getMe);
router.patch("/me", requireAuth, validate(updateProfileSchema), userController.updateMe);
router.get("/", requireAuth, requireRole("ADMIN"), validate(listUsersSchema), userController.listUsers);

export default router;
