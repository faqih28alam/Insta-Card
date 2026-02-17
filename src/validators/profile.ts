import Joi from "joi";

const idField = Joi.string().required();
const publicLinkField = Joi.string().min(3).max(100).optional();
const displayNameField = Joi.string().min(3).max(100).optional();
const bioField = Joi.string().min(3).max(300).optional();

export const updateSchema = Joi.object({
  public_id: idField,
  public_link: publicLinkField,
  display_name: displayNameField,
  bio: bioField,
});

export const publicLinkSchema = Joi.object({
  public_link: publicLinkField,
});

export const profileSchema = Joi.object({
  user_id: idField,
  public_link: publicLinkField,
  display_name: displayNameField,
});

export const oAuthSchema = Joi.object({
  user_id: idField,
  public_link: publicLinkField,
  display_name: displayNameField,
});

export const themeSchema = Joi.object({
  public_id: idField,
  theme_id: idField,
  background_color: Joi.string().optional(),
  text_color: Joi.string().optional(),
  button_color: Joi.string().optional(),
});
