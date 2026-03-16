import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';
import { BillService } from '../../services/bill.service';

@Component({
  selector: 'app-home',
  template: `
    <div class="page-wrapper">

      <!-- Hero -->
      <div class="hero">
        <div class="hero-content">
          <div class="hero-badge">
            <i class="pi pi-shield"></i> AI-Powered Legislative Intelligence
          </div>
          <h1 class="hero-title">Welcome to <span class="hero-accent">PoliticAID</span></h1>
          <p class="hero-subtitle">Track, analyze, and understand U.S. legislative bills with AI-powered summaries, sentiment analysis, and real-time voting trends.</p>
          <div class="hero-search">
            <app-search-bar (search)="onSearch($event)"></app-search-bar>
          </div>
          <div class="hero-stats">
            <div class="hero-stat"><i class="pi pi-database"></i><span>Real-time Congress Data</span></div>
            <div class="hero-stat"><i class="pi pi-bolt"></i><span>AI Sentiment Analysis</span></div>
            <div class="hero-stat"><i class="pi pi-chart-line"></i><span>Voting Trend Insights</span></div>
          </div>
        </div>
      </div>

      <div class="page-container">

        <!-- KPI Cards -->
        <div class="kpi-grid">
          <div class="kpi-card blue">
            <div class="kpi-icon-wrap blue"><i class="pi pi-file-edit"></i></div>
            <div class="kpi-data">
              <span class="kpi-value">{{ summary?.total_bills ?? 0 | number }}</span>
              <span class="kpi-label">Total Bills</span>
              <span class="kpi-sub">In database</span>
            </div>
            <div class="kpi-badge blue"><i class="pi pi-arrow-up-right"></i></div>
          </div>
          <div class="kpi-card green">
            <div class="kpi-icon-wrap green"><i class="pi pi-check-circle"></i></div>
            <div class="kpi-data">
              <span class="kpi-value">{{ summary?.enacted_bills ?? 0 | number }}</span>
              <span class="kpi-label">Enacted</span>
              <span class="kpi-sub">Signed into law</span>
            </div>
            <div class="kpi-badge green"><i class="pi pi-arrow-up-right"></i></div>
          </div>
          <div class="kpi-card amber">
            <div class="kpi-icon-wrap amber"><i class="pi pi-percentage"></i></div>
            <div class="kpi-data">
              <span class="kpi-value">{{ summary?.pass_rate ?? 0 }}%</span>
              <span class="kpi-label">Pass Rate</span>
              <span class="kpi-sub">Bills enacted</span>
            </div>
            <div class="kpi-badge amber"><i class="pi pi-minus"></i></div>
          </div>
          <div class="kpi-card purple">
            <div class="kpi-icon-wrap purple"><i class="pi pi-comments"></i></div>
            <div class="kpi-data">
              <span class="kpi-value">{{ topSentiment }}</span>
              <span class="kpi-label">Dominant Sentiment</span>
              <span class="kpi-sub">AI analysis</span>
            </div>
            <div class="kpi-badge purple"><i class="pi pi-bolt"></i></div>
          </div>
        </div>

        <!-- Charts -->
        <div class="charts-row">
          <div class="card">
            <div class="card-header">
              <div class="card-icon blue"><i class="pi pi-chart-pie"></i></div>
              <div class="card-title-wrap">
                <h3>Sentiment Distribution</h3>
                <p>AI-analyzed bill sentiment breakdown</p>
              </div>
            </div>
            <div class="card-body">
              <div *ngIf="!summary?.sentiment_distribution" class="chart-empty">
                <i class="pi pi-chart-pie"></i>
                <h4>No sentiment data yet</h4>
                <p>Import bills to see sentiment analysis</p>
              </div>
              <app-sentiment-chart
                *ngIf="summary?.sentiment_distribution"
                [data]="summary?.sentiment_distribution">
              </app-sentiment-chart>
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <div class="card-icon purple"><i class="pi pi-chart-bar"></i></div>
              <div class="card-title-wrap">
                <h3>Voting Trends by Party</h3>
                <p>Yea, Nay, and Abstain breakdown</p>
              </div>
            </div>
            <div class="card-body">
              <app-voting-trends></app-voting-trends>
            </div>
          </div>
        </div>

        <!-- Recent Bills -->
        <div class="card">
          <div class="card-header">
            <div class="card-icon green"><i class="pi pi-list"></i></div>
            <div class="card-title-wrap">
              <h3>Recent Bills</h3>
              <p>Latest legislative activity</p>
            </div>
            <button class="view-all-btn" (click)="router.navigate(['/bills'])">
              View All <i class="pi pi-arrow-right"></i>
            </button>
          </div>
          <div class="card-body">
            <div *ngIf="loading" class="loading-state">
              <p-progressSpinner strokeWidth="3"></p-progressSpinner>
              <p>Fetching latest bills...</p>
            </div>
            <div *ngIf="!loading && recentBills.length === 0" class="empty-state">
              <div class="empty-icon-wrap">
                <i class="pi pi-inbox"></i>
              </div>
              <h3>No Bills Imported Yet</h3>
              <p>Connect to the Congress API to start importing and analyzing real legislative data.</p>
              <div class="empty-actions">
                <button class="btn-primary" (click)="router.navigate(['/bills'])">
                  <i class="pi pi-cloud-download"></i> Import from Congress API
                </button>
                <button class="btn-secondary" (click)="router.navigate(['/analytics'])">
                  <i class="pi pi-chart-bar"></i> View Analytics
                </button>
              </div>
            </div>
            <div class="bills-grid" *ngIf="!loading && recentBills.length > 0">
              <app-bill-card *ngFor="let bill of recentBills"
                [bill]="bill" (click)="goToBill(bill.id)">
              </app-bill-card>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page-wrapper {
      min-height: 100vh;
      background: #f1f5f9;
      font-family: 'Inter', -apple-system, sans-serif;
    }

    /* ── Hero ── */
    .hero {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #1d4ed8 100%);
      padding: 4rem 2rem 6rem;
      color: white;
      position: relative;
      overflow: hidden;
    }
    .hero::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 70% 50%, rgba(99,102,241,0.15) 0%, transparent 60%);
      pointer-events: none;
    }
    .hero-content {
      max-width: 1400px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      padding: 0.5rem 1.25rem;
      border-radius: 100px;
      font-size: 0.82rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .hero-title {
      font-size: 3.5rem;
      font-weight: 900;
      margin: 0 0 1.25rem;
      letter-spacing: -0.04em;
      line-height: 1.05;
      color: white;
    }
    .hero-accent {
      background: linear-gradient(135deg, #60a5fa, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-subtitle {
      font-size: 1.15rem;
      color: rgba(255,255,255,0.75);
      margin: 0 0 2.5rem;
      max-width: 560px;
      line-height: 1.75;
      font-weight: 400;
    }
    .hero-search {
      max-width: 560px;
      margin-bottom: 2.5rem;
    }
    .hero-stats {
      display: flex;
      gap: 2.5rem;
      flex-wrap: wrap;
    }
    .hero-stat {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.88rem;
      font-weight: 600;
      color: rgba(255,255,255,0.65);
    }
    .hero-stat i { font-size: 0.95rem; color: rgba(255,255,255,0.8); }

    /* ── Page Container ── */
    .page-container {
      max-width: 1400px;
      margin: -3rem auto 0;
      padding: 0 2rem 4rem;
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* ── KPI Grid ── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }
    .kpi-card {
      background: white;
      border-radius: 20px;
      padding: 1.75rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
      border: 1px solid #e8edf2;
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
      overflow: hidden;
    }
    .kpi-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.1);
    }
    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      border-radius: 20px 20px 0 0;
    }
    .kpi-card.blue::before  { background: linear-gradient(90deg, #1d4ed8, #60a5fa); }
    .kpi-card.green::before { background: linear-gradient(90deg, #15803d, #4ade80); }
    .kpi-card.amber::before { background: linear-gradient(90deg, #b45309, #fbbf24); }
    .kpi-card.purple::before{ background: linear-gradient(90deg, #7c3aed, #c084fc); }

    .kpi-icon-wrap {
      width: 58px; height: 58px;
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .kpi-icon-wrap.blue   { background: #eff6ff; color: #1d4ed8; }
    .kpi-icon-wrap.green  { background: #f0fdf4; color: #15803d; }
    .kpi-icon-wrap.amber  { background: #fffbeb; color: #b45309; }
    .kpi-icon-wrap.purple { background: #f5f3ff; color: #7c3aed; }

    .kpi-data { flex: 1; min-width: 0; }
    .kpi-value {
      display: block;
      font-size: 2.4rem;
      font-weight: 900;
      color: #0f172a;
      line-height: 1;
      letter-spacing: -0.04em;
    }
    .kpi-label {
      display: block;
      font-size: 1rem;
      color: #1e293b;
      margin-top: 0.35rem;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .kpi-sub {
      display: block;
      font-size: 0.82rem;
      color: #94a3b8;
      margin-top: 0.15rem;
      font-weight: 500;
    }
    .kpi-badge {
      width: 36px; height: 36px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.95rem;
      flex-shrink: 0;
    }
    .kpi-badge.blue   { background: #eff6ff; color: #1d4ed8; }
    .kpi-badge.green  { background: #f0fdf4; color: #15803d; }
    .kpi-badge.amber  { background: #fffbeb; color: #b45309; }
    .kpi-badge.purple { background: #f5f3ff; color: #7c3aed; }

    /* ── Card ── */
    .card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
      border: 1px solid #e8edf2;
      overflow: hidden;
    }
    .card-header {
      padding: 1.5rem 1.75rem;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .card-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .card-icon.blue   { background: #eff6ff; color: #1d4ed8; }
    .card-icon.purple { background: #f5f3ff; color: #7c3aed; }
    .card-icon.green  { background: #f0fdf4; color: #15803d; }
    .card-title-wrap { flex: 1; }
    .card-title-wrap h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .card-title-wrap p {
      margin: 0.2rem 0 0;
      font-size: 0.85rem;
      color: #94a3b8;
      font-weight: 500;
    }
    .card-body { padding: 1.75rem; }

    /* ── Charts Row ── */
    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    /* ── Chart Empty ── */
    .chart-empty {
      text-align: center;
      padding: 3rem 1rem;
      color: #cbd5e1;
    }
    .chart-empty i { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; }
    .chart-empty h4 { margin: 0 0 0.35rem; font-size: 1rem; color: #94a3b8; font-weight: 700; }
    .chart-empty p { margin: 0; font-size: 0.85rem; color: #cbd5e1; }

    /* ── View All Button ── */
    .view-all-btn {
      margin-left: auto;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.6rem 1.25rem;
      font-size: 0.88rem;
      font-weight: 700;
      color: #1d4ed8;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.15s;
      font-family: inherit;
      letter-spacing: -0.01em;
      white-space: nowrap;
    }
    .view-all-btn:hover { background: #eff6ff; border-color: #bfdbfe; }

    /* ── Empty State ── */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }
    .empty-icon-wrap {
      width: 80px; height: 80px;
      border-radius: 24px;
      background: #f1f5f9;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      border: 1px solid #e2e8f0;
    }
    .empty-icon-wrap i { font-size: 2.2rem; color: #94a3b8; }
    .empty-state h3 {
      font-size: 1.4rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.75rem;
      letter-spacing: -0.02em;
    }
    .empty-state p {
      color: #64748b;
      font-size: 1rem;
      max-width: 400px;
      margin: 0 auto 2rem;
      line-height: 1.7;
    }
    .empty-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn-primary {
      background: linear-gradient(135deg, #1d4ed8, #3b82f6);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 0.85rem 1.75rem;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
      font-family: inherit;
      box-shadow: 0 4px 14px rgba(29,78,216,0.35);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(29,78,216,0.4);
    }
    .btn-secondary {
      background: white;
      color: #374151;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 0.85rem 1.75rem;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
      font-family: inherit;
    }
    .btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }

    /* ── Loading ── */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4rem;
      gap: 1.25rem;
    }
    .loading-state p {
      font-size: 1rem;
      font-weight: 600;
      color: #94a3b8;
      margin: 0;
    }

    /* ── Bills Grid ── */
    .bills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }

    /* ── Responsive ── */
    @media (max-width: 1024px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .hero { padding: 2.5rem 1.25rem 5rem; }
      .hero-title { font-size: 2.25rem; }
      .hero-stats { gap: 1.25rem; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-row { grid-template-columns: 1fr; }
      .page-container { padding: 0 1rem 2rem; }
      .card-header { flex-wrap: wrap; }
      .view-all-btn { margin-left: 0; }
    }
    @media (max-width: 480px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .hero-title { font-size: 1.85rem; }
      .kpi-value { font-size: 2rem; }
    }
  `]
})
export class HomePage implements OnInit {
  summary: any;
  recentBills: any[] = [];
  loading = true;

  constructor(
    private analytics: AnalyticsService,
    private bills: BillService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.analytics.getSummary().subscribe({
      next: d => this.summary = d,
      error: () => this.summary = { total_bills: 0, enacted_bills: 0, pass_rate: 0, sentiment_distribution: {} }
    });
    this.bills.getBills(1, 6).subscribe({
      next: d => { this.recentBills = d.bills ?? []; this.loading = false; },
      error: () => this.loading = false
    });
  }

  get topSentiment(): string {
    if (!this.summary?.sentiment_distribution) return '—';
    const d = this.summary.sentiment_distribution;
    const top = Object.entries(d).sort((a: any, b: any) => b[1] - a[1])[0];
    return top ? String(top[0]) : '—';
  }

  onSearch(q: string): void { this.router.navigate(['/bills'], { queryParams: { q } }); }
  goToBill(id: string): void { this.router.navigate(['/bills', id]); }
}