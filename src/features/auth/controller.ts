import { Request, Response, NextFunction } from "express";
import { supabase } from "../../lib/supabase";
import { AppError } from "../../utils/error";

/**
 * NOTE:
 * Supabase authentication is still enforced for core backend logic.
 * This controller exists solely to control access to API documentation
 * (e.g. Swagger / OpenAPI) during development and testing.
 */

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password, username, fullname } = req.body;
  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw new AppError(400, error.message);

  const userId = signUpData.user?.id;

  const { data, error: userError } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      username,
      display_name: fullname,
      theme_id: "default",
    })
    .select("*")
    .single();

  if (userError) throw new AppError(400, userError.message);

  res.status(201).json({
    status: "success",
    message: "Successfully registered",
    data,
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
