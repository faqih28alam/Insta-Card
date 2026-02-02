import { Request, Response, NextFunction } from "express";
import { supabase } from "../../lib/supabase";
import { AppError } from "../../utils/error";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password, username, fullname } = req.body;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        fullname,
      },
    },
  });

  if (error) throw new AppError(400, error.message);

  const token = data.session?.access_token;
  if (!token) throw new AppError(400, "No token found");

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  res.status(200).json({
    status: "success",
    message: "Successfully registered",
    data: data.user,
  });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new AppError(400, error.message);

  const token = data.session?.access_token;
  if (!token) throw new AppError(400, "No token found");

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  res.status(200).json({
    status: "success",
    message: "Successfully logged in",
    data: data.user,
  });
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.status(200).json({
    status: "success",
    message: "Successfully logged out",
  });
};
