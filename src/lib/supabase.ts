import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { AppError } from "../utils/error";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing Supabase env variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function uploadToSupabase(
  file: Express.Multer.File,
  userId: string,
) {
  const ext = path.extname(file.originalname);
  const fileName = `${userId}-${Date.now()}${ext}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw new AppError(400, error.message);

  const { data } = await supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

// export async function uploadIcon(file: Express.Multer.File, userId: string) {
//   const ext = path.extname(file.originalname);
//   const fileName = `${userId}-${Date.now()}${ext}`;

//   const { error } = await supabase.storage
//     .from("icons")
//     .upload(fileName, file.buffer, {
//       contentType: file.mimetype,
//       upsert: false,
//     });

//   if (error) throw new AppError(400, error.message);

//   const { data } = await supabase.storage.from("icons").getPublicUrl(fileName);

//   return data.publicUrl;
// }
