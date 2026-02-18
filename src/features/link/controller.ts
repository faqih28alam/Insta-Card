import { Request, Response, NextFunction } from "express";
import { supabase } from "../../lib/supabase";
import { AppError } from "../../utils/error";

// Create
export const createLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, title, url } = req.body;

  const { data: lastLink, error: orderError } = await supabase
    .from("links")
    .select("order_index")
    .eq("public_id", id)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (orderError) {
    throw new AppError(400, orderError.message);
  }

  const nextOrder = lastLink ? lastLink.order_index + 1 : 1;

  const { data, error } = await supabase
    .from("links")
    .insert({
      public_id: id,
      title,
      url,
      order_index: nextOrder,
    })
    .select("id, title, url, order_index")
    .single();

  if (error) throw new AppError(400, error.message);

  res.status(200).json({
    status: "success",
    message: "Successfully created link",
    data,
  });
};

// Reorder link
export const reorder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, links } = req.body;

  if (!Array.isArray(links) || links.length === 0)
    throw new AppError(400, "Invalid payload");

  const { data, error } = await supabase.rpc("reorder_links", {
    p_public_id: id,
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
  const { title, url } = req.body;

  const { data, error } = await supabase
    .from("links")
    .update({
      title,
      url,
    })
    .eq("id", linkId)
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
  const { error } = await supabase
    .from("links")
    .delete()
    .eq("id", linkId)

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
