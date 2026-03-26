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
