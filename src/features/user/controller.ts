import { Request, Response, NextFunction } from "express";
import { supabase, uploadToSupabase } from "../../lib/supabase";
import { AppError } from "../../utils/error";

// Username check
export const checkUsername = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const rawUsername = req.params.username;
  if (typeof rawUsername !== "string")
    throw new AppError(400, "Invalid username parameter");

  const username = rawUsername.toLowerCase().trim();

  if (!/^[a-z0-9_]{3,20}$/.test(username))
    throw new AppError(400, "Invalid username format");

  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .maybeSingle();

  if (error) throw new AppError(400, error.message);

  return res.status(200).json({
    available: !data,
    message: !data ? "Username is available" : "Username is taken",
  });
};

// Create username
export const createProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, username } = req.body;

  const formUsername = username.toLowerCase().split(" ").slice(0, 2).join("");

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id,
      username: formUsername,
    })
    .select("username")
    .single();

  if (error) throw new AppError(400, error.message);

  res.status(200).json({
    status: "success",
    message: "Successfully updated display name",
    data,
  });
};

// O Auth create profile
export const oAuthProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, username, display_name } = req.body;

  const formUsername = username.toLowerCase().split(" ").slice(0, 2).join("");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        id,
        username: formUsername,
        display_name,
      },
      {
        onConflict: "id",
      },
    );

  if (profileError) throw new AppError(500, profileError.message);

  res.status(200).json({
    status: "success",
    message: "Successfully fetched profile",
    data: profile,
  });
};

// Read (public page)
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const username = req.params.username;
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .eq("is_public", true)
    .maybeSingle();

  if (profileError) throw new AppError(500, profileError.message);
  if (!profile) throw new AppError(404, "User not found");

  const { data: links, error: linksError } = await supabase
    .from("links")
    .select("id, title, url, order_index")
    .eq("user_id", profile.id)
    .order("order_index", { ascending: true });

  if (linksError) throw new AppError(500, linksError.message);

  const data = {
    profile,
    links,
  };

  res.status(200).json({
    status: "success",
    message: "Successfully fetched profile",
    data,
  });
};

// Update user
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = (req as any).user.id;
  const avatar = req.file;
  const { username, bio } = req.body;

  let avatarUrl: string | undefined;

  if (avatar) {
    avatarUrl = await uploadToSupabase(avatar, userId);
  }

  const formUsername = username.toLowerCase().trim();
  if (!/^[a-z0-9_]{3,20}$/.test(formUsername)) {
    throw new AppError(400, "Invalid username format");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      username: formUsername,
      bio,
      theme_id: "default",
      avatar_url: avatarUrl,
    })
    .eq("id", userId)
    .select("avatar_url")
    .single();

  if (error) {
    throw new AppError(400, error.message);
  }

  const dataAvatar = data.avatar_url;

  res.status(200).json({
    status: "success",
    message: "Successfully updated profile",
    data: dataAvatar,
  });
};

// Delete user
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = (req as any).user.id;
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) throw new AppError(400, error.message);

  res.status(200).json({
    status: "success",
    message: "Successfully deleted user",
  });
};

// Theme update
export const theme = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = (req as any).user.id;
  const theme = req.body;

  const { data, error } = await supabase
    .from("profiles")
    .update({
      theme_id: theme.theme_id,
      background_color: theme.background_color,
      text_color: theme.text_color,
      button_color: theme.button_color,
    })
    .eq("id", userId)
    .select("theme_id")
    .single();

  if (error) throw new AppError(400, error.message);

  res.status(200).json({
    status: "success",
    message: "Successfully updated theme",
    data,
  });
};
