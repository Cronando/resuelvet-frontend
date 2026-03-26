import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs';
import { Ticket } from '../../core/models/ticket.models';
import { AuthService } from '../../core/services/auth.service';
import { TicketService } from '../../core/services/ticket.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  tickets: Ticket[] = [];
  loading = true;
  error = '';

  constructor(
    private readonly auth: AuthService,
    private readonly ticketService: TicketService
  ) {}

  ngOnInit(): void {
    this.auth
      .ensureUser()
      .pipe(switchMap(() => this.ticketService.getTickets()))
      .subscribe({
        next: (tickets) => {
          this.tickets = tickets;
          this.loading = false;
        },
        error: () => {
          this.error = 'No fue posible cargar el dashboard.';
          this.loading = false;
        },
      });
  }

  get isRequesterView(): boolean {
    return this.auth.isRequester;
  }

  get visibleTickets(): Ticket[] {
    const currentUser = this.auth.currentUser;

    if (!this.auth.isRequester || !currentUser) {
      return this.tickets;
    }

    return this.tickets.filter((ticket) => ticket.idUserReq === currentUser.id);
  }

  get totalTickets(): number {
    return this.visibleTickets.length;
  }

  get openTickets(): number {
    return this.visibleTickets.filter((ticket) => !ticket.status?.final).length;
  }

  get closedTickets(): number {
    return this.visibleTickets.filter((ticket) => ticket.status?.final).length;
  }

  get recentTickets(): Ticket[] {
    return [...this.visibleTickets]
      .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
      .slice(0, 5);
  }
}
