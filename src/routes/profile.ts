import { Router } from "express";
import { asyncHandler } from "../middlewares/async";
import { validate } from "../middlewares/validate";
import { protect } from "../middlewares/protect";
import {
  checkPublicLink,
  createProfile,
  deleteUser,
  getProfile,
  layout,
  oAuthProfile,
  theme,
  updateProfile,
} from "../features/profile/controller";
import {
  oAuthSchema,
  themeSchema,
  updateSchema,
  profileSchema,
  layoutSchema,
} from "../validators/profile";
import upload from "../lib/multer";

const router = Router();

router.get("/:public_link", asyncHandler(getProfile));
router.get("/check/:public_link", asyncHandler(checkPublicLink));
router.post("/create", validate(profileSchema), asyncHandler(createProfile));
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
router.post("/layout", protect, validate(layoutSchema), asyncHandler(layout));

export default router;
