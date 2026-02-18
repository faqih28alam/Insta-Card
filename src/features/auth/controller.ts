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
  const { email, password, public_link, display_name } = req.body;
  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw new AppError(400, error.message);

  const userId = signUpData.user?.id;

  const formPublicLink = public_link
    .toLowerCase()
    .split(" ")
    .slice(0, 2)
    .join("");

  const { data, error: userError } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      public_link: formPublicLink,
      display_name,
    })
    .select()
    .single();

  if (userError) throw new AppError(400, userError.message);

  const component = [
    { name: "avatar", index: 0 },
    { name: "public_link", index: 1 },
    { name: "display_name", index: 2 },
    { name: "bio", index: 3 },
    { name: "links", index: 4 },
  ];

  const { error: layoutError } = await supabase.from("layout").insert(
    component.map((item) => ({
      public_id: data.id,
      components: item.name,
      order_index: item.index,
    })),
  );

  if (layoutError) throw new AppError(400, layoutError.message);

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
