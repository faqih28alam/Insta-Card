import { Request, Response, NextFunction } from "express";
import { supabase, uploadToSupabase } from "../../lib/supabase";
import { AppError } from "../../utils/error";

// Create OK
// Read OK

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = (req as any).user.id;
  const avatar = req.file;
  const { username, theme, bio } = req.body;

  let avatarUrl: string | undefined;

  if (avatar) {
    avatarUrl = await uploadToSupabase(avatar, userId);
  }

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...(username && { username }),
      ...(theme && { theme }),
      ...(bio && { bio }),
      ...(avatarUrl && { avatar: avatarUrl }),
    },
  });

  if (error) {
    throw new AppError(400, error.message);
  }

  const dataAvatar = data.user.user_metadata.avatar;

  res.status(200).json({
    status: "success",
    message: "Successfully updated profile",
    data: dataAvatar,
  });
};

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
