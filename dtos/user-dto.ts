export interface IModelDTO {
  email: string;
  id: number;
  isActivated: boolean;
  order?: unknown;
  role: "ADMIN" | "USER";
}

export class UserDTO implements IModelDTO {
  email: string;
  id: number;
  isActivated: boolean;
  order?: unknown;
  role: "ADMIN" | "USER";

  constructor(model: IModelDTO) {
    this.email = model.email;
    this.id = model.id;
    this.isActivated = model.isActivated;
    this.role = model.role;
  }
}
