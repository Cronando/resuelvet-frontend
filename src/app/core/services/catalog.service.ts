import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TicketCategory,
  TicketPriority,
  TicketStatus,
  TicketUser,
} from '../models/ticket.models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  constructor(private readonly http: HttpClient) {}

  getCategories(): Observable<TicketCategory[]> {
    return this.http.get<TicketCategory[]>(`${environment.apiUrl}/categories`);
  }

  getPriorities(): Observable<TicketPriority[]> {
    return this.http.get<TicketPriority[]>(`${environment.apiUrl}/priorities`);
  }

  getStatuses(): Observable<TicketStatus[]> {
    return this.http.get<TicketStatus[]>(`${environment.apiUrl}/statuses`);
  }

  getUsers(): Observable<TicketUser[]> {
    return this.http.get<TicketUser[]>(`${environment.apiUrl}/users`);
  }
}
