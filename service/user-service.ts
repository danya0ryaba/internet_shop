import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { mailService } from "./mail-service";
import { tokenService } from "./token-service";
import { UserDTO } from "../dtos/user-dto";
import { ErrorApi } from "../exeptions/error-api";

class UserService {
  async registration(fullName: string, email: string, password: string) {
    // const candidate = await prisma.user.findUnique({
    //   where: { email },
    // });

    // if (candidate) {
    //   throw ErrorApi.BadRequestError(
    //     "Пользователь с таким email уже существует",
    //   );
    // }

    // // хэширую пароль и делаю ссылку для активации
    // const hashPassword = await bcrypt.hash(password, 5);
    // const activationLink = uuidv4();

    // const user = await prisma.user.create({
    //   data: {
    //     fullName,
    //     email,
    //     password: hashPassword,
    //     activationLink,
    //     cart: {
    //       create: {
    //         token: activationLink, // или другой уникальный токен
    //         totalAmount: 0,
    //       },
    //     },
    //   },
    //   include: {
    //     cart: true, // включаем корзину в ответ, если нужно
    //   },
    // });

    // // письмо на email
    // await mailService.sendActivationMail(
    //   email,
    //   `${process.env.API_URL}/api/activate/${activationLink}`,
    // );

    // // генерирую токены
    // const userDTO = new UserDTO(user);
    // const tokens = tokenService.generateToken({ ...userDTO });
    // // сохраняю refreshToken в бд
    // await tokenService.saveToken(userDTO.id, tokens.refreshToken);
    // // возвращаю инфу о пользователи + токены
    // return { ...tokens, user: userDTO };
    const candidate = await prisma.user.findUnique({ where: { email } });
    if (candidate) {
      throw ErrorApi.BadRequestError(
        "Пользователь с таким email уже существует",
      );
    }
    const hashPassword = await bcrypt.hash(password, 5);
    const activationLink = uuidv4();
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashPassword,
        activationLink,
        isActivated: false,
        cart: { create: { token: activationLink, totalAmount: 0 } },
      },
    });
    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/activate/${activationLink}`,
    );

    return { message: "Письмо для активации отправлено", email: user.email };
  }

  // activationLink - ссылка на вход для пользователя, которая хранится в бд
  async activate(activationLink: string) {
    const user = await prisma.user.findUnique({ where: { activationLink } });
    if (!user) {
      throw ErrorApi.BadRequestError("Некорректная ссылка активации");
    }
    if (user.isActivated) {
      // можно разрешить и просто “логинить” по этой ссылке, но лучше не надо
      // лучше сделать ссылку одноразовой — см. ниже
    }
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isActivated: true,
        activationLink: null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActivated: true,
        role: true,
      },
    });
    const userDTO = new UserDTO(updatedUser);
    const tokens = tokenService.generateToken({ ...userDTO });
    await tokenService.saveToken(userDTO.id, tokens.refreshToken);
    return { ...tokens, user: userDTO };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        // Может переписть userDTO, чтобы не брать лишнее?
        id: true,
        email: true,
        fullName: true,
        isActivated: true,
        password: true,
        role: true,
      },
    });

    if (!user) {
      throw ErrorApi.BadRequestError("Пользователь с таким email не обнаружен");
    }

    // нужно сравнить пароли
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ErrorApi.BadRequestError("Неверный пароль");
    }

    const userDTO = new UserDTO(user);

    // генерация токенов
    const tokens = tokenService.generateToken({ ...userDTO });
    // сохраняю refreshToken в бд
    await tokenService.saveToken(userDTO.id, tokens.refreshToken);
    // возвращаю инфу о пользователи + токены
    return { ...tokens, user: userDTO };
  }

  async logout(refreshToken: string) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw ErrorApi.UnauthorizenError();
    }
    // валидация токена
    const userData = tokenService.validateRefreshToken(refreshToken);
    // поиск в бд токена
    const tokenFromDB = await tokenService.findToken(refreshToken);

    if (!tokenFromDB) {
      throw ErrorApi.BadRequestError("Refresh token не найден в базе");
    }

    // Проверка: совпадает ли id из токена с id в БД (защита от подмены)
    // if (tokenFromDB.userId !== userData?.id) {
    //   throw ErrorApi.BadRequestError(
    //     "Несоответствие пользователя в токене и базе",
    //   );
    // }
    // проверка чтобы обе операции были успешны
    if (!userData || !tokenFromDB) {
      throw ErrorApi.UnauthorizenError();
    }

    // если все хорошо то, генерирую новую пару токенов
    // refreshToken сохраняю в бд и возвращаю ответ

    // нахожу user-a по id-ку, тк верифицировали токен

    const user = await prisma.user.findUnique({
      where: {
        id: userData.id,
      },
      select: {
        // Может переписть userDTO, чтобы не брать лишнее?
        id: true,
        email: true,
        fullName: true,
        isActivated: true,
        role: true,
      },
    });

    const userDTO = new UserDTO({
      email: user!.email,
      fullName: user!.fullName,
      id: user!.id,
      isActivated: user!.isActivated,
      role: user!.role,
    });

    // генерация токенов
    const tokens = tokenService.generateToken({ ...userDTO });
    // сохраняю refreshToken в бд
    await tokenService.saveToken(userDTO.id, tokens.refreshToken);
    // возвращаю инфу о пользователи + токены
    return { ...tokens, user: userDTO };
  }

  async getAllUsers() {
    const users = await prisma.user.findMany();
    return users;
  }
}

export const userService = new UserService();
