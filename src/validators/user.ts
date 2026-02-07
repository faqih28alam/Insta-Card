import Joi from "joi";

const usernameField = Joi.string().alphanum().min(3).max(20).optional();
const themeField = Joi.string().alphanum().min(3).max(20).optional();
const bioField = Joi.string().min(3).max(300).optional();

export const updateSchema = Joi.object({
  username: usernameField,
  theme: themeField,
  bio: bioField,
});

export const usernameSchema = Joi.object({
  id: Joi.string().required(),
  username: usernameField,
});

export const oAuthSchema = Joi.object({
  id: Joi.string().required(),
  username: usernameField,
  display_name: Joi.string().optional(),
});
