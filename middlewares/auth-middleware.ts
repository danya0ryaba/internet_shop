import { Request, Response, NextFunction } from "express";
import { ErrorApi } from "../exeptions/error-api";
import { tokenService } from "../service/token-service";

export function authMiddleware(req: any, res: Response, next: NextFunction) {
  try {
    const authorizetionHeader = req.headers.authorization;
    if (!authorizetionHeader) {
      return next(ErrorApi.UnauthorizenError());
    }

    const accessToken = authorizetionHeader.split(" ")[1];

    if (!accessToken) {
      return next(ErrorApi.UnauthorizenError());
    }

    const userData = tokenService.validateAccessToken(accessToken);

    if (!userData) {
      return next(ErrorApi.UnauthorizenError());
    }

    req.user = userData;
    next();
  } catch (error) {
    return next(ErrorApi.UnauthorizenError());
  }
}
