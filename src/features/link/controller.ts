import { Request, Response, NextFunction } from "express";
import { supabase, uploadIcon } from "../../lib/supabase";
import { AppError } from "../../utils/error";

// Create
export const createLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = (req as any).user.id;
  const { title, url } = req.body;
  const icon = req.file;

  let iconUrl: string | undefined;

  if (icon) {
    iconUrl = await uploadIcon(icon, userId);
  }

  const { error } = await supabase.from("links").insert({
    user_id: userId,
    title,
    url,
    icon: iconUrl,
  });

  if (error) throw new AppError(400, error.message);

  res.status(200).json({
    status: "success",
    message: "Successfully created link",
  });
};

// All Link
export const allLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = (req as any).user.id;
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", userId);

  if (error) throw new AppError(400, error.message);

  res.status(200).json({
    status: "success",
    message: "Successfully fetched links",
    data,
  });
};

// Update Link
export const updateLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const linkId = req.params.id;
  const userId = (req as any).user.id;

  const { title, url } = req.body;
  const icon = req.file;

  if (!title || !url)
    return next(new AppError(400, "Title and url is required"));

  let iconUrl: string | undefined;

  if (icon) {
    iconUrl = await uploadIcon(icon, userId);
  }

  const { error } = await supabase
    .from("links")
    .update({
      title,
      url,
      icon: iconUrl,
    })
    .eq("id", linkId);

  if (error) throw new AppError(400, error.message);

  res.status(200).json({
    status: "success",
    message: "Successfully updated link",
  });
};

// Delete Link
export const deleteLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const linkId = req.params.id;
  const { error } = await supabase
    .from("links")
    .delete()
    .eq("id", linkId);

  if (error) throw new AppError(400, error.message);

  res.status(200).json({
    status: "success",
    message: "Successfully deleted link",
  });
};
