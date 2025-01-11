import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

const validate =
  (schema: Schema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const validationData = req.file
      ? { ...req.body, idDocument: req.file }
      : req.body;
    const { error } = schema.validate(validationData);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
    } else {
      next();
    }
  };

export default validate;
