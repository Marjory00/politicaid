import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BillService } from '../../services/bill.service';
import { Bill, BILL_STATUS_LABELS, SENTIMENT_COLORS } from '../../models/bill.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-bill-detail',
  template: `
    <div class="page-container" *ngIf="bill">
      <div class="back-row">
        <p-button icon="pi pi-arrow-left" label="Back" styleClass="p-button-text p-button-sm" routerLink="/bills"></p-button>
      </div>

      <div class="bill-header">
        <div class="bill-meta">
          <span class="bill-number">{{ bill.bill_number }}</span>
          <p-tag [value]="statusLabel" [severity]="statusSeverity"></p-tag>
          <p-tag *ngIf="bill.chamber" [value]="bill.chamber" severity="info"></p-tag>
        </div>
        <h1 class="bill-title">{{ bill.title }}</h1>
        <div class="bill-sponsor" *ngIf="bill.sponsor">
          Sponsored by <strong>{{ bill.sponsor }}</strong>
          <span *ngIf="bill.sponsor_party"> ({{ bill.sponsor_party }})</span>
          &nbsp;·&nbsp; {{ bill.introduced_date | date:'mediumDate' }}
        </div>
      </div>

      <div class="detail-grid">
        <p-card header="AI Summary" styleClass="wide-card">
          <p *ngIf="bill.summary">{{ bill.summary }}</p>
          <p *ngIf="!bill.summary" class="muted">No summary yet. Click Run AI Analysis.</p>
          <div class="mt-3">
            <p-button label="Run AI Analysis" icon="pi pi-bolt"
              (onClick)="runAnalysis()" [loading]="analyzing" styleClass="p-button-outlined p-button-sm">
            </p-button>
          </div>
        </p-card>

        <p-card header="Sentiment Analysis">
          <div *ngIf="bill.sentiment_label">
            <div class="sentiment-badge" [style.background]="sentimentColor">
              {{ bill.sentiment_label | titlecase }}
            </div>
            <div style="margin:0.5rem 0; font-size:0.9rem">
              Score: <strong>{{ bill.sentiment_score | number:'1.3-3' }}</strong>
              <span class="muted"> (confidence: {{ (bill.sentiment_confidence ?? 0) | percent:'1.0-1' }})</span>
            </div>
            <p-progressBar [value]="sentimentPercent" [style]="{'height':'8px'}"></p-progressBar>
          </div>
          <p *ngIf="!bill.sentiment_label" class="muted">Run AI Analysis to see sentiment.</p>
        </p-card>

        <p-card header="Vote Breakdown">
          <div class="vote-grid">
            <div class="vote-item yea">
              <span class="vote-count">{{ bill.yea_votes }}</span>
              <span class="vote-label">Yea</span>
            </div>
            <div class="vote-item nay">
              <span class="vote-count">{{ bill.nay_votes }}</span>
              <span class="vote-label">Nay</span>
            </div>
            <div class="vote-item abstain">
              <span class="vote-count">{{ bill.abstain_votes }}</span>
              <span class="vote-label">Abstain</span>
            </div>
          </div>
          <p-progressBar [value]="yeaPercent" [style]="{'height':'8px','margin-top':'1rem'}"></p-progressBar>
        </p-card>

        <p-card header="Keywords & Entities">
          <div class="keywords" *ngIf="bill.keywords?.length">
            <span class="keyword-chip" *ngFor="let kw of bill.keywords">{{ kw }}</span>
          </div>
          <p-divider *ngIf="hasEntities"></p-divider>
          <div *ngIf="hasEntities">
            <div *ngFor="let type of entityTypes" class="entity-row">
              <span class="entity-type">{{ type }}:</span>
              <span *ngFor="let v of bill.entities![type]" class="entity-value">{{ v }}</span>
            </div>
          </div>
          <p *ngIf="!bill.keywords?.length && !hasEntities" class="muted">No keyword data yet.</p>
        </p-card>
      </div>

      <p-card header="Full Bill Text" styleClass="mt-4" *ngIf="bill.full_text">
        <pre class="bill-text">{{ bill.full_text }}</pre>
      </p-card>

      <div class="source-row" *ngIf="bill.source_url">
        <a [href]="bill.source_url" target="_blank" rel="noopener">
          <i class="pi pi-external-link"></i> View Source ({{ bill.source }})
        </a>
      </div>
    </div>

    <div *ngIf="!bill && !loading" style="text-align:center;padding:4rem;color:var(--text-color-secondary)">
      Bill not found.
    </div>
    <div *ngIf="loading" style="display:flex;justify-content:center;padding:4rem">
      <p-progressSpinner strokeWidth="4"></p-progressSpinner>
    </div>
  `,
  styles: [`
    .page-container { padding:2rem; max-width:1200px; margin:0 auto; }
    .back-row { margin-bottom:1rem; }
    .bill-meta { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.75rem; flex-wrap:wrap; }
    .bill-number { font-weight:700; font-size:0.9rem; color:var(--primary-color);
                   background:var(--primary-50,#eff6ff); padding:0.2rem 0.6rem; border-radius:4px; }
    .bill-title { font-size:1.5rem; font-weight:700; margin:0 0 0.5rem; line-height:1.4; }
    .bill-sponsor { color:var(--text-color-secondary); font-size:0.9rem; margin-bottom:2rem; }
    .detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
    .wide-card { grid-column:1/-1; }
    .sentiment-badge { display:inline-block; color:white; padding:0.4rem 1rem;
                       border-radius:20px; font-weight:600; margin-bottom:0.5rem; }
    .vote-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; text-align:center; }
    .vote-item { padding:1rem; border-radius:8px; }
    .vote-item.yea     { background:#dcfce7; }
    .vote-item.nay     { background:#fee2e2; }
    .vote-item.abstain { background:#f1f5f9; }
    .vote-count { display:block; font-size:1.75rem; font-weight:700; }
    .vote-label { font-size:0.85rem; color:var(--text-color-secondary); }
    .keywords { display:flex; flex-wrap:wrap; gap:0.4rem; }
    .keyword-chip { background:var(--surface-200); padding:0.2rem 0.6rem; border-radius:12px; font-size:0.8rem; }
    .entity-row { margin-bottom:0.4rem; }
    .entity-type { font-weight:700; font-size:0.8rem; color:var(--primary-color); margin-right:0.3rem; }
    .entity-value { font-size:0.82rem; margin-right:0.3rem; }
    .bill-text { white-space:pre-wrap; word-break:break-word; font-size:0.82rem;
                 line-height:1.7; max-height:500px; overflow-y:auto; }
    .muted { color:var(--text-color-secondary); font-style:italic; }
    .source-row { margin-top:1rem; }
    .source-row a { color:var(--primary-color); text-decoration:none; }
    @media (max-width:768px) { .detail-grid { grid-template-columns:1fr; } }
  `]
})
export class BillDetailPage implements OnInit {
  bill: Bill | null = null; loading = true; analyzing = false;

