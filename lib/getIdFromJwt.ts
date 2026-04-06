import { Request, Response, NextFunction } from "express";
import { ErrorApi } from "../exeptions/error-api";
import { tokenService } from "../service/token-service";

export function getIdFromJWT(req: Request, res: Response, next: NextFunction) {
  const authorizetionHeader = req.headers.authorization;
  if (!authorizetionHeader) {
    return next(ErrorApi.UnauthorizenError());
  }

  const accessToken = authorizetionHeader.split(" ")[1];

  if (!accessToken) {
    return next(ErrorApi.UnauthorizenError());
  }

  const user = tokenService.decodeToken(accessToken);

  if (!user) {
    return next(ErrorApi.UnauthorizenError());
  }
  const userId = user.id;
  if (isNaN(userId)) {
    return res.status(400).json({ error: "id пользователя не валидный" });
  }
  return userId;
}
