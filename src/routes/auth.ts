import { Router } from "express";
import { asyncHandler } from "../middlewares/async";
import { validate } from "../middlewares/validate";
import { protect } from "../middlewares/protect";
import { loginSchema, registerSchema } from "../validators/auth";
import { login, logout, register } from "../features/auth/controller";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));
router.post("/logout", protect, asyncHandler(logout));

export default router;
