import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.parse({ body: req.body, query: req.query, params: req.params });
    req.body = result.body ?? req.body;
    Object.assign(req.query, result.query);
    next();
  };
