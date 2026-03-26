export interface AuthUser {
  id: string;
  email: string;
  username: string;
  roleId: number;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
