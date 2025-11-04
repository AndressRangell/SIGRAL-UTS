import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  _id?: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly baseUrl = '/api/users';

  constructor(private readonly http: HttpClient) {}

  list(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  create(payload: Pick<User, 'name' | 'email'>): Observable<User> {
    return this.http.post<User>(this.baseUrl, payload);
  }
}





