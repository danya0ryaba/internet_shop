import { ErrorApi } from "../exeptions/error-api";
import { OrderStatus, UserRole } from "../generated/prisma/enums";

// не использую ...
export interface IUser {
  id: number;
  email: string;
  activationLink: string | null;
  fullName: string;
  password: string;
  role: "USER" | "ADMIN";
  verified: Date | null;
  isActivated: boolean;
  provider: string | null;
  providerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCreateInput {
  name: string;
  imageUrl: string;
  description: string;
  price: number;
  size?: number;
  categoryName: string;
}

export type ProductWithId = ProductCreateInput & {
  id: number;
};

export interface IOrder {
  phone: string;
  address: string;
  comment?: string;
  email: string;
  fullName: string;
  paymentId: string;
  status: OrderStatus;
  totalAmount: number;
  token: string;
  items: {
    productItemId: number;
    quantity: number;
  }[];
}

export interface IError extends ErrorApi {}

export interface IModelDTO {
  email: string;
  id: number;
  isActivated: boolean;
  order?: unknown;
  role: UserRole;
}

export interface IUserDTO {
  accessToken: string;
  refreshToken: string;
  user: {
    email: string;
    id: number;
    isActivated: boolean;
    order?: unknown;
    role: UserRole;
  };
}
