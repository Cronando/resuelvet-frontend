import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, AuthUser, LoginRequest } from '../models/auth.models';

export const ROLE_IDS = {
  admin: 1,
  agent: 2,
  requester: 3,
} as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'access_token';
  private readonly userKey = 'auth_user';
  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(this.readStoredUser());

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${environment.apiUrl}/auth/me`).pipe(
      tap((user) => {
        localStorage.setItem(this.userKey, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  ensureUser(): Observable<AuthUser | null> {
    if (!this.token) {
      return of(null);
    }

    if (this.currentUserSubject.value) {
      return of(this.currentUserSubject.value);
    }

    return this.me();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  get currentRoleId(): number | null {
    return this.currentUser?.roleId ?? null;
  }

  get isAdmin(): boolean {
    return this.hasAnyRole(ROLE_IDS.admin);
  }

  get isAgent(): boolean {
    return this.hasAnyRole(ROLE_IDS.agent);
  }

  get isRequester(): boolean {
    return this.hasAnyRole(ROLE_IDS.requester);
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  hasAnyRole(...roleIds: number[]): boolean {
    const currentRoleId = this.currentRoleId;
    return currentRoleId !== null && roleIds.includes(currentRoleId);
  }

  getRoleLabel(roleId: number | null = this.currentRoleId): string {
    if (roleId === ROLE_IDS.admin) {
      return 'Administrador';
    }

    if (roleId === ROLE_IDS.agent) {
      return 'Agente';
    }

    if (roleId === ROLE_IDS.requester) {
      return 'Solicitante';
    }

    return 'Sin rol';
  }

  private readStoredUser(): AuthUser | null {
    const rawValue = localStorage.getItem(this.userKey);
    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as AuthUser;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}
