import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsersService, User } from '../services/users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <header class="app-toolbar">
      <div class="container app-toolbar__row">
        <div class="brand">SIGRAL-UTS</div>
        <nav>
          <a routerLink="/dashboard" class="btn btn--text">Dashboard</a>
        </nav>
      </div>
    </header>
    <main class="container">
      <div class="card" style="margin-bottom:16px;">
        <h2>Crear usuario</h2>
        <form class="form" [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="field">
              <label>Nombre</label>
              <input class="input" placeholder="Nombre" formControlName="name" />
            </div>
            <div class="field">
              <label>Email</label>
              <input class="input" placeholder="Email" formControlName="email" />
            </div>
          </div>
          <button class="btn btn--primary" type="submit" [disabled]="form.invalid || submitting">Crear</button>
        </form>
      </div>
      <div class="card">
        <h2>Usuarios</h2>
        <table class="table">
          <thead>
            <tr><th>Nombre</th><th>Email</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users">
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  `,
})
export class UsersComponent {
  private readonly usersService = inject(UsersService);
  private readonly fb = inject(FormBuilder);

  users: User[] = [];
  submitting = false;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.usersService.list().subscribe((res) => (this.users = res));
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting = true;
    this.usersService.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.form.reset();
        this.reload();
      },
      error: () => {},
      complete: () => (this.submitting = false),
    });
  }
}


