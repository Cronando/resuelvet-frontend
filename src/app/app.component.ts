import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,    
  imports: [RouterOutlet, NgIf, RouterLink, RouterLinkActive,],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] 
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}

  get currentUserLabel(): string {
    const user = this.auth.currentUser;
    if (!user) {
      return '';
    }

    return user.username || user.email;
  }

  get currentRoleLabel(): string {
    return this.auth.getRoleLabel();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
