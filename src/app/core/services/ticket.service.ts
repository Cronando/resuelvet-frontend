import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTicketRequest, Ticket, UpdateTicketRequest } from '../models/ticket.models';

@Injectable({ providedIn: 'root' })
export class TicketService {
  constructor(private readonly http: HttpClient) {}

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${environment.apiUrl}/tickets`);
  }

  getTicketById(idTicket: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${environment.apiUrl}/tickets/${idTicket}`);
  }

  createTicket(payload: CreateTicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>(`${environment.apiUrl}/tickets`, payload);
  }

  updateTicket(idTicket: string, payload: UpdateTicketRequest): Observable<Ticket> {
    return this.http.put<Ticket>(`${environment.apiUrl}/tickets/${idTicket}`, payload);
  }
}
