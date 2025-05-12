import Joi from 'joi';

export const userRegisterSchema = Joi.object({
  first_name: Joi.string().required().messages({
    'string.empty': 'El nombre es obligatorio.',
    'any.required': 'El nombre es obligatorio.'
  }),
  last_name: Joi.string().required().messages({
    'string.empty': 'El apellido es obligatorio.',
    'any.required': 'El apellido es obligatorio.'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'El email es obligatorio.',
    'string.email': 'Debe proporcionar un email válido.',
    'any.required': 'El email es obligatorio.'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'La contraseña es obligatoria.',
    'any.required': 'La contraseña es obligatoria.'
  }),
  age: Joi.number().integer().min(0).optional().messages({
    'number.base': 'La edad debe ser un número.',
    'number.integer': 'La edad debe ser un número entero.',
    'number.min': 'La edad no puede ser negativa.'
  }),
  role: Joi.string().optional().default('user').valid('user', 'admin', 'premium').messages({ // Ajusta los roles válidos según tu aplicación
    'any.only': 'El rol proporcionado no es válido. Roles permitidos: user, admin, premium.',
    'string.base': 'El rol debe ser una cadena de texto.'
  }),
});
