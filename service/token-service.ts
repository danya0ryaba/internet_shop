import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { IModelDTO } from "../dtos/user-dto";
import { ErroApi } from "../exeptions/error-api";
import { JwtPayload } from "jsonwebtoken";

class TokenService {
  generateToken(payload: IModelDTO) {
    const secretAccess = process.env.JWT_ACCESS_SECRET;
    const secretRefresh = process.env.JWT_REFRESH_SECRET;
    if (!secretAccess) {
      throw new Error("JWT_ACCESS_SECRET is not defined");
    }

    const accessToken = jwt.sign(payload, secretAccess, {
      expiresIn: "45m",
    });

    if (!secretRefresh) {
      throw new Error("JWT_REFRESH_SECRET is not defined");
    }

    const refreshToken = jwt.sign(payload, secretRefresh, {
      expiresIn: "45d",
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async saveToken(userId: number, refreshToken: string) {
    const token = await prisma.token.findFirst({
      where: { userId },
    });

    if (token) {
      return await prisma.token.update({
        where: { id: token.id },
        data: { refreshToken: refreshToken },
      });
    } else {
      return await prisma.token.create({
        data: { userId, refreshToken },
      });
    }
  }

  async removeToken(refreshToken: string) {
    const token = await prisma.token.delete({
      where: { refreshToken },
    });

    if (!token) {
      throw ErroApi.BadRequestError("Токен не найден");
    }
    return token;
  }

  async findToken(refreshToken: string) {
    const token = await prisma.token.findUnique({
      where: { refreshToken },
    });

    if (!token) {
      throw ErroApi.BadRequestError("Токен не найден");
    }
    return token;
  }

  validateAccessToken(token: string) {
    try {
      // верификация токена
      const userData = jwt.verify(token, `${process.env.JWT_ACCESS_SECRET}`);
      return userData;
    } catch (error) {
      return null;
    }
  }

  validateRefreshToken(token: string) {
    try {
      const userData = jwt.verify(
        token,
        `${process.env.JWT_REFRESH_SECRET}`,
      ) as JwtPayload;

      // Проверяем, что это объект и содержит id
      if (
        typeof userData === "object" &&
        userData !== null &&
        typeof userData.id === "number"
      ) {
        return { id: userData.id };
      }

      return userData;
    } catch (error) {
      return null;
    }
  }

  decodeToken(token: string) {
    try {
      const [headerB64, payloadB64] = token.split(".");
      // Декодируем payload из Base64
      const payload = JSON.parse(
        Buffer.from(payloadB64, "base64").toString("utf-8"),
      );
      return payload;
    } catch (error) {
      console.error("Ошибка декодирования JWT:", error);
      return null;
    }
  }
}

export const tokenService = new TokenService();
