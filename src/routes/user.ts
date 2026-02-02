import { Router } from "express";
import { asyncHandler } from "../middlewares/async";
import { validate } from "../middlewares/validate";
import { protect } from "../middlewares/protect";
import { deleteUser, updateProfile } from "../features/user/controller";
import { updateSchema } from "../validators/user";
import upload from "../lib/multer";

const router = Router();

router.patch(
  "/update",
  protect,
  upload.single("avatar"),
  validate(updateSchema),
  asyncHandler(updateProfile),
);

router.delete("/delete", protect, asyncHandler(deleteUser));

export default router;
