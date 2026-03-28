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
