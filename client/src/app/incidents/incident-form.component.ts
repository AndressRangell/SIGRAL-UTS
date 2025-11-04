import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { EmployeesService, Employee } from '../services/employees.service';
import { IncidentsService } from '../services/incidents.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-incident-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <header class="app-toolbar">
      <div class="container app-toolbar__row">
        <div class="brand">SIGRAL-UTS</div>
      </div>
    </header>
    <main class="container">
      <div class="card" style="margin-bottom:16px;">
        <h2>Registrar accidente laboral</h2>
        <form class="form" [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="field">
              <label>Documento del empleado</label>
              <input class="input" placeholder="CC / NIT" [(ngModel)]="docInput" [ngModelOptions]="{ standalone: true }" />
              <button class="btn" type="button" (click)="lookupEmployee()" style="margin-top:8px;">Validar</button>
              <div class="hint">Ingresa el número de documento y valida para autocompletar</div>
            </div>
            <div class="field">
              <label>Empleado</label>
              <select class="input" formControlName="employee">
                <option value="" disabled>Seleccione…</option>
                <option *ngFor="let e of employees" [value]="e._id">{{ e.fullName }}</option>
              </select>
            </div>
            <div class="field">
              <label>Fecha y hora</label>
              <input class="input" type="datetime-local" formControlName="dateTime" />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Tipo de evento</label>
              <input class="input" formControlName="eventType" />
            </div>
            <div class="field">
              <label>Clasificación del evento</label>
              <input class="input" formControlName="eventClassification" />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Agente causante</label>
              <input class="input" formControlName="causativeAgent" />
            </div>
            <div class="field">
              <label>Parte del cuerpo afectada</label>
              <input class="input" formControlName="bodyPartAffected" />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Consecuencia</label>
              <input class="input" formControlName="consequence" />
            </div>
            <div class="field">
              <label>Jornada</label>
              <input class="input" formControlName="shift" />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Lugar del evento</label>
              <input class="input" formControlName="location" />
            </div>
            <div class="field">
              <label>Testigos (separados por coma)</label>
              <input class="input" formControlName="witnessesText" />
              <div class="hint">Ej: Ana,Carlos</div>
            </div>
          </div>

          <div class="field">
            <label>Acción preventiva</label>
            <input class="input" formControlName="preventiveAction" />
          </div>

          <button class="btn btn--primary" type="submit" [disabled]="form.invalid || submitting">Registrar</button>
          <div class="error" *ngIf="errorMsg" style="margin-top:8px;">{{ errorMsg }}</div>
        </form>
      </div>
    </main>
  `,
})
export class IncidentFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly employeesService = inject(EmployeesService);
  private readonly incidentsService = inject(IncidentsService);
  private readonly router = inject(Router);

  employees: Employee[] = [];
  submitting = false;
  errorMsg = '';
  docInput = '';

  form = this.fb.nonNullable.group({
    employee: ['', [Validators.required]],
    dateTime: ['', [Validators.required]],
    eventType: ['', [Validators.required]],
    eventClassification: ['', [Validators.required]],
    causativeAgent: ['', [Validators.required]],
    bodyPartAffected: ['', [Validators.required]],
    consequence: ['', [Validators.required]],
    shift: ['', [Validators.required]],
    location: ['', [Validators.required]],
    witnessesText: [''],
    preventiveAction: [''],
  });

  ngOnInit(): void {
    this.employeesService.list().subscribe((items) => (this.employees = items));
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.form.patchValue({ dateTime: now.toISOString().slice(0,16) });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting = true;
    this.errorMsg = '';
    const raw = this.form.getRawValue();
    const payload = {
      employee: raw.employee,
      dateTime: new Date(raw.dateTime).toISOString(),
      eventType: raw.eventType,
      eventClassification: raw.eventClassification,
      causativeAgent: raw.causativeAgent,
      bodyPartAffected: raw.bodyPartAffected,
      consequence: raw.consequence,
      shift: raw.shift,
      location: raw.location,
      witnesses: (raw.witnessesText || '').split(',').map(s => s.trim()).filter(Boolean),
      preventiveAction: raw.preventiveAction,
    } as any;
    this.incidentsService.create(payload).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (err) => { this.errorMsg = err?.error?.message || 'Error al registrar'; this.submitting = false; },
      complete: () => { this.submitting = false; }
    });
  }

  lookupEmployee(): void {
    const doc = (this.docInput || '').trim();
    if (!doc) return;
    fetch('/api/employees/by-document/' + encodeURIComponent(doc), { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '') } })
      .then(async (r) => {
        if (!r.ok) throw new Error('No encontrado');
        return r.json();
      })
      .then((emp) => {
        if (!this.employees.find((e) => e._id === emp._id)) {
          this.employees = [...this.employees, emp];
        }
        this.form.patchValue({ employee: emp._id });
      })
      .catch(() => {
        this.errorMsg = 'Empleado no encontrado';
        setTimeout(() => (this.errorMsg = ''), 3000);
      });
  }
}


