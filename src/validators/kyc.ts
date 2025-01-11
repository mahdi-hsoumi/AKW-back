import Joi from 'joi';

export const submitKYCSchema = Joi.object({
  name: Joi.string().required(),
  idDocument: Joi.object({
    mimetype: Joi.string()
      .valid('image/jpeg', 'image/png', 'image/gif')
      .required(),
    size: Joi.number()
      .max(5 * 1024 * 1024)
      .required(), // Max size 5MB
  })
    .unknown(true)
    .required(),
});

export const updateKYCStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected').required(),
});
