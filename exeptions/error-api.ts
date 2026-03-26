export class ErroApi extends Error {
  status: number;
  errors: unknown[];
  constructor(status: number, message: string, errors: unknown[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static UnauthorizenError() {
    return new ErroApi(401, "Пользователь не авторизован", []);
  }

  static BadRequestError(message: string, errors: unknown[] = []) {
    return new ErroApi(400, message, errors);
  }
}
