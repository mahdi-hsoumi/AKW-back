import Joi from 'joi';

export const submitKYCSchema = Joi.object({
  name: Joi.string().required(),
});

export const updateKYCStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected').required(),
});
