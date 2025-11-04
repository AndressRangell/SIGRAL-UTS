import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, AuthUser } from '../services/auth.service';
import { IncidentsService, StatsResponse } from '../services/incidents.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="app-toolbar">
      <div class="container app-toolbar__row">
        <div class="brand">SIGRAL-UTS</div>
        <nav>
          <a routerLink="/incidents" class="btn btn--text">Incidentes</a>
          <a routerLink="/incidents/new" class="btn btn--text">Registrar incidente</a>
          <a routerLink="/users" class="btn btn--text">Usuarios</a>
          <a href="#" (click)="logout($event)" class="btn btn--text">Salir</a>
        </nav>
      </div>
    </header>
    <main class="container">
      <div class="card" style="margin-bottom:16px;">
        <h2>Dashboard</h2>
        <p *ngIf="user">Bienvenido, {{ user.name }} ({{ user.role }})</p>
        <p class="hint" *ngIf="stats">Total incidentes reportados: <b>{{ stats.total }}</b></p>
      </div>

      <div class="card" style="margin-bottom:16px;">
        <h3>Últimos 30 días</h3>
        <div style="height:220px;">
          <svg [attr.viewBox]="'0 0 1000 220'" preserveAspectRatio="none" width="100%" height="100%" *ngIf="stats as s">
            <!-- axes -->
            <g stroke="var(--color-border)" stroke-width="1">
              <line x1="40" y1="10" x2="40" y2="200" />
              <line x1="40" y1="200" x2="980" y2="200" />
            </g>
            <!-- axis labels -->
            <text x="18" y="110" fill="var(--color-text)" font-size="12" transform="rotate(-90 18,110)">Incidentes</text>
            <text x="510" y="215" fill="var(--color-text)" font-size="12" text-anchor="middle">Días</text>
            <!-- ticks/labels -->
            <text x="35" y="200" fill="var(--color-text)" font-size="11" text-anchor="end">0</text>
            <text x="35" y="20" fill="var(--color-text)" font-size="11" text-anchor="end">{{ yMax(s.last30Days) }}</text>
            <text x="40" y="215" fill="var(--color-text)" font-size="11">{{ firstDate(s.last30Days) }}</text>
            <text x="980" y="215" fill="var(--color-text)" font-size="11" text-anchor="end">{{ lastDate(s.last30Days) }}</text>
            <!-- trend line -->
            <polyline
              [attr.points]="getTrendPoints(s.last30Days, 40, 980, 10, 200)"
              fill="none"
              stroke="var(--color-primary)"
              stroke-width="3" />
          </svg>
          <div class="hint" *ngIf="!stats">Cargando…</div>
        </div>
      </div>

      <div class="card" style="margin-bottom:16px;">
        <h3>Por tipo de evento</h3>
        <div class="form-row" *ngIf="stats as s; else loading">
          <div class="field" style="display:flex;align-items:center;justify-content:center;">
            <svg [attr.viewBox]="'0 0 220 220'" width="220" height="220">
              <g *ngIf="s as data">
                <ng-container *ngFor="let seg of donutData(data.byType); let i = index">
                  <path [attr.d]="seg.d" [attr.fill]="seg.color" />
                </ng-container>
                <ng-container *ngFor="let seg of donutData(data.byType)">
                  <text [attr.x]="seg.lx" [attr.y]="seg.ly" text-anchor="middle" dominant-baseline="middle" fill="var(--color-text)" font-size="10">{{ seg.percent }}%</text>
                </ng-container>
                <circle cx="110" cy="110" r="50" fill="var(--color-surface)" stroke="var(--color-border)" />
                <text x="110" y="110" text-anchor="middle" dominant-baseline="middle" fill="var(--color-text)">{{ s.total }}</text>
              </g>
            </svg>
          </div>
          <div class="field">
            <div *ngFor="let row of s.byType; let i = index" style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <span [style.background]="palette[i % palette.length]" style="display:inline-block;width:10px;height:10px;border-radius:2px;"></span>
              <div style="flex:1;">{{ row._id || 'Sin dato' }}</div>
              <div class="hint">{{ row.count }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:16px;">
        <h3>Clasificación y ubicación</h3>
        <div class="form-row" *ngIf="stats as s; else loading">
          <div class="field">
            <div *ngFor="let row of s.byClassification" style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
              <div style="width:140px;">{{ row._id || 'Sin dato' }}</div>
              <div style="flex:1;background:var(--color-surface-2);border:1px solid var(--color-border); border-radius:8px;overflow:hidden;">
                <div [style.width.%]="barPct(row.count, s.byClassification)" style="background:#22c55e;height:10px;"></div>
              </div>
              <div style="width:40px;text-align:right;">{{ row.count }}</div>
            </div>
          </div>
          <div class="field">
            <div *ngFor="let row of s.byLocation" style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
              <div style="width:140px;">{{ row._id || 'Sin dato' }}</div>
              <div style="flex:1;background:var(--color-surface-2);border:1px solid var(--color-border); border-radius:8px;overflow:hidden;">
                <div [style.width.%]="barPct(row.count, s.byLocation)" style="background:#f59e0b;height:10px;"></div>
              </div>
              <div style="width:40px;text-align:right;">{{ row.count }}</div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #loading>
        <div class="hint">Cargando…</div>
      </ng-template>
    </main>
  `,
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly incidents = inject(IncidentsService);
  user: AuthUser | null = null;
  stats: StatsResponse | null = null;
  timer: any;
  palette = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7'];

  ngOnInit(): void {
    this.auth.currentUser$.subscribe((u) => (this.user = u));
    if (!this.user && this.auth.isLoggedIn()) {
      this.auth.me().subscribe((u) => {
        // Hydrate user in the service
        (this.auth as any).currentUserSubject.next(u);
      });
    }
    this.loadStats();
    this.timer = setInterval(() => this.loadStats(), 30000);
  }

  logout(evt: Event): void {
    evt.preventDefault();
    this.auth.logout();
    location.href = '/login';
  }

  ngOnDestroy(): void { if (this.timer) clearInterval(this.timer); }

  loadStats(): void { this.incidents.stats().subscribe((s) => (this.stats = s)); }

  barPct(count: number, rows: { count: number }[]): number {
    const max = Math.max(...rows.map(r => r.count), 1);
    return Math.round((count / max) * 100);
  }

  getTrendPoints(rows: { _id: string; count: number }[], x0=0, x1=1000, y0=0, y1=200): string {
    if (!rows?.length) return '';
    const max = Math.max(...rows.map(r => r.count), 1);
    const width = x1 - x0;
    const height = y1 - y0;
    const stepX = width / Math.max(rows.length - 1, 1);
    return rows
      .map((r, i) => {
        const x = Math.round(x0 + i * stepX);
        const y = y1 - Math.round((r.count / max) * (height - 20)) - 10; // padding 10
        return `${x},${y}`;
      })
      .join(' ');
  }

  donutData(rows: { _id: string; count: number }[]): { d: string; color: string; lx: number; ly: number; percent: string }[] {
    const total = rows.reduce((s, r) => s + r.count, 0) || 1;
    const cx = 110, cy = 110, r = 100;
    let startAngle = -Math.PI / 2;
    return rows.map((row, i) => {
      const angle = (row.count / total) * Math.PI * 2;
      const endAngle = startAngle + angle;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = angle > Math.PI ? 1 : 0;
      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      const mid = startAngle + angle / 2;
      const lr = 68; // move labels outward a bit due to thicker ring
      const lx = cx + lr * Math.cos(mid);
      const ly = cy + lr * Math.sin(mid);
      const seg = { d, color: this.palette[i % this.palette.length], lx, ly, percent: ((row.count / total) * 100).toFixed(0) };
      startAngle = endAngle;
      return seg;
    });
  }

  percent(count: number, rows: { count: number }[]): string {
    const total = rows.reduce((s, r) => s + r.count, 0) || 1;
    return ((count / total) * 100).toFixed(0);
  }

  yMax(rows: { count: number }[]): number {
    return Math.max(...rows.map(r => r.count), 1);
  }

  firstDate(rows: { _id: string }[]): string {
    return rows.length ? rows[0]._id.slice(5) : '';
  }

  lastDate(rows: { _id: string }[]): string {
    return rows.length ? rows[rows.length - 1]._id.slice(5) : '';
  }
}


