import Joi from "joi";

const titleField = Joi.string().min(3).max(100).optional();
const urlField = Joi.string().min(6).max(300).optional();

export const linkSchema = Joi.object({
  id: Joi.string().required(),
  title: titleField,
  url: urlField,
});

const reorderSchema = Joi.object({
  id: Joi.number().required(),
  order_index: Joi.number().required(),
});

export const orderSchema = Joi.object({
  id: Joi.string().required(),
  links: Joi.array().items(reorderSchema).required(),
});