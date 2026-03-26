export interface RoleOption {
  idRole: number;
  name: string;
}

export interface AppUser {
  idUser: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  dateCreated: string;
  dateUpdated: string;
  active: boolean;
  idRole: number;
  role?: RoleOption;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  roleId: number;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  active?: boolean;
  idRole?: number;
}