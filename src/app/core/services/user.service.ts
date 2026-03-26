import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AppUser,
  CreateUserRequest,
  RoleOption,
  UpdateUserRequest,
} from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly usersUrl = `${environment.apiUrl}/users`;
  private readonly rolesUrl = `${environment.apiUrl}/roles`;
  private readonly registerUrl = `${environment.apiUrl}/auth/register`;

  constructor(private readonly http: HttpClient) {}

  getUsers(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.usersUrl);
  }

  getRoles(): Observable<RoleOption[]> {
    return this.http.get<RoleOption[]>(this.rolesUrl);
  }

  createUser(payload: CreateUserRequest): Observable<unknown> {
    return this.http.post(this.registerUrl, payload);
  }

  updateUser(id: string, payload: UpdateUserRequest): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.usersUrl}/${id}`, payload);
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.usersUrl}/${id}`);
  }
}