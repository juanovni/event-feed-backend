export interface UpdateUserDto {
  name?: string;
  lastName?: string;
  username?: string;
  description?: string;
  gender?: string;
  birthdate?: string;
  location?: string;
  phone?: string;
  categories?: string[];
  avatar?: string;
}