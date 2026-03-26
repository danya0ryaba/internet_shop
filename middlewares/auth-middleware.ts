import { Request, Response, NextFunction } from "express";
import { ErroApi } from "../exeptions/error-api";
import { tokenService } from "../service/token-service";
import { JwtPayload } from "jsonwebtoken";

interface RequestWithUser extends Request {
  user?: string | JwtPayload;
}

export function authMiddleware(
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) {
  try {
    const authorizetionHeader = req.headers.authorization;
    if (!authorizetionHeader) {
      return next(ErroApi.UnauthorizenError());
    }

    const accessToken = authorizetionHeader.split(" ")[1];

    if (!accessToken) {
      return next(ErroApi.UnauthorizenError());
    }

    const userData = tokenService.validateAccessToken(accessToken);

    if (!userData) {
      return next(ErroApi.UnauthorizenError());
    }

    req.user = userData;
    next();
  } catch (error) {
    return next(ErroApi.UnauthorizenError());
  }
}
