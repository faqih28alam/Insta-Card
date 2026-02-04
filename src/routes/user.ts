import { Router } from "express";
import { asyncHandler } from "../middlewares/async";
import { validate } from "../middlewares/validate";
import { protect } from "../middlewares/protect";
import {
  checkUsername,
  deleteUser,
  getProfile,
  updateProfile,
} from "../features/user/controller";
import { updateSchema } from "../validators/user";
import upload from "../lib/multer";

const router = Router();

router.get("/:username", asyncHandler(getProfile));
router.get("/check/:username", protect, asyncHandler(checkUsername));
router.delete("/delete", protect, asyncHandler(deleteUser));

router.patch(
  "/update",
  protect,
  upload.single("avatar"),
  validate(updateSchema),
  asyncHandler(updateProfile),
);

export default router;
