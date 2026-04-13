export interface RegisterDto {
  name: string;
  lastName?: string;
  email: string;
  password: string;
  birthdate: string;
  gender: string;
  phone?: string;
  categories: string[];
}