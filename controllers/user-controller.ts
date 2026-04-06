import { Request, Response, NextFunction } from "express";
import { userService } from "../service/user-service";
import { validationResult } from "express-validator";
import { ErrorApi } from "../exeptions/error-api";
import { IError, IUserDTO } from "../types/types";

class UserController {
  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(
          ErrorApi.BadRequestError("Невалидные данные", errors.array()),
        );
      }

      const { fullName, email, password } = req.body;
      const userData = await userService.registration(
        fullName,
        email,
        password,
      );

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.json(userData);
    } catch (error) {
      if (error instanceof ErrorApi) {
        return next(error);
      }
      return next(ErrorApi.BadRequestError("Ошибка регистрации", [error]));
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const userData: IUserDTO = await userService.login(email, password);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie(refreshToken);
      return res.status(200).json({ token });
    } catch (error) {
      next(error);
    }
  }

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const activationLink = req.params.link;

      if (!activationLink || typeof activationLink !== "string") {
        return res.status(400).json({ error: "Некорректная ссылка активации" });
      }

      await userService.activate(activationLink);

      return res.redirect(String(process.env.CLIENT_URL));
    } catch (error: any) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      const userData: any = await userService.refresh(refreshToken);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }
  // только для админа
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      return res.json(users);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
