import * as Joi from "joi";
import { Request, Response, NextFunction } from "express";

/**
 * Validation while connecting wallet or logging in
 */
const loginValidation = (req: Request, res: any, next: NextFunction) => {
  const schema = Joi.object({
    wallet_address: Joi.string().required().messages({
      "string.pattern.base": "Invalid wallet address format",
      "any.required": "Wallet address is required",
    }),

    pubKey: Joi.string().base64().required().messages({
      "string.base64": "Public key must be base64 encoded",
      "any.required": "Public key is required",
    }),

    signature: Joi.object({
      pub_key: Joi.object({
        type: Joi.string().required(),
        value: Joi.string().base64().required(),
      }).required(),

      signature: Joi.string().base64().required(),
    }).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    const message = error.details[0].message;
    return res.status(403).send({
      message: message.replace(/\"/g, ""),
    });
  } else {
    next();
  }
};

export default loginValidation;
