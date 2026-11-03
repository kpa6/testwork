import type { FormState } from '../forms';

export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
};

export type AuthUser = User | undefined;

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginFormState = FormState<LoginInput>;

export type LoginAction = (
  previousState: LoginFormState,
  formData: FormData,
) => Promise<LoginFormState>;

export type AuthContextValue = {
  user: AuthUser;
  authenticated: boolean;
  sessionExpired: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
};
