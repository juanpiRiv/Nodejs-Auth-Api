import Joi from 'joi';

export const ticketSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    'number.base': 'El monto debe ser un número.',
    'number.positive': 'El monto debe ser un número positivo.',
    'any.required': 'El monto es obligatorio.'
  }),
  purchaser: Joi.string().email().required().messages({
    'string.empty': 'El email del comprador es obligatorio.',
    'string.email': 'Debe proporcionar un email válido para el comprador.',
    'any.required': 'El email del comprador es obligatorio.'
  }),
  // Aquí puedes agregar otras validaciones que consideres necesarias para tu ticket.
  // Por ejemplo, si los tickets se asocian a un carrito específico:
  // cartId: Joi.string().required().messages({
  //   'string.empty': 'El ID del carrito es obligatorio.',
  //   'any.required': 'El ID del carrito es obligatorio.'
  // }),
});
