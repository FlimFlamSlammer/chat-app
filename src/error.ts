import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

abstract class CustomError extends Error {
    status: StatusCodes;

    constructor(status: StatusCodes) {
        super("");
        this.status = status;
    }

    abstract toJSON(): Record<string, any>;
}

export class ErrorWithMessage extends CustomError {
    constructor(status: StatusCodes, message: string) {
        super(status);
        this.message = message;
    }

    toJSON() {
        return {
            status: this.status,
            error: {
                message: this.message,
            },
        };
    }
}

type Fields = Record<string, string>;

export class FieldError extends CustomError {
    fields: Fields;

    constructor(fields: Fields) {
        super(StatusCodes.BAD_REQUEST);
        this.fields = fields;
    }

    toJSON() {
        return {
            status: this.status,
            error: {
                fields: this.fields,
            },
        };
    }
}

export const errorMiddleware = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(error);

    let reportedError: CustomError;

    if (!(error instanceof CustomError)) {
        reportedError = new ErrorWithMessage(
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message
        );
    } else {
        reportedError = error;
    }

    res.status(reportedError.status).json(reportedError.toJSON());
};
