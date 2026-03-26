export interface IModelDTO {
  email: string;
  id: number;
  isActivated: boolean;
  order?: unknown;
}

export class UserDTO implements IModelDTO {
  email: string;
  id: number;
  isActivated: boolean;
  order?: unknown;

  constructor(model: IModelDTO) {
    this.email = model.email;
    this.id = model.id;
    this.isActivated = model.isActivated;
  }
}
