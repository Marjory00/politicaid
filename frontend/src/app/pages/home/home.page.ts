import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';
import { BillService }      from '../../services/bill.service';

@Component({
  selector: 'app-home',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1><i class="pi pi-building"></i> Legislative Intelligence Dashboard</h1>
        <p>AI-powered analysis of legislative bills — summaries, sentiment, and voting trends.</p>
      </div>

      <div class="search-section">
        <app-search-bar (search)="onSearch($event)"></app-search-bar>
      </div>

      <div class="kpi-grid" *ngIf="summary">
        <div class="kpi-card">
          <div class="kpi-icon blue"><i class="pi pi-file-o"></i></div>
          <div class="kpi-data">
            <span class="kpi-value">{{ summary.total_bills | number }}</span>
            <span class="kpi-label">Total Bills</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green"><i class="pi pi-check-circle"></i></div>
          <div class="kpi-data">
            <span class="kpi-value">{{ summary.enacted_bills | number }}</span>
            <span class="kpi-label">Enacted</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon amber"><i class="pi pi-percentage"></i></div>
          <div class="kpi-data">
            <span class="kpi-value">{{ summary.pass_rate }}%</span>
            <span class="kpi-label">Pass Rate</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon purple"><i class="pi pi-heart"></i></div>
          <div class="kpi-data">
            <span class="kpi-value">{{ topSentiment }}</span>
            <span class="kpi-label">Dominant Sentiment</span>
          </div>
        </div>
      </div>

      <div class="charts-row">
        <p-card header="Sentiment Distribution">
          <app-sentiment-chart [data]="summary?.sentiment_distribution"></app-sentiment-chart>
        </p-card>
        <p-card header="Voting Trends by Party">
          <app-voting-trends></app-voting-trends>
        </p-card>
      </div>

      <p-card header="Recent Bills" styleClass="mt-4">
        <div *ngIf="loading" style="display:flex;justify-content:center;padding:3rem">
          <p-progressSpinner strokeWidth="4"></p-progressSpinner>
        </div>
        <div class="bills-grid" *ngIf="!loading">
          <app-bill-card *ngFor="let bill of recentBills"
            [bill]="bill" (click)="goToBill(bill.id)">
          </app-bill-card>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .page-container { padding:2rem; max-width:1400px; margin:0 auto; }
    .page-header { margin-bottom:1.5rem; }
    .page-header h1 { font-size:1.75rem; font-weight:700; display:flex; align-items:center; gap:0.5rem; margin:0 0 0.5rem; }
    .page-header p { color:var(--text-color-secondary); margin:0; }
    .search-section { margin-bottom:2rem; }
    .kpi-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; margin-bottom:2rem; }
    .kpi-card { background:var(--surface-card); border:1px solid var(--surface-border); border-radius:12px;
                padding:1.25rem; display:flex; align-items:center; gap:1rem; }
    .kpi-icon { width:52px; height:52px; border-radius:12px; display:flex; align-items:center;
                justify-content:center; font-size:1.4rem; flex-shrink:0; }
    .kpi-icon.blue   { background:#dbeafe; color:#2563eb; }
    .kpi-icon.green  { background:#dcfce7; color:#16a34a; }
    .kpi-icon.amber  { background:#fef9c3; color:#ca8a04; }
    .kpi-icon.purple { background:#f3e8ff; color:#9333ea; }
    .kpi-value { display:block; font-size:1.6rem; font-weight:700; }
    .kpi-label { font-size:0.85rem; color:var(--text-color-secondary); }
    .charts-row { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:1.5rem; }
    .bills-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:1rem; }
    @media (max-width:768px) { .charts-row { grid-template-columns:1fr; } }
  `]
})
export class HomePage implements OnInit {
  summary: any;
  recentBills: any[] = [];
  loading = true;

  constructor(private analytics: AnalyticsService, private bills: BillService, private router: Router) {}

  ngOnInit(): void {
    this.analytics.getSummary().subscribe(d => this.summary = d);
    this.bills.getBills(1, 6).subscribe(d => { this.recentBills = d.bills; this.loading = false; });
  }

  get topSentiment(): string {
    if (!this.summary?.sentiment_distribution) return '—';
    const d = this.summary.sentiment_distribution;
    return Object.entries(d).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] ?? '—';
  }

  onSearch(q: string): void { this.router.navigate(['/bills'], { queryParams: { q } }); }
  goToBill(id: string): void { this.router.navigate(['/bills', id]); }
}