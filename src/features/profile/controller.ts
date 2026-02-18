import { Request, Response, NextFunction } from "express";
import { supabase, uploadToSupabase } from "../../lib/supabase";
import { AppError } from "../../utils/error";

// Public Link check
export const checkPublicLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const rawLink = req.params.public_link;

  if (typeof rawLink !== "string")
    throw new AppError(400, "Invalid link parameter");

  const publicLink = rawLink.toLowerCase().trim();

  const { data, error } = await supabase
    .from("profiles")
    .select("public_link")
    .eq("public_link", publicLink)
    .maybeSingle();

  if (error) throw new AppError(400, error.message);

  return res.status(200).json({
    available: !data,
    message: !data ? "link is available" : "link is taken",
  });
};

// Create public link
export const createProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { user_id, public_link, display_name } = req.body;

  const formPublicLink = public_link
    .toLowerCase()
    .split(" ")
    .slice(0, 2)
    .join("");

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      user_id,
      public_link: formPublicLink,
      display_name,
    })
    .select("id")
    .single();

  if (error) throw new AppError(400, error.message);

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

  res.status(200).json({
    status: "success",
    message: "Successfully created public link",
    data,
  });
};

// O Auth create profile
export const oAuthProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { user_id, public_link, display_name } = req.body;

  const formPublicLink = public_link
    .toLowerCase()
    .split(" ")
    .slice(0, 2)
    .join("");

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      user_id,
      public_link: formPublicLink,
      display_name,
    })
    .select("id, public_link, display_name")
    .single();

  if (error) throw new AppError(500, error.message);

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

  res.status(200).json({
    status: "success",
    message: "Successfully fetched profile",
    data,
  });
};

// Read (public page)
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const publicLink = req.params.public_link;
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select()
    .eq("public_link", publicLink)
    .maybeSingle();

  if (profileError) throw new AppError(500, profileError.message);
  if (!profile) throw new AppError(404, "Profile not found");

  const { data: links, error: linksError } = await supabase
    .from("links")
    .select("id, title, url, order_index")
    .eq("public_id", profile.id)
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

// Update profile
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = (req as any).user.id;
  const avatar = req.file;
  const { public_id, public_link, display_name, bio } = req.body;

  let avatarUrl: string | undefined;

  if (avatar) {
    avatarUrl = await uploadToSupabase(avatar, userId);
  }

  const formPublicLink = public_link
    .toLowerCase()
    .split(" ")
    .slice(0, 2)
    .join("");

  const { data, error } = await supabase
    .from("profiles")
    .update({
      public_link: formPublicLink,
      display_name,
      bio,
      avatar_url: avatarUrl,
    })
    .eq("id", public_id)
    .select("avatar_url")
    .maybeSingle();

  if (error) {
    throw new AppError(400, error.message);
  }

  const dataAvatar = data?.avatar_url;

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
  const theme = req.body;

  const { data, error } = await supabase
    .from("profiles")
    .update({
      theme_id: theme.theme_id,

      background_color: theme.background_color,
      text_color: theme.text_color,
      button_color: theme.button_color,

      avatar_radius: theme.avatar_radius,
      button_radius: theme.button_radius,
    })
    .eq("id", theme.public_id)
    .select("theme_id")
    .single();

  if (error) throw new AppError(400, error.message);

  res.status(200).json({
    status: "success",
    message: "Successfully updated theme",
    data,
  });
};

// Reorder layout
export const layout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { public_id, components } = req.body;

  const { data, error } = await supabase.rpc("reorder_components", {
    p_public_id: public_id,
    p_components: components,
  });

  if (error) return next(new AppError(400, error.message));

  res.status(200).json({
    status: "success",
    message: "Components reordered successfully",
    data,
  });
};
