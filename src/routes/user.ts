import { Router } from "express";
import { asyncHandler } from "../middlewares/async";
import { validate } from "../middlewares/validate";
import { protect } from "../middlewares/protect";
import {
  checkUsername,
  createProfile,
  deleteUser,
  getProfile,
  oAuthProfile,
  theme,
  updateProfile,
} from "../features/user/controller";
import {
  oAuthSchema,
  themeSchema,
  updateSchema,
  usernameSchema,
} from "../validators/user";
import upload from "../lib/multer";

const router = Router();

router.get("/:username", asyncHandler(getProfile));
router.get("/check/:username", asyncHandler(checkUsername));
router.post("/create", validate(usernameSchema), asyncHandler(createProfile));
router.post("/oauth", validate(oAuthSchema), asyncHandler(oAuthProfile));
router.delete("/delete", protect, asyncHandler(deleteUser));

router.patch(
  "/update",
  protect,
  upload.single("avatar"),
  validate(updateSchema),
  asyncHandler(updateProfile),
);

router.patch("/theme", protect, validate(themeSchema), asyncHandler(theme));

export default router;
