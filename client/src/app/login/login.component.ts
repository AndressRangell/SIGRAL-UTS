import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

function institutionalEmailValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value || '').toLowerCase().trim();
  if (!value) return null;
  const domains = ['uts.edu.co', 'correo.uts.edu.co'];
  const at = value.lastIndexOf('@');
  if (at === -1) return { emailDomain: true };
  const domain = value.slice(at + 1);
  return domains.includes(domain) ? null : { emailDomain: true };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <header class="app-toolbar">
      <div class="container app-toolbar__row">
        <div class="brand">SIGRAL-UTS</div>
      </div>
    </header>
    <main class="container">
      <div class="card card--auth">
        <h2>Iniciar sesión</h2>
        <form class="form" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <div class="field">
            <label>Email institucional</label>
            <input class="input" type="email" placeholder="usuario@uts.edu.co" formControlName="email" />
            <div *ngIf="email.invalid && (email.dirty || email.touched)" class="error">
              <span *ngIf="email.errors?.['required']">El email es requerido</span>
              <span *ngIf="email.errors?.['email']">Formato de email inválido</span>
              <span *ngIf="email.errors?.['emailDomain']">Debe ser dominio uts.edu.co o correo.uts.edu.co</span>
            </div>
          </div>
          <div class="field">
            <label>Contraseña</label>
            <input class="input" type="password" placeholder="********" formControlName="password" />
            <div *ngIf="password.invalid && (password.dirty || password.touched)" class="error">
              <span *ngIf="password.errors?.['required']">La contraseña es requerida</span>
            </div>
            <div class="hint">Usa tus credenciales institucionales</div>
          </div>
          <button class="btn btn--primary" type="submit" [disabled]="form.invalid || submitting">{{ submitting ? 'Ingresando…' : 'Ingresar' }}</button>
          <div *ngIf="errorMsg" class="error" style="margin-top:8px;">{{ errorMsg }}</div>
        </form>
      </div>
    </main>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  submitting = false;
  errorMsg = '';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, institutionalEmailValidator]],
    password: ['', [Validators.required]],
  });

  get email() { return this.form.controls.email; }
  get password() { return this.form.controls.password; }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.errorMsg = '';
    this.submitting = true;
    const { email, password } = this.form.getRawValue();
    this.auth
      .login(email, password)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
      next: () => {
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Credenciales inválidas';
        this.submitting = false;
      },
    });
  }
}


