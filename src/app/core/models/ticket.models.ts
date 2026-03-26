export interface TicketCategory {
  idTicketCat: number;
  name: string;
  description?: string;
}

export interface TicketPriority {
  idTicketPrio: number;
  code: string;
  name: string;
  sort: number;
}

export interface TicketStatus {
  idTicketStat: number;
  code: string;
  name: string;
  sort: number;
  final: boolean;
}

export interface TicketUser {
  idUser: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  idRole: number;
}

export interface Ticket {
  idTicket: string;
  ticketNo: string;
  title: string;
  description: string;
  dateCreated: string;
  dateUpdated: string;
  dateResolved?: string;
  dateClosed?: string;
  idTicketStat: number;
  idTicketPrio: number;
  idTicketCat: number;
  idUserReq: string;
  idUserAsig?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  userRequested?: TicketUser;
  userAssigned?: TicketUser;
}

export interface CreateTicketRequest {
  ticketNo: string;
  title: string;
  description: string;
  idTicketStat: number;
  idTicketPrio: number;
  idTicketCat: number;
  idUserReq: string;
  idUserAsig?: string;
}

export interface UpdateTicketRequest {
  ticketNo?: string;
  title?: string;
  description?: string;
  idTicketStat?: number;
  idTicketPrio?: number;
  idTicketCat?: number;
  idUserReq?: string;
  idUserAsig?: string;
  dateResolved?: string;
  dateClosed?: string;
}
