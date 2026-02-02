import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";
import { AppError } from "../utils/error";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;
  if (!token) return next(new AppError(401, "Not authenticated"));

  const { data, error } = await supabase.auth.getUser(token);
  if (error) return next(new AppError(401, "Invalid token"));

  (req as any).user = data.user;
  next();
};
