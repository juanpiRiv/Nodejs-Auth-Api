import Joi from 'joi';

// Esquema para validar la cantidad al agregar un producto a un carrito
export const addProductToCartSchema = Joi.object({
  quantity: Joi.number().integer().positive().required().messages({
    'number.base': 'La cantidad debe ser un número.',
    'number.integer': 'La cantidad debe ser un número entero.',
    'number.positive': 'La cantidad debe ser un número positivo.',
    'any.required': 'La cantidad es obligatoria.'
  }),
});

// Podrías añadir otros esquemas aquí si los necesitas, por ejemplo:
// export const createCartSchema = Joi.object({
//   userId: Joi.string().required(), // Si asocias carritos a usuarios al crearlos
// });
