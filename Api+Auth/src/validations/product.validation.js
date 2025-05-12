import Joi from 'joi';

export const productSchema = Joi.object({
  title: Joi.string().required(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().positive().required(),
  code: Joi.string().required(),
  category: Joi.string().required(),
  description: Joi.string().optional(),
  status: Joi.boolean().optional(),
  thumbnail: Joi.string().optional(),
});
