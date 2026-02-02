import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);

  let code = 500;
  let status: "fail" | "error" = "error";
  let message = "Internal server error";

  if (err instanceof AppError) {
    code = err.code;
    status = err.status;
    message = err.message;
  } else if (err.code === "ENOENT") {
    code = 404;
    status = "fail";
    message = "File not found";
  } else if (typeof err.statusCode === "number") {
    code = err.statusCode;
    message = err.message;
    status = code.toString().startsWith("4") ? "fail" : "error";
  }

  res.status(code).json({ status, message });
};
