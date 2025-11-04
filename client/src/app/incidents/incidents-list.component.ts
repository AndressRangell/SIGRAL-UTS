import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { IncidentsService, Incident } from '../services/incidents.service';
import { saveAs } from './save-as.util';

@Component({
  selector: 'app-incidents-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <header class="app-toolbar">
      <div class="container app-toolbar__row">
        <div class="brand">SIGRAL-UTS</div>
      </div>
    </header>
    <main class="container">
      <div class="card" style="margin-bottom:16px;">
        <h2>Listado de incidentes</h2>
        <form class="form" [formGroup]="filters" (ngSubmit)="reload()">
          <div class="form-row">
            <div class="field"><label>Documento</label><input class="input" formControlName="documentId" placeholder="CC/NIT" /></div>
            <div class="field"><label>Tipo de evento</label><input class="input" formControlName="eventType" placeholder="Ej: Caída" /></div>
            <div class="field"><label>Clasificación</label><input class="input" formControlName="eventClassification" placeholder="Ej: Leve" /></div>
          </div>
          <div>
            <button class="btn btn--primary" type="submit">Buscar</button>
            <button class="btn" type="button" (click)="exportCsv()">Exportar CSV</button>
          </div>
        </form>
      </div>

      <div class="card">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Empleado</th>
              <th>Tipo</th>
              <th>Clasificación</th>
              <th>Ubicación</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let i of rows">
              <td>{{ i.incidentId }}</td>
              <td>{{ i.dateTime | date:'yyyy-MM-dd HH:mm' }}</td>
              <td>{{ i.employee?.fullName || '-' }}</td>
              <td>{{ i.eventType }}</td>
              <td>{{ i.eventClassification }}</td>
              <td>{{ i.location }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  `,
})
export class IncidentsListComponent {
  private readonly fb = inject(FormBuilder);
  private readonly incidentsService = inject(IncidentsService);

  rows: any[] = [];
  filters = this.fb.nonNullable.group({
    documentId: [''],
    eventType: [''],
    eventClassification: [''],
  });

  ngOnInit(): void { this.reload(); }

  reload(): void {
    const params = this.filters.getRawValue();
    const query = new URLSearchParams();
    (Object.keys(params) as (keyof typeof params)[]).forEach((k) => {
      const v = (params[k] || '').trim();
      if (v) query.set(k, v);
    });
    fetch('/api/incidents?' + query.toString(), {
      headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '') }
    })
      .then(r => r.json())
      .then(data => this.rows = data || []);
  }

  exportCsv(): void {
    if (!this.rows?.length) return;
    const headers = ['incidentId','dateTime','employee','eventType','eventClassification','location'];
    const lines = [headers.join(',')];
    for (const i of this.rows) {
      const line = [
        i.incidentId || '',
        i.dateTime || '',
        (i as any).employee?.fullName || '',
        i.eventType || '',
        i.eventClassification || '',
        i.location || '',
      ].map(v => '"' + String(v).replaceAll('"','""') + '"').join(',');
      lines.push(line);
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'incidentes.csv');
  }
}


