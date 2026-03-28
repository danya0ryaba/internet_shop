import { Request, Response, NextFunction } from "express";
import { UserRole } from "../generated/prisma/enums";
import { ErroApi } from "../exeptions/error-api";
import { tokenService } from "../service/token-service";

export interface IMyRequest extends Request {
  user: {
    id: number;
    role: UserRole;
  };
}

// @ts-ignore

// Расширяем тип Request глобально (чтобы Express знал о `req.user`)
// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         id: number;
//         role: UserRole;
//       };
//     }
//   }
// }

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
  // Предполагаем, что пользователь уже аутентифицирован и добавлен в req.user
  // Проблема в том что у меня в запросе нет поля user

  const authorizetionHeader = req.headers.authorization;
  if (!authorizetionHeader) {
    return next(ErroApi.UnauthorizenError());
  }

  const accessToken = authorizetionHeader.split(" ")[1];

  if (!accessToken) {
    return next(ErroApi.UnauthorizenError());
  }

  const userData = tokenService.decodeToken(accessToken);
  // const userData = tokenService.validateAccessToken(accessToken);

  // if (!userData) {
  //   return next(ErroApi.UnauthorizenError());
  // }

  console.log("userData.role = ");
  // const user = Object.assign({}, userData);
  console.log(userData.role);
  // next(userData);
  //
  //
  //
  //
  //
  //
  //

  // const user = req.user;

  // if (!user) {
  //   return next(ErroApi.UnauthorizenError());
  // }

  // if (user.role !== UserRole.ADMIN) {
  //   return res
  //     .status(403)
  //     .json({ message: "Доступ запрещен. Требуется роль администратора." });
  // }

  // next();
};
