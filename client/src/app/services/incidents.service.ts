import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Incident {
  incidentId?: string;
  dateTime: string;
  eventType: string;
  eventClassification: string;
  causativeAgent: string;
  bodyPartAffected: string;
  consequence: string;
  shift: string;
  location: string;
  witnesses?: string[];
  preventiveAction?: string;
}

export interface StatsResponse {
  total: number;
  byType: { _id: string; count: number }[];
  byClassification: { _id: string; count: number }[];
  byBodyPart: { _id: string; count: number }[];
  byLocation: { _id: string; count: number }[];
  last30Days: { _id: string; count: number }[];
}

@Injectable({ providedIn: 'root' })
export class IncidentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/incidents';

  list(): Observable<Incident[]> {
    return this.http.get<Incident[]>(this.baseUrl);
  }

  create(payload: Incident): Observable<Incident> {
    return this.http.post<Incident>(this.baseUrl, payload);
  }

  stats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.baseUrl}/stats`);
  }
}





