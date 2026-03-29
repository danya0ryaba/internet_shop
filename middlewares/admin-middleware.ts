import { Request, Response, NextFunction } from "express";
import { UserRole } from "../generated/prisma/enums";
import { ErroApi } from "../exeptions/error-api";
import { tokenService } from "../service/token-service";

// @ts-ignore

// вот инфа зашитая в JWT
// {
//   "email": "qvqyh@sharebot.net",
//   "id": 6,
//   "isActivated": false,
//   "role": "USER",
//   "iat": 1774694416,
//   "exp": 1774697116
// }

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

  if (user.role !== UserRole.ADMIN) {
    return res
      .status(403)
      .json({ message: "Доступ запрещен. Требуется роль администратора." });
  }

  next();
};
