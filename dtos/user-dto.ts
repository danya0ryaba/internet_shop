import { UserRole } from "../generated/prisma/enums";
import { IModelDTO, IOrder } from "../types/types";

export class UserDTO implements IModelDTO {
  email: string;
  id: number;
  fullName: string;
  isActivated: boolean;
  order?: IOrder;
  role: UserRole;

  constructor(model: IModelDTO) {
    this.email = model.email;
    this.fullName = model.fullName;
    this.id = model.id;
    this.isActivated = model.isActivated;
    this.role = model.role;
  }
}
