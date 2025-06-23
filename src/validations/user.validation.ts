import * as Joi from "joi";
import { Request,Response,NextFunction } from "express";

/**
 * Validation while connecting wallet or logging in 
 */
const loginValidation = (
  req: Request,
  res: any,
  next: NextFunction
) => {
  const schema = Joi.object({
    address: Joi.string()
      .pattern(/^sent[0-9a-z]{39}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid wallet address format',
        'any.required': 'Address is required',
      }),

    message: Joi.string().required().messages({
      'any.required': 'Message is required',
    }),

    pubkey: Joi.object({
      type: Joi.string().required(),
      value: Joi.string().base64().required(),
    }).required(),

    signature: Joi.string().base64().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    const message = error.details[0].message;
    return res.status(403).send({
      message: message.replace(/\"/g, ''),
    });
  } else {
    next();
  }
};

export default loginValidation;
