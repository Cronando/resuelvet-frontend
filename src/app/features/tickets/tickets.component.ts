import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, switchMap } from 'rxjs';
import {
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  TicketUser,
} from '../../core/models/ticket.models';
import { AuthService, ROLE_IDS } from '../../core/services/auth.service';
import { CatalogService } from '../../core/services/catalog.service';
import { TicketService } from '../../core/services/ticket.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css'],
})
export class TicketsComponent implements OnInit {
  private readonly roleIds = ROLE_IDS;

  tickets: Ticket[] = [];
  categories: TicketCategory[] = [];
  priorities: TicketPriority[] = [];
  statuses: TicketStatus[] = [];
  users: TicketUser[] = [];
  selectedTicket: Ticket | null = null;

  loading = true;
  loadingDetail = false;
  creating = false;
  updatingStatus = false;
  error = '';
  searchTerm = '';
  filterStatus = '';
  filterPriority = '';

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.required]],
    idTicketCat: [0, [Validators.required, Validators.min(1)]],
    idTicketPrio: [0, [Validators.required, Validators.min(1)]],
    idTicketStat: [0, [Validators.required, Validators.min(1)]],
    idUserAsig: [null as string | null],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly catalogService: CatalogService,
    private readonly ticketService: TicketService
  ) {}

  ngOnInit(): void {
    this.loadPageData();
  }

  get isRequester(): boolean {
    return this.auth.isRequester;
  }

  get canManageWorkflow(): boolean {
    return this.auth.hasAnyRole(this.roleIds.admin, this.roleIds.agent);
  }

  get canAssignUsers(): boolean {
    return this.canManageWorkflow;
  }

  get canSelectInitialStatus(): boolean {
    return this.canManageWorkflow;
  }

  get visibleTickets(): Ticket[] {
    const currentUser = this.auth.currentUser;

    if (!this.isRequester || !currentUser) {
      return this.tickets;
    }

    return this.tickets.filter((ticket) => ticket.idUserReq === currentUser.id);
  }

  get assignableUsers(): TicketUser[] {
    return this.users.filter((user) => user.idRole !== this.roleIds.requester);
  }

  get availableCreationStatuses(): TicketStatus[] {
    if (!this.statuses.length) {
      return [];
    }

    if (this.canSelectInitialStatus) {
      return this.statuses;
    }

    const openStatus = this.getStatusByCode('OPEN');
    return openStatus ? [openStatus] : [];
  }

  get filteredTickets(): Ticket[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.visibleTickets.filter((ticket) => {
      const matchesStatus = !this.filterStatus || ticket.idTicketStat === Number(this.filterStatus);
      const matchesPriority =
        !this.filterPriority || ticket.idTicketPrio === Number(this.filterPriority);
      const matchesQuery =
        !query ||
        [ticket.ticketNo, ticket.title, ticket.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));

      return matchesStatus && matchesPriority && matchesQuery;
    });
  }

  createTicket(): void {
    if (this.form.invalid || this.creating) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.auth.currentUser;
    if (!user) {
      this.error = 'No se pudo identificar el usuario actual.';
      return;
    }

    this.creating = true;
    this.error = '';

    const formValue = this.form.getRawValue();
    const openStatusId = this.getStatusIdByCode('OPEN');

    if (!this.canSelectInitialStatus && openStatusId === null) {
      this.error = 'No se encontro el estado inicial para el ticket.';
      this.creating = false;
      return;
    }

    const assignee = this.canAssignUsers ? formValue.idUserAsig ?? undefined : undefined;

    const payload = {
      title: formValue.title ?? '',
      description: formValue.description ?? '',
      idTicketCat: formValue.idTicketCat ?? 0,
      idTicketPrio: formValue.idTicketPrio ?? 0,
      idTicketStat: this.canSelectInitialStatus ? formValue.idTicketStat ?? 0 : openStatusId ?? 0,
      idUserAsig: assignee,
      ticketNo: this.buildTicketNo(),
      idUserReq: user.id,
    };

    this.ticketService.createTicket(payload).subscribe({
      next: () => {
        this.form.patchValue({
          title: '',
          description: '',
          idTicketCat: this.categories[0]?.idTicketCat ?? 0,
          idTicketPrio: this.priorities[0]?.idTicketPrio ?? 0,
          idTicketStat: this.getDefaultCreationStatusId(),
          idUserAsig: null,
        });
        this.form.markAsPristine();
        this.creating = false;
        this.refreshTickets();
      },
      error: (error) => {
        this.error = error?.error?.error ?? 'No fue posible crear el ticket.';
        this.creating = false;
      },
    });
  }

  viewTicketDetails(ticket: Ticket): void {
    this.loadingDetail = true;
    this.error = '';

    this.ticketService.getTicketById(ticket.idTicket).subscribe({
      next: (fullTicket) => {
        this.selectedTicket = fullTicket;
        this.loadingDetail = false;
      },
      error: () => {
        this.error = 'No fue posible cargar el detalle del ticket.';
        this.loadingDetail = false;
      },
    });
  }

  closeTicketDetails(): void {
    this.selectedTicket = null;
    this.loadingDetail = false;
  }

  changeStatus(ticket: Ticket, newStatusId: number): void {
    if (!this.canManageWorkflow || this.updatingStatus || newStatusId === ticket.idTicketStat) {
      return;
    }

    this.updatingStatus = true;
    this.error = '';

    this.ticketService
      .updateTicket(ticket.idTicket, {
        ticketNo: ticket.ticketNo,
        title: ticket.title,
        description: ticket.description,
        idTicketCat: ticket.idTicketCat,
        idTicketPrio: ticket.idTicketPrio,
        idTicketStat: newStatusId,
        idUserReq: ticket.idUserReq,
        idUserAsig: ticket.idUserAsig,
      })
      .subscribe({
        next: (updatedTicket) => {
          this.patchTicketInList(updatedTicket);
          this.updatingStatus = false;

          if (this.selectedTicket?.idTicket === updatedTicket.idTicket) {
            this.viewTicketDetails(updatedTicket);
          }
        },
        error: () => {
          this.error = 'No fue posible actualizar el estado del ticket.';
          this.updatingStatus = false;
        },
      });
  }

  canTransition(ticket: Ticket, targetCode: string): boolean {
    const currentCode =
      ticket.status?.code?.toUpperCase() ??
      this.statuses
        .find((status) => status.idTicketStat === ticket.idTicketStat)
        ?.code?.toUpperCase();
    if (!currentCode) {
      return false;
    }

    if (targetCode === 'IN_PROGRESS') {
      return currentCode === 'OPEN';
    }

    if (targetCode === 'RESOLVED') {
      return currentCode === 'IN_PROGRESS';
    }

    if (targetCode === 'CLOSED') {
      return currentCode === 'IN_PROGRESS' || currentCode === 'RESOLVED';
    }

    return false;
  }

  getStatusIdByCode(code: string): number | null {
    const match = this.getStatusByCode(code);
    return match?.idTicketStat ?? null;
  }

  getAssignedUser(ticket: Ticket): string {
    const user = ticket.userAssigned;
    if (!user) {
      return '-';
    }

    return `${user.firstName} ${user.lastName}`.trim() || user.username;
  }

  formatDate(dateValue?: string): string {
    if (!dateValue) {
      return '-';
    }

    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
  }

  private loadPageData(): void {
    this.error = '';
    this.loading = true;

    this.auth
      .ensureUser()
      .pipe(
        switchMap(() =>
          forkJoin({
            tickets: this.ticketService.getTickets(),
            categories: this.catalogService.getCategories(),
            priorities: this.catalogService.getPriorities(),
            statuses: this.catalogService.getStatuses(),
            users: this.catalogService.getUsers(),
          })
        )
      )
      .subscribe({
        next: ({ tickets, categories, priorities, statuses, users }) => {
          this.tickets = tickets;
          this.categories = categories;
          this.priorities = priorities;
          this.statuses = statuses;
          this.users = users;

          this.form.patchValue({
            idTicketCat: categories[0]?.idTicketCat ?? 0,
            idTicketPrio: priorities[0]?.idTicketPrio ?? 0,
            idTicketStat: this.getDefaultCreationStatusId(),
            idUserAsig: null,
          });

          this.loading = false;
        },
        error: () => {
          this.error = 'No fue posible cargar la vista de tickets.';
          this.loading = false;
        },
      });
  }

  private refreshTickets(): void {
    this.ticketService.getTickets().subscribe({
      next: (tickets) => {
        this.tickets = tickets;

        if (this.selectedTicket) {
          const match = tickets.find((ticket) => ticket.idTicket === this.selectedTicket?.idTicket);
          if (match) {
            this.viewTicketDetails(match);
          }
        }
      },
      error: () => {
        this.error = 'El ticket se creo, pero no se pudo refrescar la lista.';
      },
    });
  }

  private patchTicketInList(updatedTicket: Ticket): void {
    this.tickets = this.tickets.map((ticket) => {
      if (ticket.idTicket !== updatedTicket.idTicket) {
        return ticket;
      }

      const updatedStatus =
        this.statuses.find((status) => status.idTicketStat === updatedTicket.idTicketStat) ??
        ticket.status;

      return {
        ...ticket,
        ...updatedTicket,
        status: updatedStatus,
      };
    });
  }

  private getDefaultCreationStatusId(): number {
    return this.availableCreationStatuses[0]?.idTicketStat ?? 0;
  }

  private getStatusByCode(code: string): TicketStatus | undefined {
    return this.statuses.find((status) => status.code.toUpperCase() === code.toUpperCase());
  }

  private buildTicketNo(): string {
    const stamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 900 + 100);
    return `TK-${stamp}-${random}`;
  }
}
