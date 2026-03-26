import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { AppUser, RoleOption } from '../../core/models/user.models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  users: AppUser[] = [];
  roles: RoleOption[] = [];
  loading = true;
  savingCreate = false;
  savingEdit = false;
  deletingUserId: string | null = null;
  error = '';
  success = '';
  selectedUser: AppUser | null = null;

  readonly createForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    username: ['', [Validators.required, Validators.maxLength(50)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    roleId: [0, [Validators.required, Validators.min(1)]],
  });

  readonly editForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    username: ['', [Validators.required, Validators.maxLength(50)]],
    active: [true, [Validators.required]],
    idRole: [0, [Validators.required, Validators.min(1)]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadPageData();
  }

  get canEditSelectedUser(): boolean {
    return !!this.selectedUser;
  }

  get currentAdminId(): string | null {
    return this.auth.currentUser?.id ?? null;
  }

  createUser(): void {
    if (this.createForm.invalid || this.savingCreate) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.savingCreate = true;
    this.error = '';
    this.success = '';

    const formValue = this.createForm.getRawValue();

    this.userService
      .createUser({
        firstName: formValue.firstName ?? '',
        lastName: formValue.lastName ?? '',
        email: formValue.email ?? '',
        username: formValue.username ?? '',
        password: formValue.password ?? '',
        roleId: formValue.roleId ?? 0,
      })
      .subscribe({
        next: () => {
          this.success = 'Usuario creado correctamente.';
          this.createForm.reset({
            firstName: '',
            lastName: '',
            email: '',
            username: '',
            password: '',
            roleId: this.roles[0]?.idRole ?? 0,
          });
          this.savingCreate = false;
          this.loadUsers();
        },
        error: (error) => {
          this.error = error?.error?.error ?? 'No fue posible crear el usuario.';
          this.savingCreate = false;
        },
      });
  }

  selectUser(user: AppUser): void {
    this.selectedUser = user;
    this.error = '';
    this.success = '';
    this.editForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      active: user.active,
      idRole: user.idRole,
    });
  }

  closeEditor(): void {
    this.selectedUser = null;
  }

  saveSelectedUser(): void {
    if (!this.selectedUser || this.editForm.invalid || this.savingEdit) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.savingEdit = true;
    this.error = '';
    this.success = '';

    const formValue = this.editForm.getRawValue();

    this.userService
      .updateUser(this.selectedUser.idUser, {
        firstName: formValue.firstName ?? '',
        lastName: formValue.lastName ?? '',
        email: formValue.email ?? '',
        username: formValue.username ?? '',
        active: !!formValue.active,
        idRole: formValue.idRole ?? 0,
      })
      .subscribe({
        next: (updatedUser) => {
          this.selectedUser = updatedUser;
          this.patchUser(updatedUser);
          this.success = 'Usuario actualizado correctamente.';
          this.savingEdit = false;
        },
        error: (error) => {
          this.error = error?.error?.error ?? 'No fue posible actualizar el usuario.';
          this.savingEdit = false;
        },
      });
  }

  deleteUser(user: AppUser): void {
    if (this.deletingUserId || user.idUser === this.currentAdminId) {
      return;
    }

    this.deletingUserId = user.idUser;
    this.error = '';
    this.success = '';

    this.userService.deleteUser(user.idUser).subscribe({
      next: (response) => {
        if (this.selectedUser?.idUser === user.idUser) {
          this.closeEditor();
        }
        this.success = response.message;
        this.deletingUserId = null;
        this.loadUsers();
      },
      error: (error) => {
        this.error = error?.error?.error ?? 'No fue posible eliminar el usuario.';
        this.deletingUserId = null;
      },
    });
  }

  getRoleName(user: AppUser): string {
    return user.role?.name ?? this.roles.find((role) => role.idRole === user.idRole)?.name ?? 'Sin rol';
  }

  formatDate(dateValue: string): string {
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
  }

  private loadPageData(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      users: this.userService.getUsers(),
      roles: this.userService.getRoles(),
    }).subscribe({
      next: ({ users, roles }) => {
        this.users = users;
        this.roles = roles;
        this.createForm.patchValue({ roleId: roles[0]?.idRole ?? 0 });
        this.loading = false;
      },
      error: () => {
        this.error = 'No fue posible cargar la administracion de usuarios.';
        this.loading = false;
      },
    });
  }

  private loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: () => {
        this.error = 'No fue posible refrescar la lista de usuarios.';
      },
    });
  }

  private patchUser(updatedUser: AppUser): void {
    this.users = this.users.map((user) => {
      if (user.idUser !== updatedUser.idUser) {
        return user;
      }

      return {
        ...user,
        ...updatedUser,
        role:
          updatedUser.role ?? this.roles.find((role) => role.idRole === updatedUser.idRole) ?? user.role,
      };
    });
  }
}