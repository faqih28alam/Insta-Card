import { Router } from "express";
import { protect } from "../middlewares/protect";
import { asyncHandler } from "../middlewares/async";
import {
  allLink,
  createLink,
  deleteLink,
  linkClicks,
  reorder,
  updateLink,
} from "../features/link/controller";
import { validate } from "../middlewares/validate";
import { linkSchema, orderSchema } from "../validators/link";

const router = Router();

router.get("/links", protect, asyncHandler(allLink));
router.post("/links/:id/click", protect, asyncHandler(linkClicks));
router.post("/links", protect, validate(linkSchema), asyncHandler(createLink));

router.post(
  "/links/reorder",
  protect,
  validate(orderSchema),
  asyncHandler(reorder),
);

router.patch(
  "/links/:id",
  protect,
  validate(linkSchema),
  asyncHandler(updateLink),
);

router.delete("/links/:id", protect, asyncHandler(deleteLink));

export default router;