  constructor(private route: ActivatedRoute, private billSvc: BillService,
              private msg: MessageService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.billSvc.getBill(id).subscribe({ next: b => { this.bill = b; this.loading = false; },
                                          error: () => this.loading = false });
  }

  get statusLabel(): string { return this.bill?.status ? (BILL_STATUS_LABELS as any)[this.bill.status] ?? this.bill.status : ''; }

  get statusSeverity(): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined {
    const m: Record<string, 'success' | 'danger' | 'info' | 'warning'> = {
      enacted: 'success', failed: 'danger', vetoed: 'danger', introduced: 'info'
    };
    return m[this.bill?.status ?? ''] ?? 'warning';
  }

  get sentimentColor(): string { return this.bill?.sentiment_label ? (SENTIMENT_COLORS as any)[this.bill.sentiment_label] ?? '#94a3b8' : '#94a3b8'; }
  get sentimentPercent(): number { return this.bill?.sentiment_score != null ? Math.round((this.bill.sentiment_score + 1) / 2 * 100) : 50; }
  get yeaPercent(): number {
    const t = (this.bill?.yea_votes ?? 0) + (this.bill?.nay_votes ?? 0) + (this.bill?.abstain_votes ?? 0);
    return t > 0 ? Math.round((this.bill!.yea_votes / t) * 100) : 0;
  }
  get hasEntities(): boolean { return !!this.bill?.entities && Object.keys(this.bill.entities).length > 0; }
  get entityTypes(): string[] { return this.bill?.entities ? Object.keys(this.bill.entities) : []; }

  runAnalysis(): void {
    if (!this.bill) return;
    this.analyzing = true;
    this.billSvc.analyzeBill(this.bill.id).subscribe({
      next: b => { this.bill = b; this.analyzing = false;
                   this.msg.add({ severity:'success', summary:'Done', detail:'AI analysis applied.' }); },
      error: () => this.analyzing = false,
    });
  }
}