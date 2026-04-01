import { Request, Response, NextFunction } from "express";
import { ErroApi } from "../exeptions/error-api";
import { tokenService } from "../service/token-service";

export function getIdFromJWT(req: Request, res: Response, next: NextFunction) {
  const authorizetionHeader = req.headers.authorization;
  if (!authorizetionHeader) {
    return next(ErroApi.UnauthorizenError());
  }

  const accessToken = authorizetionHeader.split(" ")[1];

  if (!accessToken) {
    return next(ErroApi.UnauthorizenError());
  }

  const user = tokenService.decodeToken(accessToken);

  if (!user) {
    return next(ErroApi.UnauthorizenError());
  }
  const userId = user.id;
  if (isNaN(userId)) {
    return res.status(400).json({ error: "id пользователя не валидный" });
  }
  return userId;
}
