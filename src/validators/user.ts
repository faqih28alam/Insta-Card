import Joi from "joi";

const idField = Joi.string().required();
const usernameField = Joi.string().alphanum().min(3).max(20).optional();
const bioField = Joi.string().min(3).max(300).optional();

export const updateSchema = Joi.object({
  username: usernameField,
  bio: bioField,
});

export const usernameSchema = Joi.object({
  id: idField,
  username: usernameField,
});

export const oAuthSchema = Joi.object({
  id: idField,
  username: usernameField,
  display_name: Joi.string().optional(),
});

export const themeSchema = Joi.object({
  theme_id: idField,
  background_color: Joi.string().optional(),
  text_color: Joi.string().optional(),
  button_color: Joi.string().optional(),
});
