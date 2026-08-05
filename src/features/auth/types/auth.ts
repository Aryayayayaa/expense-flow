export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export interface RegisterState {
  success: boolean;
  errors?: Record<string, string[]>;
}