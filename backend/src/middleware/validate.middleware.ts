/**
 * Zod-based request validation middleware for params, query, and body payloads.
 */
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from './error.middleware';

// Validates request params, body, and query against the provided zod schema.
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(400).json({
          error: 'Validation failed',
          details: errors,
        });
      }
      return next(new AppError('Validation error', 400));
    }
  };
};
