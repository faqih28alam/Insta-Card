import Joi from "joi";

const usernameField = Joi.string().alphanum().min(3).max(50).required();
const themeField = Joi.string().alphanum().min(3).max(50).optional();
const bioField = Joi.string().min(6).max(300).optional();

export const updateSchema = Joi.object({
  username: usernameField,
  theme: themeField,
  bio: bioField,
});
