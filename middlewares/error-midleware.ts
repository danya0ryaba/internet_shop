import { Request, Response, NextFunction } from "express";
import { ErrorApi } from "../exeptions/error-api";

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log(err);
  if (err instanceof ErrorApi) {
    return res
      .status(err.status)
      .json({ message: err.message, errprs: err.errors });
  }
  return res
    .status(500)
    .json({ message: "Непредвиденная ошибка, возможно почта не подтверждена" });
}
