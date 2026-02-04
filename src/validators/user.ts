import Joi from "joi";

const usernameField = Joi.string().alphanum().min(3).max(20).optional();
const themeField = Joi.string().alphanum().min(3).max(20).optional();
const bioField = Joi.string().min(3).max(300).optional();

export const updateSchema = Joi.object({
  username: usernameField,
  theme: themeField,
  bio: bioField,
});
