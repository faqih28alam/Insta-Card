import Joi from "joi";

const usernameField = Joi.string().alphanum().min(3).max(100).required();
const emailField = Joi.string().email().required();
const passwordField = Joi.string()
  .pattern(new RegExp("^[a-zA-Z0-9]{8,30}$"))
  .required()
  .messages({
    "string.pattern.base": "Password must be 8-30 alphanumeric characters.",
  });

export const registerSchema = Joi.object({
  username: usernameField,
  email: emailField,
  password: passwordField,
});

export const loginSchema = Joi.object({
  email: emailField,
  password: passwordField,
});
