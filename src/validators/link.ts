import Joi from "joi";

const titleField = Joi.string().min(6).max(50).required();
const urlField = Joi.string().min(6).max(300).required();

export const linkSchema = Joi.object({
  title: titleField,
  url: urlField,
});


const reorderSchema = Joi.object({
  id: Joi.number().required(),
  order_index: Joi.number().required(),
});

export const orderSchema = Joi.object({
  links: Joi.array().items(reorderSchema).required(),
});