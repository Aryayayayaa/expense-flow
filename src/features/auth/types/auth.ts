export interface AuthState {
  success: boolean;
  errors: Record<string, string[]>;
  message?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}
