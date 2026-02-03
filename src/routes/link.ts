import { Router } from "express";
import { protect } from "../middlewares/protect";
import { asyncHandler } from "../middlewares/async";
import {
  allLink,
  createLink,
  deleteLink,
  updateLink,
} from "../features/link/controller";
import upload from "../lib/multer";
import { validate } from "../middlewares/validate";
import { linkSchema } from "../validators/link";

const router = Router();

router.get("/links", protect, asyncHandler(allLink));
router.delete("/links/:id", protect, asyncHandler(deleteLink));

router.post(
  "/links",
  protect,
  upload.single("icon"),
  validate(linkSchema),
  asyncHandler(createLink),
);

router.patch(
  "/links/:id",
  protect,
  upload.single("icon"),
  validate(linkSchema),
  asyncHandler(updateLink),
);

export default router;
