import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BillService }    from '../../services/bill.service';
import { CompareService } from '../../services/compare.service';
import { Bill }           from '../../models/bill.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-compare',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1><i class="pi pi-arrows-h"></i> Compare Bills</h1>
        <p>Select two bills to compare them side by side.</p>
      </div>

      <!-- Bill Selectors -->
      <div class="selector-row">
        <div class="selector-card">
          <h3>Bill A</h3>
          <p-dropdown
            [options]="billOptions"
            [(ngModel)]="selectedBill1Id"
            optionLabel="label"
            optionValue="value"
            placeholder="Select first bill..."
            [filter]="true"
            filterBy="label"
            [showClear]="true"
            styleClass="w-full">
          </p-dropdown>
        </div>

        <div class="vs-badge">VS</div>

        <div class="selector-card">
          <h3>Bill B</h3>
          <p-dropdown
            [options]="billOptions"
            [(ngModel)]="selectedBill2Id"
            optionLabel="label"
            optionValue="value"
            placeholder="Select second bill..."
            [filter]="true"
            filterBy="label"
            [showClear]="true"
            styleClass="w-full">
          </p-dropdown>
        </div>
      </div>

      <div class="compare-btn-row">
        <p-button
          label="Compare Bills"
          icon="pi pi-arrows-h"
          (onClick)="compare()"
          [disabled]="!selectedBill1Id || !selectedBill2Id"
          [loading]="loading">
        </p-button>
      </div>

      <!-- Comparison Results -->
      <div *ngIf="result" class="comparison-results">

        <!-- Similarity Score -->
        <div class="similarity-banner">
          <span class="similarity-label">Keyword Overlap</span>
          <span class="similarity-score">{{ result.comparison.keyword_overlap_pct }}%</span>
          <p-progressBar
            [value]="result.comparison.keyword_overlap_pct"
            [style]="{'height':'10px','width':'300px'}">
          </p-progressBar>
        </div>

        <!-- Side by Side -->
        <div class="side-by-side">

          <!-- Bill A -->
          <div class="bill-col">
            <div class="bill-col-header a">
              <span class="bill-num">{{ result.bill_1.bill_number }}</span>
              <span class="badge">Bill A</span>
            </div>
            <div class="bill-col-body">
              <h3>{{ result.bill_1.title }}</h3>
              <div class="meta-row">
                <span class="meta-label">Status</span>
                <span class="status-chip" [class]="'status-' + result.bill_1.status">
                  {{ formatStatus(result.bill_1.status) }}
                </span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Sponsor</span>
                <span>{{ result.bill_1.sponsor || '—' }} ({{ result.bill_1.sponsor_party || '—' }})</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Chamber</span>
                <span>{{ result.bill_1.chamber || '—' }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Introduced</span>
                <span>{{ result.bill_1.introduced_date || '—' }}</span>
              </div>
              <div class="meta-row" *ngIf="result.bill_1.sentiment_label">
                <span class="meta-label">Sentiment</span>
                <span class="sentiment-chip" [class]="'sent-' + result.bill_1.sentiment_label">
                  {{ result.bill_1.sentiment_label | titlecase }}
                  ({{ result.bill_1.sentiment_score | number:'1.3-3' }})
                </span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Votes</span>
                <span class="votes">
                  <span class="yea">{{ result.bill_1.yea_votes }} Yea</span>
                  <span class="nay">{{ result.bill_1.nay_votes }} Nay</span>
                  <span class="abs">{{ result.bill_1.abstain_votes }} Abs</span>
                </span>
              </div>
              <p-divider></p-divider>
              <div class="summary-section">
                <strong>AI Summary</strong>
                <p>{{ result.bill_1.summary || 'No summary available.' }}</p>
              </div>
              <div class="keywords-section" *ngIf="result.bill_1.keywords?.length">
                <strong>Keywords</strong>
                <div class="keyword-chips">
                  <span *ngFor="let kw of result.bill_1.keywords.slice(0,8)"
                    class="kw-chip"
                    [class.shared]="result.comparison.shared_keywords.includes(kw)"
                    [title]="result.comparison.shared_keywords.includes(kw) ? 'Shared keyword' : ''">
                    {{ kw }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bill B -->
          <div class="bill-col">
            <div class="bill-col-header b">
              <span class="bill-num">{{ result.bill_2.bill_number }}</span>
              <span class="badge">Bill B</span>
            </div>
            <div class="bill-col-body">
              <h3>{{ result.bill_2.title }}</h3>
              <div class="meta-row">
                <span class="meta-label">Status</span>
                <span class="status-chip" [class]="'status-' + result.bill_2.status">
                  {{ formatStatus(result.bill_2.status) }}
                </span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Sponsor</span>
                <span>{{ result.bill_2.sponsor || '—' }} ({{ result.bill_2.sponsor_party || '—' }})</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Chamber</span>
                <span>{{ result.bill_2.chamber || '—' }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Introduced</span>
                <span>{{ result.bill_2.introduced_date || '—' }}</span>
              </div>
              <div class="meta-row" *ngIf="result.bill_2.sentiment_label">
                <span class="meta-label">Sentiment</span>
                <span class="sentiment-chip" [class]="'sent-' + result.bill_2.sentiment_label">
                  {{ result.bill_2.sentiment_label | titlecase }}
                  ({{ result.bill_2.sentiment_score | number:'1.3-3' }})
                </span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Votes</span>
                <span class="votes">
                  <span class="yea">{{ result.bill_2.yea_votes }} Yea</span>
                  <span class="nay">{{ result.bill_2.nay_votes }} Nay</span>
                  <span class="abs">{{ result.bill_2.abstain_votes }} Abs</span>
                </span>
              </div>
              <p-divider></p-divider>
              <div class="summary-section">
                <strong>AI Summary</strong>
                <p>{{ result.bill_2.summary || 'No summary available.' }}</p>
              </div>
              <div class="keywords-section" *ngIf="result.bill_2.keywords?.length">
                <strong>Keywords</strong>
                <div class="keyword-chips">
                  <span *ngFor="let kw of result.bill_2.keywords.slice(0,8)"
                    class="kw-chip"
                    [class.shared]="result.comparison.shared_keywords.includes(kw)"
                    [title]="result.comparison.shared_keywords.includes(kw) ? 'Shared keyword' : ''">
                    {{ kw }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Shared Keywords -->
        <p-card header="Shared Keywords" *ngIf="result.comparison.shared_keywords.length" styleClass="mt-4">
          <div class="keyword-chips">
            <span *ngFor="let kw of result.comparison.shared_keywords" class="kw-chip shared">
              {{ kw }}
            </span>
          </div>
        </p-card>

      </div>
    </div>
  `,
  styles: [`
    .page-container   { padding:2rem; max-width:1400px; margin:0 auto; }
    .page-header      { margin-bottom:1.5rem; }
    .page-header h1   { font-size:1.75rem; font-weight:700; display:flex; align-items:center; gap:0.5rem; margin:0 0 0.5rem; }
    .page-header p    { color:var(--text-color-secondary); margin:0; }
    .selector-row     { display:grid; grid-template-columns:1fr auto 1fr; gap:1.5rem; align-items:center; margin-bottom:1.5rem; }
    .selector-card    { background:var(--surface-card); border:1px solid var(--surface-border); border-radius:12px; padding:1.25rem; }
    .selector-card h3 { margin:0 0 0.75rem; font-size:1rem; color:var(--text-color-secondary); }
    .vs-badge         { width:48px; height:48px; background:var(--primary-color); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.9rem; flex-shrink:0; margin:0 auto; }
    .compare-btn-row  { display:flex; justify-content:center; margin-bottom:2rem; }
    .similarity-banner{ display:flex; align-items:center; gap:1.5rem; background:var(--surface-card); border:1px solid var(--surface-border); border-radius:12px; padding:1.25rem 1.5rem; margin-bottom:1.5rem; }
    .similarity-label { font-weight:600; color:var(--text-color-secondary); }
    .similarity-score { font-size:1.75rem; font-weight:800; color:var(--primary-color); }
    .side-by-side     { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
    .bill-col         { background:var(--surface-card); border:1px solid var(--surface-border); border-radius:12px; overflow:hidden; }
    .bill-col-header  { padding:0.75rem 1.25rem; display:flex; align-items:center; justify-content:space-between; }
    .bill-col-header.a{ background:#dbeafe; }
    .bill-col-header.b{ background:#dcfce7; }
    .bill-num         { font-weight:700; font-size:0.9rem; color:#1d4ed8; }
    .bill-col-header.b .bill-num { color:#15803d; }
    .badge            { font-size:0.75rem; font-weight:700; background:white; padding:0.15rem 0.6rem; border-radius:12px; }
    .bill-col-body    { padding:1.25rem; }
    .bill-col-body h3 { font-size:1rem; font-weight:600; margin:0 0 1rem; line-height:1.4; }
    .meta-row         { display:flex; align-items:center; gap:0.75rem; margin-bottom:0.5rem; font-size:0.88rem; }
    .meta-label       { font-weight:600; color:var(--text-color-secondary); min-width:80px; }
    .status-chip      { padding:0.2rem 0.6rem; border-radius:12px; font-size:0.78rem; font-weight:600; }
    .status-enacted   { background:#dcfce7; color:#15803d; }
    .status-introduced{ background:#dbeafe; color:#1d4ed8; }
    .status-failed, .status-vetoed { background:#fee2e2; color:#b91c1c; }
    .status-in_committee,.status-passed_house,.status-passed_senate { background:#fef9c3; color:#a16207; }
    .sentiment-chip   { padding:0.2rem 0.6rem; border-radius:12px; font-size:0.78rem; font-weight:600; }
    .sent-positive    { background:#dcfce7; color:#15803d; }
    .sent-negative    { background:#fee2e2; color:#b91c1c; }
    .sent-neutral     { background:#f1f5f9; color:#475569; }
    .sent-mixed       { background:#fef9c3; color:#a16207; }
    .votes            { display:flex; gap:0.5rem; }
    .yea              { color:#15803d; font-weight:600; }
    .nay              { color:#b91c1c; font-weight:600; }
    .abs              { color:#64748b; }
    .summary-section  { margin-bottom:1rem; }
    .summary-section p{ font-size:0.85rem; color:var(--text-color-secondary); line-height:1.6; margin:0.4rem 0 0; }
    .keywords-section { margin-top:0.5rem; }
    .keyword-chips    { display:flex; flex-wrap:wrap; gap:0.35rem; margin-top:0.4rem; }
    .kw-chip          { background:var(--surface-200); padding:0.15rem 0.55rem; border-radius:10px; font-size:0.78rem; }
    .kw-chip.shared   { background:#dbeafe; color:#1d4ed8; font-weight:600; }
    .mt-4             { margin-top:1.5rem; }
    @media (max-width:768px) { .side-by-side { grid-template-columns:1fr; } .selector-row { grid-template-columns:1fr; } }
  `]
})
export class ComparePage implements OnInit {
  billOptions:     any[] = [];
  selectedBill1Id = '';
  selectedBill2Id = '';
  result:          any   = null;
  loading          = false;

  constructor(
    private billSvc:    BillService,
    private compareSvc: CompareService,
    private msg:        MessageService,
    private route:      ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.billSvc.getBills(1, 100).subscribe(data => {
      this.billOptions = data.bills.map((b: any) => ({
        label: `${b.bill_number} — ${b.title.slice(0, 50)}`,
        value: b.id,
      }));
    });

    // Support pre-selecting from query params
    this.route.queryParams.subscribe(p => {
      if (p['bill1']) this.selectedBill1Id = p['bill1'];
      if (p['bill2']) this.selectedBill2Id = p['bill2'];
      if (p['bill1'] && p['bill2']) this.compare();
    });
  }

  compare(): void {
    if (!this.selectedBill1Id || !this.selectedBill2Id) return;
    if (this.selectedBill1Id === this.selectedBill2Id) {
      this.msg.add({ severity:'warn', summary:'Same Bill', detail:'Please select two different bills.' });
      return;
    }
    this.loading = true;
    this.compareSvc.compareBills(this.selectedBill1Id, this.selectedBill2Id).subscribe({
      next:  data => { this.result = data; this.loading = false; },
      error: ()   => this.loading = false,
    });
  }

  formatStatus(status: string): string {
    return (status || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}