export interface AuthState {
  success: boolean;
  errors: Record<string, string[]>;
  message?: string;
  values?: {
    name?: string;
    email?: string;
  };
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  defaultCurrency: string;
}

export interface RegisterState {
  success: boolean;
  errors?: Record<string, string[]>;
}
