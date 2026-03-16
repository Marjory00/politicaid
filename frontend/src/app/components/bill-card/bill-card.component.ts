import { Component, Input } from '@angular/core';
import { Bill, BILL_STATUS_LABELS, SENTIMENT_COLORS } from '../../models/bill.model';

@Component({
  selector: 'app-bill-card',
  template: `
    <div class="bill-card" *ngIf="bill">
      <div class="card-top">
        <span class="bill-number">{{ bill.bill_number }}</span>
        <span class="sentiment-dot" *ngIf="bill.sentiment_label"
              [style.background]="sentimentColor" [title]="bill.sentiment_label"></span>
      </div>
      <h3 class="bill-title">{{ bill.title | slice:0:100 }}{{ (bill.title?.length ?? 0) > 100 ? '...' : '' }}</h3>
      <p class="bill-summary" *ngIf="bill.summary">{{ bill.summary | slice:0:120 }}...</p>
      <div class="card-footer">
        <span class="status-badge" [class]="'status-' + bill.status">{{ statusLabel }}</span>
        <span class="sponsor" *ngIf="bill.sponsor">{{ bill.sponsor }}</span>
      </div>
    </div>
  `,
  styles: [`
    .bill-card { background:var(--surface-card); border:1px solid var(--surface-border); border-radius:10px;
                 padding:1.1rem 1.25rem; cursor:pointer; transition:box-shadow 0.2s,transform 0.15s; }
    .bill-card:hover { box-shadow:0 4px 20px rgba(0,0,0,0.1); transform:translateY(-2px); }
    .card-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem; }
    .bill-number { font-size:0.78rem; font-weight:700; color:var(--primary-color);
                   background:var(--primary-50,#eff6ff); padding:0.15rem 0.5rem; border-radius:4px; }
    .sentiment-dot { width:10px; height:10px; border-radius:50%; }
    .bill-title { font-size:0.95rem; font-weight:600; margin:0 0 0.5rem; line-height:1.4; }
    .bill-summary { font-size:0.82rem; color:var(--text-color-secondary); margin:0 0 0.75rem; line-height:1.5; }
    .card-footer { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.3rem; }
    .status-badge { font-size:0.75rem; font-weight:600; padding:0.2rem 0.55rem; border-radius:12px; }
    .status-enacted             { background:#dcfce7; color:#15803d; }
    .status-introduced          { background:#dbeafe; color:#1d4ed8; }
    .status-failed,.status-vetoed { background:#fee2e2; color:#b91c1c; }
    .status-in_committee,.status-passed_house,.status-passed_senate { background:#fef9c3; color:#a16207; }
    .sponsor { font-size:0.78rem; color:var(--text-color-secondary); max-width:140px;
               white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  `]
})
export class BillCardComponent {
  @Input() bill!: Bill;
  get statusLabel(): string { return this.bill?.status ? (BILL_STATUS_LABELS as any)[this.bill.status] ?? this.bill.status : ''; }
  get sentimentColor(): string { return this.bill?.sentiment_label ? (SENTIMENT_COLORS as any)[this.bill.sentiment_label] ?? '#94a3b8' : '#94a3b8'; }
}