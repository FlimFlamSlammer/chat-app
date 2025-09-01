import { Handler } from "express";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { ErrorWithMessage, FieldError } from "./error";

type ValidationSchemas = {
    bodySchema?: z.Schema;
    querySchema?: z.Schema;
    paramsSchema?: z.Schema;
};

export const withValidation = (
    schemas: ValidationSchemas,
    handler: Handler
): Handler => {
    const { bodySchema, paramsSchema, querySchema } = schemas;

    return (req, res, next) => {
        try {
            if (bodySchema !== undefined) {
                req.body = bodySchema.parse(req.body);
            }

            if (querySchema !== undefined) {
                req.query = querySchema.parse(req.query) as typeof req.query;
            }

            if (paramsSchema !== undefined) {
                req.params = paramsSchema.parse(
                    req.params
                ) as typeof req.params;
            }

            handler(req, res, next);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fields = error.issues.reduce(
                    (errorMessages, { path, message }) => ({
                        ...errorMessages,
                        [path.join(".")]: message,
                    }),
                    {}
                );

                throw new FieldError(fields);
            }

            throw new ErrorWithMessage(
                StatusCodes.INTERNAL_SERVER_ERROR,
                (error as Error).message
            );
        }
    };
};
