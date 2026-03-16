import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-analytics',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1><i class="pi pi-chart-bar"></i> Analytics</h1>
        <p>Aggregate insights on voting trends, sentiment, and bill activity.</p>
      </div>

      <div class="analytics-grid">
        <p-card header="Sentiment Over Time" styleClass="wide-card">
          <p-chart type="line" [data]="sentimentTimeData" [options]="lineOptions" height="280px"
                   *ngIf="sentimentTimeData"></p-chart>
        </p-card>

        <p-card header="Bill Status Breakdown">
          <p-chart type="doughnut" [data]="statusData" [options]="doughnutOptions" height="280px"
                   *ngIf="statusData"></p-chart>
        </p-card>

        <p-card header="Voting Trends by Party" styleClass="wide-card">
          <app-voting-trends></app-voting-trends>
        </p-card>

        <p-card header="Top Bill Subjects">
          <div class="subject-list">
            <div *ngFor="let s of topSubjects; let i=index" class="subject-row">
              <span class="subject-rank">{{ i+1 }}</span>
              <span class="subject-name">{{ s.subject }}</span>
              <span class="subject-count">{{ s.count }}</span>
              <p-progressBar [value]="subjectPct(s.count)" [showValue]="false"
                             [style]="{'height':'6px','flex':'1'}"></p-progressBar>
            </div>
            <p *ngIf="!topSubjects.length" class="muted">No data yet.</p>
          </div>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding:2rem; max-width:1400px; margin:0 auto; }
    .page-header { margin-bottom:1.5rem; }
    .page-header h1 { font-size:1.75rem; font-weight:700; display:flex; align-items:center; gap:0.5rem; margin:0 0 0.5rem; }
    .page-header p { color:var(--text-color-secondary); margin:0; }
    .analytics-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
    .wide-card { grid-column:1/-1; }
    .subject-list { display:flex; flex-direction:column; gap:0.6rem; }
    .subject-row { display:flex; align-items:center; gap:0.75rem; }
    .subject-rank { width:24px; text-align:right; font-weight:700; color:var(--text-color-secondary); font-size:0.85rem; }
    .subject-name { min-width:140px; font-size:0.9rem; }
    .subject-count { min-width:40px; text-align:right; font-weight:600; font-size:0.85rem; color:var(--primary-color); }
    .muted { color:var(--text-color-secondary); font-style:italic; }
    @media (max-width:768px) { .analytics-grid { grid-template-columns:1fr; } }
  `]
})
export class AnalyticsPage implements OnInit {
  sentimentTimeData: any; statusData: any; topSubjects: any[] = []; maxCount = 1;

  lineOptions    = { responsive:true, maintainAspectRatio:false,
                     scales:{ y:{ min:-1, max:1 } }, plugins:{ legend:{ display:true } } };
  doughnutOptions= { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom' } } };

  constructor(private analytics: AnalyticsService) {}

  ngOnInit(): void {
    this.analytics.getSentimentOverTime().subscribe(d => {
      const items = [...d.data].reverse();
      this.sentimentTimeData = {
        labels: items.map((i: any) => i.month),
        datasets: [{ label:'Avg Sentiment', data:items.map((i:any)=>i.avg_sentiment),
                     borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,0.1)', tension:0.4, fill:true }],
      };
    });

    this.analytics.getStatusBreakdown().subscribe(d => {
      const palette = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];
      this.statusData = {
        labels: d.breakdown.map((r: any) => r.status),
        datasets: [{ data:d.breakdown.map((r:any)=>r.count), backgroundColor:palette }],
      };
    });

    this.analytics.getTopSubjects(10).subscribe(d => {
      this.topSubjects = d.subjects;
      this.maxCount    = Math.max(...d.subjects.map((s: any) => s.count), 1);
    });
  }

  subjectPct(count: number): number { return Math.round((count / this.maxCount) * 100); }
}