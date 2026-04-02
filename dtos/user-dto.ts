import { UserRole } from "../generated/prisma/enums";
import { IOrder } from "../types/types";

export interface IModelDTO {
  email: string;
  id: number;
  isActivated: boolean;
  order?: unknown;
  role: UserRole;
}

export class UserDTO implements IModelDTO {
  email: string;
  id: number;
  isActivated: boolean;
  order?: IOrder;
  role: UserRole;

  constructor(model: IModelDTO) {
    this.email = model.email;
    this.id = model.id;
    this.isActivated = model.isActivated;
    this.role = model.role;
  }
}
