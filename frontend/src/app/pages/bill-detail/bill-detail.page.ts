import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BillService } from '../../services/bill.service';
import { ExportService } from '../../services/export.service';
import { AlertService } from '../../services/alert.service';
import { Bill, BILL_STATUS_LABELS, SENTIMENT_COLORS } from '../../models/bill.model';
import { MessageService } from 'primeng/api';

type TagSeverity = 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined;

@Component({
  selector: 'app-bill-detail',
  template: `
    <div class="page-container" *ngIf="bill">
      <div class="back-row">
        <p-button
          icon="pi pi-arrow-left"
          label="Back"
          styleClass="p-button-text p-button-sm"
          routerLink="/bills">
        </p-button>

        <div class="action-btns">
          <p-button
            icon="pi pi-file-pdf"
            label="Export PDF"
            styleClass="p-button-outlined p-button-sm p-button-danger"
            (onClick)="exportPDF()"
            [loading]="exportingPDF">
          </p-button>

          <p-button
            icon="pi pi-arrows-h"
            label="Compare"
            styleClass="p-button-outlined p-button-sm"
            (onClick)="goToCompare()">
          </p-button>

          <p-button
            icon="pi pi-bell"
            label="Get Alerts"
            styleClass="p-button-outlined p-button-sm p-button-warning"
            (onClick)="showAlertDialog = true">
          </p-button>
        </div>
      </div>

      <div class="bill-header">
        <div class="bill-meta">
          <span class="bill-number">{{ bill.bill_number }}</span>
          <p-tag [value]="statusLabel" [severity]="statusSeverity"></p-tag>
          <p-tag *ngIf="bill.chamber" [value]="bill.chamber" severity="info"></p-tag>
          <p-tag *ngIf="bill.congress_session" [value]="'Congress ' + bill.congress_session" severity="secondary"></p-tag>
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
          <p *ngIf="bill.summary; else noSummary">{{ bill.summary }}</p>
          <ng-template #noSummary>
            <p class="muted">No AI summary yet. Click Run AI Analysis.</p>
          </ng-template>

          <div class="mt-3">
            <p-button
              label="Run AI Analysis"
              icon="pi pi-bolt"
              (onClick)="runAnalysis()"
              [loading]="analyzing"
              styleClass="p-button-outlined p-button-sm">
            </p-button>
          </div>
        </p-card>

        <p-card header="Sentiment Analysis">
          <div *ngIf="bill.sentiment_label">
            <div class="sentiment-badge" [style.background]="sentimentColor">
              {{ bill.sentiment_label | titlecase }}
            </div>

            <div style="margin:0.5rem 0;font-size:0.9rem">
              Score: <strong>{{ bill.sentiment_score | number:'1.3-3' }}</strong>
              <span class="muted">
                (confidence: {{ (bill.sentiment_confidence ?? 0) | percent:'1.0-1' }})
              </span>
            </div>

            <p-progressBar [value]="sentimentPercent" [style]="{ 'height': '8px' }"></p-progressBar>
          </div>

          <p *ngIf="!bill.sentiment_label" class="muted">
            Run AI Analysis to see sentiment.
          </p>
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

          <p-progressBar [value]="yeaPercent" [style]="{ 'height': '8px', 'margin-top': '1rem' }"></p-progressBar>

          <div class="yea-pct muted" style="text-align:right;font-size:0.8rem;margin-top:0.3rem">
            {{ yeaPercent }}% yea
          </div>
        </p-card>

        <p-card header="Keywords and Entities">
          <div class="keywords" *ngIf="bill.keywords?.length">
            <span class="keyword-chip" *ngFor="let kw of bill.keywords">{{ kw }}</span>
          </div>

          <p-divider *ngIf="hasEntities"></p-divider>

          <div *ngIf="hasEntities">
            <div *ngFor="let type of entityTypes" class="entity-row">
              <span class="entity-type">{{ type }}:</span>
              <span *ngFor="let v of getEntityValues(type)" class="entity-value">{{ v }}</span>
            </div>
          </div>

          <p *ngIf="!bill.keywords?.length && !hasEntities" class="muted">
            No keyword data yet. Run AI Analysis.
          </p>
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

    <p-dialog
      header="Get Email Alerts for This Bill"
      [(visible)]="showAlertDialog"
      [modal]="true"
      [style]="{ 'width': '420px' }"
      [draggable]="false">
      <div class="alert-dialog-body">
        <p>
          Enter your email to receive a notification whenever the status of
          <strong>{{ bill?.bill_number }}</strong> changes.
        </p>

        <div class="field">
          <label>Email Address</label>
          <input
            pInputText
            type="email"
            [(ngModel)]="alertEmail"
            placeholder="your@email.com"
            class="w-full"
          />
        </div>
      </div>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancel"
          styleClass="p-button-text"
          (onClick)="showAlertDialog = false">
        </p-button>

        <p-button
          label="Subscribe"
          icon="pi pi-bell"
          (onClick)="subscribeAlert()"
          [loading]="subscribing">
        </p-button>
      </ng-template>
    </p-dialog>

    <div *ngIf="!bill && !loading" style="text-align:center;padding:4rem;color:var(--text-color-secondary)">
      Bill not found.
    </div>

    <div *ngIf="loading" style="display:flex;justify-content:center;padding:4rem">
      <p-progressSpinner strokeWidth="4"></p-progressSpinner>
    </div>
  `,
  styles: [`
    .page-container { padding:2rem; max-width:1200px; margin:0 auto; }
    .back-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem; }
    .action-btns { display:flex; gap:0.5rem; flex-wrap:wrap; }
    .bill-meta { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.75rem; flex-wrap:wrap; }
    .bill-number { font-weight:700; font-size:0.9rem; color:var(--primary-color); background:var(--primary-50,#eff6ff); padding:0.2rem 0.6rem; border-radius:4px; }
    .bill-title { font-size:1.5rem; font-weight:700; margin:0 0 0.5rem; line-height:1.4; }
    .bill-sponsor { color:var(--text-color-secondary); font-size:0.9rem; margin-bottom:2rem; }
    .detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
    .wide-card { grid-column:1/-1; }
    .sentiment-badge { display:inline-block; color:white; padding:0.4rem 1rem; border-radius:20px; font-weight:600; margin-bottom:0.5rem; }
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
    .bill-text { white-space:pre-wrap; word-break:break-word; font-size:0.82rem; line-height:1.7; max-height:500px; overflow-y:auto; }
    .muted { color:var(--text-color-secondary); font-style:italic; }
    .source-row { margin-top:1rem; }
    .source-row a { color:var(--primary-color); text-decoration:none; }
    .mt-3 { margin-top:1rem; }
    .mt-4 { margin-top:1.5rem; }
    .alert-dialog-body { padding:0.5rem 0; }
    .alert-dialog-body p { margin:0 0 1rem; color:var(--text-color-secondary); font-size:0.9rem; }
    .field label { display:block; font-weight:600; margin-bottom:0.4rem; font-size:0.9rem; }
    .w-full { width:100%; }
    @media (max-width:768px) { .detail-grid { grid-template-columns:1fr; } }
  `]
})
export class BillDetailPage implements OnInit {
  bill: Bill | null = null;
  loading = true;
  analyzing = false;
  exportingPDF = false;
  showAlertDialog = false;
  subscribing = false;
  alertEmail = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private billSvc: BillService,
    private exportSvc: ExportService,
    private alertSvc: AlertService,
    private msg: MessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      return;
    }

    this.billSvc.getBill(id).subscribe({
      next: (b) => {
        this.bill = b;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get statusLabel(): string {
    const bill = this.bill;
    if (!bill?.status) return '';

    const labels = BILL_STATUS_LABELS as Record<string, string>;
    return labels[bill.status] ?? bill.status;
  }

  get statusSeverity(): TagSeverity {
    const bill = this.bill;
    if (!bill?.status) return 'warning';

    const statusMap: Record<string, Exclude<TagSeverity, undefined>> = {
      enacted: 'success',
      failed: 'danger',
      vetoed: 'danger',
      introduced: 'info'
    };

    return statusMap[bill.status] ?? 'warning';
  }

  get sentimentColor(): string {
    const bill = this.bill;
    if (!bill?.sentiment_label) return '#94a3b8';

    const colors = SENTIMENT_COLORS as Record<string, string>;
    return colors[bill.sentiment_label] ?? '#94a3b8';
  }

  get sentimentPercent(): number {
    const bill = this.bill;
    if (!bill || bill.sentiment_score == null) return 50;

    return Math.round(((bill.sentiment_score + 1) / 2) * 100);
  }

  get yeaPercent(): number {
    const bill = this.bill;
    if (!bill) return 0;

    const t =
      (bill.yea_votes ?? 0) +
      (bill.nay_votes ?? 0) +
      (bill.abstain_votes ?? 0);

    return t > 0 ? Math.round(((bill.yea_votes ?? 0) / t) * 100) : 0;
  }

  get hasEntities(): boolean {
    const bill = this.bill;
    return !!bill?.entities && Object.keys(bill.entities).length > 0;
  }

  get entityTypes(): string[] {
    const bill = this.bill;
    return bill?.entities ? Object.keys(bill.entities) : [];
  }

  getEntityValues(type: string): string[] {
    const bill = this.bill;
    if (!bill?.entities) return [];

    const entities = bill.entities as Record<string, string[]>;
    return entities[type] ?? [];
  }

  runAnalysis(): void {
    const bill = this.bill;
    if (!bill) return;

    this.analyzing = true;
    this.billSvc.analyzeBill(bill.id).subscribe({
      next: (updatedBill) => {
        this.bill = updatedBill;
        this.analyzing = false;
        this.msg.add({
          severity: 'success',
          summary: 'Done',
          detail: 'AI analysis applied.'
        });
      },
      error: () => {
        this.analyzing = false;
      }
    });
  }

  exportPDF(): void {
    const bill = this.bill;
    if (!bill) return;

    this.exportingPDF = true;
    this.exportSvc.exportSingleBillPDF(bill.id).subscribe({
      next: (blob) => {
        this.exportSvc.downloadFile(blob, `politicaid_${bill.bill_number}.pdf`);
        this.exportingPDF = false;
        this.msg.add({
          severity: 'success',
          summary: 'Downloaded',
          detail: 'PDF exported successfully.'
        });
      },
      error: () => {
        this.exportingPDF = false;
      }
    });
  }

  goToCompare(): void {
    const bill = this.bill;
    if (!bill) return;

    this.router.navigate(['/compare'], {
      queryParams: { bill1: bill.id }
    });
  }

  subscribeAlert(): void {
    const bill = this.bill;
    const email = this.alertEmail;

    if (!bill || !email) return;

    this.subscribing = true;
    this.alertSvc.createAlert({
      email,
      bill_id: bill.id,
      bill_number: bill.bill_number
    }).subscribe({
      next: () => {
        this.subscribing = false;
        this.showAlertDialog = false;
        this.alertEmail = '';
        this.msg.add({
          severity: 'success',
          summary: 'Subscribed!',
          detail: `You will receive alerts at ${email}`
        });
      },
      error: () => {
        this.subscribing = false;
      }
    });
  }
}