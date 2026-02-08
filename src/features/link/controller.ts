import { Request, Response, NextFunction } from "express";
import { supabase } from "../../lib/supabase";
import { AppError } from "../../utils/error";

// Create
export const createLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = (req as any).user.id;
  const { title, url } = req.body;

  const { data, error } = await supabase
    .from("links")
    .insert({
      user_id: userId,
      title,
      url,
    })
    .select("id, title, url")
    .single();

  if (error) throw new AppError(400, error.message);

  res.status(200).json({
    status: "success",
    message: "Successfully created link",
    data,
  });
};

// All Link
// export const allLink = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const userId = (req as any).user.id;
//   const { data, error } = await supabase
//     .from("links")
//     .select("id, title, url, order_index")
//     .eq("user_id", userId)
//     .order("order_index", { ascending: true });

//   if (error) throw new AppError(400, error.message);

//   res.status(200).json({
//     status: "success",
//     message: "Successfully fetched links",
//     data,
//   });
// };

// Reorder link
export const reorder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = (req as any).user.id;
  const { links } = req.body;

  if (!Array.isArray(links) || links.length === 0)
    throw new AppError(400, "Invalid payload");

  const { data, error } = await supabase.rpc("reorder_links", {
    p_user_id: userId,
    p_links: links,
  });

  if (error) return next(new AppError(400, error.message));

  res.status(200).json({
    status: "success",
    message: "Links reordered successfully",
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

  if (!title || !url) throw new AppError(400, "Title and url is required");

  const { data, error } = await supabase
    .from("links")
    .update({
      title,
      url,
    })
    .eq("id", linkId)
    .eq("user_id", userId)
    .select("id, title, url, order_index")
    .single();

  if (error) throw new AppError(400, error.message);

  res.status(200).json({
    status: "success",
    message: "Successfully updated link",
    data,
  });
};

// Delete Link
export const deleteLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const linkId = req.params.id;
  const userId = (req as any).user.id;
  const { error } = await supabase
    .from("links")
    .delete()
    .eq("id", linkId)
    .eq("user_id", userId);

  if (error) throw new AppError(400, error.message);

  res.status(200).json({
    status: "success",
    message: "Successfully deleted link",
  });
};

// Link analitik
export const linkClicks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const linkId = Number(req.params.id);
  if (isNaN(linkId)) throw new AppError(400, "Invalid link ID");

  const { data, error } = await supabase
    .from("link_clicks")
    .insert({ link_id: linkId, ip: req.ip })
    .select("id")
    .single();

  if (error) throw new AppError(400, error.message);

  res.status(200).json({
    status: "success",
    message: "Successfully recorded click",
    data,
  });
};
