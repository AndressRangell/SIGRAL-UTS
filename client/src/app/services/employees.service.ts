import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Employee { _id: string; fullName: string; documentId: string; }

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private readonly http = inject(HttpClient);
  list(): Observable<Employee[]> { return this.http.get<Employee[]>('/api/employees'); }
}




